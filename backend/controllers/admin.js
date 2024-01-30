const User = require("../models/User");
const bcrypt = require("bcrypt");

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

    return res.status(200).json({ message: "User Logged In Successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const User = require("../models/User");
// const bcrypt = require("bcrypt");

// exports.signupUser = (req, res, next) => {
//   const { name, email, password } = req.body;

//   User.create(userDetails)
//     .then((data) => {
//       res
//         .status(201)
//         .json({ message: "User created successfully", user: data });
//     })
//     .catch((err) => {
//       res
//         .status(400)
//         .json({ message: "Email already exists", error: err.message });
//     });
// };

// exports.loginValidUser = async (req, res, next) => {
//   try {
//     const loginUserData = req.body;
//     const user = await User.findOne({
//       where: {
//         email: loginUserData.email,
//       },
//     });
//     if (!user) {
//       return res.status(404).json({ message: "User Not Found!" });
//     }

//     if (
//       user.email === loginUserData.email &&
//       user.password !== loginUserData.password
//     ) {
//       return res.status(401).json({
//         message: "Email is valid but incorrect password",
//       });
//     }

//     return res.status(200).json({ message: "User Logged In Successfully." });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
