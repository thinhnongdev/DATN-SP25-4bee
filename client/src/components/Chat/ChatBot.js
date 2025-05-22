import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Card,
  Badge,
  Spin,
  message as antdMessage,
  Space
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  AudioOutlined,
  ShoppingOutlined,
  SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const { Title, Text } = Typography;

// Cấu hình axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === 'ECONNABORTED',
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = (includeToken = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (includeToken && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const ChatBot = () => {
  // State chính
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Hàm lấy ảnh sản phẩm
  const fetchProductImage = async (productDetailId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/client/sanphamchitiet/${productDetailId}/hinhanh`,
      );
      return response.data.map((img) => img.anhUrl);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh sản phẩm:', error);
      return ['/default-product.jpg'];
    }
  };

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Khởi tạo giỏ hàng từ localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Theo dõi thay đổi giỏ hàng
  useEffect(() => {
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(updatedCart);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Tạo phiên chat mới khi mở chatbot
  useEffect(() => {
    if (isOpen && !sessionId) {
      const savedSessionId = localStorage.getItem('chatSessionId');
      if (savedSessionId) {
        setSessionId(savedSessionId);
        loadChatHistory(savedSessionId);
      } else {
        createChatSession();
      }
    }
  }, [isOpen]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0) scrollToBottom();
  }, [messages.length, isOpen, scrollToBottom]);

  // Tạo phiên chat mới
  const createChatSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/session`,
        {},
        { headers: getAuthHeaders(), timeout: 30000 }
      );

      const newSessionId = response.data.sessionId;
      if (!newSessionId) {
        throw new Error('Không nhận được sessionId từ server');
      }

      const verifyResponse = await axios.get(`${API_BASE_URL}/chat/session/${newSessionId}`, {
        headers: getAuthHeaders(),
        timeout: 30000,
      });

      if (verifyResponse.status !== 200 || !verifyResponse.data.sessionId) {
        throw new Error('Xác nhận phiên chat thất bại');
      }

      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      setMessages([
        {
          id: Date.now(),
          text: 'Chào bạn! Mình là 4BEE Bot. Mình có thể giúp gì cho bạn hôm nay?',
          sender: 'bot',
          options: [
            { text: '🔍 Tìm sản phẩm', action: 'search' },
            { text: '🛒 Xem giỏ hàng', action: 'viewCart' },
          ],
        },
      ]);
      loadChatHistory(newSessionId);
    } catch (error) {
      console.error('Lỗi khi tạo phiên chat:', error);
      antdMessage.error('Không thể tạo phiên chat: ' + (error.message || 'Vui lòng thử lại sau'));
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Tải lịch sử chat
  const loadChatHistory = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/session/${sessionId}`, {
        headers: getAuthHeaders(),
        timeout: 30000,
      });

      if (response.data?.messages?.length > 0) {
        const messagesWithIds = response.data.messages.map(msg => ({
          ...msg,
          id: msg.id || Date.now() + Math.random()
        }));
        setMessages(messagesWithIds);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chat:', error);
      if (error.response?.status === 404) {
        localStorage.removeItem('chatSessionId');
        setSessionId(null);
        createChatSession();
      }
    }
  };

  // Thêm tin nhắn từ bot
  const addBotMessage = useCallback((text, options = [], products = []) => {
    const messageId = Date.now() + Math.random();
    const newMessage = {
      id: messageId,
      text,
      sender: 'bot',
      options,
      products,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);

    if (sessionId) {
      axios.post(`${API_BASE_URL}/chat/session/${sessionId}/message`, newMessage, {
        headers: getAuthHeaders(),
      }).catch(error => {
        console.error('Lỗi khi lưu tin nhắn:', error);
      });
    }

    return messageId;
  }, [sessionId]);

  // Thêm tin nhắn từ người dùng
  const addUserMessage = useCallback((text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);

    if (sessionId) {
      axios.post(`${API_BASE_URL}/chat/session/${sessionId}/message`, newMessage, {
        headers: getAuthHeaders(),
      }).catch(error => {
        console.error('Lỗi khi lưu tin nhắn:', error);
      });
    }
  }, [sessionId]);

  // Gửi tin nhắn
  const sendMessageLogic = async (inputValue) => {
    if (!inputValue.trim()) {
      antdMessage.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    if (!sessionId) {
      antdMessage.error('Phiên chat chưa được tạo. Đang tạo phiên mới...');
      await createChatSession();
      return;
    }

    try {
      await axios.get(`${API_BASE_URL}/chat/session/${sessionId}`, {
        headers: getAuthHeaders(),
        timeout: 30000,
      });
    } catch (error) {
      console.error('Phiên chat không hợp lệ:', error);
      antdMessage.error('Phiên chat không hợp lệ. Đang tạo phiên mới...');
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
      await createChatSession();
      return;
    }

    const userMessage = inputValue;
    addUserMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        antdMessage.warning('Vui lòng đăng nhập để gửi tin nhắn.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/send`,
        { message: userMessage },
        {
          headers: {
            ...getAuthHeaders(),
            'Session-Id': sessionId,
          },
          timeout: 30000,
        }
      );

      if (response.data) {
        processBotResponse(response.data);
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      let errorMessage = 'Có lỗi xảy ra khi kết nối với hệ thống. Bạn vui lòng thử lại nhé!';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Hệ thống đang bận. Bạn muốn xem giỏ hàng hoặc tìm sản phẩm khác không?';
        addBotMessage(errorMessage, [
          { text: '🛒 Xem giỏ hàng', action: 'viewCart' },
          { text: '🔍 Tìm sản phẩm', action: 'search' },
        ]);
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        addBotMessage(errorMessage);
      } else if (error.response?.status === 404) {
        errorMessage = 'Phiên chat không tồn tại. Đang tạo phiên mới...';
        addBotMessage(errorMessage);
        localStorage.removeItem('chatSessionId');
        setSessionId(null);
        createChatSession();
      } else {
        addBotMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce gửi tin nhắn
  const sendMessage = useCallback(
    debounce((inputValue) => {
      sendMessageLogic(inputValue);
    }, 500),
    [sessionId, addUserMessage, addBotMessage]
  );

  // Nhận diện giọng nói
  const startVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      addBotMessage('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
      return;
    }

    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Lỗi nhận diện giọng nói:', event.error);
      let errorMessage = 'Có lỗi xảy ra khi nhận diện giọng nói.';
      if (event.error === 'no-speech') errorMessage = 'Không nhận được giọng nói, bạn thử lại nhé!';
      else if (event.error === 'not-allowed') errorMessage = 'Vui lòng cấp quyền sử dụng micro!';
      addBotMessage(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error('Lỗi khi bắt đầu nhận diện giọng nói:', error);
      addBotMessage('Không thể bắt đầu nhận giọng nói, vui lòng kiểm tra quyền micro!');
      setIsListening(false);
    }
  }, [addBotMessage, sendMessage]);

  // Xử lý phản hồi từ bot
  const processBotResponse = useCallback(
    (data) => {
      const text = data.text || 'Tôi có thể giúp gì thêm cho bạn?';
      const products = data.products || [];

      const sanitizedProducts = products.map((p) => ({
        id: p.id || 'unknown-id',
        maSanPham: p.maSanPham || 'SP-UNKNOWN',
        tenSanPham: p.tenSanPham || 'Sản phẩm không tên',
        gia: Number(p.gia) || 0,
        soLuong: Number(p.soLuong) || 0,
        images: p.images && p.images.length > 0 ? p.images : ['/default-product.jpg'],
        link: p.link || `/product/${p.id}`,
        khuyenMai: p.khuyenMai || null,
      }));

      addBotMessage(
        text,
        [
          { text: '🔍 Tìm sản phẩm khác', action: 'search' },
          { text: '🛒 Xem giỏ hàng', action: 'viewCart' },
        ],
        sanitizedProducts
      );
    },
    [addBotMessage]
  );

  // Xem giỏ hàng
  const handleViewCart = useCallback(async () => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

    if (currentCart.length === 0) {
      addBotMessage('🛒 Giỏ hàng của bạn đang trống. Bạn muốn tìm sản phẩm nào không?', [
        { text: '🔍 Tìm sản phẩm', action: 'search' },
      ]);
      return;
    }

    try {
      setLoading(true);
      const productRequests = currentCart.map((item) =>
        axios.get(`${API_BASE_URL}/client/chitietsanpham/${item.id}`)
      );
      const responses = await Promise.all(productRequests);
      const products = responses.map((res) => res.data);

      const sanitizedCart = await Promise.all(
        products.map(async (product) => {
          const images = await fetchProductImage(product.id);
          const cartItem = currentCart.find((item) => item.id === product.id);
          return {
            id: product.id || 'unknown-id',
            maSanPham: product.maSanPham || 'SP-UNKNOWN',
            tenSanPham: product.sanPham?.tenSanPham || 'Sản phẩm không tên',
            gia: Number(product.gia) || 0,
            quantity: Number(cartItem?.quantity) || 1,
            image: images[0] || '/default-product.jpg',
          };
        })
      );

      const cartItemsText = sanitizedCart
        .map(
          (item, index) =>
            `${index + 1}. ${item.tenSanPham}\n` +
            `   - Số lượng: ${item.quantity}\n` +
            `   - Đơn giá: ${item.gia.toLocaleString('vi-VN')}đ`
        )
        .join('\n\n');

      const cartTotal = sanitizedCart.reduce((sum, item) => sum + item.gia * item.quantity, 0);

      addBotMessage(
        `🛒 GIỎ HÀNG CỦA BẠN (${sanitizedCart.length} sản phẩm)\n\n` +
        `${cartItemsText}\n\n` +
        `💳 TỔNG CỘNG: ${cartTotal.toLocaleString('vi-VN')}đ`,
        [
          { text: '🛍️ Tiếp tục mua', action: 'search' },
          { text: '📦 Đặt hàng', action: 'checkout' },
        ]
      );
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
      addBotMessage('Có lỗi xảy ra khi tải giỏ hàng. Vui lòng thử lại!', [
        { text: '🔍 Tìm sản phẩm', action: 'search' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [addBotMessage]);

  // Xử lý các hành động nhanh
  const handleQuickAction = useCallback(
    (action) => {
      switch (action) {
        case 'viewCart':
          handleViewCart();
          break;
        case 'search':
          addBotMessage("Bạn muốn tìm sản phẩm gì? Ví dụ: 'Tìm áo thun nam dưới 200k'");
          break;
        case 'checkout':
          addBotMessage('Bạn có thể thanh toán bằng cách nhấn vào giỏ hàng ở góc trên bên phải màn hình và chọn "Thanh toán".');
          break;
        default:
          addBotMessage('Hành động này chưa được hỗ trợ. Bạn cần gì khác không?');
      }
    },
    [addBotMessage, handleViewCart]
  );

  // Render chính
  if (!isOpen) {
    return (
      <div className="chatbot-launcher">
        <Badge count={cart.length} size="small" offset={[-5, 5]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={() => setIsOpen(true)}
            className="chatbot-button"
            style={{
              background: '#1a94ff',
              boxShadow: '0 4px 12px rgba(26, 148, 255, 0.4)'
            }}
          />
        </Badge>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <Space>
          <Title level={5} style={{ color: 'white', margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            4BEE Shopping Assistant
          </Title>
        </Space>

        <Space>
          <Button
            type="text"
            icon={<ShoppingOutlined />}
            onClick={handleViewCart}
            style={{ color: 'white' }}
          />

          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setIsOpen(false)}
            style={{ color: 'white' }}
          />
        </Space>
      </div>

      {/* Layout chính */}
      <div className="chatbot-layout">
        <div className="chat-panel">
          <div className="chatbot-messages">
            {loading && <Spin style={{ margin: '10px auto', display: 'block' }} />}

            <List
              dataSource={messages}
              renderItem={(msg, index) => (
                <List.Item
                  key={msg.id}
                  className={`message-item ${msg.sender}`}
                  style={{ padding: '8px 16px' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={40}
                        icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                        className="message-avatar"
                        style={{
                          backgroundColor: msg.sender === 'user' ? '#1a94ff' : '#f0f0f0',
                          color: msg.sender === 'user' ? 'white' : '#333'
                        }}
                      />
                    }
                    description={
                      <div className="message-content">
                        <div
                          className="message-text"
                          style={{
                            whiteSpace: 'pre-wrap',
                            backgroundColor: msg.sender === 'user' ? '#1a94ff' : 'white',
                            color: msg.sender === 'user' ? 'white' : '#333',
                            padding: '10px 15px',
                            borderRadius: msg.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                            boxShadow: msg.sender === 'user' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {msg.text}
                        </div>

                        {msg.products && msg.products.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              overflowX: 'auto',
                              padding: '10px 0',
                              gap: 12,
                              marginTop: 8,
                            }}
                          >
                            {msg.products.map(product => (
                              <Card
                                key={product.id}
                                hoverable
                                style={{
                                  minWidth: 150,
                                  width: 150,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                                cover={
                                  <img
                                    alt={product.tenSanPham}
                                    src={product.images[0]}
                                    style={{ height: 120, objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = '/default-product.jpg';
                                    }}
                                  />
                                }
                                onClick={() => navigate(product.link)}
                              >
                                <Card.Meta
                                  description={
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                      <Text ellipsis={{ tooltip: product.tenSanPham }} style={{ fontSize: 12 }}>
                                        {product.tenSanPham}
                                      </Text>
                                      <Text strong style={{ color: '#d70018', fontSize: 12 }}>
                                        {product.khuyenMai ? product.khuyenMai.toLocaleString('vi-VN') : product.gia.toLocaleString('vi-VN')}đ
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 10 }}>
                                        CHÍNH HÃNG
                                      </Text>
                                    </Space>
                                  }
                                />
                              </Card>
                            ))}
                          </div>
                        )}

                        {msg.options && (
                          <div className="quick-replies">
                            {msg.options.map((option, i) => (
                              <Button
                                key={i}
                                size="small"
                                onClick={() => handleQuickAction(option.action)}
                                type="default"
                                style={{
                                  borderRadius: 20,
                                  margin: '4px 4px 4px 0'
                                }}
                              >
                                {option.text}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={() => sendMessage(input)}
              placeholder="Nhập tin nhắn hoặc yêu cầu..."
              disabled={loading}
              prefix={
                <Button
                  type="text"
                  icon={<AudioOutlined spin={isListening} />}
                  onClick={startVoiceInput}
                  disabled={isListening}
                  style={{ color: isListening ? '#1a94ff' : '#666' }}
                />
              }
              suffix={
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={() => handleQuickAction('search')}
                  title="Tìm sản phẩm"
                />
              }
              style={{ borderRadius: 20 }}
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => sendMessage(input)}
              loading={loading}
              disabled={!input.trim() || loading}
              style={{
                borderRadius: '50%',
                width: 40,
                height: 40,
                minWidth: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;