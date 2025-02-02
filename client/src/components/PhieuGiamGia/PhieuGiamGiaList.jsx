import { useEffect, useState } from "react";
import {
  // deletePhieuGiamGia,
  fetchPhieuGiamGia,
} from "../service/api.js";
import moment from "moment";
import { toast } from "react-toastify";
import UpdatePhieuGiamGia from "./UpdatePhieuGiamGia.jsx";
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
          let trangThai = 0; // Default: Không xác định
          const ngayBatDau = new Date(item.ngayBatDau);
          const ngayKetThuc = new Date(item.ngayKetThuc);
  
          if (currentDate >= ngayBatDau && currentDate <= ngayKetThuc) {
            trangThai = 1; // Đang hoạt động
          } else if (currentDate > ngayKetThuc) {
            trangThai = 2; // Ngừng hoạt động
          } else if (currentDate < ngayBatDau) {
            trangThai = 3; // Sắp diễn ra
          }
  
          return {
            ...item,
            giaTriGiam: item.giaTriGiam != null ? item.giaTriGiam : 0, // Giá trị mặc định nếu null
            trangThai,
          };
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
    navigate("/Users");
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
    switch (trangThai) {
      case 1:
        return <Tag color="green">Đang hoạt động</Tag>;
      case 2:
        return <Tag color="gray">Ngừng hoạt động</Tag>;
      case 3:
        return <Tag color="blue">Sắp diễn ra</Tag>;
      default:
        return <Tag color="orange">Không xác định</Tag>;
    }
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
      dataIndex: "kieuPhieuGiamGia",
      key: "kieuPhieuGiamGia",
      render: (kieu) => (kieu === 1 ? "Công khai" : "Cá nhân"),
    },
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
      dataIndex: "trangThai",
      key: "trangThai",
      render: renderStatusTag,
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
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo mã hoặc tên"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          style={{ width: "200px" }}
        />
        <RangePicker
          onChange={(dates) =>
            setFilters({
              ...filters,
              dateRange: dates
                ? [dates[0].toISOString(), dates[1].toISOString()]
                : [],
            })
          }
          style={{ width: "250px" }}
        />
        <Select
          placeholder="Chọn loại"
          onChange={(value) => setFilters({ ...filters, kieuGiamGia: value })}
          style={{ width: "150px" }}
        >
          <Option value="">Tất cả</Option>
          <Option value="%">%</Option>
          <Option value="VND">VND</Option>
        </Select>
        <Button
          type=""
          onClick={handleAdd}
          icon={<PlusOutlined />}
          style={{
            alignSelf: "center",
            backgroundColor: "black",
            color: "white",
            marginLeft: "451px"
          }}
        >
          Thêm mới
        </Button>


      </div>
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
      <Pagination
        current={pageNo}
        total={totalPages * 5}
        onChange={(page) => setPageNo(page)}
        pageSize={5}
        style={{ marginTop: "20px", textAlign: "center" }}
      />
      {showModal && (
        <UpdatePhieuGiamGia
          show={showModal}
          handleClose={handleCloseModal}
          id={currentId}
          onSaveSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default PhieuGiamGiaList;
