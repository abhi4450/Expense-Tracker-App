const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/auth");

const purchaseController = require("../controllers/purchase");

router.get(
  "/premiummembership",
  userAuth.authenticate,
  purchaseController.purchasepremium
);

module.exports = router;
