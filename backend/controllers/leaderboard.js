const User = require("../models/User");
const Expense = require("../models/Expense");
const sequelize = require('../util/database')
exports.showLeaderBoard = async (req, res, next) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        [
          sequelize.fn(
            "SUM",
            sequelize.col("expenses.expense_amount")
          ),
          "total_cost",
        ],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
          where: {
            userId: sequelize.col("user.id"),
          },
        },
      ],
      group: ["user.id"],
      order: [[sequelize.literal("total_cost"), "DESC"]],
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// exports.showLeaderBoard = async (req, res, next) => {
//   try {
//     const users = await User.findAll({
//       attributes: ["id", "name"],
//     });

//     const leaderboard = [];

//     for (const user of users) {
//       // Fetch expenses for each user
//       const expenses = await Expense.findAll({
//         attributes: ["expense_amount"],
//         where: {
//           userId: user.id,
//         },
//       });

//       // Calculate total cost for the user
//       const totalCost = expenses.reduce(
//         (sum, expense) => sum + expense.expense_amount,
//         0
//       );

//       leaderboard.push({
//         id: user.id,
//         name: user.name,
//         total_cost: totalCost.toFixed(2),
//       });
//     }
//     leaderboard.sort((a, b) => b.total_cost - a.total_cost);

//     res.json(leaderboard);
//   } catch (error) {
//     console.error("Error fetching leaderboard:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
