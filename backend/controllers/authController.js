const jwt = require("jsonwebtoken");
const User = require("../models/User");


const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }


    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,

      token: generateToken(user._id, user.role),
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register trainer with trainer ID
// @route   POST /api/auth/trainer-signup
// @access  Public
const trainerSignup = async (req, res) => {
  try {
    const { trainerId, trainerName, password } = req.body;
    const configuredTrainerId = process.env.TRAINER_ID || process.env.TRAINER_EMAIL;

    if (!trainerId || !trainerName || !password) {
      return res.status(400).json({ message: "Please provide trainerId, trainerName and password" });
    }

    if (!configuredTrainerId || trainerId !== configuredTrainerId) {
      return res.status(401).json({ message: "Invalid trainer ID" });
    }

    const existingTrainer = await User.findOne({ name: trainerName, role: "trainer" });
    if (existingTrainer) {
      return res.status(400).json({ message: "Trainer already exists with this name" });
    }

    const sanitizedName = trainerName.trim();
    const trainerEmail = `trainer+${sanitizedName.toLowerCase().replace(/\s+/g, ".")}@fitzone.local`;
    const trainer = await User.create({
      name: sanitizedName,
      email: trainerEmail,
      password,
      role: "trainer",
    });

    res.status(201).json({
      _id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      role: trainer.role,
      token: generateToken(trainer._id, trainer.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,

      role: user.role,
      token: generateToken(user._id, user.role),
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login trainer with trainer ID
// @route   POST /api/auth/trainer-login
// @access  Public
const trainerLogin = async (req, res) => {
  try {
    const { trainerId, trainerName, password } = req.body;
    const configuredTrainerId = process.env.TRAINER_ID || process.env.TRAINER_EMAIL;

    if (!trainerId || !trainerName || !password) {
      return res.status(400).json({ message: "Please provide trainerId, trainerName and password" });
    }

    if (!configuredTrainerId || trainerId !== configuredTrainerId) {
      return res.status(401).json({ message: "Invalid trainer ID" });
    }

    const user = await User.findOne({ name: trainerName.trim(), role: "trainer" }).select("+password");
    if (!user || user.role !== "trainer") {
      return res.status(401).json({ message: "Invalid trainer credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid trainer credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { register, login, trainerSignup, trainerLogin, getMe };




