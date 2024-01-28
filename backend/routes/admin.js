const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

router.post("/users/signup", adminController.postUsers);

module.exports = router;
