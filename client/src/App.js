import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import {
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HoaDonRoutes from './routes/HoaDon';
import PhieuGiamGiaRoutes from './routes/PhieuGiamGia';
import SanPhamRoutes from './routes/SanPham';
import NhanVienRoute from './routes/NhanVien';
import KhachHangRoute from './routes/KhachHang';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
const { Header, Content, Footer, Sider } = Layout;

const breadcrumbMap = {
  '/': 'Trang chủ',
  '/phieu-giam-gia': 'Danh sách Phiếu Giảm Giá',
  '/add-p': 'Thêm Phiếu Giảm Giá',
};

const menuItems = [
  { key: '1', icon: <PieChartOutlined />, label: 'Thống kê', path: '/' },
  { key: '2', icon: <UserOutlined />, label: 'Bán hàng', path: '/ban-hang' },
  { key: '3', icon: <FileOutlined />, label: 'Hóa đơn', path: '/hoa-don' },
  { key: '15', icon: <CreditCardOutlined />, label: 'Phiếu Giảm Giá', path: '/phieu-giam-gia' },
  { key: '16', icon: <CreditCardOutlined />, label: 'Nhân Viên', path: '/nhanVien' },
  { key: '17', icon: <CreditCardOutlined />, label: 'Khách Hàng', path: '/khachHang' },
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

  return isAuthPage ? (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  ) : (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 64, margin: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link to="/">
            <img src="/logo/Asset 6@4x.png" alt="Logo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
          </Link>
        </div>

        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path} style={{ textDecoration: "none" }}>{item.label}</Link>
          </Menu.Item>          
          ))}

          <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="Quản lý sản phẩm">
            {productSubMenu.map((item) => (
              <Menu.Item key={item.key}>
                <Link to={item.path} style={{ textDecoration: "none" }}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '16px', padding: 24, minHeight: 360 }}>
          <Routes>
            {HoaDonRoutes()}
            {PhieuGiamGiaRoutes()}
            {SanPhamRoutes()}
            {NhanVienRoute()}
            {KhachHangRoute()}
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
