const express = require("express");
const {
  assignAssessment,
  getAssessmentsByHR,
  getAssessmentsByJobSeeker,
  updateAssessmentStatus,
  submitAssessmentAnswer,
} = require("../controllers/assessmentController");

const router = express.Router();

router.post("/assign", assignAssessment);
router.get("/hr", getAssessmentsByHR);
router.get("/job-seeker", getAssessmentsByJobSeeker);
router.patch("/:id/status", updateAssessmentStatus);
router.patch("/:id/submit", submitAssessmentAnswer);

module.exports = router;
