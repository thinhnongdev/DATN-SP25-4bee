import React, { useEffect, useState } from 'react';
import { Layout, Menu, Badge, Space, Avatar, Dropdown, Modal, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  // Hàm lấy số lượng sản phẩm từ localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(totalQuantity);
  };

  // Hàm fetch thông tin người dùng
  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/getInfoUser',
        JSON.stringify({ token: token }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      return null;
    }
  };

  useEffect(() => {
    updateCartCount(); // Load dữ liệu khi component mount

    // Kiểm tra token đăng nhập
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo(token).then((data) => setUserInfo(data));
    }

    // Lắng nghe sự kiện localStorage thay đổi
    const handleStorageChange = () => {
      updateCartCount();
      const updatedToken = localStorage.getItem('token');
      if (updatedToken) {
        setIsLoggedIn(true);
        fetchUserInfo(updatedToken).then((data) => setUserInfo(data));
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);
  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            await axios.post('http://localhost:8080/api/auth/logout', JSON.stringify({ token }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUserInfo(null);
          message.success('Đăng xuất thành công!');

          navigate('/'); // Chuyển về trang chủ
        } catch (error) {
          console.error('Logout failed:', error.response?.data || error.message);
        }
      },
    });
  };

  const menuItems = [
    { key: '/', label: 'Trang chủ' },
    { key: '/products', label: 'Sản phẩm' },
    { key: '/contact', label: 'Liên hệ' },
    { key: '/about', label: 'Về chúng tôi' },
    { key: '/searchOrder', label: 'Tra cứu đơn hàng' },
  ];

  // Menu dropdown khi đăng nhập
  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/myprofile">Thông tin cá nhân</Link>
      </Menu.Item>
      <Menu.Item
        key="logout"
        onClick={() => {
          handleLogout();
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUserInfo(null);
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ backgroundColor: 'black' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'black',
        }}
      >
        <div
          style={{
            paddingLeft: '20px',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link to="/">
            <img
              src="/logo/Asset 6@4x.png"
              alt="Logo"
              style={{ maxHeight: '100px', maxWidth: '100px' }}
            />
          </Link>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1, justifyContent: 'center', border: 'none', backgroundColor: 'black' }}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} style={{ color: 'white' }}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        <Space size="large" style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
          <Link to="/cart" style={{ display: 'flex' }}>
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />
            </Badge>
          </Link>
          {isLoggedIn && userInfo ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar style={{ backgroundColor: '#87d068' }}>{userInfo?.ten?.[0] || 'U'}</Avatar>
            </Dropdown>
          ) : (
            <Link to="/login">
              <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
            </Link>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default Navbar;
