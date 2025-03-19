import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { maHoaDon } = location.state || {};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle={`Mã hóa đơn của bạn: ${maHoaDon || 'Không xác định'}`}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}> 
            Về trang chủ
          </Button>,
          <Button key="orders" onClick={() => navigate('/orders')}> 
            Xem đơn hàng của tôi
          </Button>
        ]}
      />
    </div>
  );
};

export default OrderSuccessPage;
