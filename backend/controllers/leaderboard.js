const User = require("../models/User");
const Expense = require("../models/Expense");

exports.showLeaderBoard = async (req, res, next) => {
  try {
    const users = await User.findAll();

    const leaderboard = [];

    for (const user of users) {
      // Fetch expenses for each user
      const expenses = await Expense.findAll({
        where: {
          userId: user.id,
        },
      });

      // Calculate total cost for the user
      const totalCost = expenses.reduce(
        (sum, expense) => sum + expense.expense_amount,
        0
      );

      leaderboard.push({
        id: user.id,
        name: user.name,
        total_cost: totalCost.toFixed(2),
      });
    }
    leaderboard.sort((a, b) => b.total_cost - a.total_cost);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
