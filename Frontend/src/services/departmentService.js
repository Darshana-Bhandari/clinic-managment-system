import axios from '../utils/axios.js';

const API_URL = '/department';

export const getAllDepartments = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data.data;
};

export const getDepartmentById = async (departmentId) => {
  const response = await axios.get(`${API_URL}/${departmentId}`);
  return response.data.data;
};

export const getDepartmentDoctors = async (departmentId, params = {}) => {
  const response = await axios.get(`${API_URL}/${departmentId}/doctors`, { params });
  return response.data.data;
};

export const createDepartment = async (departmentData) => {
  const response = await axios.post(API_URL, departmentData);
  return response.data.data;
};

export const updateDepartment = async (departmentId, departmentData) => {
  const response = await axios.put(`${API_URL}/${departmentId}`, departmentData);
  return response.data.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await axios.delete(`${API_URL}/${departmentId}`);
  return response.data.data;
};

export const addDoctorToDepartment = async (departmentId, doctorId) => {
  const response = await axios.post(`${API_URL}/${departmentId}/doctors`, { doctorId });
  return response.data.data;
};

export const removeDoctorFromDepartment = async (departmentId, doctorId) => {
  const response = await axios.delete(`${API_URL}/${departmentId}/doctors/${doctorId}`);
  return response.data.data;
};