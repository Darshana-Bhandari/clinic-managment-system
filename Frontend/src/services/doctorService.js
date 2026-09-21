import axios from '../utils/axios.js';

const API_URL = '/doctor';

const appendField = (formData, key, value) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
};

const toMultipartPayload = (data, files = {}) => {
    if (data instanceof FormData) return data;

    const profilePicture = Array.isArray(files)
        ? files[0]
        : files.profilePicture || files.avatar;
    const certificates = Array.isArray(files)
        ? files.slice(1)
        : files.certificates || [];

    if (!profilePicture && certificates.length === 0) return data;

    const formData = new FormData();
    Object.entries(data || {}).forEach(([key, value]) => appendField(formData, key, value));
    if (profilePicture) formData.append('profilePicture', profilePicture);
    certificates.forEach((certificate) => formData.append('certificates', certificate));
    return formData;
};

const requestConfig = (payload) => (
    payload instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
);

export const getAllDoctors = async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data.data;
};

export const getAllPublicDoctors = async (params = {}) => {
    const response = await axios.get(`${API_URL}/public`, { params });
    return response.data.data;
};

export const getDoctorById = async (doctorId) => {
    const response = await axios.get(`${API_URL}/${doctorId}`);
    return response.data.data;
};

export const getPublicDoctorById = async (doctorId) => {
    const response = await axios.get(`${API_URL}/public/${doctorId}`);
    return response.data.data;
};

// Backwards-compatible alias for the original misspelled export.
export const getDocotrById = getPublicDoctorById;

export const getMyDoctorProfile = async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data.data;
};

export const createDoctor = async (doctorData, files = {}) => {
    const payload = toMultipartPayload(doctorData, files);
    const response = await axios.post(API_URL, payload, requestConfig(payload));
    return response.data.data;
};

export const submitDoctorOnboarding = async (doctorData, files = {}) => {
    const payload = toMultipartPayload(doctorData, files);
    const response = await axios.post(`${API_URL}/onboarding`, payload, requestConfig(payload));
    return response.data.data;
};

export const updateDoctor = async (doctorId, updateData, files = {}) => {
    const payload = toMultipartPayload(updateData, files);
    const response = await axios.put(`${API_URL}/${doctorId}`, payload, requestConfig(payload));
    return response.data.data;
};

export const deleteDoctor = async (doctorId) => {
    const response = await axios.delete(`${API_URL}/${doctorId}`);
    return response.data.data;
};

export const rateDoctor = async (doctorId, rating, review) => {
    const response = await axios.post(`${API_URL}/${doctorId}/rate`, { rating, review });
    return response.data.data;
};

export const getDoctorStatistics = async (doctorId) => {
    const response = await axios.get(`${API_URL}/${doctorId}/statistics`);
    return response.data.data;
};

export const getDoctorAvailability = async (doctorId) => {
    const response = await axios.get(`${API_URL}/${doctorId}/availability`);
    return response.data.data;
};