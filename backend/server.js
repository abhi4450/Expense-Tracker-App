const express = require("express");

const app = express();

const path = require("path");

const bodyParser = require("body-parser");

const cors = require("cors");

const purchaseRoutes = require("./routes/purchase");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const User = require("./models/User");
const Expense = require("./models/Expense");
const Order = require("./models/Order");
const sequelize = require("./util/database");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

User.hasMany(Expense);
Expense.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

app.use("/purchase", purchaseRoutes);
app.use("/api", adminRoutes);
app.use("/api", userRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, (req, res) => {
      console.log("server running on Port=3000");
    });
  })
  .catch((err) => console.log(err));
