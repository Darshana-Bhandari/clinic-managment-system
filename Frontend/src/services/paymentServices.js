import axios from '../utils/axios';

const API_URL = '/payments';

// ==================== CASH PAYMENT ====================

export const processPayment = async (paymentData) => {
  const response = await axios.post(API_URL, paymentData);
  return response.data.data;
};

export const getAllPayments = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await axios.get(`${API_URL}/${paymentId}`);
  return response.data.data;
};

export const getPaymentsByBill = async (billId, params = {}) => {
  const response = await axios.get(`${API_URL}/bill/${billId}`, { params });
  return response.data.data;
};

export const getPatientPaymentHistory = async (patientId, params = {}) => {
  const response = await axios.get(`${API_URL}/patient/${patientId}`, { params });
  return response.data.data;
};

export const getPaymentSummary = async (params = {}) => {
  const response = await axios.get(`${API_URL}/summary`, { params });
  return response.data.data;
};

export const refundPayment = async (paymentId, refundData) => {
  const response = await axios.post(`${API_URL}/${paymentId}/refund`, refundData);
  return response.data.data;
};

export const updatePayment = async (paymentId, updateData) => {
  const response = await axios.put(`${API_URL}/${paymentId}`, updateData);
  return response.data.data;
};

export const deletePayment = async (paymentId) => {
  const response = await axios.delete(`${API_URL}/${paymentId}`);
  return response.data.data;
};

export const getTransactionHistory = async (params = {}) => {
  const response = await axios.get(`${API_URL}/transactions`, { params });
  return response.data.data;
};

export const downloadTransactionsCSV = async () => {
  return axios.get(`${API_URL}/transactions/export/csv`, { responseType: 'blob' });
};

// ==================== KHALTI PAYMENT ====================

export const initiateKhaltiPayment = async (paymentData) => {
  const response = await axios.post('/khalti/initiate', paymentData);
  return response.data.data;
};

export const verifyKhaltiPayment = async (pidx) => {
  const response = await axios.get(`/khalti/verify/${pidx}`);
  return response.data.data;
};

export const getKhaltiPaymentStatus = async (pidx) => {
  const response = await axios.get(`/khalti/status/${pidx}`);
  return response.data.data;
};

// ==================== ESEWA PAYMENT ====================

export const initiateEsewaPayment = async (paymentData) => {
  const response = await axios.post('/esewa/initiate', paymentData);
  return response.data.data;
};

export const verifyEsewaPayment = async (payload) => {
  const response = await axios.post('/esewa/verify', payload);
  return response.data.data;
};

export const getEsewaPaymentStatus = async (transactionUuid) => {
  const response = await axios.get(`/esewa/status/${transactionUuid}`);
  return response.data.data;
};

export default {
  processPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByBill,
  getPatientPaymentHistory,
  getPaymentSummary,
  refundPayment,
  updatePayment,
  deletePayment,
  getTransactionHistory,
  downloadTransactionsCSV,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getKhaltiPaymentStatus,
  initiateEsewaPayment,
  verifyEsewaPayment,
  getEsewaPaymentStatus,
};