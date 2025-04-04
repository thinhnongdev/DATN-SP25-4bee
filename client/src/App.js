import React, { useState, useEffect } from 'react';
import { Layout, Menu, message, Modal, theme } from 'antd';
import { Link, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Sử dụng named import
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
import HoaDonRoutes from './routes/HoaDon';
import PhieuGiamGiaRoutes from './routes/PhieuGiamGia';
import SanPhamRoutes from './routes/SanPham';
import NhanVienRoute from './routes/NhanVien';
import KhachHangRoute from './routes/KhachHang';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NavClient from './components/Client/components/Navbar';
import FooterClient from './components/Client/components/Footer';
import HomeClient from './components/Client/pages/Home';
import ProductsClient from './components/Client/pages/Products';
import ProductDetailClient from './components/Client/pages/ProductDetail';
import CartClient from './components/Client/pages/Cart';
import ContactClient from './components/Client/pages/Contact';
import Checkout from './components/Client/pages/Checkout';
import OrderSuccessPage from './components/Client/pages/OrderSuccess';
import ThongkeList from './components/Thongke/ThongkeList';
import SearchOrder from './components/Client/pages/SearchOrder';
import Chatbot from './components/Client/Chat/Chatbot';
import { checkTokenValidity } from './components/Client/pages/checkTokenValidity';
const { Header, Content, Footer, Sider } = Layout;

const breadcrumbMap = {
  '/': 'Trang chủ',
  '/phieu-giam-gia': 'Danh sách Phiếu Giảm Giá',
  '/add-p': 'Thêm Phiếu Giảm Giá',
};
const menuItems = [
  { key: '1', icon: <BarChartOutlined />, label: 'Thống kê', path: '/admin' },
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
  const token = localStorage.getItem('token');
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
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                {item.label}
              </Link>
            </Menu.Item>
          ))}
          <Menu.SubMenu key="sub1" icon={<ShopOutlined />} title="Quản lý sản phẩm">
            {productSubMenu.map((item) => (
              <Menu.Item key={item.key}>
                <Link to={item.path} style={{ textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
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
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 16 }}>
            <span style={{ color: 'black' }}>
              {'Xin chào, ' + userInfo?.ten + ' ' || 'Not info '}
            </span>
            <img
              src={userInfo?.anhUrl || 'https://www.w3schools.com/howto/img_avatar.png'}
              alt="circle"
              style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '16px' }}
            />
          </div>
        </Header>
        <Content style={{ margin: "16px", padding: 24, minHeight: 360 }}>
            <Routes>
              <Route path="/" element={<ThongkeList />} /> {/* Hiển thị ThongkeList ở /admin */}
              {HoaDonRoutes()}
              {PhieuGiamGiaRoutes()}
              {SanPhamRoutes()}
              {NhanVienRoute()}
              {KhachHangRoute()}
            </Routes>
          </Content>
          <Chatbot />
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
          <Route path="/" element={<HomeClient />} />
          <Route path="/products" element={<ProductsClient />} />
          <Route path="/product/:id" element={<ProductDetailClient />} />
          <Route path="/cart" element={<CartClient />} />
          <Route path="/contact" element={<ContactClient />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/searchOrder" element={<SearchOrder />} />
        </Routes>
      </Content>
      <FooterClient />
      <Chatbot />
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
    const token = localStorage.getItem("token");
    if (token) {
      checkTokenValidity(token).then((isValid) => {
        if (!isValid) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          window.dispatchEvent(new Event('cartUpdated'));
          window.location.href = "/login"; // Điều hướng đến trang đăng nhập
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


  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Với vai trò ADMIN hoặc NHAN_VIEN thì cho phép truy cập cả giao diện quản trị và giao diện khách hàng
  // Ngược lại (KHÁCH_HÀNG hoặc chưa đăng nhập) thì chỉ cho phép truy cập giao diện khách hàng.
  return token !== null && (userRole === 'ADMIN' || userRole === 'NHAN_VIEN') ? (
    <Routes>
      <Route
        path="/admin/*"
        element={
          token && (userRole === 'ADMIN' || userRole === 'NHAN_VIEN') ? (
            <AdminLayout />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/* Ngoài giao diện admin, admin/nhân viên cũng có thể truy cập giao diện khách hàng nếu cần */}
      <Route path="/*" element={<CustomerLayout />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="/*" element={<CustomerLayout />} />
    </Routes>
  );
};

export default App;
