const Review = require("../models/Review");
const Appointment = require("../models/Appointment");

exports.addReview = async (req, res) => {
    const { appointmentId } = req.params;
    const { rating, comment, target } = req.body; // target = doctorId or clinicId

    if (req.user.role !== "patient") {
        return res.status(403).json({ message: "Only patients can review." });
    }

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        if (appointment.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to review this appointment." });
        }

        // Prevent multiple reviews for same appointment & target
        const existing = await Review.findOne({ appointment: appointmentId, reviewer: req.user.userId, target });
        if (existing) {
            return res.status(400).json({ message: "You have already reviewed this." });
        }

        const review = new Review({
            appointment: appointmentId,
            reviewer: req.user.userId,
            target,
            rating,
            comment,
        });

        await review.save();

        res.status(201).json({ message: "Review added successfully", review });
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getReviewsForUser = async (req, res) => {
    const { userId } = req.params; // doctorId or clinicId

    try {
        const reviews = await Review.find({ target: userId })
            .populate("reviewer", "name")
            .populate("appointment", "date time");

        const avgRating = reviews.length > 0 ?
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
            : "No ratings yet";

        res.status(200).json({ reviews, avgRating });
    } catch (err) {
        console.error("Get reviews error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
