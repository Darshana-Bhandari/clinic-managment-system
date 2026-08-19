import * as departmentService from './department.service.js';
import { successResponse, errorResponse, createdResponse, notFoundResponse, conflictResponse } from '../../utils/response.js';

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    return createdResponse(res, department, 'Department created successfully');
  } catch (error) {
    if (error.message === 'Department with this name already exists' || error.message === 'Head doctor not found' || error.message === 'This doctor is already head of another department') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to create department');
  }
};

// Get All Departments
export const getAllDepartments = async (req, res) => {
  try {
    const query = req.query;
    const departments = await departmentService.getAllDepartments(query);
    return successResponse(res, departments, 'Departments fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get departments');
  }
};

// Get Department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentService.getDepartmentById(id);
    return successResponse(res, department, 'Department fetched successfully');
  } catch (error) {
    if (error.message === 'Department not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get department');
  }
};

// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentService.updateDepartment(id, req.body);
    return successResponse(res, department, 'Department updated successfully');
  } catch (error) {
    if (error.message === 'Department not found' || error.message === 'Head doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Department with this name already exists' || error.message === 'Department with this name is already taken' || error.message === 'This doctor is already head of another department') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to update department');
  }
};

// Get Department Doctors
export const getDepartmentDoctors = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const doctors = await departmentService.getDepartmentDoctors(id, page, limit);
    return successResponse(res, doctors, 'Department doctors fetched successfully');
  } catch (error) {
    if (error.message === 'Department not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get department doctors');
  }
};

// Add Doctor to Department
export const addDoctorToDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;
    const doctor = await departmentService.addDoctorToDepartment(id, doctorId);
    return successResponse(res, doctor, 'Doctor added to department successfully');
  } catch (error) {
    if (error.message === 'Department not found' || error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Doctor is already in this department') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to add doctor to department');
  }
};

// Remove Doctor from Department
export const removeDoctorFromDepartment = async (req, res) => {
  try {
    const { id, doctorId } = req.params;
    const doctor = await departmentService.removeDoctorFromDepartment(id, doctorId);
    return successResponse(res, doctor, 'Doctor removed from department successfully');
  } catch (error) {
    if (error.message === 'Department not found' || error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Doctor is not in this department') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to remove doctor from department');
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await departmentService.deleteDepartment(id);
    return successResponse(res, result, 'Department deleted successfully');
  } catch (error) {
    if (error.message === 'Department not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to delete department');
  }
};
