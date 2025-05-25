import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ id, ten, ma, anhUrl, gia }) => {
  const [luotBan, setLuotBan] = useState(0);

  useEffect(() => {
    const fetchLuotBan = async () => {
      try {
        const response = await axios.get(`https://datn-sp25-4bee.onrender.com/api/client/sanpham/${id}/luot-ban`);
        setLuotBan(response.data);
      } catch (err) {
        console.error('Lỗi khi lấy lượt bán:', err);
        setLuotBan(0);
      }
    };

    fetchLuotBan();
  }, [id]);

  return (
    <Link to={`/product/${id}`}>
      <Card
        hoverable
        className="product-card"
        cover={
          <div style={{ overflow: 'hidden', height: '300px' }}>
            <img
              alt={ten}
              src={anhUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        }
      >
        <Meta
          title={ten}
          description={
            <>
              <Text strong style={{ fontSize: '16px', color: 'red' }}>
                {gia.toLocaleString('vi-VN')}₫
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Text>Đã bán {luotBan}</Text>
              </div>
            </>
          }
        />
      </Card>
    </Link>
  );
};

export default ProductCard;
