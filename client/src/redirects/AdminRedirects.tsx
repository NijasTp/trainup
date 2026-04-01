import { logout } from "@/redux/slices/adminAuthSlice";
import type { RootState } from "@/redux/store";
import { checkAdminSession } from "@/services/authService";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.ADMIN_LOGIN} />;
};

interface AdminPreventLoggedInProps {
  children: React.ReactNode;
}

export const AdminPreventLoggedIn: React.FC<AdminPreventLoggedInProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const { user } = useSelector((state: RootState) => state.userAuth);
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (admin) {
        try {
          await checkAdminSession();
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } catch (error: any) {
          console.error("Session check failed:", error);

          if (error.response?.status === 403 && error.response.data?.error === "Banned") {
            toast.error("You are banned");
          } else if (error.response?.status === 401) {
            toast.error("Session expired");
          }

          dispatch(logout());
        }
      } else if (user) {
          toast.error("You are already logged in as User. Please logout first.");
          navigate(ROUTES.USER_HOME_ALT, { replace: true });
      } else if (trainer) {
          toast.error("You are already logged in as Trainer. Please logout first.");
          const trainerPath = (trainer.profileStatus === 'approved') ? ROUTES.TRAINER_DASHBOARD : ROUTES.TRAINER_WAITLIST;
          navigate(trainerPath, { replace: true });
      } else if (gym) {
          toast.error("You are already logged in as Gym Partner. Please logout first.");
          const gymPath = (gym.verifyStatus === 'approved') ? ROUTES.GYM_DASHBOARD : ROUTES.GYM_STATUS;
          navigate(gymPath, { replace: true });
      }
      setChecking(false);
    };

    checkSession();
  }, [admin, user, trainer, gym, dispatch, navigate]);

  if (checking) return null;
  if (admin || user || trainer || gym) return null;

  return <>{children}</>;
};
