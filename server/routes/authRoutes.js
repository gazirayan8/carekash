const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new user (patient, doctor, or clinic)
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
router.post("/login", loginUser);

module.exports = router;
