// src/constants/routes.ts
export const ROUTES = {
  // User Routes
  USER_LOGIN: "/login",
  USER_FORGOT_PASSWORD: "/forgot-password",
  USER_NEW_PASSWORD: "/new-password",
  USER_SIGNUP: "/signup",
  USER_HOME: "/",
  USER_HOME_ALT: "/home",
  USER_PROFILE: "/profile",
  USER_VERIFY_OTP: "/verify-otp",
  USER_TRAINER_PAGE:'/trainers',
  USER_WORKOUTS_PAGE:'/workouts',
  CALLBACK:"/callback",

  // Trainer Routes
  TRAINER_LOGIN: "/trainer/login",
  TRAINER_FORGOT_PASSWORD: "/trainer/forgot-password",
  TRAINER_FORGOT_PASSWORD_VERIFY_OTP: "/trainer/forgot-password/verify",
  TRAINER_RESET_PASSWORD: "/trainer/reset-password",
  TRAINER_APPLY: "/trainer/apply",
  TRAINER_VERIFY_OTP: "/trainer/verify-otp",
  TRAINER_WAITLIST: "/trainer/waitlist",
  TRAINER_DASHBOARD: "/trainer/dashboard",

  // Gym Routes
  GYM_LOGIN: "/gym/login",
  GYM_APPLY: "/gym/apply",
  GYM_VERIFY_OTP: "/gym/verify-otp",
  GYM_WAITLIST: "/gym/waitlist",
  GYM_DASHBOARD: "/gym/dashboard",

  // Admin Routes
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_TRAINERS: "/admin/trainers",
  ADMIN_TRAINER_DETAILS: "/admin/trainers/:trainerId",
  ADMIN_TRAINER_APPLICATION: "/admin/trainers/:trainerId/application",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAILS: "/admin/users/:userId",
  ADMIN_GYMS: "/admin/gyms",
  ADMIN_GYM_APPLICATION: "/admin/gyms/:id/application",
};