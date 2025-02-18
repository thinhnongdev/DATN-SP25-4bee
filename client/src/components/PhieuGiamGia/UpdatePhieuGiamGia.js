import { useEffect, useState } from "react";
import { getPhieuGiamGiaById, updatePhieuGiamGia } from "../Service/api";
import { Modal, Form, Input, Button, message, DatePicker, InputNumber, Select, Row, Col, notification } from "antd";
import moment from "moment";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import { toast } from "react-toastify";

const { TextArea } = Input;
const { Option } = Select;

const UpdatePhieuGiamGia = ({ show, handleClose, id, onSaveSuccess }) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState(1);

  // Fetch data when the component mounts or when the `id` changes
  useEffect(() => {
    if (id) {
      fetchPhieuGiamGiaData();
    }
  }, [id]);

  const fetchPhieuGiamGiaData = async () => {
    try {
      const response = await getPhieuGiamGiaById(id);
      const data = response.data;
      form.setFieldsValue({
        ...data,
        ngayBatDau: data.ngayBatDau ? moment(data.ngayBatDau) : null,
        ngayKetThuc: data.ngayKetThuc ? moment(data.ngayKetThuc) : null,
      });
      setDiscountType(data.kieuGiamGia);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { ngayBatDau, ngayKetThuc, giaTriGiam, loaiGiaTriGiam } = values;

      // Validate discount value
      if (giaTriGiam <= 0 || (loaiGiaTriGiam === 1 && giaTriGiam > 100)) {
        notification.error({ description: "Giá trị giảm không hợp lệ." });
        return;
      }

      // Prepare payload for API request
      const payload = {
        ...values,
        ngayBatDau: ngayBatDau ? ngayBatDau.toISOString() : null,
        ngayKetThuc: ngayKetThuc ? ngayKetThuc.toISOString() : null,
      };

      // Call API to update the discount
      const response = await updatePhieuGiamGia(id, payload);
      if (response.status === 200) {
        toast.success("Cập nhật thành công!");
        handleClose();
        onSaveSuccess && onSaveSuccess(response.data);
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      message.error("Lỗi: Không thể cập nhật phiếu giảm giá!");
    }
  };

  return (
    <Modal
      title="Cập nhật Phiếu Giảm Giá"
      visible={show}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>Đóng</Button>,
        <Button key="submit" type="primary" onClick={handleSave}>Lưu Thay Đổi</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tenPhieuGiamGia" label="Tên Phiếu Giảm Giá" rules={[{ required: true }]}>
              <Input placeholder="Nhập tên phiếu giảm giá" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="trangThai" label="Trạng thái" initialValue={1}>
              <Select>
                <Option value={1}>Đang hoạt động</Option>
                <Option value={2}>Ngừng hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
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
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="loaiGiaTriGiam" label="Loại giảm giá" initialValue={1}>
              <Select>
                <Option value={1}>%</Option>
                <Option value={2}>VND</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
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
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
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
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
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
              <InputNumber min={1} style={{ width: "100%" }} disabled={discountType === 2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="kieuGiamGia" label="Kiểu giảm giá" initialValue={1}>
              <Select onChange={setDiscountType}>
                <Option value={1}>Công khai</Option>
                <Option value={2}>Cá nhân</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ngayBatDau" label="Ngày bắt đầu" rules={[{ required: true }]}>
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
                    if (!value) return Promise.reject(new Error("Ngày kết thúc không được để trống."));
                    if (startDate && dayjs(value).isBefore(dayjs(startDate))) {
                      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu."));
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
          <TextArea rows={3} placeholder="Nhập mô tả phiếu giảm giá" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePhieuGiamGia;