import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Kiểm tra nếu đã đăng nhập, tự động điền email
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.sub) {
          setCurrentUser({
            email: decoded.sub
          });
          form.setFieldsValue({
            email: decoded.sub
          });
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, [form]);

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Xác định endpoint dựa vào nguồn gọi
      let endpoint = 'http://localhost:8080/api/auth/change-password';
      
      // Nếu đổi mật khẩu từ trang khách hàng
      const isCustomerPasswordChange = location.pathname === '/client/change-password' || 
                                     currentUser?.role === 'KHACH_HANG';
      
      if (isCustomerPasswordChange) {
        endpoint = 'http://localhost:8080/api/auth/khach-hang/change-password';
      }
      
      const response = await axios.post(endpoint, {
        email: values.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (response.data.success) {
        message.success('Đổi mật khẩu thành công!');
        
        // Đăng xuất sau khi đổi mật khẩu thành công
        localStorage.removeItem('token');
        
        // Chuyển về trang đăng nhập
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        message.error(response.data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      message.error(errorMsg);
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
        <Form 
          form={form}
          name="changePassword" 
          onFinish={onFinish} 
          layout="vertical"
        >
          <Form.Item 
            name="email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              type="email" 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              disabled={!!currentUser} // Disable nếu đã đăng nhập
            />
          </Form.Item>
          
          <Form.Item
            name="oldPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu cũ" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
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
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/login')}
              style={{ color: 'white' }}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;