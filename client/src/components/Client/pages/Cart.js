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
} from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const Cart = () => {
  const [isModalVoucher, setIsModalVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Lấy giỏ hàng từ localStorage

        if (cartItems.length === 0) {
          setCartProducts([]);
          setLoading(false);
          return;
        }

        // Gọi API lấy thông tin từng sản phẩm theo ID
        const productRequests = cartItems.map((item) =>
          axios.get(`http://localhost:8080/api/client/chitietsanpham/${item.id}`),
        );
        const responses = await Promise.all(productRequests);
        let products = responses.map((res) => res.data);

        // Gọi API lấy ảnh cho từng sản phẩm và gộp vào dữ liệu
        const productWithImages = await Promise.all(
          products.map(async (product) => {
            const images = await fetchProductImage(product.id);
            const cartItem = cartItems.find((item) => item.id === product.id);
            return {
              ...product,
              images: images.map((img) => img.anhUrl),
              quantity: cartItem ? cartItem.quantity : 1, // Thêm số lượng từ localStorage
            };
          }),
        );

        console.log('Sản phẩm có ảnh và số lượng:', productWithImages);
        setCartProducts(productWithImages); // Lưu vào state để hiển thị giỏ hàng
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        message.error('Không thể tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  useEffect(() => {
    const fetchVoucherCongKhai = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/client/phieugiamgia/congkhai');
        setVoucherList(response.data);
        console.log('Voucher:', response.data);
      } catch (error) {
        console.error('Error fetching voucher:', error);
      }
    };
    fetchVoucherCongKhai();
  }, []);

  const handleQuantityChange = (id, value) => {
    const updatedCart = cartProducts.map((item) =>
      item.id === id ? { ...item, quantity: value } : item,
    );
    setCartProducts(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartProducts.filter((item) => item.id !== id);
    setCartProducts(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng!');
  };
  const handleCheckout = async () => {
    try {
      console.log('Đang chuyển hướng đến trang checkout...');
      navigate("/checkout",{state:{cartProducts,selectedVoucher}});
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
            {record.mauSac.tenMau}-{record.kichThuoc.tenKichThuoc}
          </Text>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'gia',
      key: 'gia',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
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
      render: (record) => `${(record.gia * record.quantity).toLocaleString('vi-VN')}đ`,
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
  const voucher = subtotal > 0 && selectedVoucher ? selectedVoucher.giaTriGiam : 0; //
  const total = subtotal - voucher;
  const getBestVoucher = (vouchers, subtotal) => {
    return vouchers
      .filter(voucher => subtotal >= voucher.giaTriToiThieu)
      .reduce((bestVoucher, currentVoucher) => {
        const getDiscountValue = (voucher) => {
          if (typeof voucher.giaTriGiam === 'string' && voucher.giaTriGiam.includes('%')) {
            return Math.min((parseFloat(voucher.giaTriGiam) / 100) * subtotal, voucher.soTienGiamToiDa);
          }
          return Math.min(Number(voucher.giaTriGiam) || 0, voucher.soTienGiamToiDa);
        };
  
        const currentDiscount = getDiscountValue(currentVoucher);
        const bestDiscount = bestVoucher ? getDiscountValue(bestVoucher) : 0;
  
        return currentDiscount > bestDiscount ? currentVoucher : bestVoucher;
      }, null);
  };
  
  useEffect(() => {
    if (voucherList.length > 0) {
      const bestVoucher = getBestVoucher(voucherList, subtotal) || voucherList[0];
  
      if (!selectedVoucher) setSelectedVoucher(bestVoucher);
  
      const sortedVouchers = [
        bestVoucher,
        ...voucherList.filter((voucher) => voucher.id !== bestVoucher?.id),
      ];
  
      setVoucherList(
        sortedVouchers.map((voucher) => ({
          ...voucher,
          isBest: voucher.id === bestVoucher?.id,
        }))
      );
    }
  }, [subtotal]); // Loại bỏ voucherList khỏi dependency
  
  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(selectedVoucher?.id === voucher.id ? null : voucher);
  
    const sortedVouchers = [
      voucher,
      ...voucherList.filter(v => v.id !== voucher.id),
    ];
  
    setVoucherList(sortedVouchers);
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
                    <Text>đ</Text>
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
                  {voucher.toLocaleString('vi-VN')}<Text>đ</Text>
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
                      <Text>đ</Text>
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
      {/* Modal chọn voucher */}
      {/* <Modal
        title="Danh sách voucher"
        open={isModalVoucher}
        onCancel={() => setIsModalVoucher(false)}
        footer={null}
        style={{ maxHeight: '600px' ,maxWidth: '480px'}}
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
                  padding: '8px',
                  boxShadow: selectedVoucher?.id === voucher.id ? '0 0 10px #1890ff' : 'none',
                  position: 'relative',
                  fontSize: '12px',
                  width: '400px',
                  height: '130px',
                }}
                onClick={() => setSelectedVoucher(selectedVoucher?.id === voucher.id ? null : voucher)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src=''
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
                    <Text strong style={{ color: '#fa8c16', display: 'block', marginBottom: 2 }}>
                      Giảm {voucher.giaTriGiam.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      Tối đa: {voucher.soTienGiamToiDa.toLocaleString('vi-VN')}đ - Tối thiểu:{' '}
                      {voucher.giaTriToiThieu.toLocaleString('vi-VN')}đ
                    </Text>
                  </div>
                </div>
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
      </Modal> */}

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
            border: selectedVoucher?.id === voucher.id ? '2px solid #1890ff' : '1px solid #ddd',
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
          }}
          onClick={() => handleSelectVoucher(voucher)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={voucher.imageUrl || 'https://dummyimage.com/60x60/ddd/999.png&text=No+Image'}
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
              <Text strong style={{ color: '#fa8c16', display: 'block', marginBottom: 2 }}>
                Giảm {voucher.giaTriGiam.toLocaleString('vi-VN')}đ
              </Text>
              <Text type="secondary" style={{ display: 'block' }}>
                Tối đa: {voucher.soTienGiamToiDa.toLocaleString('vi-VN')}đ - Tối thiểu: {voucher.giaTriToiThieu.toLocaleString('vi-VN')}đ
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
</Modal>

    </div>
  );
};

export default Cart;
