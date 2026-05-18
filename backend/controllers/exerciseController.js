const Exercise = require("../models/Exercise");

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
const getExercises = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== "All") {
      query.category = category;
    }
    const exercises = await Exercise.find(query);
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Public
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json({ message: 'Exercise removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExercises, getExerciseById, createExercise, updateExercise, deleteExercise };


