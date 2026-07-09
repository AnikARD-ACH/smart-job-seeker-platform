import { Link, useNavigate, useParams } from "react-router-dom";

const roleInfo = {
  "job-seeker": {
    title: "Job Seeker Login",
    description: "Use email OTP to access your career workspace.",
    dashboard: "/job-seeker/dashboard",
  },
  hr: {
    title: "HR / Recruiter Login",
    description: "HR access requires company approval before full dashboard access.",
    dashboard: "/hr/dashboard",
  },
  admin: {
    title: "Admin Login",
    description: "Admin access will use email OTP plus two-factor authentication.",
    dashboard: "/admin/dashboard",
  },
};

function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const currentRole = roleInfo[role] || roleInfo["job-seeker"];

  return (
    <main className="page">
      <nav className="navbar">
        <Link to="/" className="brand">Smart Job Seeker</Link>
        <div className="nav-links">
          <Link to="/select-role">Change Role</Link>
          <Link to="/">Home</Link>
        </div>
      </nav>

      <section className="login-section">
        <div className="login-card">
          <span className="eyebrow">Secure Access</span>
          <h1>{currentRole.title}</h1>
          <p>{currentRole.description}</p>

          <form className="login-form">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email address" />

            <button type="button" className="primary-button full-width">
              Send OTP
            </button>

            <div className="otp-box">
              <label>OTP Code</label>
              <input type="text" placeholder="Enter OTP code" />
            </div>

            <button
              type="button"
              className="secondary-button full-width"
              onClick={() => navigate(currentRole.dashboard)}
            >
              Continue to Dashboard
            </button>
          </form>

          <p className="login-note">
            This is the frontend login structure. Real OTP verification will be connected with backend later.
          </p>

          <Link to="/select-role" className="login-card-back-button">
            Back to Role Selection
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
