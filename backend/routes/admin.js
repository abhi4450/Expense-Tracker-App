const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);

router.post("/user/login", adminController.loginValidUser);

module.exports = router;
