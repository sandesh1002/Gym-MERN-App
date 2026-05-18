const express = require("express");
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  subscribe,
  cancelSubscription,
  getMySubscription,
  getSubscriptionStats,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/plans", getAllPlans);
router.get("/plans/:id", getPlanById);

// Protected routes
router.get("/my", protect, getMySubscription);
router.post("/subscribe", protect, subscribe);
router.post("/cancel", protect, cancelSubscription);

// Admin routes (simplified - in production, add admin middleware)
router.post("/plans", protect, createPlan);
router.put("/plans/:id", protect, updatePlan);
router.delete("/plans/:id", protect, deletePlan);
router.get("/stats", protect, getSubscriptionStats);

module.exports = router;
