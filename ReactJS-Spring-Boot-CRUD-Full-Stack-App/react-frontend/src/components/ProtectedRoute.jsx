import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, but doesn't have the required role
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
