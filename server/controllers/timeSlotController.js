const TimeSlot = require("../models/TimeSlot");

exports.addTimeSlots = async (req, res) => {
  const { date, slots } = req.body;

  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can add slots" });
    }

    // Check if already exists
    const existing = await TimeSlot.findOne({
      doctor: req.user.userId,
      date,
    });

    if (existing) {
      return res.status(400).json({ message: "Slots already added for this date" });
    }

    const newSlot = new TimeSlot({
      doctor: req.user.userId,
      date,
      slots: slots.map((time) => ({ time })),
    });

    await newSlot.save();

    res.status(201).json({ message: "Time slots added", slot: newSlot });
  } catch (err) {
    console.error("Add time slot error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
