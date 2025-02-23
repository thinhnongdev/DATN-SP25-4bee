import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { Button, Table, Row, Modal, Input, Form, Col, Breadcrumb } from 'antd';
import { toast } from 'react-toastify';
import { TbEyeEdit } from 'react-icons/tb';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const { TextArea } = Input;
const ChatLieu = () => {
  const [chatLieu, setChatLieu] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Hiển thị modal
  const [isEditing, setIsEditing] = useState(false); // Chế độ thêm hoặc chỉnh sửa
  const [editingRecord, setEditingRecord] = useState(null); // Dữ liệu dòng đang chỉnh sửa
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  // Lấy dữ liệu từ backend
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/chatlieu');
      setChatLieu(response.data);
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
    setIsModalVisible(true);
    console.log('data' + record.tenChatLieu);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
    setError('');
  };

  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSave = async () => {
    try {
      let values = await form.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenChatLieu = values.tenChatLieu.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenChatLieu.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên chất liệu
      const isDuplicate = chatLieu.some(
        (cl) =>
          cl.tenChatLieu.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên chất liệu đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/chatlieu/${editingRecord.id}`, values);
        setChatLieu((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa chất liệu thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addchatlieu', values);
        setChatLieu((prev) => [response.data, ...prev]);
        toast.success('Thêm chất liệu thành công');
      }

      handleModalClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      chatLieu.map((cl, index) => ({
        STT: index + 1,
        'Mã chất liệu': cl.maChatLieu,
        'Tên chất liệu': cl.tenChatLieu,
        'Mô tả': cl.moTa,
        // "Ngày Tạo": dayjs(cl.ngayTao).format('DD-MM-YYYY HH:mm:ss'),
        // "Trạng Thái": cl.trangThai ? "Đang bán" : "Ngừng bán"
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách chất liệu');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ChatLieu.xlsx');
  };

  const filteredData = chatLieu.filter(
    (item) =>
      item.tenChatLieu.toLowerCase().includes(searchText.toLowerCase()) ||
      item.maChatLieu.toLowerCase().includes(searchText.toLowerCase()),
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
      title: 'Mã chất liệu',
      dataIndex: 'maChatLieu',
      key: 'maChatLieu',
    },
    {
      title: 'Tên chất liệu',
      dataIndex: 'tenChatLieu',
      key: 'tenChatLieu',
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
    <div>
      <Breadcrumb
        style={{
          marginBottom: '10px',
          fontSize: '15px',
          fontWeight: 'bold',
        }}
      >
        <Breadcrumb.Item>Chất liệu</Breadcrumb.Item>
      </Breadcrumb>
      <div
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
      </div>
      </div>
      <Modal
        title={isEditing ? 'Chỉnh sửa chất liệu' : 'Thêm chất liệu'}
        open={isModalVisible}
        onCancel={handleModalClose}
        onOk={handleSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenChatLieu"
            label="Tên chất liệu"
            rules={[
              { max: 50, message: 'Tên chất liệu không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên chất liệu!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = chatLieu.some((cl) => {
                    const normalizedExisting = cl.tenChatLieu.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên chất liệu đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default ChatLieu;
