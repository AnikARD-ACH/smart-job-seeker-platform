const express = require("express");
const {
  applyToJob,
  getApplicationsByJobSeeker,
  getApplicationsByHR,
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", applyToJob);
router.get("/job-seeker", getApplicationsByJobSeeker);
router.get("/hr", getApplicationsByHR);

module.exports = router;
