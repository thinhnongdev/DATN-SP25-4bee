import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Tabs, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = (values) => {
    setLoading(true);
    // Giả lập cuộc gọi API
    setTimeout(() => {
      setLoading(false);
      message.success("Đăng nhập thành công!");
    }, 1000);
  };

  const handleRegister = (values) => {
    setLoading(true);
    // Giả lập cuộc gọi API
    setTimeout(() => {
      setLoading(false);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
    }, 1000);
  };

  return (
    <div
      className="container"
      style={{ margin: "64px auto", maxWidth: "480px" }}
    >
      <Card>
        <Tabs defaultActiveKey="login" centered>
          {/* Tab Đăng nhập */}
          <TabPane tab="Đăng nhập" key="login">
            <Title
              level={2}
              style={{ textAlign: "center", marginBottom: "32px" }}
            >
              Chào mừng trở lại
            </Title>

            <Form
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email của bạn" },
                  { type: "email", message: "Vui lòng nhập email hợp lệ" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu của bạn" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Tab Đăng ký */}
          <TabPane tab="Đăng ký" key="register">
            <Title
              level={2}
              style={{ textAlign: "center", marginBottom: "32px" }}
            >
              Tạo tài khoản
            </Title>

            <Form
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên của bạn" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email của bạn" },
                  { type: "email", message: "Vui lòng nhập email hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại của bạn",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu của bạn" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu của bạn",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp");
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
