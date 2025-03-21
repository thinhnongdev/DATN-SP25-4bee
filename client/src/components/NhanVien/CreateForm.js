import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Radio,
  Input,
  Form,
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  Divider,
  Modal,
} from "antd";
import { getPostApi, scanQRCode } from "../NhanVien/NhanVienApi";
import axios from "axios";
import QrScanner from "react-qr-scanner";

const { Option } = Select;

function CreateForm({ handleClose, getAllNhanVien }) {
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    tenNhanVien: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: "",
    trangThai: true,
    anh: "",
    canCuocCongDan: "",
    tinh: "",
    huyen: "",
    xa: "",
    diaChiCuThe: "",
  });

  useEffect(() => {
    const fetchTinhThanh = async () => {
      try {
        const response = await axios.get("http://localhost:5000/data");
        console.log("Dữ liệu API nhận được:", response.data); // Kiểm tra dữ liệu

        // Kiểm tra response.data có phải là mảng không
        setTinhThanhList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
        setTinhThanhList([]); // Nếu lỗi, đặt giá trị mặc định là []
      }
    };

    fetchTinhThanh();
  }, []);

  useEffect(() => {
    console.log("Danh sách tỉnh/thành đã cập nhật:", tinhThanhList);
  }, [tinhThanhList]);

  const handleTinhChange = async (tinhName) => {
    setSelectedTinh(tinhName);
    setSelectedHuyen(null);
    setSelectedXa(null);
    setQuanHuyenList([]); // Reset danh sách quận/huyện
    setXaPhuongList([]); // Reset danh sách xã/phường

    try {
      const response = await axios.get("http://localhost:5000/data");
      console.log("Dữ liệu API nhận được:", response.data);

      // Kiểm tra dữ liệu có đúng dạng không
      if (!Array.isArray(response.data)) {
        console.error("Dữ liệu không hợp lệ");
        return;
      }

      // Tìm tỉnh/thành theo ID
      const selectedTinh = response.data.find((tinh) => tinh.name === tinhName);

      // Nếu tìm thấy, lấy danh sách quận/huyện của tỉnh đó
      setQuanHuyenList(selectedTinh ? selectedTinh.data2 : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      setQuanHuyenList([]);
    }
  };
  useEffect(() => {
    console.log("danh sách huyện:", quanHuyenList);
  }, [quanHuyenList]);

  // Khi chọn quận/huyện → Cập nhật danh sách xã/phường
  const handleHuyenChange = async (huyenName) => {
    setSelectedHuyen(huyenName);
    setSelectedXa(null);
    setXaPhuongList([]); // Reset danh sách xã/phường

    try {
      const response = await axios.get("http://localhost:5000/data");
      console.log("Dữ liệu API nhận được:", response.data);

      // Kiểm tra dữ liệu có đúng dạng không
      if (!Array.isArray(response.data)) {
        console.error("Dữ liệu không hợp lệ");
        return;
      }

      // Tìm tỉnh/thành có chứa huyện đã chọn
      const selectedTinh = response.data.find(
        (tinh) =>
          tinh.data2 && tinh.data2.some((huyen) => huyen.name === huyenName)
      );

      if (!selectedTinh) {
        console.error("Không tìm thấy tỉnh chứa huyện này");
        return;
      }

      // Tìm huyện theo ID trong tỉnh đã tìm thấy
      const selectedHuyen = selectedTinh.data2.find(
        (huyen) => huyen.name === huyenName
      );

      // Nếu tìm thấy huyện, lấy danh sách xã/phường từ `data3`
      setXaPhuongList(selectedHuyen ? selectedHuyen.data3 : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xã/phường:", error);
      setXaPhuongList([]);
    }
  };

  // useEffect(() => {
  //   console.log("Danh sách xã/phường mới cập nhật:", secl);
  // }, [xaPhuongList]);

  // Khi chọn xã/phường
  const handleXaChange = (xaName) => {
    setSelectedXa(xaName);
    console.log("tỉnh", selectedTinh);
    console.log("huyện", selectedHuyen);
    console.log("xã", xaName);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
        setIsModalVisible(false);
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

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // Nếu người dùng nhập lại giá trị mới, xóa lỗi
      if (newErrors[name]) {
        delete newErrors[name];
      }

      return newErrors;
    });
  };

  const checkDuplicateFields = async () => {
    try {
      const existingEmployees = await getAllNhanVien();

      if (!Array.isArray(existingEmployees)) {
        toast.error("Lỗi khi lấy dữ liệu nhân viên!");
        return false;
      }

      let duplicateErrors = {}; // Reset lỗi trước khi kiểm tra

      // Kiểm tra email trùng lặp
      if (formData.email.trim()) {
        const isEmailDuplicate = existingEmployees.some(
          (emp) => emp.email === formData.email
        );
        if (isEmailDuplicate) {
          duplicateErrors.email = "Email đã được sử dụng!";
        }
      }

      // Kiểm tra số điện thoại trùng lặp
      if (formData.soDienThoai.trim()) {
        const isPhoneDuplicate = existingEmployees.some(
          (emp) => emp.soDienThoai === formData.soDienThoai
        );
        if (isPhoneDuplicate) {
          duplicateErrors.soDienThoai = "Số điện thoại đã được sử dụng!";
        }
      }

      // Kiểm tra CCCD trùng lặp
      if (formData.canCuocCongDan.trim()) {
        const isCCCDDuplicate = existingEmployees.some(
          (emp) => emp.canCuocCongDan === formData.canCuocCongDan
        );
        if (isCCCDDuplicate) {
          duplicateErrors.canCuocCongDan = "Số CCCD đã được sử dụng!";
        }
      }

      setErrors(duplicateErrors);

      // **Trả về true nếu không có lỗi**
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
  const handleSubmit = async () => {
    if (!formData.anh) {
      toast.error("Vui lòng tải lên ảnh nhân viên!");
      return;
    }

    // **Chờ kiểm tra trùng lặp trước khi submit**
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
      tinh: formData.tinh,
      huyen: formData.huyen,
      xa: formData.xa,
      diaChiCuThe: formData.diaChiCuThe,
    };

    try {
      const response = await getPostApi(newNhanVien);
      if (response && response.data) {
        toast.success("Nhân viên mới đã được tạo!");
        getAllNhanVien();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo nhân viên!");
      console.error("ERROR", error);
    }
  };

  return (
    <Card className="create-form-container">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  onChange={handleChange}
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={16}>
            <div className="right-section">
              <Button
                title="Quét mã QR"
                block
                onClick={showModal}
                style={{
                  marginBottom: "16px",
                  width: "80px",
                  marginLeft: "700px",
                  position: "absolute",
                }}
              >
                Quét QR
              </Button>

              <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
              >
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                />
              </Modal>
              <h5>Thông tin chi tiết</h5>
              <Divider />

              <Form.Item
                name="canCuocCongDan"
                label="Số CCCD"
                validateStatus={errors.canCuocCongDan ? "error" : ""}
                help={errors.canCuocCongDan}
                rules={[{ required: true, message: "Vui lòng nhập số CCCD!" }]}
              >
                <Input
                  placeholder="Nhập số CCCD"
                  onChange={handleChange}
                  onBlur={checkDuplicateFields}
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
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  placeholder="Nhập email"
                  onChange={handleChange}
                  onBlur={checkDuplicateFields} // Kiểm tra trùng lặp khi rời khỏi ô nhập
                />
              </Form.Item>

              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                validateStatus={errors.soDienThoai ? "error" : ""}
                help={errors.soDienThoai}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  onChange={handleChange}
                  onBlur={checkDuplicateFields}
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
                      onChange={handleTinhChange}
                      placeholder="Chọn tỉnh/thành phố"
                      name="tinh"
                    >
                      {tinhThanhList.map((tinh) => (
                        <Option key={tinh.id} value={tinh.name}>
                          {tinh.name}
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
                      onChange={handleHuyenChange}
                      placeholder="Chọn quận/huyện"
                      disabled={!selectedTinh}
                      name="huyen"
                    >
                      {quanHuyenList.map((huyen) => (
                        <Option key={huyen.id} value={huyen.name}>
                          {huyen.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Xã/Phường"
                    name="xa"
                    rules={[
                      { required: true, message: "Vui lòng chọn xã/phường" },
                    ]}
                  >
                    <Select
                      onChange={handleXaChange}
                      placeholder="Chọn xã/phường"
                      disabled={!selectedHuyen}
                      name="xa"
                    >
                      {xaPhuongList.map((xa) => (
                        <Option key={xa.id} value={xa.name}>
                          {xa.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="diaChiCuThe"
                label="Địa chỉ cụ thể"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ cụ thể!" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ cụ thể" />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
                <Button type="primary" htmlType="submit">
                  Thêm nhân viên
                </Button>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default CreateForm;
