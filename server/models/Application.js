const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    hrEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    jobSeekerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["submitted", "reviewing", "shortlisted", "rejected", "interview_scheduled", "hired"],
      default: "submitted",
    },

    cvMatchScore: {
      type: Number,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, jobSeekerEmail: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
