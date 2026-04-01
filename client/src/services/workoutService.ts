import API from '../lib/axios'
import { format } from 'date-fns'
import type { IWorkoutSession } from '@/interfaces/user/IUserWorkoutEdit'
import { API_ROUTES } from '@/constants/api.constants'

export const createWorkoutSession = async (
  sessionData: Partial<IWorkoutSession>
) => {
  const res = await API.post(API_ROUTES.WORKOUT.SESSIONS.BASE, sessionData)
  return res.data
}

export const getWorkoutDays = async (date: string) => {
  const res = await API.post(API_ROUTES.WORKOUT.DAYS, {
    date: format(date, 'yyyy-MM-dd')
  })
  return res.data
}

export const getWorkoutSession = async (sessionId: string) => {
  const res = await API.get(API_ROUTES.WORKOUT.SESSIONS.DETAIL(sessionId))
  return res.data
}

export const updateWorkoutSession = async (
  sessionId: string,
  payload: Partial<IWorkoutSession>
) => {
  const res = await API.patch(API_ROUTES.WORKOUT.SESSIONS.DETAIL(sessionId), payload)
  return res.data
}

export const fetchAdminWorkoutSessions = async () => {
  const res = await API.get(API_ROUTES.WORKOUT.ADMIN_TEMPLATES)
  return res.data
}

export const getAllSessions = async () => {
  const res = await API.get(API_ROUTES.WORKOUT.GET_SESSIONS, {
    params: {
      limit: 1000
    }
  })
  return res.data
}

export const getRecentWorkouts = async (limit: number = 4) => {
  const res = await API.get(API_ROUTES.WORKOUT.GET_SESSIONS, {
    params: {
      limit,
      page: 1
    }
  })
  return res.data
}
