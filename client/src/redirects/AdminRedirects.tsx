import { logout } from "@/redux/slices/adminAuthSlice";
import type { RootState } from "@/redux/store";
import { checkAdminSession } from "@/services/authService";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

interface AdminPreventLoggedInProps {
  children: React.ReactNode;
}

export const AdminPreventLoggedIn: React.FC<AdminPreventLoggedInProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated) {
        try {
          await checkAdminSession();
          console.log("Session is valid");
        } catch (error: any) {
          console.error("Session check failed:", error);

          if (error.response?.status === 403 && error.response.data?.error === "Banned") {
            toast.error("You are banned");
          } else if (error.response?.status === 401) {
            toast.error("Session expired");
          }

          dispatch(logout());
        }
      }
      setChecking(false);
    };

    checkSession();
  }, [isAuthenticated, dispatch]);

  if (checking) return null;


  return <>{children}</>;
};
