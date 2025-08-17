import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  UserIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'ai';
  sender_id: string;
  sender_name: string;
  sender_info: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  room_type: string;
}

const ChatRoom: React.FC = () => {
  const { projectId, roomId } = useParams<{ projectId: string; roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      setupSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocket = () => {
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Ошибка соединения с чатом');
    });

    setSocket(newSocket);
  };

  const fetchMessages = async () => {
    try {
      const [messagesRes, roomRes] = await Promise.all([
        axios.get(`/api/chat/rooms/${roomId}/messages`),
        axios.get(`/api/chat/rooms/${roomId}`),
      ]);

      setMessages(messagesRes.data);
      setChatRoom(roomRes.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Ошибка при загрузке сообщений');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    setSending(true);
    
    try {
      const messageData = {
        roomId,
        senderType: 'user',
        senderId: localStorage.getItem('userId') || 'user',
        content: newMessage.trim(),
        messageType: 'text'
      };

      socket.emit('send-message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Заголовок чата */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {chatRoom?.name || 'Чат'}
            </h1>
            <p className="text-sm text-gray-500 capitalize">
              {chatRoom?.room_type || 'general'} • {messages.length} сообщений
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-500">Онлайн</span>
          </div>
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Начните разговор
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Отправьте первое сообщение, и ИИ команда ответит вам.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.sender_type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`message-bubble ${
                  message.sender_type === 'user' ? 'message-user' : 'message-ai'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender_type === 'ai' && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                          <ComputerDesktopIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      {message.sender_type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {message.sender_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.sender_info}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                    {message.sender_type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="input w-full"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500">
          ИИ команда автоматически ответит на ваше сообщение
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
