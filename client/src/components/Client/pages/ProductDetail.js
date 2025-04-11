import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Rate,
  Carousel,
  Card,
  Divider,
  message,
  Input,
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { checkTokenValidity } from './checkTokenValidity';
import { jwtDecode } from 'jwt-decode';

import SanPhamChiTiet from '../../QuanLySanPham/SanPhamChiTiet';
const { Title, Text } = Typography;

const ProductDetail = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sanPhamGopNhom, setSanPhamGopNhom] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const { id } = useParams();
  const [displayPrice, setDisplayPrice] = useState('0đ');
  const [quantity, setQuantity] = useState(1);
  // Hàm gộp sản phẩm
  const groupProducts = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const {
        sanPham,
        gia,
        thuongHieu,
        soLuong,
        kichThuoc,
        mauSac,
        chatLieu,
        danhMuc,
        hoaTiet,
        kieuDang,
        tuiAo,
        kieuTayAo,
        kieuCuc,
        kieuCoAo,
      } = item;

      if (!grouped[sanPham.tenSanPham]) {
        grouped[sanPham.tenSanPham] = {
          tenSanPham: sanPham.tenSanPham,
          soLuongTong: 0,
          danhMuc: danhMuc?.tenDanhMuc,
          thuongHieu: thuongHieu?.tenThuongHieu,
          coAo: kieuCoAo?.tenKieuCoAo,
          hoaTiet: hoaTiet?.tenHoaTiet,
          chatLieu: chatLieu?.tenChatLieu,
          kieuDang: kieuDang?.tenKieuDang,
          tuiAo: tuiAo?.tenKieuTuiAo,
          kieuTayAo: kieuTayAo?.tenKieuTayAo,
          kieuCuc: kieuCuc?.tenKieuCuc,
          moTa: sanPham?.moTa,
          bienThe: [],
        };
      }

      grouped[sanPham.tenSanPham].soLuongTong += soLuong;
      grouped[sanPham.tenSanPham].bienThe.push({
        idSPCT: item.id,
        size: kichThuoc.tenKichThuoc,
        mau: mauSac.tenMau,
        maMau: mauSac.maMau,
        gia,
        soLuong,
      });
    });

    return Object.values(grouped)[0] || null;
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

  // Fetch data và nhóm sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/client/sanpham/chitietsanpham/${id}`,
        );
        console.log('ProductDetails fetched:', response.data);
        const groupedProduct = groupProducts(response.data);
        setSanPhamGopNhom(groupedProduct);
        console.log('groupedProduct', groupedProduct);
        // Lấy danh sách ảnh dựa vào từng chi tiết sản phẩm
        const images = await Promise.all(
          response.data.map(async (item) => {
            const imageData = await fetchProductImage(item.id);
            return imageData.map((img) => img.anhUrl);
          }),
        );

        setProductImages(images.flat());
      } catch (error) {
        console.error('Error fetching the product:', error);
        message.error('Không thể tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const increaseQuantity = () => {
    if (quantity < availableQuantity) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const findProductVariant = (variants, selectedSize, selectedColor) => {
    if (!selectedSize || !selectedColor) return null;

    return variants.find(
      (variant) => variant.size === selectedSize && variant.mau === selectedColor,
    );
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      message.warning('Vui lòng chọn màu sắc');
      return;
    }
    if (!selectedSize) {
      message.warning('Vui lòng chọn size');
      return;
    }
    const selectedVariant = findProductVariant(sanPhamGopNhom.bienThe, selectedSize, selectedColor);

    if (selectedVariant&& selectedVariant.soLuong > 0) {
      console.log('Biến thể được chọn:', selectedVariant);
    } else {
      message.warning('Sản phẩm đang tạm thời hết hàng');
      console.log('Không tìm thấy biến thể phù hợp');
      return;
    }
    const cartItem = {
      id: selectedVariant.idSPCT,
      quantity,
    };

    // Lấy giỏ hàng hiện tại từ localStorage hoặc tạo mảng mới
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token).then((isValid) => {
        if (!isValid) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          localStorage.removeItem('token');
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
          window.location.href = '/login'; // Điều hướng đến trang đăng nhập
        } else {
          const decodedToken = jwtDecode(token);
          const email = decodedToken?.sub;
          const cartData = {
            sanPhamChiTiet: cartItem,
            email: email,
          };
          axios
            .post('http://localhost:8080/api/client/order/addHoaDonChiTiet', cartData)
            .then((response) => {
              console.log('Sản phẩm đã được lưu vào giỏ:', response.data);
            })
            .catch((error) => {
              console.error('Có lỗi khi lưu sản phẩm vào giỏ:', error);
            });
        }
      });
    }
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingIndex = existingCart.findIndex((item) => item.id === selectedVariant.idSPCT);

    if (existingIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      existingCart[existingIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới vào giỏ hàng
      existingCart.push(cartItem);
    }

    // Lưu lại giỏ hàng mới vào localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    console.log('Sản phẩm được thêm vào giỏ hàng:', cartItem);
    console.log('Sản phẩm trong giỏ hàng:', existingCart);

    //  Phát sự kiện để cập nhật giỏ hàng ngay lập tức
    window.dispatchEvent(new Event('cartUpdated'));
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  useEffect(() => {
    setQuantity(1);
    if (sanPhamGopNhom) {
      const filteredVariants = sanPhamGopNhom.bienThe.filter(
        (bt) =>
          (selectedSize ? bt.size === selectedSize : true) &&
          (selectedColor ? bt.mau === selectedColor : true),
      );

      const totalQuantity = filteredVariants.reduce((total, variant) => total + variant.soLuong, 0);
      const prices = filteredVariants
        .map((variant) => variant.gia)
        .filter((gia) => gia !== undefined);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      setAvailableQuantity(totalQuantity);
      setDisplayPrice(
        totalQuantity === 0
          ? 'Hết hàng'
          : minPrice === maxPrice
          ? `${minPrice.toLocaleString('vi-VN')}đ`
          : `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`,
      );
    }
  }, [selectedSize, selectedColor, sanPhamGopNhom]);

  const handleSizeClick = (size) => {
    setSelectedSize((prevSize) => (prevSize === size ? null : size));
  };

  const handleColorClick = (color) => {
    setSelectedColor((prevColor) => (prevColor === color ? null : color));
  };

  // Render giao diện
  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!sanPhamGopNhom) return <p>Không tìm thấy sản phẩm!</p>;

  return (
    <div className="container" style={{ margin: '32px auto' }}>
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px' }}>
        <Row gutter={[48, 32]}>
          {/* Hình ảnh sản phẩm */}
          <Col xs={24} md={12}>
            {productImages.length > 0 && (
              <Carousel autoplay>
                {productImages.map((img, index) => (
                  <div key={index}>
                    <div style={{ height: '500px', overflow: 'hidden', borderRadius: '12px' }}>
                      <img
                        src={img}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '12px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            )}
          </Col>

          {/* Thông tin sản phẩm */}
          <Col xs={24} md={12}>
            <Title level={2} style={{ fontWeight: 700 }}>
              {sanPhamGopNhom?.tenSanPham || 'Đang tải sản phẩm...'}
            </Title>

            <Title level={3} style={{ color: '#ff4d4f', marginBottom: '24px' }}>
              {displayPrice}
            </Title>

            <Text style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
              {sanPhamGopNhom?.moTa}
            </Text>

            {/* Màu sắc */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ marginRight: '8px' }}>
                Màu sắc:
              </Text>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {Array.from(new Set(sanPhamGopNhom.bienThe.map((bt) => bt.mau))).map(
                  (mau, index) => {
                    const variant = sanPhamGopNhom.bienThe.find((bt) => bt.mau === mau);
                    return (
                      <Button
                        key={index}
                        onClick={() => handleColorClick(mau)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          border: selectedColor === mau ? '2px solid #1890ff' : '1px solid #ccc',
                          borderRadius: '8px',
                          backgroundColor: '#f9f9f9',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: variant.maMau,
                          }}
                        />
                        {mau}
                      </Button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Size */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ marginRight: '8px' }}>
                Kích thước:
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[...new Set(sanPhamGopNhom?.bienThe.map((variant) => variant.size))].map(
                  (size, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeClick(size)}
                      style={{
                        padding: '6px 16px',
                        border: selectedSize === size ? '2px solid #1890ff' : '1px solid #ccc',
                        borderRadius: '8px',
                        background: '#fff',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {size}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Số lượng */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}
            >
              <Text strong>Số lượng:</Text>
              <Button
                onClick={decreaseQuantity}
                disabled={!selectedSize || !selectedColor || quantity <= 1}
              >
                -
              </Button>
              <Input
                type="text"
                value={quantity}
                readOnly
                style={{ width: '50px', textAlign: 'center' }}
              />
              <Button
                onClick={increaseQuantity}
                disabled={!selectedSize || !selectedColor || quantity >= availableQuantity}
              >
                +
              </Button>
              <span style={{ marginLeft: 10 }}>{availableQuantity} sản phẩm có sẵn</span>
            </div>

            {/* Nút thêm vào giỏ */}
            <div>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={handleAddToCart}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Chi tiết sản phẩm */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Chi tiết sản phẩm" style={{ borderRadius: 12 }}>
            {[
              { label: 'Tên sản phẩm', value: sanPhamGopNhom?.tenSanPham },
              { label: 'Danh mục', value: sanPhamGopNhom?.danhMuc },
              { label: 'Thương hiệu', value: sanPhamGopNhom?.thuongHieu },
              { label: 'Cổ áo', value: sanPhamGopNhom?.coAo },
              { label: 'Họa tiết', value: sanPhamGopNhom?.hoaTiet },
              { label: 'Chất liệu', value: sanPhamGopNhom?.chatLieu },
              { label: 'Kiểu dáng', value: sanPhamGopNhom?.kieuDang },
              { label: 'Túi áo', value: sanPhamGopNhom?.tuiAo },
              { label: 'Kiểu tay áo', value: sanPhamGopNhom?.kieuTayAo },
              { label: 'Kiểu cúc', value: sanPhamGopNhom?.kieuCuc },
              { label: 'Mô tả', value: sanPhamGopNhom?.moTa },
              { label: 'Tổng số lượng', value: sanPhamGopNhom?.soLuongTong },
              { label: 'Gửi từ', value: 'Hà Nội' },
            ].map((item, idx) => (
              <Row key={idx} style={{ marginBottom: 12 }}>
                <Col span={6}>
                  <Text strong>{item.label}</Text>
                </Col>
                <Col span={18}>
                  <Text>{item.value || '—'}</Text>
                </Col>
              </Row>
            ))}
            <div
              style={{
                marginTop: '48px',
                backgroundColor: '#fff',
                borderRadius: '12px',
              }}
            >
              <Title level={4} style={{ borderBottom: '2px solid #eee', paddingBottom: '12px', paddingTop: '12px' ,backgroundColor: '#f9f9f9'}}>
                MÔ TẢ SẢN PHẨM
              </Title>

              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                }}
              >
                <p>
                   {sanPhamGopNhom?.moTa || '—'}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
