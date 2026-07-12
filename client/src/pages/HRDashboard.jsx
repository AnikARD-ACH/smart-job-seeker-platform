import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function HRDashboard() {
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

    fetch(`http://localhost:5000/api/dashboard/hr?email=${encodeURIComponent(auth.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load HR dashboard.");
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
        <h2>HR Panel</h2>
        <nav>
          <a>Overview</a>
          <a>Post Job</a>
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
          Post jobs, review applicants, check CV-job match scores, assign tests, and schedule interviews.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}

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
                <p>Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Not available"}</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Open Jobs</h3>
                <strong>{stats?.openJobs}</strong>
                <p>Create job posts with skills, salary, deadline, and selection stages.</p>
              </div>

              <div className="dashboard-card">
                <h3>New Applicants</h3>
                <strong>{stats?.newApplicants}</strong>
                <p>Applicant lists and AI match scores will appear here.</p>
              </div>

              <div className="dashboard-card">
                <h3>Scheduled Interviews</h3>
                <strong>{stats?.scheduledInterviews}</strong>
                <p>Google Calendar and video interview sessions will be managed here.</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default HRDashboard;