import React from "react";
import { Input, Card, Badge, Button, Tag, Row, Col, Layout } from "antd";
import { SearchOutlined, WalletOutlined } from "@ant-design/icons";
import Sidebar from "./SidebarProfile";

const { Search } = Input;

const vouchers = [
  {
    title: "Giảm 5% Giảm tối đa ₫40k",
    minOrder: "₫350k",
    type: "ShopeePay / SPayLater",
    status: "Dùng Sau",
    delay: "Có hiệu lực sau: 2 ngày",
  },
  {
    title: "Giảm 7% Giảm tối đa ₫12k",
    minOrder: "₫99k",
    type: "ShopeePay / SPayLater",
    status: "Dùng Sau",
    delay: "Có hiệu lực sau: 2 ngày",
  },
  {
    title: "Giảm ₫8k",
    minOrder: "₫99k",
    type: "ShopeePay / SPayLater",
    status: "Dùng Sau",
    delay: "Có hiệu lực sau: 2 ngày",
  },
  {
    title: "Giảm 10% Giảm tối đa ₫100k",
    minOrder: "₫120k",
    type: "Toàn Ngành Hàng",
    status: "Dùng Ngay",
    expiry: "HSD: 13.04.2025",
    extra: "x2",
  },
];

const VoucherCard = ({ data }) => (
  <Card
    style={{ width: "100%", marginBottom: 16, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
    bodyStyle={{ display: "flex", alignItems: "center", gap: 16 }}
  >
    <div
      style={{
        background: "#0066FF",
        padding: 16,
        color: "white",
        fontWeight: "bold",
        width: 80,
        textAlign: "center",
        borderRadius: 4,
      }}
    >
      {data.type.includes("Shopee") ? (
        <WalletOutlined style={{ fontSize: 24 }} />
      ) : (
        <div>VOUCHER</div>
      )}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: "bold" }}>{data.title}</div>
      <div>Đơn Tối Thiểu {data.minOrder}</div>
      <Tag color="red" style={{ marginTop: 8 }}>{data.type}</Tag>
      <div style={{ color: "gray", fontSize: 12, marginTop: 4 }}>
        {data.delay || data.expiry}
      </div>
    </div>
    {data.extra && <Badge count={data.extra} />}
    <Button type="default" danger>
      {data.status}
    </Button>
  </Card>
);

const VoucherPage = () => {
  return (
  <Layout style={{ width:'80%', background: '#fff',justifyContent: 'center', margin: '0 auto' }}>
      <Sidebar />  {/* Use Sidebar component here */}
    <div style={{ padding: 24 }}>
      <h2>Kho Voucher</h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 ,backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px'}}>
        <Search
          placeholder="Nhập mã voucher tại đây"
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 400 }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 16, backgroundColor: '#fff', borderRadius: '8px'}}>
        {vouchers.map((v, index) => (
          <Col key={index} xs={24} md={12}>
            <VoucherCard data={v} />
          </Col>
        ))}
      </Row>
    </div>
    </Layout>
  );
};

export default VoucherPage;