import axios from '../utils/axios.js';

const API_URL = '/auth';

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data.data;
};

export const adminLogin = async (credentials) => {
  const response = await axios.post(`${API_URL}/admin/login`, credentials);
  return response.data.data;
};

export const verifyAdminLogin = async (email, otp) => {
  const response = await axios.post(`${API_URL}/admin/verify-login`, { email, otp });
  return response.data.data;
};

export const logout = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data.data;
};

export const refreshToken = async (refreshTokenValue) => {
  const response = await axios.post(`${API_URL}/refresh-token`, {
    refreshToken: refreshTokenValue,
  });
  return response.data.data;
};

export const verifyEmail = async (email, otp) => {
  const response = await axios.post(`${API_URL}/verify-email`, { email, otp });
  return response.data.data;
};

export const resendVerification = async (email) => {
  const response = await axios.post(`${API_URL}/resend-verification`, { email });
  return response.data.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data.data;
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, {
    email,
    otp,
    newPassword,
    confirmPassword: confirmPassword || newPassword,
  });
  return response.data.data;
};

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`);
  return response.data.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData, {
    headers: {
      'Content-Type':
        profileData instanceof FormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data.data;
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await axios.post(`${API_URL}/change-password`, {
    currentPassword,
    newPassword,
    confirmPassword: confirmPassword || newPassword,
  });
  return response.data.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};