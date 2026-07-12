const Application = require("../models/Application");
const Job = require("../models/Job");

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

    const application = await Application.create({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      hrEmail: job.postedByEmail,
      jobSeekerEmail,
      coverLetter,
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

module.exports = {
  applyToJob,
  getApplicationsByJobSeeker,
  getApplicationsByHR,
};
