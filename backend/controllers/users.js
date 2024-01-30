const path = require("path");

const Expense = require("../models/Expense");

const rootDir = require("../util/path");

exports.getsignupForm = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "singup.html"));
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll();

    return res.status(200).json({ expenses: expenses });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error });
  }
};
