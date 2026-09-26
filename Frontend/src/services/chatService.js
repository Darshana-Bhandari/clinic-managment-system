import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

let socket = null;


//socket connection

export const connectSocket= (token) =>{
    if(socket?.connected) return socket;


    socket =io(SOCKET_URL,{
        auth:{token},
        transports: ['websocket', 'polling'],
        reconnection:true,
        reconnectionAttempts:5

    })

    socket.on('connect', () => {
      if (import.meta.env.DEV) console.debug('[socket] connected', socket.id);
    });
    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) console.debug('[socket] disconnected', reason);
    });
    socket.on('socket_error', (err) => {
      if (import.meta.env.DEV) console.debug('[socket] connection error:', err?.message || err);
    });


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

export const requestConversations = () => socket?.emit('chat_conversations');

export const requestChatHistory = (withUserId, page = 1, limit = 50) =>
    socket?.emit('chat_history', { withUserId, page, limit });

export const markConversationAsRead = (conversationUserId, messageIds = []) =>
    socket?.emit('chat_message_read', { conversationUserId, messageIds });

export const onNewMessage = (callback) => {
    socket?.on('chat_message', callback);
    return () => socket?.off('chat_message', callback);
};

export const onMessageSent = (callback) => {
    socket?.on('chat_message_sent', callback);
    return () => socket?.off('chat_message_sent', callback);
};

export const onHistory = (callback) => {
    socket?.on('chat_history', callback);
    return () => socket?.off('chat_history', callback);
};

export const onConversations = (callback) => {
    socket?.on('chat_conversations', callback);
    return () => socket?.off('chat_conversations', callback);
};

export const onTyping = (callback) => {
    socket?.on('chat_typing', callback);
    return () => socket?.off('chat_typing', callback);
};

export const onError = (callback) => {
    socket?.on('error_event', callback);
    return () => socket?.off('error_event', callback);
};

export const emitMessage = (data) => socket?.emit('chat_message', data);

export const emitTyping = (recipientId, isTyping) => {
    socket?.emit(isTyping ? 'chat_typing' : 'chat_stop_typing', { recipientId });
};


export default {
    connectSocket,
    disConnectSocket,
    getSocket,
    requestConversations,
    requestChatHistory,
    markConversationAsRead,
    onNewMessage,
    onMessageSent,
    onHistory,
    onConversations,
    onTyping,
    onError,
    emitMessage,
    emitTyping,
}




