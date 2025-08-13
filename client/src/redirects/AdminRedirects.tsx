import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

export const AdminPreventLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);
  return isAuthenticated  ? <Navigate to="/admin/dashboard" /> : <>{children}</>;
};
