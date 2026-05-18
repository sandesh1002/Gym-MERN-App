const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  logWorkout,
  logWeight,
  getProgress,
  deleteEntry,
  getStats,
} = require("../controllers/progressController");

router.post("/workout", protect, logWorkout);
router.post("/weight", protect, logWeight);
router.get("/", protect, getProgress);
router.get("/stats", protect, getStats);
router.delete("/:id", protect, deleteEntry);

module.exports = router;

