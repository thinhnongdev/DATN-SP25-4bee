import React, { useState, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import { Link, Route, Routes,useLocation } from "react-router-dom";
import {
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import HoaDonRoutes from "./routes/HoaDon";
import PhieuGiamGiaRoutes from "./routes/PhieuGiamGia";
import SanPhamRoutes from "./routes/SanPham";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NhanVienRoute from "./routes/NhanVien";
import KhachHangRoute from "./routes/KhachHang";
import AuthRoutes from "./routes/Auth";

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();

  // Xử lý tiêu đề trang động
  useEffect(() => {
    switch (location.pathname) {
      case "/":
        document.title = "Trang chủ";
        break;
      case "/phieu-giam-gia":
        document.title = "Danh sách Phiếu Giảm Giá";
        break;
      case "/add-p":
        document.title = "Thêm Phiếu Giảm Giá";
        break;
      default:
        if (location.pathname.startsWith("/update/")) {
          document.title = "Cập nhật Phiếu Giảm Giá";
        } else {
          document.title = "Quản lý cửa hàng";
        }
    }
  }, [location.pathname]);
  const breadcrumbMap = {
    "/": "Trang chủ",
    "/phieu-giam-gia": "Danh sách Phiếu Giảm Giá",
    "/add-p": "Thêm Phiếu Giảm Giá",
  };

  const currentBreadcrumb =
    breadcrumbMap[location.pathname] || "Quản lý cửa hàng";
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        {/* Logo Section */}
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
              src="/logo/logo2.png"
              alt="Logo"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Link to="/">Thống kê</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/banhang">Bán hàng</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<FileOutlined />}>
            <Link to="/hoa-don">Hóa đơn</Link>
          </Menu.Item>
          <Menu.SubMenu
            key="sub1"
            icon={<UserOutlined />}
            title="Quản lý sản phẩm"
          >
            <Menu.Item key="4">
              <Link to="/sanpham">Sản phẩm</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/chatlieu">Chất liệu</Link>
            </Menu.Item>
            <Menu.Item key="6">
              <Link to="/kieucoao">Kiểu cổ áo</Link>
            </Menu.Item>
            <Menu.Item key="7">
              <Link to="/kieucotayao">Kiểu cổ tay áo</Link>
            </Menu.Item>
            <Menu.Item key="8">
              <Link to="/kieucuc">Kiểu cúc</Link>
            </Menu.Item>
            <Menu.Item key="9">
              <Link to="/kieudang">Kiểu dáng</Link>
            </Menu.Item>
            <Menu.Item key="10">
              <Link to="/mausac">Màu sắc</Link>
            </Menu.Item>
            <Menu.Item key="11">
              <Link to="/thuonghieu">Thương hiệu</Link>
            </Menu.Item>
            <Menu.Item key="12">
              <Link to="/kichthuoc">Kích thước</Link>
            </Menu.Item>
            <Menu.Item key="13">
              <Link to="/kieutuiao">Kiểu túi áo</Link>
            </Menu.Item>
            <Menu.Item key="18">
                <Link to="/hoatiet">Họa tiết</Link>
              </Menu.Item>
              <Menu.Item key="19">
                <Link to="/danhmuc">Danh mục</Link>
              </Menu.Item>
         
          </Menu.SubMenu>

          <Menu.Item key="15" icon={<CreditCardOutlined />}>
            <Link to="/phieu-giam-gia"style={{ textDecoration: "none" }}>Phiếu Giảm Giá</Link>
          </Menu.Item>
          <Menu.Item key="16" icon={<CreditCardOutlined />}>
            <Link to="/nhanVien"style={{ textDecoration: "none" }}>Nhân Viên</Link>
          </Menu.Item>
          <Menu.Item key="17" icon={<CreditCardOutlined />}>
            <Link to="/khachHang"style={{ textDecoration: "none" }}>Khách Hàng</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "16px", padding: 24, minHeight: 360 }}>
          <Routes>
            {HoaDonRoutes()}
            {PhieuGiamGiaRoutes()}
            {SanPhamRoutes()}
            {NhanVienRoute()}
            {KhachHangRoute()}
            
            {/* Thêm các Routes khác ở đâyyyyyyy */}
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
