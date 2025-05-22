import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get('vnp_ResponseCode');
    const vnpTxnRef = queryParams.get('vnp_TxnRef');

    const handlePaymentSuccess = async () => {
      const orderData = JSON.parse(sessionStorage.getItem('pendingOrderData'));
      const apiUrlThanhToan = sessionStorage.getItem('apiUrlThanhToan');

      if (orderData && apiUrlThanhToan) {
        try {
          const res = await axios.post(apiUrlThanhToan, orderData);
          message.success(res.data || 'Đặt hàng thành công!');

          // Xóa session/local sau thanh toán thành công
          sessionStorage.removeItem('pendingOrderData');
          sessionStorage.removeItem('apiUrlThanhToan');
          localStorage.removeItem('cart');
          localStorage.removeItem('selectedVoucher');
          window.dispatchEvent(new Event('cartUpdated'));

          // Nếu đã đăng nhập thì tạo lại hóa đơn pending
          const token = localStorage.getItem('token');
          if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const email = decodedToken.sub;
            if (email) {
                try {
                  const response = await axios.post('http://localhost:8080/api/client/order/createPending', { email });
                  console.log("Tạo lại hóa đơn pending thành công", response.data);
                }
                catch (error) {
                  console.error("Lỗi khi tạo lại hóa đơn pending:", error);
                }
            }
          }

          navigate('/order-success', { state: { maHoaDon: vnpTxnRef } });
        } catch (err) {
          const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
          message.error(errorMessage);
        }
      } else {
        message.error('Không tìm thấy dữ liệu đơn hàng.');
      }
    };

    if (responseCode === '00') {
      handlePaymentSuccess();
    } else {
      message.error('Thanh toán thất bại hoặc bị hủy.');
    }
  }, [location.search, navigate]);

  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <Spin size="large" tip="Đang xử lý thanh toán..." />
    </div>
  );
};

export default PaymentSuccess;
