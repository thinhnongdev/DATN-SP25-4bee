import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/auth/khach-hang/forgot-password?email=${encodeURIComponent(values.email)}`
      );
      
      if (response.data.success) {
        setSubmitted(true);
        message.success('Email đặt lại mật khẩu đã được gửi!');
      } else {
        message.error(response.data.message || 'Không thể gửi email đặt lại mật khẩu!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau!';
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
          Quên mật khẩu
        </h1>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <img
            src="/logo/Asset 6@4x.png"
            alt="Logo"
            style={{ maxHeight: '150px', maxWidth: '150px' }}
          />
        </Link>
        
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Yêu cầu đã được gửi!"
              description={
                <div style={{ textAlign: 'left', marginTop: '10px' }}>
                  <p>Email đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.</p>
                  <p>Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật khẩu.</p>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button type="primary" onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </Button>
          </div>
        ) : (
          <Form name="forgotPassword" onFinish={onFinish} layout="vertical">
            <p style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              Nhập email đăng ký của bạn và chúng tôi sẽ gửi cho bạn một email để đặt lại mật khẩu.
            </p>
            
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Gửi yêu cầu
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
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;