const normalizeText = (value) => {
  return String(value || "").toLowerCase().trim();
};

const normalizeSkill = (skill) => {
  return normalizeText(skill)
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
};

const calculateSkillMatch = (candidateSkills, jobSkills) => {
  const normalizedCandidateSkills = (candidateSkills || []).map(normalizeSkill).filter(Boolean);
  const normalizedJobSkills = (jobSkills || []).map(normalizeSkill).filter(Boolean);

  if (normalizedJobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: jobSkills || [],
    };
  }

  const matchedSkills = [];
  const missingSkills = [];

  normalizedJobSkills.forEach((jobSkill, index) => {
    const isMatched = normalizedCandidateSkills.some((candidateSkill) => {
      return (
        candidateSkill === jobSkill ||
        candidateSkill.includes(jobSkill) ||
        jobSkill.includes(candidateSkill)
      );
    });

    if (isMatched) {
      matchedSkills.push(jobSkills[index]);
    } else {
      missingSkills.push(jobSkills[index]);
    }
  });

  const score = Math.round((matchedSkills.length / normalizedJobSkills.length) * 70);

  return {
    score,
    matchedSkills,
    missingSkills,
  };
};

const calculateJobTypeScore = (preferredJobType, jobType) => {
  const preferred = normalizeText(preferredJobType);
  const job = normalizeText(jobType);

  if (!preferred || !job) {
    return 0;
  }

  if (preferred === job) {
    return 15;
  }

  return 0;
};

const calculateLocationScore = (preferredLocation, jobLocation, preferredJobType, jobType) => {
  const preferred = normalizeText(preferredLocation);
  const job = normalizeText(jobLocation);
  const preferredType = normalizeText(preferredJobType);
  const currentJobType = normalizeText(jobType);

  if (preferredType === "remote" || currentJobType === "remote") {
    return 15;
  }

  if (!preferred || !job) {
    return 0;
  }

  if (
    preferred.includes(job) ||
    job.includes(preferred) ||
    preferred.includes("anywhere") ||
    preferred.includes("remote")
  ) {
    return 15;
  }

  return 0;
};

const calculateJobMatch = (candidateProfile, job) => {
  const skillMatch = calculateSkillMatch(candidateProfile?.skills || [], job?.requiredSkills || []);

  const jobTypeScore = calculateJobTypeScore(
    candidateProfile?.preferredJobType,
    job?.jobType
  );

  const locationScore = calculateLocationScore(
    candidateProfile?.preferredLocation,
    job?.location,
    candidateProfile?.preferredJobType,
    job?.jobType
  );

  const totalScore = Math.min(100, skillMatch.score + jobTypeScore + locationScore);

  return {
    totalScore,
    skillScore: skillMatch.score,
    jobTypeScore,
    locationScore,
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    explanation: `${totalScore}% match based on skills, job type, and location preference.`,
  };
};

module.exports = {
  calculateJobMatch,
};
