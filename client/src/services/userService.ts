import type { UpdateProfileData } from '@/interfaces/user/iUpdateProfile'
import API from '../lib/axios'

export const getTrainers = async (
  page: number,
  limit: number = 5,
  search: string = ''
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search
  })

  const url = `/user/trainers?${params.toString()}`

  const res = await API.get(url)
  return res.data
}

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

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await API.put("/user/update-profile", data);
  return response.data;
};
