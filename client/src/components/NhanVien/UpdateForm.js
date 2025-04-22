import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  message,
  Radio,
  Row,
  Select,
} from "antd";
import { Input } from "antd";
import { getPutApi } from "./NhanVienApi";
import axios from "axios";
import dayjs from "dayjs";
import { Option } from "antd/es/mentions";
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";
import { red } from "@mui/material/colors";

function UpdateForm({
  selectedNhanVien,
  getAllNhanVien,
  handleClose,
  onDeleteClick,
}) {
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);
  const API_TOKEN = "4f7fc40f-023f-11f0-aff4-822fc4284d92";
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
    // Lấy danh sách tỉnh/thành phố
    axios
      .get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: { Token: API_TOKEN, "Content-Type": "application/json" },
        }
      )
      .then((res) => setTinhThanhList(res.data.data))
      .catch((err) => console.error("Lỗi lấy tỉnh thành:", err));
  }, []);

  const handleTinhChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      tinh: value,
      huyen: null,
      xa: null,
      diaChiCuThe: null,
    }));

    axios
      .post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: Number(value) },
        { headers: { Token: API_TOKEN } }
      )
      .then((res) => setQuanHuyenList(res.data.data))
      .catch((err) => console.error("Lỗi lấy quận huyện:", err));
  };

  const handleHuyenChange = (value) => {
    setFormData((prev) => ({ ...prev, huyen: value, xa: null }));

    axios
      .post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: Number(value) },
        { headers: { Token: API_TOKEN } }
      )
      .then((res) => setXaPhuongList(res.data.data))
      .catch((err) => console.error("Lỗi lấy phường xã:", err));
  };

  useEffect(() => {
    // Lấy danh sách tỉnh/thành phố
    handleTinhChange(selectedNhanVien.tinh);
    handleHuyenChange(selectedNhanVien.huyen);
  }, []);

  console.log("formData", formData);
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
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: "Tên không được chứa số hoặc ký tự đặc biệt!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên nhân viên"
                  onChange={(e) =>
                    setFormData({ ...formData, tenNhanVien: e.target.value })
                  }
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
                validateStatus={errors.canCuocCongDan ? "error" : ""}
                help={errors.canCuocCongDan}
                rules={[
                  { required: true, message: "Vui lòng nhập số CCCD!" },
                  {
                    pattern: /^[0-9]{12}$/,
                    message:
                      "Số CCCD phải gồm 12 chữ số và không chứa kí tự đặc biệt!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số CCCD"
                  onChange={(e) =>
                    setFormData({ ...formData, canCuocCongDan: e.target.value })
                  }
                />
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
                    <Radio.Group
                      value={formData.gioiTinh}
                      onChange={(e) =>
                        setFormData({ ...formData, gioiTinh: e.target.value })
                      }
                      style={{ display: "flex", justifyContent: "flex-start" }}
                    >
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
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const age = moment().diff(value, "years");
                          if (age < 18) {
                            return Promise.reject(
                              "Nhân viên phải từ 18 tuổi trở lên!"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="YYYY-MM-DD"
                      value={
                        formData.ngaySinh ? moment(formData.ngaySinh) : null
                      } // Chuyển thành dayjs
                      onChange={(date, dateString) =>
                        setFormData({ ...formData, ngaySinh: dateString })
                      }
                      disabledDate={(current) =>
                        current && current > moment().endOf("day")
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
                <Input
                  placeholder="Nhập email"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Tỉnh/Thành phố"
                    name="tinh"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn tỉnh/thành phố",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn tỉnh/thành phố"
                      style={{ width: "100%" }}
                      onChange={handleTinhChange}
                      value={formData.tinh}
                    >
                      {tinhThanhList.map((item) => (
                        <Option
                          key={item.ProvinceID}
                          value={item.ProvinceID.toString()}
                        >
                          {item.ProvinceName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Quận/Huyện"
                    name="huyen"
                    rules={[
                      { required: true, message: "Vui lòng chọn quận/huyện" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn quận/huyện"
                      style={{ width: "100%" }}
                      onChange={handleHuyenChange}
                      value={formData.huyen}
                    >
                      {quanHuyenList.map((item) => (
                        <Option
                          key={item.DistrictID}
                          value={item.DistrictID.toString()}
                        >
                          {item.DistrictName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Phường/Xã"
                    name="xa"
                    rules={[
                      { required: true, message: "Vui lòng chọn phường/xã" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn phường/xã"
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        setFormData({ ...formData, xa: value })
                      }
                      value={formData.xa}
                    >
                      {xaPhuongList.map((item) => (
                        <Option key={item.WardCode} value={item.WardCode}>
                          {item.WardName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="diaChiCuThe" label="Địa chỉ cụ thể">
                <Input
                  placeholder="Nhập địa chỉ cụ thể"
                  onChange={(e) =>
                    setFormData({ ...formData, diaChiCuThe: e.target.value })
                  }
                />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
                <Button
                  type="default"
                  onClick={handleClose} // Hàm xử lý đóng form hoặc trở về danh sách
                  style={{ marginRight: "10px" }}
                >
                  Trở về
                </Button>
                <Button type="primary" htmlType="submit">
                  Cập nhật thông tin
                </Button>
                <Button type="danger" onClick={onDeleteClick}>
                  <DeleteOutlined />
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
