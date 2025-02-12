import { useState } from "react";
import { toast } from "react-toastify";
import { VscSave } from "react-icons/vsc";
import { getPutApi } from "../Api/NhanVienApi";
import "./UpdateForm.css"
import "./NhanVien.css"

const formatNgaySinh = (ngaySinh) => {
  if (!ngaySinh) return "";
  const date = new Date(ngaySinh);
  return date.toISOString().split("T")[0];
};

function UpdateForm({ selectedNhanVien, getAllNhanVien, handleClose }) {
  const [tenNhanVien, setTenNhanVien] = useState(
    selectedNhanVien.ten_nhan_vien || ""
  );
  const [email, setEmail] = useState(selectedNhanVien.email || "");
  const [soDienThoai, setSoDienThoai] = useState(
    selectedNhanVien.so_dien_thoai || ""
  );
  const [ngaySinh, setNgaySinh] = useState(
    formatNgaySinh(selectedNhanVien.ngay_sinh) || ""
  );
  const [gioiTinh, setGioiTinh] = useState(selectedNhanVien.gioi_tinh);
  const [trangThai, setTrangThai] = useState(
    selectedNhanVien.trang_thai 
  );

  const handleUpdate = (e) => {
    e.preventDefault();

    const updatedNhanVien = {
      ten_nhan_vien: tenNhanVien,
      email: email,
      so_dien_thoai: soDienThoai,
      ngay_sinh: ngaySinh,
      gioi_tinh: gioiTinh,
      trang_thai: trangThai,
    };

    getPutApi(selectedNhanVien.id, updatedNhanVien)
      .then(() => {
        toast.success("Cập nhật nhân viên thành công!");
        getAllNhanVien(); 
        handleClose(); 
      })
      .catch((error) => {
        toast.error("Lỗi khi cập nhật nhân viên!", error);
      });
  };

  return (
    <div className="flex-1 bg-white text-black overflow-auto relative w-screen">
      <div className="NhanVien p-4">
        <div className="container mt-4">
          <h4 className="title">Cập nhật nhân viên</h4>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Tên nhân viên</label>
              <input
                type="text"
                className="form-control"
                value={tenNhanVien}
                onChange={(e) => setTenNhanVien(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                value={ngaySinh}
                onChange={(e) => setNgaySinh(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <input
                    type="radio"
                    checked={gioiTinh === true}
                    onChange={() => setGioiTinh(true)}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <input
                    type="radio"
                    checked={gioiTinh === false}
                    onChange={() => setGioiTinh(false)}
                  />{" "}
                  Nữ
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Trạng thái</label>
              <div>
                <label>
                  <input
                    type="radio"
                    checked={trangThai === true}
                    onChange={() => setTrangThai(true)}
                  />{" "}
                  Hoạt động
                </label>
                <label className="ms-3">
                  <input
                    type="radio"
                    checked={trangThai === false}
                    onChange={() => setTrangThai(false)}
                  />{" "}
                  Ngưng hoạt động
                </label>
              </div>
            </div>
            <div className="edit d-flex justify-content-end">
              <button className="btn btn-light">
                <VscSave className="icon" /> Sửa nhân viên
              </button>
            </div>
          </form>
          <button className="btn btn-outline-danger mt-3" onClick={handleClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateForm;
