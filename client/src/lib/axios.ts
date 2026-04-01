import { store } from "../redux/store";
import { logout as userLogout } from "../redux/slices/userAuthSlice";
import { logout as adminLogout } from "@/redux/slices/adminAuthSlice";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { logoutGym } from "@/redux/slices/gymAuthSlice";
import axios from "axios";
import { toast } from "sonner";
import { ROUTES } from "../constants/routes";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000, // 10s timeout
});

let lastToastTime = 0;
let lastToastMessage = "";

const showDeduplicatedToast = (message: string, type: 'error' | 'warn' | 'success' | 'info' = 'error') => {
  const now = Date.now();
  if (message === lastToastMessage && now - lastToastTime < 2000) {
    return;
  }
  lastToastMessage = message;
  lastToastTime = now;
  
  switch(type) {
    case 'error': toast.error(message); break;
    case 'warn': toast.warning(message); break;
    case 'success': toast.success(message); break;
    case 'info': toast.info(message); break;
  }
};

// Response Interceptor for Global Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle Timeouts/Network Errors
    if (!error.response) {
      showDeduplicatedToast("Network error. Please check your internet connection.");
      return Promise.reject(error);
    }

    // Global Error Mapping
    switch (status) {
      case 400:
        showDeduplicatedToast(data?.message || data?.error || "Invalid request.");
        break;
      case 404:
        showDeduplicatedToast("Requested resource not found.", 'warn');
        break;
      case 402:
        showDeduplicatedToast(data?.message || "Payment required or subscription expired.");
        break;
      case 500:
        console.error("Internal server error:", data?.message || "No specific message provided");
        if (data?.message) {
          showDeduplicatedToast(data.message);
        }
        break;
      case 403:
        if (data?.error === "Banned" || data?.message?.includes("banned")) {
            showDeduplicatedToast("Your account has been banned. Please contact support.");
            handleForcedLogout(true);
        } else {
            showDeduplicatedToast(data?.message || data?.error || "Access denied. Please logout first if you want to switch roles.");
            // Do not force logout for regular forbidden errors (cross-role access)
        }
        break;
      case 401:
        if (!originalRequest._retry) {
          return handleTokenRefresh(originalRequest);
        }
        break;
      default:
        if (status >= 400 && status < 500) {
          // generic logging
        }
    }

    return Promise.reject(error);
  }
);

// Helper for 403 Forbidden (Force Logout)
const handleForcedLogout = (force: boolean = false) => {
  const state = store.getState();
  const hasUser = !!state.userAuth.user;
  const hasTrainer = !!state.trainerAuth.trainer;
  const hasGym = !!state.gymAuth.gym;
  const hasAdmin = !!state.adminAuth.admin;

  if (!force) return; // Only logout if explicitly forced (e.g. Banned)

  if (hasUser) {
    store.dispatch(userLogout());
    window.location.href = ROUTES.USER_LOGIN;
  } else if (hasTrainer) {
    store.dispatch(logoutTrainer());
    window.location.href = ROUTES.TRAINER_LOGIN;
  } else if (hasGym) {
    store.dispatch(logoutGym());
    window.location.href = ROUTES.GYM_LOGIN;
  } else if (hasAdmin) {
    store.dispatch(adminLogout());
    window.location.href = ROUTES.ADMIN_LOGIN;
  } else {
    window.location.href = ROUTES.USER_LOGIN;
  }
};

// Helper for 401 Unauthorized (Token Refresh)
const handleTokenRefresh = async (originalRequest: any) => {
  originalRequest._retry = true;
  const state = store.getState();
  let refreshUrl: string | null = null;
  let logoutAction: any = null;
  let loginPath: string = ROUTES.USER_LOGIN;

  if (state.userAuth.user) {
    refreshUrl = "/user/refresh-token"; 
    logoutAction = userLogout;
    loginPath = ROUTES.USER_LOGIN;
  } else if (state.trainerAuth.trainer) {
    refreshUrl = "/trainer/refresh-token";
    logoutAction = logoutTrainer;
    loginPath = ROUTES.TRAINER_LOGIN;
  } else if (state.gymAuth.gym) {
    refreshUrl = "/gym/refresh-token";
    logoutAction = logoutGym;
    loginPath = ROUTES.GYM_LOGIN;
  } else if (state.adminAuth.admin) {
    refreshUrl = "/admin/refresh-token";
    logoutAction = adminLogout;
    loginPath = ROUTES.ADMIN_LOGIN;
  }

  if (refreshUrl) {
    try {
      await axios.post(refreshUrl, {}, { withCredentials: true });
      return api(originalRequest);
    } catch (refreshError) {
      if (logoutAction) store.dispatch(logoutAction());
      window.location.href = loginPath;
      return Promise.reject(refreshError);
    }
  }

  window.location.href = loginPath;
  return Promise.reject(new Error("Unauthorized"));
};

export default api;
