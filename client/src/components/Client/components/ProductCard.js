import React from 'react';
import { Card, Typography, Rate } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ id, ten, ma, anhUrl, gia }) => {
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
                {gia} đ
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Rate disabled defaultValue={gia} style={{ fontSize: '14px' }} />
              </div>
            </>
          }
        />
      </Card>
    </Link>
  );
};

export default ProductCard;