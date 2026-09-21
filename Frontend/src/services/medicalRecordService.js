import axios from '../utils/axios.js';

const API_URL = '/medical-record';


//medical recors crud operations

//get all medical-records

export const getAllMedicalRecords = async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data.data;
};

// medical record by id 
export const medicalRecordById = async (medicalId) => {
    const response = await axios.get(`${API_URL}/${medicalId}`);
    return response.data.data;
};

// create medicalrecord 
export const createMedicalRecord = async (medicalData) => {
    const response = await axios.post(API_URL, medicalData);
    return response.data.data;
};
//updateMedical record 
export const updateMedicalRecord = async (updateMedicalData, medicalId) => {
    const response = await axios.put(`${API_URL}/${medicalId}`, updateMedicalData);
    return response.data.data;
};
// delete medicalrecord
export const deleteMedicalRecord = async (medicalId) => {
    const response = await axios.delete(`${API_URL}/${medicalId}`);
    return response.data.data;
};

export const getPatientMedicalHistory = async (patientId, params = {}) => {
    const response = await axios.get(`${API_URL}/patient/${patientId}/history`, { params });
    return response.data.data;
};

export const createPrescription = async (data) => (await axios.post(`${API_URL}/prescription`, data)).data.data;
export const updatePrescription = async (id, data) => (await axios.put(`${API_URL}/prescription/${id}`, data)).data.data;
export const deletePrescription = async (id) => (await axios.delete(`${API_URL}/prescription/${id}`)).data.data;
export const createReport = async (data) => (await axios.post(`${API_URL}/report`, data, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
export const updateReport = async (id, data) => (await axios.put(`${API_URL}/report/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
export const deleteReport = async (id) => (await axios.delete(`${API_URL}/report/${id}`)).data.data;




