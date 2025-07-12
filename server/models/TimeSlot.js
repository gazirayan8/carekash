const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Example: "2025-07-12"
    required: true,
  },
  slots: [
    {
      time: String, // Example: "10:00 AM"
      booked: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
