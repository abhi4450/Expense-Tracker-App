const User = require("../models/User");

exports.signupUser = (req, res, next) => {
  const userDetails = req.body;

  User.create(userDetails)
    .then((data) => {
      res
        .status(201)
        .json({ message: "User created successfully", user: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ message: "Email already exists", error: err.message });
    });
};

exports.loginValidUser = async (req, res, next) => {
  try {
    const loginUserData = req.body;
    const user = await User.findOne({
      where: {
        email: loginUserData.email
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    if (
      user.email === loginUserData.email &&
      user.password !== loginUserData.password
    ) {
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
