const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subscription plan
// @route   GET /api/subscriptions/plans/:id
// @access  Public
const getPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subscription plan (Admin only)
// @route   POST /api/subscriptions/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { name, description, duration, price, originalPrice, features, isPopular, category } = req.body;

    if (!name || !description || !duration || !price) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const plan = await SubscriptionPlan.create({
      name,
      description,
      duration,
      price,
      originalPrice,
      features,
      isPopular,
      category,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subscription plan
// @route   PUT /api/subscriptions/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subscription plan
// @route   DELETE /api/subscriptions/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
const subscribe = async (req, res) => {
  try {
    const { planId, paymentId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Please provide a plan ID" });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Update user with subscription
    user.subscription = {
      planId: plan._id,
      planName: plan.name,
      startDate,
      endDate,
      status: "active",
      paymentId: paymentId || `PAY-${Date.now()}`,
    };

    await user.save();

    res.json({
      message: "Subscription activated successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscription || user.subscription.status !== "active") {
      return res.status(400).json({ message: "No active subscription found" });
    }

    user.subscription.status = "cancelled";
    await user.save();

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my subscription
// @route   GET /api/subscriptions/my
// @access  Private
const getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return subscription data directly
    if (user.subscription && user.subscription.status === "active") {
      return res.json(user.subscription);
    }
    
    res.json(null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subscription stats (Admin)
// @route   GET /api/subscriptions/stats
// @access  Private/Admin
const getSubscriptionStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ "subscription.status": "active" });
    const plans = await SubscriptionPlan.find({ isActive: true });
    
    const planStats = await Promise.all(
      plans.map(async (plan) => {
        const count = await User.countDocuments({ 
          "subscription.planId": plan._id,
          "subscription.status": "active"
        });
        return {
          planName: plan.name,
          subscribers: count,
          revenue: count * plan.price,
        };
      })
    );

    res.json({
      totalActiveSubscribers: totalUsers,
      planStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  subscribe,
  cancelSubscription,
  getMySubscription,
  getSubscriptionStats,
};
