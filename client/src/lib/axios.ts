import { store } from "../redux/store";
import { logout as userLogout } from "../redux/slices/userAuthSlice";
import { logout as adminLogout } from "@/redux/slices/adminAuthSlice";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { logoutGym } from "@/redux/slices/gymAuthSlice";
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 404) {
      toast.error("Requested resource not found");
    } else if (status === 500) {
      toast.error("Internal server error. Please try again later.");
    } else if (status === 402) {
      toast.error(error.response?.data?.message || "Subscription expired");
    }

    if (status === 403) {
      const state = store.getState();
      let role: string | null = null;

      if (state.userAuth.user) role = "user";
      else if (state.trainerAuth.trainer) role = "trainer";
      else if (state.gymAuth.gym) role = "gym";
      else if (state.adminAuth.admin) role = "admin";

      switch (role) {
        case "user":
          store.dispatch(userLogout());
          window.location.href = "/login";
          break;
        case "trainer":
          store.dispatch(logoutTrainer());
          window.location.href = "/trainer/login";
          break;
        case "gym":
          store.dispatch(logoutGym());
          window.location.href = "/gym/login";
          break;
        case "admin":
          store.dispatch(adminLogout());
          window.location.href = "/admin/login";
          break;
        default:
          window.location.href = "/login";
          break;
      }

      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const state = store.getState();
      let role: string | null = null;
      let refreshUrl: string | null = null;
      let logoutAction: any = null;
      let loginPath: string = '/login';

      if (state.userAuth.user) {
        role = "user";
        refreshUrl = "/user/refresh-token";
        logoutAction = userLogout;
        loginPath = "/login";
      } else if (state.trainerAuth.trainer) {
        role = "trainer";
        refreshUrl = "/trainer/refresh-token";
        logoutAction = logoutTrainer;
        loginPath = "/trainer/login";
      } else if (state.gymAuth.gym) {
        role = "gym";
        refreshUrl = "/gym/refresh-token";
        logoutAction = logoutGym;
        loginPath = "/gym/login";
      } else if (state.adminAuth.admin) {
        role = "admin";
        refreshUrl = "/admin/refresh-token";
        logoutAction = adminLogout;
        loginPath = "/admin/login";
      }

      if (refreshUrl && role) {
        try {
          await api.post(refreshUrl, {}, { withCredentials: true });
          return api(originalRequest);
        } catch (refreshError) {
          if (logoutAction) store.dispatch(logoutAction());
          window.location.href = loginPath;
          return Promise.reject(refreshError);
        }
      } else {
        // Fallback or no role found
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
