const mongoose = require("mongoose");

const clinicProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    clinicName: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("ClinicProfile", clinicProfileSchema);
