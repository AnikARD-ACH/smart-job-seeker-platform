import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
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

        setDashboard(dashboardData.dashboard);
        setJobs(jobsData.jobs || []);
        setApplications(applicationsData.applications || []);
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
                <strong>{jobs.length}</strong>
                <p>Jobs posted by this HR account.</p>
              </div>

              <div className="dashboard-card">
                <h3>New Applicants</h3>
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
                  <h2>Applicants for your jobs</h2>
                </div>
                <strong>{applications.length} received</strong>
              </div>

              {applications.length === 0 ? (
                <div className="approval-empty">
                  No applications received yet.
                </div>
              ) : (
                <div className="approval-list">
                  {applications.map((application) => (
                    <div className="approval-card" key={application._id}>
                      <div>
                        <h3>{application.jobTitle}</h3>
                        <p>Candidate: {application.jobSeekerEmail}</p>
                        <p>Company: {application.companyName}</p>
                        <p>Cover Letter: {application.coverLetter || "Not provided"}</p>
                        <p>Applied: {new Date(application.createdAt).toLocaleString()}</p>
                        <p>CV Match Score: {application.cvMatchScore ?? "Not calculated yet"}</p>
                      </div>

                      <strong className="job-status-pill">{application.status}</strong>
                    </div>
                  ))}
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
