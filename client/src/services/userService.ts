import API from '../lib/axios';

export const getTrainers = async (
  page: number,
  limit: number = 5,
  search: string = "",

) => {

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search, 
  });


  const url = `/user/trainers?${params.toString()}`;

  const res = await API.get(url);
  return res.data;
};


