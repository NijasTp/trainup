import API from "@/lib/axios";


export const getTrainers = async (
  page: number,
  limit: number = 5,
  search: string = "",
  isBanned?: string,
  isVerified?: string,
  startDate?: string,
  endDate?: string
) => {

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search, 
  });

  if (isBanned && isBanned !== "all") params.append("isBanned", isBanned);
  if (isVerified && isVerified !== "all") params.append("isVerified", isVerified);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const url = `/admin/trainers?${params.toString()}`;

  const res = await API.get(url);
  return res.data;
};


export const toggleTrainerBan = async (trainerId: string, isBanned: boolean) => {
    await API.patch(`/admin/trainers/${trainerId}/status`, { isBanned });
};


export const verifyTrainer = async (trainerId: string) => {
    await API.patch(`/admin/trainers/${trainerId}/status`, { profileStatus: 'approved' });
};
 
export const rejectTrainer = async (trainerId:string,rejectReason:string) => {
  await API.patch(`/admin/trainers/${trainerId}/status`, {profileStatus:'rejected', rejectReason})
}

export const getTrainerById = async (trainerId: string) => {
    const res = await API.get(`/admin/trainers/${trainerId}`);
    return res.data;
};


export const getTrainerApplication = async (trainerId: string) => {
    const res = await API.get(`/admin/trainers/${trainerId}/application`);
    return res.data;
};

export const getUsers = async (
  page: number,
  limit: number = 5,
  search: string = "",
  isBanned?: string,
  isVerified?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });
  if (isBanned) params.append("isBanned", isBanned);
  if (isVerified) params.append("isVerified", isVerified);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await API.get(`/admin/users?${params.toString()}`);
  return res.data;
};

export const toggleUserBan = async (userId: string, isBanned: boolean) => {
  await API.patch(`/admin/users/${userId}`, { isBanned });
  const res = await API.get(`/admin/users/${userId}`);
  return res.data;
};



export const getUserById = async (id: string) => {
    const res = await API.get(`/admin/users/${id}`);
    return res.data;
};

export const getGymApplication = async (gymId: string) => {
  const res = await API.get(`/admin/gyms/${gymId}/application`);
  return res.data;
};
