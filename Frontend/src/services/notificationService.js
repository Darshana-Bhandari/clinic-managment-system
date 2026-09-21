import axios from "../utils/axios.js"
import {io} from 'socket.io-client'



const API_URL = '/notifcations';


//get all notifications 
export const getNotifications = async (params={})=>{
    const response = await axios.get(API_URL, {params});
    return response.data.data;
}

// get Unread count
export const getUnreadCount = async()=>{
    const response = await axios.get(`${API_URL}/unread-count`);
    return response.data.data
}
//Marks as read
export const marksRead = async(noificationId) =>{
    const response = await axios.patch(`${API_URL}/${notificationId}/read`);
    return response.data.data;
}

//Marks all as read
export const marksAsRead = async()=>{
    const response = await axios.patch(`${API_URL}/marks-all-read`);
    return response.data.data
}

// delete all notifications
export const deleteNotifications = async(notificationId) =>{
    const response = await axios.delete(`${API_URL}/${notificationId}`);
    return response.data.data
}

//clear all notifications
export const clearNotifications= async()=>{
    const response = await axios.delete(`${API_URL}/clear-all`)
}


export default {
    getNotifications,
    getUnreadCount,
    marksAsRead,
    marksRead,
    deleteNotifications,
    clearNotifications
}
