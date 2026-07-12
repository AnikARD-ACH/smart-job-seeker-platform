const express = require("express");
const {
  getJobSeekerDashboard,
  getHRDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/job-seeker", getJobSeekerDashboard);
router.get("/hr", getHRDashboard);
router.get("/admin", getAdminDashboard);

module.exports = router;
