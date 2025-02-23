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
const ThuongHieu = () => {
  const [thuongHieu, setThuongHieu] = useState([]);
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
      const response = await axios.get('http://localhost:8080/api/admin/thuonghieu');
      setThuongHieu(response.data);
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
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Lưu dữ liệu (thêm mới hoặc chỉnh sửa)
  const handleSave = async () => {
    try {
      let values = await form.validateFields(); // Lấy dữ liệu từ form

      // Loại bỏ khoảng trắng đầu & cuối trước khi lưu vào database
      values.tenThuongHieu = values.tenThuongHieu.trim();

      // Chuẩn hóa để kiểm tra trùng: Bỏ toàn bộ khoảng trắng & chuyển về chữ thường
      const normalizedValue = values.tenThuongHieu.replace(/\s+/g, '').toLowerCase();

      // Kiểm tra trùng tên thương hiệu
      const isDuplicate = thuongHieu.some(
        (cl) =>
          cl.tenThuongHieu.replace(/\s+/g, '').toLowerCase() === normalizedValue &&
          (!isEditing || cl.id !== editingRecord.id), // Không tính bản thân khi chỉnh sửa
      );

      if (isDuplicate) {
        setError('Tên thương hiệu đã tồn tại!');
        return;
      }

      if (isEditing) {
        // Cập nhật
        await axios.patch(`http://localhost:8080/api/admin/thuonghieu/${editingRecord.id}`, values);
        setThuongHieu((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...values } : item)),
        );
        toast.success('Sửa thương hiệu thành công');
      } else {
        // Thêm mới
        const response = await axios.post('http://localhost:8080/api/admin/addthuonghieu', values);
        setThuongHieu((prev) => [response.data, ...prev]);
        toast.success('Thêm thương hiệu thành công');
      }

      handleModalClose(); // Đóng modal sau khi lưu
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      thuongHieu.map((cl, index) => ({
        STT: index + 1,
        'Mã thương hiệu': cl.maThuongHieu,
        'Tên thương hiệu': cl.tenThuongHieu,
        'Mô tả': cl.moTa,
        // "Ngày Tạo": dayjs(cl.ngayTao).format('DD-MM-YYYY HH:mm:ss'),
        // "Trạng Thái": cl.trangThai ? "Đang bán" : "Ngừng bán"
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách thương hiệu');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ThuongHieu.xlsx');
  };

  const filteredData = thuongHieu.filter(
    (item) =>
      item.tenThuongHieu.toLowerCase().includes(searchText.toLowerCase()) ||
      item.maThuongHieu.toLowerCase().includes(searchText.toLowerCase()),
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
      title: 'Mã thương hiệu',
      dataIndex: 'maThuongHieu',
      key: 'maThuongHieu',
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'tenThuongHieu',
      key: 'tenThuongHieu',
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
          <Breadcrumb.Item>Thương hiệu</Breadcrumb.Item>
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
        title={isEditing ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        open={isModalVisible}
        onCancel={handleModalClose}
        onOk={handleSave}
        okText={isEditing ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenThuongHieu"
            label="Tên thương hiệu"
            rules={[
              { max: 50, message: 'Tên thương hiệu không được vượt quá 50 ký tự!' },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(new Error('Vui lòng nhập tên thương hiệu!'));
                  }

                  // Chuẩn hóa chuỗi nhập vào: loại bỏ khoảng trắng và chuyển thành chữ thường
                  const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

                  // Kiểm tra trùng lặp trong danh sách hiện có
                  const isDuplicate = thuongHieu.some((cl) => {
                    const normalizedExisting = cl.tenThuongHieu.replace(/\s+/g, '').toLowerCase();
                    // Nếu đang chỉnh sửa, bỏ qua bản ghi hiện tại để tránh báo lỗi sai
                    if (isEditing && cl.id === editingRecord.id) {
                      return false;
                    }
                    return normalizedExisting === normalizedValue;
                  });

                  if (isDuplicate) {
                    return Promise.reject(new Error('Tên thương hiệu đã tồn tại!'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default ThuongHieu;
