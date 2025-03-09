import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { InstagramOutlined, FacebookOutlined, LinkedinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter>
      <div className="container">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>4BEE</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Premium long-sleeve dress shirts for the modern gentleman.
            </Text>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>Quick Links</Title>
            <Space direction="vertical">
              <Link to="/products" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Shop</Link>
              <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Contact</Link>
              <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Account</Link>
            </Space>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ color: 'white' }}>Contact</Title>
            <Space direction="vertical" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email: info@4bee.com</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Phone: +1 (123) 456-7890</Text>
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