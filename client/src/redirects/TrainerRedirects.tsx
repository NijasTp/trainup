import { ROUTES } from "@/constants/routes";
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
    if (trainer.profileStatus == 'approved') {
      return <Navigate to={ROUTES.TRAINER_DASHBOARD} replace />;
    } else if (trainer.profileStatus == 'rejected') {
      return <Navigate to={ROUTES.TRAINER_WAITLIST} replace />;
    }else{
      return <Navigate to={ROUTES.TRAINER_WAITLIST} replace />;
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

  return () => clearInterval(interval);
}, [dispatch]);

  if (!trainer) {
    return <Navigate to="/trainer/login" replace />;
  }

  if (trainer.profileStatus == 'pending' && location.pathname !== ROUTES.TRAINER_WAITLIST) {
    return <Navigate to={ROUTES.TRAINER_WAITLIST} replace />;
  }

  if (trainer.profileStatus == 'rejected' && location.pathname !== ROUTES.TRAINER_REJECTED) {
    return <Navigate to={ROUTES.TRAINER_REJECTED} replace />;
  }

  if (trainer.profileStatus === 'approved' && location.pathname !== ROUTES.TRAINER_DASHBOARD) {
    return <Navigate to={ROUTES.TRAINER_DASHBOARD} replace />;
  }

  return children;
};