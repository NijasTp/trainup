import API from '../lib/axios';

export const addProgress = async (formData: FormData) => {
    const res = await API.post('/user/progress', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const getProgress = async (date?: string) => {
    const res = await API.get('/user/progress', {
        params: date ? { date } : {},
    });
    return res.data;
};

export const compareProgress = async () => {
    const res = await API.get('/user/progress/compare');
    return res.data;
};
