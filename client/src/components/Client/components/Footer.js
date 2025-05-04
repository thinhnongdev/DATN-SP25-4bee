import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { InstagramOutlined, FacebookOutlined, LinkedinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ background: '#001529' }}>
      <div className="container">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>4BEE</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Áo sơ mi tay dài cao cấp dành cho quý ông hiện đại.
            </Text>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>Liên kết nhanh</Title>
            <Space direction="vertical">
              <Link to="/products" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Sản phẩm</Link>
              <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Liên hệ</Link>
            </Space>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>Thông tin liên hệ</Title>
            <Space direction="vertical" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Text style={{color:'white'}}>Email: hotro@4bee.com</Text>
              <Text style={{color:'white'}}>Điện thoại: 0356 245 557</Text>
              <Space size="large">
                <InstagramOutlined style={{ fontSize: '24px', color: 'white' }} />
                <FacebookOutlined style={{ fontSize: '24px', color: 'white' }} />
                <LinkedinOutlined style={{ fontSize: '24px', color: 'white' }} />
              </Space>
            </Space>
          </Col>
        </Row>
        
        <Row style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
          <Col span={24} style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            © {new Date().getFullYear()} 4BEE. All rights reserved.
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;