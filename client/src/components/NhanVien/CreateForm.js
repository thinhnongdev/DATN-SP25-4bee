import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button, Radio } from "antd";
import { Input } from "antd";
import { getPostApi, scanQRCode } from "./NhanVienApi";
import axios from "axios";
import QrScanner from "react-qr-scanner";
function CreateForm({ handleClose, getAllNhanVien }) {
  const [scanning, setScanning] = useState(false);
  const [formData, setFormData] = useState({
    tenNhanVien: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: "",
    trangThai: true,
    anh: "",
    canCuocCongDan: "",
  });

  const handleScan = async (data) => {
    if (data) {
      try {
        const nhanVien = await scanQRCode(data.text);
        setFormData({
          tenNhanVien: nhanVien.tenNhanVien,
          email: nhanVien.email,
          soDienThoai: nhanVien.soDienThoai,
          ngaySinh: nhanVien.ngaySinh,
          gioiTinh: nhanVien.gioiTinh ? "Nam" : "Nữ",
          trangThai: nhanVien.trangThai,
          anh: nhanVien.anh || "",
        });
        toast.success("Đã tìm thấy nhân viên từ mã QR!");
        setScanning(false); // Dừng camera sau khi quét thành công
      } catch (error) {
        toast.error("Không tìm thấy nhân viên từ QR!");
      }
    }
  };

  const handleError = (err) => {
    console.error("Lỗi khi quét QR:", err);
    toast.error("Lỗi khi quét mã QR!");
  };

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let errorMsg = "";

    if (name === "tenNhanVien" && !value.trim()) {
      errorMsg = "Tên nhân viên không được để trống!";
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) errorMsg = "Email không được để trống!";
      else if (!emailRegex.test(value)) errorMsg = "Email không hợp lệ!";
    }

    if (name === "soDienThoai") {
      const phoneRegex = /^(0[1-9])[0-9]{8}$/;
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

  const handleChangeCCCD = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "canCuocCongDan" ? value.replace(/\D/g, "") : value, // Chỉ cho phép số
    }));
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

      if (existingEmployees.some((emp) => emp.email === formData.email)) {
        duplicateErrors.email = "Email đã được sử dụng!";
      }
      if (
        existingEmployees.some(
          (emp) => emp.soDienThoai === formData.soDienThoai
        )
      ) {
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

  const handleUploadImage = async (files) => {
    console.log("đường dẫn ảnh:", files);
    if (!files || files.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    try {
      toast.info("Đang tải ảnh lên...");

      // Upload từng file lên Cloudinary
      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "ml_default"); // Thay thế bằng upload preset của bạn

          const response = await axios.post(
            "https://api.cloudinary.com/v1_1/dhh5mdeqo/image/upload", // Thay thế bằng cloud_name của bạn
            formData
          );
          console.log("dường dan anh:", response.data.secure_url);
          return response.data.secure_url; // Lấy URL sau khi upload thành công
        })
      );

      const uploadedUrls = uploadedImages.filter(String);
      if (uploadedUrls.length === 0) {
        throw new Error("Không có ảnh nào được tải lên.");
      }

      setFormData((prev) => ({ ...prev, anh: uploadedUrls[0] }));

      toast.success("Upload ảnh thành công!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Không thể tải ảnh lên, vui lòng thử lại.");
    }
  };

  // Theo dõi khi formData thay đổi
  useEffect(() => {
    console.log("formData đã cập nhật:", formData);
  }, [formData]);

  //Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!formData.anh) {
      toast.error("Vui lòng tải lên ảnh nhân viên!");
      return;
    }

    const isUnique = await checkDuplicateFields();
    if (!isUnique) {
      toast.error("Thông tin nhập vào đã tồn tại, vui lòng kiểm tra lại!");
      return;
    }

    const newNhanVien = {
      tenNhanVien: formData.tenNhanVien,
      email: formData.email,
      soDienThoai: formData.soDienThoai,
      ngaySinh: formData.ngaySinh,
      gioiTinh: formData.gioiTinh === "Nam" ? true : false,
      trangThai: formData.trangThai,
      anh: String(formData.anh),
      canCuocCongDan: formData.canCuocCongDan,
    };

    try {
      const response = await getPostApi(newNhanVien);
      if (response && response.data) {
        toast.success("Nhân viên mới đã được tạo!");
        console.log("Nhân viên mới:", response.data);
        getAllNhanVien();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo nhân viên!");
      console.error("ERROR", error);
      if (error.response) {
        console.error("Lỗi từ Cloudinary:", error.response.data);
        toast.error(`Lỗi tải ảnh: ${error.response.data.error.message}`);
      } else {
        toast.error("Không thể tải ảnh lên, vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="NhanVien">
      <div className="">
        {/* Khung thông tin nhân viên */}
        <div className="card" style={{ padding: "20px", borderRadius: "10px" }}>
          <h5 className="card-title">Thông tin nhân viên</h5>
          <hr />
          <form onSubmit={handleSubmit} className="form">
            <div className="row">
              {/* Cột trái: Ảnh đại diện + Mã nhân viên */}
              <div className="col-md-4 d-flex flex-column align-items-center">
                {/* Ảnh nhân viên */}
                <div
                  className="image-section"
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <img
                    src={formData.anh || "https://via.placeholder.com/150"}
                    alt="Ảnh nhân viên"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #ccc",
                      marginBottom: "10px",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadImage(e.target.files)}
                  />
                  <p style={{ fontSize: "12px", color: "#555" }}>
                    Nhấp vào ảnh để chọn
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Quét mã QR CCCD</label>
                  <Button onClick={() => setScanning(!scanning)}>
                    {scanning ? "Tắt Camera" : "Mở Camera"}
                  </Button>
                  {scanning && (
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: "100%", maxWidth: 400, marginTop: 10 }}
                    />
                  )}
                </div>
              </div>

              {/* Cột phải: Thông tin còn lại */}
              <div className="col-md-8">
                {/* Họ tên */}
                <div className="mb-4">
                  <label className="form-label">
                    Họ và tên <span style={{ color: "red" }}>*</span>
                  </label>
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

                {/* Ngày sinh */}
                <div className="mb-4">
                  <label className="form-label">
                    Ngày sinh <span style={{ color: "red" }}>*</span>
                  </label>
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

                {/* Email */}
                <div className="mb-4">
                  <label className="form-label">
                    Email <span style={{ color: "red" }}>*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-danger">{errors.email}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="mb-4">
                  <label className="form-label">
                    Số điện thoại <span style={{ color: "red" }}>*</span>
                  </label>
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

                {/* Giới tính */}
                <div className="mb-4">
                  <label className="form-label">
                    Giới tính <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <label className="me-3">
                      <Radio
                        name="gioiTinh"
                        checked={formData.gioiTinh === "Nam"}
                        onChange={() => handleGenderChange("Nam")}
                      />{" "}
                      Nam
                    </label>
                    <label>
                      <Radio
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

                <div className="mb-4">
                  <label className="form-label">
                    Căn cước công dân <span style={{ color: "red" }}>*</span>
                  </label>
                  <Input
                    type="text"
                    name="canCuocCongDan"
                    value={formData.canCuocCongDan}
                    onChange={handleChangeCCCD}
                  />
                  {errors.soDienThoai && (
                    <p className="text-danger">{errors.canCuocCongDan}</p>
                  )}
                </div>


                {/* Nút lưu nhân viên */}
                <div className="" style={{ marginLeft: 610 }}>
                  <button
                    className="btn btn-primary"
                    style={{ color: "#fff", width: "150px" }}
                  >
                    Thêm nhân viên
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateForm;
