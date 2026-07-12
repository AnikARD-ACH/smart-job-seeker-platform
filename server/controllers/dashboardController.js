const User = require("../models/User");

const getJobSeekerDashboard = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "job_seeker",
    }).select("-otpHash -twoFactorCodeHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Job seeker user not found.",
      });
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        role: "job_seeker",
        profile: {
          fullName: user.fullName,
          email: user.email,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        stats: {
          cvStatus: "Not uploaded yet",
          recommendedJobs: 0,
          applications: 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load job seeker dashboard.",
      error: error.message,
    });
  }
};

const getHRDashboard = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "hr",
    }).select("-otpHash -twoFactorCodeHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR user not found.",
      });
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        role: "hr",
        profile: {
          fullName: user.fullName,
          email: user.email,
          companyName: user.companyName,
          companyWebsite: user.companyWebsite,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        stats: {
          openJobs: 0,
          newApplicants: 0,
          scheduledInterviews: 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load HR dashboard.",
      error: error.message,
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ role: "job_seeker" });
    const hrUsers = await User.countDocuments({ role: "hr" });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const pendingHRApprovals = await User.countDocuments({
      role: "hr",
      accountStatus: "pending",
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        role: "admin",
        stats: {
          totalUsers,
          jobSeekers,
          hrUsers,
          adminUsers,
          pendingHRApprovals,
          securityStatus: "Ready",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
      error: error.message,
    });
  }
};

module.exports = {
  getJobSeekerDashboard,
  getHRDashboard,
  getAdminDashboard,
};
