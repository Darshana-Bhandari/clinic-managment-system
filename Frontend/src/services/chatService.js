import axios from '../utils/axios.js'
import {io} from "socket.io-client"

const API_URL = '/chat'


const SOCKET_URL = process.env.SOCKET_URL;

let socket = null;


//socket connection

export const connectSocket= (token) =>{
    if(socket?.connected) return socket;


    socket =io(SOCKET_URL,{
        auth:{token},
        transports:['websocket','pooling'],
        reconnection:true,
        reconnectionAttempts:5

    })

    socket.on('connect',()=>{
        console.log('socket connected')
    })
     socket.on('disconnect',()=>{
        console.log('socket disconnected')
    })
     socket.on('socket_error',(err)=>{
        console.log('socket connecttion error:',err.message)
    })


    return socket 

}

//disconnectsocket 
export const disConnectSocket= () =>{
    if(socket){
        socket.disconnect();
        socket= null
    }
}

export const getSocket =() => socket;

//chat apis
export const getConversations = async ()=>{
    const response = await axios.get(`${API_URL}/conversations`);
    return response.data.data
}
//chat History
export const getChatHistory = async (userId, params={})=>{
    const response = await axios.get(`${API_URL}/history/${userId}`, {params});


    return response.data.data
}


//send message 
export const sendMessage = async (data)=>{
    const response = await axios.post(`${API_URL}/message`,data);
    return response.data.data
}

//marksmessageas read
export const marksMessageAsRead = async (messageId)=>{
    const response = await axios.patch(`${API_URL}/messages/${messageId}/read`);
    return response.data.data
}



//socket events
export const onNewMessage=(callback)=>{
    if(socket)
        socket.on('chat:message',callback)
}


export const onMessageSent = (callback)=>{
    if(socket)socket.on('chat:sent',callback)
}

export const onTyping = (callback) =>{
     if(socket)socket.on('chat:typing',callback)
}


export const emitMessage = (data) =>{
     if(socket)socket.emit('chat:message',data)
}
export const emitTyping = (recipientId, isTyping) =>{
     if(socket)socket.emit('chat:typing',{recipientId, isTyping})
}


export default {
    connectSocket,
    disConnectSocket,
    getSocket,
    getConversations,
    getChatHistory,
    sendMessage,
    marksMessageAsRead,
    onNewMessage,
    onMessageSent,
    onTyping,emitMessage,emitTyping
}




