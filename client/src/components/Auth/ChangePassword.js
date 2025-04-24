import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChangePassword = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success(response.data || 'Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data || 'Đổi mật khẩu thất bại!');
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Card style={{ width: 500, backgroundColor: '#001529' }}>
        <h2 style={{ textAlign: 'center', color: 'white' }}>Đổi mật khẩu</h2>
        <Form name="changePassword" onFinish={onFinish} layout="vertical">
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
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
