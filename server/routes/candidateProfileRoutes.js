const express = require("express");
const {
  getCandidateProfile,
  saveCandidateProfile,
} = require("../controllers/candidateProfileController");

const router = express.Router();

router.get("/job-seeker", getCandidateProfile);
router.put("/job-seeker", saveCandidateProfile);

module.exports = router;
