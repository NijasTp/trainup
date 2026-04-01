import { ROUTES } from "@/constants/routes";
import api from "@/lib/axios";
import { loginTrainer } from "@/redux/slices/trainerAuthSlice";
import type { RootState } from "@/redux/store";
import { useEffect, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  children: JSX.Element;
}

export const TrainerPreventLoggedIn: React.FC<Props> = ({ children }) => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const { user } = useSelector((state: RootState) => state.userAuth);
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (trainer) {
        const trainerPath = (trainer.profileStatus === 'approved') ? ROUTES.TRAINER_DASHBOARD : ROUTES.TRAINER_WAITLIST;
        navigate(trainerPath, { replace: true });
    } else if (user) {
        toast.error("You are already logged in as User. Please logout first.");
        navigate(ROUTES.USER_HOME_ALT, { replace: true });
    } else if (admin) {
        toast.error("You are already logged in as Admin. Please logout first.");
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else if (gym) {
        toast.error("You are already logged in as Gym Partner. Please logout first.");
        const gymPath = (gym.verifyStatus === 'approved') ? ROUTES.GYM_DASHBOARD : ROUTES.GYM_STATUS;
        navigate(gymPath, { replace: true });
    }
  }, [trainer, user, admin, gym, navigate]);

  if (trainer || user || admin || gym) return null;

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
  if (trainer) fetchProfile();
  const interval = setInterval(() => { if (trainer) fetchProfile(); }, 30000);

  return () => clearInterval(interval);
}, [dispatch, trainer]);

  if (!trainer) {
    return <Navigate to={ROUTES.TRAINER_LOGIN} replace />;
  }

  if (trainer.profileStatus == 'pending' && location.pathname !== ROUTES.TRAINER_WAITLIST) {
    return <Navigate to={ROUTES.TRAINER_WAITLIST} replace />;
  }

  if (trainer.profileStatus == 'rejected' && location.pathname !== ROUTES.TRAINER_REJECTED) {
    return <Navigate to={ROUTES.TRAINER_REJECTED} replace />;
  }


  return children;
};