const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/auth");

const leaderboardController = require("../controllers/leaderboard");

router.get(
  "/showleaderboard",
  userAuth.authenticate,
  leaderboardController.showLeaderBoard
);

module.exports = router;
