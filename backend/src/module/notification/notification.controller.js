import * as notificationService from './notification.service.js';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../../utils/response.js';

export const listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const params = req.query;
    const result = await notificationService.listNotifications(userId, params);
    return successResponse(res, result, 'Notifications fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch notifications');
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await notificationService.getNotificationById(id, userId);
    return successResponse(res, notification, 'Notification fetched successfully');
  } catch (error) {
    if (error.message === 'Notification not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Forbidden') {
      return forbiddenResponse(res, 'You are not authorized to access this notification');
    }
    return errorResponse(res, error.message || 'Failed to fetch notification');
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await notificationService.markAsRead(id, userId);
    return successResponse(res, notification, 'Notification marked as read');
  } catch (error) {
    if (error.message === 'Notification not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Forbidden') {
      return forbiddenResponse(res, 'You are not authorized to access this notification');
    }
    return errorResponse(res, error.message || 'Failed to mark notification as read');
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);
    return successResponse(res, result, result.message);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to mark all notifications as read');
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getUnreadCount(userId);
    return successResponse(res, result, 'Unread count fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch unread count');
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await notificationService.deleteNotification(id, userId);
    return successResponse(res, result, 'Notification deleted successfully');
  } catch (error) {
    if (error.message === 'Notification not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Forbidden') {
      return forbiddenResponse(res, 'You are not authorized to delete this notification');
    }
    return errorResponse(res, error.message || 'Failed to delete notification');
  }
};

export const clearAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.clearAll(userId);
    return successResponse(res, result, result.message);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to clear notifications');
  }
};

export const createNotification = async (req, res) => {
  try {
    const payload = req.body;
    const notification = await notificationService.createNotification(payload);
    return successResponse(res, notification, 'Notification created successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to create notification');
  }
};