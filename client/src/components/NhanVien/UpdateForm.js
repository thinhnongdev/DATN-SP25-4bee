import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Radio,
  Row,
  Select,
} from "antd";
import { Input } from "antd";
import { getPutApi } from "./NhanVienApi";
import axios from "axios";
import dayjs from "dayjs";

function UpdateForm({ selectedNhanVien, getAllNhanVien, handleClose }) {
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  useEffect(() => {
    if (selectedNhanVien) {
      form.setFieldsValue({
        anh: selectedNhanVien.anh || "",
        tenNhanVien: selectedNhanVien.tenNhanVien || "",
        email: selectedNhanVien.email || "",
        soDienThoai: selectedNhanVien.soDienThoai || "",
        ngaySinh: selectedNhanVien.ngaySinh
          ? dayjs(selectedNhanVien.ngaySinh)
          : null,
        gioiTinh: selectedNhanVien.gioiTinh,
        trangThai: selectedNhanVien.trangThai,
        canCuocCongDan: selectedNhanVien.canCuocCongDan || "",
        tinh: selectedNhanVien.tinh || "",
        huyen: selectedNhanVien.huyen || "",
        xa: selectedNhanVien.xa || "",
        diaChiCuThe: selectedNhanVien.diaChiCuThe || "",
      });
      setFormData(selectedNhanVien);
    }
  }, [selectedNhanVien, form]);

  useEffect(() => {
    async function fetchTinhThanh() {
      try {
        const response = await axios.get("http://localhost:5000/data");
        setTinhThanhList(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
      }
    }
    fetchTinhThanh();
  }, []);

  const handleTinhChange = useCallback(async (value) => {
    form.setFieldsValue({ huyen: "", xa: "" });
    setQuanHuyenList([]);
    setXaPhuongList([]);
    try {
      const response = await axios.get("http://localhost:5000/data");
      const selectedTinh = response.data.find((tinh) => tinh.name === value);
      setQuanHuyenList(selectedTinh ? selectedTinh.data2 : []);
      setFormData((prev) => ({ ...prev, tinh: value, huyen: "", xa: "" }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    }
  }, [form]);

  const handleHuyenChange = useCallback(async (value) => {
    form.setFieldsValue({ xa: "" });
    setXaPhuongList([]);
    try {
      const response = await axios.get("http://localhost:5000/data");
      const selectedTinh = response.data.find((tinh) =>
        tinh.data2.some((huyen) => huyen.name === value)
      );
      const selectedHuyen = selectedTinh.data2.find(
        (huyen) => huyen.name === value
      );
      setXaPhuongList(selectedHuyen ? selectedHuyen.data3 : []);
      setFormData((prev) => ({ ...prev, huyen: value, xa: "" }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xã/phường:", error);
    }
  }, [form]);

  const handleXaChange = (value) => {
    setFormData((prev) => ({ ...prev, xa: value }));
  };

  useEffect(() => {
    if (selectedNhanVien?.tinh) {
      handleTinhChange(selectedNhanVien.tinh);
    }
  }, [selectedNhanVien?.tinh, handleTinhChange]);

  useEffect(() => {
    if (selectedNhanVien?.huyen) {
      handleHuyenChange(selectedNhanVien.huyen);
    }
  }, [selectedNhanVien?.huyen, handleHuyenChange]);

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
      [name]: (name, value),
    }));
  };

  const handleUpdate = (e) => {
    // e.preventDefault();

    const updatedNhanVien = {
      anh: formData.anh,
      tenNhanVien: formData.tenNhanVien,
      email: formData.email,
      soDienThoai: formData.soDienThoai,
      ngaySinh: formData.ngaySinh,
      gioiTinh: formData.gioiTinh,
      trangThai: formData.trangThai,
      canCuocCongDan: formData.canCuocCongDan,
      tinh: formData.tinh,
      huyen: formData.huyen,
      xa: formData.xa,
      diaChiCuThe: formData.diaChiCuThe,
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
    <Card className="create-form-container">
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={24}>
          <Col span={8}>
            <h5>Thông tin nhân viên</h5>
            <Divider />

            <div className="left-section">
              <div
                className="avatar-section"
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  border: "2px dashed #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  textAlign: "center",
                  marginLeft: 100,
                  marginBottom: 55,
                }}
              >
                {formData.anh ? (
                  <img
                    src={formData.anh}
                    alt="Ảnh nhân viên"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#999",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <span>Chọn ảnh</span>
                    <span
                      style={{ fontSize: "20px", cursor: "pointer" }}
                    ></span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleUploadImage(e.target.files)}
                />
              </div>

              <Form.Item
                name="tenNhanVien"
                label="Tên nhân viên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhân viên!" },
                ]}
              >
                <Input
                  placeholder="Nhập tên nhân viên"
                  onChange={formData.tenNhanVien}
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={16}>
            <div className="right-section">
              <h5>Thông tin chi tiết</h5>
              <Divider />

              <Form.Item
                name="canCuocCongDan"
                label="Số CCCD"
                rules={[{ required: true, message: "Vui lòng nhập số CCCD!" }]}
              >
                <Input placeholder="Nhập số CCCD" onChange={handleChangeCCCD} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gioiTinh"
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính!" },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={true}>Nam</Radio>
                      <Radio value={false}>Nữ</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ngaySinh"
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh!" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="DD-MM-YYYY"
                      value={
                        formData.ngaySinh ? dayjs(formData.ngaySinh) : null
                      } // Chuyển thành dayjs
                      onChange={(date) =>
                        setFormData({ ...formData, ngaySinh: date })
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" onChange={handleChange} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="tinh" label="Tỉnh/Thành phố">
                    <Select
                      onChange={handleTinhChange}
                      options={tinhThanhList.map((tinh) => ({
                        label: tinh.name,
                        value: tinh.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="huyen" label="Quận/Huyện">
                    <Select
                      onChange={handleHuyenChange}
                      disabled={!quanHuyenList.length}
                      options={quanHuyenList.map((huyen) => ({
                        label: huyen.name,
                        value: huyen.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="xa" label="Xã/Phường">
                    <Select
                      onChange={handleXaChange}
                      disabled={!xaPhuongList.length}
                      options={xaPhuongList.map((xa) => ({
                        label: xa.name,
                        value: xa.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="diaChiCuThe" label="Địa chỉ cụ thể">
                <Input placeholder="Nhập địa chỉ cụ thể" />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
                <Button type="primary" htmlType="submit">
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default UpdateForm;