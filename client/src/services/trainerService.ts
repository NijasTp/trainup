import API from '@/lib/axios';


export const getTrainerDetails = async () => {
    const res = await API.get('/trainer/get-details');
    return res.data;
}

export const reapplyTrainer = async (data: FormData) => {
  const res = await API.post('/trainer/reapply', data, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
  return res.data;
};
