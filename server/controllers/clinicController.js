const ClinicProfile = require("../models/ClinicProfile");
const User = require("../models/User");

// ✅ Create or Update Clinic Profile
exports.createOrUpdateClinicProfile = async (req, res) => {
    try {
        if (req.user.role !== "clinic") {
            return res.status(403).json({ message: "Access denied." });
        }

        const { clinicName, address, contactNumber, timings, fees, specialization, description } = req.body;

        let clinic = await ClinicProfile.findOne({ user: req.user.userId });

        if (clinic) {
            // Update existing
            clinic.clinicName = clinicName;
            clinic.address = address;
            clinic.contactNumber = contactNumber;
            clinic.timings = timings;
            clinic.fees = fees;
            clinic.specialization = specialization;
            clinic.description = description;
        } else {
            // Create new
            clinic = new ClinicProfile({
                user: req.user.userId,
                clinicName,
                address,
                contactNumber,
                timings,
                fees,
                specialization,
                description
            });
        }

        await clinic.save();

        res.status(200).json({ message: "Clinic profile saved successfully", clinic });
    } catch (err) {
        console.error("Clinic profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get Clinic Profile
exports.getClinicProfile = async (req, res) => {
    try {
        if (req.user.role !== "clinic") {
            return res.status(403).json({ message: "Access denied." });
        }

        const clinic = await ClinicProfile.findOne({ user: req.user.userId });

        if (!clinic) {
            return res.status(404).json({ message: "Clinic profile not found." });
        }

        res.status(200).json(clinic);
    } catch (err) {
        console.error("Get clinic profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
