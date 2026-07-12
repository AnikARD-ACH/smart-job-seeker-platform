import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function JobSeekerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [latestCV, setLatestCV] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);
  const cvFileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isRemovingCV, setIsRemovingCV] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState("");

  const loadDashboardData = () => {
    const storedAuth = localStorage.getItem("smart_job_seeker_auth");

    if (!storedAuth) {
      setError("Login session not found.");
      setIsLoading(false);
      return;
    }

    const auth = JSON.parse(storedAuth);
    const encodedEmail = encodeURIComponent(auth.email);

    Promise.all([
      fetch(`http://localhost:5000/api/dashboard/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch("http://localhost:5000/api/jobs").then((res) => res.json()),
      fetch(`http://localhost:5000/api/applications/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/cv/job-seeker?email=${encodedEmail}`).then((res) => res.json()),
    ])
      .then(([dashboardData, jobsData, applicationsData, cvData]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load jobs.");
        }

        if (!applicationsData.success) {
          throw new Error(applicationsData.message || "Failed to load applications.");
        }

        if (!cvData.success) {
          throw new Error(cvData.message || "Failed to load CV.");
        }

        const openJobs = (jobsData.jobs || []).filter((job) => job.status === "open");

        setDashboard(dashboardData.dashboard);
        setJobs(openJobs);
        setApplications(applicationsData.applications || []);
        setLatestCV(cvData.cv || null);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApply = async (job) => {
    try {
      setMessage("");
      setError("");
      setApplyingJobId(job._id);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job._id,
          jobSeekerEmail: auth.email,
          coverLetter: "I am interested in this role and I believe my skills match the requirements.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      setApplications((currentApplications) => [
        data.application,
        ...currentApplications,
      ]);

      setMessage(`Application submitted for ${job.title}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingJobId("");
    }
  };

  const handleCVUpload = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");
      setIsUploadingCV(true);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      if (!selectedCV) {
        throw new Error("Please select a CV file first.");
      }

      const auth = JSON.parse(storedAuth);

      const formData = new FormData();
      formData.append("jobSeekerEmail", auth.email);
      formData.append("cv", selectedCV);

      const response = await fetch("http://localhost:5000/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload CV.");
      }

      setLatestCV(data.cv);
      setSelectedCV(null);

      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = "";
      }

      setMessage("CV uploaded successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleRemoveCV = async () => {
    try {
      setMessage("");
      setError("");
      setIsRemovingCV(true);

      if (!latestCV?._id) {
        throw new Error("No CV found to remove.");
      }

      const response = await fetch(`http://localhost:5000/api/cv/${latestCV._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove CV.");
      }

      setLatestCV(null);
      setSelectedCV(null);

      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = "";
      }

      setMessage("CV removed successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRemovingCV(false);
    }
  };

  const hasApplied = (jobId) => {
    return applications.some((application) => application.jobId === jobId);
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Not available";
    }

    return status.replace("_", " ");
  };

  const formatFileSize = (sizeBytes) => {
    if (!sizeBytes) {
      return "Not available";
    }

    const sizeInKB = sizeBytes / 1024;

    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(1)} KB`;
    }

    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  };

  const profile = dashboard?.profile;
  const stats = dashboard?.stats;

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
        <LogoutButton />
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Candidate Dashboard</span>
        <h1>Welcome to your career workspace</h1>
        <p>
          Track your profile, CV score, job applications, recommended jobs, and interview preparation tasks.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Profile Email</h3>
                <strong>{profile?.email}</strong>
                <p>Status: {profile?.accountStatus}</p>
              </div>

              <div className="dashboard-card">
                <h3>Email Verification</h3>
                <strong>{profile?.isEmailVerified ? "Verified" : "Not verified"}</strong>
                <p>Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Not available"}</p>
              </div>

              <div className="dashboard-card">
                <h3>CV Status</h3>
                <strong>{latestCV ? "Uploaded" : stats?.cvStatus}</strong>
                <p>{latestCV ? latestCV.originalName : "Upload your CV to receive AI-based job match analysis."}</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Available Jobs</h3>
                <strong>{jobs.length}</strong>
                <p>Open jobs currently posted by HR users.</p>
              </div>

              <div className="dashboard-card">
                <h3>Applications</h3>
                <strong>{applications.length}</strong>
                <p>Your submitted applications are tracked here.</p>
              </div>

              <div className="dashboard-card">
                <h3>Data Source</h3>
                <strong>MongoDB</strong>
                <p>This dashboard is loading real backend job, application, and CV data.</p>
              </div>
            </div>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">CV Upload</span>
                  <h2>Manage your CV</h2>
                </div>
                <strong>{latestCV ? "1 uploaded" : "No CV"}</strong>
              </div>

              <div className="cv-upload-card">
                {latestCV ? (
                  <div>
                    <h3>Latest CV</h3>
                    <p>File: {latestCV.originalName}</p>
                    <p>Status: {latestCV.status}</p>
                    <p>Size: {formatFileSize(latestCV.sizeBytes)}</p>
                    <p>Uploaded: {new Date(latestCV.createdAt).toLocaleString()}</p>

                    <div className="cv-action-row">
                      <a
                        className="view-cv-link"
                        href={`http://localhost:5000/api/cv/${latestCV._id}/file`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View CV
                      </a>

                      <button
                        className="remove-cv-button"
                        type="button"
                        onClick={handleRemoveCV}
                        disabled={isRemovingCV}
                      >
                        {isRemovingCV ? "Removing..." : "Remove CV"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3>No CV uploaded yet</h3>
                    <p>Upload a PDF, DOC, or DOCX CV to prepare for AI-based job matching.</p>
                  </div>
                )}

                <form className="cv-upload-form" onSubmit={handleCVUpload}>
                  <input
                    ref={cvFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setSelectedCV(event.target.files[0])}
                  />

                  <button className="apply-button" type="submit" disabled={isUploadingCV}>
                    {isUploadingCV ? "Uploading..." : "Upload CV"}
                  </button>
                </form>
              </div>
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">My Applications</span>
                  <h2>Track your application statuses</h2>
                </div>
                <strong>{applications.length} submitted</strong>
              </div>

              {applications.length === 0 ? (
                <div className="approval-empty">
                  You have not applied to any jobs yet.
                </div>
              ) : (
                <div className="approval-list">
                  {applications.map((application) => (
                    <div className="approval-card" key={application._id}>
                      <div>
                        <h3>{application.jobTitle}</h3>
                        <p>Company: {application.companyName}</p>
                        <p>HR Email: {application.hrEmail}</p>
                        <p>Applied: {new Date(application.createdAt).toLocaleString()}</p>
                        <p>Cover Letter: {application.coverLetter || "Not provided"}</p>
                        <p>CV Match Score: {application.cvMatchScore ?? "Not calculated yet"}</p>
                        <p>Remarks: {application.remarks || "No remarks yet"}</p>
                      </div>

                      <strong className="job-status-pill">{formatStatus(application.status)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Open Jobs</span>
                  <h2>Jobs you can apply for</h2>
                </div>
                <strong>{jobs.length} available</strong>
              </div>

              {jobs.length === 0 ? (
                <div className="approval-empty">
                  No open jobs available yet.
                </div>
              ) : (
                <div className="approval-list">
                  {jobs.map((job) => {
                    const alreadyApplied = hasApplied(job._id);

                    return (
                      <div className="approval-card" key={job._id}>
                        <div>
                          <h3>{job.title}</h3>
                          <p>Company: {job.companyName}</p>
                          <p>Location: {job.location}</p>
                          <p>Type: {job.jobType}</p>
                          <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                          <p>Skills: {job.requiredSkills?.join(", ")}</p>
                        </div>

                        {alreadyApplied ? (
                          <strong className="job-status-pill">Already Applied</strong>
                        ) : (
                          <button
                            className="apply-button"
                            onClick={() => handleApply(job)}
                            disabled={applyingJobId === job._id}
                          >
                            {applyingJobId === job._id ? "Applying..." : "Apply Now"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default JobSeekerDashboard;
