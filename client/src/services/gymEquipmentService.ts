import API from '@/lib/axios';
import { API_ROUTES } from '@/constants/api.constants';

export const getEquipments = async () => {
    const res = await API.get(API_ROUTES.GYM.EQUIPMENT.BASE);
    return res.data;
};

export const createEquipment = async (formData: FormData) => {
    const res = await API.post(API_ROUTES.GYM.EQUIPMENT.BASE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const updateEquipment = async (id: string, formData: FormData) => {
    const res = await API.put(API_ROUTES.GYM.EQUIPMENT.DETAIL(id), formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const deleteEquipment = async (id: string) => {
    const res = await API.delete(API_ROUTES.GYM.EQUIPMENT.DETAIL(id));
    return res.data;
};

export const toggleEquipmentAvailability = async (id: string) => {
    const res = await API.patch(API_ROUTES.GYM.EQUIPMENT.AVAILABILITY(id));
    return res.data;
};

export const getCategories = async () => {
    const res = await API.get(API_ROUTES.GYM.EQUIPMENT.CATEGORIES);
    return res.data;
};

export const createCategory = async (name: string) => {
    const res = await API.post(API_ROUTES.GYM.EQUIPMENT.CATEGORIES, { name });
    return res.data;
};

export const deleteCategory = async (id: string) => {
    const res = await API.delete(API_ROUTES.GYM.EQUIPMENT.CATEGORY_DETAIL(id));
    return res.data;
};
