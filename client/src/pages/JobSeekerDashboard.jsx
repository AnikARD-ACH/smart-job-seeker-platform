import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function JobSeekerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
    ])
      .then(([dashboardData, jobsData, applicationsData]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load jobs.");
        }

        if (!applicationsData.success) {
          throw new Error(applicationsData.message || "Failed to load applications.");
        }

        const openJobs = (jobsData.jobs || []).filter((job) => job.status === "open");

        setDashboard(dashboardData.dashboard);
        setJobs(openJobs);
        setApplications(applicationsData.applications || []);
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

  const hasApplied = (jobId) => {
    return applications.some((application) => application.jobId === jobId);
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Not available";
    }

    return status.replace("_", " ");
  };

  const profile = dashboard?.profile;
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
                <strong>{profile?.email}</strong>
                <p>Status: {profile?.accountStatus}</p>
              </div>

              <div className="dashboard-card">
                <h3>Email Verification</h3>
                <strong>{profile?.isEmailVerified ? "Verified" : "Not verified"}</strong>
                <p>Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Not available"}</p>
              </div>

              <div className="dashboard-card">
                <h3>CV Match Score</h3>
                <strong>{stats?.cvStatus}</strong>
                <p>Upload your CV to receive AI-based job match analysis.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Available Jobs</h3>
                <strong>{jobs.length}</strong>
                <p>Open jobs currently posted by HR users.</p>
              </div>

              <div className="dashboard-card">
                <h3>Applications</h3>
                <strong>{applications.length}</strong>
                <p>Your submitted applications are tracked here.</p>
              </div>

              <div className="dashboard-card">
                <h3>Data Source</h3>
                <strong>MongoDB</strong>
                <p>This dashboard is loading real backend job and application data.</p>
              </div>
            </div>

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
                        <p>CV Match Score: {application.cvMatchScore ?? "Not calculated yet"}</p>
                        <p>Remarks: {application.remarks || "No remarks yet"}</p>
                      </div>

                      <strong className="job-status-pill">{formatStatus(application.status)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Open Jobs</span>
                  <h2>Jobs you can apply for</h2>
                </div>
                <strong>{jobs.length} available</strong>
              </div>

              {jobs.length === 0 ? (
                <div className="approval-empty">
                  No open jobs available yet.
                </div>
              ) : (
                <div className="approval-list">
                  {jobs.map((job) => {
                    const alreadyApplied = hasApplied(job._id);

                    return (
                      <div className="approval-card" key={job._id}>
                        <div>
                          <h3>{job.title}</h3>
                          <p>Company: {job.companyName}</p>
                          <p>Location: {job.location}</p>
                          <p>Type: {job.jobType}</p>
                          <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                          <p>Skills: {job.requiredSkills?.join(", ")}</p>
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
          </>
        )}
      </section>
    </main>
  );
}

export default JobSeekerDashboard;
