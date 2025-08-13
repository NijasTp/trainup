import API from '@/lib/axios';


export const getTrainerDetails = async () => {
    const res = await API.get('/trainer/get-details');
    return res.data;
}