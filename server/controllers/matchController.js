const CandidateProfile = require("../models/CandidateProfile");
const Job = require("../models/Job");
const { calculateJobMatch } = require("../utils/matchCalculator");

const getJobMatchesByCandidate = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const candidateProfile = await CandidateProfile.findOne({
      jobSeekerEmail: email.toLowerCase().trim(),
    });

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found. Save your profile before checking job matches.",
      });
    }

    const jobs = await Job.find({
      status: "open",
    }).sort({ createdAt: -1 });

    const matches = jobs.map((job) => {
      const match = calculateJobMatch(candidateProfile, job);

      return {
        job,
        match,
      };
    });

    matches.sort((a, b) => b.match.totalScore - a.match.totalScore);

    return res.status(200).json({
      success: true,
      count: matches.length,
      candidate: {
        email: candidateProfile.jobSeekerEmail,
        fullName: candidateProfile.fullName,
        skills: candidateProfile.skills,
        preferredJobType: candidateProfile.preferredJobType,
        preferredLocation: candidateProfile.preferredLocation,
      },
      matches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate job matches.",
      error: error.message,
    });
  }
};

module.exports = {
  getJobMatchesByCandidate,
};
