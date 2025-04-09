import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Card, Badge, Button, Tag, Row, Col, Layout, Spin, message } from 'antd';
import { InfoCircleOutlined, SearchOutlined, WalletOutlined } from '@ant-design/icons';
import Sidebar from './SidebarProfile';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const { Search } = Input;
const getButtonStyle = (status) => {
  switch (status) {
    case 'Dùng Ngay':
      return {
        border: '1px solid #52c41a', // xanh lá
        color: '#52c41a',
      };
    case 'Dùng Sau':
      return {
        border: '1px solid #faad14', // cam
        color: '#faad14',
      };
    default:
      return {
        border: '1px solid #d9d9d9', // xám nhạt
        color: '#000',
      };
  }
};
const VoucherCard = ({ data }) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 130,
      }}
    >
      {/* Bên trái (ribbon) */}
      <div
        style={{
          width: 100,
          backgroundColor: '#17a2b8',
          color: '#fff',
          padding: 12,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 12,
            backgroundColor: 'orange',
            color: '#fff',
            padding: '2px 4px',
            borderRadius: 4,
            marginBottom: 4,
          }}
        ></div>
        <div style={{ fontWeight: 'bold', lineHeight: 1.2, fontSize: 18 }}>Voucher</div>
      </div>

      {/* Bên phải (nội dung chính) */}
      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: 16 }}>{data.title}</div>
        <div style={{ margin: '4px 0' }}>Đơn Tối Thiểu {data.minOrder}</div>
        <div style={{ color: 'red', fontWeight: 'bold' }}>{data.discountText}</div>
        <div style={{ color: 'gray', fontSize: 12, marginTop: 8 }}>
          Có hiệu lực từ: {data.effectiveDate} - {data.expiryDate} &nbsp;|&nbsp;
          <a href="#">
            Điều Kiện <InfoCircleOutlined />
          </a>
        </div>
        {data.isPersonal && <Tag color="blue">Của Tôi</Tag>}
      </div>

      {/* Bên phải ngoài cùng (badge + nút) */}
      <div
        style={{
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%', // hoặc '100%' nếu parent có chiều cao rõ ràng
        }}
      >
        <Link to="/products">
          <Button type="default" style={getButtonStyle(data.status)}>
            {data.status}
          </Button>
        </Link>
      </div>
    </div>
  );
};

const VoucherPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [originalVouchers, setOriginalVouchers] = useState([]); // lưu toàn bộ danh sách ban đầu

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
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
    const fetchVouchers = async () => {
      try {
        const email = getEmailFromToken();
        if (!email) {
          message.warning('Không tìm thấy email từ token');
          return;
        }

        const [congKhaiRes, caNhanRes] = await Promise.all([
          axios.get('http://localhost:8080/api/client/phieugiamgia/congkhai'),
          axios.get(`http://localhost:8080/api/client/phieugiamgia/canhan/${email}`),
        ]);

        const combinedData = [
          ...congKhaiRes.data.map((v) => ({ ...v, isPersonal: false })),
          ...caNhanRes.data.map((v) => ({ ...v, isPersonal: true })),
        ];
        console.log(combinedData);
        const now = new Date();
        const mappedData = combinedData.map((v) => {
          const startDate = new Date(v.ngayBatDau);
          const endDate = new Date(v.ngayKetThuc);

          const discountText =
            v.loaiPhieuGiamGia === 1
              ? `${v.giaTriGiam}% - Tối Đa ${v.soTienGiamToiDa.toLocaleString()}₫`
              : `${v.giaTriGiam.toLocaleString()}₫`;

          return {
            title: v.tenPhieuGiamGia,
            maPhieuGiamGia: v.maPhieuGiamGia,
            minOrder: `${v.giaTriToiThieu.toLocaleString()}₫`,
            discountText,
            effectiveDate: startDate.toLocaleDateString('vi-VN'),
            expiryDate: endDate.toLocaleDateString('vi-VN'),
            quantity: v.soLuong,
            status: now >= startDate && now <= endDate ? 'Dùng Ngay' : 'Dùng Sau',
            isPersonal: v.isPersonal,
          };
        });
        setOriginalVouchers(mappedData); // Lưu toàn bộ danh sách ban đầu
        setVouchers(mappedData);
      } catch (err) {
        console.error(err);
        message.error('Lỗi khi tải voucher');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);
  const onSearch = (value) => {
    setSearchTerm(value);
    const filtered = originalVouchers.filter((v) =>
      v.maPhieuGiamGia.toLowerCase().includes(value.toLowerCase()),
    );
    setVouchers(filtered);
  };
  useEffect(() => {
    if (searchTerm === '') {
      setVouchers(originalVouchers);
    }
  }, [searchTerm]);

  return (
    <Layout
      style={{
        width: '80%',
        background: '#fff',
        justifyContent: 'center',
        margin: '0 auto',
        display: 'flex', // thêm dòng này
      }}
    >
      <Sidebar />
      <div style={{ padding: 24, flex: 1 }}>
        <h2>Kho Voucher</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <Search
            placeholder="Nhập mã voucher tại đây"
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 400 }}
            onSearch={onSearch}
            allowClear
          />
        </div>

        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
        ) : (
          <Row
            gutter={[16, 16]}
            justify="center"
            style={{ marginTop: 16, backgroundColor: '#fff', borderRadius: '8px' }}
          >
            {vouchers.map((v, index) => (
              <Col key={index} xs={24} md={12}>
                <VoucherCard data={v} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default VoucherPage;
