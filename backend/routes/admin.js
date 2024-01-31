const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/auth");
const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);

router.post("/user/login", adminController.loginValidUser);
router.post(
  "/expense/addexpense",
  userAuth.authenticate,
  adminController.postExpenseForm
);
router.delete(
  "/expense/deleteExpense/:expenseId",
  userAuth.authenticate,
  adminController.deleteExpenseItem
);

module.exports = router;
