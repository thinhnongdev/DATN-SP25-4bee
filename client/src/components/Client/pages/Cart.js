import React, { useEffect, useState } from 'react';
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
  message,
  List,
  Modal,
  Radio,
  Tag,
} from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkTokenValidity } from './checkTokenValidity';
import { jwtDecode } from 'jwt-decode';
import isEqual from 'lodash/isEqual';
const { Title, Text } = Typography;
const Cart = () => {
  const [isModalVoucher, setIsModalVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idHoaDon, setIdHoaDon] = useState(null);
  const navigate = useNavigate();
  const fetchProductImage = async (productDetailId) => {
    try {
      const response = await axios.get(
        `https://datn-sp25-4bee.onrender.com/api/client/sanphamchitiet/${productDetailId}/hinhanh`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product image:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Nếu có token (đã đăng nhập) thì lấy giỏ hàng từ hóa đơn đang chờ
        if (token) {
          const decodedToken = jwtDecode(token);
          const email = decodedToken?.sub;

          const hoaDonResponse = await axios.get(
            `https://datn-sp25-4bee.onrender.com/api/client/order/findHoaDonPending/${email}`,
          );
          const idHoaDon = hoaDonResponse.data?.id;
          setIdHoaDon(idHoaDon);

          if (!idHoaDon) {
            message.warning('Không tìm thấy hóa đơn đang chờ.');
            setCartProducts([]);
            return;
          }

          const response = await axios.get(
            `https://datn-sp25-4bee.onrender.com/api/client/findDanhSachSPCTbyIdHoaDon/${idHoaDon}`,
          );
          const productList = response.data;

          const productsWithDetails = await Promise.all(
            productList.map(async (item) => {
              const [images, currentProduct] = await Promise.all([
                fetchProductImage(item.id),
                axios.get(`https://datn-sp25-4bee.onrender.com/api/client/chitietsanpham/${item.id}`),
              ]);

              return {
                ...currentProduct.data,
                images: images.map((img) => img.anhUrl),
                quantity: item.soLuongMua,
                giaTaiThoiDiemThem: item.giaTaiThoiDiemThem,
              };
            }),
          );
          console.log('productsWithDetails', productsWithDetails);
          setCartProducts(productsWithDetails);
        } else {
          // Nếu chưa đăng nhập, lấy giỏ hàng từ localStorage
          const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
          if (cartItems.length === 0) {
            setCartProducts([]);
            return;
          }

          const productRequests = cartItems.map((item) =>
            axios.get(`https://datn-sp25-4bee.onrender.com/api/client/chitietsanpham/${item.id}`),
          );
          const responses = await Promise.all(productRequests);
          const products = responses.map((res) => res.data);

          const productWithImages = await Promise.all(
            products.map(async (product) => {
              const images = await fetchProductImage(product.id);
              const cartItem = cartItems.find((item) => item.id === product.id);
              return {
                ...product,
                images: images.map((img) => img.anhUrl),
                quantity: cartItem ? cartItem.quantity : 1,
                giaTaiThoiDiemThem: product.gia, // ban đầu = giá hiện tại
              };
            }),
          );

          setCartProducts(productWithImages);
        }
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
        //message.error('Không thể tải thông tin giỏ hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, []);
  

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedProducts = await Promise.all(
          cartProducts.map(async (product) => {
            const res = await axios.get(
              `https://datn-sp25-4bee.onrender.com/api/client/chitietsanpham/${product.id}`,
            );
            return {
              ...product,
              gia: res.data.gia, // cập nhật giá hiện tại
            };
          }),
        );

        setCartProducts(updatedProducts);
      } catch (err) {
        console.error('Lỗi khi cập nhật giá hiện tại:', err);
      }
    }, 3000); // mỗi 30 giây

    return () => clearInterval(interval); // dọn dẹp
  }, [cartProducts]);

  const getEmailFromToken = () => {
    const token = localStorage.getItem('token'); // Hoặc lấy từ cookie nếu bạn lưu ở đó
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.email || null; // Tùy theo bạn lưu email ở claim nào
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  };
  useEffect(() => {
    const fetchVoucherCongKhai = async () => {
      try {
        const response = await axios.get('https://datn-sp25-4bee.onrender.com/api/client/phieugiamgia/congkhai');
        console.log('Voucher công khai:', response.data);
        setVoucherList((prev) => [...prev, ...response.data]);
      } catch (error) {
        console.error('Error fetching voucher công khai:', error);
      }
    };

    const fetchVoucherCaNhan = async (email) => {
      try {
        const response = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/client/phieugiamgia/canhan/${email}`,
        );
        console.log('Voucher cá nhân:', response.data);
        setVoucherList((prev) => [...prev, ...response.data]);
      } catch (error) {
        console.error('Error fetching voucher cá nhân:', error);
      }
    };

    const email = getEmailFromToken();
    if (!email) {
      console.log('Không tìm thấy email từ token');
    } else {
      fetchVoucherCaNhan(email);
    }
    fetchVoucherCongKhai();
  }, []);

  const handleQuantityChange = (id, value) => {
    if (isNaN(value) || value < 1) {
      message.warning('Số lượng phải lớn hơn 0!');
      return;
    }

    const updatedCart = cartProducts.map((item) =>
      item.id === id ? { ...item, quantity: value } : item,
    );

    setCartProducts(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));

    // Nếu số lượng = 0, gọi hàm xóa
    if (value === 0) {
      handleRemoveItem(id);
      return;
    }

    // Kiểm tra và gửi API cập nhật database
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token).then((isValid) => {
        if (!isValid) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          localStorage.removeItem('token');
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
          window.location.href = '/login';
        } else {
          const decodedToken = jwtDecode(token);
          const email = decodedToken?.sub;
          const cartItem = updatedCart.find((item) => item.id === id);

          const cartData = {
            sanPhamChiTiet: cartItem,
            email: email,
          };
          axios
            .post('https://datn-sp25-4bee.onrender.com/api/client/order/addHoaDonChiTiet', cartData)
            .then((response) => {
              console.log('cart update',cartData)
              console.log('Cập nhật số lượng trong database:', response.data);
            })
            .catch((error) => {
              console.error('Có lỗi khi cập nhật số lượng:', error);
            });
        }
      });
    }
  };

  const handleRemoveItem = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedCart = cartProducts.filter((item) => item.id !== id);
        setCartProducts(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        message.success('Đã xóa sản phẩm khỏi giỏ hàng!');

        // Gửi API xóa sản phẩm khỏi database
        const token = localStorage.getItem('token');
        if (token) {
          checkTokenValidity(token).then((isValid) => {
            if (!isValid) {
              message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
              localStorage.removeItem('token');
              localStorage.removeItem('cart');
              window.dispatchEvent(new Event('cartUpdated'));
              window.location.href = '/login';
            } else {
              const decodedToken = jwtDecode(token);
              const email = decodedToken?.sub;
              const cartItem = cartProducts.find((item) => item.id === id);

              const cartData = {
                sanPhamChiTiet: { ...cartItem, quantity: 0 }, // Đặt quantity = 0 để backend biết cần xóa
                email: email,
              };

              axios
                .post('https://datn-sp25-4bee.onrender.com/api/client/order/addHoaDonChiTiet', cartData)
                .then((response) => {
                  console.log('Sản phẩm đã bị xóa khỏi database:', response.data);
                })
                .catch((error) => {
                  console.error('Có lỗi khi xóa sản phẩm khỏi database:', error);
                });
            }
          });
        }
      },
    });
  };

  const handleCheckout = async () => {
    try {
      if(idHoaDon != null) {
        await axios.get('https://datn-sp25-4bee.onrender.com/api/client/order/updatePriceAtAddTime/' + idHoaDon);
      }
      console.log('Đang chuyển hướng đến trang checkout...');
      navigate('/checkout', { state: { cartProducts, selectedVoucher } });
    } catch (error) {
      console.error('Lỗi điều hướng:', error);
      message.error('Có lỗi xảy ra khi chuyển trang!');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'ten',
      key: 'ten',
      render: (_, record) => (
        <Space>
          <img
            src={record.images[0]}
            alt={record.sanPham.tenSanPham}
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <div>
            <Text strong>{record.sanPham.tenSanPham}</Text>
            <br />
            <span>{record.maSanPhamChiTiet}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Loại hàng',
      dataIndex: 'mauSac',
      key: 'mauSac',
      render: (_, record) => (
        <div>
          <Text>
            {record.mauSac.tenMau} - {record.kichThuoc.tenKichThuoc}
          </Text>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'gia',
      key: 'gia',
      render: (_, record) => {
        const giaHienTai = record.gia;
        const giaTaiThoiDiemThem = record.giaTaiThoiDiemThem;
        const isChanged = giaHienTai !== giaTaiThoiDiemThem;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong>{giaHienTai.toLocaleString('vi-VN')}₫</Text>
              {isChanged && (
                <Text type="secondary" delete>
                  {giaTaiThoiDiemThem.toLocaleString('vi-VN')}₫
                </Text>
              )}
            </div>
            {isChanged && (
              <Tag color="warning" style={{ marginTop: 4 }}>
                Đã thay đổi: {giaTaiThoiDiemThem.toLocaleString('vi-VN')}₫ →{' '}
                {giaHienTai.toLocaleString('vi-VN')}₫
              </Tag>
            )}
          </div>
        );
      },
    }
,    
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            type="default"
            onClick={() => handleQuantityChange(record.id, Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>

          <InputNumber
            min={1}
            max={record.soLuong}
            value={quantity}
            onChange={(value) => handleQuantityChange(record.id, value)}
            style={{ width: '50px', textAlign: 'center' }}
          />

          <Button
            type="default"
            onClick={() => handleQuantityChange(record.id, Math.min(record.soLuong, quantity + 1))}
            disabled={quantity >= record.soLuong}
          >
            +
          </Button>
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (record) => `${(record.gia * record.quantity).toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Hành động',
      key: 'action',
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

  const subtotal = cartProducts.reduce((sum, item) => sum + item.gia * item.quantity, 0);
  const getDiscountValue = (voucher, subtotal) => {
    if (!voucher) return 0; // Nếu không có voucher, không giảm giá

    if (voucher.loaiPhieuGiamGia === 1) {
      // Giảm theo %
      const discount = (parseFloat(voucher.giaTriGiam) / 100) * subtotal;
      return Math.min(discount, voucher.soTienGiamToiDa); // Không vượt quá mức tối đa
    }

    // Giảm giá cố định (VND)
    return voucher.giaTriGiam || 0;
  };

  const voucherDiscount = subtotal > 0 ? getDiscountValue(selectedVoucher, subtotal) : 0;
  const total = subtotal - voucherDiscount;

  const getBestVoucher = (vouchers, subtotal) => {
    return (
      vouchers
        .filter((voucher) => subtotal >= voucher.giaTriToiThieu) // Chỉ lấy voucher hợp lệ
        .map((voucher) => {
          let discountValue = 0;

          if (voucher.loaiPhieuGiamGia === 1) {
            // Giảm giá theo %
            const percentDiscount = (parseFloat(voucher.giaTriGiam) / 100) * subtotal;
            discountValue = Math.min(percentDiscount, voucher.soTienGiamToiDa);
          } else {
            // Giảm giá số tiền cố định (VND)
            discountValue = Math.min(Number(voucher.giaTriGiam) || 0, voucher.soTienGiamToiDa);
          }

          return { ...voucher, discount: discountValue };
        })
        .sort((a, b) => b.discount - a.discount)[0] || null // Sắp xếp giảm dần theo giá trị giảm giá và lấy cái lớn nhất
    );
  };

  useEffect(() => {
    if (voucherList.length > 0) {
      const bestVoucher = getBestVoucher(voucherList, subtotal);

      // Chỉ set selectedVoucher nếu thay đổi
      if (!selectedVoucher || selectedVoucher.id !== bestVoucher?.id) {
        setSelectedVoucher(bestVoucher);
        console.log('Voucher tốt nhất:', bestVoucher);
      }

      // Tạo danh sách voucher mới
      const sortedVouchers = bestVoucher
        ? [bestVoucher, ...voucherList.filter((v) => v.id !== bestVoucher.id)]
        : [...voucherList];

      const updatedList = sortedVouchers.map((voucher) => ({
        ...voucher,
        isBest: voucher.id === bestVoucher?.id,
      }));

      // Chỉ set nếu danh sách mới khác danh sách cũ
      if (!isEqual(updatedList, voucherList)) {
        setVoucherList(updatedList);
      }
    }
  }, [subtotal]); // CHỈ cần subtotal thôi!

  console.log('voucher được chọn', selectedVoucher);

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher((prev) => (prev?.id === voucher.id ? null : voucher));

    setVoucherList((prevList) => {
      const bestVoucher = getBestVoucher(prevList, subtotal); // Tính lại voucher tốt nhất

      return prevList.map((v) => ({
        ...v,
        isBest: v.id === bestVoucher?.id, // Giữ nguyên isBest cho voucher tốt nhất
      }));
    });
  };

  return (
    <div style={{ margin: '32px auto', width: '90%' }}>
      <Title level={2}>Giỏ hàng của bạn</Title>

      {cartProducts.length > 0 ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Table
              columns={columns}
              dataSource={cartProducts}
              pagination={false}
              rowKey="id"
              className="cart-table"
            />
          </Col>

          <Col xs={24} lg={8}>
            <Card>
              <Title level={3}>Thông tin đơn hàng</Title>
              <div style={{ marginBottom: '16px' }}>
                <Row justify="space-between">
                  <Col>Tạm tính:</Col>
                  <Col>
                    {subtotal.toLocaleString('vi-VN')}
                    <Text>₫</Text>
                  </Col>
                </Row>
                <Row style={{ marginTop: '16px' }} justify="space-between">
                  <Col>Mã giảm giá:</Col>
                  <Col>
                    <Button
                      type="link"
                      style={{ padding: 0, textAlign: 'right', width: '100%' }}
                      onClick={() => setIsModalVoucher(true)}
                    >
                      {selectedVoucher
                        ? `Voucher: ${selectedVoucher.maPhieuGiamGia} >`
                        : 'Chọn voucher >'}
                    </Button>
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginTop: '16px' }}>
                  <Col>Giảm giá:</Col>
                  <Col>
                    {voucherDiscount.toLocaleString('vi-VN')}
                    <Text>₫</Text>
                  </Col>
                </Row>

                <Divider />
                <Row justify="space-between">
                  <Col>
                    <Text strong>Thành tiền:</Text>
                  </Col>
                  <Col>
                    <Text strong style={{ fontSize: '24px', color: 'red' }}>
                      {total.toLocaleString('vi-VN')}
                      <Text>₫</Text>
                    </Text>
                  </Col>
                </Row>
              </div>
              <Button
                type="primary"
                size="large"
                block
                disabled={cartProducts.length === 0}
                onClick={handleCheckout}
              >
                {/* <Link to="/checkout" ></Link> */}
                Tiến hành đặt hàng
              </Button>
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <ShoppingOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <Title level={3}>Giỏ hàng của bạn đang trống</Title>
          <Link to="/products">
            <Button type="primary">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      )}
      <Modal
        title="Danh sách voucher"
        open={isModalVoucher}
        onCancel={() => setIsModalVoucher(false)}
        footer={null}
        style={{ maxHeight: '600px', maxWidth: '480px' }}
      >
        <Row gutter={[0, 8]} justify="center" style={{ overflowY: 'auto', maxHeight: '500px' }}>
          {voucherList.map((voucher) => (
            <Col span={24} key={voucher.id}>
              <Card
                hoverable
                style={{
                  border:
                    selectedVoucher?.id === voucher.id ? '2px solid #1890ff' : '1px solid #ddd',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '8px',
                  boxShadow: selectedVoucher?.id === voucher.id ? '0 0 10px #1890ff' : 'none',
                  position: 'relative',
                  fontSize: '12px',
                  width: '400px',
                  height: '130px',
                  backgroundColor: voucher.giaTriToiThieu > subtotal ? '#f5f5f5' : 'white', // Màu nền xám khi bị disable
                  color: voucher.giaTriToiThieu > subtotal ? '#999' : 'black', // Màu chữ xám khi bị disable
                  opacity: voucher.giaTriToiThieu > subtotal ? 0.6 : 1, // Làm mờ khi bị disable
                  pointerEvents: voucher.giaTriToiThieu > subtotal ? 'none' : 'auto', // Ngăn click khi bị disable
                }}
                onClick={() => handleSelectVoucher(voucher)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={
                      voucher.imageUrl || 'https://dummyimage.com/60x60/ddd/999.png&text=No+Image'
                    }
                    alt="Voucher"
                    style={{ width: '60px', height: '60px', borderRadius: '4px' }}
                  />
                  <div>
                    <Title level={5} style={{ marginBottom: 2 }}>
                      {voucher.maPhieuGiamGia}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 2 }}>
                      {voucher.tenPhieuGiamGia}
                    </Text>
                    <Text strong style={{ color: 'red', display: 'block', marginBottom: 2 }}>
                      Giảm {voucher.giaTriGiam.toLocaleString('vi-VN')}
                      {voucher.loaiPhieuGiamGia === 1 ? '%' : '₫'}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {voucher.soTienGiamToiDa
                        ? `Giảm tối đa: ${voucher.soTienGiamToiDa.toLocaleString(
                            'vi-VN',
                          )}₫ - Cho đơn tối thiểu: ${voucher.giaTriToiThieu.toLocaleString(
                            'vi-VN',
                          )}₫`
                        : `Cho đơn tối thiểu: ${voucher.giaTriToiThieu.toLocaleString('vi-VN')}₫`}
                    </Text>
                  </div>
                </div>
                {voucher.isBest && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      backgroundColor: '#fa8c16',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '10px',
                    }}
                  >
                    Tốt nhất
                  </div>
                )}
                <Radio
                  checked={selectedVoucher?.id === voucher.id}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        {selectedVoucher && (
          <div
            style={{
              textAlign: 'center',
              padding: '10px',
              borderTop: '1px solid #ddd',
              marginTop: '10px',
            }}
          >
            <Text style={{ fontSize: '16px' }}>Giảm giá áp dụng: </Text>
            <Text strong style={{ fontSize: '16px', color: 'red' }}>
              {voucherDiscount.toLocaleString('vi-VN')}₫
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Cart;
