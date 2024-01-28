
const Sequelize = require("sequelize");
const sequelize = new Sequelize("expense_data", "root", "a1b9h9i1s", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;


