const express = require("express");
const router = express.Router();

const { register, login, trainerSignup, trainerLogin, getMe } = require("../controllers/authController");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/trainer-signup", trainerSignup);
router.post("/trainer-login", trainerLogin);




router.get("/me", protect, getMe);


module.exports = router;

