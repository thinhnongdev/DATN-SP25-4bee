import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    // try {
    //   const response = await axios.post("http://localhost:8080/api/auth/login", values);
    //   localStorage.setItem("token", response.data.token);
    //   message.success("Đăng nhập thành công!");
      navigate("/");
    // } catch (error) {
    //   message.error("Đăng nhập thất bại!");
    // }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: "center" }}>Đăng Nhập</Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng Nhập</Button>
          </Form.Item>
          <Form.Item>
            <Button type="link" onClick={() => navigate("/register")}>Chưa có tài khoản? Đăng ký ngay</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
