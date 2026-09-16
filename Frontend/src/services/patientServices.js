import axios from '../utils/axios.js';

const API_URL = '/patient';

const toPayload = (patientData, files = []) => {
  if (patientData instanceof FormData) return patientData;
  if (!files.length) return patientData;

  const formData = new FormData();
  Object.entries(patientData || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  files.forEach((file) => formData.append('files', file));
  return formData;
};

export const getAllPatients = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data.data;
};

export const getPatientById = async (patientId) => {
  const response = await axios.get(`${API_URL}/${patientId}`);
  return response.data.data;
};

export const getPatientProfile = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data.data;
};

export const createPatient = async (patientData, files = []) => {
  const payload = toPayload(patientData, files);
  const response = await axios.post(API_URL, payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data.data;
};

export const updatePatient = async (patientId, updateData, files = []) => {
  const payload = toPayload(updateData, files);
  const response = await axios.put(`${API_URL}/${patientId}`, payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data.data;
};

export const deletePatient = async (patientId) => {
  const response = await axios.delete(`${API_URL}/${patientId}`);
  return response.data.data;
};

export const getPatientStatistics = async (patientId) => {
  const response = await axios.get(`${API_URL}/${patientId}/statistics`);
  return response.data.data;
};