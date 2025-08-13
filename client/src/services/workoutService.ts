import type { WorkoutSessionPayload } from '@/pages/user/AddWorkoutSession';
import API from '../lib/axios'; 

export const createWorkoutSession = async (sessionData:WorkoutSessionPayload) => {
  const res = await API.post('/workout/sessions', sessionData);
  return res.data; 
};