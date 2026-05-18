const Razorpay = require("razorpay");
const crypto = require("crypto");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

// @desc    Create Razorpay order for subscription
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Please provide a plan ID" });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Create Razorpay order
    const options = {
      amount: plan.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        planName: plan.name,
        planId: plan._id.toString(),
        userId: req.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
      },
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: error.message || "Payment processing failed" });
  }
};

// @desc    Verify payment and activate subscription
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "your_key_secret")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Update user subscription
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    user.subscription = {
      planId: plan._id,
      planName: plan.name,
      startDate,
      endDate,
      status: "active",
      paymentId: razorpay_payment_id,
    };

    await user.save();

    res.json({
      message: "Payment verified and subscription activated!",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

// @desc    Get Razorpay key
// @route   GET /api/payments/key
// @access  Public
const getRazorpayKey = async (req, res) => {
  try {
    res.json({
      keyId: process.env.RAZORPAY_KEY_ID || "your_key_id",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getRazorpayKey,
};
