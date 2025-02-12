import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { PieChartOutlined, FileOutlined, UserOutlined, CreditCardOutlined   } from "@ant-design/icons";
import "antd/dist/reset.css";
import { AppstoreOutlined } from '@ant-design/icons';


import PhieuGiamGiaList from "./components/PhieuGiamGia/PhieuGiamGiaList";
import UpdatePhieuGiamGia from "./components/PhieuGiamGia/UpdatePhieuGiamGia ";
import PhieuGiamGiaAdd from "./components/PhieuGiamGia/PhieuGiamGiaAdd";

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();
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
  
  const currentBreadcrumb = breadcrumbMap[location.pathname] || "Quản lý cửa hàng";
  
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" >
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Link to="/" style={{ textDecoration: "none" }}>Thống kê</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/" style={{ textDecoration: "none" }}>Bán hàng</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<FileOutlined />}>
            <Link to="/" style={{ textDecoration: "none" }}>Hóa đơn</Link>
          </Menu.Item>

          <Menu.SubMenu key="sub1" icon={<AppstoreOutlined  />} title="Sản phẩm">
            <Menu.Item key="4">
              <Link to="/sanpham" style={{ textDecoration: "none" }}>Sản phẩm</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/chatlieu" style={{ textDecoration: "none" }}>Chất liệu</Link>
            </Menu.Item>
            <Menu.Item key="6">
              <Link to="/kieucoao"style={{ textDecoration: "none" }}>Kiểu cổ áo</Link>
            </Menu.Item>
            <Menu.Item key="7">
              <Link to="/kieucotayao"style={{ textDecoration: "none" }}>Kiểu cổ tay áo</Link>
            </Menu.Item>
            <Menu.Item key="8">
              <Link to="/kieucuc"style={{ textDecoration: "none" }}>Kiểu cúc</Link>
            </Menu.Item>
            <Menu.Item key="9">
              <Link to="/kieudang"style={{ textDecoration: "none" }}>Kiểu dáng</Link>
            </Menu.Item>
            <Menu.Item key="10">
              <Link to="/mausac"style={{ textDecoration: "none" }}>Màu sắc</Link>
            </Menu.Item>
            <Menu.Item key="11">
              <Link to="/thuonghieu"style={{ textDecoration: "none" }}>Thương hiệu</Link>
            </Menu.Item>
            <Menu.Item key="12">
              <Link to="/kichthuoc"style={{ textDecoration: "none" }}>Kích thước</Link>
            </Menu.Item>
            <Menu.Item key="13">
              <Link to="/kieutuiao"style={{ textDecoration: "none" }}>Kiểu túi áo</Link>
            </Menu.Item>
            <Menu.Item key="14">
              <Link to="/"style={{ textDecoration: "none" }}>Danh mục</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="15" icon={<CreditCardOutlined />}>
            <Link to="/phieu-giam-gia"style={{ textDecoration: "none" }}>Phiếu Giảm Giá</Link>
          </Menu.Item>

          <Menu.Item key="16" icon={<FileOutlined />}>
            <Link to="/"style={{ textDecoration: "none" }}>Nhân Viên</Link>
          </Menu.Item>

          <Menu.Item key="17" icon={<FileOutlined />}>
            <Link to="/"style={{ textDecoration: "none" }}>Khách Hàng</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Layout chính */}
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
          <p style={{ fontSize: "19px", color: "black", fontWeight: "bold" }}>{currentBreadcrumb}</p>
          </Breadcrumb>

          {/* Điều hướng nội dung */}
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            
            <Routes>
              <Route path="/phieu-giam-gia" element={<PhieuGiamGiaList />} />
              <Route path="/add-p" element={<PhieuGiamGiaAdd />} />
              <Route path="/update/:id" element={<UpdatePhieuGiamGia />} />
            </Routes>



          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Ant Design ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
