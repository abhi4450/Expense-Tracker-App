const path = require("path");

const Expense = require("../models/Expense");

const rootDir = require("../util/path");

exports.getsignupForm = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "singup.html"));
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll();
    console.log(expenses);
  } catch (error) {}
};
