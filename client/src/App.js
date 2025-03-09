import React, { useState, useEffect } from 'react';
import { Button, Layout, Menu, Modal, theme } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  UserOutlined, // Nhân viên
  TeamOutlined, // Khách hàng
  LogoutOutlined, // Đăng xuất
  ShopOutlined, // Sản phẩm
  BarChartOutlined, // Thống kê
  ShoppingCartOutlined, // Bán hàng
  FileTextOutlined, // Hóa đơn
  TagsOutlined, // Phiếu giảm giá
} from '@ant-design/icons';
import './App.css';
import HoaDonRoutes from './routes/HoaDon';
import PhieuGiamGiaRoutes from './routes/PhieuGiamGia';
import SanPhamRoutes from './routes/SanPham';
import NhanVienRoute from './routes/NhanVien';
import KhachHangRoute from './routes/KhachHang';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NavClient from './components/Client/components/Navbar';
import FooterClient from './components/Client/components/Footer';
import ProductCard from './components/Client/components/ProductCard';
import CartClient from './components/Client/pages/Cart';
import ContactClient from './components/Client/pages/Contact';
import HomeClient from './components/Client/pages/Home';
// import CartClient from './components/Client/pages/Cart';
import ProductDetailClient from './components/Client/pages/ProductDetail';
import ProductsClient from './components/Client/pages/Products';

import axios from 'axios';
const { Header, Content, Footer, Sider } = Layout;

const breadcrumbMap = {
  '/': 'Trang chủ',
  '/phieu-giam-gia': 'Danh sách Phiếu Giảm Giá',
  '/add-p': 'Thêm Phiếu Giảm Giá',
};

const menuItems = [
  { key: '1', icon: <BarChartOutlined />, label: 'Thống kê', path: '/' },
  { key: '2', icon: <ShoppingCartOutlined />, label: 'Bán hàng', path: '/ban-hang' },
  { key: '3', icon: <FileTextOutlined />, label: 'Hóa đơn', path: '/hoa-don' },
  { key: '15', icon: <TagsOutlined />, label: 'Phiếu Giảm Giá', path: '/phieu-giam-gia' },
  { key: '16', icon: <UserOutlined />, label: 'Nhân Viên', path: '/nhanVien' },
  { key: '17', icon: <TeamOutlined />, label: 'Khách Hàng', path: '/khachHang' },
];

const productSubMenu = [
  { key: '4', label: 'Sản phẩm', path: '/sanpham' },
  { key: '5', label: 'Chất liệu', path: '/chatlieu' },
  { key: '6', label: 'Kiểu cổ áo', path: '/kieucoao' },
  { key: '7', label: 'Kiểu cổ tay áo', path: '/kieucotayao' },
  { key: '8', label: 'Kiểu cúc', path: '/kieucuc' },
  { key: '9', label: 'Kiểu dáng', path: '/kieudang' },
  { key: '10', label: 'Màu sắc', path: '/mausac' },
  { key: '11', label: 'Thương hiệu', path: '/thuonghieu' },
  { key: '12', label: 'Kích thước', path: '/kichthuoc' },
  { key: '13', label: 'Kiểu túi áo', path: '/kieutuiao' },
  { key: '18', label: 'Danh mục', path: '/danhmuc' },
  { key: '19', label: 'Họa tiết', path: '/hoatiet' },
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  useEffect(() => {
    document.title = breadcrumbMap[location.pathname] || 'Quản lý cửa hàng';
  }, [location.pathname]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/getInfoUser',
        JSON.stringify({ token: token }), // Đảm bảo gửi đúng JSON string
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch user info');
    }
  };

  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  console.log(token);

  useEffect(() => {
    if (token) {
      fetchUserInfo(token)
        .then((data) => setUserInfo(data))
        .catch((err) => setError(err.message));
    }
  }, [token]);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          await axios.post(
            'http://localhost:8080/api/auth/logout',
            JSON.stringify({ token: token }), // Đảm bảo gửi đúng JSON string
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
        } catch (error) {
          console.error('Logout failed:', error.response?.data || error.message);
        } finally {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      },
    });
  };

  return (
    <>
      {location.pathname === "/login" || location.pathname === "/register" ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : token!=null? (
        <Layout style={{ minHeight: "100vh" }}>
          {/* Sidebar */}
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div
              style={{
                height: 64,
                margin: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Link to="/">
                <img
                  src="/logo/Asset 6@4x.png"
                  alt="Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </Link>
            </div>
  
            <Menu
              theme="dark"
              selectedKeys={[location.pathname]}
              mode="inline"
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {menuItems.map((item) => (
                <Menu.Item key={item.key} icon={item.icon}>
                  <Link to={item.path} style={{ textDecoration: "none" }}>
                    {item.label}
                  </Link>
                </Menu.Item>
              ))}
  
              {/* Quản lý sản phẩm */}
              <Menu.SubMenu key="sub1" icon={<ShopOutlined />} title="Quản lý sản phẩm">
                {productSubMenu.map((item) => (
                  <Menu.Item key={item.key}>
                    <Link to={item.path} style={{ textDecoration: "none" }}>
                      {item.label}
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
  
              {/* Nút đăng xuất */}
              <Menu.Item key="logout" icon={<LogoutOutlined />} style={{ marginTop: "auto" }} onClick={handleLogout}>
                Đăng xuất
              </Menu.Item>
            </Menu>
          </Sider>
  
          {/* Main Layout */}
          <Layout>
            <Header
              style={{
                padding: 0,
                background: colorBgContainer,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 16 }}>
                <span style={{ color: "black" }}>
                  {"Xin chào, " + userInfo?.ten + " " || "Not info "}
                </span>
                <img
                  src={userInfo?.anhUrl || "https://www.w3schools.com/howto/img_avatar.png"}
                  alt="circle"
                  style={{ width: 40, height: 40, borderRadius: "50%", marginRight: "16px" }}
                />
              </div>
            </Header>
            <Content style={{ margin: "16px", padding: 24, minHeight: 360 }}>
              <Routes>
                {HoaDonRoutes()}
                {PhieuGiamGiaRoutes()}
                {SanPhamRoutes()}
                {NhanVienRoute()}
                {KhachHangRoute()}
              </Routes>
              <ToastContainer position="top-right" autoClose={3000} />
            </Content>
          </Layout>
        </Layout>
      ) : token===null ? (
        <Layout className="layout">
          <NavClient />
          <Content>
            <Routes>
              <Route path="/" element={<HomeClient />} />
              <Route path="/products" element={<ProductsClient />} />
              <Route path="/product/:id" element={<ProductDetailClient />} />
              <Route path="/cart" element={<CartClient />} />
              <Route path="/contact" element={<ContactClient />} />
            </Routes>
          </Content>
          <FooterClient />
        </Layout>
      ) : null}
    </>
  );
  
};

export default App;
