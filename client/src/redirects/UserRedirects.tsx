import { Navigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../redux/store";
import { toast } from "sonner";
import { logout } from "@/redux/slices/userAuthSlice";
import { checkUserSession } from "@/services/authService";
import LoadingSpinner from "@/components/ui/LoadSpinner";
import { ROUTES } from "@/constants/routes";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.userAuth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await checkUserSession();
          if (response.valid && response.user) {
            const userWithRole = { ...response.user, role: 'user' };
            const { login } = await import("@/redux/slices/userAuthSlice");
            dispatch(login(userWithRole));
          }
        } catch (error: any) {
          console.error("Session check failed:", error);
          if (error.response?.status === 403 && error.response.data?.error === 'Banned') {
            toast.error('You are banned');
            dispatch(logout());
            navigate(ROUTES.USER_LOGIN);
          } else if (error.response?.status === 401) {
            dispatch(logout());
            navigate(ROUTES.USER_LOGIN);
          }
        }
      }
      setChecking(false);
    };

    checkSession();
  }, [isAuthenticated, location.pathname, dispatch]);

  if (checking) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to={ROUTES.USER_LOGIN} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export const PreventLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.userAuth);
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(ROUTES.USER_HOME_ALT, { replace: true });
    } else if (admin) {
        toast.error("You are already logged in as Admin. Please logout first.");
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else if (trainer) {
        toast.error("You are already logged in as Trainer. Please logout first.");
        const trainerPath = trainer.profileStatus === 'approved' ? ROUTES.TRAINER_DASHBOARD : ROUTES.TRAINER_WAITLIST;
        navigate(trainerPath, { replace: true });
    } else if (gym) {
        toast.error("You are already logged in as Gym Partner. Please logout first.");
        const gymPath = gym.verifyStatus === 'approved' ? ROUTES.GYM_DASHBOARD : ROUTES.GYM_STATUS;
        navigate(gymPath, { replace: true });
    }
  }, [user, admin, trainer, gym, navigate]);

  if (user || admin || trainer || gym) return null;

  return <>{children}</>;
};