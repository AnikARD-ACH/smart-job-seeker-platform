const normalizeText = (value) => {
  return String(value || "").toLowerCase().trim();
};

const normalizeSkill = (skill) => {
  return normalizeText(skill)
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
};

const splitWords = (value) => {
  return normalizeText(value)
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);
};

const isSkillMatched = (candidateSkill, jobSkill) => {
  return (
    candidateSkill === jobSkill ||
    candidateSkill.includes(jobSkill) ||
    jobSkill.includes(candidateSkill)
  );
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
    const isMatched = normalizedCandidateSkills.some((candidateSkill) =>
      isSkillMatched(candidateSkill, jobSkill)
    );

    if (isMatched) {
      matchedSkills.push(jobSkills[index]);
    } else {
      missingSkills.push(jobSkills[index]);
    }
  });

  const score = Math.round((matchedSkills.length / normalizedJobSkills.length) * 50);

  return {
    score,
    matchedSkills,
    missingSkills,
  };
};

const buildCVKeywordList = (job) => {
  const keywordSet = new Set();

  (job?.requiredSkills || []).forEach((skill) => {
    const normalizedSkill = normalizeSkill(skill);

    if (normalizedSkill) {
      keywordSet.add(normalizedSkill);
    }
  });

  splitWords(job?.title).forEach((word) => keywordSet.add(word));
  splitWords(job?.requirements).forEach((word) => keywordSet.add(word));
  splitWords(job?.responsibilities).forEach((word) => keywordSet.add(word));
  splitWords(job?.educationRequirement).forEach((word) => keywordSet.add(word));
  splitWords(job?.experienceLevel).forEach((word) => keywordSet.add(word));

  const noisyWords = new Set([
    "and",
    "the",
    "for",
    "with",
    "this",
    "that",
    "from",
    "will",
    "are",
    "basic",
    "knowledge",
    "candidate",
    "student",
    "graduate",
    "degree",
    "field",
  ]);

  return [...keywordSet].filter((keyword) => !noisyWords.has(keyword));
};

const calculateCVKeywordMatch = (cvText, job) => {
  const normalizedCVText = normalizeText(cvText).replace(/\./g, "");
  const keywords = buildCVKeywordList(job);

  if (!normalizedCVText || keywords.length === 0) {
    return {
      score: 0,
      cvMatchedKeywords: [],
      cvMissingKeywords: keywords,
    };
  }

  const cvMatchedKeywords = [];
  const cvMissingKeywords = [];

  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeSkill(keyword);

    if (
      normalizedCVText.includes(normalizedKeyword) ||
      normalizedCVText.includes(normalizedKeyword.replace(/\s+/g, " "))
    ) {
      cvMatchedKeywords.push(keyword);
    } else {
      cvMissingKeywords.push(keyword);
    }
  });

  const score = Math.round((cvMatchedKeywords.length / keywords.length) * 20);

  return {
    score,
    cvMatchedKeywords,
    cvMissingKeywords,
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

const calculateJobMatch = (candidateProfile, job, latestCV = null) => {
  const skillMatch = calculateSkillMatch(candidateProfile?.skills || [], job?.requiredSkills || []);

  const cvKeywordMatch = calculateCVKeywordMatch(latestCV?.extractedText || "", job);

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

  const totalScore = Math.min(
    100,
    skillMatch.score + cvKeywordMatch.score + jobTypeScore + locationScore
  );

  const cvStatus = latestCV?.status || "not_uploaded";
  const cvUsed = Boolean(latestCV?.extractedText);

  return {
    totalScore,
    skillScore: skillMatch.score,
    cvKeywordScore: cvKeywordMatch.score,
    jobTypeScore,
    locationScore,
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    cvMatchedKeywords: cvKeywordMatch.cvMatchedKeywords,
    cvMissingKeywords: cvKeywordMatch.cvMissingKeywords,
    cvUsed,
    cvStatus,
    explanation: `${totalScore}% match based on profile skills, extracted CV text, job type, and location preference.`,
  };
};

module.exports = {
  calculateJobMatch,
};
