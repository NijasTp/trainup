import API from '../lib/axios';
import { API_ROUTES } from '../constants/api.constants';

export const addProgress = async (formData: FormData) => {
    const res = await API.post(API_ROUTES.USER.PROGRESS.BASE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const getProgress = async (date?: string) => {
    const res = await API.get(API_ROUTES.USER.PROGRESS.BASE, {
        params: date ? { date } : {},
    });
    return res.data;
};

export const compareProgress = async () => {
    const res = await API.get(API_ROUTES.USER.PROGRESS.COMPARE);
    return res.data;
};
