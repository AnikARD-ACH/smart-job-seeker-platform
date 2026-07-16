const Interview = require("../models/Interview");
const Application = require("../models/Application");

const allowedInterviewStatuses = ["scheduled", "completed", "cancelled"];
const allowedCandidateResponses = ["pending", "accepted", "declined"];

const scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      hrEmail,
      scheduledAt,
      durationMinutes,
      mode,
      meetingLink,
      location,
      notes,
    } = req.body;

    if (!applicationId || !hrEmail || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Application ID, HR email, and scheduled time are required.",
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (application.hrEmail !== hrEmail.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: "This HR account cannot schedule interview for this application.",
      });
    }

    const interview = await Interview.create({
      applicationId: application._id,
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      companyName: application.companyName,
      hrEmail: application.hrEmail,
      jobSeekerEmail: application.jobSeekerEmail,
      scheduledAt,
      durationMinutes: durationMinutes || 30,
      mode: mode || "online",
      meetingLink: meetingLink || "",
      location: location || "",
      notes: notes || "",
      status: "scheduled",
      candidateResponse: "pending",
    });

    application.status = "interview_scheduled";
    application.remarks = notes || "Interview has been scheduled.";
    await application.save();

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview,
      application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to schedule interview.",
      error: error.message,
    });
  }
};

const getInterviewsByHR = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "HR email is required.",
      });
    }

    const interviews = await Interview.find({
      hrEmail: email.toLowerCase().trim(),
    }).sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load HR interviews.",
      error: error.message,
    });
  }
};

const getInterviewsByJobSeeker = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const interviews = await Interview.find({
      jobSeekerEmail: email.toLowerCase().trim(),
    }).sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load job seeker interviews.",
      error: error.message,
    });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Interview status is required.",
      });
    }

    if (!allowedInterviewStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview status.",
      });
    }

    const updatePayload = {
      status,
    };

    if (typeof notes === "string") {
      updatePayload.notes = notes;
    }

    const interview = await Interview.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview status updated successfully.",
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update interview status.",
      error: error.message,
    });
  }
};

const respondToInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobSeekerEmail, candidateResponse } = req.body;

    if (!jobSeekerEmail || !candidateResponse) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email and response are required.",
      });
    }

    if (!allowedCandidateResponses.includes(candidateResponse)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate response.",
      });
    }

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (interview.jobSeekerEmail !== jobSeekerEmail.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: "This job seeker cannot respond to this interview.",
      });
    }

    interview.candidateResponse = candidateResponse;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview response saved successfully.",
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save interview response.",
      error: error.message,
    });
  }
};

module.exports = {
  scheduleInterview,
  getInterviewsByHR,
  getInterviewsByJobSeeker,
  updateInterviewStatus,
  respondToInterview,
};
