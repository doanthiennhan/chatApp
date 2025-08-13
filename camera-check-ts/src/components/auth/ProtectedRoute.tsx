import React from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, removeAccessToken } from "../../services/identityService";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = getAccessToken();
  const valid = isTokenValid(token);
  if (!token || !valid) {
    removeAccessToken();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;