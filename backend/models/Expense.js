const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Expense = sequelize.define("expense", {
  expense_amount: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  category: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  expense_date: {
    type: Sequelize.DATEONLY, // Use DATEONLY type for storing only the date without time
    allowNull: false,
  },
});

module.exports = Expense;
