const express = require("express");
const {
  getSkillRoadmapByCandidate,
} = require("../controllers/roadmapController");

const router = express.Router();

router.get("/job-seeker", getSkillRoadmapByCandidate);

module.exports = router;
