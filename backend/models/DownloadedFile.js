const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const DownloadedFile = sequelize.define("downloadedFile", {
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = DownloadedFile;
