import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
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

const GuestRoute = ({ children }) => {
  // Lấy token từ localStorage thay vì Redux
  const token = localStorage.getItem("accessToken");
  if (isTokenValid(token)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default GuestRoute; 