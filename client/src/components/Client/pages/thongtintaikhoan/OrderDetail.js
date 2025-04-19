import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Card,
  Divider,
  Steps,
  Button,
  Row,
  Col,
  Layout,
  message,
  Modal,
  Checkbox,
  Empty,
} from 'antd';
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
  const [isAddressList, setIsAddressList] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [editableOrder, setEditableOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo(token).then((data) => {
        if (data) {
          console.log('Setting user info:', data);
          setUserInfo(data);
        }
      });
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/getInfoUser',
        { token }, // Không cần stringify thủ công vì axios tự xử lý
        { headers: { 'Content-Type': 'application/json' } },
      );
      console.log('User Info:', response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      return null;
    }
  };
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
  const fetchAddresses = async (customerId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/client/diaChi/${customerId}`);
      console.log('Fetched Addresses:', response.data);
      const addresses = response.data;
      console.log('Dữ liệu địa chỉ trả về:', response.data);
      setAddressList((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(addresses)) {
          return addresses;
        }
        return prev;
      });
      console.log('địa chỉ mặc định', addresses);
      // if (addresses.length > 0) {
      //   const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      //   console.log('địa chỉ mặc định kp', defaultAddress.huyen);
      //   setSelectedAddress((prev) => (prev !== defaultAddress ? defaultAddress : prev));
      //   setSelectedDistrict(defaultAddress.huyen);
      // }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
      message.error('Không thể tải địa chỉ. Vui lòng thử lại!');
    }
  };
  const handleSelectAddress = (diaChiString) => {
    const selected = addressList.find((address) => getFormattedAddress(address) === diaChiString);

    if (selected && getFormattedAddress(selectedAddress) !== diaChiString) {
      setSelectedAddress(diaChiString);
    }
  };

  console.log('selectedAddress', selectedAddress);

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
      const voucherRes = await axios.get(
        `http://localhost:8080/api/client/phieugiamgia/findPhieuGiamGia/${orderRes.data.idPhieuGiamGia}`,
      );

      const fullOrder = {
        ...orderRes.data,
        payments: paymentRes.data,
        products: productRes.data,
        voucher: voucherRes.data,
      };

      setOrder(fullOrder);
      setShippingFee(fullOrder.phiVanChuyen);
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
  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  console.log('order', order);
  console.log('productImages', productImages);

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

  const handleQuantityChange = async (productDetailId, newQuantity) => {
    try {
      const response = await axios.put(
        'http://localhost:8080/api/client/hoadonchoxacnhan/update-so-luong',
        {
          hoaDonId: orderId,
          sanPhamChiTietId: productDetailId,
          soLuong: newQuantity,
        },
      );

      // Sau khi cập nhật thành công, cập nhật lại state để re-render
      const updatedProducts = order.products.map((item) =>
        item.id === productDetailId ? { ...item, soLuongMua: newQuantity } : item,
      );

      // Cập nhật tổng tiền nếu cần
      const newTotal = updatedProducts.reduce(
        (total, item) => total + item.gia * item.soLuongMua,
        0,
      );

      setOrder({
        ...order,
        products: updatedProducts,
        tongTien: newTotal,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      message.error('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };
  const handleEditAddress = () => {
    setIsAddressList(true);
    setSelectedAddress(order.diaChi); // Set the selected address to the current address
    console.log('ID khách hàng', order.idKhachHang);
    console.log('Thông tin đơn hàng', order);
    fetchAddresses(order.idKhachHang); // Fetch addresses when modal opens
  };
  const getFormattedAddress = (address) => {
    return `${address.diaChiCuThe}, ${address.xa}, ${address.huyen}, ${address.tinh}`;
  };

  const handleConfirm = async () => {
    if (!orderId || !selectedAddress) {
      message.warning('Vui lòng chọn địa chỉ');
      return;
    }
    try {
      const fee = await fetchShippingFee(); // Chờ lấy phí ship xong
      setShippingFee(fee);
      Modal.confirm({
        title: 'Xác nhận thay đổi địa chỉ giao hàng?',
        content: (
          <div>
            <p>
              <strong>Địa chỉ mới: </strong>
              {`${selectedAddress.diaChiCuThe}, ${formatWardName(
                selectedAddress.xa,
                selectedAddress.huyen,
              )}, ${formatDistrictName(selectedAddress.huyen)}, ${formatProvinceName(
                selectedAddress.tinh,
              )}`}
            </p>
            <p>
              <strong>Phí vận chuyển: </strong>
              {fee.toLocaleString('vi-VN')}₫
            </p>
          </div>
        ),
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          console.log('Địa chỉ đã chọn:', selectedAddress);
          console.log('Phí vận chuyển:', fee);
          console.log('Tổng tiền thanh toán:', totalPayMent);
          console.log('ID đơn hàng:', orderId);
          console.log('khách hàng:', userInfo);
          console.log('email khách hàng:', userInfo?.email);
          if (!userInfo?.email) {
            message.error('Không lấy được email khách hàng. Vui lòng thử lại!');
            return;
          }

          try {
            const response = await axios.put(
              `http://localhost:8080/api/client/order/thaydoidiachihoadonchoxacnhan/${orderId}`,
              {
                diaChi: selectedAddress,
                shippingFee: fee,
                tongTien: totalPayMent,
                idKhachHang: userInfo?.id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );

            message.success('Cập nhật địa chỉ thành công!');
            setIsAddressList(false);
            fetchOrder?.();
          } catch (error) {
            message.error(error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại!');
          }
        },
      });
    } catch (err) {
      message.error('Không thể tính phí vận chuyển');
    }
  };

  const fetchShippingFee = () => {
    return axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          service_type_id: 2,
          insurance_value: Number(order.tongTien),
          from_district_id: 3440, // Nam Từ Liêm
          to_district_id: Number(parseAddress(selectedAddress).huyen),
          weight: 1000,
          length: 30,
          width: 20,
          height: 10,
        },
        {
          headers: {
            Token: API_TOKEN,
            ShopId: 5687296,
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => res.data.data.total);
  };
  const voucherDiscount =
    order?.tongTien > 0 ? getDiscountValue(order.voucher, order?.tongTien) : 0; //tính giảm giá
  const totalPayMent = Math.max(order?.tongTien + shippingFee - voucherDiscount, 0); //tính tổng tiền thanh toán
  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.tongTien, 0); //tổng tiền đã thanh toán
  const tienChengLech = Math.max(totalPayMent - order?.daThanhToan, 0); //tính tổng tiền còn thiếu
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
            <a
              onClick={handleEditAddress} // hàm xử lý khi nhấn "Sửa"
              style={{ marginLeft: 8, color: '#1677ff', cursor: 'pointer' }}
            >
              Sửa
            </a>
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
                    <Row align="middle" gutter={8}>
                      <Col>
                        <Button
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.soLuongMua - 1)}
                          disabled={item.soLuongMua <= 1}
                        >
                          -
                        </Button>
                      </Col>
                      <Col>
                        <Text>{item.soLuongMua}</Text>
                      </Col>
                      <Col>
                        <Button
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.soLuongMua + 1)}
                        >
                          +
                        </Button>
                      </Col>
                    </Row>

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
                  - {voucherDiscount.toLocaleString('vi-VN') || '0'}₫
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
                  {totalPayMent.toLocaleString('vi-VN')}₫
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
      <Modal
        title="Chọn địa chỉ giao hàng"
        open={isAddressList}
        footer={null}
        onCancel={() => setIsAddressList(false)}
        width={600}
      >
        {addressList.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
            {addressList.map((address) => {
              const isSelected = getFormattedAddress(address) === selectedAddress;

              return (
                <Card
                  key={address.id}
                  hoverable
                  onClick={() => handleSelectAddress(getFormattedAddress(address))}
                  style={{
                    marginBottom: '16px',
                    border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                    backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                    borderRadius: '12px',
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(24, 144, 255, 0.15)'
                      : '0 2px 6px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectAddress(getFormattedAddress(address))}
                      style={{ marginTop: 4 }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{address.name}</div>
                      <div style={{ color: '#555', marginTop: 4, wordBreak: 'break-word' }}>
                        {address.diaChiCuThe}, {formatWardName(address.xa, address.huyen)},{` `}
                        {formatDistrictName(address.huyen)}, {formatProvinceName(address.tinh)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty description="Không có địa chỉ nào, vui lòng thêm mới!" />
        )}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button type="primary" onClick={() => handleConfirm()} disabled={!selectedAddress}>
            Xác nhận
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderDetailPage;
