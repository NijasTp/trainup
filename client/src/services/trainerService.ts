import API from '@/lib/axios';
import { API_ROUTES } from '@/constants/api.constants';

export const getTrainerDetails = async () => {
  const res = await API.get(API_ROUTES.TRAINER.GET_DETAILS);
  return res.data;
}

export const reapplyTrainer = async (data: FormData) => {
  const res = await API.post(API_ROUTES.AUTH.TRAINER.REAPPLY, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
  return res.data;
};

export const updateTrainerProfile = async (data: FormData) => {
  const res = await API.put(API_ROUTES.TRAINER.PROFILE, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
  return res.data;
};

export interface ITrainerPasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changeTrainerPassword = async (data: ITrainerPasswordData) => {
  const res = await API.post(API_ROUTES.TRAINER.CHANGE_PASSWORD, data);
  return res.data;
};
