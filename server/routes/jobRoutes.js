const express = require("express");
const {
  createJob,
  getJobs,
  getJobsByHR,
} = require("../controllers/jobController");

const router = express.Router();

router.post("/", createJob);
router.get("/", getJobs);
router.get("/hr", getJobsByHR);

module.exports = router;
