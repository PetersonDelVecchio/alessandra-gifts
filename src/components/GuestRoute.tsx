import React from "react";
import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const userType = localStorage.getItem("userType");
  if (!userType || userType !== "guest") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default GuestRoute;