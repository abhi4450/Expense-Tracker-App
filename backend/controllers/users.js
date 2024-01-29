const path = require("path");

const rootDir = require("../util/path");

exports.getsignupForm = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "index.html"));
};
