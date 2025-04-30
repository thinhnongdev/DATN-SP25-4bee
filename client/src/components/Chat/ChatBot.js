import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input, Button, List, Avatar, Typography, Card, Badge, Spin, message as antdMessage } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  AudioOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { debounce } from 'lodash';
import './Chatbot.css';

const { Title } = Typography;

// Hàm tạo header xác thực
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Khởi tạo giỏ hàng từ localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Đồng bộ giỏ hàng với localStorage khi có sự kiện cartUpdated
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
      // Xóa sessionId cũ
      localStorage.removeItem('chatSessionId');
      setSessionId(null);

      console.log('Gọi POST /api/chat/session');
      const response = await axios.post(
        'http://localhost:8080/api/chat/session',
        {},
        { headers: getAuthHeaders(), timeout: 10000 }
      );
      console.log('Phản hồi từ POST:', response.data);
      const newSessionId = response.data.sessionId;
      if (!newSessionId) {
        throw new Error('Không nhận được sessionId từ server');
      }

      // Xác nhận phiên
      console.log('Gọi GET /api/chat/session/' + newSessionId);
      const verifyResponse = await axios.get(`http://localhost:8080/api/chat/session/${newSessionId}`, {
        headers: getAuthHeaders(),
        timeout: 10000,
      });
      console.log('Phản hồi từ GET:', verifyResponse.data);
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
            { text: 'Tìm sản phẩm', action: 'search' },
            { text: 'Xem giỏ hàng', action: 'viewCart' },
            { text: 'Xem chi tiết sản phẩm', action: 'productDetail' },
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

  const loadChatHistory = async (sessionId) => {
    try {
      console.log('Tải lịch sử chat cho sessionId:', sessionId);
      const response = await axios.get(`http://localhost:8080/api/chat/session/${sessionId}`, {
        headers: getAuthHeaders(),
        timeout: 10000,
      });
      console.log('Lịch sử chat:', response.data);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chat:', error);
      antdMessage.error('Không thể tải lịch sử chat: ' + (error.message || 'Vui lòng thử lại sau'));
      if (error.response?.status === 404) {
        console.warn('Phiên chat không tồn tại, xóa sessionId và tạo phiên mới');
        localStorage.removeItem('chatSessionId');
        setSessionId(null);
        createChatSession();
      }
    }
  };

  // Thêm tin nhắn từ bot
  const addBotMessage = useCallback((text, options = [], products = [], product = null) => {
    setMessages((prev) => [
      ...prev,
      { text, sender: 'bot', options, products, product },
    ]);
  }, []);

  // Thêm tin nhắn từ người dùng
  const addUserMessage = useCallback((text) => {
    setMessages((prev) => [...prev, { text, sender: 'user' }]);
  }, []);

  // Gửi tin nhắn
  const sendMessageLogic = async (inputValue) => {
    if (!inputValue.trim()) {
      antdMessage.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    if (!sessionId) {
      antdMessage.error('Phiên chat chưa được tạo. Vui lòng thử lại!');
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
        'http://localhost:8080/api/chat/send',
        { message: userMessage },
        {
          headers: {
            ...getAuthHeaders(),
            'Session-Id': sessionId,
          },
          timeout: 10000,
        }
      );

      if (response.data) {
        processBotResponse(response.data);
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      addBotMessage('Có lỗi xảy ra khi kết nối với hệ thống. Bạn vui lòng thử lại nhé!');
      if (process.env.NODE_ENV === 'development') {
        console.log('Chi tiết lỗi:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce gửi tin nhắn
  const sendMessage = useCallback(debounce((inputValue) => sendMessageLogic(inputValue), 500), [
    sessionId,
    addUserMessage,
    addBotMessage,
  ]);

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
          }
        : null;

      addBotMessage(
        text,
        [
          { text: 'Tìm sản phẩm khác', action: 'search' },
          { text: 'Xem giỏ hàng', action: 'viewCart' },
          { text: 'Xem chi tiết sản phẩm', action: 'productDetail' },
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
        { text: 'Tìm sản phẩm', action: 'search' },
        { text: 'Xem chi tiết sản phẩm', action: 'productDetail' },
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
          addBotMessage('Chuyển hướng đến trang đặt hàng bên góc phải chọn giỏ hàng , chọn thanh toán ... ');
          break;
        default:
          addBotMessage('Hành động này chưa được hỗ trợ. Bạn cần gì khác không?');
      }
    },
    [addBotMessage, handleViewCart]
  );

  // Hiển thị danh sách sản phẩm hoặc chi tiết sản phẩm
  const renderProductList = useMemo(() => {
    return (products, singleProduct) => {
      if (singleProduct) {
        const validProduct = {
          id: singleProduct.id || 'unknown-id',
          maSanPham: singleProduct.maSanPham || 'SP-UNKNOWN',
          tenSanPham: singleProduct.tenSanPham || 'Sản phẩm không tên',
          gia: Number(singleProduct.gia) || 0,
          soLuong: Number(singleProduct.soLuong) || 0,
          images: singleProduct.images || ['/default-product.jpg'],
          link: singleProduct.link || `/product/${singleProduct.id}`,
          danhMuc: singleProduct.danhMuc || 'N/A',
          chatLieu: singleProduct.chatLieu || 'N/A',
        };

        return (
          <Card
            key={validProduct.maSanPham}
            className="product-card"
            cover={
              <img
                alt={validProduct.tenSanPham}
                src={validProduct.images[0]}
                className="product-image"
                onError={(e) => {
                  e.target.src = '/default-product.jpg';
                }}
              />
            }
            actions={[
              <Button
                type="default"
                href={validProduct.link}
                target="_blank"
                icon={<InfoCircleOutlined />}
              >
                Xem chi tiết
              </Button>,
            ]}
          >
            <Card.Meta
              title={validProduct.tenSanPham}
              description={
                <>
                  {validProduct.gia.toLocaleString('vi-VN')}đ | Còn {validProduct.soLuong} sp
                  <br />
                  Danh mục: {validProduct.danhMuc} | Chất liệu: {validProduct.chatLieu}
                </>
              }
            />
          </Card>
        );
      }

      if (products && products.length > 0) {
        return (
          <div className="products-grid">
            {products.map((product) => {
              const validProduct = {
                id: product.id || 'unknown-id',
                maSanPham: product.maSanPham || 'SP-UNKNOWN',
                tenSanPham: product.tenSanPham || 'Sản phẩm không tên',
                gia: Number(product.gia) || 0,
                soLuong: Number(product.soLuong) || 0,
                images: product.images || ['/default-product.jpg'],
                link: product.link || `/product/${product.id}`,
              };

              return (
                <Card
                  key={validProduct.maSanPham}
                  className="product-card"
                  cover={
                    <img
                      alt={validProduct.tenSanPham}
                      src={validProduct.images[0]}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/default-product.jpg';
                      }}
                    />
                  }
                  actions={[
                    <Button
                      type="default"
                      href={validProduct.link}
                      target="_blank"
                      icon={<InfoCircleOutlined />}
                    >
                      Xem chi tiết
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={validProduct.tenSanPham}
                    description={`${validProduct.gia.toLocaleString('vi-VN')}đ`}
                  />
                </Card>
              );
            })}
          </div>
        );
      }
      return null;
    };
  }, []);

  if (!isOpen) {
    return (
      <div className="chatbot-launcher">
        <Badge count={cart.length} size="small">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={() => setIsOpen(true)}
            className="chatbot-button"
          />
        </Badge>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Title level={5} style={{ color: 'white', margin: 0 }}>
          <RobotOutlined style={{ marginRight: 8 }} />
          4BEE Shopping Assistant
        </Title>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setIsOpen(false)}
          style={{ color: 'white' }}
        />
      </div>

      <div className="chatbot-messages">
        {loading && <Spin style={{ margin: '10px auto', display: 'block' }} />}
        <List
          dataSource={messages}
          renderItem={(msg, index) => (
            <List.Item key={index} className={`message-item ${msg.sender}`}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={40}
                    icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className="message-avatar"
                  />
                }
                description={
                  <div className="message-content">
                    <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>
                    {(msg.products || msg.product) && renderProductList(msg.products, msg.product)}
                    {msg.options && (
                      <div className="quick-replies">
                        {msg.options.map((option, i) => (
                          <Button
                            key={i}
                            size="small"
                            onClick={() => handleQuickAction(option.action)}
                            type="default"
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
            />
          }
          suffix={
            <Button
              type="text"
              icon={<ShoppingOutlined />}
              onClick={handleViewCart}
              title="Xem giỏ hàng"
            />
          }
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => sendMessage(input)}
          loading={loading}
          disabled={!input.trim() || loading}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default ChatBot;