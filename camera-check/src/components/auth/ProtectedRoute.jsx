 
import { Navigate } from "react-router-dom";
import { getAccessToken, removeAccessToken } from "../../services/identityService";
import { jwtDecode } from "jwt-decode";

const isTokenValid = async (token) => {
   console.log("token", token);
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = getAccessToken();
  const valid = isTokenValid(token);
  if (!token || !valid) {
    removeAccessToken();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute; 