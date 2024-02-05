const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/auth");
const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);

router.post("/user/login", adminController.loginValidUser);

router.post("/password/forgotpassword", adminController.handleForgotPassword);
router.get(
  "/password/resetpassword/:requestId",
  adminController.handleresetPassword
);
router.post(
  "/password/updatepassword/:requestId",
  adminController.updatePassword
);
router.post(
  "/expense/addexpense",
  userAuth.authenticate,
  adminController.postExpenseForm
);
router.post(
  "/expense/generateReport/:reportType",
  adminController.generateReport
);
router.delete(
  "/expense/deleteExpense/:expenseId",
  userAuth.authenticate,
  adminController.deleteExpenseItem
);

module.exports = router;
