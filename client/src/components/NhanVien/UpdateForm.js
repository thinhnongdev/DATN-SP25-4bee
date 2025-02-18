import { useState } from "react";
import { toast } from "react-toastify";
import { VscSave } from "react-icons/vsc";
import "./UpdateForm.css"
import "./NhanVien.css"
import { Radio } from 'antd';
import { Input } from 'antd';
import { getPutApi } from "./NhanVienApi";

const formatNgaySinh = (ngaySinh) => {
  if (!ngaySinh) return "";
  const date = new Date(ngaySinh);
  return date.toISOString().split("T")[0];
};

function UpdateForm({ selectedNhanVien, getAllNhanVien, handleClose }) {
  const [tenNhanVien, setTenNhanVien] = useState(
    selectedNhanVien.tenNhanVien || ""
  );
  const [email, setEmail] = useState(selectedNhanVien.email || "");
  const [soDienThoai, setSoDienThoai] = useState(
    selectedNhanVien.soDienThoai || ""
  );
  const [ngaySinh, setNgaySinh] = useState(
    formatNgaySinh(selectedNhanVien.ngaySinh) || ""
  );
  const [gioiTinh, setGioiTinh] = useState(selectedNhanVien.gioiTinh);
  const [trangThai, setTrangThai] = useState(
    selectedNhanVien.trangThai 
  );

  const handleUpdate = (e) => {
    e.preventDefault();

    const updatedNhanVien = {
      tenNhanVien: tenNhanVien,
      email: email,
      soDienThoai: soDienThoai,
      ngaySinh: ngaySinh,
      gioiTinh: gioiTinh,
      trangThai: trangThai,
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
      <div className="NhanVien ">
        <div className="container ">
          <h4 className="title">Cập nhật nhân viên</h4>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Tên nhân viên</label>
              <Input
                type="text"
                value={tenNhanVien}
                onChange={(e) => setTenNhanVien(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <Input
                type="text"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <Input
                type="date"
                value={ngaySinh}
                onChange={(e) => setNgaySinh(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <Radio
                    type="radio"
                    checked={gioiTinh === true}
                    onChange={() => setGioiTinh(true)}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <Radio
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
                  <Radio
                    type="radio"
                    checked={trangThai === true}
                    onChange={() => setTrangThai(true)}
                  />{" "}
                  Hoạt động
                </label>
                <label className="ms-3">
                  <Radio
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
  );
}

export default UpdateForm;
