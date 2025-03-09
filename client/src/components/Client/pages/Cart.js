import React, { useState } from "react";
import {
  Table,
  Typography,
  Button,
  InputNumber,
  Space,
  Row,
  Col,
  Card,
  Divider,
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

// Dữ liệu giỏ hàng mẫu - trong ứng dụng thực tế, dữ liệu này sẽ được quản lý bởi state management như Redux
const initialCartItems = [
  {
    id: 1,
    name: "Áo sơ mi Oxford cổ điển",
    price: 89.99,
    size: "L",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500",
  },
  {
    id: 2,
    name: "Áo sơ mi Slim Fit French Cuff",
    price: 99.99,
    size: "M",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500",
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (id, value) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: value } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <img
            src={record.image}
            alt={text}
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">Kích thước: {record.size}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toFixed(2)}đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={10}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: "Tổng cộng",
      key: "total",
      render: (record) => `${(record.price * record.quantity).toFixed(2)}đ`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <div className="container" style={{ margin: "32px auto" }}>
      <Title level={2}>Giỏ hàng</Title>

      {cartItems.length > 0 ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Table
              columns={columns}
              dataSource={cartItems}
              pagination={false}
              rowKey="id"
              className="cart-table"
            />
          </Col>

          <Col xs={24} lg={8}>
            <Card>
              <Title level={3}>Tóm tắt đơn hàng</Title>
              <div style={{ marginBottom: "16px" }}>
                <Row justify="space-between">
                  <Col>Tạm tính:</Col>
                  <Col>{subtotal.toFixed(2)}đ</Col>
                </Row>
                <Row justify="space-between">
                  <Col>Phí vận chuyển:</Col>
                  <Col>{shipping.toFixed(2)}đ</Col>
                </Row>
                <Divider />
                <Row justify="space-between">
                  <Col>
                    <Text strong>Tổng cộng:</Text>
                  </Col>
                  <Col>
                    <Text strong>{total.toFixed(2)}đ</Text>
                  </Col>
                </Row>
              </div>
              <Button type="primary" size="large" block>
                Tiến hành thanh toán
              </Button>
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <ShoppingOutlined
            style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}
          />
          <Title level={3}>Giỏ hàng của bạn đang trống</Title>
          <Link to="/products">
            <Button type="primary">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
