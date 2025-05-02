import { useState, useEffect } from "react";
import React, { useCallback, useRef } from 'react';
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
  Spin,
} from "antd";
import { getPostApi } from "./KhachHangApi";
import axios from "axios";
import { Modal } from "antd";
import moment from "moment";

const { Option } = Select;

function CreateForm({ getAllKhachHang, handleClose, onCancel }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const hasFetchedRef = useRef(false);

  // State cho danh sách địa chỉ
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  const [formData, setFormData] = useState({
    tenKhachHang: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    gioiTinh: true, // Mặc định giá trị Nam
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

  // Fetch dữ liệu tỉnh/thành phố từ backend thay vì gọi API GHN trực tiếp
  useEffect(() => {
    const fetchProvinces = async () => {
      if (hasFetchedRef.current) return;
      try {
        setAddressLoading(true);
        // Thay đường dẫn API GHN bằng API của backend
        const response = await axios.get(
          "http://localhost:8080/api/admin/hoa-don/dia-chi/tinh",
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json" 
            },
          }
        );
        // Đảm bảo format dữ liệu tương thích
        setTinhThanhList(
          response.data.map(province => ({
            ProvinceID: province.id || province.ProvinceID,
            ProvinceName: province.name || province.ProvinceName
          }))
        );

        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Lỗi khi lấy danh sách tỉnh:", err);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
      } finally {
        setAddressLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Hàm kiểm tra email đã tồn tại
  const validateEmail = async (_, value) => {
    if (!value) return Promise.resolve();
    
    try {
      setCheckingEmail(true);
      const response = await axios.get(`http://localhost:8080/api/admin/khach_hang/check-email?email=${encodeURIComponent(value)}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      
      if (response.data.exists) {
        return Promise.reject(new Error('Email này đã được sử dụng'));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Lỗi kiểm tra email:', error);
      return Promise.resolve(); // Bỏ qua lỗi khi gọi API
    } finally {
      setCheckingEmail(false);
    }
  };
  
  // Hàm kiểm tra số điện thoại đã tồn tại
  const validatePhone = async (_, value) => {
    if (!value) return Promise.resolve();
    
    try {
      setCheckingPhone(true);
      const response = await axios.get(`http://localhost:8080/api/admin/khach_hang/check-phone?soDienThoai=${encodeURIComponent(value)}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      
      if (response.data.exists) {
        return Promise.reject(new Error('Số điện thoại này đã được sử dụng'));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Lỗi kiểm tra số điện thoại:', error);
      return Promise.resolve(); // Bỏ qua lỗi khi gọi API
    } finally {
      setCheckingPhone(false);
    }
  };

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = useCallback(async (value, option) => {
    try {
      setAddressLoading(true);
      // Cập nhật state
      setFormData(prev => ({
        ...prev,
        diaChi: [{ ...prev.diaChi[0], tinh: value, huyen: "", xa: "" }]
      }));
      
      // Reset các select box phụ thuộc
      form.setFieldsValue({ huyen: undefined, xa: undefined });
      setQuanHuyenList([]);
      setXaPhuongList([]);

      // Gọi API backend để lấy danh sách quận/huyện
      const response = await axios.get(
        `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${value}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json" 
          }
        }
      );
      
      // Đảm bảo format dữ liệu tương thích
      setQuanHuyenList(
        response.data.map(district => ({
          DistrictID: district.id || district.DistrictID,
          DistrictName: district.name || district.DistrictName
        }))
      );
    } catch (err) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", err);
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setAddressLoading(false);
    }
  },[form]);

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = useCallback(async (value) => {
    try {
      setAddressLoading(true);
      // Cập nhật state
      setFormData(prev => ({
        ...prev,
        diaChi: [{ ...prev.diaChi[0], huyen: value, xa: "" }]
      }));
      
      // Reset select box phụ thuộc
      form.setFieldsValue({ xa: undefined });
      setXaPhuongList([]);

      // Gọi API backend để lấy danh sách phường/xã
      const response = await axios.get(
        `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${value}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json" 
          }
        }
      );
      
      // Đảm bảo format dữ liệu tương thích
      setXaPhuongList(
        response.data.map(ward => ({
          WardCode: ward.id || ward.WardCode,
          WardName: ward.name || ward.WardName
        }))
      );
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phường/xã:", err);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setAddressLoading(false);
    }
  },[form]);

  // Xử lý khi chọn phường/xã
  const handleWardChange = (value) => {
    setFormData(prev => ({
      ...prev,
      diaChi: [{ ...prev.diaChi[0], xa: value }]
    }));
  };

  // Xử lý khi submit form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu khách hàng
      const newKhachHang = {
        tenKhachHang: formData.tenKhachHang,
        email: formData.email,
        soDienThoai: formData.soDienThoai,
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh,
        diaChi: [{
          tinh: String(formData.diaChi[0].tinh),
          huyen: String(formData.diaChi[0].huyen),
          xa: String(formData.diaChi[0].xa),
          diaChiCuThe: formData.diaChi[0].diaChiCuThe,
        }],
      };

      // Gọi API để tạo khách hàng mới
      const response = await getPostApi(newKhachHang);
      
      if (response && response.data) {
        toast.success("Khách hàng mới đã được tạo!");
        
        // Làm mới danh sách khách hàng
        if (typeof getAllKhachHang === 'function') {
          getAllKhachHang();
        }
        
        // QUAN TRỌNG: Truyền dữ liệu khách hàng vào hàm callback
        if (typeof handleClose === 'function') {
          handleClose(response.data);
        }
      }
    } catch (error) {
      console.error("ERROR:", error);
      
      // Hiển thị thông báo lỗi chi tiết
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi khi tạo khách hàng");
        }
      } else {
        toast.error("Không thể kết nối đến máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận trước khi submit
  const handleConfirmSubmit = () => {
    // Kiểm tra form validation trước khi hiển thị modal xác nhận
    form.validateFields()
      .then(() => {
        Modal.confirm({
          title: "Xác nhận lưu khách hàng",
          content: "Bạn có chắc chắn muốn lưu thông tin khách hàng này?",
          okText: "Lưu",
          cancelText: "Hủy",
          onOk: handleSubmit
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <div>
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{
          gioiTinh: true, // Mặc định chọn Nam
        }}
        onValuesChange={(changedValues, allValues) => {
          // Cập nhật formData khi form values thay đổi
          if (changedValues.tenKhachHang !== undefined) {
            setFormData(prev => ({ ...prev, tenKhachHang: changedValues.tenKhachHang }));
          }
          if (changedValues.email !== undefined) {
            setFormData(prev => ({ ...prev, email: changedValues.email }));
          }
          if (changedValues.soDienThoai !== undefined) {
            setFormData(prev => ({ ...prev, soDienThoai: changedValues.soDienThoai }));
          }
          if (changedValues.gioiTinh !== undefined) {
            setFormData(prev => ({ ...prev, gioiTinh: changedValues.gioiTinh }));
          }
          if (changedValues.diaChiCuThe !== undefined) {
            setFormData(prev => ({
              ...prev,
              diaChi: [{ ...prev.diaChi[0], diaChiCuThe: changedValues.diaChiCuThe }]
            }));
          }
        }}
      >
        <Card style={{ padding: "20px", borderRadius: "10px" }}>
          <h2 style={{ position: "relative", left: 0, textAlign: "left" }}>
            Thông tin khách hàng
          </h2>
          <Divider />

          <Row gutter={24}>
            {/* Cột trái */}
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="tenKhachHang"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng!" },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: "Tên không được chứa số hoặc ký tự đặc biệt!",
                  },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="ngaySinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                  placeholder="Nhập ngày sinh"
                  onChange={(date, dateString) =>
                    setFormData(prev => ({ ...prev, ngaySinh: dateString }))
                  }
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                  { validator: validateEmail } // Kiểm tra trùng email
                ]}
                validateStatus={checkingEmail ? "validating" : undefined}
                help={checkingEmail ? "Đang kiểm tra email..." : undefined}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                  { validator: validatePhone } // Kiểm tra trùng số điện thoại
                ]}
                validateStatus={checkingPhone ? "validating" : undefined}
                help={checkingPhone ? "Đang kiểm tra số điện thoại..." : undefined}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                name="gioiTinh"
                label="Giới tính"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Radio.Group style={{ display: "flex", justifyContent: "flex-start" }}>
                  <Radio value={true}>Nam</Radio>
                  <Radio value={false}>Nữ</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* Cột phải */}
            <Col span={12}>
              <Form.Item
                label="Tỉnh/Thành phố"
                name="tinh"
                rules={[
                  { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
                ]}
              >
                <Select
                  placeholder={addressLoading ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                  style={{ width: "100%" }}
                  onChange={handleProvinceChange}
                  loading={addressLoading}
                  disabled={addressLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {tinhThanhList.map((item) => (
                    <Option key={item.ProvinceID} value={item.ProvinceID}>
                      {item.ProvinceName}
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
                  placeholder={addressLoading ? "Đang tải..." : "Chọn quận/huyện"}
                  style={{ width: "100%" }}
                  disabled={!formData.diaChi[0].tinh || addressLoading}
                  onChange={handleDistrictChange}
                  loading={addressLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {quanHuyenList.map((item) => (
                    <Option key={item.DistrictID} value={item.DistrictID}>
                      {item.DistrictName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Phường/Xã"
                name="xa"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  placeholder={addressLoading ? "Đang tải..." : "Chọn phường/xã"}
                  style={{ width: "100%" }}
                  disabled={!formData.diaChi[0].huyen || addressLoading}
                  onChange={handleWardChange}
                  loading={addressLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {xaPhuongList.map((item) => (
                    <Option key={item.WardCode} value={item.WardCode}>
                      {item.WardName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Địa chỉ cụ thể"
                name="diaChiCuThe"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường...)" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right", marginTop: 20 }}>
            <Button
              type="default"
              onClick={() => {
                if (typeof onCancel === 'function') {
                  onCancel();
                } else if (typeof handleClose === 'function') {
                  handleClose();
                }
              }}
              style={{ marginRight: "10px" }}
              disabled={loading}
            >
              Trở về
            </Button>
            <Button
              type="primary"
              style={{ width: "150px" }}
              onClick={handleConfirmSubmit}
              loading={loading}
              // Vô hiệu hóa nút khi đang loading hoặc đang kiểm tra trùng lặp
              disabled={loading || addressLoading || checkingEmail || checkingPhone}
            >
              {loading ? "Đang lưu..." : "Lưu khách hàng"}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}

export default React.memo(CreateForm);