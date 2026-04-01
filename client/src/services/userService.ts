import API from '../lib/axios'
import { API_ROUTES } from '../constants/api.constants'

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

  const url = `${API_ROUTES.USER.TRAINERS.LIST}?${params.toString()}`;
  const res = await API.get(url);
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get(API_ROUTES.USER.PROFILE)
  return res.data
}

export const getProfilePageData = async () => {
  const res = await API.get(API_ROUTES.USER.PROFILE_PAGE)
  return res.data
}

export const getIndividualTrainer = async (id: string) => {
  const res = await API.get(API_ROUTES.USER.TRAINERS.DETAIL(id))
  return res.data
}

export const getTrainer = async () => {
  const res = await API.get(API_ROUTES.USER.MY_TRAINER)
  return res.data
}

export const updateProfile = async (data: FormData) => {
  const response = await API.put(API_ROUTES.USER.UPDATE_PROFILE, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const addWeight = async (weight: number) => {
  const response = await API.post(API_ROUTES.USER.WEIGHT, { weight });
  return response.data;
}
export const getWeightHistory = async () => {
  const response = await API.get(API_ROUTES.USER.WEIGHT)
  return response.data
}

export const getTrainerRatings = async (id: string, page: number = 1, limit: number = 5) => {
  const response = await API.get(`${API_ROUTES.USER.TRAINERS.RATINGS(id)}?page=${page}&limit=${limit}`)
  return response.data
}

export const getGymRatings = async (id: string, page: number = 1, limit: number = 5) => {
  const response = await API.get(`${API_ROUTES.USER.GYM_RATINGS(id)}?page=${page}&limit=${limit}`)
  return response.data
}

export const addTrainerRating = async (trainerId: string, rating: number, message: string, subscriptionPlan?: string) => {
  const response = await API.post(API_ROUTES.USER.TRAINERS.ADD_RATING(trainerId), { rating, message, subscriptionPlan });
  return response.data;
};

export const addGymRating = async (gymId: string, rating: number, message: string, subscriptionPlan?: string) => {
  const response = await API.post(API_ROUTES.USER.ADD_GYM_RATING(gymId), { rating, message, subscriptionPlan });
  return response.data;
};

export const editReview = async (reviewId: string, rating: number, comment: string) => {
  const response = await API.put(API_ROUTES.USER.REVIEW(reviewId), { rating, comment });
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await API.delete(API_ROUTES.USER.REVIEW(reviewId));
  return response.data;
};

export const getActivityData = async () => {
  const response = await API.get(API_ROUTES.USER.ACTIVITY_DATA);
  return response.data;
};