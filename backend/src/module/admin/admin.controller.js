import * as adminService from './admin.service.js';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
} from '../../utils/response.js';

const getActorId = (req) => req.user?.id || 'system';

const mapErr = (err) => {
  const msg = err.message || 'An error occurred';
  if (msg.includes('already exists')) return { status: 409, fn: conflictResponse };
  if (msg.includes('not found')) return { status: 404, fn: notFoundResponse };
  if (msg.includes('Cannot delete')) return { status: 409, fn: conflictResponse };
  return { status: 400, fn: errorResponse };
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await adminService.createAdmin(req.body, getActorId(req));
    return createdResponse(res, admin, 'Admin account created successfully');
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const listUsers = async (req, res) => {
  try {
    const data = await adminService.listUsers({ ...req.query });
    return successResponse(res, data, 'Users retrieved');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to retrieve users');
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return successResponse(res, user, 'User retrieved');
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body, getActorId(req));
    return successResponse(res, user, 'User updated');
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      getActorId(req)
    );
    return successResponse(res, user, 'User role updated');
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id, getActorId(req));
    return successResponse(
      res,
      user,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await adminService.deleteUser(req.params.id, getActorId(req));
    return successResponse(res, result, result.message);
  } catch (err) {
    const { status, fn } = mapErr(err);
    return fn(res, err.message, status);
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const data = await adminService.getAuditLogs({
      ...req.query,
      userId: req.query.userId,
      action: req.query.action,
    });
    return successResponse(res, data, 'Audit logs retrieved');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to retrieve audit logs');
  }
};