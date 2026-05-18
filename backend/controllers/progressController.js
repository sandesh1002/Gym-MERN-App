const Progress = require("../models/Progress");

// @desc    Log a workout
// @route   POST /api/progress/workout
// @access  Private
const logWorkout = async (req, res) => {
  try {
    const { workoutName, exercises, duration, notes, date } = req.body;

    const progress = await Progress.create({
      user: req.user.id,
      type: "workout",
      workoutName,
      exercises: exercises || [],
      duration: duration || 0,
      notes: notes || "",
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to log workout" });
  }
};

// @desc    Log weight
// @route   POST /api/progress/weight
// @access  Private
const logWeight = async (req, res) => {
  try {
    const { weightValue, notes, date } = req.body;

    if (!weightValue || weightValue <= 0) {
      return res.status(400).json({ message: "Please provide a valid weight" });
    }

    const progress = await Progress.create({
      user: req.user.id,
      type: "weight",
      weightValue,
      notes: notes || "",
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to log weight" });
  }
};

// @desc    Get all progress entries for logged-in user
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch progress" });
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:id
// @access  Private
const deleteEntry = async (req, res) => {
  try {
    const entry = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await entry.deleteOne();
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete entry" });
  }
};

// @desc    Get progress stats
// @route   GET /api/progress/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const workouts = await Progress.find({
      user: req.user.id,
      type: "workout",
    }).sort({ date: 1 });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDates = [
      ...new Set(
        workouts.map((w) => {
          const d = new Date(w.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      ),
    ].sort((a, b) => b - a);

    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (uniqueDates[i] === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    // Get latest weight
    const latestWeightEntry = await Progress.findOne({
      user: req.user.id,
      type: "weight",
    }).sort({ date: -1 });

    res.json({
      totalWorkouts,
      totalDuration,
      streak,
      latestWeight: latestWeightEntry ? latestWeightEntry.weightValue : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch stats" });
  }
};

module.exports = { logWorkout, logWeight, getProgress, deleteEntry, getStats };

