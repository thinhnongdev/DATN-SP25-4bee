import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import NhanVienConfig from "./NhanVien/NhanVienConfig";
import 'bootstrap/dist/css/bootstrap.min.css';
import KhachHangConfig from "./KhachHang/KhachHangConfig";


const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="demo-logo-vertical" />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item key="1" icon={<PieChartOutlined />}>
              <Link to="/">Thống kê</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
              <Link to="/">Bán hàng</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<FileOutlined />}>
              <Link to="/">Hóa đơn</Link>
            </Menu.Item>
            <Menu.Item key="15" icon={<UserOutlined />}>
              <Link to="/nhanVien">Nhân viên</Link>
            </Menu.Item>
            <Menu.Item key="16" icon={<UserOutlined />}>
              <Link to="/khachHang">Khách hàng</Link>
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
              <Menu.Item key="14">
                <Link to="/">Danh mục</Link>
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </Sider>

        {/* Layout chính */}
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }} />
          <Content style={{ margin: "16px" }}>
            {/* Điều hướng nội dung */}
            <div style={{ padding: 24, minHeight: 360 }}>
              <Routes>
              <Route path='/nhanVien' element={<NhanVienConfig/>}/>
              <Route path='/khachHang' element={<KhachHangConfig/>}/>
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            {new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
