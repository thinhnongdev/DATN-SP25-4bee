import React, { useEffect, useRef, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Modal,
  Select,
  Space,
  Card,
  Table,
  Breadcrumb,
  InputNumber,
  Image,
  Checkbox,
  message,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { IoTrashBin } from 'react-icons/io5';
import {
  CloseCircleOutlined,
  EditOutlined,
  PictureOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
const { Option } = Select;
const DemoForm = () => {
  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const [sanPham, setSanPham] = useState([]);
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
  const [loadingSanPham, setLoadingSanPham] = useState(false);
  const [loadingChatLieu, setLoadingChatLieu] = useState(false);
  const [loadingKieuDang, setLoadingKieuDang] = useState(false);
  const [loadingThuongHieu, setLoadingThuongHieu] = useState(false);
  const [loadingKieuCuc, setLoadingKieuCuc] = useState(false);
  const [loadingKieuCoAo, setLoadingKieuCoAo] = useState(false);
  const [loadingKieuCoTayAo, setLoadingKieuCoTayAo] = useState(false);
  const [loadingKieuTuiAo, setLoadingKieuTuiAo] = useState(false);
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(false);
  const [loadingHoaTiet, setLoadingHoaTiet] = useState(false);
  const [loadingMauSac, setLoadingMauSac] = useState(false);
  const [loadingKichThuoc, setLoadingKichThuoc] = useState(false);
  const [loadingKieuTayAo, setLoadingKieuTayAo] = useState(false);
  const [isModalSanPhamVisible, setIsModalSanPhamVisible] = useState(false); // Hiển thị modal sản phẩm
  const [isModalChatLieuVisible, setIsModalChatLieuVisible] = useState(false); // Hiển thị modal chất liệu
  const [isModalKieuDangVisible, setIsModalKieuDangVisible] = useState(false); // Hiển thị modal kiểu dáng
  const [isModalThuongHieuVisible, setIsModalThuongHieuVisible] = useState(false); // Hiển thị modal thương hiệu
  const [isModalKieuCucVisible, setIsModalKieuCucVisible] = useState(false); // Hiển thị modal kiểu cúc
  const [isModalKieuCoAoVisible, setIsModalKieuCoAoVisible] = useState(false); // Hiển thị modal kiểu cổ áo
  const [isModalKieuCoTayAoVisible, setIsModalKieuCoTayAoVisible] = useState(false); // Hiển thị modal kiểu cổ tay áo
  const [isModalKieuTuiAoVisible, setIsModalKieuTuiAoVisible] = useState(false); // Hiển thị modal kiểu túi áo
  const [isModalKieuTayAoVisible, setIsModalKieuTayAoVisible] = useState(false); // Hiển thị modal kiểu tay áo
  const [isModalDanhMucVisible, setIsModalDanhMucVisible] = useState(false); // Hiển thị modal kiểu tay áo
  const [isModalHoaTietVisible, setIsModalHoaTietVisible] = useState(false); // Hiển thị modal kiểu tay áo
  const [isEditing, setIsEditing] = useState(false); // Chế độ thêm hoặc chỉnh sửa
  const [editingRecord, setEditingRecord] = useState(null); // Dữ liệu dòng đang chỉnh sửa
  const [form] = Form.useForm();
  const [formSanPham] = Form.useForm();
  const [formChatLieu] = Form.useForm();
  const [formKieuDang] = Form.useForm();
  const [formThuongHieu] = Form.useForm();
  const [formKieuCuc] = Form.useForm();
  const [formKieuCoAo] = Form.useForm();
  const [formKieuCoTayAo] = Form.useForm();
  const [formKieuTuiAo] = Form.useForm();
  const [formKieuTayAo] = Form.useForm();
  const [formDanhMuc] = Form.useForm();
  const [formHoaTiet] = Form.useForm();
  const [formEditSLGia] = Form.useForm();
  const [error, setError] = useState('');
  const [isModalVisibleColor, setIsModalVisibleColor] = useState(false);
  const [isModalVisibleSizes, setIsModalVisibleSizes] = useState(false);
  const [isModalVisibleImage, setIsModalVisibleImage] = useState(false);
  const [isModalEditSanPhamVisible, setIsModalEditSanPhamVisible] = useState(false); 
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedColorForEdit, setSelectedColorColorForEdit] = useState("");
  // State để lưu màu sắc và kích thước đã chọn
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [danhSachBienThe, setDanhSachBienThe] = useState([]);
  const [currentColor, setCurrentColor] = useState(''); // Màu hiện tại
  const navigate = useNavigate();
  
  // Gọi API để lấy danh sách sản phẩm

  const fileInputRef = useRef(null); // Tạo tham chiếu đến input file

  // Lọc danh sách ảnh theo màu
  const filteredImages = currentColor
    ? selectedImages.filter(({ color }) => color === currentColor)
    : selectedImages;
  const handleButtonAddImageClick = () => {
    fileInputRef.current.click(); // Mở hộp thoại chọn file khi nhấn nút
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

  const handleSelectImage = (img) => {
    setSelectedImages((prev) => {
      const exists = prev.find((item) => item.image === img && item.color === currentColor);

      if (exists) {
        // Bỏ chọn nếu ảnh có cùng màu đã tồn tại
        return prev.filter((item) => !(item.image === img && item.color === currentColor));
      } else {
        // Kiểm tra giới hạn 3 ảnh cùng màu
        const imagesOfColor = prev.filter((item) => item.color === currentColor);
        if (imagesOfColor.length >= 3) {
          toast.warning(`Chỉ được chọn tối đa 3 ảnh cho màu ${currentColor}!`);
          return prev;
        }

        return [...prev, { image: img, color: currentColor }];
      }
    });
  };
  // Xử lý xóa ảnh khỏi danh sách đã chọn
  const handleRemoveSelectedImage = (img) => {
    setSelectedImages((prevSelected) => prevSelected.filter((item) => item !== img));
  };
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/imagesSanPham'); // Gọi API từ backend
        setImages(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách ảnh:', error);
      }
    };

    fetchImages();
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingSanPham(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/sanpham');
        setSanPham(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      } finally {
        setLoadingSanPham(false);
      }
    };

    fetchUsers();
  }, []);

  // Gọi API để lấy danh sách chất liệu
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingChatLieu(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/chatlieu');
        setChatLieu(response.data);
        // Tự động chọn phần tử đầu tiên nếu có dữ liệu
        if (response.data.length > 0) {
          const firstChatLieu = response.data[0];
          form.setFieldsValue({ chatLieu: firstChatLieu.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstChatLieu.id, 'chatLieu'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chất liệu:', error);
      } finally {
        setLoadingChatLieu(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu dáng
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuDang(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieudang');
        setKieuDang(response.data);
        if (response.data.length > 0) {
          const firstKieuDang = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuDang.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuDang.id, 'kieuDang'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu dáng:', error);
      } finally {
        setLoadingKieuDang(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách thương hiệu
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingThuongHieu(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/thuonghieu');
        setThuongHieu(response.data);
        if (response.data.length > 0) {
          const firstThuongHieu = response.data[0];
          form.setFieldsValue({ chatLieu: firstThuongHieu.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstThuongHieu.id, 'thuongHieu'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thương hiệu:', error);
      } finally {
        setLoadingThuongHieu(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cúc
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuCuc(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucuc');
        setKieuCuc(response.data);
        if (response.data.length > 0) {
          const firstKieuCuc = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuCuc.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuCuc.id, 'kieuCuc'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cúc:', error);
      } finally {
        setLoadingKieuCuc(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ áo
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuCoAo(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucoao');
        setKieuCoAo(response.data);
        if (response.data.length > 0) {
          const firstKieuCoAo = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuCoAo.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuCoAo.id, 'kieuCoAo'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cổ áo:', error);
      } finally {
        setLoadingKieuCoAo(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuCoTayAo(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieucotayao');
        setKieuCoTayAo(response.data);
        if (response.data.length > 0) {
          const firstKieuCoTayAo = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuCoTayAo.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuCoTayAo.id, 'kieuCoTayAo'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu cổ tay áo:', error);
      } finally {
        setLoadingKieuCoTayAo(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu túi áo
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuTuiAo(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieutuiao');
        setKieuTuiAo(response.data);
        if (response.data.length > 0) {
          const firstKieuTuiAo = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuTuiAo.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuTuiAo.id, 'kieuTuiAo'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu túi áo:', error);
      } finally {
        setLoadingKieuTuiAo(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKieuTayAo(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kieutayao');
        setKieuTayAo(response.data);
        if (response.data.length > 0) {
          const firstKieuTayAo = response.data[0];
          form.setFieldsValue({ chatLieu: firstKieuTayAo.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstKieuTayAo.id, 'kieuTayAo'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kiểu tay áo:', error);
      } finally {
        setLoadingKieuTayAo(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách danh mục
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingDanhMuc(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/danhmuc');
        setDanhMuc(response.data);
        if (response.data.length > 0) {
          const firstDanhMuc = response.data[0];
          form.setFieldsValue({ danhMuc: firstDanhMuc.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstDanhMuc.id, 'danhMuc'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      } finally {
        setLoadingDanhMuc(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách danh mục
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingHoaTiet(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/hoatiet');
        setHoaTiet(response.data);
        if (response.data.length > 0) {
          const firstHoaTiet = response.data[0];
          form.setFieldsValue({ hoaTiet: firstHoaTiet.id }); // Đặt giá trị vào form
          handleChangeProductDetail(firstHoaTiet.id, 'hoaTiet'); // Gọi xử lý cập nhật
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      } finally {
        setLoadingHoaTiet(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách màu sắc
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingMauSac(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/mausac');
        setColors(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách màu sắc:', error);
      } finally {
        setLoadingMauSac(false);
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingKichThuoc(true);
      try {
        const response = await axios.get('http://localhost:8080/api/admin/kichthuoc');
        setSizes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kích thước:', error);
      } finally {
        setLoadingKichThuoc(false);
      }
    };

    fetchUsers();
  }, []);
  const sendProductVariantsToServer = async (danhSachBienThe) => {
    const danhSachBienTheMoi = danhSachBienThe.map((bienThe) => ({
      ...bienThe, // Sao chép toàn bộ thuộc tính khác
      mauSac: bienThe.mauSac.name, // Chỉ lấy giá trị `name` của `mauSac`
    }));
    // Gộp ảnh vào từng sản phẩm chi tiết theo `mauSac`
    const dataToSend = danhSachBienTheMoi.map((bienThe) => ({
      ...bienThe,
      images: selectedImages
        .filter((img) => img.color === bienThe.mauSac) // Chỉ lấy ảnh đúng màu
        .map((img) => img.image), // Chỉ lấy đường dẫn ảnh
    }));
    try {
      const response = await axios.post(
        'http://localhost:8080/api/admin/sanpham/addsanphamchitiet',
        dataToSend,
      );
      console.log('Dữ liệu đã gửi thành công:', response.data);
      console.log('Dữ liệu gửi đi thành công:', dataToSend);
      navigate('/sanpham');
      toast.success('Thêm sản phẩm thành công');
    } catch (error) {
      console.log('Dữ liệu thất bại:', dataToSend);
      console.error('Lỗi khi gửi dữ liệu:', error);
      toast.error('Thêm sản phẩm thất bại');
    }
  };
  const handleSendVariants = () => {
    // Kiểm tra nếu danh sách biến thể trống
    if (!danhSachBienThe || danhSachBienThe.length === 0) {
      toast.error('Danh sách biến thể trống! Vui lòng thêm sản phẩm.');
      return;
    }

    // Kiểm tra xem có bất kỳ biến thể nào bị thiếu dữ liệu quan trọng không
    const missingFields = danhSachBienThe.some(
      (bienThe) => !bienThe.tenSanPham || !bienThe.gia || !bienThe.soLuong,
    );

    if (missingFields) {
      toast.error('Có biến thể thiếu dữ liệu! Vui lòng kiểm tra lại.');
      return;
    }

    // Kiểm tra ảnh có đầy đủ cho từng biến thể không
    const missingImages = danhSachBienThe.some(
      (bienThe) => selectedImages.filter((img) => img.color === bienThe.mauSac.name).length === 0,
    );

    if (missingImages) {
      toast.error('Có biến thể chưa có ảnh! Vui lòng chọn ảnh cho từng màu.');
      return;
    }
    sendProductVariantsToServer(danhSachBienThe);
  };
  const showModalImage = () => {
    setIsModalVisibleImage(true);
  };
  const handleCancelImage = () => {
    setIsModalVisibleImage(false);
    setSelectedImages([]);
  };
  const handleOKImage = () => {
    setIsModalVisibleImage(false);
  };
  const showModalColor = () => {
    setIsModalVisibleColor(true);
  };

  const handleCancelColor = () => {
    setIsModalVisibleColor(false);
  };
  const showModalSize = () => {
    setIsModalVisibleSizes(true);
  };

  const handleCancelSize = () => {
    setIsModalVisibleSizes(false);
  };
  const showModalEditSoLuongVaGia = (color) => {
    formEditSLGia.resetFields();
    setSelectedColorColorForEdit(color); // Lưu màu sắc đang chỉnh sửa
  // const selectedVariant = danhSachBienThe.find((item) => item.mauSac.name === color);

  // formEditSLGia.setFieldsValue({
  //   soLuong: selectedVariant?.soLuong || 0,
  //   gia: selectedVariant?.gia || 0,
  // });
  setIsModalEditSanPhamVisible(true);
  };
  
  const handleSaveSoLuongVaGia = () => {
    formEditSLGia
      .validateFields()
      .then((values) => {
        // Kiểm tra dữ liệu nhập
        if (values.soLuong < 0 || !Number.isInteger(values.soLuong)) {
          message.error('Số lượng phải là số nguyên không âm');
          return;
        }
        if (values.gia < 0) {
          message.error('Giá phải là số không âm');
          return;
        }
  
        // Nếu dữ liệu hợp lệ, cập nhật danhSachBienThe
        setDanhSachBienThe((prev) =>
          prev.map((bienThe) =>
            bienThe.mauSac.name === selectedColorForEdit
              ? { ...bienThe, soLuong: values.soLuong, gia: values.gia }
              : bienThe
          )
        );
  
        setIsModalEditSanPhamVisible(false);
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };
  
  
  // Kiểm tra danhSachBienThe sau khi cập nhật
  useEffect(() => {
    console.log('🔄 danhSachBienThe đã cập nhật:', danhSachBienThe);
  }, [danhSachBienThe]);
  
 
  
  
  const handleCancelSoLuongVaGia = () => {
    setIsModalEditSanPhamVisible(false);
  };

  const showAddSanPhamModal = () => {
    setIsModalSanPhamVisible(true);
    formSanPham.setFields([]); // Xóa lỗi
    formSanPham.resetFields(); // Reset giá trị form
  };
  // Đóng modal
  const handleModalSanPhamClose = () => {
    setIsModalSanPhamVisible(false);
    setEditingRecord(null);
    formSanPham.setFields([]); // Xóa lỗi
    formSanPham.resetFields(); // Reset giá trị form
  };

  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSaveSanPham = async () => {
    try {
      let values = await formSanPham.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenSanPham = values.tenSanPham.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenSanPham.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = sanPham.some(
        (cl) =>
          cl.tenSanPham.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên sản phẩm đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/sanpham/${editingRecord.id}`, values);
        setSanPham((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addsanpham', values);
        setSanPham((prev) => [ response.data, ...prev]);
      }

      handleModalSanPhamClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddChatLieuModal = () => {
    setIsModalChatLieuVisible(true);
    formChatLieu.setFields([]); // Xóa lỗi
    formChatLieu.resetFields(); // Reset giá trị form
  };
  // Đóng modal
  const handleModalChatLieuClose = () => {
    setIsModalChatLieuVisible(false);
    setEditingRecord(null);
    formChatLieu.setFields([]); // Xóa lỗi
    formChatLieu.resetFields(); // Reset giá trị form
  };
  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSaveChatLieu = async () => {
    try {
      let values = await formChatLieu.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenChatLieu = values.tenChatLieu.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenChatLieu.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = chatLieu.some(
        (cl) =>
          cl.tenChatLieu.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên kích thước đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/chatlieu/${editingRecord.id}`, values);
        setChatLieu((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa chất liệu thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addchatlieu', values);
        setChatLieu((prev) => [response.data, ...prev]);
        toast.success('Thêm chất liệu thành công');
      }

      handleModalChatLieuClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const showAddKieuDangModal = () => {
    formKieuDang.resetFields(); // Xóa form cũ
    setIsModalKieuDangVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalKieuDangClose = () => {
    formKieuDang.resetFields();
    setIsModalKieuDangVisible(false);
    setEditingRecord(null);
  };
  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSaveKieuDang = async () => {
    try {
      let values = await formKieuDang.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuDang = values.tenKieuDang.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuDang.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kiểu dáng
      const isDuplicate = kieuDang.some(
        (cl) =>
          cl.tenKieuDang.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên kiểu dáng đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/kieudang/${editingRecord.id}`, values);
        setKieuDang((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu dáng thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieudang', values);
        setKieuDang((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu dáng thành công');
      }

      handleModalKieuDangClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddThuongHieuModal = () => {
    formThuongHieu.resetFields(); // Xóa form cũ
    setIsModalThuongHieuVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalThuongHieuClose = () => {
    setIsModalThuongHieuVisible(false);
    setEditingRecord(null);
    formThuongHieu.resetFields();
    setError('');
  };
  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSaveThuongHieu = async () => {
    try {
      let values = await formThuongHieu.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenThuongHieu = values.tenThuongHieu.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenThuongHieu.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên thương hiệu
      const isDuplicate = thuongHieu.some(
        (cl) =>
          cl.tenThuongHieu.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên thương hiệu đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/thuonghieu/${editingRecord.id}`, values);
        setThuongHieu((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa thương hiệu thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addthuonghieu', values);
        setThuongHieu((prev) => [response.data, ...prev]);
        toast.success('Thêm thương hiệu thành công');
      }

      handleModalThuongHieuClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const showAddKieuCucModal = () => {
    formKieuCuc.resetFields(); // Xóa form cũ
    setIsModalKieuCucVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalKieuCucClose = () => {
    setIsModalKieuCucVisible(false);
    setEditingRecord(null);
    formKieuCuc.resetFields();
    setError('');
  };
  const handleKieuCucSave = async () => {
    try {
      let values = await formKieuCuc.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuCuc = values.tenKieuCuc.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuCuc.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kiểu cúc
      const isDuplicate = kieuCuc.some(
        (cl) =>
          cl.tenKieuCuc.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên kiểu cúc đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/kieucuc/${editingRecord.id}`, values);
        setKieuCuc((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu cúc thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieucuc', values);
        setKieuCuc((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu cúc thành công');
      }

      handleModalKieuCucClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const showAddKieuCoAoModal = () => {
    formKieuCoAo.resetFields(); // Xóa form cũ
    setIsModalKieuCoAoVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalKieuCoAoClose = () => {
    setIsModalKieuCoAoVisible(false);
    setEditingRecord(null);
    formKieuCoAo.resetFields();
    setError('');
  };
  const handleKieuCoAoSave = async () => {
    try {
      let values = await formKieuCoAo.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuCoAo = values.tenKieuCoAo.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuCoAo.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = kieuCoAo.some(
        (cl) =>
          cl.tenKieuCoAo.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên cổ áo đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/kieucoao/${editingRecord.id}`, values);
        setKieuCoAo((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu cổ áo thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieucoao', values);
        setKieuCoAo((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu cổ áo thành công');
      }

      handleModalKieuCoAoClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddKieuCoTayAoModal = () => {
    formKieuCoTayAo.resetFields(); // Xóa form cũ
    setIsModalKieuCoTayAoVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalKieuCoTayAoClose = () => {
    setIsModalKieuCoTayAoVisible(false);
    setEditingRecord(null);
    formKieuCoTayAo.resetFields();
    setError('');
  };
  const handleKieuCoTayAoSave = async () => {
    try {
      let values = await formKieuCoTayAo.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuCoTayAo = values.tenKieuCoTayAo.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuCoTayAo.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = kieuCoTayAo.some(
        (cl) =>
          cl.tenKieuCoTayAo.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên cổ tay áo đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(
          `http://localhost:8080/api/admin/kieucotayao/${editingRecord.id}`,
          values,
        );
        setKieuCoTayAo((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu cổ tay áo thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieucotayao', values);
        setKieuCoTayAo((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu cổ tay áo thành công');
      }

      handleModalKieuCoTayAoClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddKieuTuiAoModal = () => {
    formKieuTuiAo.resetFields(); // Xóa form cũ
    setIsModalKieuTuiAoVisible(true);
    setError('');
  };
  // Đóng modal
  const handleModalKieuTuiAoClose = () => {
    setIsModalKieuTuiAoVisible(false);
    setEditingRecord(null);
    formKieuTuiAo.resetFields();
    setError('');
  };
  const handleKieuTuiAoSave = async () => {
    try {
      let values = await formKieuTuiAo.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuTuiAo = values.tenKieuTuiAo.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuTuiAo.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kiểu túi áo
      const isDuplicate = kieuTuiAo.some(
        (cl) =>
          cl.tenKieuTuiAo.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên kiểu túi áo đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/kieutuiao/${editingRecord.id}`, values);
        setKieuTuiAo((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu túi áo thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieutuiao', values);
        setKieuTuiAo((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu túi áo thành công');
      }

      handleModalKieuTuiAoClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddKieuTayAoModal = () => {
    formKieuTayAo.resetFields(); // Xóa form cũ
    setIsModalKieuTayAoVisible(true);
  };
  // Đóng modal
  const handleModalKieuTayAoClose = () => {
    setIsModalKieuTayAoVisible(false);
    setEditingRecord(null);
    formKieuTayAo.resetFields();
  };
  const handleKieuTayAoSave = async () => {
    try {
      let values = await formKieuTayAo.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenKieuTayAo = values.tenKieuTayAo.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenKieuTayAo.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kiểu tay áo
      const isDuplicate = kieuTayAo.some(
        (cl) =>
          cl.tenKieuTayAo.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên kiểu tay áo đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/kieutayao/${editingRecord.id}`, values);
        setKieuTayAo((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa kiểu tay áo thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addkieutayao', values);
        setKieuTayAo((prev) => [response.data, ...prev]);
        toast.success('Thêm kiểu tay áo thành công');
      }

      handleModalKieuTayAoClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const showAddHoaTietModal = () => {
    formHoaTiet.resetFields(); // Xóa form cũ
    setIsModalHoaTietVisible(true);
  };
  // Đóng modal
  const handleModalHoaTietClose = () => {
    setIsModalHoaTietVisible(false);
    setEditingRecord(null);
    formHoaTiet.resetFields();
  };
  const handleHoaTietSave = async () => {
    try {
      let values = await formHoaTiet.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenHoaTiet = values.tenHoaTiet.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenHoaTiet.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = hoaTiet.some(
        (cl) =>
          cl.tenHoaTiet.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên họa tiết đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/hoatiet/${editingRecord.id}`, values);
        setHoaTiet((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa họa tiết thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addhoatiet', values);
        setHoaTiet((prev) => [response.data, ...prev]);
        toast.success('Thêm họa tiết thành công');
      }

      handleModalHoaTietClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const showAddDanhMucModal = () => {
    formDanhMuc.resetFields(); // Xóa form cũ
    setIsModalDanhMucVisible(true);
  };
  // Đóng modal
  const handleModalDanhMucClose = () => {
    setIsModalDanhMucVisible(false);
    setEditingRecord(null);
    formDanhMuc.resetFields();
  };
  const handleDanhMucSave = async () => {
    try {
      let values = await formDanhMuc.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenDanhMuc = values.tenDanhMuc.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenDanhMuc.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên kích thước
      const isDuplicate = danhMuc.some(
        (cl) =>
          cl.tenDanhMuc.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên danh mục đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/danhmuc/${editingRecord.id}`, values);
        setDanhMuc((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa danh mục thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/adddanhmuc', values);
        setDanhMuc((prev) => [response.data, ...prev]);
        toast.success('Thêm danh mục thành công');
      }

      handleModalDanhMucClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleButtonColorClick = (colorName, colorCode) => {
    if (!colorName || !colorCode) return; // Chặn nếu thiếu dữ liệu

    const isDuplicate = selectedColors.some((item) => item?.code === colorCode);

    if (!isDuplicate) {
      setSelectedColors([...selectedColors, { name: colorName, code: colorCode }]);
    }
  };
  const handleRemoveColor = (index) => {
    const updatedColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(updatedColors); // Cập nhật lại danh sách
  };

  const handleButtonSizeClick = (size) => {
    // Kiểm tra nếu màu đã tồn tại trong danh sách thì không thêm lại
    if (!selectedSizes.includes(size)) {
      setSelectedSizes([...selectedSizes, size]);
    }
  };
  const handleRemoveSize = (index) => {
    const updatedSize = selectedSizes.filter((_, i) => i !== index);
    setSelectedSizes(updatedSize); // Cập nhật lại danh sách
  };

  const [productDetail, setProductDetail] = useState({});
  const handleChangeProductDetail = (value, key) => {
    // Cập nhật giá trị theo key
    setProductDetail((prevDetail) => ({
      ...prevDetail,
      [key]: value, // Gán giá trị mới cho key tương ứng
    }));
  };
  const taoBienTheChoSanPham = (productDetail, selectedColors, selectedSizes) => {
    const bienThe = [];

    selectedColors.forEach((mauSac) => {
      selectedSizes.forEach((size) => {
        // Tạo một biến thể từ màu sắc và kích thước
        bienThe.push({
          ...productDetail, // Sao chép các thuộc tính chung của sản phẩm
          mauSac, // Màu sắc của biến thể
          size, // Kích thước của biến thể
          gia: 200000, // Giá mặc định (có thể thay đổi sau)
          soLuong: 50, // Số lượng mặc định (có thể thay đổi sau)
        });
      });
    });
    console.log('danh sách biến thể:' + bienThe);
    return bienThe;
  };

  // Gọi hàm
  // Hàm xóa biến thể theo màu sắc và kích thước
  const xoaBienThe = (mauSacToXoa, sizeToXoa) => {
    const danhSachBienTheMoi = danhSachBienThe.filter(
      (bienThe) => bienThe.mauSac !== mauSacToXoa || bienThe.size !== sizeToXoa,
    );
    setDanhSachBienThe(danhSachBienTheMoi); // Cập nhật lại danh sách biến thể
  };

  // Tạo danh sách biến thể khi component render
  React.useEffect(() => {
    const bienThe = taoBienTheChoSanPham(productDetail, selectedColors, selectedSizes);
    setDanhSachBienThe(bienThe);
  }, [productDetail, selectedColors, selectedSizes]);

  const renderColorButtons = () => {
    return colors.map((colors, index) => (
      <Button
        key={index}
        onClick={() => handleButtonColorClick(colors.tenMau, colors.maMau)}
        style={{
          margin: '5px',
          height: '30px',
          borderRadius: '4px',
          backgroundColor: colors.maMau,
          border: '1px solid #f0f0f0',
        }}
      >
        {colors.tenMau}
      </Button>
    ));
  };
  const renderSizeButtons = () => {
    return sizes.map((sizes, index) => (
      <Button
        key={index}
        onClick={() => handleButtonSizeClick(sizes.tenKichThuoc)}
        style={{ margin: '5px' }}
      >
        {sizes.tenKichThuoc}
      </Button>
    ));
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index', // Không cần thuộc tính cụ thể trong dữ liệu
      key: 'index',
      render: (text, record, index) => index + 1, // Tính số thứ tự dựa trên chỉ mục
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      render: (text, record) => (
        <InputNumber
          value={record.soLuong} // Controlled: lấy từ state
          min={0} // Chỉ cho phép số >= 0
          step={1} // Chỉ tăng/giảm từng đơn vị
          parser={(value) => value.replace(/[^0-9]/g, '')} // Xóa ký tự không phải số
          onChange={(value) => {
            if (value < 0 || !Number.isInteger(value)) return; // Không cập nhật nếu sai định dạng
            handleQuantityChange(value, record);
          }}
          style={{ width: '150px' }}
        />
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'gia',
      key: 'gia',
      render: (text, record) => (
        <InputNumber
        value={record.gia} // Controlled: lấy từ state
        min={0}
        max={999999999999999}
        formatter={(value) =>
          value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ" : ""
        }
        parser={(value) => value.replace(/\D/g, "")} // Xóa tất cả ký tự không phải số
        onChange={(value) => handlePriceChange(value, record)}
        style={{ width: "200px" }}
      />
      
      ),
    },
    {
      title: 'Hành Động',
      render: (text, record) => (
        <Button type="submit" onClick={() => xoaBienThe(record.mauSac, record.size)}>
          <IoTrashBin size={24} />
        </Button>
      ),
    },
  ];

  const handleQuantityChange = (newQuantity, record) => {
    // Tìm và cập nhật biến thể tương ứng với mã màu sắc và kích thước
    const updatedList = danhSachBienThe.map((bienThe) => {
      if (bienThe.mauSac === record.mauSac && bienThe.size === record.size) {
        return { ...bienThe, soLuong: parseInt(newQuantity, 10) }; // Cập nhật số lượng
      }
      return bienThe;
    });

    // Cập nhật lại danh sách biến thể với giá trị mới
    setDanhSachBienThe(updatedList);
  };
  const handlePriceChange = (newPrice, record) => {
    // Tìm và cập nhật biến thể tương ứng với mã màu sắc và kích thước
    const updatedList = danhSachBienThe.map((bienThe) => {
      if (bienThe.mauSac === record.mauSac && bienThe.size === record.size) {
        return { ...bienThe, gia: parseInt(newPrice, 10) }; // Cập nhật giá
      }
      return bienThe;
    });

    // Cập nhật lại danh sách biến thể với giá trị mới
    setDanhSachBienThe(updatedList);
  };
  console.log(danhSachBienThe);

  const [filteredData, setFilteredData] = useState({}); 

  useEffect(() => {
    const newFilteredData = selectedColors.reduce((acc, color) => {
      const filteredItems = danhSachBienThe
        .filter((bienThe) => bienThe.mauSac.name === color.name)
        .filter((bienThe) => bienThe.tenSanPham);
  
      return { ...acc, [color.name]: filteredItems };
    }, {});
  
    setFilteredData(newFilteredData);
  }, [danhSachBienThe, selectedColors]); // Cập nhật khi danh sách biến thể hoặc màu sắc thay đổi
  


  const showConfirm = () => {
    Modal.confirm({
      title: 'Xác nhận thêm mới',
      content: 'Bạn có chắc chắn muốn thêm sản phẩm mới không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk() {
        handleSendVariants();
      },
      onCancel() {},
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column', // Xếp chồng form theo chiều dọc
        justifyContent: 'flex-start', // Căn form từ trên xuống
        gap: '16px', // Khoảng cách giữa các form
        overflowY: 'auto', // Kích hoạt cuộn dọc khi nội dung quá dài
      }}
    >
      <Breadcrumb
        style={{
          fontSize: '15px',
          fontWeight: 'bold',
        }}
      >
        <Breadcrumb.Item>
          <Link to="/sanpham">Sản phẩm</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Thêm sản phẩm</Breadcrumb.Item>
      </Breadcrumb>

      <Form
        onFinish={onFinish}
        layout="vertical"
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <h2>Thông tin sản phẩm</h2>
        </Row>
        <Row gutter={16} style={{ justifyContent: 'center' }}>
          <Col span={16}>
            <Form.Item
              name="sanPham"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập sản phẩm!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn sản phẩm"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingSanPham}
                  onChange={(value) => handleChangeProductDetail(value, 'tenSanPham')}
                >
                  {sanPham.map((sanPham) => (
                    <Option key={sanPham.id} value={sanPham.tenSanPham}>
                      {sanPham.tenSanPham}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddSanPhamModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={8}>
            <Form.Item
              name="chatLieu"
              label="Chất liệu"
              rules={[{ required: true, message: 'Vui lòng nhập chất liệu!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn chất liệu"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingChatLieu}
                  value={productDetail.chatLieu}
                  onChange={(value) => handleChangeProductDetail(value, 'chatLieu')}
                >
                  {chatLieu.map((chatLieu) => (
                    <Option key={chatLieu.id} value={chatLieu.id}>
                      {chatLieu.tenChatLieu}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddChatLieuModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="kieuDang"
              label="Kiểu dáng"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu dáng!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu dáng"
                  style={{ width: 'calc(99% - 40px)' }}
                  value={productDetail.kieuDang}
                  loading={loadingKieuDang}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuDang')}
                >
                  {kieuDang.map((kieuDang) => (
                    <Option key={kieuDang.id} value={kieuDang.id}>
                      {kieuDang.tenKieuDang}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuDangModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={8}>
            <Form.Item
              name="thuongHieu"
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng nhập thương hiệu!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn thương hiệu"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingThuongHieu}
                  value={productDetail.thuongHieu}
                  onChange={(value) => handleChangeProductDetail(value, 'thuongHieu')}
                >
                  {thuongHieu.map((thuongHieu) => (
                    <Option key={thuongHieu.id} value={thuongHieu.id}>
                      {thuongHieu.tenThuongHieu}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddThuongHieuModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="kieuCuc"
              label="Kiểu cúc"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu cúc!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu cúc"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingKieuCuc}
                  value={productDetail.kieuCuc}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuCuc')}
                >
                  {kieuCuc.map((kieuCuc) => (
                    <Option key={kieuCuc.id} value={kieuCuc.id}>
                      {kieuCuc.tenKieuCuc}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuCucModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={8}>
            <Form.Item
              name="kieuCoAo"
              label="Kiểu cổ áo"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu cổ áo!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu cổ áo"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingKieuCoAo}
                  value={productDetail.kieuCoAo}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuCoAo')}
                >
                  {kieuCoAo.map((kieuCoAo) => (
                    <Option key={kieuCoAo.id} value={kieuCoAo.id}>
                      {kieuCoAo.tenKieuCoAo}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuCoAoModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="kieuCoTayAo"
              label="Kiểu cổ tay áo"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu cổ tay áo!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu cổ tay áo"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingKieuCoTayAo}
                  value={productDetail.kieuCoTayAo}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuCoTayAo')}
                >
                  {kieuCoTayAo.map((kieuCoTayAo) => (
                    <Option key={kieuCoTayAo.id} value={kieuCoTayAo.id}>
                      {kieuCoTayAo.tenKieuCoTayAo}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuCoTayAoModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={8}>
            <Form.Item
              name="kieuTuiAo"
              label="Kiểu túi áo"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu túi áo!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu túi áo"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingKieuTuiAo}
                  value={productDetail.kieuTuiAo}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuTuiAo')}
                >
                  {kieuTuiAo.map((kieuTuiAo) => (
                    <Option key={kieuTuiAo.id} value={kieuTuiAo.id}>
                      {kieuTuiAo.tenKieuTuiAo}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuTuiAoModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="kieuTayAo"
              label="Kiểu tay áo"
              rules={[{ required: true, message: 'Vui lòng nhập kiểu tay áo!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu tay áo"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingKieuTayAo}
                  value={productDetail.kieuTayAo}
                  onChange={(value) => handleChangeProductDetail(value, 'kieuTayAo')}
                >
                  {kieuTayAo.map((kieuTayAo) => (
                    <Option key={kieuTayAo.id} value={kieuTayAo.id}>
                      {kieuTayAo.tenKieuTayAo}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddKieuTayAoModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={8}>
            <Form.Item
              name="danhMuc"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn Danh mục"
                  style={{ width: 'calc(99% - 40px)' }}
                  loading={loadingDanhMuc}
                  value={productDetail.danhMuc}
                  onChange={(value) => handleChangeProductDetail(value, 'danhMuc')}
                >
                  {danhMuc.map((danhMuc) => (
                    <Option key={danhMuc.id} value={danhMuc.id}>
                      {danhMuc.tenDanhMuc}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddDanhMucModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hoaTiet"
              label="Kiểu họa tiết"
              rules={[{ required: true, message: 'Vui lòng chọn kiểu họa tiết!' }]}
            >
              <Input.Group compact>
                <Select
                  placeholder="Chọn kiểu họa tiết"
                  style={{ width: 'calc(99% - 40px)' }}
                  value={productDetail.hoaTiet}
                  loading={loadingKieuDang}
                  onChange={(value) => handleChangeProductDetail(value, 'hoaTiet')}
                >
                  {hoaTiet.map((hoaTiet) => (
                    <Option key={hoaTiet.id} value={hoaTiet.id}>
                      {hoaTiet.tenHoaTiet}
                    </Option>
                  ))}
                </Select>
                <Button type="default" style={{ border: '2px solid #1890ff', color: '#1890ff' }} onClick={() => showAddHoaTietModal()}>
                  +
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <Col span={16}>
            <Form.Item>
              <TextArea
                rows={3}
                placeholder="Mô tả"
                maxLength={200}
                onChange={(e) => handleChangeProductDetail(e.target.value, 'moTa')}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Form
        onFinish={onFinish}
        layout="horizontal"
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Row gutter={20} style={{ justifyContent: 'center' }}>
          <h2>Màu sắc & kích thước</h2>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'start' }}>
          <Col span={16} style={{ paddingLeft: 200 }}>
            <Form.Item label="Màu sắc">
              {/* Hiển thị màu sắc đã chọn */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                {selectedColors.map((color, index) => (
                  <span
                    key={color.code}
                    style={{
                      display: 'inline-block',
                      margin: '5px',
                      padding: '5px 10px',
                      backgroundColor: color.code,
                      borderRadius: '5px',
                      position: 'relative',
                    }}
                  >
                    {color.name}
                    {/* Nút xóa */}
                    <span
                      onClick={() => handleRemoveColor(index)} // Hàm xử lý xóa màu
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'red',
                        color: 'white',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✕
                    </span>
                  </span>
                ))}
                {/* Nút thêm màu mới */}
                <Button
                  type="primary"
                  style={{
                    marginTop: '4px',
                    marginLeft: '28px',
                  }}
                  onClick={showModalColor}
                >
                  +
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ justifyContent: 'start' }}>
          <Col span={16} style={{ paddingLeft: 200 }}>
            <Form.Item label="Kích thước">
              {/* Hiển thị kích thước đã chọn */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                {selectedSizes.map((size, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      margin: '5px',
                      padding: '5px 10px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '5px',
                      position: 'relative',
                    }}
                  >
                    {size}
                    {/* Nút xóa */}
                    <span
                      onClick={() => handleRemoveSize(index)} // Hàm xử lý kích thước
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'red',
                        color: 'white',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✕
                    </span>
                  </span>
                ))}
              </div>
              {/* Nút thêm kích thước mới */}
              <Button
                type="primary"
                style={{
                  marginTop: '4px',
                  marginLeft: '14px',
                }}
                onClick={showModalSize}
              >
                +
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Space direction="vertical">
        {selectedColors.map((color) => {
          // Lọc biến thể theo màu sắc
          const dataSource = filteredData[color.name] || [];

          return dataSource.length > 0 ? (
            <Card
              title={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{`Danh sách các sản phẩm màu: ${color.name}`}</span>
                  <Button type="primary" icon={<EditOutlined />} onClick={() =>showModalEditSoLuongVaGia(color.name)}>
                    Chỉnh sửa tất cả
                  </Button> 
                </div>
              }
              key={color.name}
              style={{ width: '100%' }}
            >
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                rowKey={(record) => `${record.mauSac}-${record.size}`}
                locale={{ emptyText: 'Không có dữ liệu' }}
              />
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  border: '1px solid #d9d9d9', // Thêm đường viền màu xám nhạt
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  marginTop: '24px', // Tăng khoảng cách phía trên để tách biệt hơn
                  padding: '16px', // Thêm khoảng đệm bên trong
                  backgroundColor: '#fafafa', // Màu nền nhạt để phân biệt
                }}
                key={color}
              >
                {/* Lọc danh sách ảnh theo màu */}
                {selectedImages.filter((img) => img.color === color.name).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {selectedImages
                      .filter((img) => img.color === color.name)
                      .map(({ image }, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Ảnh sản phẩm màu ${color.name} ${index + 1}`}
                          style={{
                            width: '120px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            margin: '8px',
                          }}
                        />
                      ))}
                  </div>
                ) : (
                  <p>Chưa có ảnh cho màu này</p>
                )}

                <Button
                  onClick={() => {
                    setCurrentColor(color.name); // Cập nhật màu hiện tại
                    showModalImage(); // Mở modal tải ảnh
                  }}
                  icon={<UploadOutlined />}
                >
                  Tải lên ảnh
                </Button>
              </div>
            </Card>
          ) : null; // Không render nếu không có dữ liệu hợp lệ
        })}
      </Space>

      <Modal
        title={isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        open={isModalSanPhamVisible}
        onCancel={handleModalSanPhamClose}
        onOk={handleSaveSanPham}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formSanPham} layout="vertical">
          <Form.Item
            name="tenSanPham"
            label="Tên sản phẩm"
            rules={[
              { max: 50, message: 'Tên sản phẩm không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên sản phẩm!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = sanPham.some((cl) => {
                    const normalizedExisting = cl.tenSanPham.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên sản phẩm đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa chất liệu' : 'Thêm chất liệu'}
        open={isModalChatLieuVisible}
        onCancel={handleModalChatLieuClose}
        onOk={handleSaveChatLieu}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formChatLieu} layout="vertical">
          <Form.Item
            name="tenChatLieu"
            label="Tên chất liệu"
            rules={[
              { max: 50, message: 'Tên chất liệu không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên chất liệu!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = chatLieu.some((cl) => {
                    const normalizedExisting = cl.tenChatLieu.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên chất liệu đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên chất liệu"/>
          </Form.Item>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu dáng' : 'Thêm kiểu dáng'}
        open={isModalKieuDangVisible}
        onCancel={handleModalKieuDangClose}
        onOk={handleSaveKieuDang}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuDang} layout="vertical">
          <Form.Item
            name="tenKieuDang"
            label="Tên kiểu dáng"
            rules={[
              { max: 50, message: 'Tên kiểu dáng không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên kiểu dáng!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuDang.some((cl) => {
                    const normalizedExisting = cl.tenKieuDang.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu dáng đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu dáng" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        open={isModalThuongHieuVisible}
        onCancel={handleModalThuongHieuClose}
        onOk={handleSaveThuongHieu}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formThuongHieu} layout="vertical">
          <Form.Item
            name="tenThuongHieu"
            label="Tên thương hiệu"
            rules={[
              { max: 50, message: 'Tên thương hiệu không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên thương hiệu!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = thuongHieu.some((cl) => {
                    const normalizedExisting = cl.tenThuongHieu.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên thương hiệu đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu cúc' : 'Thêm kiểu cúc'}
        open={isModalKieuCucVisible}
        onCancel={handleModalKieuCucClose}
        onOk={handleKieuCucSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuCuc} layout="vertical">
          <Form.Item
            name="tenKieuCuc"
            label="Tên kiểu cúc"
            rules={[
              { max: 50, message: 'Tên kiểu cúc không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên kiểu cúc!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuCuc.some((cl) => {
                    const normalizedExisting = cl.tenKieuCuc.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu cúc đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu cúc" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu cổ áo' : 'Thêm kiểu cổ áo'}
        open={isModalKieuCoAoVisible}
        onCancel={handleModalKieuCoAoClose}
        onOk={handleKieuCoAoSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuCoAo} layout="vertical">
          <Form.Item
            name="tenKieuCoAo"
            label="Tên kiểu cổ áo"
            rules={[
              { max: 50, message: 'Tên kiểu cổ áo không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên kiểu cổ áo!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuCoAo.some((cl) => {
                    const normalizedExisting = cl.tenKieuCoAo.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu cổ áo đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu cổ áo" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu cổ tay áo' : 'Thêm kiểu cổ tay áo'}
        open={isModalKieuCoTayAoVisible}
        onCancel={handleModalKieuCoTayAoClose}
        onOk={handleKieuCoTayAoSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuCoTayAo} layout="vertical">
          <Form.Item
            name="tenKieuCoTayAo"
            label="Tên kiểu cổ tay áo"
            rules={[
              { max: 50, message: 'Tên kiểu cổ tay áo không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập kiểu cổ tay áo'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuCoTayAo.some((cl) => {
                    const normalizedExisting = cl.tenKieuCoTayAo.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu cổ tay áo đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu cổ tay áo" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu túi áo' : 'Thêm kiểu túi áo'}
        open={isModalKieuTuiAoVisible}
        onCancel={handleModalKieuTuiAoClose}
        onOk={handleKieuTuiAoSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuTuiAo} layout="vertical">
          <Form.Item
            name="tenKieuTuiAo"
            label="Tên kiểu túi áo"
            rules={[
              { max: 50, message: 'Tên kiểu túi áo không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên kiểu túi áo!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuTuiAo.some((cl) => {
                    const normalizedExisting = cl.tenKieuTuiAo.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu túi áo đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu túi áo" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa kiểu tay áo' : 'Thêm kiểu tay áo'}
        open={isModalKieuTayAoVisible}
        onCancel={handleModalKieuTayAoClose}
        onOk={handleKieuTayAoSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formKieuTayAo} layout="vertical">
          <Form.Item
            name="tenKieuTayAo"
            label="Tên kiểu tay áo"
            rules={[
              { max: 50, message: 'Tên kiểu tay áo không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên kiểu tay áo!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = kieuTayAo.some((cl) => {
                    const normalizedExisting = cl.tenKieuTayAo.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên kiểu tay áo đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên kiểu tay áo" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa họa tiết' : 'Thêm họa tiết'}
        open={isModalHoaTietVisible}
        onCancel={handleModalHoaTietClose}
        onOk={handleHoaTietSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formHoaTiet} layout="vertical">
          <Form.Item
            name="tenHoaTiet"
            label="Tên họa tiết"
            rules={[
              { max: 50, message: 'Tên họa tiết không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên họa tiết!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = hoaTiet.some((cl) => {
                    const normalizedExisting = cl.tenHoaTiet.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên họa tiết đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên họa tiết"/>
          </Form.Item>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        open={isModalDanhMucVisible}
        onCancel={handleModalDanhMucClose}
        onOk={handleDanhMucSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={formDanhMuc} layout="vertical">
          <Form.Item
            name="tenDanhMuc"
            label="Tên danh mục"
            rules={[
              { max: 50, message: 'Tên danh mục không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên danh mục!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = danhMuc.some((cl) => {
                    const normalizedExisting = cl.tenDanhMuc.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên danh mục đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên danh mục"/>
          </Form.Item>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chọn màu sắc"
        open={isModalVisibleColor}
        onCancel={handleCancelColor}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={handleCancelColor}>
              Xác nhận
            </Button>
          </div>,
        ]}
      >
        {/* Hiển thị các button lấy từ backend */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>{renderColorButtons()}</div>
      </Modal>
      <Modal
        title="Chọn kích thước"
        open={isModalVisibleSizes}
        onCancel={handleCancelSize}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={handleCancelSize}>
              Xác nhận
            </Button>
          </div>,
        ]}
      >
        {/* Hiển thị các button lấy từ backend */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>{renderSizeButtons()}</div>
      </Modal>
      <Modal
        open={isModalVisibleImage}
        clossable={false}
        onCancel={handleCancelImage}
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
        {filteredImages.length > 0 ? (
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
            {filteredImages.map(({ image, color }, index) => (
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
                <p
                  style={{
                    textAlign: 'center',
                    margin: '5px 0',
                    fontWeight: 'bold',
                    color: '#1890ff',
                  }}
                >
                  {color || 'Không có màu'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Hiển thị khi không có ảnh nào được chọn
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
                checked={selectedImages.some(
                  (item) => item.image === img && item.color === currentColor,
                )}
                onChange={() => handleSelectImage(img, currentColor)}
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
      <Modal
      title="Chỉnh sửa sản phẩm"
      open={isModalEditSanPhamVisible}
       onCancel={handleCancelSoLuongVaGia}
       onOk={handleSaveSoLuongVaGia}
      okText="Lưu thay đổi"
      cancelText="Hủy"
    >
      <Form form={formEditSLGia} layout="vertical">
        <Form.Item
          label="Số lượng"
          name="soLuong"
          rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="gia"
          rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(value) => ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value.replace(/,/g, "")}
          />
        </Form.Item>
      </Form>
    </Modal>

      <Row style={{ justifyContent: 'end' }}>
        <Button
        style={{ border: '3px solid #1890ff', color: '#1890ff',marginTop: '6px',fontSize: '12px',fontWeight: 'bold',}}
       
          type="submit"
          onClick={showConfirm}
        >
          Lưu thay đổi
        </Button>
      </Row>
    </div>
  );
};
export default DemoForm;
