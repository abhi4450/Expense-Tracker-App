const express = require("express");

const app = express();

const path = require("path");

const bodyParser = require("body-parser");

const cors = require("cors");

const leaderboardRoutes = require("./routes/leaderboard");
const purchaseRoutes = require("./routes/purchase");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const User = require("./models/User");
const Expense = require("./models/Expense");
const Order = require("./models/Order");
const sequelize = require("./util/database");
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: "abhishek.anshu1991@gmail.com",
  name: "Sharpener-Abhi",
};
const receivers = [
  {
    email: "abhishek.career1993@gmail.com",
  },
];

tranEmailApi.sendTransacEmail({
  sender,
  to: receivers,
  subject: "Reset Password",
  textContent: `Sharpener-Abhi`,
  htmlContent: `<h1>Click this link below to reset your passwrod</h1><a href="#"></a>`,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

User.hasMany(Expense);
Expense.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

app.use("/premium", leaderboardRoutes);
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
