import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { data, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const LoginForm = () => {
  const navigate = useNavigate();
  const getRoleFromToken = (token) => {
    try {
      return jwtDecode(token)?.scope || null;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  };
  const onFinish = async (values) => {
    try {
      const response = await axios.post('https://datn-sp-25-4bee.vercel.app/api/auth/login', values);
      console.log(response.data.token);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Lưu token vào localStorage
        const userRole = response.data.token ? getRoleFromToken(response.data.token) : null;
        if (userRole === 'ADMIN') {
          navigate('/admin/thongke');
        } else if (userRole === 'NHAN_VIEN') {
          navigate('/admin/ban-hang');
        } else {
          //nếu là khách hàng thì tạo hóa đơn pending
          await createPendingOrder(values.email);
          navigate('/'); // Mặc định cho KHACH_HANG
        }
        message.success('Đăng nhập thành công!');
      }
    } catch (error) {
      console.log(values);
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
    }
  };
  //gọi api tạo hóa đơn pending nếu khách hàng đăng nhập
  const createPendingOrder = async (email) => {
    try {
      const response = await axios.post('https://datn-sp-25-4bee.vercel.app/api/client/order/createPending', {
        email,
      });
      const hoaDonId = response.data.id;
      console.log('Hóa đơn', response.data);
      console.log('ID hóa đơn Pending', hoaDonId);
      if (response.data && response.data.id) {
        const hoaDonId = response.data.id;
        console.log('ID hóa đơn Pending', hoaDonId);
        //gọi api lấy danh sách hóa đơn chi tiết
        const orderDetails = await fetchOrderDetail(hoaDonId);
        console.log('danh sách sản phẩm chi tiết', orderDetails);
        //lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(orderDetails));
      } else {
        console.log('không nhân được ID hóa đơn từ API');
      }
    } catch (error) {
      console.log('Lỗi khi tạo hóa đơn Pending:', error);
    }
  };

  const fetchOrderDetail = async (hoaDonId) => {
    try {
      const response = await axios.get(
        `https://datn-sp-25-4bee.vercel.app/api/client/order/hoaDonChiTiet/${hoaDonId}`,
      );

      if (Array.isArray(response.data)) {
        console.log('Danh sách hóa đơn chi tiết:', response.data);
        return response.data; // Trả về toàn bộ danh sách
      } else {
        console.warn('API không trả về danh sách, kiểm tra lại backend!');
        return [];
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      return [];
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Card
          className="w-96 shadow-lg rounded-2xl p-6 "
          style={{ backgroundColor: '#001529', height: '500px', width: '500px' }}
        >
          <h1
            className="text-center text-xl font-semibold mb-4"
            style={{ color: 'white', textAlign: 'center' }}
          >
            Đăng nhập
          </h1>
          <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <img
              src="/logo/Asset 6@4x.png"
              alt="Logo"
              style={{ maxHeight: '180px', maxWidth: '180px' }}
            />
          </Link>
          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
              <Input type="email" prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

                       <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng nhập
              </Button>
            
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  marginTop: '16px',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '20px' }}>
                  <Link to="/forgot-password" style={{ color: 'white' }}>
                    Quên mật khẩu?
                  </Link>
                  <Link to="/register" style={{ color: 'white' }}>
                    Tạo tài khoản
                  </Link>
                </div>
                <Link to="/changepassword" style={{ color: '#aaa', fontSize: '0.9em', marginTop: '4px' }}>
                  Thay đổi mật khẩu
                </Link>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
