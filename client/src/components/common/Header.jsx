import React from "react";
import { Layout, Space, Avatar, Dropdown, Menu, Typography } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import NotificationBell from "./NotificationBell";
import { jwtDecode } from "jwt-decode";

const { Header: AntHeader } = Layout;
const { Text } = Typography;


const Header = ({ title, userInfo, onLogout }) => {
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
  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: role === "ADMIN" ? "Admin" : "Nhân viên",
        },
        {
          type: "divider",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          onClick: onLogout
        },
      ]}
    />
  );

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div>
        {title && <Text strong style={{ fontSize: 18 }}>{title}</Text>}
      </div>
      
      <Space size={16}>
        {/* Quả chuông thông báo */}
        <NotificationBell />
        
        {/* User avatar and info */}
        <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>
              {userInfo ? `Xin chào, ${userInfo.ten || ''}` : 'Chào mừng'}
            </span>
            <Avatar
              src={userInfo?.anhUrl || "https://www.w3schools.com/howto/img_avatar.png"}
              alt="avatar"
              style={{ width: 40, height: 40, cursor: "pointer" }}
            />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;