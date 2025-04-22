import React, { useEffect, useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Input,
  Button,
  Modal,
  Table,
  Typography,
  InputNumber,
  Space,
  Tooltip,
  message,
  Select,
  Col,
  Row,
  Carousel,
} from "antd";
import { formatCurrency } from "../../utils/format";
import PropTypes from "prop-types";
import { Option } from "antd/es/mentions";
import axios from "axios";
const { Text } = Typography;
const ProductTable = ({ products, onAddProduct, onAddMultipleProducts , open, onClose }) => {
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
  const [selectedChatLieu, setSelectedChatLieu] = useState("");
  const [selectedKieuDang, setSelectedKieuDang] = useState("");
  const [selectedThuongHieu, setSelectedThuongHieu] = useState("");
  const [selectedKieuCuc, setSelectedKieuCuc] = useState("");
  const [selectedKieuCoAo, setSelectedKieuCoAo] = useState("");
  const [selectedKieuCoTayAo, setSelectedKieuCoTayAo] = useState("");
  const [selectedKieuTayAo, setSelectedKieuTayAo] = useState("");
  const [selectedKieuTuiAo, setSelectedKieuTuiAo] = useState("");
  const [selectedDanhMuc, setSelectedDanhMuc] = useState("");
  const [selectedHoaTiet, setSelectedHoaTiet] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState("");
  const [tempQuantities, setTempQuantities] = useState({});
  const [productList, setProductList] = useState(products);
  const [selectedProducts, setSelectedProducts] = useState([]); // Thêm state cho việc chọn nhiều sản phẩm
  const token = localStorage.getItem("token");
  
  const [productQuantities, setProductQuantities] = useState({});
  //xử lý phân trang, thay đổi STT dòng bắt đầu khi chuyển trang
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const handleClose = () => {
    setSelectedChatLieu(""); // Reset selected items
    setSelectedKieuDang(""); // Reset selected items
    setSelectedThuongHieu(""); // Reset selected items
    setSelectedKieuCuc(""); // Reset selected items
    setSelectedKieuCoAo(""); // Reset selected items
    setSelectedKieuCoTayAo(""); // Reset selected items
    setSelectedKieuTuiAo(""); // Reset selected items
    setSelectedDanhMuc(""); // Reset selected items
    setSelectedHoaTiet(""); // Reset selected items
    setSelectedColor(""); // Reset selected items
    setSelectedSize(""); // Reset selected items
    setSelectedKieuTayAo(""); // Reset selected items
    onClose(); // Đóng modal
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/chatlieu",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setChatLieu(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chất liệu:", error);
      } finally {
      }
    };
    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu dáng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieudang",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuDang(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu dáng:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách thương hiệu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/thuonghieu",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setThuongHieu(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thương hiệu:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cúc
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieucuc",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuCuc(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu cúc:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieucoao",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuCoAo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu cổ áo:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu cổ tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieucotayao",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuCoTayAo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu cổ tay áo:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu túi áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieutuiao",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuTuiAo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu túi áo:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kiểu tay áo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kieutayao",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setKieuTayAo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kiểu tay áo:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách màu sắc
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/mausac",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setColors(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách màu sắc:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/kichthuoc",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setSizes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kích thước:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/hoatiet",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setHoaTiet(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách họa tiết:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Gọi API để lấy danh sách kích thước
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/danhmuc",
          {headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          }},
        );
        setDanhMuc(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);
  // Lọc danh sách sản phẩm theo các bộ lọc
  const filteredProducts = productList.filter((item) => {
    const searchLower = searchText.toLowerCase();

    const matchesSearch =
      item.maSanPham.toLowerCase().includes(searchLower) ||
      item.tenSanPham.toLowerCase().includes(searchLower);

    const matchesChatLieu = selectedChatLieu
      ? (item.chatLieu ?? "") === selectedChatLieu
      : true;
    const matchesKieuDang = selectedKieuDang
      ? (item.kieuDang ?? "") === selectedKieuDang
      : true;
    const matchesThuongHieu = selectedThuongHieu
      ? (item.thuongHieu ?? "") === selectedThuongHieu
      : true;
    const matchesKieuCuc = selectedKieuCuc
      ? (item.kieuCuc ?? "") === selectedKieuCuc
      : true;
    const matchesKieuCoAo = selectedKieuCoAo
      ? (item.kieuCoAo ?? "") === selectedKieuCoAo
      : true;
    const matchesKieuCoTayAo = selectedKieuCoTayAo
      ? (item.kieuCoTayAo ?? "") === selectedKieuCoTayAo
      : true;
    const matchesKieuTayAo = selectedKieuTayAo
      ? (item.kieuTayAo ?? "") === selectedKieuTayAo
      : true;
    const matchesKieuTuiAo = selectedKieuTuiAo
      ? (item.kieuTuiAo ?? "") === selectedKieuTuiAo
      : true;
    const matchesHoaTiet = selectedHoaTiet
      ? (item.hoaTiet ?? "") === selectedHoaTiet
      : true;
    const matchesDanhMuc = selectedDanhMuc
      ? (item.danhMuc ?? "") === selectedDanhMuc
      : true;
    const matchesColor = selectedColor
      ? (item.mauSac ?? "") === selectedColor
      : true;
    const matchesSize = selectedSize
      ? (item.kichThuoc ?? "") === selectedSize
      : true;

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

  const handleQuantityChange = (productDetailId, value) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    setProductQuantities((prev) => ({ ...prev, [productDetailId]: newQuantity }));
  };
  useEffect(() => {
    setProductList(products);
  }, [products]);

  const handleAddProduct = (productDetail) => {
    if (productDetail) {
      try {
        const quantity = productQuantities[productDetail.id] || 1;
        
        // Kiểm tra số lượng có vượt quá tồn kho không
        if (quantity > productDetail.soLuong) {
          message.error(`Chỉ còn ${productDetail.soLuong} sản phẩm trong kho!`);
          return;
        }
        
        // Gọi callback với sản phẩm và số lượng
        onAddProduct(productDetail, quantity);

        // Cập nhật UI ngay lập tức
        setProductList((prevProducts) =>
          prevProducts.map((p) =>
            p.id === productDetail.id
              ? { ...p, soLuong: Math.max(0, p.soLuong - quantity) }
              : p
          )
        );

        // Reset về số lượng mặc định là 1
        setProductQuantities((prev) => ({ ...prev, [productDetail.id]: 1 }));
      } catch (error) {
        console.error("Error in handleAddProduct:", error);
        message.error("Lỗi khi thêm sản phẩm");
      }
    }
  };

  const handleSelectProducts = (selectedRowKeys, selectedRows) => {
    setSelectedProducts(selectedRows);
  };

  const handleAddSelectedProducts = () => {
    if (selectedProducts.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    try {
      // Chuẩn bị danh sách sản phẩm với số lượng đã chọn
      const productsWithQuantities = selectedProducts.map(product => {
        const quantity = productQuantities[product.id] || 1;
        
        // Kiểm tra số lượng có vượt quá tồn kho không
        if (quantity > product.soLuong) {
          message.error(`Sản phẩm ${product.tenSanPham} chỉ còn ${product.soLuong} trong kho!`);
          throw new Error("Số lượng vượt quá tồn kho");
        }
        
        return {
          ...product, 
          soLuongThem: quantity
        };
      });
      
      // Gọi callback với danh sách sản phẩm và số lượng
      if (onAddMultipleProducts) {
        onAddMultipleProducts(productsWithQuantities);
      } else {
        // Fallback nếu không có callback onAddMultipleProducts
        productsWithQuantities.forEach((product) => {
          onAddProduct(product, product.soLuongThem);
        });
      }

      // Cập nhật UI ngay lập tức
      setProductList((prevProducts) =>
        prevProducts.map((p) => {
          const selectedProduct = productsWithQuantities.find((sp) => sp.id === p.id);
          if (!selectedProduct) return p;
          
          return {
            ...p,
            soLuong: Math.max(0, p.soLuong - selectedProduct.soLuongThem),
          };
        })
      );

      // Reset danh sách sản phẩm đã chọn và số lượng
      setSelectedProducts([]);
      
      // Hiển thị thông báo thành công
      message.success(`Đã thêm ${productsWithQuantities.length} sản phẩm vào đơn hàng!`);
      
      // Đóng modal nếu cần
      if (onClose) onClose();
      
    } catch (error) {
      if (error.message !== "Số lượng vượt quá tồn kho") {
        console.error("Error in handleAddSelectedProducts:", error);
        message.error("Lỗi khi thêm sản phẩm: " + error.message);
      }
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedProducts.map((p) => p.id),
    onChange: handleSelectProducts,
    getCheckboxProps: (record) => ({
      disabled: record.soLuong <= 0,
    }),
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        pagination.pageSize * (pagination.current - 1) + index + 1,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      width: 100,
      align: "center",
      render: (hinhAnh) => {
        return (
          <div style={{ width: 80, height: 100, overflow: "hidden" }}>
            {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
              <Carousel autoplay dots={false} effect="fade">
                {hinhAnh.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Sản phẩm ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 4,
                      display: "block",
                    }}
                  />
                ))}
              </Carousel>
            ) : (
              <img
                src="https://via.placeholder.com/80x100"
                alt="Không có ảnh"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 4,
                  display: "block",
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "mauSac",
      key: "mauSac",
      align: "center",
    },
    {
      title: "Kích thước",
      dataIndex: "kichThuoc",
      key: "kichThuoc",
      align: "center",
    },
    {
      title: "Chất liệu",
      dataIndex: "chatLieu",
      key: "chatLieu",
      align: "center",
    },
    {
      title: "Số lượng tồn kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Giá",
      dataIndex: "gia",
      key: "gia",
      align: "center",
      render: (gia) => formatCurrency(gia),
    },
    {
      title: "Số lượng",
      key: "soLuongThem",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.soLuong}
          defaultValue={1}
          value={productQuantities[record.id] || 1}
          onChange={(value) => handleQuantityChange(record.id, value)}
          style={{ width: 80 }}
          disabled={record.soLuong <= 0}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={1300}
      title="Chọn sản phẩm chi tiết"
      footer={[
        <Button
          key="add"
          type="primary"
          onClick={handleAddSelectedProducts}
          disabled={selectedProducts.length === 0}
          style={{ backgroundColor: "black", marginRight: 8 }}
        >
          Thêm {selectedProducts.length} sản phẩm đã chọn
        </Button>,
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={handleSearchChange}
        /> */}
        <div
          style={{
            boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
            height: "240px",
            marginBottom: "20px",
          }}
        >
          {/* Ô tìm kiếm */}
          <Row gutter={16} style={{ marginBottom: "26px" }}>
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
          <Row
            gutter={16}
            style={{ marginBottom: "16px", justifyContent: "center" }}
          >
            <Col
              span={5}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Chất liệu:</Text>
              <Select
                placeholder="Chọn chất liệu"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Kiểu dáng:</Text>
              <Select
                placeholder="Chọn kiểu dáng"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Thương hiệu:</Text>
              <Select
                placeholder="Chọn thương hiệu"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Kiểu cúc:</Text>
              <Select
                placeholder="Chọn kiểu cúc"
                style={{ width: "50%" }}
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
          <Row
            gutter={16}
            style={{ marginBottom: "16px", justifyContent: "center" }}
          >
            <Col
              span={5}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Cổ áo:</Text>
              <Select
                placeholder="Chọn kiểu cổ áo"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Cổ tay áo:</Text>
              <Select
                placeholder="Chọn kiểu cổ tay áo"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Tay áo:</Text>
              <Select
                placeholder="Chọn kiểu tay áo"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Túi áo:</Text>
              <Select
                placeholder="Chọn kiểu túi áo"
                style={{ width: "50%" }}
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
          <Row
            gutter={16}
            style={{ marginBottom: "30px", justifyContent: "center" }}
          >
            <Col
              span={5}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Màu sắc:</Text>
              <Select
                placeholder="Chọn màu sắc"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Kích thước:</Text>
              <Select
                placeholder="Chọn kích thước"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Họa tiết:</Text>
              <Select
                placeholder="Chọn họa tiết"
                style={{ width: "50%" }}
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ marginRight: "8px" }}>Danh mục:</Text>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: "50%" }}
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
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredProducts} // Thay đổi từ productList sang filteredProducts
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          locale={{ emptyText: "Không tìm thấy sản phẩm nào" }}
        />
      </Space>
    </Modal>
  );
};

ProductTable.defaultProps = {
  products: [],
  onAddProduct: () => {},
  onAddMultipleProducts: () => {},
  open: false,
  onClose: () => {},
};


ProductTable.propTypes = {
  products: PropTypes.array,
  onAddProduct: PropTypes.func,
  onAddMultipleProducts: PropTypes.func,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ProductTable;
