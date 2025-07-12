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
      type: [String], // array of file URLs
      default: [],
    },
    clinics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
      },
    ],
    availability: {
      type: [
        {
          day: String,
          slots: [String], // e.g. ["10:00AM", "11:30AM"]
        },
      ],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // Fields specific to clinic
    clinicName: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
