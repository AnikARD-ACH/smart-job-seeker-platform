import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function JobSeekerDashboard() {
  const [dashboard, setDashboard] = useState(null);
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

    fetch(`http://localhost:5000/api/dashboard/job-seeker?email=${encodeURIComponent(auth.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        setDashboard(data.dashboard);
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
                <h3>Recommended Jobs</h3>
                <strong>{stats?.recommendedJobs}</strong>
                <p>Jobs will appear after your profile and skills are added.</p>
              </div>

              <div className="dashboard-card">
                <h3>Applications</h3>
                <strong>{stats?.applications}</strong>
                <p>Your submitted applications will be tracked here.</p>
              </div>

              <div className="dashboard-card">
                <h3>Data Source</h3>
                <strong>MongoDB</strong>
                <p>This dashboard is now loading real backend data.</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default JobSeekerDashboard;
