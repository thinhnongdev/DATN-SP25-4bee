import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert, Spin } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [form] = Form.useForm();
  
  // Lấy token và email từ URL params
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  // Kiểm tra token khi component mount
  useEffect(() => {
    if (!token || !email) {
      message.error('Link đặt lại mật khẩu không hợp lệ!');
      navigate('/forgot-password');
      return;
    }
    
    verifyToken();
  }, [token, email, navigate]);
  
  // Xác thực token
  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `https://datn-sp25-4bee.onrender.com/api/auth/verify-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
      );
      
      if (response.data && response.data.valid) {
        setTokenValid(true);
      } else {
        message.error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!');
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } catch (error) {
      message.error('Không thể xác thực token. Vui lòng thử lại!');
      setTimeout(() => navigate('/forgot-password'), 2000);
    } finally {
      setVerifying(false);
    }
  };
  
  // Xử lý đặt lại mật khẩu
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('https://datn-sp25-4bee.onrender.com/api/auth/reset-password', {
        token: token,
        email: email,
        password: values.password
      });
      
      if (response.data && response.data.success) {
        setResetSuccess(true);
        message.success('Mật khẩu đã được đặt lại thành công!');
      } else {
        message.error(response.data?.message || 'Không thể đặt lại mật khẩu!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại!';
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
          Đặt lại mật khẩu
        </h1>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <img
            src="/logo/Asset 6@4x.png"
            alt="Logo"
            style={{ maxHeight: '150px', maxWidth: '150px' }}
          />
        </Link>
        
        {verifying ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin size="large" />
            <p style={{ color: 'white', marginTop: '20px' }}>Đang xác thực token...</p>
          </div>
        ) : resetSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Mật khẩu đã được đặt lại!"
              description={
                <div style={{ textAlign: 'left', marginTop: '10px' }}>
                  <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
                  <p>Vui lòng đăng nhập bằng mật khẩu mới.</p>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button type="primary" onClick={() => navigate('/login')}>
              Đăng nhập ngay
            </Button>
          </div>
        ) : tokenValid ? (
          <Form form={form} name="resetPassword" onFinish={onFinish} layout="vertical">
            <p style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              Vui lòng nhập mật khẩu mới của bạn.
            </p>
            
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Hai mật khẩu bạn nhập không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Đặt lại mật khẩu
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
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Link đã hết hạn"
              description="Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới."
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button type="primary" onClick={() => navigate('/forgot-password')} size="large">
              Yêu cầu đặt lại mật khẩu
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
