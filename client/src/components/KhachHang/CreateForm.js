import { useState } from "react";
import { VscSave } from "react-icons/vsc";
import { toast } from "react-toastify";
import { Radio } from 'antd';
import { Input } from "antd";
import { getPostApi } from "./KhachHangApi";

function CreateForm({ handleClose, getAllKhachHang }) {
  const [formData, setFormData] = useState({
    maKhachHang: "",
    tenKhachHang: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: "",
    trangThai: true,
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "maKhachHang" && !value.trim()) {
      errorMsg = "Mã khách hàng không được để trống!";
    }

    if (name === "tenKhachHang" && !value.trim()) {
      errorMsg = "Tên khách hàng không được để trống!";
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) errorMsg = "Email không được để trống!";
      else if (!emailRegex.test(value)) errorMsg = "Email không hợp lệ!";
    }

    if (name === "soDienThoai") {
      const phoneRegex = /^(0[2-9]|84)[0-9]{8,9}$/;
      if (!value.trim()) errorMsg = "Số điện thoại không được để trống!";
      else if (!phoneRegex.test(value))
        errorMsg = "Số điện thoại không hợp lệ!";
    }

    if (name === "ngaySinh") {
      if (!value) errorMsg = "Ngày sinh không được để trống!";
      else {
        const today = new Date();
        const selectedDate = new Date(value);
        if (selectedDate > today) {
          errorMsg = "Ngày sinh không được lớn hơn ngày hiện tại!";
        }
      }
    }

    if (name === "gioiTinh" && !value) {
      errorMsg = "Vui lòng chọn giới tính!";
    }

    return errorMsg;
  };

  const validateForm = () => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prevState) => ({
      ...prevState,
      gioiTinh: gender,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      gioiTinh: validateField("gioiTinh", gender),
    }));
  };

  const checkDuplicateFields = async () => {
    try {
      const existingCustomers = await getAllKhachHang();
  
      if (!existingCustomers) {
        toast.error("Không thể lấy dữ liệu khách hàng!");
        return false;
      }
  
      let duplicateErrors = {}; // Chỉ lưu lỗi trùng lặp mới
  
      // Kiểm tra trùng lặp Mã khách hàng
      if (existingCustomers.some(cus => cus.maKhachHang === formData.maKhachHang)) {
        duplicateErrors.maKhachHang = "Mã khách hàng đã tồn tại!";
      }
  
      // Kiểm tra trùng lặp Email
      if (existingCustomers.some(cus => cus.email === formData.email)) {
        duplicateErrors.email = "Email đã được sử dụng!";
      }
  
      // Kiểm tra trùng lặp Số điện thoại
      if (existingCustomers.some(cus => cus.soDienThoai === formData.soDienThoai)) {
        duplicateErrors.soDienThoai = "Số điện thoại đã được sử dụng!";
      }
  
      if (Object.keys(duplicateErrors).length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...duplicateErrors, // Chỉ cập nhật lỗi trùng lặp
        }));
        return false; // Dữ liệu không hợp lệ
      }
  
      return true; // Dữ liệu hợp lệ
    } catch (error) {
      console.error("Lỗi kiểm tra trùng lặp:", error);
      toast.error("Lỗi khi kiểm tra dữ liệu trùng lặp!");
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
  
    const isUnique = await checkDuplicateFields(); // Chờ kiểm tra xong
    if (!isUnique) {
      toast.error("Thông tin nhập vào đã tồn tại, vui lòng kiểm tra lại!");
      return;
    }
  
    try {
      const formattedData = {
        ...formData,
        gioiTinh: formData.gioiTinh === "Nam",
      };
  
      const response = await getPostApi(formattedData);
      if (response && response.data) {
        toast.success("Khách hàng mới đã được tạo!");
        getAllKhachHang();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo khách hàng!");
      console.error(error);
    }
  };
  

  return (
    <div className="flex-1 bg-white text-black overflow-auto relative w-screen">
      <div className="KhachHang p-3">
        <div className="container mt-3">
          <h4 className="title">Thêm khách hàng</h4>
          <form onSubmit={handleSubmit} className="form">
            <div className="mb-3">
              <label className="form-label">Mã khách hàng</label>
              <Input
                type="text"
                name="maKhachHang"
                value={formData.maKhachHang}
                onChange={handleChange}
              />
              {errors.maKhachHang && <p className="text-danger">{errors.maKhachHang}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Tên khách hàng</label>
              <Input
                type="text"
                name="tenKhachHang"
                value={formData.tenKhachHang}
                onChange={handleChange}
              />
              {errors.tenKhachHang && (
                <p className="text-danger">{errors.tenKhachHang}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-danger">{errors.email}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <Input
                type="text"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
              />
              {errors.soDienThoai && (
                <p className="text-danger">{errors.soDienThoai}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <Input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
              />
              {errors.ngaySinh && (
                <p className="text-danger">{errors.ngaySinh}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <Radio
                    type="radio"
                    name="gioiTinh"
                    checked={formData.gioiTinh === "Nam"}
                    onChange={() => handleGenderChange("Nam")}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <Radio
                    type="radio"
                    name="gioiTinh"
                    checked={formData.gioiTinh === "Nữ"}
                    onChange={() => handleGenderChange("Nữ")}
                  />{" "}
                  Nữ
                </label>
              </div>
              {errors.gioiTinh && (
                <p className="text-danger">{errors.gioiTinh}</p>
              )}
            </div>

            <button className="btn btn-light">
              <VscSave className="icon" /> Thêm khách hàng
            </button>
          </form>
          <button className="btn btn-outline-danger mt-3" onClick={handleClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateForm;
