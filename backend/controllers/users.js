const path = require("path");

const rootDir = require("../util/path");

exports.getUsers = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "index.html"));
};
