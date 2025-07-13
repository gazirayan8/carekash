const User = require("../models/User");
const Review = require("../models/Review");
const mongoose = require("mongoose");

// ✅ Search Doctors
exports.searchDoctors = async (req, res) => {
  try {
    const { specialization, location, minFee, maxFee } = req.query;

    // Build query object
    let query = { role: "doctor" };

    if (specialization) {
      query.specialization = specialization;
    }

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    if (minFee && maxFee) {
      query.consultationFee = { $gte: Number(minFee), $lte: Number(maxFee) };
    }

    const doctors = await User.find(query).select("-password");

    // Get Ratings for each doctor
    const doctorWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ target: doctor._id });
        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
            : "No ratings";

        return { ...doctor.toObject(), avgRating };
      })
    );

    res.json(doctorWithRatings);
  } catch (err) {
    console.error("Doctor search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Search Clinics
exports.searchClinics = async (req, res) => {
  try {
    const { location } = req.query;

    let query = { role: "clinic" };

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    const clinics = await User.find(query).select("-password");

    // Get Ratings for each clinic
    const clinicsWithRatings = await Promise.all(
      clinics.map(async (clinic) => {
        const reviews = await Review.find({ target: clinic._id });
        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
            : "No ratings";

        return { ...clinic.toObject(), avgRating };
      })
    );

    res.json(clinicsWithRatings);
  } catch (err) {
    console.error("Clinic search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
