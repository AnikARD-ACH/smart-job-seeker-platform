const User = require("../models/User");

const getPendingHRUsers = async (req, res) => {
  try {
    const pendingHRUsers = await User.find({
      role: "hr",
      accountStatus: "pending",
    })
      .select("-otpHash -twoFactorCodeHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingHRUsers.length,
      users: pendingHRUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load pending HR users.",
      error: error.message,
    });
  }
};

const approveHRUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "hr",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR user not found.",
      });
    }

    user.accountStatus = "active";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "HR account approved successfully.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve HR user.",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingHRUsers,
  approveHRUser,
};
