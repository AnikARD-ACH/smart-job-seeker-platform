const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      postedByEmail,
      jobType,
      location,
      salaryRange,
      deadline,
      vacancy,
      experienceLevel,
      educationRequirement,
      requiredSkills,
      responsibilities,
      requirements,
      benefits,
      selectionStages,
    } = req.body;

    if (!title || !companyName || !postedByEmail || !location || !deadline || !responsibilities || !requirements) {
      return res.status(400).json({
        success: false,
        message: "Title, company name, HR email, location, deadline, responsibilities, and requirements are required.",
      });
    }

    const skillsArray = typeof requiredSkills === "string"
      ? requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : requiredSkills || [];

    const job = await Job.create({
      title,
      companyName,
      postedByEmail,
      jobType,
      location,
      salaryRange,
      deadline,
      vacancy,
      experienceLevel,
      educationRequirement,
      requiredSkills: skillsArray,
      responsibilities,
      requirements,
      benefits,
      selectionStages,
      status: "open",
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create job.",
      error: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load jobs.",
      error: error.message,
    });
  }
};

const getJobsByHR = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "HR email is required.",
      });
    }

    const jobs = await Job.find({
      postedByEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load HR jobs.",
      error: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobsByHR,
};
