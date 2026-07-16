const CandidateProfile = require("../models/CandidateProfile");
const Job = require("../models/Job");
const CV = require("../models/CV");
const { calculateJobMatch } = require("../utils/matchCalculator");

const normalizeText = (value) => {
  return String(value || "").toLowerCase().trim();
};

const normalizeSkill = (skill) => {
  return normalizeText(skill)
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
};

const getSkillCategory = (skill) => {
  const normalizedSkill = normalizeSkill(skill);

  const frontendSkills = ["html", "css", "javascript", "react", "typescript", "tailwind", "bootstrap"];
  const backendSkills = ["nodejs", "node js", "express", "api", "rest api", "backend"];
  const databaseSkills = ["mongodb", "mysql", "sql", "postgresql", "database"];
  const toolsSkills = ["git", "github", "docker", "testing", "postman", "ci cd"];

  if (frontendSkills.some((item) => normalizedSkill.includes(item))) {
    return "Frontend Development";
  }

  if (backendSkills.some((item) => normalizedSkill.includes(item))) {
    return "Backend Development";
  }

  if (databaseSkills.some((item) => normalizedSkill.includes(item))) {
    return "Database";
  }

  if (toolsSkills.some((item) => normalizedSkill.includes(item))) {
    return "Tools and Workflow";
  }

  return "General Technical Skill";
};

const getLearningSteps = (skill) => {
  const normalizedSkill = normalizeSkill(skill);

  if (normalizedSkill.includes("react")) {
    return [
      "Revise React components, props, state, and hooks.",
      "Build a small dashboard using API data.",
      "Practice form handling, conditional rendering, and reusable components.",
      "Add one React project to your portfolio."
    ];
  }

  if (normalizedSkill.includes("node")) {
    return [
      "Learn Node.js runtime basics and module system.",
      "Build simple Express routes.",
      "Connect backend routes with MongoDB.",
      "Create one REST API project and test it with Postman."
    ];
  }

  if (normalizedSkill.includes("mongodb")) {
    return [
      "Learn MongoDB document structure and CRUD operations.",
      "Practice Mongoose schemas and models.",
      "Build API endpoints that create, read, update, and delete data.",
      "Connect MongoDB with a full-stack project."
    ];
  }

  if (normalizedSkill.includes("javascript")) {
    return [
      "Revise variables, functions, arrays, objects, and ES6 syntax.",
      "Practice async JavaScript, promises, and fetch API.",
      "Solve small coding problems using JavaScript.",
      "Use JavaScript in a frontend or backend mini project."
    ];
  }

  if (normalizedSkill.includes("html") || normalizedSkill.includes("css")) {
    return [
      "Revise semantic HTML and form elements.",
      "Practice CSS layout using flexbox and grid.",
      "Build responsive landing pages.",
      "Improve UI consistency using reusable styles."
    ];
  }

  if (normalizedSkill.includes("express") || normalizedSkill.includes("api") || normalizedSkill.includes("rest")) {
    return [
      "Understand REST API structure and HTTP methods.",
      "Create Express routes and controllers.",
      "Add validation and error handling.",
      "Test APIs with Postman or PowerShell."
    ];
  }

  if (normalizedSkill.includes("git") || normalizedSkill.includes("github")) {
    return [
      "Practice git add, commit, branch, merge, and push.",
      "Use GitHub for project version control.",
      "Write meaningful commit messages.",
      "Maintain a clean README and project history."
    ];
  }

  return [
    `Learn the basic concepts of ${skill}.`,
    `Practice ${skill} with small examples.`,
    `Use ${skill} in a project task.`,
    `Add evidence of ${skill} to your CV or portfolio.`
  ];
};

const getPriority = (requiredByJobsCount, totalJobs) => {
  if (totalJobs === 0) {
    return "Low";
  }

  const ratio = requiredByJobsCount / totalJobs;

  if (ratio >= 0.6) {
    return "High";
  }

  if (ratio >= 0.3) {
    return "Medium";
  }

  return "Low";
};

const getSkillRoadmapByCandidate = async (req, res) => {
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
        message: "Candidate profile not found. Save your profile before generating a roadmap.",
      });
    }

    const latestCV = await CV.findOne({
      jobSeekerEmail: normalizedEmail,
    }).sort({ createdAt: -1 });

    const jobs = await Job.find({
      status: "open",
    }).sort({ createdAt: -1 });

    const matches = jobs.map((job) => {
      return {
        job,
        match: calculateJobMatch(candidateProfile, job, latestCV),
      };
    });

    matches.sort((a, b) => b.match.totalScore - a.match.totalScore);

    const matchedSkillMap = new Map();
    const missingSkillMap = new Map();

    matches.forEach(({ job, match }) => {
      (match.matchedSkills || []).forEach((skill) => {
        const key = normalizeSkill(skill);

        if (!matchedSkillMap.has(key)) {
          matchedSkillMap.set(key, {
            skill,
            requiredByJobs: [],
          });
        }

        matchedSkillMap.get(key).requiredByJobs.push(job.title);
      });

      (match.missingSkills || []).forEach((skill) => {
        const key = normalizeSkill(skill);

        if (!missingSkillMap.has(key)) {
          missingSkillMap.set(key, {
            skill,
            requiredByJobs: [],
          });
        }

        missingSkillMap.get(key).requiredByJobs.push(job.title);
      });
    });

    const matchedSkills = [...matchedSkillMap.values()].map((item) => ({
      skill: item.skill,
      requiredByJobsCount: item.requiredByJobs.length,
      requiredByJobs: item.requiredByJobs,
    }));

    const roadmap = [...missingSkillMap.values()]
      .map((item) => ({
        skill: item.skill,
        category: getSkillCategory(item.skill),
        priority: getPriority(item.requiredByJobs.length, jobs.length),
        requiredByJobsCount: item.requiredByJobs.length,
        requiredByJobs: item.requiredByJobs,
        learningSteps: getLearningSteps(item.skill),
        suggestedMiniProject: `Build a small project or feature that demonstrates ${item.skill}.`,
      }))
      .sort((a, b) => {
        const priorityWeight = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          priorityWeight[b.priority] - priorityWeight[a.priority] ||
          b.requiredByJobsCount - a.requiredByJobsCount
        );
      });

    const topMatches = matches.slice(0, 5).map(({ job, match }) => ({
      jobId: job._id,
      title: job.title,
      companyName: job.companyName,
      totalScore: match.totalScore,
      missingSkills: match.missingSkills,
      matchedSkills: match.matchedSkills,
    }));

    return res.status(200).json({
      success: true,
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
            usedForRoadmap: Boolean(latestCV.extractedText),
          }
        : null,
      summary: {
        openJobsAnalyzed: jobs.length,
        matchedSkillCount: matchedSkills.length,
        missingSkillCount: roadmap.length,
      },
      matchedSkills,
      roadmap,
      topMatches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate skill roadmap.",
      error: error.message,
    });
  }
};

module.exports = {
  getSkillRoadmapByCandidate,
};
