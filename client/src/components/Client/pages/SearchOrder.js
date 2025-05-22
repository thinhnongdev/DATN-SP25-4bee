import React, { useEffect, useState } from 'react';
import {
  Layout,
  Typography,
  Input,
  Button,
  Form,
  message,
  Card,
  Image,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { BarcodeOutlined, PhoneOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography

function TimKiemHoaDonKhach() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
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
  const getDiscountValue = (voucher, totalAmount) => {
    if (!voucher) return 0; // Nếu không có voucher, không giảm giá
  
    if (voucher.loaiPhieuGiamGia === 1) {
      // Giảm theo %
      const discount = (parseFloat(voucher.giaTriGiam) / 100) * totalAmount;
      return Math.min(discount, voucher.soTienGiamToiDa); // Không vượt quá mức tối đa
    }
    // Giảm giá cố định (VND)
    return voucher.giaTriGiam || 0;
  };
  const fetchOrder = async ({ maHoaDon }) => {
    if (!maHoaDon) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/client/order/findHoaDonByMaHoaDon/${maHoaDon}`,
      );
      const fetchedOrders = res.data;

      const enrichedOrders = await Promise.all(
        fetchedOrders.map(async (order) => {
          try {
            const [paymentRes, productsRes] = await Promise.all([
              axios.get(
                `http://localhost:8080/api/client/thanhtoan/findThanhToanHoaDonByIdHoaDon/${order.id}`,
              ),
              axios.get(`http://localhost:8080/api/client/findDanhSachSPCTbyIdHoaDon/${order.id}`),
            ]);

            const productsWithImages = await Promise.all(
              (productsRes.data || []).map(async (product) => {
                const imageUrl = await fetchProductImage(product.id);
                return { ...product, image: imageUrl };
              }),
            );

            let voucher = null;
            if (order.idPhieuGiamGia) {
              try {
                const voucherRes = await axios.get(
                  `http://localhost:8080/api/client/phieugiamgia/findPhieuGiamGia/${order.idPhieuGiamGia}`,
                );
                voucher = voucherRes.data;
              } catch (err) {
                console.warn('Không tìm thấy phiếu giảm giá:', err);
              }
            }

            return {
              ...order,
              payments: paymentRes.data || [],
              products: productsWithImages,
              voucher,
            };
          } catch (err) {
            console.error('Lỗi enrich order:', err);
            return {
              ...order,
              payments: [],
              products: [],
              voucher: null,
            };
          }
        }),
      );

      setOrders(enrichedOrders);
    } catch (err) {
      message.error('Không tìm thấy đơn hàng.');
    } finally {
      setLoading(false);
    }
  };
  const renderTrangThaiTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="orange">Chờ xác nhận</Tag>;
      case 2:
        return <Tag color="blue">Đã xác nhận</Tag>;
      case 3:
        return <Tag color="processing">Chờ giao hàng</Tag>;
      case 4:
        return <Tag color="green">Đang giao hàng</Tag>;
      case 5:
        return <Tag color="purple">Hoàn thành</Tag>;
      case 6:
        return <Tag color="red">Đã hủy</Tag>;
      case 7:
        return <Tag color="purple">Đã hoàn thành</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };
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
  
  return (
    <Layout style={{ background: '#fff', minHeight: '100vh', padding: '50px 20px' }}>
      <Content>
        {/* Form tra cứu trong card nhỏ */}
        <Card
          style={{
            maxWidth: 500,
            margin: '0 auto',
            marginBottom: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          bordered
        >
          <Title level={4} style={{ textAlign: 'center' }}>
            Tra cứu đơn hàng
          </Title>
          <Form form={form} layout="vertical" onFinish={fetchOrder}>
            <Form.Item
              name="maHoaDon"
              label="Mã hóa đơn"
              rules={[{ required: true, message: 'Vui lòng nhập mã hóa đơn' }]}
            >
              <Input prefix={<BarcodeOutlined />} placeholder="Nhập mã hóa đơn" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tra cứu
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Card hóa đơn lớn hơn, hiển thị đầy đủ thông tin */}
        {orders.map((order, index) => (
          <Card
            key={index}
            title={`Hóa đơn: ${order.maHoaDon}`}
            style={{
              marginTop: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              borderRadius: 8,
              padding: 16,
              maxWidth: '50%',
              margin: '0 auto',
            }}
            headStyle={{ backgroundColor: '#f5f5f5' }}
            bordered
          >
            <p>
              <b>Trạng thái:</b> {renderTrangThaiTag(order.trangThai)}
            </p>
            <p>
              <b>Ngày tạo:</b> {moment(order.ngayTao).format('DD-MM-YYYY HH:mm')}
            </p>
            <p>
              <b>Người nhận:</b> {order.tenNguoiNhan} - {order.soDienThoai}
            </p>
            <p>
              <b>Địa chỉ:</b> {parseAddress(order.diaChi).diaChiCuThe}, {formatWardName(parseAddress(order.diaChi).xa, parseAddress(order.diaChi).huyen)},
                  {formatDistrictName(parseAddress(order.diaChi).huyen)}, {formatProvinceName(parseAddress(order.diaChi).tinh)}
            </p>

            <Divider />
            <Title level={5}>Sản phẩm</Title>
            {order.products.map((sp, idx) => (
              <Row key={idx} gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={4}>
                  <Image
                    src={sp.image?.[0]?.anhUrl || '/default.jpg'}
                    width={80}
                    height={80}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                </Col>
                <Col span={20}>
                  <div>
                    <strong>{sp.sanPham}</strong>
                  </div>
                  <div>
                    Phân loại: {sp.mauSac}, {sp.kichThuoc}, {sp.chatLieu}
                  </div>
                  <div>Số lượng: x{sp.soLuongMua}</div>
                  <div>Giá: {sp.giaTaiThoiDiemThem.toLocaleString('vi-VN')} đ</div>
                </Col>
              </Row>
            ))}

            <Divider />
            <p>
              <b>Phí vận chuyển:</b> {order.phiVanChuyen.toLocaleString('vi-VN')} đ
            </p>
            <p>
              <b>Giảm giá:</b>{' '}
              {getDiscountValue(order.voucher, order.tongTien).toLocaleString('vi-VN')} đ
            </p>
            <Text strong style={{ fontSize: 16 }}>
              Tổng thanh toán:{' '}
              {(
                order.tongTien -
                getDiscountValue(order.voucher, order.tongTien) +
                order.phiVanChuyen
              ).toLocaleString('vi-VN')}{' '}
              đ
            </Text>
          </Card>
        ))}
      </Content>
    </Layout>
  );
}
export default TimKiemHoaDonKhach;
