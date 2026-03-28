import { store } from "../redux/store";
import { logout as userLogout } from "../redux/slices/userAuthSlice";
import { logout as adminLogout } from "@/redux/slices/adminAuthSlice";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { logoutGym } from "@/redux/slices/gymAuthSlice";
import axios from "axios";
import { toast } from "sonner";
import { API_ROUTES } from "../constants/api.constants";

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
        showDeduplicatedToast(data?.message || "Invalid request.");
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
        handleForcedLogout();
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
const handleForcedLogout = () => {
  const state = store.getState();
  if (state.userAuth.user) {
    store.dispatch(userLogout());
    window.location.href = "/login";
  } else if (state.trainerAuth.trainer) {
    store.dispatch(logoutTrainer());
    window.location.href = "/trainer/login";
  } else if (state.gymAuth.gym) {
    store.dispatch(logoutGym());
    window.location.href = "/gym/login";
  } else if (state.adminAuth.admin) {
    store.dispatch(adminLogout());
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/login";
  }
};

// Helper for 401 Unauthorized (Token Refresh)
const handleTokenRefresh = async (originalRequest: any) => {
  originalRequest._retry = true;
  const state = store.getState();
  let refreshUrl: string | null = null;
  let logoutAction: any = null;
  let loginPath: string = '/login';

  if (state.userAuth.user) {
    refreshUrl = API_ROUTES.AUTH.USER.RESEND_OTP; // Wait, refresh token route! 
    // Looking at authService, user refresh was /user/refresh-token
    refreshUrl = "/user/refresh-token"; 
    logoutAction = userLogout;
    loginPath = "/login";
  } else if (state.trainerAuth.trainer) {
    refreshUrl = "/trainer/refresh-token";
    logoutAction = logoutTrainer;
    loginPath = "/trainer/login";
  } else if (state.gymAuth.gym) {
    refreshUrl = "/gym/refresh-token";
    logoutAction = logoutGym;
    loginPath = "/gym/login";
  } else if (state.adminAuth.admin) {
    refreshUrl = "/admin/refresh-token";
    logoutAction = adminLogout;
    loginPath = "/admin/login";
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
