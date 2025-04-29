import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Email } from '@mui/icons-material';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/change-password', {
        email: values.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success(response.data || 'Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Card style={{ width: 500, backgroundColor: '#001529' }}>
        <h1
          className="text-center text-xl font-semibold mb-4"
          style={{ color: 'white', textAlign: 'center' }}
        >
          Đổi mật khẩu
        </h1>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <img
            src="/logo/Asset 6@4x.png"
            alt="Logo"
            style={{ maxHeight: '180px', maxWidth: '180px' }}
          />
        </Link>
        <Form name="changePassword" onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
            <Input type="email" prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="oldPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu cũ" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
