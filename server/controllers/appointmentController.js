const Appointment = require("../models/Appointment");
const User = require("../models/User");
const TimeSlot = require("../models/TimeSlot");

exports.bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    // Get the doctor and their associated clinic
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ Check time slot availability
    const timeSlot = await TimeSlot.findOne({ doctor: doctorId, date });
    if (!timeSlot) {
      return res.status(400).json({ message: "No time slots defined for this date" });
    }

    const slot = timeSlot.slots.find((s) => s.time === time && !s.booked);
    if (!slot) {
      return res.status(400).json({ message: "Time slot not available or already booked" });
    }

    // ✅ Mark slot as booked
    slot.booked = true;
    await timeSlot.save();
    
    console.log("Booking with values:", {
    patient: req.user.userId,
    doctor: doctorId,
    clinic: doctor.clinic,
    date,
    time,
    });
    // Create new appointment
    const appointment = new Appointment({
      patient: req.user.userId,
      doctor: doctorId,
      clinic: doctor.clinic || null, // auto-linked
      date,
      time,
    });

    await appointment.save();

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    console.error("Appointment booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// View appointments by doctor
exports.getDoctorAppointments = async (req, res) => {
  if (req.user.role !== "doctor")
    return res.status(403).json({ message: "Only doctors allowed." });

  try {
    const appointments = await Appointment.find({ doctor: req.user.userId })
      .populate("patient", "name email")
      .populate("clinic", "clinicName");

    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// View appointments for a clinic
exports.getClinicAppointments = async (req, res) => {
  if (req.user.role !== "clinic")
    return res.status(403).json({ message: "Only clinics allowed." });

  try {
    const appointments = await Appointment.find({ clinic: req.user.userId })
      .populate("doctor", "name specialization")
      .populate("patient", "name email");

    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching clinic appointments" });
  }
};
// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedRoles = ["doctor", "clinic"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized to update status" });
  }

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only allow doctor/clinic to update their own appointment
    if (
      (req.user.role === "doctor" && appointment.doctor.toString() !== req.user.userId) ||
      (req.user.role === "clinic" && appointment.clinic.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: "Unauthorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctor or clinic can delete
    if (
      (req.user.role === "doctor" && appointment.doctor.toString() !== req.user.userId) ||
      (req.user.role === "clinic" && appointment.clinic.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch available slots for a doctor on a date
exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    const slots = await TimeSlot.findOne({ doctor: doctorId, date });

    if (!slots) {
      return res.status(404).json({ message: "No slots available for this doctor on this date" });
    }

    const available = slots.slots.filter((s) => !s.booked);

    res.status(200).json({ available });
  } catch (err) {
    console.error("Fetch slots error:", err);
    res.status(500).json({ message: "Server error" });
  }
};