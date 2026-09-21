import axios from '../utils/axios.js';

const API_URL = '/appointment';

const unwrap = (response) => response.data.data;

export const getAppointments = async (params = {}) => unwrap(await axios.get(API_URL, { params }));
export const getAppointment = async (id) => unwrap(await axios.get(`${API_URL}/${id}`));
export const bookAppointment = async (data) => unwrap(await axios.post(API_URL, data));
export const updateAppointment = async (id, data) => unwrap(await axios.put(`${API_URL}/${id}`, data));
export const cancelAppointment = async (id, reason) => unwrap(await axios.patch(`${API_URL}/${id}/cancel`, { reason }));