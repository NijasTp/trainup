import API from '../lib/axios';

export interface TemplateQuery {
    page?: number;
    limit?: number;
    search?: string;
    bodyType?: string;
    goal?: string;
    difficulty?: string;
}

export const getWorkoutTemplates = async (query: TemplateQuery = {}) => {
    const res = await API.get('/template/workout', { params: query });
    return res.data;
};

export const getWorkoutTemplateById = async (id: string) => {
    const res = await API.get(`/template/workout/${id}`);
    return res.data;
};

export const startWorkoutTemplate = async (templateId: string) => {
    const res = await API.post('/template/workout/start', { templateId });
    return res.data;
};

export const stopWorkoutTemplate = async () => {
    const res = await API.post('/template/workout/stop');
    return res.data;
};

export const getDietTemplates = async (query: TemplateQuery = {}) => {
    const res = await API.get('/template/diet', { params: query });
    return res.data;
};

export const getDietTemplateById = async (id: string) => {
    const res = await API.get(`/template/diet/${id}`);
    return res.data;
};

export const startDietTemplate = async (templateId: string) => {
    const res = await API.post('/template/diet/start', { templateId });
    return res.data;
};

export const stopDietTemplate = async () => {
    const res = await API.post('/template/diet/stop');
    return res.data;
};
