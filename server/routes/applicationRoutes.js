const express = require("express");
const {
  applyToJob,
  getApplicationsByJobSeeker,
  getApplicationsByHR,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", applyToJob);
router.get("/job-seeker", getApplicationsByJobSeeker);
router.get("/hr", getApplicationsByHR);
router.patch("/:id/status", updateApplicationStatus);

module.exports = router;
