import React, { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [form] = Form.useForm();

   // Hàm kiểm tra email đã tồn tại - Không sử dụng API check nữa mà để server validate
   const validateEmail = async (_, value) => {
    if (!value) return Promise.resolve();
    
    // Chỉ kiểm tra định dạng email cơ bản ở phía client
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(value)) {
      return Promise.reject(new Error('Email không đúng định dạng!'));
    }
    
    return Promise.resolve();
  };

  // Hàm kiểm tra số điện thoại - Không sử dụng API check nữa mà để server validate
  const validatePhone = async (_, value) => {
    if (!value) return Promise.resolve();
    
    // Chỉ kiểm tra định dạng số điện thoại cơ bản ở phía client
    const phonePattern = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phonePattern.test(value)) {
      return Promise.reject(new Error('Số điện thoại không đúng định dạng!'));
    }
    
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu đúng format
      const registerData = {
        email: values.email,
        password: values.password,
        hoTen: values.hoTen,
        soDienThoai: values.soDienThoai,
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD'),
        gioiTinh: values.gioiTinh
      };
      
      // Gửi request đăng ký
      const response = await axios.post(
        'https://datn-sp-25-4bee.vercel.app/api/auth/khach-hang/register', 
        registerData
      );
      
      if (response.data && response.data.success) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        message.error(response.data?.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      
      // Xử lý các lỗi cụ thể từ server
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          message.error('API đăng ký yêu cầu xác thực. Vui lòng liên hệ quản trị viên!');
        } else if (status === 400) {
          if (data.message && data.message.includes("Email")) {
            // Nếu lỗi liên quan đến email
            form.setFields([
              {
                name: 'email',
                errors: [data.message || 'Email đã tồn tại trong hệ thống'],
              },
            ]);
          } else if (data.message && data.message.includes("điện thoại")) {
            // Nếu lỗi liên quan đến số điện thoại
            form.setFields([
              {
                name: 'soDienThoai',
                errors: [data.message || 'Số điện thoại đã tồn tại trong hệ thống'],
              },
            ]);
          } else {
            message.error(data.message || 'Thông tin không hợp lệ. Vui lòng kiểm tra lại!');
          }
        } else {
          message.error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!');
        }
      } else {
        message.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px 0' }}
    >
      <Card style={{ width: 500, backgroundColor: '#001529' }}>
        <h2 style={{ textAlign: 'center', color: 'white' }}>Đăng ký tài khoản</h2>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <img
            src="/logo/Asset 6@4x.png"
            alt="Logo"
            style={{ maxHeight: '120px', maxWidth: '120px' }}
          />
        </Link>
        <Form 
          form={form}
          name="register" 
          onFinish={onFinish} 
          layout="vertical"
          initialValues={{
            gioiTinh: true
          }}
        >
          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
              { validator: validateEmail }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          
          {/* Xác nhận mật khẩu */}
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
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          {/* Tên khách hàng */}
          <Form.Item
            name="hoTen"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' },
              {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: "Tên không được chứa số hoặc ký tự đặc biệt!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>
          
          {/* Số điện thoại */}
          <Form.Item
            name="soDienThoai"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { validator: validatePhone }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>
          
          {/* Ngày sinh */}
          <Form.Item 
            name="ngaySinh" 
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
          
          {/* Giới tính */}
          <Form.Item
            name="gioiTinh"
            label={<span style={{ color: 'white' }}>Giới tính</span>}
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Radio.Group>
              <Radio value={true} style={{ color: 'white' }}>Nam</Radio>
              <Radio value={false} style={{ color: 'white' }}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Nút đăng ký */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              disabled={loading}
            >
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
