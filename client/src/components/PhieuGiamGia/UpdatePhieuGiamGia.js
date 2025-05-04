import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  notification,
  Row,
  Col,
  Table,
  Modal,
} from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { CheckCircleTwoTone } from "@ant-design/icons";
const { Option } = Select;

const PhieuGiamGiaUpdate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [discountType, setDiscountType] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:8080/api/admin/phieu-giam-gia";
  const KHACH_HANG_URL =
    "http://localhost:8080/api/admin/phieu-giam-gia/khach_hang";

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Fetch danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) {
        notification.error({
          message: "Lỗi xác thực",
          description: "Không tìm thấy token đăng nhập",
        });
        return;
      }

      try {
        setCustomerLoading(true);
        const res = await axios.get(KHACH_HANG_URL, {
          headers: getAuthHeaders(),
        });
        const customerData = res.data || [];
        setCustomers(customerData);
        setFilteredCustomers(customerData);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách khách hàng.",
        });
      } finally {
        setCustomerLoading(false);
      }
    };
    fetchCustomers();
  }, [token]);

  // Fetch dữ liệu phiếu giảm giá
  useEffect(() => {
    if (!id || !token) return;

    const fetchVoucherData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: getAuthHeaders(),
        });
        const data = res.data;
        if (!data) {
          notification.error({
            message: "Không tìm thấy dữ liệu phiếu giảm giá!",
          });
          return;
        }

        form.setFieldsValue({
          ...data,
          ngayBatDau: data.ngayBatDau ? dayjs(data.ngayBatDau) : null,
          ngayKetThuc: data.ngayKetThuc ? dayjs(data.ngayKetThuc) : null,
          kieuGiamGia: data.kieuGiamGia || 1,
        });

        setDiscountType(data.kieuGiamGia || 1);

        const customerRes = await axios.get(`${API_URL}/${id}/khach-hang`, {
          headers: getAuthHeaders(),
        });
        const appliedCustomers = customerRes.data || [];
        const activeCustomerIds = appliedCustomers
          .filter((c) => c.trangThai) // Chỉ lấy khách hàng có trangThai === true
          .map((c) => c.id);
        setSelectedCustomers(activeCustomerIds);
      } catch (error) {
        notification.error({
          message: "Lỗi tải dữ liệu",
          description:
            error.response?.data?.message ||
            "Không thể tải dữ liệu phiếu giảm giá!",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVoucherData();
  }, [id, token, form]);

  // Xử lý thay đổi kiểu giảm giá
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    if (value === 1) {
      setSelectedCustomers([]); // Reset khách hàng khi chuyển sang công khai
    }
    form.setFieldsValue({
      soLuong:
        value === 2 ? selectedCustomers.length : form.getFieldValue("soLuong"),
    });
  };

  // Xử lý chọn/bỏ chọn khách hàng
  const handleCustomerSelect = (selectedRowKeys) => {
    const newCustomers = selectedRowKeys.filter(
      (id) => !selectedCustomers.includes(id)
    );
    const removedCustomers = selectedCustomers.filter(
      (id) => !selectedRowKeys.includes(id)
    );

    const handleAdd = async () => {
      try {
        await axios.put(`${API_URL}/${id}/add-customers`, newCustomers, {
          headers: getAuthHeaders(),
        });
        setSelectedCustomers(selectedRowKeys);
        notification.success({ message: "Đã thêm khách hàng vào phiếu!" });
        if (discountType === 2) {
          form.setFieldsValue({ soLuong: selectedRowKeys.length });
        }
      } catch (error) {
        notification.error({
          message: "Lỗi khi thêm khách hàng",
          description:
            error.response?.data?.message || "Không thể thêm khách hàng!",
        });
      }
    };

    const handleRemove = async (khachHangId) => {
      try {
        await axios.patch(
          `${API_URL}/${id}/remove-customer/${khachHangId}`,
          null,
          { headers: getAuthHeaders() }
        );
        setSelectedCustomers(selectedRowKeys);
        notification.success({ message: "Đã xóa khách hàng khỏi phiếu!" });
        if (discountType === 2) {
          form.setFieldsValue({ soLuong: selectedRowKeys.length });
        }
      } catch (error) {
        notification.error({
          message: "Lỗi khi xóa khách hàng",
          description:
            error.response?.data?.message || "Không thể xóa khách hàng!",
        });
      }
    };

    if (discountType === 2) {
      if (newCustomers.length > 0) {
        Modal.confirm({
          title: "Xác nhận thêm",
          content: "Bạn có chắc chắn muốn thêm khách hàng này?",
          onOk: handleAdd,
        });
      } else if (removedCustomers.length > 0) {
        Modal.confirm({
          title: "Xác nhận xóa",
          content:
            "5Bạn có chắc chắn muốn xóa khách hàng này khỏi phiếu giảm giá?",
          onOk: async () => {
            for (const khachHangId of removedCustomers) {
              await handleRemove(khachHangId);
            }
          },
        });
      } else {
        setSelectedCustomers(selectedRowKeys);
      }
    } else {
      setSelectedCustomers(selectedRowKeys);
    }
  };

  // Tìm kiếm khách hàng
  const handleSearch = (value) => {
    setSearchValue(value);
    setFilteredCustomers(
      customers.filter(
        (customer) =>
          customer.tenKhachHang?.toLowerCase().includes(value.toLowerCase()) ||
          customer.soDienThoai?.includes(value)
      )
    );
  };

  // Submit form
  const onFinish = async (values) => {
    if (!token) {
      notification.error({
        message: "Lỗi xác thực",
        description: "Không tìm thấy token đăng nhập",
      });
      return;
    }

    try {
      setLoading(true);
      const formatDate = (date) =>
        date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : null;

      const requestData = {
        ...values,
        ngayBatDau: formatDate(values.ngayBatDau),
        ngayKetThuc: formatDate(values.ngayKetThuc),
        khachHangsToAdd: discountType === 2 ? selectedCustomers : [],
        khachHangsToCancel: [],
      };

      console.log("Dữ liệu gửi đi:", JSON.stringify(requestData)); // Debug dữ liệu gửi đi
      await axios.put(`${API_URL}/${id}`, requestData, {
        headers: getAuthHeaders(),
      });
      notification.success({ message: "Cập nhật phiếu giảm giá thành công!" });
      navigate("/admin/phieu-giam-gia");
    } catch (error) {
      notification.error({
        message: "Lỗi cập nhật",
        description:
          error.response?.data?.message || "Không thể cập nhật phiếu giảm giá!",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tên khách hàng", dataIndex: "tenKhachHang", key: "tenKhachHang" },
    { title: "Số điện thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Trạng thái",
      key: "trangThai",
      render: (_, record) =>
        selectedCustomers.includes(record.id) ? (
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        ) : null,
    },
  ];

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div
        style={{
          flex: "0 0 40%",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h5 style={{ textAlign: "center" }}>Cập Nhật Phiếu Giảm Giá</h5>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          disabled={loading}
        >
          <Form.Item
            name="tenPhieuGiamGia"
            label="Tên phiếu giảm giá"
            rules={[
              { required: true, message: "Vui lòng nhập tên phiếu giảm giá" },
            ]}
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
                        return Promise.reject(
                          new Error("Giá trị giảm phải lớn hơn 0")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" placeholder="Nhập giá trị" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="giaTriToiThieu"
                label="Giá trị tối thiểu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập giá trị tối thiểu",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const parsedValue = parseFloat(value);
                      if (parsedValue < 10000) {
                        return Promise.reject(
                          new Error(
                            "Giá trị tối thiểu phải từ 10.000 VNĐ trở lên"
                          )
                        );
                      }
                      if (
                        parsedValue >
                        parseFloat(getFieldValue("soTienGiamToiDa"))
                      ) {
                        return Promise.reject(
                          new Error(
                            "Giá trị tối thiểu không được lớn hơn giá trị giảm tối đa"
                          )
                        );
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
                    return Promise.reject(
                      new Error("Số tiền giảm tối đa phải lớn hơn 0")
                    );
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
              {
                validator: (_, value) => {
                  const number = Number(value);
                  if (isNaN(number) || number <= 0) {
                    return Promise.reject("Số lượng phải lớn hơn 0");
                  }
                  return Promise.resolve();
                },
              },
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
            <Select disabled>
              {" "}
              {/* Vô hiệu hóa trường này */}
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
                        ? Promise.reject(
                            new Error("Ngày bắt đầu không được trong quá khứ")
                          )
                        : Promise.resolve(),
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
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
                      if (
                        startDate &&
                        value &&
                        dayjs(value).isBefore(dayjs(startDate))
                      ) {
                        return Promise.reject(
                          new Error("Ngày kết thúc phải sau ngày bắt đầu")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Cập Nhật
            </Button>
          </Form.Item>
        </Form>
      </div>

      {discountType === 2 && (
        <div style={{ flex: 3 }}>
          <h5>Danh sách khách hàng</h5>
          <Input.Search
            placeholder="Tìm kiếm khách hàng"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: "10px", width: "50%" }}
            disabled={customerLoading}
          />
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            loading={customerLoading}
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

export default PhieuGiamGiaUpdate;
