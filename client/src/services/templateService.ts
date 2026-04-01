import API from '../lib/axios';
import { API_ROUTES } from '../constants/api.constants';

export interface TemplateQuery {
    page?: number;
    limit?: number;
    search?: string;
    bodyType?: string;
    goal?: string;
    difficulty?: string;
}

export const getWorkoutTemplates = async (query: TemplateQuery = {}) => {
    const res = await API.get(API_ROUTES.TEMPLATE.WORKOUT.BASE, { params: query });
    return res.data;
};

export const getWorkoutTemplateById = async (id: string) => {
    const res = await API.get(API_ROUTES.TEMPLATE.WORKOUT.DETAIL(id));
    return res.data;
};

export const startWorkoutTemplate = async (templateId: string) => {
    const res = await API.post(API_ROUTES.TEMPLATE.WORKOUT.START, { templateId });
    return res.data;
};

export const stopWorkoutTemplate = async () => {
    const res = await API.post(API_ROUTES.TEMPLATE.WORKOUT.STOP);
    return res.data;
};

export const toggleWorkoutTemplate = async (templateId: string) => {
    const res = await API.put(API_ROUTES.USER.WORKOUT_TEMPLATE_TOGGLE, { templateId });
    return res.data;
};

export const getDietTemplates = async (query: TemplateQuery = {}) => {
    const res = await API.get(API_ROUTES.TEMPLATE.DIET.BASE, { params: query });
    return res.data;
};

export const getDietTemplateById = async (id: string) => {
    const res = await API.get(API_ROUTES.TEMPLATE.DIET.DETAIL(id));
    return res.data;
};

export const startDietTemplate = async (templateId: string) => {
    const res = await API.post(API_ROUTES.TEMPLATE.DIET.START, { templateId });
    return res.data;
};

export const stopDietTemplate = async () => {
    const res = await API.post(API_ROUTES.TEMPLATE.DIET.STOP);
    return res.data;
};
