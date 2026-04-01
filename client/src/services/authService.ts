import API from '../lib/axios';
import { API_ROUTES } from '../constants/api.constants';

export const login = async (email: string, password: string) => {
  const response = await API.post(API_ROUTES.AUTH.USER.LOGIN, { email, password });
  return response.data;
};

export const checkUserSession = async () => {
  const response = await API.get(API_ROUTES.AUTH.USER.SESSION, { withCredentials: true });
  return response.data;
}

export const signup = async (name: string, email: string, password: string, otp: string) => {
  return await API.post(API_ROUTES.AUTH.USER.SIGNUP, {
    email,
    name,
    password,
    otp,
  }, { withCredentials: true });
}

export const resendOtp = async (email: string) => {
  return await API.post(API_ROUTES.AUTH.USER.RESEND_OTP, { email });
};

export const logout = async () => {
  await API.post(API_ROUTES.AUTH.USER.LOGOUT, {}, { withCredentials: true })
}

export const forgotPassword = async (email: string) => {
  const res = await API.post(API_ROUTES.AUTH.USER.FORGOT_PASSWORD, { email })
  return res.data
}

export const verifyForgotPasswordOtp = async (otp: string, email: string) => {
  await API.post(API_ROUTES.AUTH.USER.VERIFY_FORGOT_PASSWORD_OTP, { otp, email })
}

export const resetPassword = async (email: string, newPassword: string) => {
  await API.post(API_ROUTES.AUTH.USER.RESET_PASSWORD, { email, newPassword });
};

export const trainerLogin = async (email: string, password: string) => {
  const res = await API.post(API_ROUTES.AUTH.TRAINER.LOGIN, { email, password })
  return res.data
};

export const trainerForgotPassword = async (email: string) => {
  await API.post(API_ROUTES.AUTH.TRAINER.FORGOT_PASSWORD, { email })
}

export const trainerResetPassword = async (email: string, password: string) => {
  const res = await API.post(API_ROUTES.AUTH.TRAINER.RESET_PASSWORD, { email, password })
  return res.data
}

export const trainerRequestOtp = async (email: string) => {
  const { data } = await API.post(API_ROUTES.AUTH.TRAINER.REQUEST_OTP, { email });
  return data;
};

export const trainerVerifyOtp = async (email: string, otp: string) => {
  await API.post(API_ROUTES.AUTH.TRAINER.VERIFY_OTP, { email, otp })
}

export const trainerResendOtp = async (email: string) => {
  await API.post(API_ROUTES.AUTH.TRAINER.RESEND_OTP, { email })
}

export const trainerForgotPasswordResendOtp = async (email: string) => {
  const res = await API.post(API_ROUTES.AUTH.TRAINER.FORGOT_PASSWORD_RESEND_OTP, { email })
  return res.data
}

export const trainerApply = async (formData: FormData) => {
  const res = await API.post(API_ROUTES.AUTH.TRAINER.APPLY, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data
};

export const trainerLogout = async () => {
  await API.post(API_ROUTES.AUTH.TRAINER.LOGOUT, {}, { withCredentials: true });
}

export const gymLogin = async (email: string, password: string) => {
  const response = await API.post(API_ROUTES.AUTH.GYM.LOGIN, {
    email,
    password
  });
  return response.data;
}

export const requestGymAuthOtp = async (email: string) => {
  const response = await API.post(API_ROUTES.AUTH.GYM.REQUEST_OTP, { email });
  return response.data;
};

export const verifyGymAuthOtp = async (email: string, otp: string) => {
  const response = await API.post(API_ROUTES.AUTH.GYM.VERIFY_OTP, { email, otp });
  return response.data;
};

export const registerGym = async (formData: FormData) => {
  const response = await API.post(API_ROUTES.AUTH.GYM.REGISTER, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const reapplyGym = async (formData: FormData) => {
  const response = await API.post(API_ROUTES.AUTH.GYM.REAPPLY, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const gymLogout = async () => {
  await API.post(API_ROUTES.AUTH.GYM.LOGOUT)
}

export const checkGymSession = async () => {
  const response = await API.get(API_ROUTES.AUTH.GYM.SESSION, { withCredentials: true });
  return response.data;
}

export const checkAdminSession = async () => {
  const response = await API.get(API_ROUTES.AUTH.ADMIN.SESSION, { withCredentials: true });
  return response.data;
}

export const loginAdmin = async (email: string, password: string) => {
  const response = await API.post(API_ROUTES.AUTH.ADMIN.LOGIN, { email, password });
  return response.data;
}

export const logoutAdmin = async () => {
  await API.post(API_ROUTES.AUTH.ADMIN.LOGOUT);
}

export const gymForgotPassword = async (email: string) => {
  await API.post(API_ROUTES.AUTH.GYM.FORGOT_PASSWORD, { email })
}

export const gymResetPassword = async (email: string, password: string, otp: string) => {
  const res = await API.post(API_ROUTES.AUTH.GYM.RESET_PASSWORD, { email, password, otp })
  return res.data
}
