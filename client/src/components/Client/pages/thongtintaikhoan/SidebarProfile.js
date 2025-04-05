import React from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { UserOutlined, ShoppingCartOutlined, TagOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  return (
    <Sider width={250} style={{ background: '#fff', padding: '24px 16px' }}>
      <div className="user-info" style={{ marginBottom: 32 }}>
        <Avatar size={48} icon={<UserOutlined />} />
        <div>
          <Text strong style={{ marginLeft: 12 }}>222hai</Text>
          <div>
            <a href="#">Sửa Hồ Sơ</a>
          </div>
        </div>
      </div>

      <Menu mode="vertical" defaultSelectedKeys={['3']}>
        <Menu.Item key="2" icon={<UserOutlined />}>Tài Khoản Của Tôi</Menu.Item>
        <Menu.Item key="3" icon={<ShoppingCartOutlined />}>Đơn Mua</Menu.Item>
        <Menu.Item key="4" icon={<TagOutlined />}>Kho Voucher</Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
