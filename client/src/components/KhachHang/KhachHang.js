import { useEffect, useState } from "react";
import { Table, Button, Input, Select, Pagination } from "antd";
import {
  PlusOutlined,
  FileExcelOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAllApi } from "./KhachHangApi";

const { Option } = Select;

const KhachHang = ({ onAddClick, onDeleteClick, onEditClick, onViewClick }) => {
  const [khachhang, setKhachHang] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getAllKhachHang();
  }, []);

  const getAllKhachHang = async () => {
    try {
      const response = await getAllApi();
      const data = Array.isArray(response.data) ? response.data : [];
      setKhachHang(data);
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu!");
      setKhachHang([]);
    }
  };

  const filteredKhachHang = khachhang.filter((item) => {
    return (
      (item.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false) &&
      (genderFilter === "all" ||
        (genderFilter === "male" && item.gioiTinh) ||
        (genderFilter === "female" && !item.gioiTinh)) &&
      (statusFilter === "all" ||
        (statusFilter === "active" && item.trangThai) ||
        (statusFilter === "inactive" && !item.trangThai))
    );
  });

  const paginatedKhachHang = filteredKhachHang.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      khachhang.map((item, index) => ({
        STT: index + 1,
        "Mã khách hàng": item.maKhachHang,
        "Tên khách hàng": item.tenKhachHang,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKhachHang");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "DanhSachKhachHang.xlsx"
    );
    toast.success("Xuất file Excel thành công!");
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "anh",
      key: "anh",
      render: () => (
        <img
          src="https://i.pinimg.com/736x/64/7d/ff/647dff4ee0ec7e59c4aa85ed0aba0ac9.jpg"
          width={90}
          alt="Avatar"
        />
      ),
    },
    { title: "Mã khách hàng", dataIndex: "maKhachHang", key: "maKhachHang" },
    { title: "Tên khách hàng", dataIndex: "tenKhachHang", key: "tenKhachHang" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      render: (text) => (text ? format(new Date(text), "dd/MM/yyyy") : "N/A"),
    },
    {
      title: "Giới tính",
      dataIndex: "gioiTinh",
      key: "gioiTinh",
      render: (text) => (text ? "Nam" : "Nữ"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (text) => (text ? "Hoạt động" : "Ngưng hoạt động"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewClick(record.id)}
          />
          <Button icon={<EditOutlined />} onClick={() => onEditClick(record)} />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDeleteClick(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "2000px", margin: "0 auto", padding: "20px" }}>
      {/* Phần bộ lọc */}

      <div
        style={{
          background: "#f9f9f9",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ textAlign: "center" }}>Danh sách khách hàng</h4>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Nhập tên khách hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              value={genderFilter}
              onChange={setGenderFilter}
              style={{ width: "150px" }}
            >
              <Option value="all">Tất cả giới tính</Option>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
            </Select>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "150px" }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngưng hoạt động</Option>
            </Select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button icon={<PlusOutlined />} onClick={onAddClick}>
              Thêm khách hàng
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
              Xuất Excel
            </Button>
          </div>
        </div>
      </div>
      {/* Phần bảng khách hàng */}
      <div style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={paginatedKhachHang}
          rowKey="id"
          pagination={false}
        />
          {/* Phân trang */}
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}>
          <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredKhachHang.length}
          onChange={setCurrentPage}

          
        />
        </div>
        
      </div>
    </div>
  );
};

export default KhachHang;
