const express = require("express");
const {
  applyToJob,
  getApplicationsByJobSeeker,
  getApplicationsByHR,
  updateApplicationStatus,
  recalculateApplicationMatchScore,
  recalculateApplicationsByJobSeeker,
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", applyToJob);
router.get("/job-seeker", getApplicationsByJobSeeker);
router.get("/hr", getApplicationsByHR);
router.patch("/recalculate/job-seeker", recalculateApplicationsByJobSeeker);
router.patch("/:id/recalculate-match", recalculateApplicationMatchScore);
router.patch("/:id/status", updateApplicationStatus);

module.exports = router;
