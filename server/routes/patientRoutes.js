const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const { 
  bookAppointment, 
  getAvailableSlots, 
  getPatientAppointments, 
  cancelAppointment,
  rescheduleAppointment,
  getPatientHistory,
  getUpcomingAppointments
} = require("../controllers/appointmentController");

// ✅ View patient appointments
router.get("/appointments", verifyToken, getPatientAppointments);

// ✅ Book an appointment
router.post("/book", verifyToken, bookAppointment);

// ✅ View available slots for doctor & date
router.get("/available-slots", verifyToken, getAvailableSlots);

// ✅ Cancel an appointment
router.delete("/cancel-appointment/:id", verifyToken, cancelAppointment);

//rechedule appointment
router.put("/reschedule/:id", verifyToken, rescheduleAppointment);

//appointment history(patient)
router.get("/history", verifyToken, getPatientHistory);

//upcoming appointments 
router.get("/upcoming", verifyToken, getUpcomingAppointments);


module.exports = router;
