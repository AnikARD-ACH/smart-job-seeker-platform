const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadCV,
  getLatestCVByJobSeeker,
  getCVFile,
  deleteCV,
} = require("../controllers/cvController");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "..", "uploads", "cvs");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    const uniqueName = `${Date.now()}-${safeOriginalName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/upload", upload.single("cv"), uploadCV);
router.get("/job-seeker", getLatestCVByJobSeeker);
router.get("/:id/file", getCVFile);
router.delete("/:id", deleteCV);

module.exports = router;
