import { Link } from "react-router-dom";

function HRDashboard() {
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
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Recruiter Dashboard</span>
        <h1>Manage hiring with AI support</h1>
        <p>
          Post jobs, review applicants, check CV-job match scores, assign tests, and schedule interviews.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Open Jobs</h3>
            <strong>0</strong>
            <p>Create job posts with skills, salary, deadline, and selection stages.</p>
          </div>
          <div className="dashboard-card">
            <h3>New Applicants</h3>
            <strong>0</strong>
            <p>Applicant lists and AI match scores will appear here.</p>
          </div>
          <div className="dashboard-card">
            <h3>Scheduled Interviews</h3>
            <strong>0</strong>
            <p>Google Calendar and video interview sessions will be managed here.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HRDashboard;
