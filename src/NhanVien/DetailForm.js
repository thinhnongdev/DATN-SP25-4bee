import { useEffect, useState } from "react";
import { format } from "date-fns";
import "./DetailForm.css";
import "./NhanVien.css";
import { getNhanVienById } from "../Api/NhanVienApi";

const DetailForm = ({ selectedNhanVien, handleClose }) => {
  const [nhanVien, setNhanVien] = useState(null);

  useEffect(() => {
    if (selectedNhanVien) {
      getNhanVienById(selectedNhanVien)
        .then((response) => {
          setNhanVien(response.data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin nhân viên:", error);
        });
    }
  }, [selectedNhanVien]);

  if (!nhanVien) return <p>Đang tải...</p>;

  return (
    <div className="flex-1 bg-white text-black overflow-auto relative w-screen">
      <div className="container detail-form-container mt-3">
        <div className="detail-form-header">
          <h3>Thông tin nhân viên</h3>
          <button className="close-btn" onClick={handleClose}>
            Quay lại
          </button>
        </div>
        <div className="detail-form-content">
          {/* Thông tin nhân viên bên trái */}
          <div className="form-left">
            <div className="avatar">
              <img
                src={
                  nhanVien.anh_dai_dien ||
                  "https://i.pinimg.com/736x/64/7d/ff/647dff4ee0ec7e59c4aa85ed0aba0ac9.jpg"
                }
                alt="Avatar"
                width="100"
                height="100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ma">Mã nhân viên</label>
              <input
                type="text"
                id="ma"
                value={nhanVien.ma_nhan_vien || ""}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="ho-ten">Họ và Tên</label>
              <input
                type="text"
                id="ho-ten"
                value={nhanVien.ten_nhan_vien || ""}
                readOnly
              />
            </div>
          </div>

          <div className="form-right">
            <div className="form-group">
              <label htmlFor="ngay-sinh">Ngày sinh</label>
              <input
                type="text"
                id="ngay-sinh"
                value={
                  nhanVien.ngay_sinh
                    ? format(new Date(nhanVien.ngay_sinh), "dd/MM/yyyy")
                    : "N/A"
                }
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Giới tính *</label>
              <div className="gender-options">
                <label>
                  <input
                    type="radio"
                    name="gioi-tinh"
                    value="Nam"
                    checked={nhanVien.gioi_tinh === true}
                    readOnly
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    name="gioi-tinh"
                    value="Nữ"
                    checked={nhanVien.gioi_tinh === false}
                    readOnly
                  />
                  Nữ
                </label>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={nhanVien.email || ""}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="so-dien-thoai">Số điện thoại</label>
              <input
                type="text"
                id="so-dien-thoai"
                value={nhanVien.so_dien_thoai || ""}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="trang-thai">Trạng thái</label>
              <input
                type="text"
                id="trang-thai"
                value={nhanVien.trang_thai ? "Hoạt động" : "Ngưng hoạt động"}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailForm;
