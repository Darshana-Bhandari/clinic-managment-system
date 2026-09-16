import * as staffService from './staff.service.js';
import {
  createdResponse,
  successResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
} from '../../utils/response.js';

const getActorId = (req) => req.user?.id || 'system';

export const createStaff = async (req, res) => {
  try {
    const staff = await staffService.createStaff(req.body, getActorId(req));
    return createdResponse(res, staff, 'Staff account created successfully');
  } catch (err) {
    const msg = err.message || 'Failed to create staff member';
    if (msg.includes('already exists')) return conflictResponse(res, msg);
    if (msg.includes('not found')) return notFoundResponse(res, msg);
    return errorResponse(res, msg);
  }
};

export const listStaff = async (req, res) => {
  try {
    const data = await staffService.listStaff({ ...req.query });
    return successResponse(res, data, 'Staff members retrieved');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to retrieve staff members');
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    return successResponse(res, staff, 'Staff member retrieved');
  } catch (err) {
    const msg = err.message || 'Failed to retrieve staff member';
    if (msg.includes('not found')) return notFoundResponse(res, msg);
    return errorResponse(res, msg);
  }
};

export const updateStaff = async (req, res) => {
  try {
    const staff = await staffService.updateStaff(
      req.params.id,
      req.body,
      getActorId(req)
    );
    return successResponse(res, staff, 'Staff member updated');
  } catch (err) {
    const msg = err.message || 'Failed to update staff member';
    if (msg.includes('already exists')) return conflictResponse(res, msg);
    if (msg.includes('not found')) return notFoundResponse(res, msg);
    return errorResponse(res, msg);
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await staffService.toggleStaffStatus(
      req.params.id,
      getActorId(req)
    );
    return successResponse(
      res,
      staff,
      `Staff account ${staff.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    const msg = err.message || 'Failed to update staff status';
    if (msg.includes('not found')) return notFoundResponse(res, msg);
    return errorResponse(res, msg);
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const result = await staffService.deleteStaff(req.params.id, getActorId(req));
    return successResponse(res, result, result.message);
  } catch (err) {
    const msg = err.message || 'Failed to delete staff member';
    if (msg.includes('not found')) return notFoundResponse(res, msg);
    if (msg.includes('Cannot delete')) return conflictResponse(res, msg);
    return errorResponse(res, msg);
  }
};