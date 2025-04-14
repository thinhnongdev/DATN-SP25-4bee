import { Layout, Menu, Avatar, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  // Gọi API để lấy thông tin người dùng khi Sidebar mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
      if (!token) return;

      try {
        const response = await axios.post(
          'http://localhost:8080/api/auth/getInfoUser',
          JSON.stringify({ token }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setUserInfo(response.data);
        console.log('User info:', response.data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    fetchUser();
  }, []);

  // Xác định key đang active dựa theo path
  const getSelectedKey = () => {
    if (location.pathname.startsWith('/myprofile')) return '1';
    if (location.pathname.startsWith('/orderdetail')) return '2';
    if (location.pathname.startsWith('/danhsachvoucher')) return '3';
    return '';
  };

  return (
    <Sider width={250} style={{ background: '#fff', padding: '24px 16px' }}>
      <div className="user-info" style={{ marginBottom: 32, display: 'flex', alignItems: 'center' }}>
       <Avatar style={{ backgroundColor: '#87d068' }}>{userInfo?.ten?.[0] || 'U'}</Avatar>
        <div style={{ marginLeft: 12 }}>
        <Text strong>{userInfo?.ten || 'Người dùng'}</Text>
          <div>
            <Link to="/myprofile"> <EditOutlined style={{ marginRight: 6 }} />
            Sửa Hồ Sơ</Link>
          </div>
        </div>
      </div>

      <Menu mode="vertical" selectedKeys={[getSelectedKey()]}>
        <Menu.Item key="1" icon={<UserOutlined />}>
          <Link to="/myprofile">Tài Khoản Của Tôi</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
          <Link to="/danhsachdonhang">Đơn Mua</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<TagOutlined />}>
          <Link to="/danhsachvoucher">Kho Voucher</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
