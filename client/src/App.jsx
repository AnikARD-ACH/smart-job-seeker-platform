import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setError("");
      })
      .catch(() => {
        setError("Backend connection failed. Make sure backend server is running on port 5000.");
      });
  }, []);

  return (
    <main className="app-container">
      <section className="hero-card">
        <h1>Smart Job Seeker Platform</h1>
        <p>AI-powered career development, recruitment, and skill intelligence platform.</p>

        <div className="status-box">
          <h2>Backend API Status</h2>

          {health ? (
            <div className="success">
              <p><strong>Status:</strong> {health.status}</p>
              <p><strong>Service:</strong> {health.service}</p>
              <p><strong>Connection:</strong> Successful</p>
            </div>
          ) : (
            <div className="error">
              <p>{error || "Checking backend connection..."}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
