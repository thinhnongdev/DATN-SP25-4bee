import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await axios.post("http://localhost:8080/api/auth/register", values);
      message.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      message.error("Đăng ký thất bại!");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: "center" }}>Đăng Ký</Title>
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu" name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject("Mật khẩu không khớp!");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng Ký</Button>
          </Form.Item>
          <Form.Item>
            <Button type="link" onClick={() => navigate("/login")}>Đã có tài khoản? Đăng nhập ngay</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
