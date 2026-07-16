const express = require("express");
const {
  scheduleInterview,
  getInterviewsByHR,
  getInterviewsByJobSeeker,
  updateInterviewStatus,
  respondToInterview,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/schedule", scheduleInterview);
router.get("/hr", getInterviewsByHR);
router.get("/job-seeker", getInterviewsByJobSeeker);
router.patch("/:id/status", updateInterviewStatus);
router.patch("/:id/respond", respondToInterview);

module.exports = router;
