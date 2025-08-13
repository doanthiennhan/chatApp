import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface GuestRouteProps {
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

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (isTokenValid(token)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default GuestRoute;