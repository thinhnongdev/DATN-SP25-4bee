import { use, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  Table,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Select,
  Col,
  Row,
  Badge,
  Typography,
  Slider,
  Checkbox,
  Image,
  InputNumber,
  Tag,
  Spin,
} from 'antd';
import { toast } from 'react-toastify';
import { TbEyeEdit } from 'react-icons/tb';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import {
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
const { Option } = Select;
const { Text } = Typography;
const SanPhamChiTiet = () => {
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
  const [tenSanPham, setTenSanPham] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { id } = useParams();
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
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisibleImage, setIsModalVisibleImage] = useState(false);
  const fileInputRef = useRef(null); // Tạo tham chiếu đến input file
  const token = localStorage.getItem('token');
  const handleButtonAddImageClick = () => {
    fileInputRef.current.click(); // Mở hộp thoại chọn file khi nhấn nút
  };
  const showModalImage = () => {
    setIsModalVisibleImage(true);
  };
  const handleCancelImage = () => {
    setIsModalVisibleImage(false);
  };
  const handleOKImage = () => {
    setIsModalVisibleImage(false);
  };
  const handleRemoveSelectedImage = (imageToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter((image) => image !== imageToRemove));
  };
  const handleSelectImage = (img) => {
    setSelectedImages((prev) => {
      const exists = prev.includes(img);

      if (exists) {
        // Bỏ chọn ảnh nếu đã tồn tại
        return prev.filter((item) => item !== img);
      } else {
        // Giới hạn số lượng ảnh được chọn (ví dụ: tối đa 5 ảnh)
        if (prev.length >= 3) {
          toast.warning('Chỉ được chọn tối đa 3 ảnh!');
          return prev;
        }
        return [...prev, img];
      }
    });
  };

  const handleUploadImage = async (files) => {
    if (!files || files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh!');
      return;
    }

    try {
      toast.info('Đang tải ảnh lên...');

      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default'); // Thay thế bằng upload preset của bạn
          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dl1ahr7s5/image/upload', // Thay thế bằng cloud_name của bạn
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          return response.data.secure_url;
        }),
      );

      setImages((prevImageUrls) => [...uploadedImages, ...prevImageUrls]);

      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Không thể tải ảnh lên, vui lòng thử lại.');
    }
  };
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
  const fetchChiTietSanPham = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/sanpham/chitietsanpham/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSanPhamChiTiet(data);
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
  useEffect(() => {
    fetchChiTietSanPham();
  }, [id]);
  const fetchTenSanPham = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/sanpham/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTenSanPham(data.tenSanPham);
    } catch (error) {
      console.log('Lỗi get tên sản phẩm', error.message);
    }
  };
  useEffect(() => {
    fetchTenSanPham();
    fetchChiTietSanPham();
  }, [id]);

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
  const handleOpenModal = (record) => {
    setSelectedProduct(record);
    setIsModalVisible(true);
  };

  // Đóng Modal và reset Form
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  // Xử lý submit cập nhật sản phẩm
  const handleUpdate = async (values) => {
    try {
      const requestData = {
        ...values, // Giữ các giá trị từ Form
        thuongHieu: values.thuongHieu,
        mauSac: values.mauSac,
        chatLieu: values.chatLieu,
        size: values.kichThuoc,
        kieuDang: values.kieuDang,
        kieuCuc: values.kieuCuc,
        kieuCoAo: values.kieuCoAo,
        kieuCoTayAo: values.kieuCoTayAo,
        kieuTayAo: values.kieuTayAo,
        kieuTuiAo: values.tuiAo,
        danhMuc: values.danhMuc,
        hoaTiet: values.hoaTiet,
        images: selectedImages, // Thêm danh sách ảnh vào request
      };
      console.log('Dữ liệu gửi đi:', requestData);

      const response = await fetch(
        `http://localhost:8080/api/admin/sanpham/chitietsanpham/${selectedProduct.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      // const updatedProduct = await response.json();
      // setSanPhamChiTiet((prev) =>
      //   prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
      // );
      // Gọi lại API để lấy dữ liệu mới
      fetchChiTietSanPham();
      toast.success('Cập nhật thành công');
      handleCancelModal();
    } catch (error) {
      console.log(error);
      toast.error('Cập nhật thất bại');
    }
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

  // Hàm chọn/bỏ chọn tất cả
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRowKeys(filteredData.map((item) => item.key));
    } else {
      setSelectedRowKeys([]);
    }
  };
  const isRowSelected = (record) => {
    return selectedRowKeys.includes(record.key);
  };

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

  // Hàm tải mã QR xuống file ZIP
  const handleDownloadQR = async () => {
    if (selectedRowKeys.length === 0) {
      alert('Vui lòng chọn ít nhất một hàng!');
      return;
    }

    const zip = new JSZip();

    const qrPromises = selectedRowKeys.map(async (key) => {
      const record = filteredData.find((item) => item.key === key);
      console.log('record', record);
      if (!record) return;

      try {
        // Tạo mã QR dưới dạng Data URL
        const dataUrl = await QRCode.toDataURL(record.maSanPhamChiTiet, {
          errorCorrectionLevel: 'H',
        });

        // Chuyển đổi Data URL thành Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Thêm Blob vào tệp ZIP
        zip.file(`${record.maSanPhamChiTiet}.png`, blob);
      } catch (error) {
        console.error(`Lỗi khi tạo mã QR cho sản phẩm: ${record.maSanPhamChiTiet}`, error);
      }
    });

    await Promise.all(qrPromises);

    zip
      .generateAsync({ type: 'blob' })
      .then((blob) => {
        if (blob.size > 0) {
          saveAs(blob, 'QR_Codes.zip');
        } else {
          alert('Không có ảnh QR nào được lưu!');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi tạo tệp ZIP:', error);
      });
  };
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
    const fetchProductImages = async (sanPhamChiTietId) => {
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
        const images = await fetchProductImages(sanPhamChiTietId);
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

  const fetchProductImages = async (sanPhamChiTietId) => {
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
      fetchProductImages(selectedProduct.id);
      console.log('selectedProduct', selectedProduct);
    }
  }, [selectedProduct]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length === filteredData.length}
          onChange={handleSelectAll}
        />
      ),
      render: (text, record) => (
        <Checkbox
          checked={isRowSelected(record)}
          onChange={(e) => handleCheckboxChange(e, record)}
        />
      ),
    },
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
    // {
    //   title: 'Kiểu cúc',
    //   dataIndex: 'kieuCuc',
    //   key: 'kieuCuc',
    //   render: (text) => text?.tenKieuCuc || 'Không có dữ liệu',
    // },
    // {
    //   title: 'Kiểu cổ áo',
    //   dataIndex: 'kieuCoAo',
    //   key: 'kieuCoAo',
    //   width: 100,
    //   render: (text) => (
    //     <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
    //       {text?.tenKieuCoAo || 'Không có dữ liệu'}
    //     </div>
    //   ),
    // },
    // {
    //   title: 'Kiểu cổ tay áo',
    //   dataIndex: 'kieuCoTayAo',
    //   key: 'kieuCoTayAo',
    //   width: 50,
    //   render: (text) => (
    //     <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
    //       {text?.tenKieuCoTayAo || 'Không có dữ liệu'}
    //     </div>
    //   ),
    // },
    // {
    //   title: 'Kiểu túi áo',
    //   dataIndex: 'tuiAo',
    //   key: 'tuiAo',
    //   width: 50,
    //   render: (text) => text?.tenKieuTuiAo || 'Không có dữ liệu',
    // },
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
      render: (text, record) => {
        const isSelling = record.trangThai && record.soLuong > 0;
        return isSelling ? (
          <Tag color="green" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Đang bán
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Ngừng bán
          </Tag>
        );
      },
    },
    

    {
      title: 'Chức năng',
      render: (text, record) => (
        <Button type="submit" onClick={() => handleOpenModal(record)}>
          <TbEyeEdit size={24} />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div>
        <Breadcrumb style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bold' }}>
          <Breadcrumb.Item>
            <Link to="/admin/sanpham">Sản phẩm</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{tenSanPham || ''}</Breadcrumb.Item>
        </Breadcrumb>
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
        <div
          style={{
            boxShadow: '0 4px 8px rgba(24, 24, 24, 0.1)',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            height: 'auto',
          }}
        >
          <Row style={{ justifyContent: 'end' }}>
            <Button
              style={{ marginBottom: '10px', marginRight: '10px' }}
              type="primary"
              onClick={handleGetAllProduct}
            >
              Tất cả sản phẩm
            </Button>
            <Button
              style={{ marginBottom: '10px' }}
              type="primary"
              onClick={handleDownloadQR}
              disabled={selectedRowKeys.length === 0}
            >
              <DownloadOutlined />
              Tải mã QR
            </Button>
          </Row>
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
          />
        </div>
      </div>

      {/* Modal hiển thị và chỉnh sửa chi tiết sản phẩm */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        width={1100} // Đặt chiều rộng của modal (ví dụ 900px)
      >
        {selectedProduct ? (
          <>
            {/* Hiển thị mã QR dựa trên mã sản phẩm chi tiết */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: 16,
              }}
            >
              {/* Mã QR */}
              <QRCodeCanvas
                value={selectedProduct.maSanPhamChiTiet}
                size={150}
                includeMargin={true}
              />

              {/* Ảnh sản phẩm chi tiết */}
              {selectedImages.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedImages.map((img, index) => (
                    <img
                      key={index}
                      src={img} // Giả sử API trả về { id, anhUrl }
                      alt="Ảnh sản phẩm"
                      style={{
                        border: '2px dashed #1890ff', // Viền đứt nét màu xanh
                        borderRadius: '18px', // Bo góc giống ảnh
                        width: '120px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '18px',
                        padding: '1px',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p>Không có ảnh</p>
              )}
              <div>
                <Button
                  onClick={showModalImage}
                  style={{
                    width: '120px',
                    height: '150px',
                    border: '2px dashed #1890ff', // Viền đứt nét màu xanh
                    borderRadius: '18px', // Bo góc giống ảnh
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    background: 'transparent', // Không có nền
                    color: '#1890ff', // Màu chữ xanh giống viền
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <PictureOutlined style={{ fontSize: '36px', color: '#1890ff' }} />
                  <span>Ảnh</span>
                </Button>
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Form.Item label="Mã sản phẩm chi tiết" name="maSanPhamChiTiet">
                <Input disabled />
              </Form.Item>

              {/* Sử dụng Row và Col để chia các Select thành 2 cột */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Thương hiệu"
                    name="thuongHieu"
                    rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                  >
                    <Select
                      placeholder="Chọn thương hiệu"
                      options={thuongHieu.map((item) => ({
                        value: item.id,
                        label: item.tenThuongHieu,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Màu sắc"
                    name="mauSac"
                    rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
                  >
                    <Select
                      placeholder="Chọn màu sắc"
                      options={colors.map((item) => ({
                        value: item.id,
                        label: item.tenMau,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Chất liệu"
                    name="chatLieu"
                    rules={[{ required: true, message: 'Vui lòng chọn chất liệu' }]}
                  >
                    <Select
                      placeholder="Chọn chất liệu"
                      options={chatLieu.map((item) => ({
                        value: item.id,
                        label: item.tenChatLieu,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kích thước"
                    name="kichThuoc"
                    rules={[{ required: true, message: 'Vui lòng chọn kích thước' }]}
                  >
                    <Select
                      placeholder="Chọn kích thước"
                      options={sizes.map((item) => ({
                        value: item.id,
                        label: item.tenKichThuoc,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu dáng"
                    name="kieuDang"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu dáng' }]}
                  >
                    <Select
                      placeholder="Chọn kiểu dáng"
                      options={kieuDang.map((item) => ({
                        value: item.id,
                        label: item.tenKieuDang,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu cúc"
                    name="kieuCuc"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu cúc' }]}
                  >
                    <Select
                      placeholder="Chọn kiểu cúc"
                      options={kieuCuc.map((item) => ({
                        value: item.id,
                        label: item.tenKieuCuc,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu cổ áo"
                    name="kieuCoAo"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu cổ áo' }]}
                  >
                    <Select
                      placeholder="Chọn kiểu cổ áo"
                      options={kieuCoAo.map((item) => ({
                        value: item.id,
                        label: item.tenKieuCoAo,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu cổ tay áo"
                    name="kieuCoTayAo"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu cổ tay áo' }]}
                  >
                    <Select
                      placeholder="Chọn cổ tay áo"
                      options={kieuCoTayAo.map((item) => ({
                        value: item.id,
                        label: item.tenKieuCoTayAo,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu túi áo"
                    name="tuiAo"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu túi áo' }]}
                  >
                    <Select
                      placeholder="Chọn kiểu túi áo"
                      options={kieuTuiAo.map((item) => ({
                        value: item.id,
                        label: item.tenKieuTuiAo,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Kiểu tay áo"
                    name="kieuTayAo"
                    rules={[{ required: true, message: 'Vui lòng chọn kiểu tay áo' }]}
                  >
                    <Select
                      placeholder="Chọn kiểu tay áo"
                      options={kieuTayAo.map((item) => ({
                        value: item.id,
                        label: item.tenKieuTayAo,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họa tiết"
                    name="hoaTiet"
                    F
                    rules={[{ required: true, message: 'Vui lòng chọn họa tiết' }]}
                  >
                    <Select
                      placeholder="Chọn họa tiết"
                      options={hoaTiet.map((item) => ({
                        value: item.id,
                        label: item.tenHoaTiet,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Danh mục"
                    name="danhMuc"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select
                      placeholder="Chọn danh mục"
                      options={danhMuc.map((item) => ({
                        value: item.id,
                        label: item.tenDanhMuc,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng"
                    name="soLuong"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số lượng' },
                      {
                        pattern: /^[1-9]\d*$/, // Chỉ chấp nhận số nguyên dương (≥ 1)
                        message: 'Số lượng phải là số nguyên dương',
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      min={1} // Chặn nhập số âm
                      step={1} // Chỉ cho nhập số nguyên, không có số thập phân
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '.' || e.key === 'e') {
                          e.preventDefault(); // Chặn nhập dấu "-" hoặc số thập phân
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giá (VND)"
                    name="gia"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá' },
                      {
                        pattern: /^[1-9]\d{0,14}$/, // Chỉ cho phép nhập từ 1 đến 15 chữ số
                        message: 'Giá phải là số hợp lệ và tối đa 15 chữ số',
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={999999999999999} // Giới hạn tối đa 15 số
                      formatter={(value) =>
                        value ? `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ` : ''
                      } // Thêm "đ" khi hiển thị
                      parser={(value) => value.replace(/[^0-9]/g, '')} // Chỉ lấy số khi nhập
                      onChange={(value) => {
                        if (value && value.toString().length > 15) return; // Chặn nhập quá 15 số
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Mô tả"
                    name="moTa"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                  >
                    <TextArea
                      rows={4} // Cài đặt chiều cao của TextArea
                      placeholder="Mô tả về sản phẩm"
                      maxLength={500} // Giới hạn ký tự nhập vào (nếu cần)
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Modal>

      <Modal
        open={isModalVisibleImage}
        closable={false}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={handleOKImage}>
              Xác nhận
            </Button>
          </div>,
        ]}
        width={900}
      >
        {/* Hàng hiển thị ảnh đã chọn */}
        <h3>Danh sách ảnh đã chọn</h3>
        {selectedImages.length > 0 ? (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px',
              overflowX: 'auto',
              borderBottom: '2px solid #ddd',
              marginBottom: '10px',
            }}
          >
            {selectedImages.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <CloseCircleOutlined
                  onClick={() => handleRemoveSelectedImage(image)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    zIndex: 10,
                    fontSize: '18px',
                    color: 'red',
                    cursor: 'pointer',
                  }}
                />
                <Image
                  src={image}
                  width={130}
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: '5px' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            <PictureOutlined style={{ fontSize: '50px', color: '#ccc' }} />
            <p style={{ marginTop: '10px' }}>Không có dữ liệu</p>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center', // Căn giữa theo chiều dọc
            justifyContent: 'space-between', // Đẩy hai phần tử ra hai bên
            marginBottom: '10px',
          }}
        >
          <h3 style={{ margin: 0 }}>Danh sách ảnh sản phẩm</h3>
          {/* Input file ẩn */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleUploadImage(e.target.files)}
          />

          {/* Nút "Thêm ảnh" */}
          <Button type="primary" icon={<PictureOutlined />} onClick={handleButtonAddImageClick}>
            Thêm ảnh
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '5px',
            padding: '10px',
            overflowX: 'auto',
            height: '350px',
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '130px',
                height: '155px',
                border: '2px dashed #1890ff', // Đường viền nét đứt
                borderRadius: '8px',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Checkbox góc trên bên phải */}
              <Checkbox
                checked={selectedImages.some((item) => item === img)}
                onChange={() => handleSelectImage(img)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  zIndex: 10,
                  borderRadius: '4px',
                  padding: '2px',
                }}
              />
              {/* Hiển thị ảnh */}
              <Image
                src={img}
                width={130}
                height={150}
                style={{ objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default SanPhamChiTiet;
