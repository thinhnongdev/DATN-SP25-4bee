import { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, Table, notification, Row, Col } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const { Option } = Select;

const PhieuGiamGiaAdd = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [discountType, setDiscountType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:8080/api/admin/phieu-giam-gia";
  const KHACH_HANG_URL = "http://localhost:8080/api/admin/phieu-giam-gia/khach_hang";

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) {
        notification.error({
          message: "Lỗi xác thực",
          description: "Không tìm thấy token đăng nhập",
        });
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(KHACH_HANG_URL, {
          headers: getAuthHeaders(),
        });
        const data = response.data || [];
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        notification.error({
          message: "Lỗi",
          description: error.response?.data?.message || "Không thể tải danh sách khách hàng.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    setSelectedCustomers([]);
    form.setFieldsValue({ soLuong: value === 2 ? 0 : null });
  };

  const handleCustomerSelect = (selectedRowKeys) => {
    setSelectedCustomers(selectedRowKeys);
    if (discountType === 2) {
      form.setFieldsValue({ soLuong: selectedRowKeys.length });
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    const filteredData = customers.filter((customer) =>
      (customer?.tenKhachHang?.toLowerCase().includes(value.toLowerCase()) ||
       customer?.soDienThoai?.includes(value))
    );
    setFilteredCustomers(filteredData);
  };

  const onFinish = async (values) => {
    if (discountType === 2 && selectedCustomers.length === 0) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn ít nhất một khách hàng cho phiếu giảm giá cá nhân.",
      });
      return;
    }

    const requestData = {
      ...values,
      ngayBatDau: dayjs(values.ngayBatDau).format("YYYY-MM-DDTHH:mm:ss"), // Sử dụng định dạng ISO-8601
      ngayKetThuc: dayjs(values.ngayKetThuc).format("YYYY-MM-DDTHH:mm:ss"), // Sử dụng định dạng ISO-8601
      loaiPhieuGiamGia: discountType,
      idKhachHang: discountType === 2 ? selectedCustomers : [],
      trangThai: 1,
    };

    setLoading(true);
    try {
      console.log("Dữ liệu gửi đi:", JSON.stringify(requestData)); // Debug dữ liệu gửi đi
      await axios.post(API_URL, requestData, {
        headers: getAuthHeaders(),
      });
      toast.success("Thêm phiếu giảm giá thành công");
      form.resetFields();
      setSelectedCustomers([]);
      navigate("/admin/phieu-giam-gia");
    } catch (error) {
      console.error("Lỗi khi thêm phiếu giảm giá:", error);
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm phiếu giảm giá",
      });
    } finally {
      setLoading(false);
    }
  };

  const customerColumns = [
    { title: "Tên khách hàng", dataIndex: "tenKhachHang", key: "tenKhachHang" },
    { title: "Số điện thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "start", gap: "20px" }}>
      <div style={{ flex: "0 0 40%", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
        <h5 style={{ textAlign: "center" }}>Thêm Phiếu Giảm Giá</h5>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ kieuGiamGia: 1, loaiGiaTriGiam: 1 }}
          disabled={loading}
        >
          <Form.Item
            name="tenPhieuGiamGia"
            label="Tên phiếu giảm giá"
            rules={[{ required: true, message: "Vui lòng nhập tên phiếu giảm giá" }]}
          >
            <Input placeholder="Nhập tên phiếu giảm giá" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="giaTriGiam"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị giảm" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || parseFloat(value) <= 0) {
                        return Promise.reject(new Error("Giá trị giảm phải lớn hơn 0"));
                      }
                      if (getFieldValue("loaiGiaTriGiam") === 1 && parseFloat(value) > 100) {
                        return Promise.reject(new Error("Giá trị giảm phần trăm không được vượt quá 100%"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập giá trị"
                  addonAfter={
                    <Form.Item name="loaiGiaTriGiam" noStyle>
                      <Select>
                        <Option value={1}>%</Option>
                        <Option value={2}>VND</Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="giaTriToiThieu"
                label="Giá trị tối thiểu"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị tối thiểu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const parsedValue = parseFloat(value);
                      if (parsedValue < 10000) {
                        return Promise.reject(new Error("Giá trị tối thiểu phải từ 10.000 VNĐ trở lên"));
                      }
                      if (parsedValue > parseFloat(getFieldValue("soTienGiamToiDa"))) {
                        return Promise.reject(new Error("Giá trị tối thiểu không được lớn hơn giá trị giảm tối đa"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" placeholder="Nhập giá trị tối thiểu" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="soTienGiamToiDa"
            label="Số tiền giảm tối đa"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền giảm tối đa" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const parsedValue = parseFloat(value);
                  if (parsedValue <= 0) {
                    return Promise.reject(new Error("Số tiền giảm tối đa phải lớn hơn 0"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="number" placeholder="Nhập số tiền giảm tối đa" />
          </Form.Item>

          <Form.Item
            name="soLuong"
            label="Số lượng phiếu"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng phiếu" },
             
            ]}
          >
            <Input
              type="number"
              placeholder="Nhập số lượng phiếu"
              disabled={discountType === 2}
            />
          </Form.Item>

          <Form.Item
            name="kieuGiamGia"
            label="Kiểu giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
          >
            <Select onChange={handleDiscountTypeChange}>
              <Option value={1}>Công khai</Option>
              <Option value={2}>Cá nhân</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ngayBatDau"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  { validator: (_, value) =>
                    value && dayjs(value).isBefore(dayjs())
                      ? Promise.reject(new Error("Ngày bắt đầu không được trong quá khứ"))
                      : Promise.resolve()
                  },
                ]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ngayKetThuc"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue("ngayBatDau");
                      if (startDate && value && dayjs(value).isBefore(dayjs(startDate))) {
                        return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (không bắt buộc)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={loading}>
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </div>

      {discountType === 2 && (
        <div style={{ flex: 3 }}>
          <h5>Danh sách khách hàng</h5>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc số điện thoại"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: "10px", width: "50%" }}
            disabled={loading}
          />
          <Table
            columns={customerColumns}
            dataSource={filteredCustomers}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedCustomers,
              onChange: handleCustomerSelect,
            }}
            pagination={{ pageSize: 5 }}
          />
        </div>
      )}
    </div>
  );
};

export default PhieuGiamGiaAdd;