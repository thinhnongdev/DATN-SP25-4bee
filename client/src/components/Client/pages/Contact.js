import React from 'react';
import { Row, Col, Typography, Card, Space } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ContactPage = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Liên Hệ Với Chúng Tôi</Title>
      <Paragraph style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, đừng ngần ngại liên hệ với chúng tôi qua các thông tin bên dưới.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card title="Thông tin liên hệ" bordered={false}>
            <Space direction="vertical" size="middle">
              <Text><EnvironmentOutlined /> Địa chỉ: Số 1, phố Trịnh Văn Bô, Phương Canh, Nam Từ Liêm, Hà Nội</Text>
              <Text><PhoneOutlined /> Hotline / Zalo: 0356245557</Text>
              <Text><MailOutlined /> Email: hotro@4bee.vn</Text>
              <Text><ClockCircleOutlined /> Giờ làm việc: 9:00 - 21:00 (Thứ 2 - Chủ nhật)</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Bản đồ cửa hàng" bordered={false}>
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.7983831941314!2d105.74767087504463!3d21.040086287445453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454d537dbff6b%3A0xf1d2e4fd898c02be!2zQ2FvIMOhbmcgRlBUIFBvbHl0ZWNobmlj!5e0!3m2!1svi!2s!4v1714814722555!5m2!1svi!2s"
              width="100%"
              height="250"
              style={{ border: 0, borderRadius: 8 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactPage;
