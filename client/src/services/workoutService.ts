
import API from '../lib/axios'
import { format } from 'date-fns'
import type { IWorkoutSession } from '@/pages/user/UserWorkoutEdit'

export const createWorkoutSession = async (
  sessionData: any
) => {
  const res = await API.post('/workout/sessions', sessionData)
  return res.data
}

export const getWorkoutDays = async (date: string) => {
  const res = await API.post('/workout/days', {
    date: format(date, 'yyyy-MM-dd')
  })
  return res.data
}

export const getWorkoutSession = async (sessionId: string) => {
  const res = await API.get(`/workout/sessions/${sessionId}`)
  return res.data
}

export const updateWorkoutSession = async (
  sessionId: string,
  payload: Partial<IWorkoutSession>
) => {
  const res = await API.patch(`/workout/sessions/${sessionId}`, payload)
  return res.data
}

export const fetchAdminWorkoutSessions = async () => {
  const res = await API.get('/workout/admin/workout-templates')
  return res.data
}

export const getAllSessions = async () => {
  // Fetching with a large limit to get "all" sessions for the calendar history
  // Since pagination is implemented, this is a pragmatic way to get history without a dedicated "all" endpoint
  const res = await API.get('/workout/get-sessions', {
    params: {
      limit: 1000 // Large enough number to cover reasonable history
    }
  })
  return res.data
}
