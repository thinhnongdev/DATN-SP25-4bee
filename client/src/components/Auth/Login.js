import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { data, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", values);
      console.log(response.data.token)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Lưu token vào localStorage
        message.success("Đăng nhập thành công!");
        navigate("/dashboard"); // Chuyển hướng sau khi đăng nhập thành công
      }
    } catch (error) {
      console.log(values)
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  };


  return (
    <div style={{display:"flex",justifyContent:"center",alignItems: "center",height: "100vh" }}>
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-96 shadow-lg rounded-2xl p-6" style={{backgroundColor:"#001529",height:"500px",width:"500px"}}>
        <h2 className="text-center text-xl font-semibold mb-4" style={{color:"white"}}>Đăng nhập</h2>
        <Link to="/" style={{display:"flex",justifyContent:"center",marginBottom:"40px"}}>
            <img src="/logo/Asset 6@4x.png" alt="Logo" style={{ maxHeight: "180px", maxWidth: "180px"}} />
          </Link>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input type="email" prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
            <Link to="/register" style={{ display: "block", textAlign: "end", marginTop: "10px", color: "white" }}>Tạo tài khoản</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
    </div>
  );
};

export default LoginForm;
