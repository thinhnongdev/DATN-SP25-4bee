import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Button, Table, Row, Breadcrumb, Input, Col, Radio, Tag } from 'antd';
import { TbEyeEdit } from 'react-icons/tb';
import { Badge } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt để hiển thị đúng tên tháng/ngày
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

dayjs.locale('vi'); // Đặt ngôn ngữ là tiếng Việt
const SanPham = () => {
  const [sanPham, setSanPham] = useState([]);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('all'); // Mặc định là "all"
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const token = localStorage.getItem('token');
  useEffect(() => {
    axios
      .get('https://datn-sp25-4bee.onrender.com/api/admin/sanpham', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSanPham(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);
  const handleTrangThaiChange = (e) => {
    setTrangThaiFilter(e.target.value);
  };

  const filteredData = sanPham.filter((item) => {
    const matchesSearch =
      item.tenSanPham.toLowerCase().includes(searchText.toLowerCase()) ||
      item.maSanPham.toLowerCase().includes(searchText.toLowerCase());

    const matchesTrangThai =
      trangThaiFilter === 'all'
        ? true
        : trangThaiFilter === 'selling'
        ? item.trangThai
        : !item.trangThai;

    return matchesSearch && matchesTrangThai;
  });
  //xuất excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sanPham.map((sp, index) => ({
        STT: index + 1,
        'Mã Sản Phẩm': sp.maSanPham,
        'Tên Sản Phẩm': sp.tenSanPham,
        'Số Lượng': sp.soLuong,
        'Ngày Tạo': dayjs(sp.ngayTao).format('DD-MM-YYYY HH:mm:ss'),
        'Trạng Thái': sp.trangThai ? 'Đang bán' : 'Ngừng bán',
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sản phẩm');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'SanPham.xlsx');
  };
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
      title: 'Mã Sản Phẩm',
      dataIndex: 'maSanPham',
      key: 'maSanPham',
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      render: (value) => {
        // Chuyển giá trị 'value' (ngày tạo) thành ngày giờ ở định dạng Việt Nam
        return dayjs(value).format('DD-MM-YYYY HH:mm:ss');
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (text, record) => {
        if (record.soLuong > 0) {
          return (
            <Tag
              color="green"
              style={{
                fontSize: 14,
                padding: '4px 12px',
                borderRadius: '15px',
              }}
            >
              Đang bán
            </Tag>
          );
        }

        return record.trangThai ? (
          <Tag color="green" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Đang bán
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px', borderRadius: '15px' }}>
            Ngừng bán
          </Tag>
        );
      },
    },
    {
      title: 'Hành Động',
      render: (text, record) => (
        <Button type="submit" onClick={() => handleChiTietSP(record.id)}>
          <TbEyeEdit size={24} />
        </Button>
      ),
    },
  ];
  const handleUpdate = (sanPhamId) => {
    navigate(`/admin/sanpham/${sanPhamId}`);
  };
  const handleChiTietSP = (sanPhamId) => {
    navigate(`/admin/sanpham/chitietsanpham/${sanPhamId}`);
  };
  const handleAdd = () => {
    navigate(`/admin/sanpham/addsanpham`);
  };
  return (
    <>
      <Breadcrumb
        style={{
          marginBottom: '10px',
          fontSize: '15px',
          fontWeight: 'bold',
        }}
      >
        <Breadcrumb.Item>
        <span style={{fontSize:'20px'}}>Sản phẩm</span>
        </Breadcrumb.Item>
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
        <Row gutter={16} style={{ marginBottom: '18px' }}>
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
            <Button type="primary" onClick={() => handleAdd()}>
              +Thêm mới
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: '25px' }}>
          <Col>
            <span style={{ fontWeight: 'bold', marginRight: 8 }}>Trạng thái:</span>
            <Radio.Group onChange={handleTrangThaiChange} value={trangThaiFilter}>
              <Radio value="all">Tất cả</Radio>
              <Radio value="selling">Đang bán</Radio>
              <Radio value="stopped">Ngừng bán</Radio>
            </Radio.Group>
          </Col>
        </Row>

        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>
    </>
  );
};
export default SanPham;
