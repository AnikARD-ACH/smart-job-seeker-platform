import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import InAppNotifications from "../components/InAppNotifications";

function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");
  const [assigningAssessmentType, setAssigningAssessmentType] = useState("");
  const [reviewingAssessmentId, setReviewingAssessmentId] = useState("");
  const [assessmentReviews, setAssessmentReviews] = useState({});
  const [schedulingInterviewId, setSchedulingInterviewId] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [minScoreFilter, setMinScoreFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const storedAuth = localStorage.getItem("smart_job_seeker_auth");

    if (!storedAuth) {
      setError("Login session not found.");
      setIsLoading(false);
      return;
    }

    const auth = JSON.parse(storedAuth);
    const encodedEmail = encodeURIComponent(auth.email);

    Promise.all([
      fetch(`http://localhost:5000/api/dashboard/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/jobs/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/applications/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/assessments/hr?email=${encodedEmail}`).then((res) => res.json()),
      fetch(`http://localhost:5000/api/interviews/hr?email=${encodedEmail}`).then((res) => res.json()),
    ])
      .then(([dashboardData, jobsData, applicationsData, assessmentsData, interviewsData]) => {
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load HR dashboard.");
        }

        if (!jobsData.success) {
          throw new Error(jobsData.message || "Failed to load HR jobs.");
        }

        if (!applicationsData.success) {
          throw new Error(applicationsData.message || "Failed to load HR applications.");
        }

        if (!assessmentsData.success) {
          throw new Error(assessmentsData.message || "Failed to load HR assessments.");
        }

        if (!interviewsData.success) {
          throw new Error(interviewsData.message || "Failed to load HR interviews.");
        }

        const loadedApplications = applicationsData.applications || [];

        setDashboard(dashboardData.dashboard);
        setJobs(jobsData.jobs || []);
        setApplications(loadedApplications);
        setAssessments(assessmentsData.assessments || []);
        setInterviews(interviewsData.interviews || []);

        if (loadedApplications.length > 0) {
          setSelectedApplicationId(loadedApplications[0]._id);
        }

        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateApplicationStatus = async (applicationId, status, remarks) => {
    try {
      setMessage("");
      setError("");
      setUpdatingApplicationId(applicationId);

      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update application status.");
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId ? data.application : application
        )
      );

      setSelectedApplicationId(applicationId);
      setMessage(`Application status updated to ${formatStatus(status)}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingApplicationId("");
    }
  };

  const formatStatus = (status) => {
    return String(status || "")
      .replace(/_/g, " ")
      .toUpperCase();
  };

  const assignAssessment = async (application, assessmentType) => {
    try {
      setMessage("");
      setError("");
      setAssigningAssessmentType(`${application._id}-${assessmentType}`);

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const assessmentDetails = {
        aptitude: {
          title: "Aptitude Screening Test",
          instructions: "Complete a short aptitude assessment covering logical reasoning, basic maths, and problem-solving.",
          durationMinutes: 30,
        },
        coding: {
          title: "Frontend React API Task",
          instructions: "Build a small React component that fetches job data from an API and displays job title, company, skills, and application status.",
          durationMinutes: 60,
        },
        writing: {
          title: "Professional Writing Task",
          instructions: "Write a short professional response explaining why you are suitable for this role and how your skills match the job requirements.",
          durationMinutes: 40,
        },
      };

      const selectedDetails = assessmentDetails[assessmentType];

      const response = await fetch("http://localhost:5000/api/assessments/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application._id,
          hrEmail: auth.email,
          assessmentType,
          title: selectedDetails.title,
          instructions: selectedDetails.instructions,
          durationMinutes: selectedDetails.durationMinutes,
          dueDate: "2026-08-15",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign assessment.");
      }

      setAssessments((currentAssessments) => [
        data.assessment,
        ...currentAssessments,
      ]);

      setMessage(`${selectedDetails.title} assigned to ${application.jobSeekerEmail}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigningAssessmentType("");
    }
  };
  const updateAssessmentReviewField = (assessmentId, field, value) => {
    setAssessmentReviews((currentReviews) => ({
      ...currentReviews,
      [assessmentId]: {
        ...(currentReviews[assessmentId] || {}),
        [field]: value,
      },
    }));
  };

  const reviewAssessment = async (assessment) => {
    try {
      setMessage("");
      setError("");
      setReviewingAssessmentId(assessment._id);

      const reviewData = assessmentReviews[assessment._id] || {};
      const score = Number(reviewData.score);
      const feedback = reviewData.feedback?.trim() || "";

      if (Number.isNaN(score) || score < 0 || score > 100) {
        throw new Error("Score must be a number between 0 and 100.");
      }

      if (!feedback) {
        throw new Error("Write HR feedback before marking assessment as reviewed.");
      }

      const response = await fetch(`http://localhost:5000/api/assessments/${assessment._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "reviewed",
          score,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to review assessment.");
      }

      setAssessments((currentAssessments) =>
        currentAssessments.map((item) =>
          item._id === assessment._id ? data.assessment : item
        )
      );

      setMessage("Assessment reviewed successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingAssessmentId("");
    }
  };
  const scheduleInterview = async (application) => {
    try {
      setMessage("");
      setError("");
      setSchedulingInterviewId(application._id);

      const existingInterview = interviews.find(
        (interview) => interview.applicationId === application._id && interview.status === "scheduled"
      );

      if (existingInterview) {
        throw new Error("An interview is already scheduled for this application.");
      }

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const response = await fetch("http://localhost:5000/api/interviews/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application._id,
          hrEmail: auth.email,
          scheduledAt: "2026-08-20T11:00:00",
          durationMinutes: 30,
          mode: "online",
          meetingLink: "https://meet.google.com/demo-interview-link",
          notes: "Interview scheduled for role discussion, project review, and final HR screening.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to schedule interview.");
      }

      setInterviews((currentInterviews) => [
        data.interview,
        ...currentInterviews,
      ]);

      setApplications((currentApplications) =>
        currentApplications.map((item) =>
          item._id === application._id ? data.application : item
        )
      );

      setSelectedApplication(data.application);
      setMessage(`Interview scheduled for ${application.jobSeekerEmail}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSchedulingInterviewId("");
    }
  };
  const getScoreLabel = (score) => {
    return typeof score === "number" ? `${score}%` : "Not calculated";
  };

  const getStatusCount = (status) => {
    return applications.filter((application) => application.status === status).length;
  };

  const uniqueJobTitles = useMemo(() => {
    return [...new Set(applications.map((application) => application.jobTitle).filter(Boolean))];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter((application) => application.status === statusFilter);
    }

    if (jobFilter !== "all") {
      result = result.filter((application) => application.jobTitle === jobFilter);
    }

    if (minScoreFilter !== "all") {
      const minimumScore = Number(minScoreFilter);

      result = result.filter((application) => {
        const score = typeof application.cvMatchScore === "number" ? application.cvMatchScore : -1;
        return score >= minimumScore;
      });
    }

    result.sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOption === "highest-score") {
        return (b.cvMatchScore ?? -1) - (a.cvMatchScore ?? -1);
      }

      if (sortOption === "lowest-score") {
        return (a.cvMatchScore ?? 999) - (b.cvMatchScore ?? 999);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [applications, statusFilter, jobFilter, minScoreFilter, sortOption]);

  const selectedApplication =
    filteredApplications.find((application) => application._id === selectedApplicationId) ||
    filteredApplications[0] ||
    null;

  const profile = dashboard?.profile;
  const stats = dashboard?.stats;

  return (
        <main className="dashboard-page">
      <InAppNotifications message={message} error={error} />
      <aside className="dashboard-sidebar">
        <h2>HR Panel</h2>
        <nav>
          <a>Overview</a>
          <Link to="/hr/post-job">Post Job</Link>
          <a>Applicants</a>
          <a>Shortlist</a>
          <a>Assessments</a>
          <a>Interviews</a>
        </nav>
        <LogoutButton />
        <Link to="/" className="sidebar-link">Back to Home</Link>
      </aside>

      <section className="dashboard-content">
        <span className="eyebrow">Recruiter Dashboard</span>
        <h1>Manage hiring with AI support</h1>
        <p>
          Post jobs, review applicants, check profile-plus-CV match scores, assign tests, and schedule interviews.
        </p>

        {isLoading && <p>Loading dashboard data...</p>}


        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>HR Email</h3>
                <strong>{profile?.email}</strong>
                <p>Status: {profile?.accountStatus}</p>
              </div>

              <div className="dashboard-card">
                <h3>Company</h3>
                <strong>{profile?.companyName || "Not added"}</strong>
                <p>Website: {profile?.companyWebsite || "Not added"}</p>
              </div>

              <div className="dashboard-card">
                <h3>Email Verification</h3>
                <strong>{profile?.isEmailVerified ? "Verified" : "Not verified"}</strong>
                <p>
                  Last login:{" "}
                  {profile?.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Open Jobs</h3>
                <strong>{jobs.length}</strong>
                <p>Jobs posted by this HR account.</p>
              </div>

              <div className="dashboard-card">
                <h3>Total Applicants</h3>
                <strong>{applications.length}</strong>
                <p>Applications received for this HR account.</p>
              </div>

              <div className="dashboard-card">
                <h3>Scheduled Interviews</h3>
                <strong>{stats?.scheduledInterviews}</strong>
                <p>Google Calendar and video interview sessions will be managed here.</p>
              </div>
            </div>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Received Applications</span>
                  <h2>Applicant review center</h2>
                </div>
                <strong>{filteredApplications.length} shown / {applications.length} total</strong>
              </div>

              <div className="status-summary-grid">
                <div className="mini-stat-card">
                  <strong>{getStatusCount("reviewing")}</strong>
                  <span>Reviewing</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("shortlisted")}</strong>
                  <span>Shortlisted</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("interview_scheduled")}</strong>
                  <span>Interview</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("hired")}</strong>
                  <span>Hired</span>
                </div>

                <div className="mini-stat-card">
                  <strong>{getStatusCount("rejected")}</strong>
                  <span>Rejected</span>
                </div>
              </div>

              <div className="filter-panel">
                <div className="filter-grid">
                  <label className="filter-field">
                    <span>Status</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview scheduled</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Job</span>
                    <select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)}>
                      <option value="all">All jobs</option>
                      {uniqueJobTitles.map((jobTitle) => (
                        <option value={jobTitle} key={jobTitle}>
                          {jobTitle}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Minimum profile + CV score</span>
                    <select value={minScoreFilter} onChange={(event) => setMinScoreFilter(event.target.value)}>
                      <option value="all">Any score</option>
                      <option value="50">50% and above</option>
                      <option value="70">70% and above</option>
                      <option value="85">85% and above</option>
                      <option value="90">90% and above</option>
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Sort</span>
                    <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest-score">Highest score first</option>
                      <option value="lowest-score">Lowest score first</option>
                    </select>
                  </label>
                </div>

                <button
                  className="secondary-action-button"
                  onClick={() => {
                    setStatusFilter("all");
                    setJobFilter("all");
                    setMinScoreFilter("all");
                    setSortOption("newest");
                  }}
                >
                  Reset filters
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="approval-empty">
                  No applications received yet.
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="approval-empty">
                  No applicants match the selected filters.
                </div>
              ) : (
                <div className="applicant-review-layout">
                  <div className="applicant-list">
                    {filteredApplications.map((application) => (
                      <button
                        type="button"
                        className={`applicant-list-item ${
                          selectedApplication?._id === application._id ? "active" : ""
                        }`}
                        key={application._id}
                        onClick={() => setSelectedApplicationId(application._id)}
                      >
                        <div>
                          <strong>{application.jobTitle}</strong>
                          <span>{application.jobSeekerEmail}</span>
                        </div>

                        <div className="applicant-meta-row">
                          <span>{formatStatus(application.status)}</span>
                          <strong>{getScoreLabel(application.cvMatchScore)}</strong>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedApplication && (
                    <div className="applicant-detail-card">
                      <div className="approval-header">
                        <div>
                          <span className="eyebrow">Applicant Details</span>
                          <h2>{selectedApplication.jobTitle}</h2>
                        </div>

                        <strong className="job-status-pill">
                          {formatStatus(selectedApplication.status)}
                        </strong>
                      </div>

                      <div className="score-large">
                        <span>Profile + CV Match Score</span>
                        <strong>{getScoreLabel(selectedApplication.cvMatchScore)}</strong>
                      </div>

                      <div className="detail-grid">
                        <div>
                          <span>Candidate Email</span>
                          <strong>{selectedApplication.jobSeekerEmail}</strong>
                        </div>

                        <div>
                          <span>Company</span>
                          <strong>{selectedApplication.companyName}</strong>
                        </div>

                        <div>
                          <span>Applied</span>
                          <strong>{new Date(selectedApplication.createdAt).toLocaleString()}</strong>
                        </div>

                        <div>
                          <span>Application Status</span>
                          <strong>{formatStatus(selectedApplication.status)}</strong>
                        </div>
                      </div>

                      <div className="detail-block">
                        <h3>Cover Letter</h3>
                        <p>{selectedApplication.coverLetter || "Not provided"}</p>
                      </div>

                      <div className="detail-block">
                        <h3>HR Remarks</h3>
                        <p>{selectedApplication.remarks || "No remarks yet"}</p>
                      </div>

                      <div className="detail-block">
                        <h3>Scoring Note</h3>
                        <p>
                          This score now combines candidate profile skills, extracted CV text,
                          preferred job type, and preferred location.
                        </p>
                      </div>

                      <div className="detail-block">
                        <h3>Schedule Interview</h3>
                        <p>Create an interview slot for this candidate using the demo meeting link.</p>

                        <div className="status-action-row">
                          <button
                            onClick={() => scheduleInterview(selectedApplication)}
                            disabled={schedulingInterviewId === selectedApplication._id}
                          >
                            {schedulingInterviewId === selectedApplication._id ? "Scheduling..." : "Schedule Interview"}
                          </button>
                        </div>
                      </div>

                      <div className="detail-block">
                        <h3>Assign Assessment</h3>
                        <p>Send an assessment task to this candidate for the next recruitment stage.</p>

                        <div className="status-action-row">
                          <button
                            onClick={() => assignAssessment(selectedApplication, "aptitude")}
                            disabled={assigningAssessmentType === `${selectedApplication._id}-aptitude`}
                          >
                            Aptitude Test
                          </button>

                          <button
                            onClick={() => assignAssessment(selectedApplication, "coding")}
                            disabled={assigningAssessmentType === `${selectedApplication._id}-coding`}
                          >
                            Coding Task
                          </button>

                          <button
                            onClick={() => assignAssessment(selectedApplication, "writing")}
                            disabled={assigningAssessmentType === `${selectedApplication._id}-writing`}
                          >
                            Writing Task
                          </button>
                        </div>
                      </div>

                      <div className="status-action-row">
                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "reviewing",
                              "Application is now under HR review."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Reviewing
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "shortlisted",
                              "Candidate has been shortlisted for the next stage."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "rejected",
                              "Candidate was not selected for this role."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "interview_scheduled",
                              "Candidate has been moved to interview scheduling."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Interview
                        </button>

                        <button
                          onClick={() =>
                            updateApplicationStatus(
                              selectedApplication._id,
                              "hired",
                              "Candidate has been marked as hired."
                            )
                          }
                          disabled={updatingApplicationId === selectedApplication._id}
                        >
                          Hire
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Interviews</span>
                  <h2>Scheduled candidate interviews</h2>
                </div>
                <strong>{interviews.length} scheduled</strong>
              </div>

              {interviews.length === 0 ? (
                <div className="approval-empty">
                  No interviews scheduled yet.
                </div>
              ) : (
                <div className="approval-list">
                  {interviews.map((interview) => (
                    <div className="approval-card" key={interview._id}>
                      <div>
                        <h3>{interview.jobTitle}</h3>
                        <p>Candidate: {interview.jobSeekerEmail}</p>
                        <p>Company: {interview.companyName}</p>
                        <p>Time: {new Date(interview.scheduledAt).toLocaleString()}</p>
                        <p>Duration: {interview.durationMinutes} minutes</p>
                        <p>Mode: {interview.mode}</p>
                        <p>Candidate Response: {formatStatus(interview.candidateResponse)}</p>
                        <p>Notes: {interview.notes || "No notes added."}</p>

                        {interview.meetingLink && (
                          <a
                            className="view-cv-link"
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Meeting Link
                          </a>
                        )}
                      </div>

                      <strong className="job-status-pill">{formatStatus(interview.status)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Assessments</span>
                  <h2>Assigned candidate assessments</h2>
                </div>
                <strong>{assessments.length} assigned</strong>
              </div>

              {assessments.length === 0 ? (
                <div className="approval-empty">
                  No assessments assigned yet.
                </div>
              ) : (
                <div className="approval-list">
                  {assessments.map((assessment) => (
                    <div className="approval-card" key={assessment._id}>
                      <div>
                        <h3>{assessment.title}</h3>
                        <p>Candidate: {assessment.jobSeekerEmail}</p>
                        <p>Job: {assessment.jobTitle}</p>
                        <p>Type: {assessment.assessmentType}</p>
                        <p>Duration: {assessment.durationMinutes} minutes</p>
                        <p>Due: {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : "Not set"}</p>
                        <p>Status: {formatStatus(assessment.status)}</p>

                        {assessment.submittedAnswer ? (
                          <div className="assessment-answer-box">
                            <h3>Submitted Answer</h3>
                            <p>{assessment.submittedAnswer}</p>

                            {assessment.status === "reviewed" ? (
                              <>
                                <p>Score: {assessment.score}/100</p>
                                <p>Feedback: {assessment.feedback}</p>
                              </>
                            ) : (
                              <div className="assessment-review-box">
                                <label htmlFor={`score-${assessment._id}`}>Score out of 100</label>
                                <input
                                  id={`score-${assessment._id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={assessmentReviews[assessment._id]?.score || ""}
                                  onChange={(event) =>
                                    updateAssessmentReviewField(
                                      assessment._id,
                                      "score",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Example: 85"
                                />

                                <label htmlFor={`feedback-${assessment._id}`}>HR Feedback</label>
                                <textarea
                                  id={`feedback-${assessment._id}`}
                                  value={assessmentReviews[assessment._id]?.feedback || ""}
                                  onChange={(event) =>
                                    updateAssessmentReviewField(
                                      assessment._id,
                                      "feedback",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Write feedback for the candidate..."
                                  rows="4"
                                />

                                <button
                                  onClick={() => reviewAssessment(assessment)}
                                  disabled={reviewingAssessmentId === assessment._id}
                                >
                                  {reviewingAssessmentId === assessment._id ? "Reviewing..." : "Mark Reviewed"}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="assessment-answer-box">
                            <h3>Submitted Answer</h3>
                            <p>No answer submitted yet.</p>
                          </div>
                        )}
                      </div>

                      <strong className="job-status-pill">{formatStatus(assessment.status)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="approval-section">
              <div className="approval-header">
                <div>
                  <span className="eyebrow">Posted Jobs</span>
                  <h2>Your job posts</h2>
                </div>
                <strong>{jobs.length} open</strong>
              </div>

              {jobs.length === 0 ? (
                <div className="approval-empty">
                  No jobs posted yet.
                </div>
              ) : (
                <div className="approval-list">
                  {jobs.map((job) => (
                    <div className="approval-card" key={job._id}>
                      <div>
                        <h3>{job.title}</h3>
                        <p>Company: {job.companyName}</p>
                        <p>Location: {job.location}</p>
                        <p>Type: {job.jobType}</p>
                        <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                        <p>Skills: {job.requiredSkills?.join(", ")}</p>
                      </div>

                      <strong className="job-status-pill">{job.status}</strong>
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

export default HRDashboard;






