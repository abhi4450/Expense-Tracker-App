const path = require("path");

const Expense = require("../models/Expense");

const rootDir = require("../util/path");

const s3Service = require("../services/s3service");
const jsonexport = require("jsonexport");

exports.downloadFileHandler = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses({
      attributes: ["expense_amount", "description", "category", "createdAt"],
    });

    // Convert expenses to array of objects
    const formattedExpenses = expenses.map((expense) => ({
      expense_amount: expense.expense_amount,
      description: expense.description,
      category: expense.category,
      Date: new Date(expense.createdAt).toLocaleDateString(),
    }));

    // const expenses = await req.user.getExpenses();

    const csvExpenses = await jsonexport(formattedExpenses);
    console.log("****************", csvExpenses);

    // Specify filename and path within S3 bucket
    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.csv`;
    // const stringifiedExpenses = JSON.stringify(expenses);
    // const userId = req.user.id;
    // const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await s3Service.uploadToS3(csvExpenses, filename);
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
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

exports.getLoginPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "login.html"));
};
// exports.getIndexPage = (req, res, next) => {
//   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//   res.sendFile(path.join(rootDir, "../frontend", "public", "index.html"));
// };

exports.getIndexPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "index.html"));
};
// Handler to get all expenses with pagination
exports.getAllExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 4; // Number of items per page
    const offset = (page - 1) * limit;

    const expenses = await req.user.getExpenses({ limit, offset });

    // Query total count of expenses
    const totalCount = await req.user.countExpenses();

    const totalItems = totalCount;
    const totalPages = Math.ceil(totalItems / limit);

    res
      .status(200)
      .json({ expenses, totalItems, currentPage: page, totalPages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsername = async (req, res) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    // Assuming user model has a 'name' field
    const { name } = user;
    res.status(200).json({ username: name });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
