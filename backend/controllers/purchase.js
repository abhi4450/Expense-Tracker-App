const Razorpay = require("razorpay");
const Order = require("../models/Order");
const User = require("../models/User"); 

exports.purchasepremium = async (req, res) => {
  try {
    let rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 2500;
    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }

      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};
exports.updatetransactionstatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ where: { orderid: order_id } });

    if (payment_id) {
      // Payment successful

      const [updatedOrder, updatedUser] = await Promise.all([
        order.update({ paymentid: payment_id, status: "SUCCESSFUL" }),
        req.user.update({ ispremiumuser: true }),
      ]);

      return res.status(202).json({
        success: true,
        message: "Transaction Successful",
        ispremiumuser: updatedUser.ispremiumuser,
      });
    } else {
      // Payment failed
      console.log("payment id from else block..............", payment_id);
      await order.update({ status: "FAILED" });
      const updatedUser = await req.user.update({ ispremiumuser: false });

      console.log("Order status updated to FAILED");

      return res.status(400).json({
        success: false,
        message: "Transaction Failed",
        ispremiumuser: updatedUser.ispremiumuser,
      });
    }
  } catch (err) {
    console.error("Error updating transaction status:", err);
    res.status(403).json({ error: err, message: "Something went wrong" });
  }
};
