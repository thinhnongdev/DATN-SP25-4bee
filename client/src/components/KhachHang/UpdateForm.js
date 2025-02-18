import { useState } from "react";
import { toast } from "react-toastify";
import { VscSave } from "react-icons/vsc";
import { Radio } from 'antd';
import { Input } from 'antd';
import { getPutApi } from "./KhachHangApi";

const formatNgaySinh = (ngaySinh) => {
  if (!ngaySinh) return "";
  const date = new Date(ngaySinh);
  return date.toISOString().split("T")[0];
};

function UpdateForm({ selectedKhachHang, getAllKhachHang, handleClose }) {
  const [formData, setFormData] = useState({
    tenKhachHang: selectedKhachHang.tenKhachHang || "",
    email: selectedKhachHang.email || "",
    soDienThoai: selectedKhachHang.soDienThoai || "",
    ngaySinh: formatNgaySinh(selectedKhachHang.ngaySinh) || "",
    gioiTinh: selectedKhachHang.gioiTinh,
    trangThai: selectedKhachHang.trangThai || true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "gioiTinh" || name === "trangThai"
          ? value === "true"
          : value,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    getPutApi(selectedKhachHang.id, formData)
      .then(() => {
        toast.success("Cập nhật khách hàng thành công!");
        getAllKhachHang();
        handleClose();
      })
      .catch((error) => {
        toast.error("Lỗi khi cập nhật khách hàng!");
        console.error("Lỗi khi cập nhật khách hàng:", error);
      });
  };

  return (
    <div className="flex-1 bg-white text-black overflow-auto relative w-screen">
      <div className="KhachHang p-3">
        <div className="container mt-3">
          <h4 className="title">Cập nhật khách hàng</h4>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Tên khách hàng</label>
              <Input
                type="text"
                name="tenKhachHang"
                value={formData.tenKhachHang}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <Input
                type="text"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <Input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <Radio
                    type="radio"
                    name="gioiTinh"
                    value="true"
                    checked={formData.gioiTinh === true}
                    onChange={handleChange}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <Radio
                    type="radio"
                    name="gioiTinh"
                    value="false"
                    checked={formData.gioiTinh === false}
                    onChange={handleChange}
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
                    name="trangThai"
                    value="true"
                    checked={formData.trangThai === true}
                    onChange={handleChange}
                  />{" "}
                  Hoạt động
                </label>
                <label className="ms-3">
                  <Radio
                    type="radio"
                    name="trangThai"
                    value="false"
                    checked={formData.trangThai === false}
                    onChange={handleChange}
                  />{" "}
                  Ngưng hoạt động
                </label>
              </div>
            </div>
            <div className="edit d-flex justify-content-end">
              <button className="btn btn-light">
                <VscSave className="icon" /> Sửa khách hàng
              </button>
            </div>
          </form>
          <button className="btn btn-outline-danger" onClick={handleClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateForm;
