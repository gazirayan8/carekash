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
    if (!doctor.clinic) {
  return res.status(400).json({ message: "Doctor is not associated with a clinic. Please contact admin." });
  }

    // Create new appointment
    const appointment = new Appointment({
      patient: req.user.userId,
      doctor: doctorId,
      clinic: doctor.clinic, // auto-linked
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
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied. Not a doctor." });
  }

  const { status } = req.query; // optional filter

  try {
    // Create query object
    const query = { doctor: req.user.userId };

    // If status is passed in query, add to filter
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name email")
      .populate("clinic", "clinicName");

    res.status(200).json({ appointments });
  } catch (err) {
    console.error("Doctor appointment fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// View appointments for a clinic
exports.getClinicAppointments = async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Access denied. Not a clinic." });
  }

  const { status } = req.query;

  const query = { clinic: req.user.userId };
  if (status) query.status = status; // ✅ Filter by status if provided

  try {
    const appointments = await Appointment.find(query)
      .populate("doctor", "name specialization")
      .populate("patient", "name email");

    res.status(200).json({ appointments });
  } catch (err) {
    console.error("Clinic appointments fetch error:", err);
    res.status(500).json({ message: "Server error" });
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
// ✅ Get appointments for patient (History)

exports.getPatientAppointments = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied. Not a patient." });
  }

  const { status, fromDate, toDate } = req.query; // Filters from query params

  const filter = { patient: req.user.userId };

  // ✅ Filter by status if provided
  if (status) {
    filter.status = status;
  }

  // ✅ Filter by date range if provided
  if (fromDate || toDate) {
    filter.date = {};
    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }
    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  try {
    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialization")
      .populate("clinic", "clinicName");

    res.status(200).json({ appointments });
  } catch (err) {
    console.error("Patient appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Only patients can cancel appointments." });
  }

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment." });
    }

    // ✅ Set status to cancelled (instead of deleting)
    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully." });
  } catch (err) {
    console.error("Cancel appointment error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
exports.rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { newDate, newTime } = req.body;

  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Only patients can reschedule appointments." });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to reschedule this appointment." });
    }

    // Check if time slot is available again (reuse TimeSlot logic)
    const timeSlot = await TimeSlot.findOne({ doctor: appointment.doctor, date: newDate });

    if (!timeSlot) {
      return res.status(400).json({ message: "No time slots available for the new date." });
    }

    const slot = timeSlot.slots.find(s => s.time === newTime && !s.booked);

    if (!slot) {
      return res.status(400).json({ message: "Selected time is already booked." });
    }

    // Free the old slot
    const oldSlot = await TimeSlot.findOne({ doctor: appointment.doctor, date: appointment.date });
    if (oldSlot) {
      const previousSlot = oldSlot.slots.find(s => s.time === appointment.time);
      if (previousSlot) previousSlot.booked = false;
      await oldSlot.save();
    }

    // Book the new slot
    slot.booked = true;
    await timeSlot.save();

    // Update appointment
    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = "pending"; // optional: reset to pending after reschedule
    await appointment.save();

    res.status(200).json({ message: "Appointment rescheduled successfully.", appointment });
  } catch (err) {
    console.error("Reschedule error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
exports.getPatientHistory = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const today = new Date();

    const history = await Appointment.find({
      patient: req.user.userId,
      date: { $lt: today }
    })
      .populate("doctor", "name specialization")
      .populate("clinic", "clinicName");

    res.status(200).json({ history });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
exports.getUpcomingAppointments = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const today = new Date();

    const upcoming = await Appointment.find({
      patient: req.user.userId,
      date: { $gte: today },
      status: { $in: ["pending", "confirmed"] }
    })
      .populate("doctor", "name specialization")
      .populate("clinic", "clinicName");

    res.status(200).json({ upcoming });
  } catch (err) {
    console.error("Upcoming error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
