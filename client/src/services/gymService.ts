import API from '@/lib/axios'
import { API_ROUTES } from '@/constants/api.constants';
import type { CreateSubscriptionPlanPayload } from '@/interfaces/gym/IGymSubscription';

export const getMyGym = async () => {
  const res = await API.get(API_ROUTES.USER.MY_GYM);
  return res.data;
};

export const cancelGymMembership = async (membershipId: string) => {
  const res = await API.post(API_ROUTES.USER.CANCEL_MEMBERSHIP, { membershipId });
  return res.data;
};

export const getGymDetails = async () => {
  const res = await API.get(API_ROUTES.GYM.GET_DETAILS)
  return res.data
}

export const getGyms = async (
  page: number,
  limit: number,
  searchQuery: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    searchQuery,
  });
  const res = await API.get(`${API_ROUTES.ADMIN.GYMS.LIST}?${params.toString()}`);
  return res.data;
};

// Toggle ban status
export const toggleGymBan = async (gymId: string, isBanned: boolean) => {
  await API.patch(`${API_ROUTES.ADMIN.GYMS.LIST}/${gymId}`, { isBanned });
  const res = await API.get(`${API_ROUTES.ADMIN.GYMS.LIST}/${gymId}`);
  return res.data;
};

export const verifyGym = async (gymId: string, payload: { verifyStatus: "approved" | "rejected"; rejectReason?: string }) => {
  const res = await API.patch(`${API_ROUTES.ADMIN.GYMS.LIST}/${gymId}`, payload);
  return res.data;
};

// Reapply with updated details
export const reapplyGym = async (formData: FormData) => {
  const res = await API.post(API_ROUTES.AUTH.GYM.REAPPLY, formData);
  return res.data;
};

// Subscription Plans APIs

export const createSubscriptionPlan = async (payload: CreateSubscriptionPlanPayload) => {
  const res = await API.post(API_ROUTES.GYM.SUBSCRIPTION_PLAN.BASE, payload);
  return res.data;
};

export const listSubscriptionPlans = async (
  params: { page?: number; limit?: number; search?: string; active?: string }
) => {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.search) sp.set('search', params.search);
  if (params.active) sp.set('active', params.active);
  const res = await API.get(`${API_ROUTES.GYM.SUBSCRIPTION_PLAN.LIST}?${sp.toString()}`);
  return res.data;
};

export const updateSubscriptionPlan = async (
  planId: string,
  payload: Partial<CreateSubscriptionPlanPayload> & { isActive?: boolean }
) => {
  const res = await API.put(API_ROUTES.GYM.SUBSCRIPTION_PLAN.DETAIL(planId), payload);
  return res.data;
};

export const deleteSubscriptionPlan = async (planId: string) => {
  const res = await API.delete(API_ROUTES.GYM.SUBSCRIPTION_PLAN.DETAIL(planId));
  return res.data;
};

export const getSubscriptionPlan = async (planId: string) => {
  const res = await API.get(API_ROUTES.GYM.SUBSCRIPTION_PLAN.DETAIL(planId));
  return res.data;
};

// Get single gym
export const getGymById = async (gymId: string) => {
  const res = await API.get(API_ROUTES.ADMIN.GYMS.DETAIL(gymId));
  return res.data;
};

export const updateGymProfile = async (formData: FormData) => {
  const res = await API.put(API_ROUTES.GYM.UPDATE_PROFILE, formData);
  return res.data;
};

export const getGymMembers = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.GYM.MEMBERS}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const getGymAttendance = async (date: string) => {
  const res = await API.get(`${API_ROUTES.GYM.ATTENDANCE}?date=${date}`);
  return res.data;
};

// Products
export const getGymProducts = async (page: number = 1, limit: number = 10, search: string = '', category: string = 'all') => {
  const res = await API.get(`${API_ROUTES.GYM.PRODUCTS.MANAGE}?page=${page}&limit=${limit}&search=${search}&category=${category}`);
  return res.data;
};

export const createGymProduct = async (formData: FormData) => {
  const res = await API.post(API_ROUTES.GYM.PRODUCTS.MANAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateGymProduct = async (id: string, formData: FormData) => {
  const res = await API.put(API_ROUTES.GYM.PRODUCTS.DETAIL(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteGymProduct = async (id: string) => {
  const res = await API.delete(API_ROUTES.GYM.PRODUCTS.DETAIL(id));
  return res.data;
};

// Jobs
export const getGymJobs = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.GYM.JOBS.BASE}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createGymJob = async (data: any) => {
  const res = await API.post(API_ROUTES.GYM.JOBS.BASE, data);
  return res.data;
};

export const updateGymJob = async (id: string, data: any) => {
  const res = await API.put(API_ROUTES.GYM.JOBS.DETAIL(id), data);
  return res.data;
};

export const deleteGymJob = async (id: string) => {
  const res = await API.delete(API_ROUTES.GYM.JOBS.DETAIL(id));
  return res.data;
};

// Workout Templates
export const getGymWorkoutTemplates = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.GYM.WORKOUT_TEMPLATES.BASE}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createGymWorkoutTemplate = async (data: any) => {
  const res = await API.post(API_ROUTES.GYM.WORKOUT_TEMPLATES.BASE, data);
  return res.data;
};

export const updateGymWorkoutTemplate = async (id: string, data: any) => {
  const res = await API.put(API_ROUTES.GYM.WORKOUT_TEMPLATES.DETAIL(id), data);
  return res.data;
};

export const deleteGymWorkoutTemplate = async (id: string) => {
  const res = await API.delete(API_ROUTES.GYM.WORKOUT_TEMPLATES.DETAIL(id));
  return res.data;
};

// Announcements
export const getGymAnnouncements = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.GYM.ANNOUNCEMENTS.BASE}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createAnnouncement = async (formData: FormData) => {
  const res = await API.post(API_ROUTES.GYM.ANNOUNCEMENTS.BASE, formData);
  return res.data;
};

export const updateAnnouncement = async (id: string, formData: FormData) => {
  const res = await API.put(API_ROUTES.GYM.ANNOUNCEMENTS.DETAIL(id), formData);
  return res.data;
};

export const deleteAnnouncement = async (id: string) => {
  const res = await API.delete(API_ROUTES.GYM.ANNOUNCEMENTS.DETAIL(id));
  return res.data;
};

// User Side Gym APIs
export const getUserGymAnnouncements = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.USER.GYM_ANNOUNCEMENTS}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const getUserGymEquipment = async () => {
  const res = await API.get(API_ROUTES.USER.GYM_EQUIPMENT);
  return res.data;
};

export const getUserGymProducts = async (page: number = 1, limit: number = 10, search: string = '', category: string = 'all') => {
  const res = await API.get(`${API_ROUTES.USER.GYM_PRODUCTS}?page=${page}&limit=${limit}&search=${search}&category=${category}`);
  return res.data;
};

export const getUserGymWorkoutTemplates = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`${API_ROUTES.USER.GYM_WORKOUT_TEMPLATES}?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const getGymDashboardStats = async () => {
  const res = await API.get(API_ROUTES.GYM.DASHBOARD_STATS);
  return res.data;
};

// Discovery & Subscription (User Side)
export const getGymsForUser = async (page: number, limit: number, search: string = '', lat?: number, lng?: number) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search
  });
  if (lat && lng) {
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
  }
  const res = await API.get(`${API_ROUTES.USER.GYMS.LIST}?${params.toString()}`);
  return res.data;
};

export const getGymForUser = async (id: string) => {
  const res = await API.get(API_ROUTES.USER.GYMS.DETAIL(id));
  return res.data;
};

export const getActiveSubscriptionPlans = async (gymId: string) => {
  const res = await API.get(API_ROUTES.USER.GYMS.PLANS(gymId));
  return res.data;
};

export const markAttendance = async (gymId: string, location: { lat: number; lng: number }) => {
  const res = await API.post(API_ROUTES.USER.MARK_ATTENDANCE, { gymId, location });
  return res.data;
};

export const getAttendanceHistoryForUser = async (gymId: string, page: number = 1, limit: number = 10) => {
  const res = await API.get(`${API_ROUTES.USER.ATTENDANCE_HISTORY(gymId)}?page=${page}&limit=${limit}`);
  return res.data;
};

export const getUserWishlist = async () => {
  const res = await API.get(API_ROUTES.USER_GYM_PRODUCT.WISH_LIST);
  return res.data;
};

export const toggleWishlist = async (productId: string) => {
  const res = await API.post(API_ROUTES.USER_GYM_PRODUCT.ADD_TO_WISH_LIST(productId));
  return res.data;
};
