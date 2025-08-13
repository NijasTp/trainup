import { store } from "../redux/store";
import { logout as userLogout } from "../redux/slices/userAuthSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { logout as adminLogout } from "@/redux/slices/adminAuthSlice";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { logoutGym } from "@/redux/slices/gymAuthSlice";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.error || "Access forbidden";

    if (status === 403) {
      toast.error(message);

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

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/user/refresh-token"
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/user/refresh-token", {}, { withCredentials: true });
        return api(originalRequest);      
      } catch (refreshError) {
        toast.error("Session expired");

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
    }

    return Promise.reject(error);
  }
);

export default api;
