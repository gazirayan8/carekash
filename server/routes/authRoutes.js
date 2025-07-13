const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { updateProfile } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");  // ✅ Add this line

// @route   POST /api/auth/register
// @desc    Register a new user (patient, doctor, or clinic)
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
router.post("/login", loginUser);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (patients/doctors)
router.put("/update-profile", verifyToken, updateProfile);

module.exports = router;
