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
  Divider,
} from "antd";
import { getPostApi } from "./KhachHangApi";
import axios from "axios";
import FormItem from "antd/es/form/FormItem";

const { Option } = Select;

function CreateForm({ getAllKhachHang, handleClose }) {
  const [form] = Form.useForm();
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);
  const API_TOKEN = "4f7fc40f-023f-11f0-aff4-822fc4284d92";

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

  useEffect(() => {
    console.log("Danh sách tỉnh/thành đã cập nhật:", tinhThanhList);
  }, [tinhThanhList]);

  const handleProvinceChange = (value) => {
    setFormData({
      ...formData,
      diaChi: { ...formData.diaChi, tinh: value, huyen: "", xa: "" },
    });

    // Lấy danh sách quận/huyện
    axios
      .post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: value },
        { headers: { Token: API_TOKEN } }
      )
      .then((res) => setQuanHuyenList(res.data.data))
      .catch((err) => console.error("Lỗi lấy quận huyện:", err));
  };

  console.log("Huyen", quanHuyenList);
  // Khi chọn quận/huyện → Cập nhật danh sách xã/phường
  const handleDistrictChange = (value) => {
    setFormData({
      ...formData,
      diaChi: { ...formData.diaChi, huyen: value, xa: "" },
    });

    // Lấy danh sách phường/xã
    axios
      .post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: value },
        { headers: { Token: API_TOKEN } }
      )
      .then((res) => setXaPhuongList(res.data.data))
      .catch((err) => console.error("Lỗi lấy phường xã:", err));
  };
  console.log(xaPhuongList)
  const handleWardChange = (value) => {
    setFormData({
      ...formData,
      diaChi: { ...formData.diaChi, xa: value },
    });
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
        diaChiCuThe: "",
      },
    ],
  });
  console.log(formData);
  const [errors, setErrors] = useState({});

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
      [name]: (name, value),
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prevState) => ({
      ...prevState,
      gioiTinh: gender.target.value,
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
      gioiTinh: formData.gioiTinh === "Nam" ? true : false,
      diaChi: [
        {
          tinh: formData.diaChi.tinh,
          huyen: formData.diaChi.huyen,
          xa: formData.diaChi.xa,
          diaChiCuThe: formData.diaChi.diaChiCuThe,
        },
      ],
    };

    console.log("Thông tin khách hàng mới:", newKhachHang);
    try {
      const response = await getPostApi(newKhachHang);
      if (response && response.data) {
        toast.success("Khách hàng mới đã được tạo!");
        getAllKhachHang();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo khách hàng!");
      console.error("ERROR", error);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card style={{ padding: "20px", borderRadius: "10px" }}>
          <h5 style={{ margin: 0 }}>Thông tin khách hàng</h5>
          <Divider />

          <Row gutter={16}>
            <Col span={12}>
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
                  placeholder="Nhập ngày sinh"
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

            <Col span={6}>
              <Form.Item strong>Tỉnh/Thành phố</Form.Item>
            </Col>
            <Col span={18}>
              <Select
                placeholder="Chọn tỉnh/thành phố"
                style={{ width: "100%" }}
                onChange={handleProvinceChange}
                value={formData.diaChi.tinh}
              >
                {tinhThanhList.map((item) => (
                  <Option key={item.ProvinceID} value={item.ProvinceID}>
                    {item.ProvinceName}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={6}>
              <Form.Item strong>Quận/huyện</Form.Item>
            </Col>
            <Col span={18}>
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                disabled={!formData.diaChi.tinh}
                style={{ width: "100%" }}
                value={formData.diaChi.huyen}
              >
                {quanHuyenList.map((item) => (
                  <Option key={item.DistrictID} value={item.DistrictID}>
                    {item.DistrictName}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={6}>
              <Form.Item strong>Phường/xã</Form.Item>
            </Col>
            <Col span={18}>
              <Select
                placeholder="Chọn phường/xã"
                style={{ width: "100%" }}
                disabled={!formData.diaChi.huyen}
                onChange={handleWardChange}
                value={formData.diaChi.xa}
              >
                {xaPhuongList.map((item) => (
                  <Option key={item.WardCode} value={item.WardCode}>
                    {item.WardName}
                  </Option>
                ))}
              </Select>

              <Form.Item
                label="Địa chỉ cụ thể"
                name="diaChiCuThe"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
                ]}
              >
                <Input
                  placeholder="Nhập địa chỉ cụ thể"
                  value={formData.diaChi.diaChiCuThe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diaChi: {
                        ...formData.diaChi,
                        diaChiCuThe: e.target.value,
                      },
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit" style={{ width: "150px" }}>
              Lưu khách hàng
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}

export default CreateForm;
