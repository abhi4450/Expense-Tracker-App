const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);

router.post("/user/login", adminController.loginValidUser);
router.post("/expense/addexpense", adminController.postExpenseForm);
router.delete(
  "/expense/deleteExpense/:expenseId",
  adminController.deleteExpenseItem
);

module.exports = router;
