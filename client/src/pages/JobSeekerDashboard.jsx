import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const emptyProfileForm = {
  fullName: "",
  phone: "",
  location: "",
  education: "",
  experienceLevel: "",
  skills: "",
  preferredJobType: "",
  preferredLocation: "",
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  bio: "",
};

function JobSeekerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [jobs, setJobs] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [latestCV, setLatestCV] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);
  const cvFileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isRemovingCV, setIsRemovingCV] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState("");

  const loadDashboardData = () => {
    const storedAuth = localStorage.getItem("smart_job_seeker_auth");

    if (!storedAuth) {
      setError("Login session not found.");
      setIsLoading(false);
      return;
    }

    const auth = JSON.parse(storedAuth);
    const encodedEmail = encodeURIComponent(auth.email);

    Promise.all([
      fetch(`http://localhost:5000/api/dashboard/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch("http://localhost:5000/api/jobs").then((res) => res.json()),
      fetch(`http://localhost:5000/api/applications/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/cv/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/candidate-profile/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/matches/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/roadmap/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
    ])
      .then(([dashboardData, jobsData, applicationsData, cvData, candidateProfileData, matchesData, roadmapResponse]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load jobs.");
        }

        if (!applicationsData.success) {
          throw new Error(applicationsData.message || "Failed to load applications.");
        }

        if (!cvData.success) {
          throw new Error(cvData.message || "Failed to load CV.");
        }

        if (!candidateProfileData.success) {
          throw new Error(candidateProfileData.message || "Failed to load candidate profile.");
        }

        if (!matchesData.success && !matchesData.message?.includes("Candidate profile not found")) {
          throw new Error(matchesData.message || "Failed to load job matches.");
        }

        if (!roadmapResponse.success && !roadmapResponse.message?.includes("Candidate profile not found")) {
          throw new Error(roadmapResponse.message || "Failed to load skill roadmap.");
        }

        const openJobs = (jobsData.jobs || []).filter((job) => job.status === "open");
        const loadedProfile = candidateProfileData.profile;

        setDashboard(dashboardData.dashboard);
        setJobs(openJobs);
        setJobMatches(matchesData.success ? matchesData.matches || [] : []);
        setRoadmapData(roadmapResponse.success ? roadmapResponse : null);
        setApplications(applicationsData.applications || []);
        setLatestCV(cvData.cv || null);
        setCandidateProfile(loadedProfile || null);

        if (loadedProfile) {
          setProfileForm({
            fullName: loadedProfile.fullName || "",
            phone: loadedProfile.phone || "",
            location: loadedProfile.location || "",
            education: loadedProfile.education || "",
            experienceLevel: loadedProfile.experienceLevel || "",
            skills: (loadedProfile.skills || []).join(", "),
            preferredJobType: loadedProfile.preferredJobType || "",
            preferredLocation: loadedProfile.preferredLocation || "",
            portfolioUrl: loadedProfile.portfolioUrl || "",
            githubUrl: loadedProfile.githubUrl || "",
            linkedinUrl: loadedProfile.linkedinUrl || "",
            bio: loadedProfile.bio || "",
          });
        }

        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");
      setIsSavingProfile(true);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const response = await fetch("http://localhost:5000/api/candidate-profile/job-seeker", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobSeekerEmail: auth.email,
          ...profileForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save candidate profile.");
      }

      setCandidateProfile(data.profile);
      setProfileForm({
        fullName: data.profile.fullName || "",
        phone: data.profile.phone || "",
        location: data.profile.location || "",
        education: data.profile.education || "",
        experienceLevel: data.profile.experienceLevel || "",
        skills: (data.profile.skills || []).join(", "),
        preferredJobType: data.profile.preferredJobType || "",
        preferredLocation: data.profile.preferredLocation || "",
        portfolioUrl: data.profile.portfolioUrl || "",
        githubUrl: data.profile.githubUrl || "",
        linkedinUrl: data.profile.linkedinUrl || "",
        bio: data.profile.bio || "",
      });

      setMessage("Candidate profile saved successfully.");
      loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleApply = async (job) => {
    try {
      setMessage("");
      setError("");
      setApplyingJobId(job._id);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job._id,
          jobSeekerEmail: auth.email,
          coverLetter: "I am interested in this role and I believe my skills match the requirements.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      setApplications((currentApplications) => [
        data.application,
        ...currentApplications,
      ]);

      setMessage(`Application submitted for ${job.title}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingJobId("");
    }
  };

  const handleCVUpload = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");
      setIsUploadingCV(true);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      if (!selectedCV) {
        throw new Error("Please select a CV file first.");
      }

      const auth = JSON.parse(storedAuth);

      const formData = new FormData();
      formData.append("jobSeekerEmail", auth.email);
      formData.append("cv", selectedCV);

      const response = await fetch("http://localhost:5000/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload CV.");
      }

      setLatestCV(data.cv);
      setSelectedCV(null);

      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = "";
      }

      setMessage("CV uploaded successfully.");
      loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleRemoveCV = async () => {
    try {
      setMessage("");
      setError("");
      setIsRemovingCV(true);

      if (!latestCV?._id) {
        throw new Error("No CV found to remove.");
      }

      const response = await fetch(`http://localhost:5000/api/cv/${latestCV._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove CV.");
      }

      setLatestCV(null);
      setSelectedCV(null);

      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = "";
      }

      setMessage("CV removed successfully.");
      loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRemovingCV(false);
    }
  };

  const hasApplied = (jobId) => {
    return applications.some((application) => application.jobId === jobId);
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Not available";
    }

    return status.replace("_", " ");
  };

  const formatFileSize = (sizeBytes) => {
    if (!sizeBytes) {
      return "Not available";
    }

    const sizeInKB = sizeBytes / 1024;

    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(1)} KB`;
    }

    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  };

  const dashboardProfile = dashboard?.profile;
  const stats = dashboard?.stats;

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <h2>Job Seeker</h2>
        <nav>
          <a>Overview</a>
          <a>My Profile</a>
          <a>Upload CV</a>
          <a>Job Matches</a>
          <a>Applications</a>
          <a>Interview Prep</a>
        </nav>
        <LogoutButton />
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Candidate Dashboard</span>
        <h1>Welcome to your career workspace</h1>
        <p>
          Track your profile, CV score, job applications, recommended jobs, and interview preparation tasks.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Profile Email</h3>
                <strong>{dashboardProfile?.email}</strong>
                <p>Status: {dashboardProfile?.accountStatus}</p>
              </div>

              <div className="dashboard-card">
                <h3>Candidate Name</h3>
                <strong>{candidateProfile?.fullName || "Not added"}</strong>
                <p>Experience: {candidateProfile?.experienceLevel || "Not added"}</p>
              </div>

              <div className="dashboard-card">
                <h3>CV Status</h3>
                <strong>{latestCV ? "Uploaded" : stats?.cvStatus}</strong>
                <p>{latestCV ? latestCV.originalName : "Upload your CV to receive AI-based job match analysis."}</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Available Jobs</h3>
                <strong>{jobs.length}</strong>
                <p>Open jobs currently posted by HR users.</p>
              </div>

              <div className="dashboard-card">
                <h3>Job Matches</h3>
                <strong>{jobMatches.length}</strong>
                <p>AI-style match scores based on your profile, extracted CV text, and job requirements.</p>
              </div>

              <div className="dashboard-card">
                <h3>Applications</h3>
                <strong>{applications.length}</strong>
                <p>Your submitted applications are tracked here.</p>
              </div>
            </div>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Candidate Profile</span>
                  <h2>Update your career profile</h2>
                </div>
                <strong>{candidateProfile ? "Saved" : "Not saved"}</strong>
              </div>

              <form className="profile-form" onSubmit={handleProfileSave}>
                <div className="profile-form-grid">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      placeholder="Anik Rahman"
                    />
                  </div>

                  <div className="form-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="01700000000"
                    />
                  </div>

                  <div className="form-field">
                    <label>Location</label>
                    <input
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>

                  <div className="form-field">
                    <label>Education</label>
                    <input
                      name="education"
                      value={profileForm.education}
                      onChange={handleProfileChange}
                      placeholder="Bachelor student in CSE/MIS"
                    />
                  </div>

                  <div className="form-field">
                    <label>Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={profileForm.experienceLevel}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select experience level</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Lead / Manager">Lead / Manager</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Preferred Job Type</label>
                    <select
                      name="preferredJobType"
                      value={profileForm.preferredJobType}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select job type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Preferred Location</label>
                    <input
                      name="preferredLocation"
                      value={profileForm.preferredLocation}
                      onChange={handleProfileChange}
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>

                  <div className="form-field">
                    <label>Skills</label>
                    <input
                      name="skills"
                      value={profileForm.skills}
                      onChange={handleProfileChange}
                      placeholder="HTML, CSS, JavaScript, React"
                    />
                  </div>

                  <div className="form-field">
                    <label>Portfolio URL</label>
                    <input
                      name="portfolioUrl"
                      value={profileForm.portfolioUrl}
                      onChange={handleProfileChange}
                      placeholder="https://portfolio.example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label>GitHub URL</label>
                    <input
                      name="githubUrl"
                      value={profileForm.githubUrl}
                      onChange={handleProfileChange}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="form-field">
                    <label>LinkedIn URL</label>
                    <input
                      name="linkedinUrl"
                      value={profileForm.linkedinUrl}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Write a short career summary..."
                  />
                </div>

                <button className="apply-button" type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">CV Upload</span>
                  <h2>Manage your CV</h2>
                </div>
                <strong>{latestCV ? "1 uploaded" : "No CV"}</strong>
              </div>

              <div className="cv-upload-card">
                {latestCV ? (
                  <div>
                    <h3>Latest CV</h3>
                    <p>File: {latestCV.originalName}</p>
                    <p>Status: {latestCV.status}</p>
                    <p>Size: {formatFileSize(latestCV.sizeBytes)}</p>
                    <p>Uploaded: {new Date(latestCV.createdAt).toLocaleString()}</p>

                    <div className="cv-action-row">
                      <a
                        className="view-cv-link"
                        href={`http://localhost:5000/api/cv/${latestCV._id}/file`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View CV
                      </a>

                      <button
                        className="remove-cv-button"
                        type="button"
                        onClick={handleRemoveCV}
                        disabled={isRemovingCV}
                      >
                        {isRemovingCV ? "Removing..." : "Remove CV"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3>No CV uploaded yet</h3>
                    <p>Upload a PDF, DOC, or DOCX CV to prepare for AI-based job matching.</p>
                  </div>
                )}

                <form className="cv-upload-form" onSubmit={handleCVUpload}>
                  <input
                    ref={cvFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setSelectedCV(event.target.files[0])}
                  />

                  <button className="apply-button" type="submit" disabled={isUploadingCV}>
                    {isUploadingCV ? "Uploading..." : "Upload CV"}
                  </button>
                </form>
              </div>
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Job Matches</span>
                  <h2>Recommended jobs based on your profile and CV</h2>
                </div>
                <strong>{jobMatches.length} matches</strong>
              </div>

              {jobMatches.length === 0 ? (
                <div className="approval-empty">
                  Save your candidate profile to generate job matches.
                </div>
              ) : (
                <div className="approval-list">
                  {jobMatches.map(({ job, match }) => {
                    const alreadyApplied = hasApplied(job._id);

                    return (
                      <div className="approval-card match-card" key={job._id}>
                        <div>
                          <div className="match-summary-row">
                            <h3>{job.title}</h3>
                            <strong className="match-score-badge">{match.totalScore}% Match</strong>
                          </div>

                          <p>Company: {job.companyName}</p>
                          <p>Location: {job.location}</p>
                          <p>Type: {job.jobType}</p>
                          <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                          <p>{match.explanation}</p>

                          <div className="match-breakdown-grid">
                            <div>
                              <span>Profile skills</span>
                              <strong>{match.skillScore ?? 0}/50</strong>
                            </div>

                            <div>
                              <span>CV keywords</span>
                              <strong>{match.cvKeywordScore ?? 0}/20</strong>
                            </div>

                            <div>
                              <span>Job type</span>
                              <strong>{match.jobTypeScore ?? 0}/15</strong>
                            </div>

                            <div>
                              <span>Location</span>
                              <strong>{match.locationScore ?? 0}/15</strong>
                            </div>
                          </div>

                          <p>
                            CV used in scoring:{" "}
                            {match.cvUsed ? `Yes (${match.cvStatus})` : "No readable CV text found"}
                          </p>

                          <div className="skill-pill-section">
                            <p>Matched Skills:</p>
                            <div className="skill-pill-list">
                              {match.matchedSkills.length === 0 ? (
                                <span className="skill-pill missing">None</span>
                              ) : (
                                match.matchedSkills.map((skill) => (
                                  <span className="skill-pill" key={skill}>{skill}</span>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="skill-pill-section">
                            <p>Missing Skills:</p>
                            <div className="skill-pill-list">
                              {match.missingSkills.length === 0 ? (
                                <span className="skill-pill">None</span>
                              ) : (
                                match.missingSkills.map((skill) => (
                                  <span className="skill-pill missing" key={skill}>{skill}</span>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="skill-pill-section">
                            <p>CV Matched Keywords:</p>
                            <div className="skill-pill-list">
                              {!match.cvMatchedKeywords || match.cvMatchedKeywords.length === 0 ? (
                                <span className="skill-pill missing">None</span>
                              ) : (
                                match.cvMatchedKeywords.slice(0, 12).map((keyword) => (
                                  <span className="skill-pill" key={keyword}>{keyword}</span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {alreadyApplied ? (
                          <strong className="job-status-pill">Already Applied</strong>
                        ) : (
                          <button
                            className="apply-button"
                            onClick={() => handleApply(job)}
                            disabled={applyingJobId === job._id}
                          >
                            {applyingJobId === job._id ? "Applying..." : "Apply Now"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Skill Gap Roadmap</span>
                  <h2>Improve your readiness for matching jobs</h2>
                </div>
                <strong>{roadmapData?.summary?.missingSkillCount ?? 0} gaps</strong>
              </div>

              {!roadmapData ? (
                <div className="approval-empty">
                  Save your candidate profile to generate a skill roadmap.
                </div>
              ) : (
                <div className="roadmap-panel">
                  <div className="roadmap-summary-grid">
                    <div className="roadmap-card">
                      <span>Open jobs analysed</span>
                      <strong>{roadmapData.summary?.openJobsAnalyzed ?? 0}</strong>
                    </div>

                    <div className="roadmap-card">
                      <span>Matched skills</span>
                      <strong>{roadmapData.summary?.matchedSkillCount ?? 0}</strong>
                    </div>

                    <div className="roadmap-card">
                      <span>Missing skills</span>
                      <strong>{roadmapData.summary?.missingSkillCount ?? 0}</strong>
                    </div>

                    <div className="roadmap-card">
                      <span>CV used</span>
                      <strong>{roadmapData.cv?.usedForRoadmap ? "Yes" : "No"}</strong>
                    </div>
                  </div>

                  <div className="skill-pill-section">
                    <p>Matched Skills Across Current Jobs:</p>
                    <div className="skill-pill-list">
                      {roadmapData.matchedSkills?.length === 0 ? (
                        <span className="skill-pill missing">None</span>
                      ) : (
                        roadmapData.matchedSkills?.slice(0, 12).map((item) => (
                          <span className="skill-pill" key={item.skill}>
                            {item.skill} ({item.requiredByJobsCount})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {roadmapData.roadmap?.length === 0 ? (
                    <div className="roadmap-empty-success">
                      No major required-skill gap found for the current open jobs.
                      Keep improving your existing skills and add stronger project evidence to your CV.
                    </div>
                  ) : (
                    <div className="roadmap-list">
                      {roadmapData.roadmap?.map((item) => (
                        <div className="roadmap-item" key={item.skill}>
                          <div className="approval-header">
                            <div>
                              <h3>{item.skill}</h3>
                              <p>{item.category}</p>
                            </div>
                            <strong>{item.priority} Priority</strong>
                          </div>

                          <p>Required by {item.requiredByJobsCount} open job(s).</p>
                          <p>Suggested mini project: {item.suggestedMiniProject}</p>

                          <ol className="learning-step-list">
                            {item.learningSteps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="roadmap-match-list">
                    <h3>Top job readiness snapshot</h3>

                    {roadmapData.topMatches?.map((match) => (
                      <div className="roadmap-match-card" key={match.jobId}>
                        <strong>{match.title}</strong>
                        <span>{match.companyName}</span>
                        <p>{match.totalScore}% match</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">My Applications</span>
                  <h2>Track your application statuses</h2>
                </div>
                <strong>{applications.length} submitted</strong>
              </div>

              {applications.length === 0 ? (
                <div className="approval-empty">
                  You have not applied to any jobs yet.
                </div>
              ) : (
                <div className="approval-list">
                  {applications.map((application) => (
                    <div className="approval-card" key={application._id}>
                      <div>
                        <h3>{application.jobTitle}</h3>
                        <p>Company: {application.companyName}</p>
                        <p>HR Email: {application.hrEmail}</p>
                        <p>Applied: {new Date(application.createdAt).toLocaleString()}</p>
                        <p>Cover Letter: {application.coverLetter || "Not provided"}</p>
                        <p>Profile + CV Match Score: {application.cvMatchScore ?? "Not calculated yet"}</p>
                        <p>Remarks: {application.remarks || "No remarks yet"}</p>
                      </div>

                      <strong className="job-status-pill">{formatStatus(application.status)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default JobSeekerDashboard;


