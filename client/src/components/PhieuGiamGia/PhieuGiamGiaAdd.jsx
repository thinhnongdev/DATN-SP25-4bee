import  { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, Table, notification, Row, Col } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const PhieuGiamGiaAdd = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [discountType, setDiscountType] = useState(1); // 1: Công khai, 2: Cá nhân
  const [searchValue, setSearchValue] = useState("");
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

    if (ngayBatDau.isAfter(ngayKetThuc)) {
      notification.error({
        message: "Lỗi dữ liệu",
        description: "Thời gian bắt đầu phải trước thời gian kết thúc.",
      });
      return; // Ngừng việc gửi yêu cầu
    }

    if (ngayBatDau < now) {
      notification.error({
        message: "Ngày bắt đầu không hợp lệ",
        description: "Ngày bắt đầu không được là ngày trong quá khứ.",
      });
      return; // Ngừng quá trình submit
    }

    if (giaTriGiam <= 0) {
      notification.error({
        message: "Lỗi dữ liệu",
        description: "Giá trị giảm phải lớn hơn 0.",
      });
      return;
    }

       // 4. Nếu loại giảm giá là phần trăm, không được vượt quá 100%
       if (loaiGiaTriGiam === 1 && giaTriGiam > 100) {
        notification.error({
          message: "Lỗi dữ liệu",
          description: "Giá trị giảm phần trăm không được vượt quá 100%.",
        });
        return;
      }

         // Kiểm tra danh sách khách hàng cho phiếu giảm giá cá nhân
    if (discountType === 2 && selectedCustomers.length === 0) {
      notification.error({
        message: "Lỗi dữ liệu",
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
      })
      .catch((error) => {
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
  const handleCustomerSelect = (selectedRowKeys) => {
    setSelectedCustomers(selectedRowKeys);
  };

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
        <h2 style={{ textAlign: "center" }}>Thêm Phiếu Giảm Giá</h2>
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
                      if (!value || parseFloat(value) > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Giá trị giảm phải lớn hơn 0."));
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
                  if (!value || parseInt(value) > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Số lượng phiếu phải lớn hơn 0."));
                },
              }),
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng phiếu" />
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
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const ngayKetThuc = getFieldValue("ngayKetThuc");
                      if (!value || !ngayKetThuc || value.isBefore(ngayKetThuc)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Ngày bắt đầu phải trước ngày kết thúc."));
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
                      const ngayBatDau = getFieldValue("ngayBatDau");
                      if (!value || !ngayBatDau || value.isAfter(ngayBatDau)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu."));
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
          <h2>Danh sách khách hàng</h2>
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
            }}
            pagination={{ pageSize: 5 }}
          />
        </div>
      )}
    </div>
  );
};

export default PhieuGiamGiaAdd;









