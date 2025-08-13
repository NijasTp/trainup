import api from "@/lib/axios";
import { loginTrainer } from "@/redux/slices/trainerAuthSlice";
import type { RootState } from "@/redux/store";
import { useEffect, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";


interface Props {
  children: JSX.Element;
}

export const TrainerPreventLoggedIn: React.FC<Props> = ({ children }) => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);

  if (trainer) {
    if (trainer.isVerified) {
      return <Navigate to="/trainer/dashboard" replace />;
    } else {
      return <Navigate to="/trainer/waitlist" replace />;
    }
  }

  return children;
};

export const TrainerProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const location = useLocation();
  const dispatch = useDispatch();

   useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get("/trainer/get-details");
      dispatch(loginTrainer(res.data));
    } catch (err) {
      console.error("Failed to fetch trainer profile", err);
    }
  };
  fetchProfile();
  const interval = setInterval(fetchProfile, 30000);

  return () => clearInterval(interval); // cleanup on unmount
}, [dispatch]);

  if (!trainer) {
    return <Navigate to="/trainer/login" replace />;
  }

  if (!trainer.isVerified && location.pathname !== "/trainer/waitlist") {
    return <Navigate to="/trainer/waitlist" replace />;
  }


  if (trainer.isVerified && location.pathname === "/trainer/waitlist") {
    return <Navigate to="/trainer/dashboard" replace />;
  }

  return children;
};