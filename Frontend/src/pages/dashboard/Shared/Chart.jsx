import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/authHooks';

import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import {
  FiSend,
  FiSearch,
  FiArrowLeft,
  FiMoreVertical,
  FiImage,
  FiPaperclip,
  FiSmile,
} from 'react-icons/fi';

const Chat = () => {
  


  //  RENDER 
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading chats..." />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm overflow-hidden flex">
      //SIDEBAR: CONVERSATIONS 
      <aside
        className={`w-full md:w-80 border-r flex flex-col ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value=""
             
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === conv.user.id ? 'bg-blue-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {conv.user.avatar ? (
                      <img
                        src={conv.user.avatar}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {conv.user.fullName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  {conv.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {conv.user.fullName}
                    </h4>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ==================== MAIN: CHAT ==================== */}
      <main
        className={`flex-1 flex flex-col ${
          !showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiSend size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select a conversation
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Choose a conversation to start chatting
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white">
              <button
                onClick={() => {
                  setShowMobileChat(false);
                  setSelectedUser(null);
                }}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiArrowLeft size={20} />
              </button>

              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold">
                      {selectedUser.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                {selectedUser.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {selectedUser.fullName}
                </h3>
                <p className="text-xs text-gray-500">
                  {typingUser === selectedUser.id ? (
                    <span className="text-blue-600">typing...</span>
                  ) : selectedUser.isOnline ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiMoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date Divider */}
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 bg-white text-xs font-medium text-gray-500 rounded-full shadow-sm">
                        {formatDate(date)}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2">
                      {msgs.map((msg, i) => {
                        const isOwn = msg.isOwn || msg.senderId === user.id;
                        return (
                          <div
                            key={msg.id || i}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                              } ${msg.pending ? 'opacity-70' : ''}`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 ${
                                  isOwn ? 'text-blue-100' : 'text-gray-400'
                                }`}
                              >
                                <span className="text-xs">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isOwn && (
                                  <span className="text-xs">
                                    {msg.pending ? '⏳' : '✓✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {typingUser === selectedUser.id && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t bg-white flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <FiPaperclip size={20} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <FiImage size={20} />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>

              <button
                type="button"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <FiSmile size={20} />
              </button>

              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={18} />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default Chat;