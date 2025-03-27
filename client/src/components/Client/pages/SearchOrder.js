import React, { useState } from 'react';
import { Input, Button, Card, Typography, Spin, message } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const OrderTrackingForm = () => {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const handleTrackOrder = async () => {
    if (!orderCode) {
      message.warning('Vui lòng nhập mã đơn hàng!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail',
        { order_code: orderCode },
        { headers: { Token: 'YOUR_GHN_API_TOKEN' } }
      );
      setOrderInfo(response.data.data);
    } catch (error) {
      console.error('Lỗi tra cứu đơn hàng:', error);
      message.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tra cứu đơn hàng" style={{ maxWidth: 500, margin: '0 auto', padding: '20px' }}>
      <Input
        placeholder="Nhập mã đơn hàng..."
        value={orderCode}
        onChange={(e) => setOrderCode(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <Button type="primary" onClick={handleTrackOrder} block>
        Tra cứu
      </Button>

      {loading && <Spin style={{ display: 'block', marginTop: '16px' }} />}

      {orderInfo && (
        <div style={{ marginTop: '16px' }}>
          <Title level={4}>Thông tin đơn hàng</Title>
          <Text><strong>Mã đơn hàng:</strong> {orderInfo.order_code}</Text><br />
          <Text><strong>Trạng thái:</strong> {orderInfo.status}</Text><br />
          <Text><strong>Người nhận:</strong> {orderInfo.to_name}</Text><br />
          <Text><strong>Địa chỉ:</strong> {orderInfo.to_address}</Text><br />
          <Text><strong>Tổng phí:</strong> {orderInfo.total_fee} VND</Text><br />
        </div>
      )}
    </Card>
  );
};

export default OrderTrackingForm;
