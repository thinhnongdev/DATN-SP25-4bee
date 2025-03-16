import React, { useEffect, useState } from 'react';
import { Layout, Menu, Badge, Space } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  // Hàm lấy số lượng sản phẩm từ localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(totalQuantity);
  };

  useEffect(() => {
    updateCartCount(); // Load dữ liệu khi component mount

    // Lắng nghe sự kiện localStorage thay đổi
    const handleStorageChange = () => {
      updateCartCount();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);
  const menuItems = [
    { key: '/', label: 'Trang chủ' },
    { key: '/products', label: 'Sản phẩm' },
    { key: '/contact', label: 'Liên hệ' }
  ];

  return (
    <Header style={{backgroundColor:"black"}}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',backgroundColor:"black" }}>
      <div style={{ height: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link to="/">
            <img src="/logo/Asset 6@4x.png" alt="Logo" style={{ maxHeight: "100px", maxWidth: "100px"}} />
          </Link>
        </div>
        
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1, justifyContent: 'center', border: 'none' ,backgroundColor:"black"}}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} style={{color:"white"}}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        <Space size="large" style={{ marginLeft: '20px' }}>
          <Link to="/cart" >
          <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />
            </Badge>
          </Link>
          <Link to="/login">
            <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
          </Link>
        </Space>
      </div>
    </Header>
  );
};

export default Navbar;