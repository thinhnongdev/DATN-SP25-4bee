import { useState } from "react";
import { toast } from "react-toastify";
import { VscSave } from "react-icons/vsc";
import "./UpdateForm.css";
import "./KhachHang.css";
import { getPutApi } from "../Api/KhachHangApi";

const formatNgaySinh = (ngaySinh) => {
  if (!ngaySinh) return "";
  const date = new Date(ngaySinh);
  return date.toISOString().split("T")[0];
};

function UpdateForm({ selectedKhachHang, getAllKhachHang, handleClose }) {
  const [formData, setFormData] = useState({
    ten_khach_hang: selectedKhachHang.ten_khach_hang || "",
    email: selectedKhachHang.email || "",
    so_dien_thoai: selectedKhachHang.so_dien_thoai || "",
    ngay_sinh: formatNgaySinh(selectedKhachHang.ngay_sinh) || "",
    gioi_tinh: selectedKhachHang.gioi_tinh,
    trang_thai: selectedKhachHang.trang_thai || true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "gioi_tinh" || name === "trang_thai"
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
              <input
                type="text"
                className="form-control"
                name="ten_khach_hang"
                value={formData.ten_khach_hang}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                name="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="gioi_tinh"
                    value="true"
                    checked={formData.gioi_tinh === true}
                    onChange={handleChange}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <input
                    type="radio"
                    name="gioi_tinh"
                    value="false"
                    checked={formData.gioi_tinh === false}
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
                  <input
                    type="radio"
                    name="trang_thai"
                    value="true"
                    checked={formData.trang_thai === true}
                    onChange={handleChange}
                  />{" "}
                  Hoạt động
                </label>
                <label className="ms-3">
                  <input
                    type="radio"
                    name="trang_thai"
                    value="false"
                    checked={formData.trang_thai === false}
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
