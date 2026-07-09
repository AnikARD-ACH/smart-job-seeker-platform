import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("smart_job_seeker_auth");
    navigate("/select-role");
  };

  return (
    <button type="button" className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
