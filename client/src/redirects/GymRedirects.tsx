import React, { type JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {type RootState } from "@/redux/store";

interface Props {
  children: JSX.Element;
}

export const GymAuthRedirect: React.FC<Props> = ({ children }) => {
  const { isVerified,gym } = useSelector((state: RootState) => state.gymAuth);

  const isAuthenticated = !!gym?._id;

  if (isAuthenticated) {
    if (isVerified) {
      return <Navigate to="/gym/dashboard" replace />;
    } else {
      return <Navigate to="/gym/waitlist" replace />;
    }
  }

  return children;
};


export const GymProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const location = useLocation();

  const isAuthenticated = !!gym?._id; 
  const isVerified = gym?.isVerified;


  if (!isAuthenticated) {
    return <Navigate to="/gym/login" state={{ from: location }} replace />;
  }

  if (!isVerified && location.pathname !== "/gym/waitlist") {
    return <Navigate to="/gym/waitlist" replace />;
  }

  if (isVerified && location.pathname === "/gym/waitlist") {
    return <Navigate to="/gym/dashboard" replace />;
  }

  return children;
};

