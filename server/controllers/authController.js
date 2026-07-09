const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalizeRole = (role) => {
  if (role === "job-seeker") return "job_seeker";
  return role;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestOtp = async (req, res) => {
  try {
    const { email, role, fullName, companyName, companyWebsite } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required.",
      });
    }

    const normalizedRole = normalizeRole(role);

    if (!["job_seeker", "hr", "admin"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.create({
        email,
        role: normalizedRole,
        fullName: fullName || "",
        companyName: companyName || "",
        companyWebsite: companyWebsite || "",
        accountStatus: normalizedRole === "job_seeker" ? "active" : "pending",
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
      });
    } else {
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpAttempts = 0;

      if (fullName) user.fullName = fullName;
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;

      await user.save();
    }

    console.log(`Development OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully. Check backend terminal in development mode.",
      role: user.role,
      accountStatus: user.accountStatus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to request OTP.",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP was not requested or has expired.",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP attempts. Please request a new OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);

    if (!isOtpValid) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.isEmailVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
};
