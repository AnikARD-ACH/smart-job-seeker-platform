const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema(
  {
    jobSeekerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    education: {
      type: String,
      trim: true,
      default: "",
    },

    experienceLevel: {
      type: String,
      enum: ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Lead / Manager", ""],
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    preferredJobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote", ""],
      default: "",
    },

    preferredLocation: {
      type: String,
      trim: true,
      default: "",
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);

module.exports = CandidateProfile;
