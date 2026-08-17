import * as patientService from "./patient.service.js"
import {conflictResponse, createdResponse, errorResponse, notFoundResponse, successResponse} from "../../utils/response.js"
import { MESSAGES } from "../../constans/messages.js"




export const createPatient = async (req, res) => {
    try {
        // userId must come from the authenticated user, not from req.body
        const userId = req.user?.id;
        if (!userId) {
            return errorResponse(res, "Unauthorized: user not authenticated");
        }

        const patient = await patientService.createPatient({ userId, ...req.body });

        return createdResponse(res, patient, 'Patient created successfully');
    }
    catch (error) {
        console.error('create patient error', error);

        if (error.message === 'User not found') {
            return notFoundResponse(res, error.message);
        }
        if (error.message === 'Patient profile already exists for this user') {
            return conflictResponse(res, error.message);
        }


        return errorResponse(res, error.message || "failed to create patient");
    }
}


/// get all patients
export const getAllPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const search = req.query.search;
        const gender = req.query.gender;
        const bloodGroup = req.query.bloodGroup;

        const result = await patientService.getAllPatients(page, limit, search, gender, bloodGroup);
        return successResponse(res, result, 'patients fetched successfully');
    }
    catch (error) {
        console.log("Get all patients error:", error);
        return errorResponse(res, error.message || 'failed to get all patients');
    }
}



// get patient by id
export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;  // FIX: extract id from req.params
        const patient = await patientService.getPatientById(id);
        return successResponse(res, patient, "patient fetched successfully");
    }
    catch (error) {
        console.log("Get patients by id error:", error);
        if (error.message === "Patient not found") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || "failed to get patient");
    }
}


// get patient by userId
export const getPatientByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const patient = await patientService.getPatientByUserId(userId);
        return successResponse(res, patient, "Patient fetched successfully");
    }
    catch (error) {
        console.log("Get patients by userId error:", error);
        if (error.message === "Patient not found for this user") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || "failed to get patient");
    }
}


// update patient
export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await patientService.updatePatient(id, req.body);
        return successResponse(res, patient, 'Patient updated successfully');
    }
    catch (error) {
        console.log("Update patients error:", error);
        if (error.message === "Patient not found") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || "failed to update patient");
    }
}


// delete patient
export const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await patientService.deletePatient(id);
        return successResponse(res, null, result.message);  // FIX: use result.message, not error.message
    }
    catch (error) {
        console.log("Delete patients error:", error);
        if (error.message === "Patient not found") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || "failed to delete patient");
    }
}


// get patient statistics
export const getPatientStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await patientService.getPatientStatistics(id);
        return successResponse(res, result, "patient statistics fetched successfully");  // FIX: result not statusbar
    }
    catch (error) {
        console.log("Get patients statistics error:", error);
        if (error.message === "Patient not found") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message || "failed to get patient statistics");
    }
}