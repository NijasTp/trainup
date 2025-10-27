import API from '@/lib/axios'


export const getGymDetails= async ()=>{
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
  return res.data ;
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



// Get single gym
export const getGymById = async (gymId: string) => {
  const res = await API.get(`/admin/gyms/${gymId}`);
  return res.data ;
};