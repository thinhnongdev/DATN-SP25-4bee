import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Radio,
  Button,
  Card,
  Row,
  Col,
} from "antd";
import { getPostApi } from "./KhachHangApi";
import axios from "axios";

const { Option } = Select;

function CreateForm({ getAllKhachHang, handleClose }) {
  const [form] = Form.useForm();
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);

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
        (tinh) => tinh.data2 && tinh.data2.some((huyen) => huyen.name === huyenName)
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

  const [formData, setFormData] = useState({
    tenKhachHang: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: "",
    trangThai: true,
    diaChi: [
      {
        tinh: "",
        huyen: "",
        xa: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = "";

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
  const handleDateChange = (date, dateString) => {
    console.log("Ngày sinh được chọn:", dateString); // Debug
    setFormData((prevState) => ({
      ...prevState,
      ngaySinh: dateString, // Lưu dưới dạng chuỗi "DD/MM/YYYY"
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Thay đổi: ${name} = ${value}`);
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
      gioiTinh: gender.target.value,
    }));

    // setErrors((prevErrors) => ({
    //   ...prevErrors,
    //   gioiTinh: validateField("gioiTinh", gender),
    // }));
  };

  const checkDuplicateFields = async () => {
    try {
      const existingCustomers = await getAllKhachHang();

      if (!existingCustomers) {
        toast.error("Không thể lấy dữ liệu khách hàng!");
        return false;
      }

      let duplicateErrors = {}; // Chỉ lưu lỗi trùng lặp mới

      // Kiểm tra trùng lặp Email
      if (existingCustomers.some((cus) => cus.email === formData.email)) {
        duplicateErrors.email = "Email đã được sử dụng!";
      }

      // Kiểm tra trùng lặp Số điện thoại
      if (
        existingCustomers.some(
          (cus) => cus.soDienThoai === formData.soDienThoai
        )
      ) {
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
      return false;
    }
  };
  useEffect(() => {
    console.log("Khách hàng mới:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    // e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const isUnique = await checkDuplicateFields(); // Chờ kiểm tra xong
    if (!isUnique) {
      toast.error("Thông tin nhập vào đã tồn tại, vui lòng kiểm tra lại!");
      return;
    }
    console.log("tỉnh selected", selectedTinh);
    console.log("huyện selected", selectedHuyen);
    console.log("xã selected", selectedXa);
    const newKhachHang = {
      tenKhachHang: formData.tenKhachHang,
      email: formData.email,
      soDienThoai: formData.soDienThoai,
      ngaySinh: formData.ngaySinh,
      gioiTinh: formData.gioiTinh === "Nam",
      diaChi: [
        {
          tinh: selectedTinh,
          huyen: selectedHuyen,
          xa: selectedXa,
        },
      ],
    };

    try {
      const response = await getPostApi(newKhachHang);
      if (response && response.data) {
        toast.success("Khách hàng mới đã được tạo!");
        // Truyền dữ liệu khách hàng mới về component cha khi đóng form
        if (handleClose) {
          handleClose(response.data); // Truyền khách hàng mới khi đóng form
        }
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo khách hàng!");
      console.error("ERROR", error);
    }
  };

  return (
    <div className="KhachHang" style={{ maxWidth: "900px", margin: "auto" }}>
      <Card style={{ padding: "20px", borderRadius: "10px" }}>
        <h5
          className="card-title"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          Thông tin khách hàng
        </h5>
        <hr />
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            {/* Cột chọn địa chỉ */}
            <Col md={12} xs={24}>
              <Form.Item
                label="Tỉnh/Thành phố"
                name="tinh"
                rules={[
                  { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
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

              <Form.Item
                label="Xã/Phường"
                name="xa"
                rules={[{ required: true, message: "Vui lòng chọn xã/phường" }]}
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

            {/* Cột thông tin khách hàng */}
            <Col md={12} xs={24}>
              <Form.Item
                label="Họ và tên"
                name="tenKhachHang"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input
                  placeholder="Nhập họ và tên"
                  name="tenKhachHang"
                  onChange={handleChange}
                />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="ngaySinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  name="ngaySinh"
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                  onChange={handleDateChange}
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Vui lòng nhập email hợp lệ",
                  },
                ]}
              >
                <Input
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  onChange={handleChange}
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="soDienThoai"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  name="soDienThoai"
                  onChange={handleChange}
                />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gioiTinh"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Radio.Group onChange={handleGenderChange} name="gioiTinh">
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Nút Lưu */}
          <Row justify="center">
            <Button type="primary" htmlType="submit" style={{ width: "150px" }}>
              Lưu khách hàng
            </Button>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default CreateForm;
