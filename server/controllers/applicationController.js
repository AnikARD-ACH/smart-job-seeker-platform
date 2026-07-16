const Application = require("../models/Application");
const Job = require("../models/Job");
const CandidateProfile = require("../models/CandidateProfile");
const CV = require("../models/CV");
const { calculateJobMatch } = require("../utils/matchCalculator");

const allowedStatuses = [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "interview_scheduled",
  "hired",
];

const calculateApplicationMatchScore = async (jobSeekerEmail, job) => {
  const normalizedEmail = jobSeekerEmail.toLowerCase().trim();

  const candidateProfile = await CandidateProfile.findOne({
    jobSeekerEmail: normalizedEmail,
  });

  if (!candidateProfile) {
    return {
      cvMatchScore: null,
      matchDetails: null,
    };
  }

  const latestCV = await CV.findOne({
    jobSeekerEmail: normalizedEmail,
  }).sort({ createdAt: -1 });

  const matchDetails = calculateJobMatch(candidateProfile, job, latestCV);

  return {
    cvMatchScore: matchDetails.totalScore,
    matchDetails,
  };
};

const applyToJob = async (req, res) => {
  try {
    const { jobId, jobSeekerEmail, coverLetter } = req.body;

    if (!jobId || !jobSeekerEmail) {
      return res.status(400).json({
        success: false,
        message: "Job ID and job seeker email are required.",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is not open for applications.",
      });
    }

    const { cvMatchScore } = await calculateApplicationMatchScore(jobSeekerEmail, job);

    const application = await Application.create({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      hrEmail: job.postedByEmail,
      jobSeekerEmail,
      coverLetter,
      cvMatchScore,
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit application.",
      error: error.message,
    });
  }
};

const getApplicationsByJobSeeker = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const applications = await Application.find({
      jobSeekerEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load job seeker applications.",
      error: error.message,
    });
  }
};

const getApplicationsByHR = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "HR email is required.",
      });
    }

    const applications = await Application.find({
      hrEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load HR applications.",
      error: error.message,
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Application status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status,
        remarks: remarks || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update application status.",
      error: error.message,
    });
  }
};

const recalculateApplicationMatchScore = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const job = await Job.findById(application.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Related job not found.",
      });
    }

    const { cvMatchScore, matchDetails } = await calculateApplicationMatchScore(
      application.jobSeekerEmail,
      job
    );

    application.cvMatchScore = cvMatchScore;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application match score recalculated successfully.",
      application,
      matchDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to recalculate application match score.",
      error: error.message,
    });
  }
};

const recalculateApplicationsByJobSeeker = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const applications = await Application.find({
      jobSeekerEmail: email.toLowerCase().trim(),
    });

    const updatedApplications = [];

    for (const application of applications) {
      const job = await Job.findById(application.jobId);

      if (job) {
        const { cvMatchScore } = await calculateApplicationMatchScore(
          application.jobSeekerEmail,
          job
        );

        application.cvMatchScore = cvMatchScore;
        await application.save();

        updatedApplications.push(application);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Job seeker application match scores recalculated successfully.",
      count: updatedApplications.length,
      applications: updatedApplications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to recalculate job seeker application match scores.",
      error: error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getApplicationsByJobSeeker,
  getApplicationsByHR,
  updateApplicationStatus,
  recalculateApplicationMatchScore,
  recalculateApplicationsByJobSeeker,
};
