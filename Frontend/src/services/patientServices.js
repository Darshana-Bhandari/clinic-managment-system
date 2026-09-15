import axios from "../utils/axios.js"



const API_URL = '/patients'      // localhost:5000/api/patients

//get all patients
export const getAllPatients = async(params={}) =>{
    const response = await axios.get(API_URL,{params});
    return response.data.data;
}

// get patients with ID
export const getPatientById = async(patientId)=>{
    const resposne = await axios.get(`${API_URL}/${patientId}`);
    return response.data.data
}

// get my patient profile 
export const getPatientProfile = async ()=>{
     const resposne = await axios.get(`${API_URL}/me`);
     return response.data.data
}

//create patient
export const createPatient = async(patientData) =>{
    const response = await axios.post(API_URL,patientData);
    return response.data.data
}

//update Patient
export const updatePatient = async(patientId,updateData) =>{
    const response = await axios.put(`${API_URL}/${patientId}`,updateData)
    return response.data.data
}

// delete Patient
export const deletePatient = async (patientId)=>{
    const response = await axios.delete(`${API_URL}/${patientId}`)
    return response.data;
}

// get patient statistics
export const getPatientStatistics = async(patientId)=>{
    const response = await axios.get(`${API_URL}/${patientId}/statistics`);
    return response.data.data
}