const User = require("../models/User");

const ForgotPasswordRequest = require("../models/ForgotPasswordRequest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");
const { Op } = require("sequelize");
const { sendResetEmail } = require("../services/emailservice");
const uuid = require("uuid");

const generateUUID = () => {
  // Generate a v4 (random) UUID
  return uuid.v4();
};

function generateAccessToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign({ userId }, jwtSecret);
}

exports.signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Hashing the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = { name, email, password: hashedPassword };

    const newUser = await User.create(userDetails);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    // Check if the error is due to duplicate email
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginValidUser = async (req, res, next) => {
  try {
    const loginUserData = req.body;
    const user = await User.findOne({
      where: {
        email: loginUserData.email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    // Comparing the hashed password
    const passwordMatch = await bcrypt.compare(
      loginUserData.password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email is valid but incorrect password",
      });
    }
    const token = generateAccessToken(user.id);
    const ispremium = user.ispremiumuser;
    return res.status(200).json({
      message: "User Logged In Successfully.",
      token: token,
      ispremium: ispremium,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.postExpenseForm = async (req, res, next) => {
  const expenseData = req.body;
  const t = await sequelize.transaction();

  try {
    const expense = await req.user.createExpense(expenseData, {
      transaction: t,
    });

    await req.user.increment("total_expense", {
      by: expense.expense_amount,
      transaction: t,
    });

    // If everything is successful, commit the transaction
    await t.commit();

    res
      .status(201)
      .json({ message: "Expenses saved successfully", expense: expense });
  } catch (error) {
    console.log(error);

    // If there's an error, rollback the transaction
    await t.rollback();

    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.postExpenseForm = async (req, res, next) => {
//   const expenseData = req.body;

//   try {
//     const expense = await req.user.createExpense(expenseData);

//     await req.user.increment("total_expense", { by: expense.expense_amount });
//     res
//       .status(201)
//       .json({ message: "Expenses saved succesfully", expense: expense });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.deleteExpenseItem = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const t = await sequelize.transaction(); // Assuming sequelize is your ORM instance

  try {
    const expenseItem = await req.user.getExpenses({
      where: { id: expenseId },
      transaction: t,
    });

    const expenseAmount = expenseItem[0].expense_amount;

    // Destroy the expense item
    await expenseItem[0].destroy({ transaction: t });

    // Update total_expense in the user table
    await req.user.decrement("total_expense", {
      by: expenseAmount,
      transaction: t,
    });

    // If everything is successful, commit the transaction
    await t.commit();

    res.status(204).json({ message: "Item deleted successfully" });
  } catch (error) {
    // If there's an error, rollback the transaction
    await t.rollback();

    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.handleForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Check if there is already an active request for the user
    const existingRequest = await ForgotPasswordRequest.findOne({
      where: {
        userId: {
          [Op.not]: null,
        },
        isactive: true,
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "There is already an active password reset request for this user.",
      });
    }

    // Generate a unique requestId (UUID)
    const requestId = generateUUID();

    // Build the reset link with the requestId
    const resetLink = `http://localhost:3000/api/password/resetpassword/${requestId}`;

    // Save the reset request to the ForgotPasswordRequests table

    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      await ForgotPasswordRequest.create({
        userId: user.id,
        id: requestId,
        isactive: true,
      });
    }

    // Send the email with the reset link
    const sender = {
      email: "abhishek.career1993@gmail.com",
      name: "Sharpener-Abhi",
    };

    const receivers = [{ email: email }];

    const subject = "Password Reset";
    const textContent = `Click the link below to reset your password:`;
    const htmlContent = `<h1>Password Reset</h1><p>Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`;

    await sendResetEmail(sender, receivers, subject, textContent, htmlContent);

    res.status(200).json({
      message:
        "Password reset email sent successfully, check your email please",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.handleresetPassword = async (req, res, next) => {
  try {
    const requestId = req.params.requestId;

    // Check if the request exists and is active
    const resetRequest = await ForgotPasswordRequest.findOne({
      where: {
        id: requestId,
        isactive: true,
      },
    });

    if (!resetRequest) {
      return res.status(404).json({ message: "Invalid or expired reset link" });
    }

    res.send(`
    <form action="http://localhost:3000/api/password/updatepassword/${requestId}" method="POST">
      <label for="password">Enter a new password:</label>
      <input type="password" name="password" required>
      <button type="submit">update password</button>
    </form>
  `);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const newPassword = req.body.password;

    // Check if the request exists and is active
    const resetRequest = await ForgotPasswordRequest.findOne({
      where: {
        id: requestId,
        isactive: true,
      },
    });

    if (!resetRequest) {
      return res.status(404).json({ message: "Invalid or expired reset link" });
    }

    // Update the user's password
    const user = await User.findByPk(resetRequest.userId);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Deactivate the reset request
    resetRequest.isactive = false;
    await resetRequest.save();

    return res.status(200).send("<h1>password updated successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// exports.handleForgotPassword = async (req, res, next) => {
//   const { email } = req.body;

//   const sender = {
//     email: "abhishek.anshu1991@gmail.com",
//     name: "Sharpener-Abhi",
//   };

//   const receivers = [
//     {
//       email: email,
//     },
//   ];

//   const subject = "This email is regarding Password Reset";
//   const textContent = `Kindly click the link below to reset your password:`;
//   const htmlContent = `<h1>Password Reset</h1><p>Click the link below to reset your password:</p><p><a href="https://www.google.com/">Reset Password</a></p>`;

//   try {
//     await sendResetEmail(sender, receivers, subject, textContent, htmlContent);

//     res.status(200).json({
//       message: "Password reset email sent successfully,check your email please",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.handleForgotPassword = (req, res, next) => {

//   const { email } = req.body;
//   res.status(200).json({ message: "Password reset email sent successfully." });
// }

// exports.deleteExpenseItem = async (req, res, next) => {
//   const expenseId = req.params.expenseId;

//   try {
//     const expenseItem = await req.user.getExpenses({
//       where: { id: expenseId },
//     });
//     console.log("expense Item to be deleted>>>>>>>>>", expenseItem);
//     await expenseItem[0].destroy();
//     res.status(204).json({ message: "Item deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
