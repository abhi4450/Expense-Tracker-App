const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const token = req.header("Authorization");
    console.log("recieved token :", token);
    const user = jwt.verify(token, jwtSecret);
    console.log("userId >>>>>>>>>>>>>>>>>", user.userId);
    User.findByPk(user.userId).then((user) => {
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "User not found", error: error });
  }
};

module.exports = {
  authenticate,
};
