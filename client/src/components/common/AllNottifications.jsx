import React, { useState, useEffect } from 'react';
import { 
  Table, Typography, Button, Space, Tag, Card, Input, 
  DatePicker, Select, Tooltip, Divider, Badge, Row, Col
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, ReloadOutlined, 
  BellOutlined, CheckCircleOutlined, InfoCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import api from '../../utils/api';

dayjs.locale("vi");

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    dateRange: null,
    types: [],
    readStatus: 'ALL'
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchNotifications = async (page = pagination.current, pageSize = pagination.pageSize) => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Chuẩn bị các tham số
      const params = {
        page: page - 1,
        size: pageSize
      };
      
      // Thêm các filter
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.types && filters.types.length > 0) {
        params.types = filters.types.join(',');
      }
      
      if (filters.readStatus && filters.readStatus !== 'ALL') {
        params.read = filters.readStatus === 'READ';
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.from = filters.dateRange[0].format('YYYY-MM-DD');
        params.to = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await api.get(`/api/admin/thong-bao/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setNotifications(response.data.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.totalElements
      });
      
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTableChange = (pagination) => {
    fetchNotifications(pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    fetchNotifications(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      dateRange: null,
      types: [],
      readStatus: 'ALL'
    });
    fetchNotifications(1);
  };

  const handleMarkAsRead = async (id) => {
    if (!token) return;
    
    try {
      await api.put(`/api/admin/thong-bao/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật UI
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, daDoc: true } : n)
      );
      
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/admin/thong-bao/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(item => ({ ...item, daDoc: true }))
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  const getNotificationTypeTag = (type) => {
    switch(type) {
      case 'HOA_DON_MOI':
        return <Tag color="blue">Đơn hàng mới</Tag>;
      case 'HOA_DON_MOI_TU_KHACH':
        return <Tag color="red">Đơn mới từ khách</Tag>;
      case 'HOA_DON_XAC_NHAN':
        return <Tag color="cyan">Đã xác nhận</Tag>;
      case 'HOA_DON_HOAN_THANH':
        return <Tag color="green">Hoàn thành</Tag>;
      case 'HOA_DON_HUY':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>Khác</Tag>;
    }
  };

  const columns = [
    {
      title: 'Trạng thái',
      dataIndex: 'daDoc',
      key: 'daDoc',
      width: 120,
      align: 'center',
      render: daDoc => daDoc ? (
        <Badge status="default" />
      ) : (
        <Tooltip title="Chưa đọc">
          <Badge status="processing" />
        </Tooltip>
      )
    },
    {
      title: 'Loại thông báo',
      dataIndex: 'loaiThongBao',
      key: 'loaiThongBao',
      width: 150,
      render: type => getNotificationTypeTag(type)
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'maHoaDon',
      key: 'maHoaDon',
      width: 180,
      render: text => text ? `#${text}` : '---'
    },
        {
      title: 'Tiêu đề',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
      width: 200, // Thêm width để giới hạn cột tiêu đề
      ellipsis: true, // Thêm ellipsis để cắt nội dung dài
      render: (text, record) => (
        <div style={{ fontWeight: record.daDoc ? 'normal' : 'bold' }}>
          {text}
        </div>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'noiDung',
      key: 'noiDung',
      ellipsis: {
        showTitle: false // Không hiện tooltip mặc định
      },
      render: (text, record) => (
        <Tooltip placement="topLeft" title={text}>
          <div style={{ 
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 180,
      render: date => dayjs(date).format('HH:mm - DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          {!record.daDoc && (
            <Button 
              type="link" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleMarkAsRead(record.id)}
              title="Đánh dấu đã đọc"
            />
          )}
          {record.entityId && (
            <Button 
              type="link" 
              icon={<InfoCircleOutlined />}
              onClick={() => navigate(`/admin/hoa-don/detail/${record.entityId}`)}
              title="Xem chi tiết đơn hàng"
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>
            <BellOutlined /> Tất cả thông báo
          </Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.daDoc)}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input 
            placeholder="Tìm kiếm theo tiêu đề, nội dung..." 
            style={{ width: 300 }}
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
            prefix={<SearchOutlined />}
            allowClear
            onPressEnter={handleSearch}
          />

          <RangePicker 
            value={filters.dateRange}
            onChange={dates => setFilters({...filters, dateRange: dates})}
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
          />

<Select
  placeholder="Loại thông báo"
  mode="multiple"
  style={{ minWidth: 180 }}
  value={filters.types}
  onChange={values => setFilters({...filters, types: values})}
  allowClear
  maxTagCount="responsive"
>
  <Option value="HOA_DON_MOI">Đơn hàng mới</Option>
  <Option value="HOA_DON_MOI_TU_KHACH">Đơn mới từ khách</Option>
  <Option value="HOA_DON_XAC_NHAN">Đơn đã xác nhận</Option>
  <Option value="HOA_DON_HOAN_THANH">Đơn hoàn thành</Option>
  <Option value="HOA_DON_HUY">Đơn đã hủy</Option>
</Select>

          <Select
            placeholder="Trạng thái đọc"
            style={{ minWidth: 130 }}
            value={filters.readStatus}
            onChange={value => setFilters({...filters, readStatus: value})}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="READ">Đã đọc</Option>
            <Option value="UNREAD">Chưa đọc</Option>
          </Select>

          <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch}>
            Lọc
          </Button>
          
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Đặt lại
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={notifications}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} thông báo`
        }}
        loading={loading}
        onChange={handleTableChange}
        rowClassName={record => !record.daDoc ? 'unread-notification-row' : ''}
        onRow={record => ({
          onClick: () => {
            if (!record.daDoc) handleMarkAsRead(record.id);
            if (record.entityId) navigate(`/admin/hoa-don/detail/${record.entityId}`);
          },
          style: { cursor: record.entityId ? 'pointer' : 'default' }
        })}
        locale={{ emptyText: "Không có thông báo nào" }}
      />
    </Card>
  );
};

export default AllNotifications;