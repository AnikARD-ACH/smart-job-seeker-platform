const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["job_seeker", "hr", "admin"],
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otpHash: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorCodeHash: {
      type: String,
      default: null,
    },

    twoFactorExpiresAt: {
      type: Date,
      default: null,
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
    },

    companyWebsite: {
      type: String,
      trim: true,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
