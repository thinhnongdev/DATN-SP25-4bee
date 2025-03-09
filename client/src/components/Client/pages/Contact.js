import React from "react";
import { Form, Input, Button, Typography, Row, Col, Card, Space } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Contact = () => {
  const onFinish = (values) => {
    console.log("Form values:", values);
    // Here you would typically send the form data to your backend
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined style={{ fontSize: "24px" }} />,
      title: "Điện thoại",
      content: "+1 (123) 456-7890",
      link: "tel:+11234567890",
    },
    {
      icon: <MailOutlined style={{ fontSize: "24px" }} />,
      title: "Email",
      content: "info@4bee.com",
      link: "mailto:info@4bee.com",
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: "24px" }} />,
      title: "Địa chỉ",
      content: "123 Fashion Street, New York, NY 10001",
      link: "https://maps.google.com/?q=123+Fashion+Street+New+York+NY+10001",
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: "24px" }} />,
      title: "Giờ làm việc",
      content: "Thứ Hai - Thứ Sáu: 9:00 AM - 6:00 PM",
    },
  ];

  return (
    <div className="container" style={{ margin: "32px auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "48px" }}>
        Liên hệ với chúng tôi
      </Title>

      <Row gutter={[48, 48]}>
        {/* Thông tin liên hệ */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <Space align="start">
                  {info.icon}
                  <div>
                    <Title level={5} style={{ marginBottom: "8px" }}>
                      {info.title}
                    </Title>
                    {info.link ? (
                      <a
                        href={info.link}
                        target={info.title === "Địa chỉ" ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <Text>{info.content}</Text>
                    )}
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Col>

        {/* Form liên hệ */}
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3} style={{ marginBottom: "24px" }}>
              Gửi tin nhắn cho chúng tôi
            </Title>

            <Form
              name="contact"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên của bạn" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Họ"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ của bạn" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email của bạn" },
                  { type: "email", message: "Vui lòng nhập email hợp lệ" },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại của bạn",
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Chủ đề"
                rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Tin nhắn"
                rules={[
                  { required: true, message: "Vui lòng nhập tin nhắn của bạn" },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Chúng tôi có thể giúp gì cho bạn?"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large">
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Contact;
