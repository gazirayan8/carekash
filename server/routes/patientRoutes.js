const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { bookAppointment, getAvailableSlots } = require("../controllers/appointmentController");

// ✅ Book an appointment
router.post("/book", verifyToken, bookAppointment);

// ✅ View available slots for doctor & date
router.get("/available-slots", verifyToken, getAvailableSlots);

// ✅ (For Phase 2) Dummy route for patient history (to be replaced)
router.get("/bookings", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Not a patient." });
    }

    // Dummy: will replace with actual DB query
    const dummyBookings = [
      { doctor: "Dr. Bilal", time: "10 AM", clinic: "HeartCare" },
      { doctor: "Dr. Sameer", time: "2 PM", clinic: "City Clinic" }
    ];

    res.status(200).json({
      userId: req.user.userId,
      bookings: dummyBookings,
    });
  } catch (error) {
    console.error("Patient bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
