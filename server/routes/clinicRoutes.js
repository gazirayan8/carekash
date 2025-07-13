const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { 
    updateAppointmentStatus, 
    deleteAppointment, 
    getClinicAppointments 
} = require("../controllers/appointmentController");

const { 
    createOrUpdateClinicProfile,
    getClinicProfile
} = require("../controllers/clinicController");

// ✅ Clinic Profile Management
router.post("/profile", verifyToken, createOrUpdateClinicProfile);
router.get("/profile", verifyToken, getClinicProfile);

// ✅ View appointments for this clinic
router.get("/appointments", verifyToken, getClinicAppointments);

// ✅ Update appointment status
router.put("/appointments/:id/status", verifyToken, updateAppointmentStatus);

// ✅ Delete appointment
router.delete("/appointments/:id", verifyToken, deleteAppointment);

module.exports = router;
