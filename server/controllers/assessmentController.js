const Assessment = require("../models/Assessment");
const Application = require("../models/Application");

const allowedAssessmentTypes = ["aptitude", "coding", "writing"];
const allowedStatuses = ["assigned", "submitted", "reviewed", "cancelled"];

const assignAssessment = async (req, res) => {
  try {
    const {
      applicationId,
      hrEmail,
      assessmentType,
      title,
      instructions,
      durationMinutes,
      dueDate,
    } = req.body;

    if (!applicationId || !hrEmail || !assessmentType || !title || !instructions) {
      return res.status(400).json({
        success: false,
        message: "Application ID, HR email, assessment type, title, and instructions are required.",
      });
    }

    if (!allowedAssessmentTypes.includes(assessmentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment type.",
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
        message: "This HR account cannot assign assessments to this application.",
      });
    }

    const assessment = await Assessment.create({
      applicationId: application._id,
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      companyName: application.companyName,
      hrEmail: application.hrEmail,
      jobSeekerEmail: application.jobSeekerEmail,
      assessmentType,
      title,
      instructions,
      durationMinutes: durationMinutes || 30,
      dueDate: dueDate || null,
      status: "assigned",
    });

    return res.status(201).json({
      success: true,
      message: "Assessment assigned successfully.",
      assessment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign assessment.",
      error: error.message,
    });
  }
};

const getAssessmentsByHR = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "HR email is required.",
      });
    }

    const assessments = await Assessment.find({
      hrEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load HR assessments.",
      error: error.message,
    });
  }
};

const getAssessmentsByJobSeeker = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email is required.",
      });
    }

    const assessments = await Assessment.find({
      jobSeekerEmail: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load job seeker assessments.",
      error: error.message,
    });
  }
};

const updateAssessmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Assessment status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment status.",
      });
    }

    const updatePayload = {
      status,
    };

    if (typeof score === "number") {
      updatePayload.score = score;
    }

    if (typeof feedback === "string") {
      updatePayload.feedback = feedback;
    }

    const assessment = await Assessment.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assessment updated successfully.",
      assessment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update assessment.",
      error: error.message,
    });
  }
};

const submitAssessmentAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobSeekerEmail, submittedAnswer } = req.body;

    if (!jobSeekerEmail || !submittedAnswer) {
      return res.status(400).json({
        success: false,
        message: "Job seeker email and submitted answer are required.",
      });
    }

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    if (assessment.jobSeekerEmail !== jobSeekerEmail.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: "This job seeker cannot submit this assessment.",
      });
    }

    assessment.submittedAnswer = submittedAnswer;
    assessment.status = "submitted";
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: "Assessment answer submitted successfully.",
      assessment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit assessment answer.",
      error: error.message,
    });
  }
};

module.exports = {
  assignAssessment,
  getAssessmentsByHR,
  getAssessmentsByJobSeeker,
  updateAssessmentStatus,
  submitAssessmentAnswer,
};
