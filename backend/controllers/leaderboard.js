const User = require("../models/User");
const Expense = require("../models/Expense");
const sequelize = require("../util/database");
exports.showLeaderBoard = async (req, res, next) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ["id", "name", "total_expense"],
      order: [[sequelize.literal("total_expense"), "DESC"]],
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
