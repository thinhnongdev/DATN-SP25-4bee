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
      const { sanPham, gia, thuongHieu, soLuong, kichThuoc, mauSac, chatLieu } = item;

      if (!grouped[sanPham.tenSanPham]) {
        grouped[sanPham.tenSanPham] = {
          tenSanPham: sanPham.tenSanPham,
          soLuongTong: 0,
          chatLieu: chatLieu.tenChatLieu,
          thuongHieu: thuongHieu.tenThuongHieu,
          moTa: sanPham.moTa,
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

    if (selectedVariant) {
      console.log('Biến thể được chọn:', selectedVariant);
    } else {
      console.log('Không tìm thấy biến thể phù hợp');
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
      <Row gutter={[48, 32]}>
        {/* Hình ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card>
            {productImages.length > 0 && (
              <Carousel autoplay>
                {productImages.map((img, index) => (
                  <div key={index}>
                    <div style={{ height: '500px', overflow: 'hidden' }}>
                      <img
                        src={img}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            )}
          </Card>
        </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <Title level={2}>{sanPhamGopNhom?.tenSanPham || 'Đang tải sản phẩm...'}</Title>

          <div style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ margin: 0, color: 'red' }}>
              {displayPrice}
            </Title>
          </div>

          <Text style={{ fontSize: '16px' }}>{sanPhamGopNhom?.moTa}</Text>

          <Divider />

          {/* Màu sắc */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <strong style={{ marginRight: '6px' }}>Màu sắc:</strong>
            {Array.from(new Set(sanPhamGopNhom.bienThe.map((bt) => bt.mau))).map((mau, index) => {
              const variant = sanPhamGopNhom.bienThe.find((bt) => bt.mau === mau);
              return (
                <Button
                  key={index}
                  onClick={() => handleColorClick(mau)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    border: selectedColor === mau ? '2px solid #1890ff' : '1px solid #ddd',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: variant.maMau,
                    }}
                  ></div>
                  - {mau}
                </Button>
              );
            })}
          </div>

          {/* Kích thước */}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <strong style={{ marginRight: '33px' }}>Size:</strong>
            {[...new Set(sanPhamGopNhom?.bienThe.map((variant) => variant.size))].map(
              (size, index) => (
                <button
                  key={index}
                  onClick={() => handleSizeClick(size)}
                  style={{
                    padding: '8px 16px',
                    border: selectedSize === size ? '2px solid #1890ff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                >
                  {size}
                </button>
              ),
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>Số lượng:</strong>
            <Button
              onClick={decreaseQuantity}
              disabled={!selectedSize || !selectedColor || quantity <= 1}
              style={{
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: !selectedSize || !selectedColor ? 0.5 : 1,
              }}
            >
              -
            </Button>
            <Input
              type="text"
              value={quantity}
              readOnly
              style={{ width: '40px', textAlign: 'center', padding: '4px' }}
            />
            <Button
              onClick={increaseQuantity}
              disabled={!selectedSize || !selectedColor || quantity >= availableQuantity}
              style={{
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: !selectedSize || !selectedColor ? 0.5 : 1,
              }}
            >
              +
            </Button>
            {availableQuantity} <span>Sản phẩm có sẵn</span>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <div>
            <Button
              color="primary"
              variant="outlined"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              style={{
                width: '40%',
                marginBottom: '24px',
                marginTop: '24px',
                marginRight: '10px',
              }}
            >
              Thêm vào giỏ hàng
            </Button>
            {/* <Button
              type="primary"
              size="large"
              onClick={handleAddToCart}
              style={{ width: '50%', marginBottom: '24px', marginTop: '24px' }}
            >
              Mua ngay
            </Button> */}
          </div>

          {/* Hướng dẫn chăm sóc */}
          {/* <Card title="Hướng dẫn chăm sóc">
            <ul style={{ paddingLeft: "20px" }}>
              {product.care.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </Card> */}
        </Col>
      </Row>
      <Row>
        {/* Chi tiết sản phẩm */}
        <div>
          <Row>
            <Col>
              <Text strong>Chất liệu:</Text>
            </Col>
            <Col>
              <Text>{sanPhamGopNhom?.chatLieu}</Text>
            </Col>
          </Row>
        </div>
      </Row>
    </div>
  );
};

export default ProductDetail;
