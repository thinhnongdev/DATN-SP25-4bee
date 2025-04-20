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
  Space,
  Select,
  Input,
  Form,
  Table,
  Carousel,
  Spin,
  Tag,
  Slider,
  InputNumber,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Sidebar from './SidebarProfile';
import { Option } from 'antd/es/mentions';
import { TbEyeEdit } from 'react-icons/tb';
import moment from 'moment/moment';
import { isEqual } from 'lodash'; // Cài bằng: npm install lodash

const { Title, Text } = Typography;
const { Step } = Steps;

const OrderDetailPage = () => {
  //--------Danh sách sản phẩm
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
  const [tenSanPham, setTenSanPham] = useState('');
  const [isModalVisibleSanPham, setIsModalVisibleSanPham] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const [form] = Form.useForm();
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000); // Giá mặc định nếu không có sản phẩm
  const [priceRange, setPriceRange] = useState([0, 1000000000000000]);
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [images, setImages] = useState([]);
  const [isModalVisibleQuantity, setIsModalVisibleQuantity] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImages, setSelectedImages] = useState([]);
  //--------
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
  const [updateOrder, setUpdateOrder] = useState({ products: [], tongTien: 0 });
  const [currentPrices, setCurrentPrices] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const token = localStorage.getItem('token');
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

  //-------Danh sách sản phẩm

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/imagesSanPham', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Gọi API từ backend
        setImages(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách ảnh:', error);
      }
    };
    fetchImages();
  }, []);

  //   try {
  //     const response = await fetch(`http://localhost:8080/api/admin/sanpham/chitietsanpham/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     setSanPhamChiTiet(data);
  //     if (data.length > 0) {
  //       const maxGia = Math.max(...data.map((p) => p.gia));
  //       setMaxPrice(maxGia); // Cập nhật maxPrice
  //       setPriceRange([0, maxGia]); // Cập nhật khoảng giá mặc định
  //     }
  //     if (data.length === 0) {
  //       setMaxPrice(0); // Cập nhật maxPrice
  //       setPriceRange([0, 0]); // Cập nhật khoảng giá mặc định
  //     }
  //     console.log('Dữ liệu spct', data);
  //   } catch (error) {
  //     console.log('Lỗi get sản phẩm chi tiết', error.message);
  //   }
  // };
  // useEffect(() => {
  //   fetchChiTietSanPham();
  // }, [id]);
  // const fetchTenSanPham = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:8080/api/admin/sanpham/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     setTenSanPham(data.tenSanPham);
  //   } catch (error) {
  //     console.log('Lỗi get tên sản phẩm', error.message);
  //   }
  // };
  // useEffect(() => {
  //   fetchTenSanPham();
  //   fetchChiTietSanPham();
  // }, [id]);

  // Gọi API để lấy danh sách chất liệu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/chatlieu', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieudang', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/thuonghieu', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieucuc', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieucoao', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieucotayao', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieutuiao', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kieutayao', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/mausac', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/kichthuoc', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/hoatiet', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const response = await axios.get('http://localhost:8080/api/admin/danhmuc', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDanhMuc(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Khi mở Modal, set giá trị ban đầu cho Form từ selectedProduct
  useEffect(() => {
    if (selectedProduct) {
      form.setFieldsValue({
        maSanPhamChiTiet: selectedProduct.maSanPhamChiTiet,
        thuongHieu: selectedProduct.thuongHieu?.id,
        mauSac: selectedProduct.mauSac?.id,
        chatLieu: selectedProduct.chatLieu?.id,
        kichThuoc: selectedProduct.kichThuoc?.id,
        kieuDang: selectedProduct.kieuDang?.id,
        kieuCuc: selectedProduct.kieuCuc?.id,
        kieuCoAo: selectedProduct.kieuCoAo?.id,
        kieuTayAo: selectedProduct.kieuTayAo?.id,
        kieuCoTayAo: selectedProduct.kieuCoTayAo?.id,
        tuiAo: selectedProduct.tuiAo?.id,
        danhMuc: selectedProduct.danhMuc?.id,
        hoaTiet: selectedProduct.hoaTiet?.id,
        soLuong: selectedProduct.soLuong,
        gia: selectedProduct.gia,
        moTa: selectedProduct.moTa,
        // trangThai: selectedProduct.trangThai,
      });
    }
  }, [selectedProduct, form]);

  // Mở Modal và lưu dữ liệu sản phẩm được chọn
  const handleOpenModalSanPham = (record) => {
    setSelectedProduct(record);
    setIsModalVisibleSanPham(true);
    handleGetAllProduct();
  };

  // Đóng Modal và reset Form
  const handleCancelModalSanPham = () => {
    setIsModalVisibleSanPham(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  const filteredData = sanPhamChiTiet
    .filter((item) => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = item.maSanPhamChiTiet?.toLowerCase().includes(searchLower) ?? false;
      const matchesPrice = item.gia >= priceRange[0] && item.gia <= priceRange[1];

      const matchesChatLieu = selectedChatLieu
        ? (item.chatLieu?.tenChatLieu ?? '') === selectedChatLieu
        : true;
      const matchesKieuDang = selectedKieuDang
        ? (item.kieuDang?.tenKieuDang ?? '') === selectedKieuDang
        : true;
      const matchesThuongHieu = selectedThuongHieu
        ? (item.thuongHieu?.tenThuongHieu ?? '') === selectedThuongHieu
        : true;
      const matchesKieuCuc = selectedKieuCuc
        ? (item.kieuCuc?.tenKieuCuc ?? '') === selectedKieuCuc
        : true;
      const matchesKieuCoAo = selectedKieuCoAo
        ? (item.kieuCoAo?.tenKieuCoAo ?? '') === selectedKieuCoAo
        : true;
      const matchesKieuCoTayAo = selectedKieuCoTayAo
        ? (item.kieuCoTayAo?.tenKieuCoTayAo ?? '') === selectedKieuCoTayAo
        : true;
      const matchesKieuTayAo = selectedKieuTayAo
        ? (item.kieuTayAo?.tenKieuTayAo ?? '') === selectedKieuTayAo
        : true;
      const matchesKieuTuiAo = selectedKieuTuiAo
        ? (item.kieuTuiAo?.tenKieuTuiAo ?? '') === selectedKieuTuiAo
        : true;
      const matchesHoaTiet = selectedHoaTiet
        ? (item.hoaTiet?.tenHoaTiet ?? '') === selectedHoaTiet
        : true;
      const matchesDanhMuc = selectedDanhMuc
        ? (item.danhMuc?.tenDanhMuc ?? '') === selectedDanhMuc
        : true;
      const matchesColor = selectedColor ? (item.mauSac?.tenMau ?? '') === selectedColor : true;
      const matchesSize = selectedSize
        ? (item.kichThuoc?.tenKichThuoc ?? '') === selectedSize
        : true;

      return (
        matchesSearch &&
        matchesPrice &&
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
    })
    .map((item) => ({
      ...item,
      key: item.id || item.maSanPhamChiTiet, // Đảm bảo có key
    }));

  // Hàm chọn/bỏ chọn từng ô
  const handleCheckboxChange = (e, record) => {
    console.log('Record: ', record); // Kiểm tra dữ liệu của từng hàng

    if (!record || record.key === undefined) {
      console.error('Lỗi: record không có key hợp lệ!', record);
      return;
    }

    const isChecked = e.target.checked;
    setSelectedRowKeys((prevSelectedRowKeys) => {
      if (isChecked) {
        return [...prevSelectedRowKeys, record.key];
      } else {
        return prevSelectedRowKeys.filter((key) => key !== record.key);
      }
    });
  };
  useEffect(() => {
    setSelectedRowKeys((prevSelectedRowKeys) => {
      const newSelectedKeys = prevSelectedRowKeys.filter((key) =>
        filteredData.some((item) => item.key === key),
      );

      // Chỉ cập nhật state nếu có sự thay đổi, tránh re-render không cần thiết
      if (JSON.stringify(newSelectedKeys) !== JSON.stringify(prevSelectedRowKeys)) {
        return newSelectedKeys;
      }

      return prevSelectedRowKeys;
    });
  }, [filteredData]);
  useEffect(() => {
    console.log('Selected Rows:', selectedRowKeys);
  }, [selectedRowKeys]);

  //hàm lấy toàn bộ sản phẩm
  const handleGetAllProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/sanpham/chitietsanpham`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSanPhamChiTiet(data);
      console.log('Dữ liệu spct', data);
      setTenSanPham('Tất cả sản phẩm');
      if (data.length > 0) {
        const maxGia = Math.max(...data.map((p) => p.gia));
        setMaxPrice(maxGia); // Cập nhật maxPrice
        setPriceRange([0, maxGia]); // Cập nhật khoảng giá mặc định
      }
      if (data.length === 0) {
        setMaxPrice(0); // Cập nhật maxPrice
        setPriceRange([0, 0]); // Cập nhật khoảng giá mặc định
      }
      console.log('Dữ liệu spct', data);
    } catch (error) {
      console.log('Lỗi get sản phẩm chi tiết', error.message);
    }
  };
  // Component lấy và hiển thị ảnh sản phẩm dựa vào id
  // Component hiển thị ảnh sản phẩm dựa vào id sản phẩm chi tiết
  const ProductImage = ({ sanPhamChiTietId }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hàm lấy danh sách ảnh dựa vào API
    const fetchProductImagesForModal = async (sanPhamChiTietId) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/admin/sanphamchitiet/${sanPhamChiTietId}/hinhanh`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // Chỉ lấy danh sách các anhUrl
        console.log('ẢNh spct', response);
        const imageUrls = response.data.map((item) => item.anhUrl);
        return imageUrls;
      } catch (error) {
        console.error('Lỗi khi lấy ảnh sản phẩm:', error);
        return [];
      }
    };

    useEffect(() => {
      const loadImage = async () => {
        const images = await fetchProductImagesForModal(sanPhamChiTietId);
        // Nếu có ảnh, lấy ra ảnh đầu tiên
        if (images.length > 0) {
          setImage(images[0]);
        }
        setLoading(false);
      };
      loadImage();
    }, [sanPhamChiTietId]);

    if (loading) {
      return <Spin size="small" />;
    }

    return image ? (
      <img
        src={image}
        alt={`Ảnh sản phẩm ${sanPhamChiTietId}`}
        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
      />
    ) : (
      <span>Không có ảnh</span>
    );
  };

  const fetchProductImagesForModal = async (sanPhamChiTietId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/sanphamchitiet/${sanPhamChiTietId}/hinhanh`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Chỉ lấy danh sách anhUrl
      const imageUrls = response.data.map((item) => item.anhUrl);

      setSelectedImages(imageUrls); // Lưu danh sách chỉ chứa URL ảnh
      console.log('Danh sách ảnh sản phẩm:', imageUrls);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh sản phẩm:', error);
    }
  };
  useEffect(() => {
    const maxPrice = Math.max(...sanPhamChiTiet.map((p) => p.gia));
  }, [sanPhamChiTiet]);

  // Gọi API khi `selectedProduct` thay đổi
  useEffect(() => {
    if (selectedProduct?.id) {
      fetchProductImagesForModal(selectedProduct.id);
      console.log('selectedProduct', selectedProduct);
    }
  }, [selectedProduct]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const handleOpenModalQuantity = (record) => {
    setSelectedProduct(record);
    setQuantity(1); // reset về 1 khi mở modal mới
    setIsModalVisibleQuantity(true);
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
      dataIndex: 'id',
      key: 'id',
      render: (id) => <ProductImage sanPhamChiTietId={id} />,
    },
    {
      title: 'Mã',
      dataIndex: 'maSanPhamChiTiet',
      key: 'maSanPhamChiTiet',
      render: (text) => (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '60px' }}>{text}</div>
      ),
    },
    {
      title: 'Tên sản phẩm',
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
      title: 'Màu sắc',
      dataIndex: 'mauSac',
      key: 'mauSac',
      render: (text) => text?.tenMau || 'Không có dữ liệu',
    },
    {
      title: 'Chất liệu',
      dataIndex: 'chatLieu',
      key: 'chatLieu',
      render: (text) => text?.tenChatLieu || 'Không có dữ liệu',
    },
    {
      title: 'Kích thước',
      dataIndex: 'kichThuoc',
      key: 'kichThuoc',
      render: (text) => text?.tenKichThuoc || 'Không có dữ liệu',
    },
    {
      title: 'Kiểu dáng',
      dataIndex: 'kieuDang',
      key: 'kieuDang',
      render: (text) => text?.tenKieuDang || 'Không có dữ liệu',
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
        return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}đ`;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (text, record) =>
        record.trangThai ? (
          <Tag color="green" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Đang bán
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Ngừng bán
          </Tag>
        ),
    },

    {
      title: 'Chức năng',
      render: (text, record) => (
        <Button type="default" onClick={() => handleOpenModalQuantity(record)}>
          Chọn
        </Button>
      ),
    },
  ];
  //--------
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

  const fetchProductImages = async (products) => {
    //lấy hình ảnh sản phẩm
    const imageMap = {};
    for (const product of products) {
      const img = await fetchProductImage(product.id);
      if (img && img.length > 0) {
        imageMap[product.id] = img[0].anhUrl;
      }
    }
    setProductImages(imageMap);
  };

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
        voucher: voucherRes.data ? voucherRes.data : null,
      };
      setOrder(fullOrder);
      setShippingFee(fullOrder.phiVanChuyen);
      setUpdateOrder(fullOrder); //thong tin order để chỉnh sửa
    } catch (error) {
      console.error('Lỗi lấy chi tiết đơn hàng:', error);
    }
  };
  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  console.log('order', order);

  //hủy đơn hàng
  const handleCancelOrder = () => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      okText: 'Hủy đơn',
      cancelText: 'Không',
      okType: 'danger',
      onOk: async () => {
        try {
          // Gửi yêu cầu hủy đơn hàng lên server
          await axios.put(`http://localhost:8080/api/client/order/cancel/${updateOrder.id}`);

          message.success('Đơn hàng đã được hủy thành công!');
          // TODO: bạn có thể redirect, reload hoặc update UI tùy theo luồng app
        } catch (error) {
          console.error('Lỗi khi hủy đơn hàng:', error);
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại!');
        }
      },
    });
  };

  useEffect(() => {
    //lấy hình ảnh sản phẩm tự động khi updateOrder thay đổi
    if (updateOrder && updateOrder.products?.length > 0) {
      fetchProductImages(updateOrder.products);
    }
  }, [updateOrder]);
  console.log('productImages', productImages);

  // Check thay đổi giá sản phẩm
  useEffect(() => {
    if (!updateOrder || !Array.isArray(updateOrder.products)) return;

    let intervalId;

    const fetchCurrentPrices = async () => {
      const priceMap = {};

      await Promise.all(
        updateOrder.products.map(async (product) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/api/client/chitietsanpham/${product.id}`,
            );
            priceMap[product.id] = res.data.gia;
          } catch (error) {
            console.error('Lỗi lấy giá hiện tại:', error);
          }
        }),
      );

      setCurrentPrices((prev) => ({
        ...prev,
        ...priceMap,
      }));
    };

    if (updateOrder.products.length > 0) {
      fetchCurrentPrices(); // Gọi lần đầu

      intervalId = setInterval(() => {
        fetchCurrentPrices();
      }, 10000); // Cập nhật mỗi 10 giây
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [updateOrder]);

  
  useEffect(() => {
    if (!order || !updateOrder) return;

    // So sánh đơn giản - có thể custom thêm logic nếu cần chính xác hơn
    const isSame =
      isEqual(order.diaChi, updateOrder.diaChi) &&
      isEqual(order.products, updateOrder.products) &&
      order.tongTien === updateOrder.tongTien;

    setHasChanges(!isSame);
  }, [updateOrder, order]);

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
  const address = parseAddress(updateOrder.diaChi);
  console.log('currentStep', currentStep);

  const handleQuantityChange = (productDetailId, newQuantity) => {
    try {
      if (newQuantity === 0) {
        // Kiểm tra nếu chỉ còn 1 sản phẩm
        if (updateOrder.products.length === 1) {
          message.warning('Phải có ít nhất 1 sản phẩm trong hóa đơn.');
          return;
        }

        Modal.confirm({
          title: 'Xác nhận xóa sản phẩm',
          content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi hóa đơn?',
          okText: 'Xóa',
          cancelText: 'Hủy',
          okType: 'danger',
          onOk: () => {
            // Xóa sản phẩm và cập nhật state
            const filteredProducts = updateOrder.products.filter(
              (item) => item.id !== productDetailId,
            );
            const newTotal = filteredProducts.reduce(
              (total, item) => total + item.giaTaiThoiDiemThem * item.soLuongMua,
              0,
            );

            setUpdateOrder((prev) => ({
              ...prev,
              products: filteredProducts,
              tongTien: newTotal,
              tongThanhToan:
                newTotal + prev.phiVanChuyen - getDiscountValue(prev.voucher, newTotal),
            }));

            message.success('Đã xóa sản phẩm khỏi hóa đơn!');
          },
        });

        return; // Dừng ở đây, không tiếp tục xử lý phía dưới
      }

      // Nếu số lượng > 0 thì cập nhật như thường
      setUpdateOrder((prev) => {
        const updatedProducts = prev.products.map((item) =>
          item.id === productDetailId ? { ...item, soLuongMua: newQuantity } : item,
        );

        const newTotal = updatedProducts.reduce(
          (total, item) => total + item.giaTaiThoiDiemThem * item.soLuongMua,
          0,
        );

        return {
          ...prev,
          products: updatedProducts,
          tongTien: newTotal,
          tongThanhToan: newTotal + prev.phiVanChuyen - getDiscountValue(prev.voucher, newTotal),
        };
      });

      message.success('Đã cập nhật số lượng sản phẩm!');
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      message.error('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleEditAddress = () => {
    setIsAddressList(true);
    setSelectedAddress(updateOrder.diaChi); // Set the selected address to the current address
    console.log('ID khách hàng', updateOrder.idKhachHang);
    console.log('Thông tin đơn hàng', updateOrder);
    fetchAddresses(updateOrder.idKhachHang); // Fetch addresses when modal opens
  };

  const getFormattedAddress = (address) => {
    return `${address.diaChiCuThe}, ${address.xa}, ${address.huyen}, ${address.tinh}`;
  };
  const isSameAddress = (aStr, bStr) => {
    const a = parseAddress(aStr);
    const b = parseAddress(bStr);
    return (
      a.diaChiCuThe === b.diaChiCuThe && a.xa === b.xa && a.huyen === b.huyen && a.tinh === b.tinh
    );
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
              {`${parseAddress(selectedAddress).diaChiCuThe}, ${formatWardName(
                parseAddress(selectedAddress).xa,
                parseAddress(selectedAddress).huyen,
              )}, ${formatDistrictName(parseAddress(selectedAddress).huyen)}, ${formatProvinceName(
                parseAddress(selectedAddress).tinh,
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
          if (!userInfo?.email) {
            message.error('Không lấy được email khách hàng. Vui lòng thử lại!');
            return;
          }

          setUpdateOrder((prev) => ({
            ...prev,
            diaChi: selectedAddress,
            phiVanChuyen: fee,
            tongThanhToan: totalPayMent,
          }));

          setIsAddressList(false); // đóng danh sách địa chỉ
          message.success('Đã lưu thay đổi vào bộ nhớ tạm');
        },
      });
    } catch (err) {
      message.error('Không thể tính phí vận chuyển');
    }
  };
  console.log('thông tin đơn hàng update', updateOrder);

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
  const handleAddProductToUpdateOrder = (product, quantity) => {
    setUpdateOrder((prev) => {
      const existingIndex = prev.products.findIndex(
        (p) => p.id === product.id && p.giaTaiThoiDiemThem === product.gia,
      );

      let updatedProducts;

      if (existingIndex !== -1) {
        // Đã có sản phẩm với cùng giá => cộng dồn số lượng
        updatedProducts = [...prev.products];
        updatedProducts[existingIndex].soLuongMua += quantity;
      } else {
        // Giá khác hoặc sản phẩm chưa có => tạo mới bản ghi
        const simplifiedProduct = {
          id: product.id,
          maSanPhamChiTiet: product.maSanPhamChiTiet,
          sanPham: product.sanPham?.tenSanPham,
          gia: product.gia, // Giá hiện tại
          giaTaiThoiDiemThem: product.gia, // Dùng để so sánh và hiển thị đúng thời điểm
          soLuongMua: quantity,
          mauSac: product.mauSac?.tenMau,
          kichThuoc: product.kichThuoc?.tenKichThuoc,
          chatLieu: product.chatLieu?.tenChatLieu,
          hoaTiet: product.hoaTiet?.tenHoaTiet,
          kieuDang: product.kieuDang?.tenKieuDang,
          thuongHieu: product.thuongHieu?.tenThuongHieu,
          moTa: product.moTa,
          ngayTao: product.ngayTao,
          trangThai: product.trangThai? 1:2,//format lại trang thái
        };

        updatedProducts = [...prev.products, simplifiedProduct];
      }

      // Tính lại tổng tiền dựa theo `giaTaiThoiDiemThem`
      const newTotal = updatedProducts.reduce(
        (sum, item) => sum + item.giaTaiThoiDiemThem * item.soLuongMua,
        0,
      );

      return {
        ...prev,
        products: updatedProducts,
        tongTien: newTotal,
        tongThanhToan: newTotal + shippingFee - voucherDiscount,
      };
    });
  };

  const voucherDiscount =
    updateOrder?.tongTien > 0 ? getDiscountValue(order.voucher, order?.tongTien) : 0; //tính giảm giá
  const totalPayMent = Math.max(updateOrder?.tongTien + shippingFee - voucherDiscount, 0); //tính tổng tiền thanh toán
  const totalPaid = order.payments.reduce((sum, payment) => {
    const maPTTT = payment.phuongThucThanhToan?.maPhuongThucThanhToan;
    if (maPTTT !== 'COD') {
      return sum + payment.tongTien;
    }
    return sum;
  }, 0);

  const chenhLech = totalPayMent - totalPaid;
  //Tách danh sách các payment không phải COD
  const nonCODPayments = order.payments?.filter(
    (p) => p.phuongThucThanhToan?.maPhuongThucThanhToan !== 'COD',
  );
  //Kiểm tra nếu tất cả đều là COD
  const allCOD = order.payments?.length > 0 && nonCODPayments?.length === 0;

  const handleConfirmUpdateOrder = () => {
    Modal.confirm({
      title: 'Xác nhận cập nhật đơn hàng',
      content: 'Bạn có chắc chắn muốn cập nhật đơn hàng này không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:8080/api/client/order/updatehoadoncho/${updateOrder.id}`,
            updateOrder,
          );
          message.success('Cập nhật đơn hàng thành công!');
          setHasChanges(false); // Ẩn nút sau khi cập nhật thành công
        } catch (error) {
          console.error(error);
          message.error('Lỗi khi cập nhật đơn hàng!');
        }
      },
    });
  };
  const isEditable = ![3, 4, 5].includes(updateOrder.trangThai); // 3: Đang giao, 4: Hoàn thành, 5: Đã hủy

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
          {isEditable && (
            <Row style={{ marginTop: 16 }} justify="end" align="middle">
              <Col>
                <Button
                  type="default"
                  danger
                  style={{ borderColor: 'red', color: 'red' }}
                  onClick={handleCancelOrder}
                >
                  Hủy đơn hàng
                </Button>
              </Col>
            </Row>
          )}
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
            {isEditable && (
            <a
              onClick={handleEditAddress} // hàm xử lý khi nhấn "Sửa"
              style={{ marginLeft: 8, color: '#1677ff', cursor: 'pointer' }}
            >
              Sửa
            </a>
            )}
          </Text>
        </Card>

        <Divider />
        <Card style={{ marginTop: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Text style={{ fontWeight: 500 }}>Mã đơn hàng: {updateOrder.maHoaDon}</Text>
              <br />
            </Col>
            <Col>
              {isEditable && (
                <Button type="primary" onClick={handleOpenModalSanPham}>
                  + Thêm sản phẩm
                </Button>
              )}
            </Col>
          </Row>
          {updateOrder?.products?.map((item, idx) => {
            const totalProductPrice = item.giaTaiThoiDiemThem * item.soLuongMua;

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
                    {isEditable && (
                      <Row align="middle" gutter={8}>
                        <Col>
                          <Button
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.soLuongMua - 1)}
                            disabled={updateOrder.products.length === 1 && item.soLuongMua === 1}
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
                            disabled={currentPrices[item.id] > item.giaTaiThoiDiemThem}
                          >
                            +
                          </Button>
                        </Col>
                      </Row>
                    )}

                    <br />
                    <Text style={{ color: 'red', fontWeight: 500 }}>
                      Đơn giá: {item.giaTaiThoiDiemThem.toLocaleString('vi-VN')}₫
                    </Text>
                    {currentPrices[item.id] &&
                      currentPrices[item.id] !== item.giaTaiThoiDiemThem && (
                        <Text type="danger" style={{ display: 'block' }}>
                          Có sự thay đổi giá từ {item.giaTaiThoiDiemThem.toLocaleString('vi-VN')}₫ →{' '}
                          {currentPrices[item.id].toLocaleString('vi-VN')}₫
                        </Text>
                      )}
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
                <Text style={{ fontSize: '16px' }}>
                  {updateOrder.tongTien.toLocaleString('vi-VN')}₫
                </Text>
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
                  + {updateOrder.phiVanChuyen?.toLocaleString('vi-VN') || '0'}₫
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
            {/* <Row
              justify="space-between"
              style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12, paddingBottom: 12 }}
            >
              <Col>
                <Text>Phương thức thanh toán: </Text>
                <Text>
                  {order.payments?.[0]?.phuongThucThanhToan?.tenPhuongThucThanhToan || '---'}
                </Text>
              </Col>
            </Row> */}
          </Card>
        </Card>

        {/* Chỉ hiển thị nếu có ít nhất 1 payment KHÔNG PHẢI COD */}
        {nonCODPayments?.length > 0 ? (
          nonCODPayments.map((payment, index) => (
            <Card
              key={payment.id}
              title={`Thông tin thanh toán #${index + 1}`}
              style={{
                marginTop: 16,
                borderRadius: 8,
                backgroundColor: '#f9f9f9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text strong>Mã giao dịch:</Text>
                  <div>{payment.id}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Phương thức:</Text>
                  <div>{payment.phuongThucThanhToan?.tenPhuongThucThanhToan || '---'}</div>
                </Col>

                <Col span={12}>
                  <Text strong>Ngày tạo:</Text>
                  <div>
                    {payment.ngayTao ? new Date(payment.ngayTao).toLocaleString('vi-VN') : '---'}
                  </div>
                </Col>

                {payment.moTa && (
                  <Col span={12}>
                    <Text strong>Mô tả:</Text>
                    <div>{payment.moTa}</div>
                  </Col>
                )}

                <Col span={12}>
                  <Text strong style={{ color: 'green' }}>
                    Tổng tiền đã thanh toán:
                  </Text>
                  <div style={{ fontSize: 16, color: '#1677ff' }}>
                    {payment.tongTien ? `${payment.tongTien.toLocaleString('vi-VN')}₫` : '---'}
                  </div>
                </Col>
              </Row>
            </Card>
          ))
        ) : (
          <Text type="secondary"></Text>
        )}

        {/* Hiện tổng thanh toán & chênh lệch nếu KHÔNG phải tất cả đều là COD */}
        {!allCOD && chenhLech !== 0 && (
          <Card
            style={{
              marginTop: 16,
              borderRadius: 8,
              backgroundColor: '#fff7e6',
              border: '1px solid #ffe58f',
            }}
          >
            <Row justify="space-between">
              <Col>
                <Text strong>Tổng tiền đã thanh toán</Text>
              </Col>
              <Col>
                <Text strong style={{ color: '#1677ff' }}>
                  {totalPaid.toLocaleString('vi-VN')}₫
                </Text>
              </Col>
            </Row>

            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>
                <Text strong>Số tiền chêng lệch</Text>
              </Col>
              <Col>
                {chenhLech > 0 ? (
                  <Text strong style={{ color: 'red' }}>
                    Thiếu {chenhLech.toLocaleString('vi-VN')}₫
                  </Text>
                ) : (
                  <Text strong style={{ color: 'green' }}>
                    Thừa {Math.abs(chenhLech).toLocaleString('vi-VN')}₫
                  </Text>
                )}
              </Col>
            </Row>

            {/* Dòng mô tả */}
            <Row style={{ marginTop: 8 }}>
              <Col span={24}>
                <Text type="secondary" italic>
                  {chenhLech > 0
                    ? 'Khách hàng cần thanh toán số tiền còn thiếu khi nhận hàng.'
                    : 'Cửa hàng sẽ liên hệ hoàn tiền cho quý khách trong vòng 2-3 ngày làm việc.'}
                </Text>
              </Col>
            </Row>
          </Card>
        )}
        {hasChanges && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" size="large" onClick={handleConfirmUpdateOrder}>
              Xác nhận cập nhật đơn hàng
            </Button>
          </div>
        )}
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
              const isSelected = isSameAddress(getFormattedAddress(address), selectedAddress);

              console.log('isSelected', isSelected);
              console.log('addressok', getFormattedAddress(address));
              console.log('selectedAddressok', selectedAddress);
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

      {/*modal thêm sản phẩm */}
      <Modal
        open={isModalVisibleSanPham}
        onCancel={handleCancelModalSanPham}
        width={1300}
        title="Danh sách sản phẩm"
        footer={[
          <Button key="close" onClick={handleCancelModalSanPham}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
              <Col
                span={13}
                style={{
                  paddingLeft: '300px',
                  display: 'flex',
                  alignItems: 'center', // Căn chỉnh các phần tử theo chiều dọc
                  justifyContent: 'flex-start', // Căn chỉnh phần tử về phía bên trái
                }}
              >
                <Text
                  style={{
                    marginRight: '10px', // Khoảng cách giữa Text và Slider
                    whiteSpace: 'nowrap', // Ngăn không cho chữ xuống dòng
                    flexShrink: 0, // Ngăn chữ bị thu hẹp khi không gian không đủ
                  }}
                >
                  Khoảng giá:
                </Text>
                {/* Khoảng cách giữa Text và Slider */}
                <Slider
                  range
                  min={0}
                  max={maxPrice}
                  defaultValue={priceRange}
                  onChange={(value) => setPriceRange(value)}
                  tipFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} // Hiển thị giá trị dưới dạng VND
                  style={{ width: '100%' }}
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
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
          />
        </Space>
      </Modal>
      {/* Modal nhập số lượng */}
      <Modal
        title="Nhập số lượng"
        open={isModalVisibleQuantity}
        onOk={() => {
          handleAddProductToUpdateOrder(selectedProduct, quantity);
          setIsModalVisibleQuantity(false);
        }}
        onCancel={() => setIsModalVisibleQuantity(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          <strong>
            {selectedProduct?.sanPham?.tenSanPham || ''} - {selectedProduct?.maSanPhamChiTiet}
          </strong>
        </p>
        <InputNumber
          min={1}
          max={selectedProduct?.soLuongTon}
          value={quantity}
          onChange={(value) => {
            const max = selectedProduct?.soLuong || 1;

            // Nếu không phải số hoặc nhỏ hơn 1 -> bỏ qua
            if (!value || value < 1) return;

            // Nếu vượt quá tồn kho -> set về max
            if (value > max) {
              setQuantity(max);
            } else {
              setQuantity(Math.floor(value));
            }
          }}
          parser={(value) => value.replace(/[^\d]/g, '')}
          formatter={(value) => `${value}`.replace(/\D/g, '')}
          style={{ width: '100%' }}
        />
      </Modal>
    </Layout>

    //danh sách sản phẩm
  );
};

export default OrderDetailPage;
