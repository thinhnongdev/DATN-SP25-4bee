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
  Checkbox,
  Empty,
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
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    province: null,
    district: null,
    ward: null,
    diaChiCuThe: '',
    ghiChu: '',
  });

  const [qrUrl, setQrUrl] = useState('');
  const [isModalPaymentQR, setIsModalVisiblePaymentQR] = useState(false);
  const [isAddressList, setIsAddressList] = useState(false);
  const [maHoaDon, setMaHoaDon] = useState(null);
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [userInfo, setUserInfo] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [provinceFormatData, setProvinceFormatData] = useState([]);
  const [districtFormatData, setDistrictFormatData] = useState([]);
  const [wardCache, setWardCache] = useState({});

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
    // Lấy danh sách tỉnh/thành phố
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => setProvinces(res.data.data))
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, []);

  const handleProvinceChange = (value) => {
    setFormData({ ...formData, province: value, district: null, ward: null, diaChiCuThe: null });
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setShippingFee(0);
    // Lấy danh sách quận/huyện
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: Number(value) },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setDistricts(res.data.data))
      .catch((err) => console.error('Lỗi lấy quận huyện:', err));
  };

  const handleDistrictChange = (value) => {
    setFormData({ ...formData, district: value, ward: null });
    setSelectedDistrict(value);
    console.log('id huyên', value);
    // Lấy danh sách phường/xã
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id',
        { district_id: Number(value) },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setWards(res.data.data))
      .catch((err) => console.error('Lỗi lấy phường xã:', err));
  };

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

  //Hàm fetch thông tin user từ token
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

  //Hàm fetch danh sách địa chỉ dựa vào customerId
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
      if (addresses.length > 0) {
        const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
        console.log('địa chỉ mặc định kp', defaultAddress.huyen);
        setSelectedAddress((prev) => (prev !== defaultAddress ? defaultAddress : prev));
        setSelectedDistrict(defaultAddress.huyen);
      }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
      message.error('Không thể tải địa chỉ. Vui lòng thử lại!');
    }
  };

  //Fetch user info khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found:', token);
      fetchUserInfo(token).then((data) => {
        if (data) {
          console.log('Setting user info:', data);
          setUserInfo(data);
        }
      });
    } else {
      console.log('Không tìm thấy token');
    }
  }, []);
  useEffect(() => {
    if (userInfo?.id) {
      fetchAddresses(userInfo.id);
    }
  }, [userInfo]);
  const fetchShippingFee = () => {
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          service_type_id: 2,
          insurance_value: Number(totalAmount),
          from_district_id: 3440, //huyện nam từ liêm
          to_district_id: Number(selectedDistrict),
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

  // Gọi phí vận chuyển khi quận/huyện thay đổi và đã có đầy đủ thông tin cần thiết
  useEffect(() => {
    if (formData.district) {
      setSelectedDistrict(formData.district);
      fetchShippingFee();
      console.log('Phí ship thay đổi:', shippingFee);
    }
  }, [formData.district]);
  useEffect(() => {
    if (selectedDistrict) {
      fetchShippingFee();
    }
    fetchShippingFee();
  }, [selectedDistrict]);
  const handleOpenAddress = () => {
    setIsAddressList(true);
    if (userInfo?.id) {
      console.log('Fetching addresses for customerId:', userInfo.id);
      fetchAddresses(userInfo.id);
    }
  };
  const handleSelectAddress = (addressId) => {
    const selected = addressList.find((address) => address.id === addressId);

    if (selected && selected.id !== selectedAddress?.id) {
      setSelectedAddress(selected);

      // Cập nhật form với thông tin địa chỉ được chọn
      setFormData({
        id: selected.id || '',
        hoTen: selected.name || '',
        soDienThoai: selected.phone || '',
        email: selected.email || '',
        province: selected.tinh,
        district: selected.huyen,
        ward: selected.xa,
        diaChiCuThe: selected.diaChiCuThe,
      });
    }
  };

  const handleConfirm = () => {
    if (selectedAddress) {
      console.log('địa chỉ da chon:', selectedAddress);
      setIsAddressList(false);
    } else {
      message.warning('Vui lòng chọn một địa chỉ!');
    }
  };
  // const handleCancelAddress = () => {
  //   setFormData({ ...formData, province: null, district: null, ward: null,diaChiCuThe:null });
  //   setIsAddressList(false);
  // };

  // Load tỉnh thành phố
  useEffect(() => {
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => {
        setProvinces(res.data.data);

        // Nếu có sẵn địa chỉ mặc định, cập nhật formData
        if (userInfo) {
          setFormData((prevData) => ({
            ...prevData,
            hoTen: userInfo.ten || '',
            soDienThoai: userInfo.soDienThoai || '',
            email: userInfo.email || '',
          }));
        }

        if (selectedAddress) {
          setFormData((prevData) => ({
            ...prevData,
            province: selectedAddress.tinh,
            district: selectedAddress.huyen,
            ward: selectedAddress.xa,
            diaChiCuThe: selectedAddress.diaChiCuThe,
          }));
        }
      })
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, [userInfo, selectedAddress]);

  // Load quận/huyện khi có tỉnh mặc định
  useEffect(() => {
    if (formData.province) {
      axios
        .post(
          'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
          { province_id: Number(formData.province) },
          { headers: { Token: API_TOKEN } },
        )
        .then((res) => {
          setDistricts(res.data.data);

          // Nếu đã có quận/huyện mặc định, load tiếp phường/xã
          if (formData.district) {
            axios
              .post(
                'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward',
                { district_id: Number(formData.district) },
                { headers: { Token: API_TOKEN } },
              )
              .then((res) => setWards(res.data.data))
              .catch((err) => console.error('Lỗi lấy phường xã:', err));
          }
        })
        .catch((err) => console.error('Lỗi lấy quận huyện:', err));
    }
  }, [formData.province]);

  // Load phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    if (formData.district) {
      axios
        .post(
          'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward',
          { district_id: Number(formData.district) },
          { headers: { Token: API_TOKEN } },
        )
        .then((res) => setWards(res.data.data))
        .catch((err) => console.error('Lỗi lấy phường xã:', err));
    }
  }, [formData.district]);

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
      { field: 'diaChiCuThe', message: 'Vui lòng nhập địa chỉ cụ thể!' },
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

    Modal.confirm({
      title: 'Xác nhận đặt hàng',
      content: 'Bạn có chắc muốn đặt hàng không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        const uniqueOrderCode = generateUniqueOrderCode();
        const orderData = {
          sanPhamChiTietList: cartProducts,
          thongTinGiaoHang: {
            ...formData,
            maHoaDon: uniqueOrderCode,
          },
          tongTienThanhToan: totalPayMent,
          tongTienHang: totalAmount,
          phieuGiamGia: selectedVoucher,
        };

        if (formData.phuongThucThanhToan === 'BANK') {
          generateQR(uniqueOrderCode);
          setIsModalVisiblePaymentQR(true);

          let isPaid = false;
          let attempts = 0;

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
                  localStorage.removeItem('cart');
                  localStorage.removeItem('selectedVoucher');
                  navigate('/order-success', { state: { maHoaDon: uniqueOrderCode } });
                })
                .catch((err) => {
                  const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
                  message.error(errorMessage);
                });
            }

            if (attempts >= 60) {
              message.error('Quá thời gian chờ thanh toán. Vui lòng thử lại!');
              setIsModalVisiblePaymentQR(false);
              clearInterval(interval);
            }
          }, 5000);

          return;
        }

        axios
          .post(
            'http://localhost:8080/api/client/thanhtoan/thanhToanDonHangChuaDangNhap',
            orderData,
          )
          .then((res) => {
            message.success(res.data || 'Đặt hàng thành công!');
            localStorage.removeItem('cart');
            localStorage.removeItem('selectedVoucher');
            navigate('/order-success', { state: { maHoaDon: uniqueOrderCode } });
          })
          .catch((err) => {
            const errorMessage = err.response?.data || 'Đặt hàng thất bại: Lỗi từ server';
            message.error(errorMessage);
          });
      },
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
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const handleCancelPayment = () => {
    setIsModalVisiblePaymentQR(false);
    setQrUrl(null); // Xóa mã QR
    setCountdown(300); // Reset lại thời gian nếu cần
    message.warning('Giao dịch đã bị hủy!');
  };

  return (
    <div
      style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white' }}
    >
      <Row gutter={16}>
        {/* Shipping Address Section */}
        <Col xs={24} md={14}>
          <Card>
            <Row align="middle" style={{ marginBottom: '20px' }}>
              <Col>
                <Title level={2}>Địa chỉ giao hàng</Title>
              </Col>
              <Col flex="auto" style={{ textAlign: 'right' }}>
                {token ? <Button onClick={() => handleOpenAddress()}>Chọn địa chỉ</Button> : null}
              </Col>
            </Row>

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
                    <Option key={item.ProvinceID} value={item.ProvinceID.toString()}>
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
                  value={districts.length ? formData.district : undefined} // Chờ load xong mới hiện
                >
                  {districts.map((item) => (
                    <Option key={item.DistrictID} value={item.DistrictID.toString()}>
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
                  value={wards.length ? formData.ward : undefined} // Chờ load xong mới hiện
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
                  value={formData.diaChiCuThe}
                  onChange={(e) => setFormData({ ...formData, diaChiCuThe: e.target.value })}
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
          <div style={{ textAlign: 'center' }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '100%' }} />
            <h3 style={{ marginTop: '10px', color: 'red' }}>
              Thời gian còn lại: {formatTime(countdown)}
            </h3>
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h4 style={{ color: '#1890ff' }}>Hướng dẫn thanh toán:</h4>
              <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Quét mã QR bằng ứng dụng ngân hàng của bạn.</li>
                <li>Kiểm tra chính xác thông tin người nhận và số tiền.</li>
                <li>Xác nhận thanh toán và chờ đơn hàng hoàn tất.</li>
                <li>Sau khi thanh toán, đơn hàng sẽ tự động xác nhận trong vòng 5 phút.</li>
              </ol>
            </div>
          </div>
        )}
      </Modal>
      <Modal title="Chọn địa chỉ giao hàng" open={isAddressList} closable={false} footer={null}>
        <Row gutter={[16, 16]} style={{ flexDirection: 'column', alignItems: 'center' }}>
          {addressList.length > 0 ? (
            addressList.map((address) => (
              <Col span={24} key={address.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  title={address.name}
                  bordered={selectedAddress.id === address.id}
                  style={{
                    backgroundColor: selectedAddress.id === address.id ? '#e6f7ff' : '#fff',
                    transition: 'background-color 0.2s ease-in-out',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    width: '450px', //  Kích thước cố định
                    minHeight: '100px', //  Đảm bảo không quá nhỏ
                    maxHeight: '300px', //  Không cho vượt quá chiều cao
                    overflow: 'hidden', //  Ẩn nội dung tràn
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleSelectAddress(address.id)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      whiteSpace: 'normal', // Cho phép xuống dòng
                      wordBreak: 'break-word', // Tự động xuống dòng khi quá dài
                    }}
                  >
                    <Checkbox checked={selectedAddress.id === address.id} />
                    <span>
                      {address.diaChiCuThe}, {formatWardName(address.xa, address.huyen)},{' '}
                      {formatDistrictName(address.huyen)}, {formatProvinceName(address.tinh)}
                    </span>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Empty description="Không có địa chỉ nào, vui lòng thêm mới!" />
          )}
        </Row>
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button type="primary" onClick={() => handleConfirm()} disabled={!selectedAddress}>
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutForm;
