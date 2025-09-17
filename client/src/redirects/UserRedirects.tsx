import { Navigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import  { useDispatch, useSelector} from "react-redux"; 
import { useEffect, useState } from "react";
import type { RootState } from "../redux/store";
import { toast } from "react-toastify";
import { logout } from "@/redux/slices/userAuthSlice";
import { checkUserSession } from "@/services/authService";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.userAuth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (user) {
        try {
          await checkUserSession();
          console.log('User session is valid');
        } catch (error: any) {
          console.error("Session check failed:", error);
          if (error.response?.status === 403 && error.response.data?.error === 'Banned') {
            toast.error('You are banned');
            dispatch(logout());
             navigate('/user/login');
            } else if (error.response?.status === 401) {
              toast.error('Session expired',);
              dispatch(logout());
              navigate('/user/login');
          }
        }
      }
      setChecking(false);
    };

    checkSession();
  }, [user, location.pathname, dispatch]);

  if (checking) return <div>loading...</div>;

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