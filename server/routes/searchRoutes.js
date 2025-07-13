const express = require("express");
const router = express.Router();

const { searchDoctors, searchClinics } = require("../controllers/searchController");

// ✅ Search doctors
router.get("/doctors", searchDoctors);

// ✅ Search clinics
router.get("/clinics", searchClinics);

module.exports = router;
