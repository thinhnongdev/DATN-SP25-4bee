import React, { useEffect, useState } from 'react';
import { Layout, Tabs, Typography, Spin, Empty, Card, Row, Col, Tag, Divider } from 'antd';
import Sidebar from './SidebarProfile';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import {
  BarcodeOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEmailFromToken = () => {
    const token = localStorage.getItem('token'); // hoặc sessionStorage
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.email || null; // Tùy payload trong token
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    const email = getEmailFromToken();
    if (!email) return;
    axios
      .get(`http://localhost:8080/api/client/order/findHoaDon/${email}`) // chỉnh URL nếu khác
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
      });
  }, []);
  const renderOrders = () => {
    return orders.map((order) => (
      <Card
        key={order.id}
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 24 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Tag color="blue" style={{ fontSize: 14 }}>
              <BarcodeOutlined /> Mã HĐ: {order.maHoaDon}
            </Tag>
          </Col>
          <Col>
            <Tag color="gray" style={{ fontSize: 14 }}>
              <FieldTimeOutlined /> {moment(order.ngayTao).format('DD/MM/YYYY HH:mm')}
            </Tag>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={[16, 8]}>
          <Col span={12}>
            <p>
              <UserOutlined /> <b>Người nhận:</b> {order.tenNguoiNhan}
            </p>
            <p>
              <PhoneOutlined /> <b>SĐT:</b> {order.soDienThoai}
            </p>
          </Col>
          <Col span={12}>
            <p>
              <HomeOutlined /> <b>Địa chỉ:</b> {order.diaChi}
            </p>
          </Col>
          <Col span={12}>
            <p>
              <DollarOutlined /> <b>Tổng tiền:</b> {order.tongTien.toLocaleString()} đ
            </p>
          </Col>
          <Col span={12}>
            <p>
              <b>Trạng thái:</b> {renderTrangThaiTag(order.trangThai)}
            </p>
          </Col>
        </Row>
      </Card>
    ));
  };

  const renderTrangThaiTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case 2:
        return <Tag color="blue">Đã xác nhận</Tag>;
      case 3:
        return <Tag color="processing">Đang giao</Tag>;
      case 4:
        return <Tag color="green">Hoàn thành</Tag>;
      case 5:
        return <Tag color="red">Đã hủy</Tag>;
      case 6:
        return <Tag color="purple">Đã hoàn hàng</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };

  return (
    <Layout
      style={{
        width: '80%',
        minHeight: '700px',
        background: '#fff',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <Sidebar />
      <Layout style={{ padding: '24px', backgroundColor: '#fff' }}>
        <Content style={{ backgroundColor: '#fff' }}>
          <Title level={4}>Đơn Mua</Title>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Tất cả" key="1">
              {renderOrders()}
            </TabPane>
            <TabPane tab="Chờ thanh toán" key="2">
              Đang cập nhật...
            </TabPane>
            <TabPane tab="Vận chuyển" key="3">
              Đang cập nhật...
            </TabPane>
            <TabPane tab="Chờ giao hàng" key="4">
              Đang cập nhật...
            </TabPane>
            <TabPane tab="Hoàn thành" key="5">
              Đang cập nhật...
            </TabPane>
            <TabPane tab="Đã hủy" key="6">
              Đang cập nhật...
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OrderPage;
