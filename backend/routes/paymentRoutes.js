const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPaymentOrder,
  verifyPayment,
  getRazorpayKey,
} = require("../controllers/paymentController");

// Public route - get Razorpay key
router.get("/key", getRazorpayKey);

// Protected routes
router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;
