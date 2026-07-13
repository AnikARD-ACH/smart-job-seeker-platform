const CandidateProfile = require("../models/CandidateProfile");

const getCandidateProfile = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const profile = await CandidateProfile.findOne({
      jobSeekerEmail: email.toLowerCase().trim(),
    });

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load candidate profile.",
      error: error.message,
    });
  }
};

const saveCandidateProfile = async (req, res) => {
  try {
    const {
      jobSeekerEmail,
      fullName,
      phone,
      location,
      education,
      experienceLevel,
      skills,
      preferredJobType,
      preferredLocation,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      bio,
    } = req.body;

    if (!jobSeekerEmail) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const skillsArray = typeof skills === "string"
      ? skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : skills || [];

    const profile = await CandidateProfile.findOneAndUpdate(
      {
        jobSeekerEmail: jobSeekerEmail.toLowerCase().trim(),
      },
      {
        jobSeekerEmail,
        fullName,
        phone,
        location,
        education,
        experienceLevel,
        skills: skillsArray,
        preferredJobType,
        preferredLocation,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        bio,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Candidate profile saved successfully.",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save candidate profile.",
      error: error.message,
    });
  }
};

module.exports = {
  getCandidateProfile,
  saveCandidateProfile,
};
