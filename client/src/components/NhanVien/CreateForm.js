import { useState } from "react";
import { VscSave } from "react-icons/vsc";
import { toast } from "react-toastify";
import "./CreateForm.css";
import "./NhanVien.css";
import { Radio } from 'antd';
import { Input } from "antd";
import { getPostApi } from "./NhanVienApi";

function CreateForm({ handleClose, getAllNhanVien }) {
  const [formData, setFormData] = useState({
    maNhanVien: "",
    tenNhanVien: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: "",
    trangThai: true,
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "maNhanVien" && !value.trim()) {
      errorMsg = "Mã nhân viên không được để trống!";
    }

    if (name === "tenNhanVien" && !value.trim()) {
      errorMsg = "Tên nhân viên không được để trống!";
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
      const existingEmployees = await getAllNhanVien();
      
      if (!existingEmployees) {
        toast.error("Không thể lấy dữ liệu nhân viên!");
        return false;
      }
  
      let duplicateErrors = {};
  
      if (existingEmployees.some(emp => emp.maNhanVien === formData.maNhanVien)) {
        duplicateErrors.maNhanVien = "Mã nhân viên đã tồn tại!";
      }
      if (existingEmployees.some(emp => emp.email === formData.email)) {
        duplicateErrors.email = "Email đã được sử dụng!";
      }
      if (existingEmployees.some(emp => emp.soDienThoai === formData.soDienThoai)) {
        duplicateErrors.soDienThoai = "Số điện thoại đã được sử dụng!";
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
        gioiTinh: formData.gioiTinh === "Nam" ? true : false,
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
      <div className="NhanVien">
        <div className="container">
          <h4 className="title">Thêm nhân viên</h4>
          <form onSubmit={handleSubmit} className="form">
            <div className="mb-3">
              <label className="form-label">Mã nhân viên</label>
              <Input
                type="text"
                name="maNhanVien"
                value={formData.maNhanVien}
                onChange={handleChange}
              />
              {errors.maNhanVien && (
                <p className="text-danger">{errors.maNhanVien}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Tên nhân viên</label>
              <Input
                type="text"
                name="tenNhanVien"
                value={formData.tenNhanVien}
                onChange={handleChange}
              />
              {errors.tenNhanVien && (
                <p className="text-danger">{errors.tenNhanVien}</p>
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

            <button className="add btn btn-light">
              <VscSave className="icon" /> Thêm nhân viên
            </button>
          </form>
          <button className="btn btn-outline-danger mt-3" onClick={handleClose}>
            Hủy
          </button>
        </div>
      </div>
  );
}

export default CreateForm;
