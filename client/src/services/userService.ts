import API from '../lib/axios'

export const getTrainers = async (
  page: number,
  limit: number = 1,
  search: string = '',
  specialization: string = '',
  experience: string = '',
  minRating: string = '',
  minPrice: string = '',
  maxPrice: string = ''
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    specialization,
    experience,
    minRating,
    minPrice,
    maxPrice,
  });

  const url = `/user/trainers?${params.toString()}`;
  const res = await API.get(url);
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get('/user/get-profile')
  return res.data
}

export const getIndividualTrainer = async (id: string) => {
  const res = await API.get(`/user/trainers/${id}`)
  return res.data
}

export const getTrainer = async () => {
  const res = await API.get('/user/my-trainer')
  return res.data
}

export const updateProfile = async (data: FormData) => {
  const response = await API.put("/user/update-profile", data);
  return response.data;
};

export const addWeight = async (weight: number) => {
  const response = await API.post("/user/weight", { weight });
  return response.data;
}
export const getWeightHistory = async () => {
  const response = await API.get("/user/weight")
  return response.data
}

export const getGymRatings = async (id: string) => {
  const response = await API.get(`/user/gym/ratings/${id}`)
  return response.data
}

export const addTrainerRating = async (trainerId: string, rating: number, comment: string, subscriptionPlan?: string) => {
  const response = await API.post("/user/rate-trainer", { trainerId, rating, comment, subscriptionPlan });
  return response.data;
};

export const addGymRating = async (gymId: string, rating: number, comment: string, subscriptionPlan?: string) => {
  const response = await API.post("/user/rate-gym", { gymId, rating, comment, subscriptionPlan });
  return response.data;
};