import  { useEffect, useState } from "react";
import { getPhieuGiamGiaById, updatePhieuGiamGia } from "../service/api";
import { Modal, Form, Input, Button, message, DatePicker, InputNumber, Select } from "antd";
import moment from "moment";
import "antd/dist/reset.css";

const { TextArea } = Input;
const { Option } = Select;

const UpdatePhieuGiamGia = ({ show, handleClose, id, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    giaTriGiam: "",
    tenPhieuGiamGia: "",
    giaTriToiThieu: "",
    soTienGiamToiDa: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    soLuong: "",
    moTa: "",
    trangThai: "",
  });

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await getPhieuGiamGiaById(id);
          const data = response.data;
          setFormData(data);
          form.setFieldsValue({
            ...data,
            ngayBatDau: data.ngayBatDau ? moment(data.ngayBatDau) : null,
            ngayKetThuc: data.ngayKetThuc ? moment(data.ngayKetThuc) : null,
          });
        } catch (error) {
          message.error("Lỗi khi tải dữ liệu!");
        }
      }
    };
    fetchData();
  }, [id, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        ngayBatDau: values.ngayBatDau ? values.ngayBatDau.toISOString() : null,
        ngayKetThuc: values.ngayKetThuc ? values.ngayKetThuc.toISOString() : null,
      };
  
      const response = await updatePhieuGiamGia(id, payload);
  
      if (response.status === 200) {
        message.success("Cập nhật thành công!");
        handleClose();
        if (onSaveSuccess) {
          onSaveSuccess(response.data);
        }
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error("Không tìm thấy phiếu giảm giá với ID này!");
      } else {
        message.error("Lỗi: Không thể cập nhật phiếu giảm giá!");
      }
    }
  };
  
  return (
    <Modal
      title="Cập nhật Phiếu Giảm Giá"
      visible={show}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Đóng
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Lưu Thay Đổi
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
      >
        <Form.Item
          label="Tên Phiếu Giảm Giá"
          name="tenPhieuGiamGia"
          rules={[{ required: true, message: "Vui lòng nhập tên phiếu giảm giá!" }]}
        >
          <Input placeholder="Nhập tên phiếu giảm giá" />
        </Form.Item>

        <Form.Item
          label="Giá Trị Giảm (%)"
          name="giaTriGiam"
          rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
        >
          <InputNumber placeholder="Nhập giá trị giảm" min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá Trị Tối Thiểu (VNĐ)"
          name="giaTriToiThieu"
          rules={[{ required: true, message: "Vui lòng nhập giá trị tối thiểu!" }]}
        >
          <InputNumber placeholder="Nhập giá trị tối thiểu" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Số Tiền Giảm Tối Đa (VNĐ)"
          name="soTienGiamToiDa"
        >
          <InputNumber placeholder="Nhập số tiền giảm tối đa" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Số Lượng"
          name="soLuong"
          rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
        >
          <InputNumber placeholder="Nhập số lượng" min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Ngày Bắt Đầu"
          name="ngayBatDau"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
        >
          <DatePicker placeholder="Chọn ngày bắt đầu" format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Ngày Kết Thúc"
          name="ngayKetThuc"
          rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
        >
          <DatePicker placeholder="Chọn ngày kết thúc" format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Mô Tả"
          name="moTa"
        >
          <TextArea rows={4} placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          label="Trạng Thái"
          name="trangThai"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="1">Đang hoạt động</Option>
            <Option value="2">Ngừng hoạt động</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePhieuGiamGia;
