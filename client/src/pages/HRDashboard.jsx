import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [minScoreFilter, setMinScoreFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const storedAuth = localStorage.getItem("smart_job_seeker_auth");

    if (!storedAuth) {
      setError("Login session not found.");
      setIsLoading(false);
      return;
    }

    const auth = JSON.parse(storedAuth);
    const encodedEmail = encodeURIComponent(auth.email);

    Promise.all([
      fetch(`http://localhost:5000/api/dashboard/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/jobs/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/applications/hr?email=${encodedEmail}`).then((res) => res.json()),
    ])
      .then(([dashboardData, jobsData, applicationsData]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load HR dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load HR jobs.");
        }

        if (!applicationsData.success) {
          throw new Error(applicationsData.message || "Failed to load HR applications.");
        }

        const loadedApplications = applicationsData.applications || [];

        setDashboard(dashboardData.dashboard);
        setJobs(jobsData.jobs || []);
        setApplications(loadedApplications);

        if (loadedApplications.length > 0) {
          setSelectedApplicationId(loadedApplications[0]._id);
        }

        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateApplicationStatus = async (applicationId, status, remarks) => {
    try {
      setMessage("");
      setError("");
      setUpdatingApplicationId(applicationId);

      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update application status.");
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId ? data.application : application
        )
      );

      setSelectedApplicationId(applicationId);
      setMessage(`Application status updated to ${formatStatus(status)}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingApplicationId("");
    }
  };

  const formatStatus = (status) => {
    return String(status || "")
      .replace(/_/g, " ")
      .toUpperCase();
  };

  const getScoreLabel = (score) => {
    return typeof score === "number" ? `${score}%` : "Not calculated";
  };

  const getStatusCount = (status) => {
    return applications.filter((application) => application.status === status).length;
  };

  const uniqueJobTitles = useMemo(() => {
    return [...new Set(applications.map((application) => application.jobTitle).filter(Boolean))];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter((application) => application.status === statusFilter);
    }

    if (jobFilter !== "all") {
      result = result.filter((application) => application.jobTitle === jobFilter);
    }

    if (minScoreFilter !== "all") {
      const minimumScore = Number(minScoreFilter);

      result = result.filter((application) => {
        const score = typeof application.cvMatchScore === "number" ? application.cvMatchScore : -1;
        return score >= minimumScore;
      });
    }

    result.sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOption === "highest-score") {
        return (b.cvMatchScore ?? -1) - (a.cvMatchScore ?? -1);
      }

      if (sortOption === "lowest-score") {
        return (a.cvMatchScore ?? 999) - (b.cvMatchScore ?? 999);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [applications, statusFilter, jobFilter, minScoreFilter, sortOption]);

  const selectedApplication =
    filteredApplications.find((application) => application._id === selectedApplicationId) ||
    filteredApplications[0] ||
    null;

  const profile = dashboard?.profile;
  const stats = dashboard?.stats;

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <h2>HR Panel</h2>
        <nav>
          <a>Overview</a>
          <Link to="/hr/post-job">Post Job</Link>
          <a>Applicants</a>
          <a>Shortlist</a>
          <a>Assessments</a>
          <a>Interviews</a>
        </nav>
        <LogoutButton />
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Recruiter Dashboard</span>
        <h1>Manage hiring with AI support</h1>
        <p>
          Post jobs, review applicants, check profile-plus-CV match scores, assign tests, and schedule interviews.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>HR Email</h3>
                <strong>{profile?.email}</strong>
                <p>Status: {profile?.accountStatus}</p>
              </div>

              <div className="dashboard-card">
                <h3>Company</h3>
                <strong>{profile?.companyName || "Not added"}</strong>
                <p>Website: {profile?.companyWebsite || "Not added"}</p>
              </div>

              <div className="dashboard-card">
                <h3>Email Verification</h3>
                <strong>{profile?.isEmailVerified ? "Verified" : "Not verified"}</strong>
                <p>
                  Last login:{" "}
                  {profile?.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Open Jobs</h3>
                <strong>{jobs.length}</strong>
                <p>Jobs posted by this HR account.</p>
              </div>

              <div className="dashboard-card">
                <h3>Total Applicants</h3>
                <strong>{applications.length}</strong>
                <p>Applications received for this HR account.</p>
              </div>

              <div className="dashboard-card">
                <h3>Scheduled Interviews</h3>
                <strong>{stats?.scheduledInterviews}</strong>
                <p>Google Calendar and video interview sessions will be managed here.</p>
              </div>
            </div>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Received Applications</span>
                  <h2>Applicant review center</h2>
                </div>
                <strong>{filteredApplications.length} shown / {applications.length} total</strong>
              </div>

              <div className="status-summary-grid">
                <div className="mini-stat-card">
                  <strong>{getStatusCount("reviewing")}</strong>
                  <span>Reviewing</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("shortlisted")}</strong>
                  <span>Shortlisted</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("interview_scheduled")}</strong>
                  <span>Interview</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("hired")}</strong>
                  <span>Hired</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("rejected")}</strong>
                  <span>Rejected</span>
                </div>
              </div>

              <div className="filter-panel">
                <div className="filter-grid">
                  <label className="filter-field">
                    <span>Status</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview scheduled</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Job</span>
                    <select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)}>
                      <option value="all">All jobs</option>
                      {uniqueJobTitles.map((jobTitle) => (
                        <option value={jobTitle} key={jobTitle}>
                          {jobTitle}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Minimum profile + CV score</span>
                    <select value={minScoreFilter} onChange={(event) => setMinScoreFilter(event.target.value)}>
                      <option value="all">Any score</option>
                      <option value="50">50% and above</option>
                      <option value="70">70% and above</option>
                      <option value="85">85% and above</option>
                      <option value="90">90% and above</option>
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Sort</span>
                    <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest-score">Highest score first</option>
                      <option value="lowest-score">Lowest score first</option>
                    </select>
                  </label>
                </div>

                <button
                  className="secondary-action-button"
                  onClick={() => {
                    setStatusFilter("all");
                    setJobFilter("all");
                    setMinScoreFilter("all");
                    setSortOption("newest");
                  }}
                >
                  Reset filters
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="approval-empty">
                  No applications received yet.
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="approval-empty">
                  No applicants match the selected filters.
                </div>
              ) : (
                <div className="applicant-review-layout">
                  <div className="applicant-list">
                    {filteredApplications.map((application) => (
                      <button
                        type="button"
                        className={`applicant-list-item ${
                          selectedApplication?._id === application._id ? "active" : ""
                        }`}
                        key={application._id}
                        onClick={() => setSelectedApplicationId(application._id)}
                      >
                        <div>
                          <strong>{application.jobTitle}</strong>
                          <span>{application.jobSeekerEmail}</span>
                        </div>

                        <div className="applicant-meta-row">
                          <span>{formatStatus(application.status)}</span>
                          <strong>{getScoreLabel(application.cvMatchScore)}</strong>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedApplication && (
                    <div className="applicant-detail-card">
                      <div className="approval-header">
                        <div>
                          <span className="eyebrow">Applicant Details</span>
                          <h2>{selectedApplication.jobTitle}</h2>
                        </div>

                        <strong className="job-status-pill">
                          {formatStatus(selectedApplication.status)}
                        </strong>
                      </div>

                      <div className="score-large">
                        <span>Profile + CV Match Score</span>
                        <strong>{getScoreLabel(selectedApplication.cvMatchScore)}</strong>
                      </div>

                      <div className="detail-grid">
                        <div>
                          <span>Candidate Email</span>
                          <strong>{selectedApplication.jobSeekerEmail}</strong>
                        </div>

                        <div>
                          <span>Company</span>
                          <strong>{selectedApplication.companyName}</strong>
                        </div>

                        <div>
                          <span>Applied</span>
                          <strong>{new Date(selectedApplication.createdAt).toLocaleString()}</strong>
                        </div>

                        <div>
                          <span>Application Status</span>
                          <strong>{formatStatus(selectedApplication.status)}</strong>
                        </div>
                      </div>

                      <div className="detail-block">
                        <h3>Cover Letter</h3>
                        <p>{selectedApplication.coverLetter || "Not provided"}</p>
                      </div>

                      <div className="detail-block">
                        <h3>HR Remarks</h3>
                        <p>{selectedApplication.remarks || "No remarks yet"}</p>
                      </div>

                      <div className="detail-block">
                        <h3>Scoring Note</h3>
                        <p>
                          This score now combines candidate profile skills, extracted CV text,
                          preferred job type, and preferred location.
                        </p>
                      </div>

                      <div className="status-action-row">
                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "reviewing",
                              "Application is now under HR review."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Reviewing
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "shortlisted",
                              "Candidate has been shortlisted for the next stage."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "rejected",
                              "Candidate was not selected for this role."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "interview_scheduled",
                              "Candidate has been moved to interview scheduling."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Interview
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "hired",
                              "Candidate has been marked as hired."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Hire
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Posted Jobs</span>
                  <h2>Your job posts</h2>
                </div>
                <strong>{jobs.length} open</strong>
              </div>

              {jobs.length === 0 ? (
                <div className="approval-empty">
                  No jobs posted yet.
                </div>
              ) : (
                <div className="approval-list">
                  {jobs.map((job) => (
                    <div className="approval-card" key={job._id}>
                      <div>
                        <h3>{job.title}</h3>
                        <p>Company: {job.companyName}</p>
                        <p>Location: {job.location}</p>
                        <p>Type: {job.jobType}</p>
                        <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                        <p>Skills: {job.requiredSkills?.join(", ")}</p>
                      </div>

                      <strong className="job-status-pill">{job.status}</strong>
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

export default HRDashboard;

