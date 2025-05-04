import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Divider,
  Tag,
  Space,
  Drawer
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  AudioOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { debounce } from 'lodash';
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
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      localStorage.removeItem('chatSessionId');
      setSessionId(null);

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
          text: 'Chào bạn! Mình là 4BEE Bot. Mình có thể giúp gì cho bạn hôm nay?',
          sender: 'bot',
          options: [
            { text: '🔍 Tìm sản phẩm', action: 'search' },
            { text: '🛒 Xem giỏ hàng', action: 'viewCart' },
            { text: 'ℹ️ Xem chi tiết sản phẩm', action: 'productDetail' },
          ],
        },
      ]);
      loadChatHistory(newSessionId);
      antdMessage.success('Tạo phiên chat thành công!');
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
        setMessages(response.data.messages);
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
  const addBotMessage = useCallback((text, options = [], products = [], product = null) => {
    const newMessage = { 
      text, 
      sender: 'bot', 
      options, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    if (products.length > 0 || product) {
      setCurrentProducts(products);
      setCurrentProduct(product || null);
      if (isMobile) {
        setProductDrawerVisible(true);
      } else {
        setShowProductPanel(true);
      }
    }
    
    // Lưu vào lịch sử
    if (sessionId) {
      axios.post(`${API_BASE_URL}/chat/session/${sessionId}/message`, newMessage, {
        headers: getAuthHeaders(),
      }).catch(error => {
        console.error('Lỗi khi lưu tin nhắn:', error);
      });
    }
  }, [sessionId, isMobile]);

  // Thêm tin nhắn từ người dùng
  const addUserMessage = useCallback((text) => {
    const newMessage = { 
      text, 
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Lưu vào lịch sử
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

    // Xác minh phiên
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
      const product = data.product || null;

      const sanitizedProducts = products.map((p) => ({
        id: p.id || 'unknown-id',
        maSanPham: p.maSanPham || 'SP-UNKNOWN',
        tenSanPham: p.tenSanPham || 'Sản phẩm không tên',
        gia: Number(p.gia) || 0,
        soLuong: Number(p.soLuong) || 0,
        images: p.images && p.images.length > 0 ? p.images : ['/default-product.jpg'],
        link: p.link || `/product/${p.id}`,
        danhMuc: p.danhMuc || 'N/A',
        chatLieu: p.chatLieu || 'N/A',
        khuyenMai: p.khuyenMai || null,
      }));

      const sanitizedProduct = product
        ? {
            id: product.id || 'unknown-id',
            maSanPham: product.maSanPham || 'SP-UNKNOWN',
            tenSanPham: product.tenSanPham || 'Sản phẩm không tên',
            gia: Number(product.gia) || 0,
            soLuong: Number(product.soLuong) || 0,
            images: product.images && product.images.length > 0 ? product.images : ['/default-product.jpg'],
            link: product.link || `/product/${product.id}`,
            danhMuc: product.danhMuc || 'N/A',
            chatLieu: product.chatLieu || 'N/A',
            khuyenMai: product.khuyenMai || null,
            moTa: product.moTa || 'Không có mô tả',
          }
        : null;

      addBotMessage(
        text,
        [
          { text: '🔍 Tìm sản phẩm khác', action: 'search' },
          { text: '🛒 Xem giỏ hàng', action: 'viewCart' },
          { text: 'ℹ️ Xem chi tiết sản phẩm', action: 'productDetail' },
        ],
        sanitizedProducts,
        sanitizedProduct
      );
    },
    [addBotMessage]
  );

  // Xem giỏ hàng
  const handleViewCart = useCallback(() => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

    if (currentCart.length === 0) {
      addBotMessage('🛒 Giỏ hàng của bạn đang trống. Bạn muốn tìm sản phẩm nào không?', [
        { text: '🔍 Tìm sản phẩm', action: 'search' },
        { text: 'ℹ️ Xem chi tiết sản phẩm', action: 'productDetail' },
      ]);
      return;
    }

    const sanitizedCart = currentCart.map((item) => ({
      id: item.id || 'unknown-id',
      maSanPham: item.maSanPham || 'SP-UNKNOWN',
      tenSanPham: item.tenSanPham || 'Sản phẩm không tên',
      gia: Number(item.gia) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || '/default-product.jpg',
    }));

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
        case 'productDetail':
          addBotMessage("Vui lòng nhập mã sản phẩm bạn muốn xem chi tiết. Ví dụ: 'Xem chi tiết SP001'");
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

  // Render sản phẩm trong panel
  const renderProductPanel = () => {
    if (currentProduct) {
      return (
        <div className="product-panel">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              if (currentProducts.length > 0) {
                setCurrentProduct(null);
              } else {
                setShowProductPanel(false);
                if (isMobile) setProductDrawerVisible(false);
              }
            }}
            style={{ marginBottom: 10 }}
          >
            Quay lại
          </Button>
          
          <Card
            className="product-card-detail"
            cover={
              <img
                alt={currentProduct.tenSanPham}
                src={currentProduct.images[0]}
                className="product-image-detail"
                onError={(e) => {
                  e.target.src = '/default-product.jpg';
                }}
              />
            }
          >
            <Card.Meta
              title={<h3>{currentProduct.tenSanPham}</h3>}
              description={
                <>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text delete={currentProduct.khuyenMai} style={{ fontSize: 18 }}>
                        {currentProduct.gia.toLocaleString('vi-VN')}đ
                      </Text>
                      {currentProduct.khuyenMai && (
                        <Text style={{ fontSize: 18, color: '#d70018', fontWeight: 'bold', marginLeft: 8 }}>
                          {currentProduct.khuyenMai.toLocaleString('vi-VN')}đ
                        </Text>
                      )}
                    </div>
                    
                    <Tag color={currentProduct.soLuong > 0 ? 'green' : 'red'}>
                      {currentProduct.soLuong > 0 ? `Còn ${currentProduct.soLuong} sản phẩm` : 'Hết hàng'}
                    </Tag>
                    
                    <Divider style={{ margin: '10px 0' }} />
                    
                    <Text strong>Danh mục:</Text>
                    <Text>{currentProduct.danhMuc}</Text>
                    
                    <Text strong>Chất liệu:</Text>
                    <Text>{currentProduct.chatLieu}</Text>
                    
                    <Text strong>Mô tả:</Text>
                    <Text>{currentProduct.moTa}</Text>
                    
                    <Button 
                      type="primary" 
                      block 
                      style={{ marginTop: 15 }}
                      href={currentProduct.link}
                      target="_blank"
                      disabled={currentProduct.soLuong <= 0}
                    >
                      {currentProduct.soLuong > 0 ? 'Xem chi tiết' : 'Tạm hết hàng'}
                    </Button>
                  </Space>
                </>
              }
            />
          </Card>
        </div>
      );
    }

    if (currentProducts.length > 0) {
      return (
        <div className="product-panel">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              setShowProductPanel(false);
              if (isMobile) setProductDrawerVisible(false);
            }}
            style={{ marginBottom: 10 }}
          >
            Quay lại
          </Button>
          
          <h4>Sản phẩm gợi ý ({currentProducts.length})</h4>
          
          <div className="products-list">
            {currentProducts.map(product => (
              <Card
                key={product.id}
                className="product-card"
                cover={
                  <img
                    alt={product.tenSanPham}
                    src={product.images[0]}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = '/default-product.jpg';
                    }}
                  />
                }
                onClick={() => {
                  setCurrentProduct(product);
                }}
              >
                <Card.Meta
                  title={product.tenSanPham}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        {product.khuyenMai ? (
                          <>
                            <Text delete style={{ fontSize: 12 }}>
                              {product.gia.toLocaleString('vi-VN')}đ
                            </Text>
                            <Text style={{ color: '#d70018', fontWeight: 'bold', marginLeft: 8 }}>
                              {product.khuyenMai.toLocaleString('vi-VN')}đ
                            </Text>
                          </>
                        ) : (
                          <Text style={{ color: '#d70018', fontWeight: 'bold' }}>
                            {product.gia.toLocaleString('vi-VN')}đ
                          </Text>
                        )}
                      </div>
                      <Tag color={product.soLuong > 0 ? 'green' : 'red'}>
                        {product.soLuong > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </Tag>
                    </Space>
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

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
          {isMobile && showProductPanel && (
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => {
                setShowProductPanel(false);
                setProductDrawerVisible(false);
              }}
              style={{ color: 'white', marginRight: 8 }}
            />
          )}
          
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
          
          {!isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setShowProductPanel(!showProductPanel)}
              style={{ color: 'white' }}
              disabled={!currentProducts.length && !currentProduct}
            />
          )}
          
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
        {/* Panel sản phẩm (desktop) */}
        {!isMobile && showProductPanel && renderProductPanel()}
        
        {/* Panel chat */}
        <div className="chat-panel">
          {/* Khu vực tin nhắn */}
          <div className="chatbot-messages">
            {loading && <Spin style={{ margin: '10px auto', display: 'block' }} />}
            
            <List
              dataSource={messages}
              renderItem={(msg, index) => (
                <List.Item 
                  key={index} 
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

          {/* Khu vực nhập tin nhắn */}
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

      {/* Drawer sản phẩm (mobile) */}
      {isMobile && (
        <Drawer
          title="Sản phẩm gợi ý"
          placement="right"
          width="85%"
          onClose={() => setProductDrawerVisible(false)}
          visible={productDrawerVisible}
          bodyStyle={{ padding: 16 }}
        >
          {renderProductPanel()}
        </Drawer>
      )}
    </div>
  );
};

export default ChatBot;