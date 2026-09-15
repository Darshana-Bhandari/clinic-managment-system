import axios from '../utils/axios.js';

const API_URL = '/admin';
const STAFF_URL = '/staff';

// ==================== ADMIN: USER MANAGEMENT ====================

export const listUsers = async (params = {}) => {
  const response = await axios.get(`${API_URL}/users`, { params });
  return response.data.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data.data;
};

export const updateUser = async (userId, payload) => {
  const response = await axios.put(`${API_URL}/users/${userId}`, payload);
  return response.data.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
  return response.data.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await axios.patch(`${API_URL}/users/${userId}/status`);
  return response.data.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await axios.get(`${API_URL}/audit-logs`, { params });
  return response.data.data;
};

// ==================== ADMIN: STAFF MANAGEMENT ====================

export const listStaff = async (params = {}) => {
  const response = await axios.get(STAFF_URL, { params });
  return response.data.data;
};

export const getStaffById = async (staffId) => {
  const response = await axios.get(`${STAFF_URL}/${staffId}`);
  return response.data.data;
};

export const createStaff = async (payload) => {
  const response = await axios.post(STAFF_URL, payload);
  return response.data.data;
};

export const updateStaff = async (staffId, payload) => {
  const response = await axios.put(`${STAFF_URL}/${staffId}`, payload);
  return response.data.data;
};

export const toggleStaffStatus = async (staffId) => {
  const response = await axios.patch(`${STAFF_URL}/${staffId}/status`);
  return response.data.data;
};

export const deleteStaff = async (staffId) => {
  const response = await axios.delete(`${STAFF_URL}/${staffId}`);
  return response.data.data;
};