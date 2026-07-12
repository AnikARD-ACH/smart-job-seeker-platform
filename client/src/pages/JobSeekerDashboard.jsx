import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function JobSeekerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      fetch(`http://localhost:5000/api/dashboard/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch("http://localhost:5000/api/jobs").then((res) => res.json()),
    ])
      .then(([dashboardData, jobsData]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load jobs.");
        }

        const openJobs = (jobsData.jobs || []).filter((job) => job.status === "open");

        setDashboard(dashboardData.dashboard);
        setJobs(openJobs);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
                <strong>{stats?.applications}</strong>
                <p>Your submitted applications will be tracked here.</p>
              </div>

              <div className="dashboard-card">
                <h3>Data Source</h3>
                <strong>MongoDB</strong>
                <p>This dashboard is loading real backend job data.</p>
              </div>
            </div>

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

                      <strong className="job-status-pill">Apply Soon</strong>
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
