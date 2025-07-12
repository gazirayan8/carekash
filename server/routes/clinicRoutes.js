const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const User = require("../models/User");
const {
  updateAppointmentStatus,
  deleteAppointment,
  getClinicAppointments,
} = require("../controllers/appointmentController");

// ✅ Get clinic profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Access denied. Not a clinic." });
    }

    const clinic = await User.findById(req.user.userId).select("-password");
    res.status(200).json(clinic);
  } catch (error) {
    console.error("Clinic profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ View appointments for this clinic
router.get("/appointments", verifyToken, getClinicAppointments);

// ✅ Update appointment status
router.put("/appointments/:id/status", verifyToken, updateAppointmentStatus);

// ✅ Delete appointment
router.delete("/appointments/:id", verifyToken, deleteAppointment);

// ✅ Export router at the END
module.exports = router;
