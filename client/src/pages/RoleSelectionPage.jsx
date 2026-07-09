import { Link } from "react-router-dom";

function RoleSelectionPage() {
  const roles = [
    {
      title: "Job Seeker",
      description: "Create profile, upload CV, apply for jobs, and receive AI career guidance.",
      path: "/login/job-seeker",
    },
    {
      title: "HR / Recruiter",
      description: "Post jobs, review applicants, shortlist candidates, and schedule interviews.",
      path: "/login/hr",
    },
    {
      title: "Admin",
      description: "Manage users, approve HR accounts, monitor jobs, and control platform access.",
      path: "/login/admin",
    },
  ];

  return (
    <main className="page">
      <nav className="navbar">
        <Link to="/" className="brand">Smart Job Seeker</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
        </div>
      </nav>

      <section className="role-section">
        <span className="eyebrow">Select Access Type</span>
        <h1>Choose your role</h1>
        <p>
          Each role will have a separate dashboard, permission level, and login flow.
        </p>

        <div className="role-grid">
          {roles.map((role) => (
            <div className="role-card" key={role.title}>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
              <Link to={role.path} className="primary-button small">
                Continue
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default RoleSelectionPage;
