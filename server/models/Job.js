const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    postedByEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    salaryRange: {
      type: String,
      trim: true,
      default: "",
    },

    deadline: {
      type: Date,
      required: true,
    },

    vacancy: {
      type: Number,
      default: 1,
    },

    experienceLevel: {
      type: String,
      trim: true,
      default: "",
    },

    educationRequirement: {
      type: String,
      trim: true,
      default: "",
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: {
      type: String,
      required: true,
      trim: true,
    },

    benefits: {
      type: String,
      trim: true,
      default: "",
    },

    selectionStages: {
      aptitudeTest: {
        type: Boolean,
        default: false,
      },
      codingTest: {
        type: Boolean,
        default: false,
      },
      writingTest: {
        type: Boolean,
        default: false,
      },
      interview: {
        type: Boolean,
        default: true,
      },
    },

    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
