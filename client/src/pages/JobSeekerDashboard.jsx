import { Link } from "react-router-dom";

function JobSeekerDashboard() {
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
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Candidate Dashboard</span>
        <h1>Welcome to your career workspace</h1>
        <p>
          Track your profile, CV score, job applications, recommended jobs, and interview preparation tasks.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>CV Match Score</h3>
            <strong>Not uploaded yet</strong>
            <p>Upload your CV to receive AI-based job match analysis.</p>
          </div>
          <div className="dashboard-card">
            <h3>Recommended Jobs</h3>
            <strong>0</strong>
            <p>Jobs will appear after your profile and skills are added.</p>
          </div>
          <div className="dashboard-card">
            <h3>Applications</h3>
            <strong>0</strong>
            <p>Your submitted applications will be tracked here.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default JobSeekerDashboard;
