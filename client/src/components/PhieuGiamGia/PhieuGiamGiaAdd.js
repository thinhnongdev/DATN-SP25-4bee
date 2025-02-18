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
  const [discountType, setDiscountType] = useState(1); // 1: Công khai, 2: Cá nhân
  const [searchValue, setSearchValue] = useState("");
  const [disabledCustomerKeys, setDisabledCustomerKeys] = useState([]);
  const navigate = useNavigate();
  // Lấy danh sách khách hàng
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/phieu-giam-gia/khach_hang")
      .then((response) => {
        const data = response.data || [];
        setCustomers(data);
        setFilteredCustomers(data); // Hiển thị toàn bộ danh sách ban đầu
      })
      .catch((error) => {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách khách hàng.",
        });
      });
  }, []);

  const handleDiscountTypeChange2 = (value) => {
    setDiscountType(value);
    setSelectedCustomers([]); // Reset danh sách khách hàng
    form.setFieldsValue({ soLuong: value === 2 ? 0 : null }); // Reset số lượng phiếu
  };

  const handleCustomerSelect = (selectedRowKeys) => {
    setSelectedCustomers(selectedRowKeys);
    if (discountType === 2) {
      form.setFieldsValue({ soLuong: selectedRowKeys.length }); // Cập nhật số lượng phiếu
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    const filteredData = customers.filter((customer) =>
      customer.tenKhachHang.toLowerCase().includes(value.toLowerCase()) ||
      customer.soDienThoai.includes(value)
    );
    setFilteredCustomers(filteredData);
  };

  // Xử lý khi gửi form
  const onFinish = (values) => {
    const { ngayBatDau, ngayKetThuc, giaTriGiam, loaiGiaTriGiam } = values;
    const now = new Date();

  

    // Kiểm tra danh sách khách hàng cho phiếu giảm giá cá nhân
    if (discountType === 2 && selectedCustomers.length === 0) {
      notification.error({
        description: "Danh sách khách hàng không được để trống cho phiếu giảm giá cá nhân.",
      });
      return;
    }

    const requestData = {
      ...values,
      loaiPhieuGiamGia: discountType,
      idKhachHang: discountType === 2 ? selectedCustomers : [], // Gửi danh sách khách hàng khi kiểu là "Cá nhân"
      trangThai: 1, // Mặc định là "1"
    };

    axios
      .post("http://localhost:8080/api/phieu-giam-gia", requestData)
      .then(() => {
        toast.success("Thêm phiếu giảm giá thành công");
        form.resetFields();
        setSelectedCustomers([]);
        navigate("/phieu-giam-gia"); // Điều hướng về trang phiếu giảm giá
      })
      .catch((error) => {
        console.error("Lỗi khi thêm phiếu giảm giá:", requestData); 
        notification.error({ message: "Lỗi khi thêm phiếu giảm giá" });
        console.error(error);
      });
  };

  // Thay đổi kiểu phiếu giảm giá
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    setSelectedCustomers([]); // Reset danh sách khách hàng khi đổi kiểu
  };

  // Xử lý chọn khách hàng
  // const handleCustomerSelect = (selectedRowKeys) => {
  //   setSelectedCustomers(selectedRowKeys);

  //   // Nếu đã chọn một khách hàng, vô hiệu hóa tất cả các ô chọn khác
  //   if (selectedRowKeys.length > 0) {
  //     setDisabledCustomerKeys(customers.filter(customer => !selectedRowKeys.includes(customer.id)).map(customer => customer.id));
  //   } else {
  //     setDisabledCustomerKeys([]);
  //   }
  // };
  const customerColumns = [
    {
      title: "Tên khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "start", gap: "20px" }}>
      {/* Form thêm phiếu giảm giá */}
      <div
        style={{
          flex: "0 0 40%",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h5 style={{ textAlign: "center" }}>Thêm Phiếu Giảm Giá</h5>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            kieuGiamGia: 1, // Giá trị mặc định là "Công khai"
          }}
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
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
                        return Promise.reject(new Error("Giá trị giảm phải lớn hơn 0."));
                      }
                      if (getFieldValue("loaiGiaTriGiam") === 1 && parseFloat(value) > 100) {
                        return Promise.reject(new Error("Giá trị giảm phần trăm không được vượt quá 100%."));
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
                    <Form.Item name="loaiGiaTriGiam" noStyle initialValue={1}>
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
                      if (!value || parseFloat(value) > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Giá trị tối thiểu phải lớn hơn 0."));
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
                  if (!value || parseFloat(value) > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Số tiền giảm tối đa phải lớn hơn 0."));
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const kieuGiamGia = getFieldValue("kieuGiamGia");
                  if (!kieuGiamGia) {
                    return Promise.reject(new Error("Vui lòng chọn kiểu giảm giá trước khi nhập số lượng phiếu."));
                  }

                  if (!value || parseInt(value) > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Số lượng phiếu phải lớn hơn 0."));
                },
              }),
            ]}
          >
            <Input
              type="number"
              placeholder="Nhập số lượng phiếu"
              disabled={discountType === 2} // Vô hiệu hóa khi kiểu giảm giá là "Cá nhân"
            />
          </Form.Item>

          <Form.Item
            name="kieuGiamGia"
            label="Kiểu giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
          >
            <Select onChange={handleDiscountTypeChange2} value={discountType}>
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
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.reject(new Error("Ngày bắt đầu không được để trống."));
                      if (dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(new Error("Ngày bắt đầu không được là ngày trong quá khứ."));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
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
                      if (!value) return Promise.reject(new Error("Ngày kết thúc không được để trống."));
                      if (startDate && dayjs(value).isBefore(dayjs(startDate))) {
                        return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu."));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (không bắt buộc)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Danh sách khách hàng */}
      {discountType === 2 && (
        <div style={{ flex: 3 }}>
          <h5>Danh sách khách hàng</h5>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc số điện thoại"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: "10px", width: "50%" }}
          />
          <Table
            columns={customerColumns}
            dataSource={filteredCustomers}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedCustomers,
              onChange: handleCustomerSelect,
              getCheckboxProps: (record) => ({
                disabled: disabledCustomerKeys.includes(record.id),
              }),
              hideSelectAll: true, // Ẩn checkbox "Chọn tất cả"
            }}
            pagination={{ pageSize: 5 }}
          />

        </div>
      )}
    </div>
  );
};

export default PhieuGiamGiaAdd;
