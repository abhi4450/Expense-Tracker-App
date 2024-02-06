const path = require("path");

const Expense = require("../models/Expense");

const rootDir = require("../util/path");

const s3Service = require("../services/s3service");

exports.downloadFileHandler = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();
    console.log(expenses);
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await s3Service.uploadToS3(stringifiedExpenses, filename);
    console.log("This>>>>>>>>>>>>>>>", fileURL);
    await req.user.createDownloadedFile({
      fileUrl: fileURL,
    });

    res.status(200).json({ fileURL, filename });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDownloadedFiles = async (req, res, next) => {
  try {
    const Allfiles = await req.user.getDownloadedFiles();

    if (Allfiles.length === 0) {
      return res.status(404).json({ message: "No downloaded files found" });
    }
    console.log("All the fetched files:::::::::::::::::", Allfiles);
    res.status(200).json({ Allfiles });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getsignupForm = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "singup.html"));
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();

    return res.status(200).json({ expenses: expenses });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error });
  }
};
