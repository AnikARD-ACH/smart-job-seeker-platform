const express = require("express");
const {
  getJobMatchesByCandidate,
} = require("../controllers/matchController");

const router = express.Router();

router.get("/job-seeker", getJobMatchesByCandidate);

module.exports = router;
