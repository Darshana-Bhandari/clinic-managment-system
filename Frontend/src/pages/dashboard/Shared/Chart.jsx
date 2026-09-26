import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/authHooks';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import {
  connectSocket, disConnectSocket, requestConversations, requestChatHistory,
  markConversationAsRead, onNewMessage, onHistory, onConversations, onTyping,
  onError, emitMessage, emitTyping,
} from '../../../services/chatService.js';
import { FiSend, FiSearch, FiArrowLeft, FiMoreVertical, FiImage, FiPaperclip, FiSmile, FiCheck, FiCheckCircle, FiPlus } from 'react-icons/fi';

const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
const formatDate = (value) => {
  const date = new Date(value);
  return date.toDateString() === new Date().toDateString()
    ? 'Today'
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const Avatar = ({ person, size = 'md' }) => {
  const dimensions = size === 'lg' ? 'h-11 w-11 text-base' : 'h-12 w-12 text-sm';
  return (
    <div className={`${dimensions} flex shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700`}>
      {person?.avatar ? <img src={person.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : person?.fullName?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};

const Chat = () => {
  const { userId } = useParams();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id;
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(Boolean(userId));
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationId = selectedUser?.id;

  const filteredConversations = useMemo(() => conversations.filter(({ user: conversationUser }) =>
    conversationUser.fullName?.toLowerCase().includes(search.toLowerCase())
  ), [conversations, search]);

  useEffect(() => {
    if (!accessToken) return undefined;
    connectSocket(accessToken);
    const removeConversations = onConversations(({ conversations: next = [] }) => {
      setConversations(next);
      setIsLoading(false);
      if (userId) {
        const match = next.find(({ user: conversationUser }) => conversationUser.id === userId);
        if (match) setSelectedUser(match.user);
      }
    });
    const removeHistory = onHistory(({ withUserId, messages: next = [] }) => {
      if (withUserId === selectedConversationId) setMessages(next);
    });
    const removeMessage = onNewMessage((message) => {
      const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;
      setConversations((previous) => previous.map((conversation) => {
        if (conversation.user.id !== otherUserId) return conversation;
        const active = conversation.user.id === selectedConversationId;
        return { ...conversation, lastMessage: message, lastMessageAt: message.createdAt,
          unreadCount: active || message.senderId === currentUserId ? conversation.unreadCount : (conversation.unreadCount || 0) + 1 };
      }));
      if (otherUserId === selectedConversationId) {
        setMessages((previous) => previous.some(({ id }) => id === message.id) ? previous : [...previous, message]);
        if (message.senderId !== currentUserId) markConversationAsRead(otherUserId, [message.id]);
      }
    });
    const removeTyping = onTyping(({ userId: senderId }) => {
      setTypingUser(senderId);
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => setTypingUser(null), 2500);
    });
    const removeError = onError(({ message }) => {
      setIsSending(false);
      toast.error(message || 'Chat connection error');
    });
    requestConversations();
    return () => {
      removeConversations?.(); removeHistory?.(); removeMessage?.(); removeTyping?.(); removeError?.();
      window.clearTimeout(typingTimeoutRef.current);
      disConnectSocket();
    };
  }, [accessToken, currentUserId, userId]);

  useEffect(() => {
    if (!selectedUser) return;
    setMessages([]);
    requestChatHistory(selectedUser.id);
    markConversationAsRead(selectedUser.id);
    setConversations((previous) => previous.map((conversation) =>
      conversation.user.id === selectedUser.id ? { ...conversation, unreadCount: 0 } : conversation
    ));
  }, [selectedUser]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typingUser]);

  const handleTyping = (event) => {
    const value = event.target.value;
    setNewMessage(value);
    if (selectedUser) emitTyping(selectedUser.id, Boolean(value.trim()));
  };
  const handleSend = (event) => {
    event.preventDefault();
    const message = newMessage.trim();
    if (!message || !selectedUser || isSending) return;
    setIsSending(true);
    emitMessage({ recipientId: selectedUser.id, message, type: 'text' });
    setNewMessage('');
    window.setTimeout(() => setIsSending(false), 800);
  };
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    groups[date] = [...(groups[date] || []), message];
    return groups;
  }, {});

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading chats..." /></div>;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm overflow-hidden flex">
      <aside className={`w-full md:w-80 border-r flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b"><div className="relative"><FiSearch className="absolute left-3 top-3 text-gray-400" /><input type="search" placeholder="Search conversations..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div></div>
        <div className="flex-1 overflow-y-auto">{filteredConversations.length === 0 ? <p className="p-8 text-center text-gray-500 text-sm">No conversations yet</p> : filteredConversations.map((conversation) => <button key={conversation.user.id} onClick={() => { setSelectedUser(conversation.user); setShowMobileChat(true); }} className={`w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50 ${selectedUser?.id === conversation.user.id ? 'bg-blue-50' : ''}`}><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><span className="text-blue-600 font-semibold">{conversation.user.fullName?.charAt(0) || 'U'}</span></div><div className="flex-1 text-left min-w-0"><div className="flex justify-between gap-2"><h4 className="text-sm font-semibold text-gray-900 truncate">{conversation.user.fullName}</h4><span className="text-xs text-gray-400">{formatTime(conversation.lastMessageAt)}</span></div><div className="flex justify-between gap-2 mt-1"><p className="text-xs text-gray-500 truncate">{conversation.lastMessage?.message || 'No messages yet'}</p>{conversation.unreadCount > 0 && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">{conversation.unreadCount}</span>}</div></div></button>)}</div>
      </aside>
      <main className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedUser ? <div className="flex-1 flex items-center justify-center text-center"><div><div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"><FiSend size={32} className="text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-900">Select a conversation</h3><p className="text-gray-500 text-sm mt-1">Choose a conversation to start chatting</p></div></div> : <>
          <header className="flex items-center gap-3 p-4 border-b"><button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg" aria-label="Back to conversations"><FiArrowLeft size={20} /></button><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 font-semibold">{selectedUser.fullName?.charAt(0) || 'U'}</span></div><div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 truncate">{selectedUser.fullName}</h3><p className="text-xs text-gray-500">{typingUser === selectedUser.id ? 'typing...' : selectedUser.role || 'Conversation'}</p></div><button className="p-2 hover:bg-gray-100 rounded-lg" aria-label="More conversation options"><FiMoreVertical size={20} /></button></header>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">{Object.entries(groupedMessages).map(([date, dateMessages]) => <div key={date}><div className="flex justify-center my-4"><span className="px-3 py-1 bg-white text-xs font-medium text-gray-500 rounded-full shadow-sm">{date}</span></div><div className="space-y-2">{dateMessages.map((message) => { const isOwn = message.senderId === currentUserId; return <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'}`}><p className="text-sm whitespace-pre-wrap break-words">{message.message}</p><span className={`block text-right text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>{formatTime(message.createdAt)}</span></div></div>; })}</div></div>)}<div ref={messagesEndRef} /></div>
          <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2"><button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Attach file"><FiPaperclip size={20} /></button><div className="flex-1"><input type="text" value={newMessage} onChange={handleTyping} placeholder="Type a message..." className="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm" /></div><button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Add image"><FiImage size={20} /></button><button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Add emoji"><FiSmile size={20} /></button><button type="submit" disabled={!newMessage.trim() || isSending} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message"><FiSend size={18} /></button></form>
        </>}
      </main>
    </div>
  );
};

export default Chat;