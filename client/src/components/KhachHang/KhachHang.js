import { useEffect, useState } from "react";
import { Table, Button, Input, Select, Pagination, Tag, Tooltip } from "antd";
import { PlusOutlined, FileExcelOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAllApi } from "./KhachHangApi";
import { TbEyeEdit } from "react-icons/tb";

const { Option } = Select;

const KhachHang = ({ onAddClick, onViewClick }) => {
  const [khachhang, setKhachHang] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  function getAllKhachHang() {
    getAllApi()
      .then((response) => {
        setKhachHang(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không lấy được dữ liệu!");
      });
  }

  useEffect(() => {
    getAllKhachHang();
  }, []);

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
      dataIndex: "index",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Mã khách hàng", dataIndex: "maKhachHang" },
    { title: "Tên khách hàng", dataIndex: "tenKhachHang" },
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
      key: "trangThai",
      render: (text, record) =>
        record.trangThai ? (
          <Tag
            color="green"
            style={{ fontSize: 14, padding: "4px 12px", borderRadius: "15px" }}
          >
            Hoạt động
          </Tag>
        ) : (
          <Tag
            color="red"
            style={{ fontSize: 14, padding: "4px 12px", borderRadius: "15px" }}
          >
            Ngừng hoạt động
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <>
          {
            <Tooltip title="Chỉnh sửa">
              <Button
                icon={<TbEyeEdit />}
                onClick={() => onViewClick(record.id)}
              />
            </Tooltip>
          }
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "2000px", margin: "0 auto", padding: "20px" }}>
      {/* Phần bộ lọc */}
      <h4>Danh sách khách hàng</h4>
      <div
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h5 style={{ marginBottom: "10px" }}>Bộ lọc</h5>
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
            placeholder="Nhập tên khách hàng"
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
            Thêm khách hàng
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
            Xuất Excel
          </Button>
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
        <div
          style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}
        >
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
