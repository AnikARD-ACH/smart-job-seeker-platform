import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import InAppNotifications from "../components/InAppNotifications";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [pendingHRUsers, setPendingHRUsers] = useState([]);
  const [error, setError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState("");

  const loadAdminDashboard = () => {
    return fetch("http://localhost:5000/api/dashboard/admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load admin dashboard.");
        }

        setDashboard(data.dashboard);
      });
  };

  const loadPendingHRUsers = () => {
    return fetch("http://localhost:5000/api/admin/pending-hr")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load pending HR users.");
        }

        setPendingHRUsers(data.users || []);
      });
  };

  useEffect(() => {
    Promise.all([loadAdminDashboard(), loadPendingHRUsers()])
      .then(() => {
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const approveHRUser = async (userId) => {
    try {
      setApprovingId(userId);
      setApprovalMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/approve-hr/${userId}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve HR account.");
      }

      setApprovalMessage(`${data.user.email} approved successfully.`);

      await Promise.all([loadAdminDashboard(), loadPendingHRUsers()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId("");
    }
  };

  const stats = dashboard?.stats;

  return (
    <main className="dashboard-page">
      <InAppNotifications message={approvalMessage} error={error} />
      <aside className="dashboard-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a>Overview</a>
          <a>HR Approval</a>
          <a>User Control</a>
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


        {approvalMessage && <p className="dashboard-success">{approvalMessage}</p>}

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

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">HR Approval Queue</span>
                  <h2>Pending HR accounts</h2>
                </div>
                <strong>{pendingHRUsers.length} pending</strong>
              </div>

              {pendingHRUsers.length === 0 ? (
                <div className="approval-empty">
                  No pending HR accounts right now.
                </div>
              ) : (
                <div className="approval-list">
                  {pendingHRUsers.map((user) => (
                    <div className="approval-card" key={user._id}>
                      <div>
                        <h3>{user.email}</h3>
                        <p>Status: {user.accountStatus}</p>
                        <p>Company: {user.companyName || "Not added"}</p>
                        <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
                      </div>

                      <button
                        type="button"
                        className="approve-button"
                        onClick={() => approveHRUser(user._id)}
                        disabled={approvingId === user._id}
                      >
                        {approvingId === user._id ? "Approving..." : "Approve HR"}
                      </button>
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

export default AdminDashboard;


