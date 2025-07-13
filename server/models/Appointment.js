const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ doctor field is required
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // ✅ time is required
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
