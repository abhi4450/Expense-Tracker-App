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

exports.loginValidUser = (req, res, next) => {
  const loginUserData = req.body;
  User.findOne({
    where: {
      email: loginUserData.email,
    },
  }).then((data) => {
    console.log(data);
  });
};
