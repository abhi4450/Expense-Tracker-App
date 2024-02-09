const express = require("express");
const userAuth = require("../middleware/auth");

const router = express.Router();

const userController = require("../controllers/users");

router.get("/users", userController.getsignupForm);
router.get('/user/loginPage', userController.getLoginPage)
router.get('/user/index',userController.getIndexPage)
router.get(
  "/expense/getExpenses",
  userAuth.authenticate,
  userController.getAllExpenses
);
router.get(
  "/user/download",
  userAuth.authenticate,
  userController.downloadFileHandler
);
router.get("/user/data", userAuth.authenticate, userController.getUsername);
router.get(
  "/user/downloadedFiles",
  userAuth.authenticate,
  userController.getDownloadedFiles
);

module.exports = router;
