import axios from '../utils/axios';

export const getBill = async (id) => {
  const response = await axios.get(`/billing/${id}`);
  return response.data;
};

export const getBillSummary = async () => {
  const response = await axios.get('/billing/summary');
  return response.data;
};