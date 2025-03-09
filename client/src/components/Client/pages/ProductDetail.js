import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Rate,
  Carousel,
  Card,
  Divider,
  message,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Dữ liệu sản phẩm mẫu - trong ứng dụng thực tế, dữ liệu này sẽ đến từ API
const product = {
  id: 1,
  name: "Áo sơ mi Oxford cổ điển",
  price: 89.99,
  description:
    "Áo sơ mi Oxford cotton chất lượng cao với cổ áo cổ điển, cổ tay có thể điều chỉnh và thiết kế slim fit hiện đại. Hoàn hảo cho cả dịp công việc và thường ngày.",
  rating: 5,
  reviews: 128,
  color: "Trắng",
  fabric: "Vải Oxford Cotton",
  sizes: ["S", "M", "L", "XL"],
  care: [
    "Giặt máy lạnh",
    "Không tẩy",
    "Ủi ở nhiệt độ trung bình",
    "Có thể giặt khô",
  ],
  images: [
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500",
    "https://images.unsplash.com/photo-1604695573706-53730fb343c2?w=500",
    "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500",
  ],
};

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning("Vui lòng chọn kích thước");
      return;
    }
    message.success("Đã thêm vào giỏ hàng thành công");
  };

  return (
    <div className="container" style={{ margin: "32px auto" }}>
      <Row gutter={[48, 32]}>
        {/* Hình ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card>
            <Carousel autoplay>
              {product.images.map((image, index) => (
                <div key={index}>
                  <div style={{ height: "500px", overflow: "hidden" }}>
                    <img
                      src={image}
                      alt={`Sản phẩm ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <Title level={2}>{product.name}</Title>

          <div style={{ marginBottom: "24px" }}>
            <Title level={3} style={{ margin: 0 }}>
              {product.price}đ
            </Title>
            <div style={{ marginTop: "8px" }}>
              <Rate disabled defaultValue={product.rating} />
              <Text type="secondary" style={{ marginLeft: "8px" }}>
                ({product.reviews} đánh giá)
              </Text>
            </div>
          </div>

          <Text style={{ fontSize: "16px" }}>{product.description}</Text>

          <Divider />

          {/* Chi tiết sản phẩm */}
          <div style={{ marginBottom: "24px" }}>
            <Row>
              <Col span={8}>
                <Text strong>Chất liệu:</Text>
              </Col>
              <Col span={16}>
                <Text>{product.fabric}</Text>
              </Col>
            </Row>
            <Row style={{ marginTop: "8px" }}>
              <Col span={8}>
                <Text strong>Màu sắc:</Text>
              </Col>
              <Col span={16}>
                <Text>{product.color}</Text>
              </Col>
            </Row>
          </div>

          {/* Chọn kích thước */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={5}>Chọn kích thước</Title>
            <Radio.Group
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              size="large"
            >
              {product.sizes.map((size) => (
                <Radio.Button key={size} value={size}>
                  {size}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            style={{ width: "100%", marginBottom: "24px" }}
          >
            Thêm vào giỏ hàng
          </Button>

          {/* Hướng dẫn chăm sóc */}
          <Card title="Hướng dẫn chăm sóc">
            <ul style={{ paddingLeft: "20px" }}>
              {product.care.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
