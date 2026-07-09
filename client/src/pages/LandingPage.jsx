import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <main className="page">
      <nav className="navbar">
        <div className="brand">Smart Job Seeker</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/select-role" className="nav-button">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">AI-Powered Recruitment Platform</span>
          <h1>Build your career. Hire smarter. Grow with skill intelligence.</h1>
          <p>
            Smart Job Seeker Platform connects job seekers, HR teams, and administrators
            with AI-based CV matching, assessment generation, interview scheduling,
            and real-time recruitment support.
          </p>

          <div className="hero-actions">
            <Link to="/select-role" className="primary-button">Choose Your Role</Link>
            <a href="#features" className="secondary-button">Explore Features</a>
          </div>
        </div>

        <div className="hero-panel">
          <h3>Platform Status</h3>
          <div className="status-row">
            <span>Frontend</span>
            <strong>Running</strong>
          </div>
          <div className="status-row">
            <span>Backend API</span>
            <strong>Connected</strong>
          </div>
          <div className="status-row">
            <span>Database</span>
            <strong>MongoDB Atlas</strong>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2>Core Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>AI CV Matching</h3>
            <p>Compare candidate CVs with job descriptions and generate match scores.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Hiring Pipeline</h3>
            <p>HR can review, shortlist, add remarks, assign tests, and schedule interviews.</p>
          </div>
          <div className="feature-card">
            <h3>Career Intelligence</h3>
            <p>Job seekers receive skill-gap insights, resume feedback, and preparation support.</p>
          </div>
        </div>
      </section>

      <section className="workflow" id="workflow">
        <h2>Hiring Workflow</h2>
        <p>
          HR posts a job ? candidate applies ? AI checks CV-job match ? HR shortlists ?
          AI generates tests ? interview is scheduled ? final decision is made.
        </p>
      </section>
    </main>
  );
}

export default LandingPage;
