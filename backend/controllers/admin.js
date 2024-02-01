const User = require("../models/User");
const Expense = require("../models/Expense");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

  try {
    const expense = await req.user.createExpense(expenseData);
    res
      .status(201)
      .json({ message: "Expenses saved succesfully", expense: expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteExpenseItem = async (req, res, next) => {
  const expenseId = req.params.expenseId;

  try {
    const expenseItem = await req.user.getExpenses({
      where: { id: expenseId },
    });
    console.log("expense Item to be deleted>>>>>>>>>", expenseItem);
    await expenseItem[0].destroy();
    res.status(204).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
