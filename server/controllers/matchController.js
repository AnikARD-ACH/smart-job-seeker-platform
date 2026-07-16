const CandidateProfile = require("../models/CandidateProfile");
const Job = require("../models/Job");
const CV = require("../models/CV");
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

    const normalizedEmail = email.toLowerCase().trim();

    const candidateProfile = await CandidateProfile.findOne({
      jobSeekerEmail: normalizedEmail,
    });

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found. Save your profile before checking job matches.",
      });
    }

    const latestCV = await CV.findOne({
      jobSeekerEmail: normalizedEmail,
    }).sort({ createdAt: -1 });

    const jobs = await Job.find({
      status: "open",
    }).sort({ createdAt: -1 });

    const matches = jobs.map((job) => {
      const match = calculateJobMatch(candidateProfile, job, latestCV);

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
      cv: latestCV
        ? {
            id: latestCV._id,
            originalName: latestCV.originalName,
            status: latestCV.status,
            extractedTextLength: latestCV.extractedText?.length || 0,
            usedInScoring: Boolean(latestCV.extractedText),
          }
        : null,
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
