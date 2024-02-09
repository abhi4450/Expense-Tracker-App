const Sequelize = require("sequelize");

// Retrieve database configuration from environment variables
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const host = process.env.DB_HOST;

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(database, username, password, {
  dialect: "mysql",
  host: host,
});

module.exports = sequelize;
