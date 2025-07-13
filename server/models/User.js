const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "clinic"],
      required: true,
    },

    // Fields specific to doctors
    specialization: {
      type: String,
      default: "",
    },
    documents: {
      type: [String], // e.g. certificates etc.
      default: [],
    },
    associatedClinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicProfile", // Clinic details are now in ClinicProfile
    },
    fees: {
      type: Number,
      default: 0,
    },

    // Availability of doctor (optional)
    availability: {
      type: [
        {
          day: String,
          slots: [String], // ["10:00 AM", "11:00 AM"]
        },
      ],
      default: [],
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
