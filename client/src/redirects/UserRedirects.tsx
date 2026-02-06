import { Navigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../redux/store";
import { toast } from "react-toastify";
import { logout } from "@/redux/slices/userAuthSlice";
import { checkUserSession } from "@/services/authService";
import LoadingSpinner from "@/components/ui/LoadSpinner";



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
            // Using login to refresh all user data
            const userWithRole = { ...response.user, role: 'user' };
            const { login } = await import("@/redux/slices/userAuthSlice");
            dispatch(login(userWithRole));
          }
          console.log('User session is valid');
        } catch (error: any) {
          console.error("Session check failed:", error);
          if (error.response?.status === 403 && error.response.data?.error === 'Banned') {
            toast.error('You are banned');
            dispatch(logout());
            navigate('/user/login');
          } else if (error.response?.status === 401) {
            dispatch(logout());
            navigate('/user/login');
          }
        }
      }
      setChecking(false);
    };

    checkSession();
  }, [isAuthenticated, location.pathname, dispatch]);

  if (checking) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};



export const PreventLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  return <>{children}</>;
};