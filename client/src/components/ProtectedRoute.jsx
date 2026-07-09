import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const storedAuth = localStorage.getItem("smart_job_seeker_auth");

  if (!storedAuth) {
    return <Navigate to="/select-role" replace />;
  }

  const auth = JSON.parse(storedAuth);

  if (!auth.isEmailVerified) {
    return <Navigate to="/select-role" replace />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    return <Navigate to="/select-role" replace />;
  }

  return children;
}

export default ProtectedRoute;
