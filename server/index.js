const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const cvRoutes = require("./routes/cvRoutes");
const candidateProfileRoutes = require("./routes/candidateProfileRoutes");
const matchRoutes = require("./routes/matchRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Job Seeker Platform API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Backend Server",
    database: "MongoDB connection configured",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/candidate-profile", candidateProfileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/interviews", interviewRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

