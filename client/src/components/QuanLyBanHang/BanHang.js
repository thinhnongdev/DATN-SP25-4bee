import React, { useEffect, useState } from 'react';
import './BanHangCss.css';
import {
  Layout,
  Button,
  Row,
  Col,
  Tabs,
  Typography,
  Input,
  Table,
  Space,
  Avatar,
  Radio,
  InputNumber,
  Modal,
  Select,
  Spin,
  message,
} from 'antd';
import { PlusOutlined, CloseOutlined, SelectOutlined, SearchOutlined } from '@ant-design/icons';
import { IoIosAddCircle, IoIosAddCircleOutline } from 'react-icons/io';
import { BiQrScan } from 'react-icons/bi';
import { AiOutlineSelect } from 'react-icons/ai';
import { Option } from 'antd/es/mentions';
import axios from 'axios';
const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const BanHang = () => {
  const [isModalVisibleListSPCT, setIsModalVisibleListSPCT] = useState(false); // Trạng thái hiển thị Modal danh sách sản phẩm
  const [isModalVisibleListKhachHang, setIsModalVisibleListKhachHang] = useState(false); // Trạng thái hiển thị Modal danh sách sản phẩm
  const [isModalVisibleSoLuongNhap, setIsModalVisibleSoLuongNhap] = useState(false); // Trạng thái hiển thị Modal danh sách sản phẩm
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
  const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
  const [activeTab, setActiveTab] = useState(null);
  const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
  const [productName, setProductName] = useState(''); // Tên sản phẩm mới
  const [chatLieu, setChatLieu] = useState([]);
  const [kieuDang, setKieuDang] = useState([]);
  const [thuongHieu, setThuongHieu] = useState([]);
  const [kieuCuc, setKieuCuc] = useState([]);
  const [kieuCoAo, setKieuCoAo] = useState([]);
  const [kieuCoTayAo, setKieuCoTayAo] = useState([]);
  const [kieuTayAo, setKieuTayAo] = useState([]);
  const [kieuTuiAo, setKieuTuiAo] = useState([]);
  const [danhMuc, setDanhMuc] = useState([]);
  const [hoaTiet, setHoaTiet] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedChatLieu, setSelectedChatLieu] = useState('');
  const [selectedKieuDang, setSelectedKieuDang] = useState('');
  const [selectedThuongHieu, setSelectedThuongHieu] = useState('');
  const [selectedKieuCuc, setSelectedKieuCuc] = useState('');
  const [selectedKieuCoAo, setSelectedKieuCoAo] = useState('');
  const [selectedKieuCoTayAo, setSelectedKieuCoTayAo] = useState('');
  const [selectedKieuTayAo, setSelectedKieuTayAo] = useState('');
  const [selectedKieuTuiAo, setSelectedKieuTuiAo] = useState('');
  const [selectedDanhMuc, setSelectedDanhMuc] = useState('');
  const [selectedHoaTiet, setSelectedHoaTiet] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [activeKey, setActiveKey] = useState(null); // Giữ tab đang mở
  const [customers, setCustomers] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/sanpham/chitietsanpham');
      let products = response.data;
  
      // Lấy ảnh cho từng sản phẩm
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          try {
            const imgResponse = await axios.get(`http://localhost:8080/api/admin/sanphamchitiet/${product.id}/hinhanh`);
            const imageUrls = imgResponse.data.map((item) => item.anhUrl);
            return { ...product, image: imageUrls.length > 0 ? imageUrls[0] : null };
          } catch (error) {
            console.error(`Lỗi khi lấy ảnh cho sản phẩm ${product.id}:`, error);
            return { ...product, image: null };
          }
        })
      );
  
      setSanPhamChiTiet(productsWithImages);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
   fetchHoaDonChiTiet(activeKey);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/chatlieu');
        setChatLieu(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chất liệu:', error);
      } finally {
      }
    };
    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu dáng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieudang');
        setKieuDang(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu dáng:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách thương hiệu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/thuonghieu');
        setThuongHieu(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thương hiệu:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cúc
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucuc');
        setKieuCuc(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cúc:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucoao');
        setKieuCoAo(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cổ áo:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucotayao');
        setKieuCoTayAo(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cổ tay áo:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu túi áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieutuiao');
        setKieuTuiAo(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu túi áo:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieutayao');
        setKieuTayAo(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu tay áo:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách màu sắc
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/mausac');
        setColors(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách màu sắc:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kichthuoc');
        setSizes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kích thước:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/hoatiet');
        setHoaTiet(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách họa tiết:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/danhmuc');
        setDanhMuc(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  const filteredData = sanPhamChiTiet.filter((item) => {
    const searchLower = searchText.toLowerCase();

    // Tìm kiếm theo mã sản phẩm hoặc tên sản phẩm
    const matchesSearch =
      item.maSanPhamChiTiet.toLowerCase().includes(searchLower) ||
      item.sanPham.tenSanPham.toLowerCase().includes(searchLower);

    // Lọc theo các bộ lọc khác (nếu người dùng chọn)
    const matchesChatLieu = selectedChatLieu
      ? item.chatLieu.tenChatLieu === selectedChatLieu
      : true;
    const matchesKieuDang = selectedKieuDang
      ? item.kieuDang.tenKieuDang === selectedKieuDang
      : true;
    const matchesThuongHieu = selectedThuongHieu
      ? item.thuongHieu.tenThuongHieu === selectedThuongHieu
      : true;
    const matchesKieuCuc = selectedKieuCuc ? item.kieuCuc.tenKieuCuc === selectedKieuCuc : true;
    const matchesKieuCoAo = selectedKieuCoAo
      ? item.kieuCoAo.tenKieuCoAo === selectedKieuCoAo
      : true;
    const matchesKieuCoTayAo = selectedKieuCoTayAo
      ? item.kieuCoTayAo.tenKieuCoTayAo === selectedKieuCoTayAo
      : true;
    const matchesKieuTayAo = selectedKieuTayAo
      ? item.kieuTayAo.tenKieuTayAo === selectedKieuTayAo
      : true;
    const matchesKieuTuiAo = selectedKieuTuiAo
      ? item.kieuTuiAo.tenKieuTuiAo === selectedKieuTuiAo
      : true;
    const matchesHoaTiet = selectedHoaTiet ? item.hoaTiet.tenHoaTiet === selectedHoaTiet : true;
    const matchesDanhMuc = selectedDanhMuc ? item.danhMuc.tenDanhMuc === selectedDanhMuc : true;
    const matchesColor = selectedColor ? item.mauSac.tenMau === selectedColor : true;
    const matchesSize = selectedSize ? item.kichThuoc.tenKichThuoc === selectedSize : true;

    return (
      matchesSearch &&
      matchesChatLieu &&
      matchesKieuDang &&
      matchesThuongHieu &&
      matchesKieuCuc &&
      matchesKieuCoAo &&
      matchesKieuCoTayAo &&
      matchesKieuTayAo &&
      matchesKieuTuiAo &&
      matchesColor &&
      matchesHoaTiet &&
      matchesDanhMuc &&
      matchesSize
    );
  });
  const handleSelectProduct = (id) => {
    console.log("Sản phẩm được chọn có ID:", id);
 
      setSelectedProductId(id);  // Lưu ID sản phẩm
      setQuantity(1);  // Reset số lượng khi mở modal
      setIsModalVisibleSoLuongNhap(true);  // Hiển thị modal
    
  };

  const handleConfirm = async () => {
    if (!selectedProductId || quantity < 1) {
      message.error("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
  
    // Dữ liệu gửi về server
    const payload = {
      hoaDonId: activeKey,
      sanPhamChiTietId: selectedProductId,
      soLuong: quantity,
    };
  console.log(payload)
    try {
      const response = await fetch("http://localhost:8080/api/admin/addHoaDonChiTiet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        message.success("Đã gửi thành công!");
        setIsModalVisibleSoLuongNhap(false);

      // 🔄 Cập nhật dữ liệu trực tiếp trong state, không gọi lại API
      setSanPhamChiTiet((prevData) =>
        prevData.map((item) =>
          item.id === selectedProductId
            ? { ...item, soLuong: item.soLuong - quantity } // Giảm số lượng sản phẩm
            : item
        )
      );
      } else {
        message.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      message.error("Không thể gửi dữ liệu!");
    }
  };
  
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => {
        // Tính toán lại index khi chuyển trang
        return pagination.pageSize * (pagination.current - 1) + index + 1;
      },
    },
     {
    title: 'Ảnh sản phẩm',
    dataIndex: 'image',
    key: 'image',
    render: (image) =>
      image ? (
        <img
          src={image}
          alt="Ảnh sản phẩm"
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
        />
      ) : (
        <span>Không có ảnh</span>
      ),
  },
    {
      title: 'Mã',
      dataIndex: 'maSanPhamChiTiet',
      key: 'maSanPhamChiTiet',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'sanPham',
      key: 'sanPham',
      render: (text) => text?.tenSanPham || 'Không có dữ liệu',
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'thuongHieu',
      key: 'thuongHieu',
      render: (text) => text?.tenThuongHieu || 'Không có dữ liệu',
    },

    {
      title: 'Chất liệu',
      dataIndex: 'chatLieu',
      key: 'chatLieu',
      render: (text) => text?.tenChatLieu || 'Không có dữ liệu',
    },
    {
      title: 'Màu sắc',
      dataIndex: 'mauSac',
      key: 'mauSac',
      render: (text) => text?.tenMau || 'Không có dữ liệu',
    },
    {
      title: 'Kích thước',
      dataIndex: 'kichThuoc',
      key: 'kichThuoc',
      render: (text) => text?.tenKichThuoc || 'Không có dữ liệu',
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
    },
    {
      title: 'Giá',
      dataIndex: 'gia',
      key: 'gia',
      render: (value) => {
        return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`;
      },
    },
    {
      title: 'Chức năng',
      render: (text, record) => (
        <Button type="submit" onClick={() => handleSelectProduct(record.id)}>Chọn</Button>
      ),
    },
    
  ];
  const columnKhachHang = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => {
        // Tính toán lại index khi chuyển trang
        return pagination.pageSize * (pagination.current - 1) + index + 1;
      },
    },
    {
      title: 'Tên khách',
      dataIndex: 'tenKhachHang',
      key: 'tenKhachHang',
      render: (text) => text || 'Không có dữ liệu',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
      render: (text) => text || 'Không có dữ liệu',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || 'Không có dữ liệu',
    },
    {
      title: 'Chức năng',
      render: (text, record) => <Button type="submit" >Chọn</Button>,
    },
  ];
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  // Hàm đóng modal
  const handleCancelListSanPhamChiTiet = () => {
    setIsModalVisibleListSPCT(false);
  };
  const handleCancelListKhachHang = () => {
    setIsModalVisibleListKhachHang(false);
  };
  const handleCancelSoLuongNhap = () => {
    setIsModalVisibleSoLuongNhap(false);
  };
  // Khi tải trang, lấy danh sách hóa đơn chờ
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        // Gọi API để lấy danh sách hóa đơn chờ từ database
        const response = await fetch('http://localhost:8080/api/admin/hoadoncho');
 
        if (!response.ok) throw new Error('Không thể lấy danh sách hóa đơn!');

        const orders = await response.json(); // Danh sách hóa đơn chờ từ database
        console.log('Danh sách hóa đơn chờ từ database:', orders);

        if (orders.length > 0) {
          fetchHoaDonChiTiet(orders[0].id.toString());
          setTabs(
            orders.map((order, index) => ({
              key: order.id.toString(),
              title: `Đơn hàng ${index + 1}`,
              content: renderOrderContent(order),
            })),
          );
          
          console.log(orders[0].id.toString())
          setActiveKey(orders[0].id.toString()); // Mở tab đầu tiên
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    
    fetchPendingOrders(); // Gọi API khi component mount
  }, []);

  //lấy danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/khach_hang");
        const data = await response.json();
        console.log("danh sách khách hàng:",data)
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    
    fetchCustomers();
  }, []);

  //lấy danh sách sản phẩm chờ thanh toán
  const fetchHoaDonChiTiet = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/hoadonchitiet/${id}`);
  console.log("dữ liệu hóa đơn chi tiết",response.data)
      // Kiểm tra nếu API trả về 404 hoặc không có dữ liệu
      if (response.status === 404 || !response.data || response.data.length === 0) {
        message.warning("Không có sản phẩm nào!");
        setHoaDonChiTiet([]); // Đặt dữ liệu thành mảng rỗng để tránh lỗi
        return;
      }
  
      setHoaDonChiTiet(response.data); // Cập nhật danh sách hóa đơn chi tiết
    } catch (error) {
      
      console.error("Lỗi khi lấy danh sách hóa đơn chi tiết:", error);
      // Xử lý lỗi dựa vào status code
      if (error.response) {
        if (error.response.status === 404) {
          message.warning("Hóa đơn không tồn tại!");
        } else {
          message.error("Lỗi server! Không thể lấy hóa đơn chi tiết.");
        }
      } else {
        message.error("Lỗi kết nối đến server!");
      }
  
      setHoaDonChiTiet([]); // Đảm bảo không bị lỗi khi hiển thị UI
    }
  };
  // Gọi API khi `activeInvoiceId` thay đổi
  useEffect(() => {
    if (activeKey) {
      console.log("Fetching invoice details for ID:", activeKey);
      fetchHoaDonChiTiet(activeKey);
    }
  }, [activeKey]);
  // Hàm tạo hóa đơn mới
  const addTab = async () => {
    const newSTT = `${tabs.length + 1}`;
    let newKey = ``;
    try {
      const newOrder = { emailNhanVien: 'tienthinhkk@gmail.com' };

      const response = await fetch('http://localhost:8080/api/admin/createhoadon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error('Lưu hóa đơn thất bại!');
      }

      const savedOrder = await response.json();
      console.log('Dữ liệu trả về:', savedOrder);

      newKey = savedOrder.id.toString();

      setTabs((prevTabs) => [
        ...prevTabs,
        {
          key: newKey,
          title: `Đơn hàng ${newSTT}`,
          content: renderOrderContent(savedOrder),
        },
      ]);

      setActiveKey(newKey); // Chuyển sang tab mới
    } catch (error) {
      console.error(error.message);
    }
  };
  // 🟢 3️⃣ Hàm render nội dung hóa đơn
  const renderOrderContent = (order) => (
    <Row gutter={16}>
      {/* Bên trái: Chiếm 17 phần */}
      <Col span={17} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button>
              <BiQrScan />
              Quét mã QR
            </Button>
            <Button
              type="primary"
              onClick={() => setIsModalVisibleListSPCT(true)}
              style={{ marginLeft: 8 }}
            >
              <IoIosAddCircle />
              Thêm sản phẩm
            </Button>
          </div>

          <div
            style={{
              borderTop: '1px solid #ccc',
              marginTop: '16px',
            }}
          >
            <Table
              columns={[
                {
                  title: 'STT',
                  dataIndex: 'index',
                  key: 'index',
                  render: (text, record, index) => {
                    // Tính toán lại index khi chuyển trang
                    return pagination.pageSize * (pagination.current - 1) + index + 1;
                  },
                },
                {
                  title: "Sản phẩm",
                  dataIndex: "sanPhamChiTiet",
                  key: "sanPhamChiTiet.sanPham",
                  render: (sanPhamChiTiet) => sanPhamChiTiet?.sanPham?.tenSanPham || "N/A",
                },
                {
                  title: "Số lượng",
                  dataIndex: "soLuong",
                  key: "soLuong",
                  render: (soLuong) =>soLuong|| "N/A",
                },
                {
                  title: "Giá hiện tại",
                  dataIndex: "sanPhamChiTiet",
                  key: "sanPhamChiTiet.gia",
                  render: (sanPhamChiTiet) => sanPhamChiTiet?.gia || "N/A",
                },
                {
                  title: "Giá được tính",
                  dataIndex: "sanPhamChiTiet",
                  key: "sanPhamChiTiet.gia",
                  render: (sanPhamChiTiet) => sanPhamChiTiet?.gia || "N/A",
                },
                {
                  title: "Thành tiền",
                  dataIndex: "sanPhamChiTiet",
                  key: "sanPhamChiTiet.gia",
                  render: (sanPhamChiTiet,soLuong) => sanPhamChiTiet?.gia*soLuong || "N/A",
                }
                // { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                // { title: 'Giá hiện tại', dataIndex: 'price', key: 'price' },
                // { title: 'Giá được tính', dataIndex: 'price', key: 'price' },
                // { title: 'Thành tiền', dataIndex: 'total', key: 'total' },
              ]}
              dataSource={hoaDonChiTiet}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </div>
        </Space>
      </Col>

      {/* Bên phải: Chiếm 7 phần và có khoảng cách từ bên trái */}
      <Col span={7}>
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Thông tin khách hàng</Text>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
              <Row>
                <Col span={10}>
                  <Text>Khách hàng</Text>
                </Col>
                <Col span={14}>
                  <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div>
                      <Button
                        onClick={() => setIsModalVisibleListKhachHang(true)}
                        size="small" // Giảm kích thước nút
                        style={{
                          zIndex: 1, // Đảm bảo nút ở trên cùng
                        }}
                      >
                        <AiOutlineSelect />
                        Chọn
                      </Button>
                      <Button
                        type="primary"
                        size="small" // Giảm kích thước nút
                        style={{
                          zIndex: 1, // Đảm bảo nút ở trên cùng
                          marginLeft: 8, // Khoảng cách giữa 2 nút
                        }}
                      >
                        <IoIosAddCircle />
                        Thêm mới
                      </Button>
                    </div>
                  </Row>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Ảnh đại diện khách hàng */}
                  <Avatar
                    src="https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png"
                    size={40} // Kích thước ảnh nhỏ
                    style={{ marginRight: 8 }} // Khoảng cách giữa ảnh và tên
                  />
                  {/* Tên khách hàng */}
                  <Text>{order.khachHang.tenKhachHang}</Text>
                </Col>
              </Row>
              {/* Dòng kẻ ngăn cách */}
              <div style={{ margin: '16px 0', borderBottom: '1px solid #ccc' }}></div>

              {/* Dòng 2: Hình thức nhận hàng */}
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Hình thức nhận hàng</Text>
                </Col>
                <Col span={14}>
                  <Radio.Group value={order.loaiHoaDon}>
                    <Radio value={2} name='loaiHoaDon'>Tại quầy</Radio>
                    <Radio value={1} name='loaiHoaDon'>Giao hàng</Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </div>
            <Text strong>Thông tin thanh toán</Text>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Hình thức thanh toán</Text>
                </Col>
                <Col span={14}>
                  <Radio.Group value={'tienMat'}>
                    <Radio value="chuyenKhoan">Chuyển khoản</Radio>
                    <Radio value="tienMat">Tiền mặt</Radio>
                  </Radio.Group>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Tổng tiền</Text>
                </Col>
                <Col span={14} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Text style={{ color: 'red', paddingRight: '10px' }}>{order.tongTien} đ</Text>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Phí vận chuyển</Text>
                </Col>
                <Col span={14} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <InputNumber
                   value={0}
                    min={0}
                    max={999999999999999}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ'}
                    parser={(value) => value.replace(/\D/g, '')} // Loại bỏ tất cả ký tự không phải số
                    className="custom-input-number"
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Giảm giá</Text>
                </Col>
                <Col span={14} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <InputNumber
                    value={0}
                    min={0}
                    max={999999999999999}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ'}
                    parser={(value) => value.replace(/\D/g, '')} // Loại bỏ tất cả ký tự không phải số
                    className="custom-input-number"
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Tổng thanh toán</Text>
                </Col>
                <Col span={14} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Text style={{ color: 'red', paddingRight: '10px' }}>{order.tongTien} đ</Text>
                </Col>
              </Row>
            </div>
            <div>
              <Button type="primary" style={{ width: '100%' }}>
                Xác nhận đơn hàng
              </Button>
            </div>
          </Space>
        </div>
      </Col>
    </Row>
  );

  // Hàm đóng tab khi nhấn vào nút "X"
  const removeTab = (targetKey) => {
    let newTabs = tabs.filter((tab) => tab.key !== targetKey);
    setTabs(newTabs);

    // Nếu tab bị xóa là tab đang hoạt động, quay về tab trước đó
    if (newTabs.length && activeTab === targetKey) {
      setActiveTab(newTabs[Math.max(0, newTabs.length - 1)].key);
    }
  };

  return (
    <Layout style={{ height: '100vh', boxShadow: '0 4px 8px rgba(24, 24, 24, 0.1)' }}>
      <Sider
        width="100%"
        style={{
          background: '#fff',
          padding: 20,
          position: 'relative',
          height: '100%', // Đảm bảo Sider chiếm toàn bộ chiều cao
        }}
      >
        {/* Dòng chứa Nút "Tạo hóa đơn" */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={20}>
            <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Quản lý bán hàng</Text>
          </Col>
          <Col span={4}>
            <Button
              onClick={addTab}
              type="primary"
              style={{
                zIndex: 1, // Đảm bảo nút ở trên cùng
              }}
            >
              <IoIosAddCircle />
              Tạo đơn hàng mới
            </Button>
          </Col>
        </Row>

        {/* Khi không có hóa đơn nào, hiển thị thông báo */}
        {tabs.length === 0 ? (
          <Row justify="center" align="middle" style={{ height: '100%' }}>
            <Col>
              <Title level={3}>Chưa có hóa đơn nào</Title>
            </Col>
          </Row>
        ) : (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            tabPosition="top"
            style={{ height: '100%' }} // Đảm bảo Tabs chiếm toàn bộ chiều cao của Sider
            type="line" // Sử dụng kiểu tab mặc định để không hiển thị dấu "+"
          >
            {tabs.map((tab) => (
              <TabPane
                tab={
                  <>
                    {tab.title}{' '}
                    <span
                      style={{
                        cursor: 'pointer',
                        marginLeft: 8,
                        fontSize: '16px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn sự kiện tiếp tục lây lan
                        removeTab(tab.key); // Gọi hàm xóa tab
                      }}
                    >
                      <CloseOutlined style={{ fontSize: '16px', color: 'red' }} />
                    </span>
                  </>
                }
                key={tab.key}
              >
                {tab.content}
              </TabPane>
            ))}
          </Tabs>
        )}
      </Sider>
      <Content
        style={{
          padding: 24,
          height: '100%', // Đảm bảo Content chiếm toàn bộ chiều cao
          overflow: 'hidden', // Để nội dung không bị cuộn
        }}
      />

      {/* Modal thêm sản phẩm */}
      <Modal
        width={'1200px'}
        title="Danh sách sản phẩm chi tiết"
        visible={isModalVisibleListSPCT}
        onCancel={handleCancelListSanPhamChiTiet}
        footer={[
          <Button key="add" type="primary" onClick={handleCancelListSanPhamChiTiet}>
            Đóng
          </Button>,
        ]}
      >
        <div
          style={{
            boxShadow: '0 4px 8px rgba(24, 24, 24, 0.1)',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            height: '240px',
            marginBottom: '20px',
          }}
        >
          {/* Ô tìm kiếm */}
          <Row gutter={16} style={{ marginBottom: '26px' }}>
            <Col span={10}>
              <Input
                placeholder="Tìm kiếm mã sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
          </Row>

          {/* Hàng 1 - Các bộ lọc */}
          <Row gutter={16} style={{ marginBottom: '16px', justifyContent: 'center' }}>
            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Chất liệu:</Text>
              <Select
                placeholder="Chọn chất liệu"
                style={{ width: '50%' }}
                value={selectedChatLieu}
                onChange={(value) => {
                  setSelectedChatLieu(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {chatLieu.map((item) => (
                  <Option key={item.id} value={item.tenChatLieu}>
                    {item.tenChatLieu}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Kiểu dáng:</Text>
              <Select
                placeholder="Chọn kiểu dáng"
                style={{ width: '50%' }}
                value={selectedKieuDang}
                onChange={(value) => {
                  setSelectedKieuDang(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuDang.map((item) => (
                  <Option key={item.id} value={item.tenKieuDang}>
                    {item.tenKieuDang}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Thương hiệu:</Text>
              <Select
                placeholder="Chọn thương hiệu"
                style={{ width: '50%' }}
                value={selectedThuongHieu}
                onChange={(value) => {
                  setSelectedThuongHieu(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {thuongHieu.map((item) => (
                  <Option key={item.id} value={item.tenThuongHieu}>
                    {item.tenThuongHieu}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Kiểu cúc:</Text>
              <Select
                placeholder="Chọn kiểu cúc"
                style={{ width: '50%' }}
                value={selectedKieuCuc}
                onChange={(value) => {
                  setSelectedKieuCuc(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuCuc.map((item) => (
                  <Option key={item.id} value={item.tenKieuCuc}>
                    {item.tenKieuCuc}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {/* Hàng 2 - Các bộ lọc khác */}
          <Row gutter={16} style={{ marginBottom: '16px', justifyContent: 'center' }}>
            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Cổ áo:</Text>
              <Select
                placeholder="Chọn kiểu cổ áo"
                style={{ width: '50%' }}
                value={selectedKieuCoAo}
                onChange={(value) => {
                  setSelectedKieuCoAo(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuCoAo.map((item) => (
                  <Option key={item.id} value={item.tenKieuCoAo}>
                    {item.tenKieuCoAo}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Cổ tay áo:</Text>
              <Select
                placeholder="Chọn kiểu cổ tay áo"
                style={{ width: '50%' }}
                value={selectedKieuCoTayAo}
                onChange={(value) => {
                  setSelectedKieuCoTayAo(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuCoTayAo.map((item) => (
                  <Option key={item.id} value={item.tenKieuCoTayAo}>
                    {item.tenKieuCoTayAo}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Tay áo:</Text>
              <Select
                placeholder="Chọn kiểu tay áo"
                style={{ width: '50%' }}
                value={selectedKieuTayAo}
                onChange={(value) => {
                  setSelectedKieuTayAo(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuTayAo.map((item) => (
                  <Option key={item.id} value={item.tenKieuTayAo}>
                    {item.tenKieuTayAo}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Túi áo:</Text>
              <Select
                placeholder="Chọn kiểu túi áo"
                style={{ width: '50%' }}
                value={selectedKieuTuiAo}
                onChange={(value) => {
                  setSelectedKieuTuiAo(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {kieuTuiAo.map((item) => (
                  <Option key={item.id} value={item.tenKieuTuiAo}>
                    {item.tenKieuTuiAo}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {/* Hàng 3 - Màu sắc và kích thước */}
          <Row gutter={16} style={{ marginBottom: '30px', justifyContent: 'center' }}>
            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Màu sắc:</Text>
              <Select
                placeholder="Chọn màu sắc"
                style={{ width: '50%' }}
                value={selectedColor}
                onChange={(value) => {
                  setSelectedColor(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {colors.map((item) => (
                  <Option key={item.id} value={item.tenMau}>
                    {item.tenMau}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Kích thước:</Text>
              <Select
                placeholder="Chọn kích thước"
                style={{ width: '50%' }}
                value={selectedSize}
                onChange={(value) => {
                  setSelectedSize(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {sizes.map((item) => (
                  <Option key={item.id} value={item.tenKichThuoc}>
                    {item.tenKichThuoc}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Họa tiết:</Text>
              <Select
                placeholder="Chọn họa tiết"
                style={{ width: '50%' }}
                value={selectedHoaTiet}
                onChange={(value) => {
                  setSelectedHoaTiet(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {hoaTiet.map((item) => (
                  <Option key={item.id} value={item.tenHoaTiet}>
                    {item.tenHoaTiet}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col
              span={5}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text style={{ marginRight: '8px' }}>Danh mục:</Text>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: '50%' }}
                value={selectedDanhMuc}
                onChange={(value) => {
                  setSelectedDanhMuc(value);
                }}
              >
                <Option key="all" value="">
                  Tất cả
                </Option>
                {danhMuc.map((item) => (
                  <Option key={item.id} value={item.tenDanhMuc}>
                    {item.tenDanhMuc}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        <div
          style={{
            boxShadow: '0 4px 8px rgba(24, 24, 24, 0.1)',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            height: 'auto',
          }}
        >
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
          />
        </div>
      </Modal>
     <Modal
  title="Nhập số lượng"
  open={isModalVisibleSoLuongNhap}
  onCancel={() => setIsModalVisibleSoLuongNhap(false)}
  footer={[
    <Button key="cancel" onClick={() => setIsModalVisibleSoLuongNhap(false)}>
      Hủy
    </Button>,
    <Button key="submit" type="primary" onClick={handleConfirm}>
      Xác nhận
    </Button>
  ]}
>
  <Input
    type="number"
    value={quantity}
    onChange={(e) => setQuantity(Number(e.target.value))}
    min={1}
  />
</Modal>

    <Modal
    width={900}
      title="Danh sách khách hàng"
      open={isModalVisibleListKhachHang}
      onCancel={handleCancelListKhachHang}
      footer={[
        <Button key="cancel" type="primary" onClick={handleCancelListKhachHang}>
          Đóng
        </Button>
      ]}
    >
      <Row>
      <Input
        type="text"
        placeholder='Nhập số điện thoại...'
       // onChange={(e) => setQuantity(Number(e.target.value))}
      />
      </Row>
      <Table
            dataSource={customers}
            columns={columnKhachHang}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
          />

    </Modal>
    </Layout>
  );
};

export default BanHang;
