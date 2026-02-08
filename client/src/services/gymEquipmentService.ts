import API from '@/lib/axios';

export const getEquipments = async () => {
    const res = await API.get('/gym/equipment');
    return res.data;
};

export const createEquipment = async (formData: FormData) => {
    const res = await API.post('/gym/equipment', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const updateEquipment = async (id: string, formData: FormData) => {
    const res = await API.put(`/gym/equipment/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const deleteEquipment = async (id: string) => {
    const res = await API.delete(`/gym/equipment/${id}`);
    return res.data;
};

export const toggleEquipmentAvailability = async (id: string) => {
    const res = await API.patch(`/gym/equipment/${id}/availability`);
    return res.data;
};

export const getCategories = async () => {
    const res = await API.get('/gym/equipment-categories');
    return res.data;
};

export const createCategory = async (name: string) => {
    const res = await API.post('/gym/equipment-categories', { name });
    return res.data;
};

export const deleteCategory = async (id: string) => {
    const res = await API.delete(`/gym/equipment-categories/${id}`);
    return res.data;
};
