import API from '@/lib/axios'


export const getGymDetails = async () => {
  const res = await API.get('/gym/get-details')
  console.log(res.data)
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
  const res = await API.get(`/admin/gyms?${params.toString()}`);
  return res.data;
};

// Toggle ban status
export const toggleGymBan = async (gymId: string, isBanned: boolean) => {
  await API.patch(`/admin/gyms/${gymId}`, { isBanned });
  const res = await API.get(`/admin/gyms/${gymId}`);
  return res.data;
};

export const verifyGym = async (gymId: string, payload: { verifyStatus: "approved" | "rejected"; rejectReason?: string }) => {
  const res = await API.patch(`/admin/gyms/${gymId}`, payload);
  return res.data;
};


// Reapply with updated details (multipart)
export const reapplyGym = async (formData: FormData) => {
  const res = await API.post('/gym/reapply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Subscription Plans APIs
export interface CreateSubscriptionPlanPayload {
  name: string;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  price: number;
  description?: string;
  features?: string[];
}

export const createSubscriptionPlan = async (payload: CreateSubscriptionPlanPayload) => {
  const res = await API.post('/gym/subscription-plan', payload);
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
  const res = await API.get(`/gym/subscription-plans?${sp.toString()}`);
  return res.data;
};

export const updateSubscriptionPlan = async (
  planId: string,
  payload: Partial<CreateSubscriptionPlanPayload> & { isActive?: boolean }
) => {
  const res = await API.put(`/gym/subscription-plan/${planId}`, payload);
  return res.data;
};

export const deleteSubscriptionPlan = async (planId: string) => {
  const res = await API.delete(`/gym/subscription-plan/${planId}`);
  return res.data;
};

export const getSubscriptionPlan = async (planId: string) => {
  const res = await API.get(`/gym/subscription-plan/${planId}`);
  return res.data;
};



// Get single gym
export const getGymById = async (gymId: string) => {
  const res = await API.get(`/admin/gyms/${gymId}`);
  return res.data;
};

export const updateGymProfile = async (formData: FormData) => {
  const res = await API.put('/gym/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getGymMembers = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`/gym/members?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const getGymAttendance = async (date: string) => {
  const res = await API.get(`/gym/attendance?date=${date}`);
  return res.data;
};

// Products
export const getGymProducts = async (page: number = 1, limit: number = 10, search: string = '', category: string = 'all') => {
  const res = await API.get(`/gym/products?page=${page}&limit=${limit}&search=${search}&category=${category}`);
  return res.data;
};

export const createGymProduct = async (formData: FormData) => {
  const res = await API.post('/gym/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateGymProduct = async (id: string, formData: FormData) => {
  const res = await API.put(`/gym/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteGymProduct = async (id: string) => {
  const res = await API.delete(`/gym/products/${id}`);
  return res.data;
};

// Jobs
export const getGymJobs = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`/gym/jobs?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createGymJob = async (data: any) => {
  const res = await API.post('/gym/jobs', data);
  return res.data;
};

export const updateGymJob = async (id: string, data: any) => {
  const res = await API.put(`/gym/jobs/${id}`, data);
  return res.data;
};

export const deleteGymJob = async (id: string) => {
  const res = await API.delete(`/gym/jobs/${id}`);
  return res.data;
};

// Workout Templates
export const getGymWorkoutTemplates = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`/gym/workout-templates?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createGymWorkoutTemplate = async (data: any) => {
  const res = await API.post('/gym/workout-templates', data);
  return res.data;
};

export const updateGymWorkoutTemplate = async (id: string, data: any) => {
  const res = await API.put(`/gym/workout-templates/${id}`, data);
  return res.data;
};

export const deleteGymWorkoutTemplate = async (id: string) => {
  const res = await API.delete(`/gym/workout-templates/${id}`);
  return res.data;
};

// Announcements (Legacy/Refinement)
export const getGymAnnouncements = async (page: number = 1, limit: number = 10, search: string = '') => {
  const res = await API.get(`/gym/announcements?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

export const createAnnouncement = async (formData: FormData) => {
  const res = await API.post('/gym/announcements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateAnnouncement = async (id: string, formData: FormData) => {
  const res = await API.put(`/gym/announcements/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteAnnouncement = async (id: string) => {
  const res = await API.delete(`/gym/announcements/${id}`);
  return res.data;
};



