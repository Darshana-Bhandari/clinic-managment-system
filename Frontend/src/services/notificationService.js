import axios from '../utils/axios.js';

const API_URL = '/notification';


export const getNotifications = async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get(`${API_URL}/unread-count`);
    return response.data.data;
};

export const marksRead = async (notificationId) => {
    const response = await axios.patch(`${API_URL}/${notificationId}/read`);
    return response.data.data;
};

export const marksAsRead = async () => {
    const response = await axios.patch(`${API_URL}/mark-all-read`);
    return response.data.data;
};

export const deleteNotifications = async (notificationId) => {
    const response = await axios.delete(`${API_URL}/${notificationId}`);
    return response.data.data;
};

export const clearNotifications = async () => {
    const response = await axios.delete(`${API_URL}/clear-all`);
    return response.data.data;
};

export const markAsRead = marksRead;
export const markAllAsRead = marksAsRead;
export const deleteNotification = deleteNotifications;
export const clearAllNotifications = clearNotifications;

export default {
    getNotifications,
    getUnreadCount,
    marksRead,
    marksAsRead,
    deleteNotifications,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
};
