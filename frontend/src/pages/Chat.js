// src/pages/Chat.js - CHAT MODULE
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Users } from 'lucide-react';
import { getMyChats, getChatMessages, sendMessage } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      
      if (socket) {
        socket.emit('joinChat', selectedChat._id);
        socket.on('newMessage', handleNewMessage);
      }

      return () => {
        if (socket) {
          socket.emit('leaveChat', selectedChat._id);
          socket.off('newMessage', handleNewMessage);
        }
      };
    }
  }, [selectedChat, socket]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await getMyChats();
      setChats(res.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await getChatMessages(chatId);
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.chatId === selectedChat?._id) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const res = await sendMessage(selectedChat._id, {
        content: newMessage,
        messageType: 'text'
      });
      
      setMessages([...messages, res.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getChatPartner = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="grid grid-cols-12 h-full">
          {/* Chat List */}
          <div className="col-span-12 md:col-span-4 border-r dark:border-gray-700 overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <MessageSquare className="mr-2" />
                Messages
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="divide-y dark:divide-gray-700">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="mx-auto mb-2" size={48} />
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const partner = getChatPartner(chat);
                  return (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${
                        selectedChat?._id === chat._id ? 'bg-green-50 dark:bg-green-900' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {partner?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{partner?.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="col-span-12 md:col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getChatPartner(selectedChat)?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{getChatPartner(selectedChat)?.name}</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender._id === user._id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-white opacity-75' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-4" size={64} />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;