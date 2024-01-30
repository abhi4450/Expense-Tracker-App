const express = require("express");

const router = express.Router();

const userController = require("../controllers/users");

router.get("/users", userController.getsignupForm);
router.get("/expense/getExpenses", userController.getAllExpenses);

module.exports = router;
