import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Pagination,
  Tooltip,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  FileExcelOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAllApi } from "./NhanVienApi";
import { TbEyeEdit } from "react-icons/tb";
import { toast } from "react-toastify";

const { Option } = Select;

const NhanVien = ({ onAddClick, onDeleteClick, onEditClick, onViewClick }) => {
  const [nhanvien, setNhanVien] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getAllNhanVien();
  }, []);

  function getAllNhanVien() {
    getAllApi()
      .then((response) => {
        setNhanVien(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không lấy được dữ liệu!")
      });
  }

  const filteredNhanVien = (nhanvien || []).filter((item) => {
    const matchesSearch = (item.tenNhanVien || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase());
    const matchesGender =
      genderFilter === "all" ||
      (genderFilter === "male" && item.gioiTinh) ||
      (genderFilter === "female" && !item.gioiTinh);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.trangThai) ||
      (statusFilter === "inactive" && !item.trangThai);
  
    return matchesSearch && matchesGender && matchesStatus;
  });

  const paginatedNhanVien = filteredNhanVien.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nhanvien.map((item, index) => ({
        STT: index + 1,
        "Mã nhân viên": item.maNhanVien,
        "Tên nhân viên": item.tenNhanVien,
        Email: item.email,
        "Số điện thoại": item.soDienThoai,
        "Ngày sinh": item.ngaySinh
          ? format(new Date(item.ngaySinh), "dd/MM/yyyy")
          : "N/A",
        "Giới tính": item.gioiTinh ? "Nam" : "Nữ",
        "Trạng thái": item.trangThai ? "Hoạt động" : "Ngưng hoạt động",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanVien");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, "DanhSachNhanVien.xlsx");
    message.success("Xuất file Excel thành công!");
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "anh",
      render: (anh) => (
        <img
          src={anh || "https://via.placeholder.com/50"}
          alt="Ảnh"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    { title: "Mã nhân viên", dataIndex: "maNhanVien" },
    { title: "Tên nhân viên", dataIndex: "tenNhanVien" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "soDienThoai" },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      render: (date) => (date ? format(new Date(date), "dd/MM/yyyy") : "N/A"),
    },
    {
      title: "Giới tính",
      dataIndex: "gioiTinh",
      render: (gioiTinh) => (gioiTinh ? "Nam" : "Nữ"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: 'trangThai',
      render: (text, record) =>
        record.trangThai ? (
          <Tag color="green" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Hoạt động
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Ngừng hoạt động
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<TbEyeEdit />}
              onClick={() => onEditClick(record)}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "2000px", margin: "0 auto", padding: "20px" }}>
      {/* Phần bộ lọc */}
      <h1 style={{ position: "relative", left: 0, textAlign: "left" }}>
        Danh sách nhân viên
      </h1>
      <div
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h5
          style={{
            marginBottom: "15px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FilterOutlined
            style={{ marginRight: "8px", fontSize: "18px", color: "black" }}
          />
          Bộ lọc
        </h5>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <Input
            style={{ flex: "1 1 200px" }}
            placeholder="Nhập tên nhân viên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            style={{ flex: "1 1 150px" }}
            value={genderFilter}
            onChange={setGenderFilter}
          >
            <Option value="all">Tất cả giới tính</Option>
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
          </Select>
          <Select
            style={{ flex: "1 1 150px" }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Ngưng hoạt động</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={onAddClick}>
            Thêm nhân viên
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
            Xuất Excel
          </Button>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={paginatedNhanVien}
          rowKey="id"
          pagination={false}
          style={{ overflowX: "auto" }}
        />
        <div
          style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredNhanVien.length}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default NhanVien;
