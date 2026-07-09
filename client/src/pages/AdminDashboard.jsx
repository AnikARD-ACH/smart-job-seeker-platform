import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a>Overview</a>
          <a>User Control</a>
          <a>HR Approval</a>
          <a>Job Monitoring</a>
          <a>Security</a>
          <a>Reports</a>
        </nav>
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Platform Administration</span>
        <h1>Control users, approvals, and platform security</h1>
        <p>
          Admins approve HR accounts, monitor platform activity, manage access, and supervise system security.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Users</h3>
            <strong>0</strong>
            <p>User statistics will appear after authentication is added.</p>
          </div>
          <div className="dashboard-card">
            <h3>Pending HR Approvals</h3>
            <strong>0</strong>
            <p>Company and recruiter approval requests will appear here.</p>
          </div>
          <div className="dashboard-card">
            <h3>Security Status</h3>
            <strong>Ready</strong>
            <p>Admin 2FA and access control will be configured in authentication phase.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
