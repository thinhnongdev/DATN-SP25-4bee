import React, { useState, useEffect } from 'react';
import { Layout, Menu, message, Modal, theme } from 'antd';
import { Link, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Sử dụng named import
import Header from './components/common/Header';
import './App.css';
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  TagsOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

// Các component trang
import HoaDonRoutes from './routes/HoaDonRoutes';
import PhieuGiamGiaRoutes from './routes/PhieuGiamGiaRoutes';
import SanPhamRoutes from './routes/SanPhamRoutes';
import NhanVienRoutes from './routes/NhanVienRoutes';
import KhachHangRoutes from './routes/KhachHangRoutes';
import ClientRoute from './routes/ClientRoutes';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NavClient from './components/Client/components/Navbar';
import FooterClient from './components/Client/components/Footer';


import { checkTokenValidity } from './components/Client/pages/checkTokenValidity';
import ThongkeRoutes from './routes/ThongKeRoutes';
import Forbidden403 from './components/Auth/Forbidden403';
import ProtectedRoutes from './routes/ProtectedRoutes';
import NotFoundPage from './components/Auth/NotFoundPage';
import ChangePassword from './components/Auth/ChangePassword';
import ChatBot from './components/Chat/ChatBot';
const { Header: AntHeader, Content, Footer, Sider } = Layout;

const breadcrumbMap = {
  '/': 'Trang chủ',
  '/phieu-giam-gia': 'Danh sách Phiếu Giảm Giá',
  '/add-p': 'Thêm Phiếu Giảm Giá',
};
const menuItems = [
  { key: '1', icon: <BarChartOutlined />, label: 'Thống kê', path: '/admin/thongke' },
  { key: '2', icon: <ShoppingCartOutlined />, label: 'Bán hàng', path: '/admin/ban-hang' },
  { key: '3', icon: <FileTextOutlined />, label: 'Hóa đơn', path: '/admin/hoa-don' },
  { key: '15', icon: <TagsOutlined />, label: 'Phiếu Giảm Giá', path: '/admin/phieu-giam-gia' },
  { key: '16', icon: <UserOutlined />, label: 'Nhân Viên', path: '/admin/nhanvien' },
  { key: '17', icon: <TeamOutlined />, label: 'Khách Hàng', path: '/admin/khachhang' },
];

const productSubMenu = [
  { key: '4', label: 'Sản phẩm', path: '/admin/sanpham' },
  { key: '5', label: 'Chất liệu', path: '/admin/chatlieu' },
  { key: '6', label: 'Kiểu cổ áo', path: '/admin/kieucoao' },
  { key: '7', label: 'Kiểu cổ tay áo', path: '/admin/kieucotayao' },
  { key: '8', label: 'Kiểu cúc', path: '/admin/kieucuc' },
  { key: '9', label: 'Kiểu dáng', path: '/admin/kieudang' },
  { key: '10', label: 'Màu sắc', path: '/admin/mausac' },
  { key: '11', label: 'Thương hiệu', path: '/admin/thuonghieu' },
  { key: '12', label: 'Kích thước', path: '/admin/kichthuoc' },
  { key: '13', label: 'Kiểu túi áo', path: '/admin/kieutuiao' },
  { key: '18', label: 'Danh mục', path: '/admin/danhmuc' },
  { key: '19', label: 'Họa tiết', path: '/admin/hoatiet' },
];

/* 
  Component AdminLayout: giao diện quản trị (sidebar, header, content admin)
  Các route admin được hiển thị trong layout này.
*/
const AdminLayout = () => {
  const token = localStorage.getItem('token');
  const getRoleFromToken = (token) => {
    try {
      return jwtDecode(token)?.scope || null;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  };
  const role = token ? getRoleFromToken(token) : null;
  const filteredMenuItems = menuItems.filter((item) => {
    // Nếu là nhân viên, chỉ cho phép Hóa đơn và Bán hàng
    if (role === 'NHAN_VIEN') {
      return ['2', '3'].includes(item.key); // Bán hàng, Hóa đơn
    }
    return true; // ADMIN thì thấy hết
  });

  const filteredProductSubMenu = role === 'NHAN_VIEN' ? [] : productSubMenu;

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();

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
            JSON.stringify({ token: token }),
            { headers: { 'Content-Type': 'application/json' } },
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

  useEffect(() => {
    if (token) {
      fetchUserInfo(token)
        .then((data) => setUserInfo(data))
        .catch((err) => setError(err.message));
    }
  }, [token]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link to="/admin">
            <img
              src="/logo/Asset 6@4x.png"
              alt="Logo"
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
          </Link>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {filteredMenuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                {item.label}
              </Link>
            </Menu.Item>
          ))}

          {filteredProductSubMenu.length > 0 && (
            <Menu.SubMenu key="sub1" icon={<ShopOutlined />} title="Quản lý sản phẩm">
              {filteredProductSubMenu.map((item) => (
                <Menu.Item key={item.key}>
                  <Link to={item.path} style={{ textDecoration: 'none' }}>
                    {item.label}
                  </Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          )}

          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            style={{ marginTop: 'auto' }}
            onClick={handleLogout}
          >
            Đăng xuất
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header userInfo={userInfo} onLogout={handleLogout} />
        <Content style={{ margin: '16px', padding: 24, minHeight: 360 }}>
          <Routes>
            {ThongkeRoutes()}
            {HoaDonRoutes()}
            {PhieuGiamGiaRoutes()}
            {SanPhamRoutes()}
            {NhanVienRoutes()}
            {KhachHangRoutes()}
            {/* THÊM 404 bên trong Routes của ClientLayout */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Content>
      
      </Layout>
    </Layout>
  );
};

/* 
  Component CustomerLayout: giao diện khách hàng (header, nav, footer)
  Chỉ các trang dành cho khách hàng được hiển thị ở đây.
*/
const CustomerLayout = () => {
  const location = useLocation();
  return (
    <Layout className="layout">
      <NavClient />
      <Content key={location.pathname}>
        <Routes>
          {ClientRoute()}
          {/* THÊM 404 bên trong Routes của ClientLayout */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Content>
      <FooterClient />
<ChatBot />
    </Layout>
  );
};

//
// Hàm giải mã token lấy thông tin vai trò (ở đây giả sử vai trò lưu trong thuộc tính "scope")
//
const getRoleFromToken = (token) => {
  try {
    return jwtDecode(token)?.scope || null;
  } catch (error) {
    console.error('Lỗi giải mã token:', error);
    return null;
  }
};

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token).then((isValid) => {
        if (!isValid) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          window.dispatchEvent(new Event('cartUpdated'));
          window.location.href = '/login'; // Điều hướng đến trang đăng nhập
        }
      });
    }
  }, []);
  const location = useLocation();
  // Cập nhật tiêu đề trang dựa vào đường dẫn
  useEffect(() => {
    document.title = breadcrumbMap[location.pathname] || 'Quản lý cửa hàng';
  }, [location.pathname]);

  // Lấy token và giải mã để lấy vai trò
  const token = localStorage.getItem('token');
  const userRole = token ? getRoleFromToken(token) : null;
  console.log('Token:', token);
  console.log('Role từ token:', userRole);

  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/changepassword" element={<ChangePassword />} />
      <Route path="/403" element={<Forbidden403 />} />

      {/* Admin (protected) */}
      <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'NHAN_VIEN']} />}>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>

      {/* Client */}
      <Route path="/*" element={<CustomerLayout />} />

      {/* Not found - đặt cuối cùng */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
