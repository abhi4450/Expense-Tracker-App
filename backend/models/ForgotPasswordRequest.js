const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const { v4: uuidv4 } = require("uuid");

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => uuidv4(),
  },
  isactive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = ForgotPasswordRequest;
