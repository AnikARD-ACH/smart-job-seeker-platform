import { useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const initialForm = {
  title: "",
  companyName: "",
  jobType: "Full-time",
  location: "",
  salaryRange: "",
  deadline: "",
  vacancy: 1,
  experienceLevel: "",
  educationRequirement: "",
  requiredSkills: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  aptitudeTest: false,
  codingTest: false,
  writingTest: false,
  interview: true,
};

function PostJobPage() {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      const storedAuth = localStorage.getItem("smart_job_seeker_auth");

      if (!storedAuth) {
        throw new Error("Login session not found.");
      }

      const auth = JSON.parse(storedAuth);

      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          companyName: formData.companyName,
          postedByEmail: auth.email,
          jobType: formData.jobType,
          location: formData.location,
          salaryRange: formData.salaryRange,
          deadline: formData.deadline,
          vacancy: Number(formData.vacancy),
          experienceLevel: formData.experienceLevel,
          educationRequirement: formData.educationRequirement,
          requiredSkills: formData.requiredSkills,
          responsibilities: formData.responsibilities,
          requirements: formData.requirements,
          benefits: formData.benefits,
          selectionStages: {
            aptitudeTest: formData.aptitudeTest,
            codingTest: formData.codingTest,
            writingTest: formData.writingTest,
            interview: formData.interview,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post job.");
      }

      setMessage("Job posted successfully.");
      setFormData(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <h2>HR Panel</h2>
        <nav>
          <Link to="/hr/dashboard">Overview</Link>
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
        <span className="eyebrow">Job Posting</span>
        <h1>Create a new job post</h1>
        <p>
          HR users can create job posts with skills, deadline, vacancy, requirements, and selection stages.
        </p>

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        <form className="job-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Job Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Company Name *</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Job Type</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
            </div>

            <div className="form-field">
              <label>Location *</label>
              <input name="location" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Salary Range</label>
              <input name="salaryRange" value={formData.salaryRange} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Deadline *</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Vacancy</label>
              <input type="number" min="1" name="vacancy" value={formData.vacancy} onChange={handleChange} />
            </div>

            <div className="form-field">
  <label>Experience Level</label>
  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
    <option value="">Select experience level</option>
    <option value="Fresher">Fresher</option>
    <option value="Entry Level">Entry Level</option>
    <option value="Mid Level">Mid Level</option>
    <option value="Senior Level">Senior Level</option>
    <option value="Lead / Manager">Lead / Manager</option>
  </select>
</div>

            <div className="form-field">
              <label>Education Requirement</label>
              <input name="educationRequirement" value={formData.educationRequirement} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Required Skills</label>
              <input
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Responsibilities *</label>
            <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Requirements *</label>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Benefits</label>
            <textarea name="benefits" value={formData.benefits} onChange={handleChange} />
          </div>

          <div className="selection-box">
            <h3>Selection Stages</h3>

            <label>
              <input type="checkbox" name="aptitudeTest" checked={formData.aptitudeTest} onChange={handleChange} />
              Aptitude Test
            </label>

            <label>
              <input type="checkbox" name="codingTest" checked={formData.codingTest} onChange={handleChange} />
              Coding Test
            </label>

            <label>
              <input type="checkbox" name="writingTest" checked={formData.writingTest} onChange={handleChange} />
              Writing Test
            </label>

            <label>
              <input type="checkbox" name="interview" checked={formData.interview} onChange={handleChange} />
              Interview
            </label>
          </div>

          <button type="submit" className="primary-button form-submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default PostJobPage;
