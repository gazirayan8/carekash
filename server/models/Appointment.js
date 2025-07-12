const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clinic: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: false},
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
