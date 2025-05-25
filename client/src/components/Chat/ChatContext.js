import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Client } from '@stomp/stompjs';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState({}); // { [sessionId]: [message1, message2, ...] }
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      return null;
    }
    return token;
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('https://datn-sp25-4bee.onrender.com/api/refresh-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setError(null);
        return data.token;
      }
      throw new Error('Không thể làm mới token');
    } catch (err) {
      setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      return null;
    }
  };

  const startSession = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch('https://datn-sp25-4bee.onrender.com/api/chat/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          return startSession();
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.sessionId) {
        throw new Error('Không nhận được sessionId từ server');
      }

      setSessionId(data.sessionId);
      localStorage.setItem('chatSessionId', data.sessionId);
      setError(null);
      connectWebSocket(data.sessionId);
    } catch (error) {
      setError(`Lỗi khi tạo phiên chat: ${error.message}`);
      console.error('Lỗi khi tạo phiên chat:', error);
    }
  }, []);

  const loadSession = useCallback(async (sessionId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`https://datn-sp25-4bee.onrender.com/api/chat/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          return loadSession(sessionId);
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSessionId(sessionId);
        setMessages((prev) => ({
          ...prev,
          [sessionId]: data.context ? JSON.parse(data.context) : [],
        }));
        setError(null);
        connectWebSocket(sessionId);
      } else {
        localStorage.removeItem('chatSessionId');
        setError('Phiên chat không tồn tại. Tạo phiên mới.');
        startSession();
      }
    } catch (error) {
      setError(`Lỗi khi tải phiên chat: ${error.message}`);
      console.error('Lỗi khi tải phiên chat:', error);
    }
  }, []);

  const connectWebSocket = useCallback(
    (sessionId, retryCount = 0) => {
      if (client && client.connected) {
        client.deactivate();
      }

      const token = getToken();
      if (!token) return;

      const stompClient = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        onConnect: () => {
          setIsConnected(true);
          setError(null);
          stompClient.subscribe(`/topic/session/${sessionId}`, (message) => {
            try {
              const msg = JSON.parse(message.body);
              setMessages((prev) => ({
                ...prev,
                [sessionId]: [...(prev[sessionId] || []), msg],
              }));
            } catch (err) {
              console.error('Lỗi khi parse tin nhắn:', err);
            }
          });
        },
        onStompError: (frame) => {
          setIsConnected(false);
          setError(`Lỗi WebSocket: ${frame.headers?.message || frame}`);
          console.error('Lỗi STOMP:', frame);
          if (retryCount < 3) {
            setTimeout(() => connectWebSocket(sessionId, retryCount + 1), 5000);
          }
        },
        onWebSocketError: (error) => {
          setIsConnected(false);
          setError(`Lỗi kết nối WebSocket: ${error.message}`);
          console.error('Lỗi WebSocket:', error);
          if (retryCount < 3) {
            setTimeout(() => connectWebSocket(sessionId, retryCount + 1), 5000);
          }
        },
        onDisconnect: () => {
          setIsConnected(false);
          console.log('WebSocket ngắt kết nối');
        },
      });

      stompClient.activate();
      setClient(stompClient);
    },
    [client]
  );

  const sendMessage = useCallback(
    (sessionId, content, sender) => {
      if (!client || !client.connected) {
        setError('Không kết nối được với server. Vui lòng thử lại.');
        return;
      }

      try {
        client.publish({
          destination: `/app/chat/${sessionId}`,
          body: JSON.stringify({ sender, content, sessionId }),
        });
      } catch (error) {
        setError(`Lỗi khi gửi tin nhắn: ${error.message}`);
        console.error('Lỗi khi gửi tin nhắn:', error);
      }
    },
    [client]
  );

  useEffect(() => {
    return () => {
      if (client) {
        client.deactivate();
        setIsConnected(false);
      }
    };
  }, [client]);

  console.log('Exporting ChatProvider and useChat'); // Debug log
  return (
    <ChatContext.Provider
      value={{
        sessionId,
        messages,
        startSession,
        loadSession,
        sendMessage,
        error,
        isConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  console.log('useChat defined as:', typeof useChat); // Should log 'function'
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

console.log('Exported useChat:', useChat); // Debug log
