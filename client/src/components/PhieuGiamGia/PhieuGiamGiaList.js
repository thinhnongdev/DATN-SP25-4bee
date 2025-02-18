import { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import {
  // deletePhieuGiamGia,
  fetchPhieuGiamGia,
} from "../Service/api";
import moment from "moment";
import { toast } from "react-toastify";
import UpdatePhieuGiamGia from "./UpdatePhieuGiamGia";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  DatePicker,
  Select,
  Button,
  Pagination,
  Tag,
  Space,
} from "antd";
import "antd/dist/reset.css";
import "react-toastify/dist/ReactToastify.css";
import { formatDate, formatCurrency } from "../../utils/format";

import { Card, Row, Col } from "antd";
import {
  // DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PhieuGiamGiaList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    dateRange: [],
    kieuGiamGia: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [pageNo]);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  // const fetchData = () => {
  //   setLoading(true);
  //   fetchPhieuGiamGia({ pageNo: pageNo - 1, pageSize: 5 })
  //     .then((res) => {
  //       const sanitizedData = res.data.content.map(item => ({
  //         ...item,
  //         giaTriGiam: item.giaTriGiam != null ? item.giaTriGiam : 0, // Giá trị mặc định nếu null
  //       }));
  //       setData(sanitizedData);
  //       setTotalPages(res.data.totalPages);
  //       setFilteredData(sanitizedData);
  //     })
  //     .catch(() => toast.error("Lỗi khi tải dữ liệu!"))
  //     .finally(() => setLoading(false));
  // };


  const fetchData = () => {
    setLoading(true);
    fetchPhieuGiamGia({ pageNo: pageNo - 1, pageSize: 5 })
      .then((res) => {
        const currentDate = new Date();
        const sanitizedData = res.data.content.map(item => {
          // Kiểm tra trạng thái từ dữ liệu (nếu có)
          let trangThai = item.trangThai; // Lấy trạng thái từ backend

          if (trangThai === 0 || trangThai === null || trangThai === undefined) {
            // Nếu trạng thái chưa được thiết lập, tính lại từ ngày bắt đầu và kết thúc
            const ngayBatDau = new Date(item.ngayBatDau);
            const ngayKetThuc = new Date(item.ngayKetThuc);

            if (currentDate < ngayBatDau) {
              trangThai = 3; // Sắp diễn ra
            } else if (currentDate >= ngayBatDau && currentDate <= ngayKetThuc) {
              trangThai = 1; // Đang hoạt động
            } else {
              trangThai = 2; // Ngừng hoạt động
            }
          }

          return { ...item, trangThai };
        });
        setData(sanitizedData);
        setTotalPages(res.data.totalPages);
        setFilteredData(sanitizedData);
      })
      .catch(() => toast.error("Lỗi khi tải dữ liệu!"))
      .finally(() => setLoading(false));
  };


  const applyFilters = () => {
    let tempData = [...data];

    if (filters.search) {
      tempData = tempData.filter(
        (item) =>
          item.tenPhieuGiamGia
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          item.maPhieuGiamGia
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange.map(
        (date) => new Date(date)
      );
      tempData = tempData.filter((item) => {
        const ngayBatDau = new Date(item.ngayBatDau);
        return ngayBatDau >= startDate && ngayBatDau <= endDate;
      });
    }

    if (filters.kieuGiamGia) {
      tempData = tempData.filter(
        (item) =>
          (filters.kieuGiamGia === "%" && item.loaiPhieuGiamGia === 1) ||
          (filters.kieuGiamGia === "VND" && item.loaiPhieuGiamGia === 2)
      );
    }

    if (filters.trangThai) {
      tempData = tempData.filter(item => item.trangThai === Number(filters.trangThai));
    }

    setFilteredData(tempData);
  };

  // const handleDelete = (id) => {
  //   deletePhieuGiamGia(id)
  //     .then(() => {
  //       toast.success("Xóa thành công!");
  //       fetchData();
  //     })
  //     .catch(() => toast.error("Xóa thất bại!"));
  // };

  const handleAdd = () => {
    navigate("/add-p");
  };

  const handleUpdate = (id) => {
    setCurrentId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentId(null);
  };

  const renderStatusTag = (trangThai) => {
    const tagStyle = {
      display: "inline-flex", // Flex giúp nội dung không bị méo
      alignItems: "center", // Căn giữa nội dung theo chiều dọc
      justifyContent: "center", // Căn giữa theo chiều ngang
      padding: "3px 8px", // Giảm padding để nhỏ gọn hơn
      borderRadius: "4px", // Bo góc nhẹ
      fontWeight: "500",
      fontSize: "12px", // Cỡ chữ nhỏ hơn
      color: "white",
      whiteSpace: "nowrap", // Tránh bị xuống dòng khi co giãn
      minWidth: "80px", // Đặt kích thước tối thiểu để tránh bị méo
      maxWidth: "fit-content", // Không ép kích thước cố định
    };

    const statusStyles = {
      1: { backgroundColor: "#66bb6a" }, // Màu xanh lá nhạt hơn
      2: { backgroundColor: "#b0b0b0" }, // Màu xám nhạt hơn
      3: { backgroundColor: "#64b5f6" }, // Màu xanh dương nhạt hơn
      4: { backgroundColor: "#ffcc80", color: "#704214" }, // Cam nhạt hơn, chữ nâu đậm hơn cho dễ đọc
      default: { backgroundColor: "#ffb74d" }, // Màu cam trung tính
    };

    return (
      <span style={{ ...tagStyle, ...(statusStyles[trangThai] || statusStyles.default) }}>
        {trangThai === 1 && "Đang hoạt động"}
        {trangThai === 2 && "Ngừng hoạt động"}
        {trangThai === 3 && "Sắp diễn ra"}
        {trangThai === 4 && "Chờ xác nhận"}
        {!statusStyles[trangThai] && "Không xác định"}
      </span>
    );
  };



  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => (pageNo - 1) * 5 + index + 1,
    },
    { title: "Mã", dataIndex: "maPhieuGiamGia", key: "maPhieuGiamGia" },
    { title: "Tên", dataIndex: "tenPhieuGiamGia", key: "tenPhieuGiamGia" },
    {
      title: "Kiểu",
      dataIndex: "kieuGiamGia",
      key: "kieuGiamGia",
      render: (kieu) => {
        if (kieu === 1) {
          return "Công khai";
        } else if (kieu === 2) {
          return "Cá nhân";
        }
      },
    }
    ,
    // {
    //   title: "Loại",
    //   dataIndex: "loaiPhieuGiamGia",
    //   key: "loaiPhieuGiamGia",
    //   render: (loai) => (loai === 1 ? "%" : "VND"),
    // },
    {
      title: "Giá trị giảm",
      dataIndex: "giaTriGiam",
      key: "giaTriGiam",
      render: (giaTri, record) =>
        record.loaiPhieuGiamGia === 1
          ? `${giaTri} %`
          : giaTri != null
            ? `${giaTri.toLocaleString()} VND`
            : "N/A", // Hoặc giá trị mặc định khác
    },
    { title: "Số lượng", dataIndex: "soLuong", key: "soLuong" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      render: (ngay) => moment(ngay).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      render: (ngay) => moment(ngay).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai", // Dùng dataIndex để chỉ ra rằng cột này hiển thị trạng thái
      key: "trangThai",
      render: renderStatusTag, // Sử dụng hàm renderStatusTag để hiển thị trạng thái
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => handleUpdate(record.id)}
            icon={<EditOutlined />}
          ></Button>
          {/* <Button
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />}
          ></Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Bộ lọc */}
      <div>
        <Card style={{ padding: "15px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
          <h5 style={{ marginBottom: "15px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
            <FilterOutlined style={{ marginRight: "8px", fontSize: "18px", color: "black" }} />
            Bộ lọc
          </h5>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo mã hoặc tên"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                onChange={(dates) =>
                  setFilters({
                    ...filters,
                    dateRange: dates ? [dates[0].toISOString(), dates[1].toISOString()] : [],
                  })
                }
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn loại"
                onChange={(value) => setFilters({ ...filters, kieuGiamGia: value })}
                style={{ width: "100%" }}
              >
                <Option value="">Tất cả</Option>
                <Option value="%">%</Option>
                <Option value="VND">VND</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn trạng thái"
                onChange={(value) => setFilters({ ...filters, trangThai: value })}
                style={{ width: "100%" }}
              >
                <Option value="">Tất cả</Option>
                <Option value={1}>Đang hoạt động</Option>
                <Option value={2}>Ngừng hoạt động</Option>
                <Option value={3}>Sắp diễn ra</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Bảng dữ liệu */}
      <Card style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
        {/* Nút thêm mới */}
        <h5>Danh sách phiếu giảm giá</h5>
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Button
            onClick={handleAdd}
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#0684f5",
              color: "white",
            }}
          >
            Thêm mới
          </Button>

        </div>

        {/* Bảng */}
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          pagination={false}
          rowKey="id"
        />

        {filteredData.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            Không tìm thấy dữ liệu!
          </div>
        )}

        {/* Phân trang */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}>
          <Pagination
            current={pageNo}
            total={totalPages * 4}
            onChange={(page) => setPageNo(page)}
            pageSize={5}
          />
        </div>

        {/* Modal chỉnh sửa */}
        {showModal && (
          <UpdatePhieuGiamGia
            show={showModal}
            handleClose={handleCloseModal}
            id={currentId}
            onSaveSuccess={fetchData}
          />
        )}
      </Card>
    </div>
  );

};

export default PhieuGiamGiaList;
