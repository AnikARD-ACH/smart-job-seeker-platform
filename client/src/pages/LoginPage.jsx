import { useState } from "react";
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

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const requestOtp = async () => {
    try {
      setIsSendingOtp(true);
      setMessage("");
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setMessage("OTP generated. Check backend terminal for the development OTP.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setIsVerifyingOtp(true);
      setMessage("");
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setMessage("OTP verified successfully. Redirecting to dashboard...");
      navigate(currentRole.dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <button
              type="button"
              className="primary-button full-width"
              onClick={requestOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="otp-box">
              <label>OTP Code</label>
              <input
                type="text"
                placeholder="Enter OTP code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="secondary-button full-width"
              onClick={verifyOtp}
              disabled={isVerifyingOtp}
            >
              {isVerifyingOtp ? "Verifying..." : "Continue to Dashboard"}
            </button>
          </form>

          {message && <p className="login-message success-text">{message}</p>}
          {error && <p className="login-message error-text">{error}</p>}

          <p className="login-note">
            Development mode: OTP appears in the backend terminal. Real email delivery will be added later.
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
