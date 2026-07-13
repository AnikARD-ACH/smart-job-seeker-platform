const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const CV = require("../models/CV");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const extractTextFromCV = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    const fileBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdfParse(fileBuffer);
    return String(pdfData.text || "").trim();
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ path: filePath });
    return String(result.value || "").trim();
  }

  if (mimeType === "application/msword") {
    throw new Error("Legacy DOC extraction is not supported yet. Please upload PDF or DOCX.");
  }

  throw new Error("Unsupported file type for text extraction.");
};

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

    let extractedText = "";
    let status = "uploaded";
    let extractionMessage = "Text extraction was not completed.";

    try {
      extractedText = await extractTextFromCV(req.file.path, req.file.mimetype);

      if (extractedText.length > 0) {
        status = "processed";
        extractionMessage = "CV text extracted successfully.";
      } else {
        status = "failed";
        extractionMessage = "CV uploaded, but no readable text was found.";
      }
    } catch (extractError) {
      status = "failed";
      extractionMessage = extractError.message;
    }

    const cv = await CV.create({
      jobSeekerEmail,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      status,
      extractedText,
    });

    return res.status(201).json({
      success: true,
      message: "CV uploaded successfully.",
      extractionMessage,
      extractedTextLength: extractedText.length,
      extractedTextPreview: extractedText.slice(0, 500),
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

const deleteCV = async (req, res) => {
  try {
    const { id } = req.params;

    const cv = await CV.findById(id);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    if (cv.filePath && fs.existsSync(cv.filePath)) {
      fs.unlinkSync(cv.filePath);
    }

    await CV.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "CV removed successfully.",
      deletedCV: {
        id: cv._id,
        originalName: cv.originalName,
        jobSeekerEmail: cv.jobSeekerEmail,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove CV.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadCV,
  getLatestCVByJobSeeker,
  getCVFile,
  deleteCV,
};
