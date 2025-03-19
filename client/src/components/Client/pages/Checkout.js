import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Image,
  message,
  Modal,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
const { Title, Text } = Typography;
const { Option } = Select;

const CheckoutForm = () => {
  const location = useLocation();
  const { cartProducts = [], selectedVoucher = null } = location.state || {};
  const [showDetails, setShowDetails] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [qrUrl, setQrUrl] = useState('');
  const [isModalPaymentQR, setIsModalVisiblePaymentQR] = useState(false);
  const [maHoaDon, setMaHoaDon] = useState(null);
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';
  const navigate = useNavigate();
  useEffect(() => {
    // Lấy danh sách tỉnh/thành phố
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => setProvinces(res.data.data))
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, []);

  const handleProvinceChange = (value) => {
    setFormData({ ...formData, province: value, district: null, ward: null });
    setSelectedProvince(value);
    // Lấy danh sách quận/huyện
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: value },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setDistricts(res.data.data))
      .catch((err) => console.error('Lỗi lấy quận huyện:', err));
  };

  const handleDistrictChange = (value) => {
    setFormData({ ...formData, district: value, ward: null });
    setSelectedDistrict(value);
    // Lấy danh sách phường/xã
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id',
        { district_id: value },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setWards(res.data.data))
      .catch((err) => console.error('Lỗi lấy phường xã:', err));
  };
  const fetchShippingFee = () => {
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          service_type_id: 2,
          insurance_value: totalAmount,
          from_district_id: 3440, //nam từ liêm // Mã quận/huyện của shop
          to_district_id: selectedDistrict,
          weight: 1000, // Trọng lượng gói hàng (đơn vị gram)
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
      .then((res) => {
        console.log('Phí ship:', res.data.data.total);
        setShippingFee(res.data.data.total);
      })
      .catch((err) => console.error('Lỗi tính phí ship:', err));
  };

  // Gọi khi chọn quận/huyện xong
  useEffect(() => {
    if (selectedDistrict) {
      fetchShippingFee();
    }
  }, [selectedDistrict]);

  const totalAmount = cartProducts.reduce(
    (total, product) => total + product.gia * product.quantity,
    0,
  );
  const totalPayMent = totalAmount + shippingFee - selectedVoucher.giaTriGiam;

  //mã hóa đơn
  const generateUniqueOrderCode = () => {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const timestampPart = Date.now();
    return `HDO${timestampPart}${randomPart}`;
  };

  const generateQR = (maHoaDon) => {
    const account = '102876619993'; // Số tài khoản nhận
    const bank = 'VietinBank'; // Ngân hàng (Vietinbank)
    // Lấy mã hóa đơn từ đối tượng order của tab hiện tại
    // const currentOrder = tabs.find(tab => tab.key === hoaDonId)?.order;
    // const maHoaDon = currentOrder?.maHoaDon || hoaDonId;
    const description = `SEVQR thanh toan don hang ${maHoaDon}`; // Nội dung thanh toán
    const template = 'compact'; // Kiểu hiển thị QR

    // Tạo URL QR Code
    const qrLink = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${totalPayMent}&des=${encodeURIComponent(
      description,
    )}&template=${template}&download=false`;

    setQrUrl(qrLink); // Cũng lưu vào qrUrl để hiển thị trong modal
    setIsModalVisiblePaymentQR(true); // Mở modal hiển thị QR
  };

  const toggleDetails = () => setShowDetails(!showDetails);

  const validateForm = () => {
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const requiredFields = [
      { field: 'hoTen', message: 'Vui lòng nhập họ tên!' },
      { field: 'soDienThoai', message: 'Vui lòng nhập số điện thoại!' },
      { field: 'email', message: 'Vui lòng nhập email!' },
      { field: 'province', message: 'Vui lòng chọn tỉnh/thành phố!' },
      { field: 'district', message: 'Vui lòng chọn quận/huyện!' },
      { field: 'ward', message: 'Vui lòng chọn phường/xã!' },
      { field: 'diaChi', message: 'Vui lòng nhập địa chỉ!' },
    ];

    for (const { field, message: errorMsg } of requiredFields) {
      if (!formData[field]) {
        message.error(errorMsg);
        return false;
      }
    }

    if (!phoneRegex.test(formData.soDienThoai)) {
      message.error('Số điện thoại không hợp lệ! (10 chữ số)');
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      message.error('Email không hợp lệ!');
      return false;
    }

    if (!formData.phuongThucThanhToan) {
      message.error('Vui lòng chọn hình thức thanh toán!');
      return false;
    }

    return true;
  };
  console.log('formData:', formData);
  console.log('selectedVoucher:', selectedVoucher);
  console.log('totalAmount:', totalAmount);
  console.log('totalPayMent:', totalPayMent);
  console.log('cartProducts:', cartProducts);

  // const handleSubmitOrder = () => {
  //   if (!validateForm()) return;
  // SetMaHoaDon(generateUniqueOrderCode());
  //   const orderData = {
  //     sanPhamChiTietList: cartProducts,
  //     thongTinGiaoHang: formData,
  //     tongTienThanhToan: totalPayMent,
  //     tongTienHang: totalAmount,
  //     phieuGiamGia: selectedVoucher,
  //   };
  // if(formData.phuongThucThanhToan === 'BANK'){
  //   generateQR();
  //   return;
  // }
  //   axios
  //     .post('http://localhost:8080/api/client/thanhtoan/thanhToanDonHangChuaDangNhap', orderData)
  //     .then((res) => {
  //       message.success(res.data || 'Đặt hàng thành công!');
  //     })
  //     .catch((err) => {
  //       const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
  //       message.error(errorMessage);
  //     });
  // };
  const checkPaymentStatus = async (hoaDonId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/client/thanhtoan/sepay/transactions?account_number=102876619993&limit=5`,
      );

      const transactions = res.data?.transactions || [];

      console.log(' Dữ liệu giao dịch:', transactions);

      // Tìm giao dịch có chứa mã hóa đơn và đảm bảo tiền vào lớn hơn 0
      const foundTransaction = transactions.find(
        (txn) =>
          txn.transaction_content.includes(`SEVQR thanh toan don hang ${hoaDonId}`) &&
          parseFloat(txn.amount_in) > 0, // Đảm bảo có tiền vào tài khoản
      );

      if (foundTransaction) {
        console.log(` Giao dịch thành công cho hóa đơn: ${hoaDonId}`);
        return true;
      }

      console.log(` Chưa có giao dịch khớp với hóa đơn: ${hoaDonId}`);
      return false;
    } catch (error) {
      console.error(' Lỗi khi kiểm tra thanh toán:', error.response?.data || error.message);
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    const uniqueOrderCode = generateUniqueOrderCode();
    const orderData = {
      sanPhamChiTietList: cartProducts,
      thongTinGiaoHang: {
        ...formData,
        maHoaDon: uniqueOrderCode, // Thêm mã hóa đơn vào thông tin giao hàng
      },
      tongTienThanhToan: totalPayMent,
      tongTienHang: totalAmount,
      phieuGiamGia: selectedVoucher,
    };

    if (formData.phuongThucThanhToan === 'BANK') {
      generateQR(uniqueOrderCode); // Tạo QR cho thanh toán
      setIsModalVisiblePaymentQR(true); // Hiện modal chờ thanh toán

      let isPaid = false;
      let attempts = 0;

      // Kiểm tra trạng thái thanh toán mỗi 5 giây trong 60 giây
      const interval = setInterval(async () => {
        attempts++;
        isPaid = await checkPaymentStatus(uniqueOrderCode);

        if (isPaid) {
          message.success('Thanh toán thành công!');
          setIsModalVisiblePaymentQR(false);
          clearInterval(interval);

          axios
            .post(
              'http://localhost:8080/api/client/thanhtoan/thanhToanDonHangChuaDangNhap',
              orderData,
            )
            .then((res) => {
              message.success(res.data || 'Đặt hàng thành công!');

              // ✅ Xóa giỏ hàng và mã giảm giá sau khi thanh toán thành công
              localStorage.removeItem('cart');
              localStorage.removeItem('selectedVoucher');

              //  Chuyển hướng về trang xác nhận đơn hàng
              navigate('/order-success', { state: { maHoaDon: uniqueOrderCode } });
            })
            .catch((err) => {
              const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
              message.error(errorMessage);
            });
        }

        if (attempts >= 60) {
          //5 phút
          message.error('Quá thời gian chờ thanh toán. Vui lòng thử lại!');
          setIsModalVisiblePaymentQR(false);
          clearInterval(interval);
        }
      }, 5000);

      return;
    }

    // Xử lý thanh toán thường
    axios
      .post('http://localhost:8080/api/client/thanhtoan/thanhToanDonHangChuaDangNhap', orderData)
      .then((res) => {
        message.success(res.data || 'Đặt hàng thành công!');
        // ✅ Xóa giỏ hàng và mã giảm giá sau khi thanh toán thành công
        localStorage.removeItem('cart');
        localStorage.removeItem('selectedVoucher');

        // ✅ Chuyển hướng về trang xác nhận đơn hàng
        navigate('/order-success', { state: { maHoaDon: uniqueOrderCode } });
      })
      .catch((err) => {
        const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
        message.error(errorMessage);
      });
  };


    const [countdown, setCountdown] = useState(300); // 300 giây = 5 phút
  
    useEffect(() => {
      if (isModalPaymentQR && countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
  
        return () => clearInterval(timer);
      }
    }, [isModalPaymentQR, countdown]);
  
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };
    const handleCancelPayment = () => {
      setIsModalVisiblePaymentQR(false);
      setQrUrl(null); // Xóa mã QR
      setCountdown(300); // Reset lại thời gian nếu cần
      message.warning("Giao dịch đã bị hủy!");
    };
    
  return (
    <div
      style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white' }}
    >
      <Row gutter={16}>
        {/* Shipping Address Section */}
        <Col xs={24} md={14}>
          <Card>
            <Title level={2}>Địa chỉ giao hàng</Title>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Text strong>Họ tên</Text>
              </Col>
              <Col span={18}>
                <Input
                  placeholder="Họ và tên"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                />
              </Col>

              <Col span={6}>
                <Text strong>Số điện thoại</Text>
              </Col>
              <Col span={18}>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                />
              </Col>

              <Col span={6}>
                <Text strong>Email</Text>
              </Col>
              <Col span={18}>
                <Input
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Col>

              <Col span={6}>
                <Text strong>Tỉnh/Thành phố</Text>
              </Col>
              <Col span={18}>
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  style={{ width: '100%' }}
                  onChange={handleProvinceChange}
                  value={formData.province}
                >
                  {provinces.map((item) => (
                    <Option key={item.ProvinceID} value={item.ProvinceID}>
                      {item.ProvinceName}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={6}>
                <Text strong>Quận/huyện</Text>
              </Col>
              <Col span={18}>
                <Select
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  disabled={!formData.province}
                  style={{ width: '100%' }}
                  value={formData.district}
                >
                  {districts.map((item) => (
                    <Option key={item.DistrictID} value={item.DistrictID}>
                      {item.DistrictName}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={6}>
                <Text strong>Phường/xã</Text>
              </Col>
              <Col span={18}>
                <Select
                  placeholder="Chọn phường/xã"
                  style={{ width: '100%' }}
                  disabled={!formData.district}
                  onChange={(value) => setFormData({ ...formData, ward: value })}
                  value={formData.ward}
                >
                  {wards.map((item) => (
                    <Option key={item.WardCode} value={item.WardCode}>
                      {item.WardName}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={6}>
                <Text strong>Địa chỉ</Text>
              </Col>
              <Col span={18}>
                <Input
                  placeholder="Số nhà, tên đường"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                />
              </Col>

              <Col span={6}>
                <Text strong>Ghi chú</Text>
              </Col>
              <Col span={18}>
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú cho đơn hàng (nếu có)"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value || ' ' })}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Order Summary & Payment Section */}
        <Col xs={24} md={10}>
          <Card>
            <Row>
              <Title level={4}>Đơn hàng</Title>
              <Button type="default" style={{ marginLeft: '60%', backgroundColor: '#f4f5f4' }}>
                <Link to="/cart">Sửa</Link>
              </Button>
            </Row>
            <Text>
              {cartProducts.length} sản phẩm{' '}
              <a onClick={toggleDetails} style={{ color: '#1890ff', cursor: 'pointer' }}>
                {showDetails ? 'Ẩn thông tin' : 'Xem thông tin'} ▼
              </a>
            </Text>
            {showDetails && (
              <div style={{ marginTop: '10px' }}>
                {cartProducts.map((product, index) => (
                  <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ fontSize: 'small' }}>
                      {product.quantity}x {product.sanPham.tenSanPham}
                    </Text>
                    <div style={{ float: 'right' }}>{product.gia.toLocaleString()}₫</div>
                  </div>
                ))}
              </div>
            )}
            <div></div>
            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
              <Text strong style={{ fontSize: '16px' }}>
                Thành tiền
              </Text>
              <div style={{ float: 'right' }}>{totalAmount.toLocaleString()}₫</div>
            </div>
            <div style={{ padding: '5px 0' }}>
              <Text>Giảm giá</Text>
              <div style={{ float: 'right' }}>- {selectedVoucher.giaTriGiam.toLocaleString()}₫</div>
            </div>
            <div style={{ padding: '5px 0' }}>
              <Text>
                Phí vận chuyển{''}
                <Image
                  src="/logo/Logo-GHN-Blue-Orange.webp"
                  preview={false}
                  style={{
                    width: '50px',
                    height: '20px',
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                  }}
                />
              </Text>

              <div style={{ float: 'right' }}>
                + {shippingFee ? shippingFee.toLocaleString() : 0}₫
              </div>
            </div>
            <div style={{ padding: '5px 0' }}>
              <Text>Tổng tiền thanh toán:</Text>
              <div style={{ float: 'right', fontWeight: 'bold', fontSize: '16px', color: 'red' }}>
                {totalPayMent.toLocaleString()}₫
              </div>
            </div>
          </Card>
          <Card style={{ marginTop: '15px' }}>
            <Title level={4} style={{ marginTop: '20px' }}>
              Chọn hình thức thanh toán
            </Title>
            <Radio.Group
              defaultValue="cod"
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              onChange={(e) => setFormData({ ...formData, phuongThucThanhToan: e.target.value })}
            >
              <Radio value="BANK">Thanh toán bằng chuyển khoản</Radio>
              <Radio value="COD">Thanh toán bằng COD</Radio>
            </Radio.Group>
          </Card>
          <Button
            type="primary"
            style={{ marginTop: '20px', width: '100%' }}
            onClick={() => {
              if (validateForm()) {
                handleSubmitOrder();
              }
            }}
          >
            Đặt hàng
          </Button>
        </Col>
      </Row>
      <Modal
  title="Quét QR để thanh toán"
  open={isModalPaymentQR}
  onCancel={() => handleCancelPayment()}
  footer={null}
>
  {qrUrl && (
    <div style={{ textAlign: "center" }}>
      <img src={qrUrl} alt="QR Code" style={{ width: "100%" }} />
      <h3 style={{ marginTop: "10px", color: "red" }}>
        Thời gian còn lại: {formatTime(countdown)}
      </h3>
      <div style={{ marginTop: "20px", textAlign: "left" }}>
        <h4 style={{ color: "#1890ff" }}>Hướng dẫn thanh toán:</h4>
        <ol style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
          <li>Quét mã QR bằng ứng dụng ngân hàng của bạn.</li>
          <li>Kiểm tra chính xác thông tin người nhận và số tiền.</li>
          <li>Xác nhận thanh toán và chờ đơn hàng hoàn tất.</li>
          <li>
            Sau khi thanh toán, đơn hàng sẽ tự động xác nhận trong vòng 5 phút.
          </li>
        </ol>
      </div>
    </div>
  )}
</Modal>


    </div>
  );
};

export default CheckoutForm;
