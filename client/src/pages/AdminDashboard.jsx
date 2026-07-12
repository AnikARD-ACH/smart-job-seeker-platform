import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load admin dashboard.");
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

  const stats = dashboard?.stats;

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
        <LogoutButton />
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Platform Administration</span>
        <h1>Control users, approvals, and platform security</h1>
        <p>
          Admins approve HR accounts, monitor platform activity, manage access, and supervise system security.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}

        {error && <p className="dashboard-error">{error}</p>}

        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Total Users</h3>
                <strong>{stats?.totalUsers}</strong>
                <p>Total registered users stored in MongoDB.</p>
              </div>

              <div className="dashboard-card">
                <h3>Job Seekers</h3>
                <strong>{stats?.jobSeekers}</strong>
                <p>Total job seeker accounts.</p>
              </div>

              <div className="dashboard-card">
                <h3>HR Users</h3>
                <strong>{stats?.hrUsers}</strong>
                <p>Total HR / recruiter accounts.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Admin Users</h3>
                <strong>{stats?.adminUsers}</strong>
                <p>Total platform administrator accounts.</p>
              </div>

              <div className="dashboard-card">
                <h3>Pending HR Approvals</h3>
                <strong>{stats?.pendingHRApprovals}</strong>
                <p>HR accounts waiting for admin approval.</p>
              </div>

              <div className="dashboard-card">
                <h3>Security Status</h3>
                <strong>{stats?.securityStatus}</strong>
                <p>Admin 2FA and advanced access control will be configured later.</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
