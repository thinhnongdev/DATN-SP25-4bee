import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Card, Divider, Steps, Button, Row, Col, Layout, message } from 'antd';
import moment from 'moment';
import Sidebar from './SidebarProfile';

const { Title, Text } = Typography;
const { Step } = Steps;

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [productImages, setProductImages] = useState({}); // { productDetailId: imageUrl }
  const [provinceFormatData, setProvinceFormatData] = useState([]);
  const [districtFormatData, setDistrictFormatData] = useState([]);
  const [wardCache, setWardCache] = useState({});
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';
  const fetchLocationData = async () => {
    try {
      const headers = { Token: API_TOKEN, 'Content-Type': 'application/json' };

      const [provinceRes, districtRes] = await Promise.all([
        axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
          headers,
        }),
        axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', {
          headers,
        }),
      ]);

      setProvinceFormatData(provinceRes.data.data);
      setDistrictFormatData(districtRes.data.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu địa chỉ:', error);
      message.error('Không thể tải dữ liệu địa chỉ. Vui lòng kiểm tra lại API hoặc token!');
    }
  };

  // Format xã/phường và tự động fetch nếu chưa có dữ liệu
  const fetchWardByDistrict = async (districtId) => {
    try {
      const response = await axios.get(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
        {
          headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
        },
      );

      if (response.data.code === 200) {
        setWardCache((prevCache) => ({
          ...prevCache,
          [districtId]: response.data.data,
        }));
      } else {
        console.error('Lỗi API GHN:', response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải xã/phường:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);
  const formatProvinceName = (provinceId) => {
    if (!provinceFormatData.length) return 'Đang tải...';
    const province = provinceFormatData.find((p) => String(p.ProvinceID) === String(provinceId));
    return province ? province.ProvinceName : 'Không xác định';
  };

  const formatDistrictName = (districtId) => {
    if (!districtFormatData.length) return 'Đang tải...';
    const district = districtFormatData.find((d) => String(d.DistrictID) === String(districtId));
    return district ? district.DistrictName : 'Không xác định';
  };

  const formatWardName = (wardId, districtId) => {
    // Kiểm tra cache
    if (!wardCache[districtId]) {
      fetchWardByDistrict(districtId);
      return 'Đang tải xã/phường...';
    }

    const ward = wardCache[districtId].find((w) => String(w.WardCode) === String(wardId));

    return ward ? ward.WardName : 'Không xác định';
  };
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRes = await axios.get(
          `http://localhost:8080/api/client/order/findHoaDonById/${orderId}`,
        );
        const paymentRes = await axios.get(
          `http://localhost:8080/api/client/thanhtoan/findThanhToanHoaDonByIdHoaDon/${orderId}`,
        );
        const productRes = await axios.get(
          `http://localhost:8080/api/client/findDanhSachSPCTbyIdHoaDon/${orderId}`,
        );

        const fullOrder = {
          ...orderRes.data,
          payments: paymentRes.data,
          products: productRes.data,
        };

        setOrder(fullOrder);

        // Lấy ảnh cho từng sản phẩm
        const imageMap = {};
        for (const product of productRes.data) {
          const img = await fetchProductImage(product.id);
          if (img && img.length > 0) {
            imageMap[product.id] = img[0].anhUrl; // lấy ảnh đầu tiên
          }
        }
        setProductImages(imageMap);
      } catch (error) {
        console.error('Lỗi lấy chi tiết đơn hàng:', error);
      }
    };

    fetchOrder();
  }, [orderId]);
  console.log('order', order);
  console.log('productImages', productImages);
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

  if (!order) return <div>Đang tải...</div>;

  const stepStatus = [
    'Chờ Xác Nhận',
    'Đã Xác Nhận',
    'Chờ Giao Hàng',
    'Đang Giao Hàng',
    'Hoàn Thành',
  ];
  const currentStep = order.trangThai ?? 0;
  const parseAddress = (rawAddress) => {
    if (!rawAddress) return {};

    const parts = rawAddress.split(',').map((p) => p.trim());

    return {
      diaChiCuThe: parts[0] || '',
      xa: parts[1] || '',
      huyen: parts[2] || '',
      tinh: parts[3] || '',
    };
  };
  const address = parseAddress(order.diaChi);
  console.log('currentStep', currentStep);
  return (
    <Layout
      style={{
        width: '80%',
        minHeight: '700px',
        background: '#f5f5f5',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <Sidebar />
      <div
        style={{
          backgroundColor: '#fff',
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Button type="link" onClick={() => window.history.back()}>
          &lt; TRỞ LẠI
        </Button>
        <Card style={{ marginTop: 16, border: '1px solid rgb(241, 241, 241)', borderRadius: 8 }}>
          <Steps
            current={currentStep}
            style={{
              marginTop: 10,
              padding: 34,
              backgroundColor: 'rgb(238, 236, 236)',
              borderRadius: 12,
              // border: '1px solidrgb(212, 206, 206)',
            }}
          >
            {stepStatus.map((label, index) => (
              <Step key={index} title={label} />
            ))}
          </Steps>
          <Row style={{ marginTop: 16 }} justify="end" align="middle">
            <Col>
              <Button type="default" danger style={{ borderColor: 'red', color: 'red' }}>
                Hủy đơn hàng
              </Button>
            </Col>
          </Row>
        </Card>
        <Card style={{ marginTop: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
          <Title level={5}>Địa Chỉ Nhận Hàng</Title>
          <Text strong>Tên người nhận: {order.tenNguoiNhan}</Text>
          <br />
          <Text>Email: {order.emailNguoiNhan}</Text>
          <br />
          <Text>SĐT: {order.soDienThoai}</Text>
          <br />
          <Text>
            Địa chỉ: {address.diaChiCuThe}, {formatWardName(address.xa, address.huyen)},{' '}
            {formatDistrictName(address.huyen)}, {formatProvinceName(address.tinh)}
          </Text>
        </Card>

        <Divider />
        <Card style={{ marginTop: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Sản phẩm
              </Title>
            </Col>
            <Col>
              <Text style={{ fontWeight: 500 }}>Mã đơn hàng: {order.maHoaDon}</Text>
            </Col>
          </Row>
          {order.products?.map((item, idx) => {
            const totalProductPrice = item.gia * item.soLuongMua;

            return (
              <div
                key={idx}
                style={{ borderBottom: '1px solid rgb(75, 74, 74)', padding: '12px 0' }}
              >
                <Row gutter={16} align="middle" justify="space-between">
                  <Col span={4}>
                    <img
                      src={productImages[item.id]}
                      alt="product"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Col>
                  <Col span={16}>
                    <Text strong>{item.sanPham}</Text>
                    <br />
                    <Text type="secondary">
                      Màu: {item.mauSac}, Kích thước: {item.kichThuoc}, Chất liệu: {item.chatLieu}
                    </Text>
                    <br />
                    <Text>Số lượng: x{item.soLuongMua}</Text>
                    <br />
                    <Text style={{ color: 'red', fontWeight: 500 }}>
                      Đơn giá: {item.gia.toLocaleString('vi-VN')}₫
                    </Text>
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    <Text strong style={{ color: '#1677ff' }}>
                      {totalProductPrice.toLocaleString('vi-VN')}₫
                    </Text>
                  </Col>
                </Row>
              </div>
            );
          })}
          <Card
            style={{
              borderRadius: 8,
              backgroundColor: 'rgb(247, 245, 231)',
            }}
          >
            <Row justify="space-between">
              <Col>
                <Text>Tổng tiền hàng</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: '16px' }}>{order.tongTien.toLocaleString('vi-VN')}₫</Text>
              </Col>
            </Row>
            <br />
            <Row justify="space-between" style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12 }}>
              <Col>
                <Text>Giảm giá</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: '16px' }}>
                  -{' '}
                  {(
                    order.tongTien +
                    (order.phiVanChuyen || 0) -
                    order.payments[0].tongTien
                  ).toLocaleString('vi-VN')}
                  ₫
                </Text>
              </Col>
            </Row>
            <br />
            <Row
              justify="space-between"
              style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12, paddingBottom: 12 }}
            >
              <Col>
                <Text>Phí vận chuyển</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: '16px' }}>
                  + {order.phiVanChuyen?.toLocaleString('vi-VN') || '0'}₫
                </Text>
              </Col>
            </Row>
            <Row
              justify="space-between"
              style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12, paddingBottom: 12 }}
            >
              <Col>
                <Text strong>Thành tiền</Text>
              </Col>
              <Col>
                <Text strong style={{ color: 'red', fontSize: 18 }}>
                  {(order.tongTien + (order.phiVanChuyen || 0)).toLocaleString('vi-VN')}₫
                </Text>
              </Col>
            </Row>
            <Row
              justify="space-between"
              style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12, paddingBottom: 12 }}
            >
              <Col>
                <Text>Phương thức thanh toán: </Text>
                <Text>
                  {order.payments?.[0]?.phuongThucThanhToan?.tenPhuongThucThanhToan || '---'}
                </Text>
              </Col>
            </Row>
          </Card>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;
