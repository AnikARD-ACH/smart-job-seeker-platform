const express = require("express");
const {
  getPendingHRUsers,
  approveHRUser,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/pending-hr", getPendingHRUsers);
router.patch("/approve-hr/:id", approveHRUser);

module.exports = router;
