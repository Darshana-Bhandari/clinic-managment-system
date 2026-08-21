import * as medicalRecordService from "./medicalRecord.service.js";
import {successResponse, errorResponse,createdResponse,notFoundResponse} from "../../utils/response.js"


/// medical controllers
//create medical record
export const createMedicalRecord = async (req,res)=>{
    try{
        const recordData = req.body;
        const medicalRecord = await medicalRecordService.createMedicalRecord(recordData);
        return createdResponse(res,medicalRecord,"Medical record created successfully")
    }catch (error) {
        console.error('Create doctor error:', error);
        
        if (error.message === 'Patient not found'  || error.message === 'Doctor not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to create medical record');
        
    }
}


// get medical record by id
export const getMedicalRecordById = async (req,res)=>{
    try{
        const {id} = req.params;
        const medicalRecord = await medicalRecordService.getMedicalRecordById(id);
        return successResponse(res,medicalRecord,"Medical record fetched successfully")
    }catch (error) {
        console.error('Get medical record error:', error);
        
        if (error.message === 'Medical record not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to get medical record');
        
    }
}

// get all medical records
export const getAllMedicalRecords = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            patientId: req.query.patientId,
            doctorId: req.query.doctorId,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
            search: req.query.search,
        };
        const result = await medicalRecordService.getAllMedicalRecords(page, limit, filters);
        return successResponse(res,result,"Medical records fetched successfully")   
       
    }catch (error) {
        console.error('Get all medical records error:', error);
        
       return errorResponse(res, error.message || 'Failed to get medical records');
        
    }
}


// update medical record
export const updateMedicalRecord = async (req,res)=>{
    try{
        const {id} = req.params;
        const updateData = req.body;
        const updatedRecord = await medicalRecordService.updateMedicalRecord(id,updateData);
        return successResponse(res,updatedRecord,"Medical record updated successfully")
    }catch (error) {
        console.error('Update medical record error:', error);
        
        if (error.message === 'Medical record not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to update medical record');
        
    }
}

// delete medical record
export const deleteMedicalRecord = async (req,res)=>{
    try{
        const {id} = req.params;
        const deletedRecord = await medicalRecordService.deleteMedicalRecord(id);
        return successResponse(res,deletedRecord,"Medical record deleted successfully")
    }catch (error) {
        console.error('Delete medical record error:', error);
        
        if (error.message === 'Medical record not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to delete medical record');
        
    }
}

// prescription controllers
    // create prescription
export const createPrescription = async (req,res)=>{
    try{
        const prescriptionData = req.body;
        const prescription = await medicalRecordService.createPrescription(prescriptionData);
        return createdResponse(res,prescription,"Prescription created successfully")
    }catch (error) {
        console.error('Create prescription error:', error);
        
        if (error.message === 'Medical record not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to create prescription');
        
    }
}

// get prescription by id
export const getPrescriptionById = async (req,res)=>{
    try{
        const {id} = req.params;
        const prescription = await medicalRecordService.getPrescriptionById(id);
        return successResponse(res,prescription,"Prescription fetched successfully")
    }catch (error) {
        console.error('Get prescription error:', error);
        
        if (error.message === 'Prescription not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to get prescription');
        
    }
}

// update prescription
export const updatePrescription = async (req,res)=>{
    try{    
        const {id} = req.params;
        const updateData = req.body;
        const updatedPrescription = await medicalRecordService.updatePrescription(id,updateData);
        return successResponse(res,updatedPrescription,"Prescription updated successfully")
    }catch (error) {
        console.error('Update prescription error:', error);
        
        if (error.message === 'Prescription not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to update prescription');
        
    }
}

// delete prescription
export const deletePrescription = async (req,res)=>{
    try{
        const {id} = req.params;
        const deletedPrescription = await medicalRecordService.prescriptiondelete(id);
        return successResponse(res,deletedPrescription,"Prescription deleted successfully")
    }catch (error) {
        console.error('Delete prescription error:', error);
        
        if (error.message === 'Prescription not found') {
          return notFoundResponse(res, error.message);
        }
    
        
       return errorResponse(res, error.message || 'Failed to delete prescription');
        
    }
}

// report controllers
// create report
export const createReport = async (req,res)=>{
    try{
        const reportData = req.body;
        const report = await medicalRecordService.createReport(reportData);
        return createdResponse(res,report,"Report created successfully")
    } catch (error) {
        console.error('Create report error:', error);
        if (error.message === 'Medical record not found') {
          return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || 'Failed to create report');
    }
}

// get report by id
export const getReportById = async (req,res)=>{
    try{
        const {id} = req.params;
        const report = await medicalRecordService.getReportById(id);
        return successResponse(res,report,"Report fetched successfully")
    } catch (error) {
        console.error('Get report error:', error);
        if (error.message === 'Report not found') {
          return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || 'Failed to get report');
    }
}

// update report
export const updateReport = async (req,res)=>{
    try{    
        const {id} = req.params;
        const updateData = req.body;
        const updatedReport = await medicalRecordService.updateReport(id,updateData);
        return successResponse(res,updatedReport,"Report updated successfully")
    } catch (error) {
        console.error('Update report error:', error);
        if (error.message === 'Report not found') {
          return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || 'Failed to update report');
    }
}

// delete report
export const deleteReport = async (req,res)=>{
    try{
        const {id} = req.params;
        const deletedReport = await medicalRecordService.deleteReport(id);
        return successResponse(res,deletedReport,"Report deleted successfully")
    } catch (error) {
        console.error('Delete report error:', error);
        if (error.message === 'Report not found') {
          return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || 'Failed to delete report');
    }
}

// get patient medical history
export const getPatientMedicalHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const history = await medicalRecordService.getPatientMedicalHistory(patientId, page, limit);
        return successResponse(res, history, "Patient medical history fetched successfully");
    } catch (error) {
        console.error('Get patient history error:', error);
        return errorResponse(res, error.message || 'Failed to fetch patient history');
    }
}



