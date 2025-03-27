import React from 'react';
import { Form, Input, Button, Card, DatePicker, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    values.dob = values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : '';
    console.log('Register:', values);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', values);
      message.success(response.data);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        message.error(error.response.data);
      } else {
        message.error('Có lỗi xảy ra vui lòng thử lại!');
      }
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Card style={{ width: 500, backgroundColor: '#001529' }}>
        <h2 style={{ textAlign: 'center', color: 'white' }}>Đăng ký tài khoản</h2>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <img
            src="/logo/Asset 6@4x.png"
            alt="Logo"
            style={{ maxHeight: '180px', maxWidth: '180px' }}
          />
        </Link>
        <Form name="register" onFinish={onFinish} layout="vertical">
          {/* Tài khoản (Email) */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          {/* Tên khách hàng */}
          <Form.Item
            name="hoTen"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên khách hàng" />
          </Form.Item>
          {/* Ngày sinh */}
          <Form.Item name="ngaySinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
          </Form.Item>
          {/* Nút đăng ký */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>

          {/* Chuyển hướng đến đăng nhập */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'white' }}>
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
