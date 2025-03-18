import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { Button, Table, Row, Modal, Input, Form, Col, Breadcrumb } from 'antd';
import { toast } from 'react-toastify';
import { TbEyeEdit } from 'react-icons/tb';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { HexColorPicker } from 'react-colorful';
const { TextArea } = Input;
const MauSac = () => {
  const [mauSac, setMauSac] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Hiển thị modal
  const [isEditing, setIsEditing] = useState(false); // Chế độ thêm hoặc chỉnh sửa
  const [editingRecord, setEditingRecord] = useState(null); // Dữ liệu dòng đang chỉnh sửa
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [color, setColor] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const token = localStorage.getItem('token');
  // Lấy dữ liệu từ backend
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/mausac', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMauSac(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hiển thị modal
  const showAddModal = () => {
    setIsEditing(false); // Chế độ thêm
    form.resetFields(); // Xóa form cũ
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setIsEditing(true); // Chế độ chỉnh sửa
    setEditingRecord(record); // Lưu dòng cần chỉnh sửa
    form.setFieldsValue(record); // Điền dữ liệu dòng vào form
    setColor(record.maMau);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
    setColor('');
  };
  const handleColorChange = (newColor) => {
    setColor(newColor);
    form.setFieldsValue({ maMau: newColor });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Bao gồm maMau trong dữ liệu gửi về server
      const dataToSend = { ...values, maMau: color };
      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenMau = values.tenMau.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenMau.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên màu sắc
      const isDuplicate = mauSac.some(
        (cl) =>
          cl.tenMau.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );
      // Hàm kiểm tra mã màu HEX hợp lệ
      const isValidHexColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);
      if (isValidHexColor(dataToSend.maMau) === false) {
        setError('Mã màu không tồn tại!');
        return;
      }
      if (isDuplicate) {
        setError('Tên màu sắc đã tồn tại!');
        return;
      } else {
        setError('');
      }
      // Kiểm tra trùng mã màu
      const isMaMauDuplicate = mauSac.some(
        (cl) =>
          cl.maMau.trim().toLowerCase() === dataToSend.maMau &&
          (!isEditing || cl.id !== editingRecord.id),
      );

      if (isMaMauDuplicate) {
        setError('Mã màu đã tồn tại!');
        return;
      }
      if (isEditing) {
        // Cập nhật
        try {
          await axios.patch(
            `http://localhost:8080/api/admin/mausac/${editingRecord.id}`,dataToSend,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setMauSac((prev) =>
            prev.map((item) => (item.id === editingRecord.id ? { ...item, ...dataToSend } : item)),
          );
          toast.success('Sửa màu sắc thành công');
        } catch (error) {
          toast.error('Sửa màu sắc thất bại');
        }
      } else {
        // Thêm mới
        try {
          const response = await axios.post(
            'http://localhost:8080/api/admin/addmausac',dataToSend,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setMauSac((prev) => [response.data, ...prev]);
          setColor('');
          toast.success('Thêm màu sắc thành công');
        } catch (error) {
          toast.error('Thêm màu sắc thất bại');
        }
      }
      handleModalClose();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      mauSac.map((cl, index) => ({
        STT: index + 1,
        'Mã màu sắc': cl.maMau,
        'Tên màu sắc': cl.tenMau,
        'Mô tả': cl.moTa,
        // "Ngày Tạo": dayjs(cl.ngayTao).format('DD-MM-YYYY HH:mm:ss'),
        // "Trạng Thái": cl.trangThai ? "Đang bán" : "Ngừng bán"
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách màu sắc');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'MauSac.xlsx');
  };

  const filteredData = mauSac.filter(
    (item) =>
      item.tenMau.toLowerCase().includes(searchText.toLowerCase()) ||
      item.maMau.toLowerCase().includes(searchText.toLowerCase()),
  );
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index', // Không cần thuộc tính cụ thể trong dữ liệu
      key: 'index',
      render: (text, record, index) => {
        // Tính toán lại index khi chuyển trang
        return pagination.pageSize * (pagination.current - 1) + index + 1;
      },
    },
    {
      title: 'Color',
      dataIndex: 'maMau',
      key: 'maMau',
      render: (text, record) => (
        <div
          style={{
            width: '80px',
            height: '30px',
            borderRadius: '4px',
            backgroundColor: record.maMau,
            border: '1px solid #f0f0f0',
          }}
        />
      ),
    },
    {
      title: 'Mã Màu Sắc',
      dataIndex: 'maMau',
      key: 'maMau',
    },
    {
      title: 'Tên Màu Sắc',
      dataIndex: 'tenMau',
      key: 'tenMau',
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
    },
    {
      title: 'Chức năng',
      render: (text, record) => (
        <Button type="submit" onClick={() => showEditModal(record)}>
          <TbEyeEdit size={24} />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        style={{
          marginBottom: '10px',
          fontSize: '15px',
          fontWeight: 'bold',
        }}
      >
        <Breadcrumb.Item>Màu sắc</Breadcrumb.Item>
      </Breadcrumb>
      <Container
        style={{
          boxShadow: '0 4px 8px rgba(24, 24, 24, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
          height: 'auto',
        }}
      >
        <Row gutter={16} style={{ marginBottom: '30px' }}>
          {/* Ô tìm kiếm */}
          <Col span={10}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          {/* Nút xuất Excel */}
          <Col span={7} style={{ paddingLeft: '180px' }}>
            <Button type="default" icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
          </Col>

          {/* Nút thêm mới */}
          <Col span={7} style={{ paddingLeft: '240px' }}>
            <Button type="primary" onClick={showAddModal}>
              +Thêm mới
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
        />
      </Container>

      <Modal
        title={isEditing ? 'Chỉnh sửa màu sắc' : 'Thêm màu sắc'}
        open={isModalVisible}
        onCancel={handleModalClose}
        onOk={handleSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={form} layout="vertical">
          {!isEditing && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <HexColorPicker color={color} onChange={handleColorChange} />
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                <label style={{ marginRight: '5px' }}>Preview:</label>
                <div
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '150px',
                    backgroundColor: color,
                    border: '1px solid #f0f0f0',
                  }}
                />
              </div>
            </div>
          )}
          <Form.Item
            name="maMau"
            label="Mã màu sắc"
            rules={[
              { max: 50, message: 'Mã màu sắc không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng chọn mã màu!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = mauSac.some((cl) => {
                    const normalizedExisting = cl.maMau.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Mã màu sắc đã tồn tại!'));
                  }
                  // Hàm kiểm tra mã màu HEX hợp lệ
                  const isValidHexColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);
                  if (isValidHexColor(value) === false) {
                    return Promise.reject(new Error('Mã màu sắc không hợp lệ!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              disabled={isEditing}
              placeholder="Nhập mã màu sắc"
              onChange={(e) => setColor(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="tenMau"
            label="Tên màu sắc"
            rules={[
              { max: 50, message: 'Tên màu sắc không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên màu sắc!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = mauSac.some((cl) => {
                    const normalizedExisting = cl.tenMau.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên màu sắc đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên màu sắc" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default MauSac;
