import { useState } from "react";
import { VscSave } from "react-icons/vsc";
import { toast } from "react-toastify";
import "./CreateForm.css";
import "./NhanVien.css";
import { getPostApi } from "../Api/NhanVienApi";

function CreateForm({ handleClose, getAllNhanVien }) {
  const [formData, setFormData] = useState({
    ma_nhan_vien: "",
    ten_nhan_vien: "",
    email: "",
    so_dien_thoai: "",
    ngay_sinh: "",
    gioi_tinh: "",
    trang_thai: true,
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "ma_nhan_vien" && !value.trim()) {
      errorMsg = "Mã nhân viên không được để trống!";
    }

    if (name === "ten_nhan_vien" && !value.trim()) {
      errorMsg = "Tên nhân viên không được để trống!";
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) errorMsg = "Email không được để trống!";
      else if (!emailRegex.test(value)) errorMsg = "Email không hợp lệ!";
    }

    if (name === "so_dien_thoai") {
      const phoneRegex = /^(0[2-9]|84)[0-9]{8,9}$/;
      if (!value.trim()) errorMsg = "Số điện thoại không được để trống!";
      else if (!phoneRegex.test(value))
        errorMsg = "Số điện thoại không hợp lệ!";
    }

    if (name === "ngay_sinh") {
      if (!value) errorMsg = "Ngày sinh không được để trống!";
      else {
        const today = new Date();
        const selectedDate = new Date(value);
        if (selectedDate > today) {
          errorMsg = "Ngày sinh không được lớn hơn ngày hiện tại!";
        }
      }
    }

    if (name === "gioi_tinh" && !value) {
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
      gioi_tinh: gender,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      gioi_tinh: validateField("gioi_tinh", gender),
    }));
  };

  const checkDuplicateFields = async () => {
    try {
      const existingEmployees = await getAllNhanVien();
      
      if (!existingEmployees) {
        toast.error("Không thể lấy dữ liệu nhân viên!");
        return false;
      }
  
      let duplicateErrors = {};
  
      if (existingEmployees.some(emp => emp.ma_nhan_vien === formData.ma_nhan_vien)) {
        duplicateErrors.ma_nhan_vien = "Mã nhân viên đã tồn tại!";
      }
      if (existingEmployees.some(emp => emp.email === formData.email)) {
        duplicateErrors.email = "Email đã được sử dụng!";
      }
      if (existingEmployees.some(emp => emp.so_dien_thoai === formData.so_dien_thoai)) {
        duplicateErrors.so_dien_thoai = "Số điện thoại đã được sử dụng!";
      }
  
      setErrors(duplicateErrors);
      return Object.keys(duplicateErrors).length === 0;
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
  
    const isUnique = await checkDuplicateFields();
    if (!isUnique) {
      toast.error("Thông tin nhập vào đã tồn tại, vui lòng kiểm tra lại!");
      return;
    }
  
    try {
      const formattedData = {
        ...formData,
        gioi_tinh: formData.gioi_tinh === "Nam" ? true : false,
      };
  
      const response = await getPostApi(formattedData);
      if (response && response.data) {
        toast.success("Nhân viên mới đã được tạo!");
        getAllNhanVien();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo nhân viên!");
      console.error(error);
    }
  };
  

  return (
    <div className="flex-1 bg-white text-black overflow-auto relative w-screen">
      <div className="NhanVien p-4">
        <div className="container mt-4">
          <h4 className="title">Thêm nhân viên</h4>
          <form onSubmit={handleSubmit} className="form">
            <div className="mb-3">
              <label className="form-label">Mã nhân viên</label>
              <input
                type="text"
                className="form-control"
                name="ma_nhan_vien"
                value={formData.ma_nhan_vien}
                onChange={handleChange}
              />
              {errors.ma_nhan_vien && (
                <p className="text-danger">{errors.ma_nhan_vien}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Tên nhân viên</label>
              <input
                type="text"
                className="form-control"
                name="ten_nhan_vien"
                value={formData.ten_nhan_vien}
                onChange={handleChange}
              />
              {errors.ten_nhan_vien && (
                <p className="text-danger">{errors.ten_nhan_vien}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-danger">{errors.email}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
              />
              {errors.so_dien_thoai && (
                <p className="text-danger">{errors.so_dien_thoai}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                name="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
              />
              {errors.ngay_sinh && (
                <p className="text-danger">{errors.ngay_sinh}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="gioi_tinh"
                    checked={formData.gioi_tinh === "Nam"}
                    onChange={() => handleGenderChange("Nam")}
                  />{" "}
                  Nam
                </label>
                <label className="ms-3">
                  <input
                    type="radio"
                    name="gioi_tinh"
                    checked={formData.gioi_tinh === "Nữ"}
                    onChange={() => handleGenderChange("Nữ")}
                  />{" "}
                  Nữ
                </label>
              </div>
              {errors.gioi_tinh && (
                <p className="text-danger">{errors.gioi_tinh}</p>
              )}
            </div>

            <button className="btn btn-light">
              <VscSave className="icon" /> Thêm nhân viên
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
