const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getDoctorAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");

const { addTimeSlots } = require("../controllers/timeSlotController");

// ✅ Get all appointments for doctor
router.get("/appointments", verifyToken, getDoctorAppointments);

// ✅ Update appointment status
router.put("/appointments/:id/status", verifyToken, updateAppointmentStatus);

// ✅ Delete appointment
router.delete("/appointments/:id", verifyToken, deleteAppointment);

// ✅ Add available time slots
router.post("/slots", verifyToken, addTimeSlots);

// ✅ Export at the END
module.exports = router;
