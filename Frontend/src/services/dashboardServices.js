import axios from '../utils/axios.js';

const API_URL = '/dashboard';

export const getDashboardStats = async (params = {}) => {
  const response = await axios.get(`${API_URL}/statistics`, { params });
  return response.data.data;
};

export const getDailySummary = async () => {
  const response = await axios.get(`${API_URL}/daily-summary`);
  return response.data.data;
};

export const getRevenueReport = async (params = {}) => {
  const response = await axios.get(`${API_URL}/revenue`, { params });
  return response.data.data;
};

export const getDoctorLoad = async (params = {}) => {
  const response = await axios.get(`${API_URL}/doctor-load`, { params });
  return response.data.data;
};