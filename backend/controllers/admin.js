const User = require("../models/User");

exports.postUsers = (req, res, next) => {
  const userDetails = req.body;

  User.create(userDetails)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
        res.status(400).json({ message: "Email already exists", error: err.message });
    } )
};
