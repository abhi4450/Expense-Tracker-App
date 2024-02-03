const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("user", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(255),
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  ispremiumuser: Sequelize.BOOLEAN,
  total_expense: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
});

module.exports = User;
