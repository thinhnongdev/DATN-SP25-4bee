import React from 'react';
import { Typography, Row, Col, Card, Image, Divider } from 'antd';

const { Title, Paragraph } = Typography;

const AboutUsPage = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Về Chúng Tôi</Title>
      <Paragraph style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        Chúng tôi là thương hiệu thời trang nam chuyên cung cấp áo sơ mi cao cấp, mang đến phong cách thanh lịch, hiện đại và lịch lãm cho phái mạnh.
      </Paragraph>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Image
            src="https://file.hstatic.net/1000253775/collection/so_mi_new_e9d1908851824318b085c2f96103ec0f_master.jpg" // Thay bằng link ảnh thực tế
            alt="Áo sơ mi nam"
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false}>
            <Title level={3}>Sứ mệnh của chúng tôi</Title>
            <Paragraph>
              Mang đến cho nam giới Việt Nam những mẫu áo sơ mi chất lượng, thoải mái và hợp xu hướng. Chúng tôi đặt chất lượng và sự hài lòng của khách hàng lên hàng đầu.
            </Paragraph>

            <Title level={4}>Giá trị cốt lõi</Title>
            <ul>
              <li>Chất lượng sản phẩm</li>
              <li>Thời trang hiện đại</li>
              <li>Phục vụ tận tâm</li>
              <li>Giá cả hợp lý</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card title="Thương hiệu đáng tin cậy" bordered={false}>
            Hơn 10.000 khách hàng tin tưởng và đồng hành cùng chúng tôi mỗi năm.
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Sản phẩm đa dạng" bordered={false}>
            Nhiều mẫu mã, màu sắc và kích cỡ phù hợp với nhiều phong cách khác nhau.
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Hỗ trợ chuyên nghiệp" bordered={false}>
            Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn 24/7 qua nhiều kênh liên lạc.
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutUsPage;
