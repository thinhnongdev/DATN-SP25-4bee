import { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, DatePicker, Select, Table, notification, Row, Col, message } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { debounce } from "lodash";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

// Interface cho dữ liệu khách hàng
const Customer = {
  id: String,
  tenKhachHang: String,
  soDienThoai: String,
  email: String,
};

const PhieuGiamGiaAdd = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [discountType, setDiscountType] = useState(1); // 1: %, 2: VND
  const [voucherType, setVoucherType] = useState(1); // 1: Công khai, 2: Cá nhân
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:8080/api/admin/phieu-giam-gia";
  const KHACH_HANG_URL = "http://localhost:8080/api/admin/phieu-giam-gia/khach_hang";

  // Hàm lấy headers xác thực
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Tải danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) {
        notification.error({
          message: "Lỗi xác thực",
          description: "Không tìm thấy token đăng nhập",
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(KHACH_HANG_URL, { headers: getAuthHeaders() });
        const data = Array.isArray(response.data) ? response.data : [];
        setCustomers(data);
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
  }, [token, navigate]);

  // Tối ưu hóa tìm kiếm khách hàng với debounce
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchValue(value);
      }, 300),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  // Lọc danh sách khách hàng dựa trên searchValue
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      (customer?.tenKhachHang?.toLowerCase().includes(searchValue.toLowerCase()) ||
       customer?.soDienThoai?.includes(searchValue))
    );
  }, [customers, searchValue]);

  // Xử lý thay đổi loại phiếu giảm giá (% hoặc VND)
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    form.setFieldsValue({ 
      giaTriGiam: null, 
      soTienGiamToiDa: value === 2 ? null : form.getFieldValue("soTienGiamToiDa") 
    });
  };

  // Xử lý thay đổi kiểu giảm giá (Công khai hoặc Cá nhân)
  const handleVoucherTypeChange = (value) => {
    setVoucherType(value);
    setSelectedCustomers([]);
    form.setFieldsValue({ soLuong: value === 2 ? 1 : null });
  };

  // Xử lý chọn khách hàng
  const handleCustomerSelect = (selectedRowKeys) => {
    setSelectedCustomers(selectedRowKeys);
    if (voucherType === 2) {
      form.setFieldsValue({ soLuong: selectedRowKeys.length });
    }
  };

  // Gửi form
  const onFinish = async (values) => {
    if (voucherType === 2 && selectedCustomers.length === 0) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn ít nhất một khách hàng cho phiếu giảm giá cá nhân.",
      });
      return;
    }

    const requestData = {
      ...values,
      loaiPhieuGiamGia: discountType,
      idKhachHang: voucherType === 2 ? selectedCustomers : [],
      soTienGiamToiDa: discountType === 2 ? null : values.soTienGiamToiDa,
      trangThai: 1,
    };

    setLoading(true);
    try {
      await axios.post(API_URL, requestData, { headers: getAuthHeaders() });
      message.success("Thêm phiếu giảm giá thành công");
      form.resetFields();
      setSelectedCustomers([]);
      setSearchValue("");
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

  // Cột cho bảng khách hàng
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
          initialValues={{
            kieuGiamGia: 1,
            loaiPhieuGiamGia: 1,
            ngayBatDau: dayjs(),
            ngayKetThuc: dayjs().add(7, "day"),
            soTienGiamToiDa: null,
          }}
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
                      const loai = getFieldValue("loaiPhieuGiamGia");
                      const giaTriToiThieu = getFieldValue("giaTriToiThieu");
                      const numberValue = parseFloat(value);

                      if (!numberValue || numberValue <= 0) {
                        return Promise.reject("Giá trị giảm phải lớn hơn 0");
                      }

                      if (loai === 1 && numberValue > 100) {
                        return Promise.reject("Giảm phần trăm không được vượt quá 100%");
                      }

                      if (
                        loai === 2 &&
                        giaTriToiThieu &&
                        numberValue >= parseFloat(giaTriToiThieu)
                      ) {
                        return Promise.reject("Giá trị giảm phải nhỏ hơn giá trị tối thiểu");
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
                dependencies={["loaiPhieuGiamGia", "giaTriToiThieu"]}
              >
                <Input
                  type="number"
                  placeholder="Nhập giá trị"
                  addonAfter={
                    <Form.Item name="loaiPhieuGiamGia" noStyle>
                      <Select onChange={handleDiscountTypeChange}>
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
                label="Giá trị đơn hàng tối thiểu"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị tối thiểu" },
                  {
                    validator: (_, value) => {
                      const parsedValue = parseFloat(value);
                      if (parsedValue < 10000) {
                        return Promise.reject("Giá trị tối thiểu phải từ 10.000 VNĐ");
                      }
                      return Promise.resolve();
                    },
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const loai = getFieldValue("loaiPhieuGiamGia");
                      const giaTriGiam = getFieldValue("giaTriGiam");

                      if (
                        loai === 2 &&
                        giaTriGiam &&
                        parseFloat(value) <= parseFloat(giaTriGiam)
                      ) {
                        return Promise.reject("Giá trị tối thiểu phải lớn hơn giá trị giảm");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                dependencies={["loaiPhieuGiamGia", "giaTriGiam"]}
              >
                <Input type="number" placeholder="Nhập giá trị tối thiểu" addonAfter="VND" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="soTienGiamToiDa"
            label="Số tiền giảm tối đa"
            rules={[
              {
                required: discountType === 1,
                message: "Vui lòng nhập số tiền giảm tối đa",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (discountType === 2) {
                    return Promise.resolve(); // Không validate khi chọn VND
                  }
                  const loai = getFieldValue("loaiPhieuGiamGia");
                  const giaTriGiam = parseFloat(getFieldValue("giaTriGiam"));
                  const giaTriToiThieu = parseFloat(getFieldValue("giaTriToiThieu"));
                  const soTienGiamToiDa = parseFloat(value);

                  if (soTienGiamToiDa <= 0) {
                    return Promise.reject("Số tiền giảm tối đa phải lớn hơn 0");
                  }

                  if (loai === 1 && giaTriToiThieu && giaTriGiam) {
                    const tinhToan = (giaTriToiThieu * giaTriGiam) / 100;
                    if (soTienGiamToiDa < tinhToan) {
                      return Promise.reject(
                        `Số tiền giảm tối đa phải ≥ ${tinhToan} VNĐ (${giaTriGiam}% của ${giaTriToiThieu})`
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
            dependencies={["loaiPhieuGiamGia", "giaTriGiam", "giaTriToiThieu"]}
          >
            <Input
              type="number"
              placeholder={discountType === 2 ? "Không giới hạn" : "Nhập số tiền giảm tối đa"}
              addonAfter="VND"
              disabled={discountType === 2}
              value={discountType === 2 ? undefined : form.getFieldValue("soTienGiamToiDa")}
            />
          </Form.Item>

          <Form.Item
            name="soLuong"
            label="Số lượng phiếu"
            rules={[{ required: true, message: "Vui lòng nhập số lượng phiếu" }]}
          >
            <Input
              type="number"
              placeholder="Nhập số lượng phiếu"
              disabled={voucherType === 2}
            />
          </Form.Item>

          <Form.Item
            name="kieuGiamGia"
            label="Kiểu giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
          >
            <Select onChange={handleVoucherTypeChange}>
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
                  {
                    validator: (_, value) =>
                      value && dayjs(value).isBefore(dayjs())
                        ? Promise.reject("Ngày bắt đầu không được trong quá khứ")
                        : Promise.resolve(),
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
                        return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu");
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

      {voucherType === 2 && (
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