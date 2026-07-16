const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

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

    assessmentType: {
      type: String,
      enum: ["aptitude", "coding", "writing"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      required: true,
      trim: true,
    },

    durationMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 240,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["assigned", "submitted", "reviewed", "cancelled"],
      default: "assigned",
    },

    submittedAnswer: {
      type: String,
      trim: true,
      default: "",
    },

    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ applicationId: 1, assessmentType: 1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;
