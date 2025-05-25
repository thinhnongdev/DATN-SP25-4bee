import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Button, Card, Rate, Carousel } from "antd";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { RightOutlined } from "@ant-design/icons";
import axios from "axios";


// Dữ liệu đánh giá mẫu
const reviews = [
  {
    name: "John D.",
    rating: 5,
    comment:
      "Chất lượng tuyệt vời và vừa vặn hoàn hảo. Rất hài lòng với mua hàng của tôi.",
    title: "Vừa vặn hoàn hảo",
  },
  {
    name: "Michael R.",
    rating: 5,
    comment: "Chất lượng vải tuyệt vời. Chắc chắn sẽ mua thêm.",
    title: "Chất lượng tuyệt vời",
  },
  {
    name: "David W.",
    rating: 4,
    comment:
      "Áo sơ mi tuyệt vời cho các cuộc họp kinh doanh. Đảm bảo vẻ ngoài chuyên nghiệp.",
    title: "Vẻ ngoài chuyên nghiệp",
  },
];

const Home = () => {
  
const { Title, Text } = Typography;

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const fetchData = async () => {
  try {
    const response = await axios.get('https://datn-sp25-4bee.onrender.com/api/client/sanpham', {
    });
    console.log('Data fetched:', response.data);
    setProducts(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

useEffect(() => {
  fetchData();
}, []);

  return (
    <div>
      {/* Phần Banner */}
      <div
        className="banner"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1500)",
        }}
      >
        <div className="container">
          <Title level={1} style={{ color: "white", marginBottom: "24px" }}>
            Nâng tầm phong cách của bạn với 4BEE
          </Title>
          <Text
            style={{
              color: "white",
              fontSize: "18px",
              marginBottom: "32px",
              display: "block",
            }}
          >
            Áo sơ mi dài tay cao cấp cho quý ông hiện đại
          </Text>
          <Link to="/products">
            <Button type="primary" size="large">
              Mua ngay <RightOutlined />
            </Button>
          </Link>
        </div>
      </div>

      {/* Phần Sản phẩm nổi bật */}
      <div className="container" style={{ margin: "64px auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "48px" }}>
          Bộ sưu tập nổi bật
        </Title>
      <Row gutter={[24, 24]}>
  {Array.isArray(products) && products.length > 0 ? (
    products.map((product) => (
      <Col xs={24} sm={12} md={6} key={product.id}>
        <ProductCard {...product} />
      </Col>
    ))
  ) : (
    <Col span={24} style={{ textAlign: 'center', marginTop: 50 }}>
      <Empty description="Không có sản phẩm nào" />
    </Col>
  )}
</Row>

      </div>

      {/* Phần Khuyến mãi */}
      <div
        style={{
          background: "var(--secondary-color)",
          padding: "64px 0",
          color: "white",
        }}
      >
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: "white", marginBottom: "24px" }}>
                Chất lượng cao cấp được đảm bảo
              </Title>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "16px",
                  display: "block",
                  marginBottom: "24px",
                }}
              >
                Mỗi chiếc áo được chế tác với độ chính xác cao bằng các vật liệu
                tốt nhất, đảm bảo sự thoải mái và độ bền.
              </Text>
              <Link to="/products">
                <Button type="primary" ghost size="large">
                  Khám phá bộ sưu tập
                </Button>
              </Link>
            </Col>
            <Col xs={24} md={12}>
              <img
                src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500"
                alt="Áo sơ mi cao cấp"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Phần Đánh giá */}
      <div className="container" style={{ margin: "64px auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "48px" }}>
          Đánh giá của khách hàng
        </Title>
        <Row gutter={[24, 24]}>
          {reviews.map((review, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card className="review-card">
                <Rate
                  disabled
                  defaultValue={review.rating}
                  style={{ marginBottom: "16px" }}
                />
                <Title level={4}>{review.title}</Title>
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  "{review.comment}"
                </Text>
                <Text strong>{review.name}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
