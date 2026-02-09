import API from '../lib/axios';


export const login = async (email: string, password: string) => {

  const response = await API.post('/user/login', { email, password });
  return response.data;


};

export const checkUserSession = async () => {
  const response = await API.get('/user/session', { withCredentials: true });
  return response.data;
}


export const signup = async (name: string, email: string, password: string, otp: string) => {
  return await API.post("/user/verify-otp", {
    email,
    name,
    password,
    otp,
  }, { withCredentials: true });
}

export const resendOtp = async (email: string) => {
  return await API.post("/user/resend-otp", { email });
};

export const logout = async () => {
  await API.post('/user/logout', {}, { withCredentials: true })

}

export const forgotPassword = async (email: string) => {
  const res = await API.post('/user/forgot-password', { email })
  return res.data
}

export const verifyForgotPasswordOtp = async (otp: string, email: string) => {
  await API.post('/user/verify-forgot-password-otp', { otp, email })

}

export const resetPassword = async (email: string, newPassword: string) => {
  await API.post('/user/reset-password', { email, newPassword });

};

export const trainerLogin = async (email: string, password: string) => {
  const res = await API.post('/trainer/login', { email, password })
  return res.data
};

export const trainerForgotPassword = async (email: string) => {
  await API.post('/trainer/forgot-password', { email })
}


export const trainerResetPassword = async (email: string, password: string) => {
  const res = await API.post('/trainer/reset-password', { email, password })
  return res.data
}

export const trainerRequestOtp = async (email: string) => {
  const { data } = await API.post("/trainer/request-otp", { email });
  return data;
};

export const trainerVerifyOtp = async (email: string, otp: string) => {
  await API.post('/trainer/verify-otp', { email, otp })
}
export const trainerResendOtp = async (email: string) => {
  await API.post('/trainer/resend-otp', { email })
}

export const trainerForgotPasswordResendOtp = async (email: string) => {
  const res = await API.post('/trainer/forgot-password-resend-otp', { email })
  return res.data
}

export const trainerApply = async (formData: FormData) => {
  const res = await API.post("/trainer/apply", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data
};

export const trainerLogout = async () => {
  await API.post('/trainer/logout', {}, { withCredentials: true });
}

export const gymLogin = async (email: string, password: string) => {
  const response = await API.post(`/gym/login`, {
    email,
    password
  });
  return response.data;
}


export const requestGymAuthOtp = async (email: string) => {
  const response = await API.post("/gym/auth/request-otp", { email });
  return response.data;
};

export const verifyGymAuthOtp = async (email: string, otp: string) => {
  const response = await API.post("/gym/auth/verify-otp", { email, otp });
  return response.data;
};

export const registerGym = async (formData: FormData) => {
  const response = await API.post("/gym/register", formData);
  return response.data;
};

export const reapplyGym = async (formData: FormData) => {
  const response = await API.post("/gym/reapply", formData);
  return response.data;
};



export const gymLogout = async () => {
  await API.post('/gym/logout')
}

export const checkAdminSession = async () => {
  const response = await API.get('/admin/session', { withCredentials: true });
  return response.data;
}

export const loginAdmin = async (email: string, password: string) => {
  const response = await API.post("/admin/login", { email, password });
  return response.data;
}

export const logoutAdmin = async () => {
  await API.post("/admin/logout");
}


export const gymForgotPassword = async (email: string) => {
  await API.post('/gym/forgot-password', { email })
}

export const gymResetPassword = async (email: string, password: string, otp: string) => {
  const res = await API.post('/gym/reset-password', { email, password, otp })
  return res.data
}
