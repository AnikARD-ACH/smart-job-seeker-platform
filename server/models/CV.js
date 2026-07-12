const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    jobSeekerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    sizeBytes: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["uploaded", "processed", "failed"],
      default: "uploaded",
    },

    extractedText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const CV = mongoose.model("CV", cvSchema);

module.exports = CV;
