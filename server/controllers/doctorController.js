const User = require("../models/User");

exports.updateDoctorProfile = async (req, res) => {
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Not a doctor." });
        }

        const { specialization, fees, associatedClinic } = req.body;

        const doctor = await User.findById(req.user.userId);

        doctor.specialization = specialization || doctor.specialization;
        doctor.fees = fees || doctor.fees;
        doctor.associatedClinic = associatedClinic || doctor.associatedClinic;

        await doctor.save();

        res.status(200).json({ message: "Doctor profile updated successfully", doctor });
    } catch (err) {
        console.error("Doctor profile update error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
