import React, { useEffect, useState } from 'react';
import {
  Layout,
  Tabs,
  Typography,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Button,
  Image,
  Badge,
} from 'antd';
import Sidebar from './SidebarProfile';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import {
  BarcodeOutlined,
  CheckCircleTwoTone,
  DollarOutlined,
  FieldTimeOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const getEmailFromToken = () => {
    const token = localStorage.getItem('token'); // hoặc sessionStorage
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.email || null; // Tùy payload trong token
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };
  const fetchProductImage = async (productDetailId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/client/sanphamchitiet/${productDetailId}/hinhanh`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product image:', error);
      return null;
    }
  };
  // Gọi API khi component mount
  useEffect(() => {
    const email = getEmailFromToken();
    if (!email) return;

    axios
      .get(`http://localhost:8080/api/client/order/findHoaDon/${email}`)
      .then(async (res) => {
        const fetchedOrders = res.data;

        const enrichedOrders = await Promise.all(
          fetchedOrders.map(async (order) => {
            try {
              const [paymentRes, productsRes] = await Promise.all([
                axios.get(
                  `http://localhost:8080/api/client/thanhtoan/findThanhToanHoaDonByIdHoaDon/${order.id}`,
                ),
                axios.get(
                  `http://localhost:8080/api/client/findDanhSachSPCTbyIdHoaDon/${order.id}`,
                ),
              ]);

              const productsWithImages = await Promise.all(
                (productsRes.data || []).map(async (product) => {
                  const imageUrl = await fetchProductImage(product.id); // id SPCT
                  return { ...product, image: imageUrl };
                }),
              );

              return {
                ...order,
                payments: paymentRes.data || [],
                products: productsWithImages,
              };
            } catch (err) {
              console.error(`Error enriching order ${order.id}:`, err);
              return {
                ...order,
                payments: [],
                products: [],
              };
            }
          }),
        );

        setOrders(enrichedOrders);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
      });
  }, []);

  console.log(orders);

  const countOrdersByStatus = (status) => {
    return orders.filter((order) => order.trangThai === status).length;
  };

  const renderOrdersByStatus = (status) => {
    return orders
      .filter((order) => order.trangThai === status) // Lọc đơn hàng theo trạng thái
      .map((order) => {
        const payment = order.payments?.[0];
        const tongTienThanhToan = payment?.tongTien || 0;
        const phuongThuc = payment?.phuongThucThanhToan?.tenPhuongThucThanhToan || '---';
        const trangThaiThanhToan = payment?.trangThai;

        return (
          <Card
            key={order.id}
            style={{
              marginBottom: 24,
              border: '1px solid #d9d9d9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #d9d9d9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 500 }}>
                <Tag color="blue">
                  <BarcodeOutlined /> Mã HĐ: {order.maHoaDon}
                </Tag>
              </div>
              <div>
                {trangThaiThanhToan === 3 ? (
                  <Tag color="red">Chưa thanh toán</Tag>
                ) : (
                  <Tag color="green">Đã thanh toán</Tag>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            {order.products?.map((sp, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ width: 80, height: 80, marginRight: 16 }}>
                  <Image
                    src={sp.image[0].anhUrl || '/default.jpg'}
                    width={80}
                    height={80}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                    alt={sp.image[0].anhUrl}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>{sp.sanPham}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    Phân loại: {sp.mauSac}, {sp.kichThuoc}, {sp.chatLieu}
                  </div>
                  <div style={{ fontSize: 13, color: '#888' }}>x{sp.soLuongMua}</div>
                </div>

                <div style={{ textAlign: 'right', minWidth: 100 }}>
                  <div style={{ color: '#d4380d', fontWeight: 600, fontSize: 16 }}>
                    {sp.gia.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 13, color: '#888' }}>
                Ngày tạo: {moment(order.ngayTao).format('DD-MM-YYYY HH:mm')}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ marginRight: 8, fontSize: 14 }}>Thành tiền:</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#d4380d' }}>
                    {tongTienThanhToan.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div>
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={() => handleViewDetails(order.id)}
                  >
                    Chi tiết đơn hàng
                  </Button>

                  <Button
                    danger
                    //onClick={() => handleCancelOrder(order.id)}
                  >
                    Hủy đơn hàng
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      });
  };

  const renderTrangThaiTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case 2:
        return <Tag color="blue">Đã xác nhận</Tag>;
      case 3:
        return <Tag color="processing">Đang giao</Tag>;
      case 4:
        return <Tag color="green">Hoàn thành</Tag>;
      case 5:
        return <Tag color="red">Đã hủy</Tag>;
      case 6:
        return <Tag color="purple">Đã hoàn hàng</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };
  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <Layout
      style={{
        width: '80%',
        minHeight: '700px',
        background: '#fff',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <Sidebar />
      <Layout style={{ padding: '24px', backgroundColor: '#fff' }}>
        <Content style={{ backgroundColor: '#fff' }}>
          <Title level={4}>Đơn Mua</Title>
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <Badge
                  count={orders.length}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Tất cả</span>
                </Badge>
              }
              key="1"
            >
              {renderOrdersByStatus(1)}
              {renderOrdersByStatus(2)}
              {renderOrdersByStatus(3)}
              {renderOrdersByStatus(4)}
              {renderOrdersByStatus(5)}
              {renderOrdersByStatus(6)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(1)}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Chờ xác nhận</span>
                </Badge>
              }
              key="2"
            >
              {renderOrdersByStatus(1)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(2)}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Đã xác nhận</span>
                </Badge>
              }
              key="3"
            >
              {renderOrdersByStatus(2)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(3)}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Chờ giao hàng</span>
                </Badge>
              }
              key="4"
            >
              {renderOrdersByStatus(3)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(4)}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Đang giao hàng</span>
                </Badge>
              }
              key="5"
            >
              {renderOrdersByStatus(4)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(5)}
                  offset={[8, -4]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Hoàn thành</span>
                </Badge>
              }
              key="6"
            >
              {renderOrdersByStatus(5)}
            </TabPane>

            <TabPane
              tab={
                <Badge
                  count={countOrdersByStatus(6)}
                  offset={[8, -3]}
                  style={{
                    backgroundColor: '#ffccc7', // đỏ nhạt
                    color: '#cf1322', // đỏ đậm cho chữ
                    fontWeight: 'bold',
                    fontSize: 10,
                    borderRadius: '50%',
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    padding: 0,
                    textAlign: 'center',
                    boxShadow: 'none',
                  }}
                >
                  <span>Đã hủy</span>
                </Badge>
              }
              key="7"
            >
              {renderOrdersByStatus(6)}
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OrderPage;
