import { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Select, notification, Row, Col, Table } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { CheckCircleTwoTone } from "@ant-design/icons";
const { Option } = Select;

const PhieuGiamGiaUpdate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/phieu-giam-gia/khach_hang")
      .then((res) => {
        setCustomers(res.data || []);
        setFilteredCustomers(res.data || []);
      })
      .catch(() =>
        notification.error({ message: "Lỗi", description: "Không thể tải danh sách khách hàng." })
      );
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/phieu-giam-gia/khach_hang")
      .then((res) => {
        setCustomers(res.data || []);
        setFilteredCustomers(res.data || []);
      })
      .catch(() =>
        notification.error({ message: "Lỗi", description: "Không thể tải danh sách khách hàng." })
      );
  }, []);
  useEffect(() => {
    if (!id) return;

    axios.get(`http://localhost:8080/api/phieu-giam-gia/${id}`)
      .then((res) => {
        const data = res.data;
        if (!data) {
          notification.error({ message: "Không tìm thấy dữ liệu!" });
          return;
        }

        form.setFieldsValue({
          ...data,
          ngayBatDau: data.ngayBatDau ? dayjs(data.ngayBatDau) : null,
          ngayKetThuc: data.ngayKetThuc ? dayjs(data.ngayKetThuc) : null,
        });

        setDiscountType(data.kieuGiamGia || 1);

        // Lấy danh sách khách hàng sử dụng phiếu
        axios.get(`http://localhost:8080/api/phieu-giam-gia/${id}/khach-hang`)
          .then((res) => {
            const appliedCustomers = res.data || [];

            // Lọc những khách hàng có trạng thái "đang hoạt động"
            const activeCustomers = appliedCustomers
              .filter(c => c.trangThai === false) // Hoặc c.trangThai === true nếu API trả về boolean
              .map(c => c.id);

            setSelectedCustomers(activeCustomers);
          })
          .catch(() => notification.error({ message: "Lỗi tải danh sách khách hàng áp dụng!" }));
      })
      .catch(() => notification.error({ message: "Lỗi khi tải dữ liệu!" }));
  }, [id]);




  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    setSelectedCustomers([]);
    form.setFieldsValue({ soLuong: value === 2 ? selectedCustomers.length : null });
  };

  const handleCustomerSelect = (selectedRowKeys, selectedRows) => {
    setSelectedCustomers(selectedRowKeys);

    // Tìm khách hàng mới chưa có trong danh sách
    const newCustomers = selectedRowKeys.filter(id => !selectedCustomers.includes(id));

    if (newCustomers.length > 0) {
      axios.put(`http://localhost:8080/api/phieu-giam-gia/${id}/add-customers`, newCustomers)
        .then(() => {
          notification.success({ message: "Đã thêm khách hàng vào phiếu!" });
        })
        .catch(() => {
          notification.error({ message: "Lỗi khi thêm khách hàng!" });
        });
    }

    // Tìm khách hàng đã bỏ tích (bị loại khỏi danh sách)
    const removedCustomers = selectedCustomers.filter(id => !selectedRowKeys.includes(id));

    if (removedCustomers.length > 0) {
      removedCustomers.forEach((customerId) => {
        // Gửi yêu cầu PATCH đến API để loại bỏ khách hàng khỏi phiếu giảm giá
        axios.patch(`http://localhost:8080/api/phieu-giam-gia/${id}/remove-customer/${customerId}`)
          .then(() => {
            notification.success({ message: "Đã bỏ khách hàng khỏi phiếu giảm giá!" });
          })
          .catch(() => {
            notification.error({ message: "Lỗi khi bỏ khách hàng!" });
          });
      });
    }
  };


  const handleSearch = (value) => {
    setSearchValue(value);
    setFilteredCustomers(
      customers.filter(
        (customer) =>
          customer.tenKhachHang.toLowerCase().includes(value.toLowerCase()) ||
          customer.soDienThoai.includes(value)
      )
    );
  };



  const onFinish = (values) => {
    const formatDate = (date) => date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : null;
    const requestData = {
      tenPhieuGiamGia: values.tenPhieuGiamGia || undefined,
      giaTriGiam: values.giaTriGiam || undefined,
      soTienGiamToiDa: values.soTienGiamToiDa || undefined,
      giaTriToiThieu: values.giaTriToiThieu || undefined,
      ngayBatDau: formatDate(values.ngayBatDau),
      ngayKetThuc: formatDate(values.ngayKetThuc),
      soLuong: values.soLuong || undefined,
      trangThai: values.trangThai || undefined,
      moTa: values.moTa || undefined,
      kieuGiamGia: values.kieuGiamGia,

      khachHangsToAdd: selectedCustomers, // Danh sách khách hàng mới
      khachHangsToCancel: [], // Nếu cần hủy khách hàng, xử lý tại đây
    };

    axios.put(`http://localhost:8080/api/phieu-giam-gia/${id}`, requestData)
      .then(() => {
        notification.success({ message: "Cập nhật thành công!" });
        navigate("/phieu-giam-gia");
      })
      .catch((error) => {
        console.error("❌ Lỗi từ API:", error.response?.data);
        notification.error({ message: "Lỗi khi cập nhật!" });
      });
  };



  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Form cập nhật phiếu giảm giá */}
      <div style={{ flex: "0 0 40%", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
        <h5 style={{ textAlign: "center" }}>Cập Nhật Phiếu Giảm Giá</h5>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="tenPhieuGiamGia" label="Tên phiếu giảm giá" rules={[{ required: true, message: "Vui lòng nhập tên phiếu giảm giá" }]}>
            <Input placeholder="Nhập tên phiếu giảm giá" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="giaTriGiam" label="Giá trị giảm" rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}>
                <Input type="number" placeholder="Nhập giá trị" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soTienGiamToiDa" label="Số tiền giảm tối đa">
                <Input type="number" placeholder="Nhập số tiền giảm tối đa" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="soLuong" label="Số lượng phiếu">
            <Input type="number" placeholder="Nhập số lượng phiếu" disabled={discountType === 2} />
          </Form.Item>

          <Form.Item name="kieuGiamGia" label="Kiểu giảm giá">
            <Select onChange={handleDiscountTypeChange}>
              <Option value={1}>Công khai</Option>
              <Option value={2}>Cá nhân</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngayBatDau" label="Ngày bắt đầu" rules={[{ required: true }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" value={form.getFieldValue("ngayBatDau") || null} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngayKetThuc" label="Ngày kết thúc" rules={[{ required: true }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" value={form.getFieldValue("ngayKetThuc") || null} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
              Cập Nhật
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Danh sách khách hàng (chỉ hiển thị khi giảm giá cá nhân) */}
      {discountType === 2 && (
        <div style={{ flex: 3 }}>
          <h5>Danh sách khách hàng</h5>
          <Input.Search
            placeholder="Tìm kiếm khách hàng"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: "10px", width: "50%" }}
          />
          {/* Định nghĩa mảng columns bên ngoài */}
          <Table
            columns={[
              { title: "Tên khách hàng", dataIndex: "tenKhachHang", key: "tenKhachHang" },
              { title: "Số điện thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
              { title: "Email", dataIndex: "email", key: "email" },
              {
                title: "Trạng thái",
                key: "trangThai",
                render: (_, record) =>
                  selectedCustomers.includes(record.id) ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  ) : null
              }
            ]}
            dataSource={filteredCustomers} // Hiển thị tất cả khách hàng
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedCustomers,
              onChange: handleCustomerSelect
            }}
            pagination={{ pageSize: 5 }}
          />



        </div>


      )}
    </div>
  );
};

export default PhieuGiamGiaUpdate;
