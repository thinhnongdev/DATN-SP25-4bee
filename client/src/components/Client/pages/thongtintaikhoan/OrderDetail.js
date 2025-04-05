import React from 'react';
import { Layout, Tabs, Typography } from 'antd';
import Sidebar from './SidebarProfile';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const OrderPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />  {/* Use Sidebar component here */}
      <Layout style={{ padding: '24px' }}>
        <Content>
          <Title level={4}>Đơn Mua</Title>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Tất cả" key="1" />
            <TabPane tab="Chờ thanh toán" key="2" />
            <TabPane tab="Vận chuyển" key="3" />
            <TabPane tab="Chờ giao hàng" key="4" />
            <TabPane tab="Hoàn thành" key="5" />
            <TabPane tab="Đã hủy" key="6" />
          </Tabs>

          
        </Content>
      </Layout>
    </Layout>
  );
};

export default OrderPage;
