const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
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

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 240,
    },

    mode: {
      type: String,
      enum: ["online", "onsite", "phone"],
      default: "online",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    candidateResponse: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ applicationId: 1, status: 1 });

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
