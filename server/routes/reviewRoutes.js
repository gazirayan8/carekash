const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { addReview, getReviewsForUser } = require("../controllers/reviewController");

// ✅ Add review (for doctor or clinic)
router.post("/:appointmentId", verifyToken, addReview);

// ✅ Get reviews for doctor/clinic by userId
router.get("/:userId", getReviewsForUser);

module.exports = router;
