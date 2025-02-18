import { useEffect, useState } from "react";
import { Table, Button, Input, Select, Pagination, Tooltip, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileExcelOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAllApi } from "./NhanVienApi";

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
        message.error("Lỗi khi lấy dữ liệu! Vui lòng thử lại.");
      });
  }

  const filteredNhanVien = nhanvien.filter((item) => {
    const matchesSearch = item.tenNhanVien.toLowerCase().includes(searchTerm.toLowerCase());
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

  const paginatedNhanVien = filteredNhanVien.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nhanvien.map((item, index) => ({
        STT: index + 1,
        "Mã nhân viên": item.maNhanVien,
        "Tên nhân viên": item.tenNhanVien,
        Email: item.email,
        "Số điện thoại": item.soDienThoai,
        "Ngày sinh": item.ngaySinh ? format(new Date(item.ngaySinh), "dd/MM/yyyy") : "N/A",
        "Giới tính": item.gioiTinh ? "Nam" : "Nữ",
        "Trạng thái": item.trangThai ? "Hoạt động" : "Ngưng hoạt động",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanVien");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, "DanhSachNhanVien.xlsx");
    message.success("Xuất file Excel thành công!");
  };

  const columns = [
    { title: "STT", dataIndex: "index", render: (_, __, index) => (currentPage - 1) * pageSize + index + 1 },
    { title: "Ảnh", dataIndex: "avatar", render: () => <img src="https://i.pinimg.com/736x/64/7d/ff/647dff4ee0ec7e59c4aa85ed0aba0ac9.jpg" width={50} alt="Avatar" /> },
    { title: "Mã nhân viên", dataIndex: "maNhanVien" },
    { title: "Tên nhân viên", dataIndex: "tenNhanVien" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "soDienThoai" },
    { title: "Ngày sinh", dataIndex: "ngaySinh", render: (date) => (date ? format(new Date(date), "dd/MM/yyyy") : "N/A") },
    { title: "Giới tính", dataIndex: "gioiTinh", render: (gioiTinh) => (gioiTinh ? "Nam" : "Nữ") },
    { title: "Trạng thái", dataIndex: "trangThai", render: (trangThai) => (trangThai ? "Hoạt động" : "Ngưng hoạt động") },
    {
      title: "Thao tác",
      render: (_, record) => (
        <>
          <Tooltip title="Xem">
            <Button icon={<EyeOutlined />} onClick={() => onViewClick(record.id)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => onEditClick(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button icon={<DeleteOutlined />} onClick={() => onDeleteClick(record.id)}  />
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "2000px", margin: "0 auto", padding: "20px" }}>
  <h4 style={{ textAlign: "center" }}>Danh sách nhân viên</h4>
  
  <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
    <h5 style={{ marginBottom: "10px" }}>Bộ lọc</h5>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
      <Input style={{ flex: "1 1 200px" }} placeholder="Nhập tên nhân viên" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <Select style={{ flex: "1 1 150px" }} value={genderFilter} onChange={setGenderFilter}>
        <Option value="all">Tất cả giới tính</Option>
        <Option value="male">Nam</Option>
        <Option value="female">Nữ</Option>
      </Select>
      <Select style={{ flex: "1 1 150px" }} value={statusFilter} onChange={setStatusFilter}>
        <Option value="all">Tất cả trạng thái</Option>
        <Option value="active">Hoạt động</Option>
        <Option value="inactive">Ngưng hoạt động</Option>
      </Select>
      <Button icon={<PlusOutlined />} onClick={onAddClick}>Thêm</Button>
      <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>Xuất Excel</Button>
    </div>
  </div>
  
  <div style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
    <Table columns={columns} dataSource={paginatedNhanVien} rowKey="id" pagination={false} style={{ overflowX: "auto" }} />
    <div style={{ marginTop: "20px", display: "flex" ,justifyContent: "end" }}>
      <Pagination current={currentPage} pageSize={pageSize} total={filteredNhanVien.length} onChange={setCurrentPage} />
    </div>
    
  </div>
</div>

  );
};

export default NhanVien;
