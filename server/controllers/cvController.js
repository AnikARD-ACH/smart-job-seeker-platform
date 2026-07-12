const path = require("path");
const CV = require("../models/CV");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadCV = async (req, res) => {
  try {
    const { jobSeekerEmail } = req.body;

    if (!jobSeekerEmail) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CV file is required.",
      });
    }

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOC, and DOCX files are allowed.",
      });
    }

    const cv = await CV.create({
      jobSeekerEmail,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      status: "uploaded",
    });

    return res.status(201).json({
      success: true,
      message: "CV uploaded successfully.",
      cv,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload CV.",
      error: error.message,
    });
  }
};

const getLatestCVByJobSeeker = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const cv = await CV.findOne({
      jobSeekerEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      cv,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load CV.",
      error: error.message,
    });
  }
};

const getCVFile = async (req, res) => {
  try {
    const { id } = req.params;

    const cv = await CV.findById(id);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    return res.sendFile(path.resolve(cv.filePath));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load CV file.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadCV,
  getLatestCVByJobSeeker,
  getCVFile,
};
