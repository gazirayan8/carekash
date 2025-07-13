const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Doctor or Clinic
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
