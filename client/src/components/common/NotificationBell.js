import React, { useState, useEffect, useRef } from "react";
import { Badge, Dropdown, List, Typography, Space, Button, Avatar, message, Spin } from "antd";
import { BellOutlined, ShoppingCartOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, SyncOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import api from "../../utils/api";

dayjs.locale("vi");
dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customerOrderCount, setCustomerOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  });
  
  const pollingIntervalRef = useRef(null);
  const fastPollingIntervalRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const lastDataRef = useRef(null);
  
  // Hàm lấy thông báo từ server với phân trang
  const fetchNotifications = async (page = 1, showLoading = true) => {
    if (!token) return;
    
    try {
      if (page === 1 && showLoading) setLoading(true);
      if (page > 1) setLoadingMore(true);
      
      const response = await api.get("/api/admin/thong-bao", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page - 1,
          size: pagination.pageSize
        }
      });

      if (response?.data) {
        const { content, totalElements, last } = response.data;
        
        // Sắp xếp thông báo để ưu tiên đơn từ khách hàng
        const sortedNotifications = [...content].sort((a, b) => {
          // Ưu tiên 1: Đơn do khách hàng tạo chưa đọc
          if (a.noiDung?.includes('Khách hàng tạo đơn hàng') && !a.daDoc) {
            return -1;
          }
          if (b.noiDung?.includes('Khách hàng tạo đơn hàng') && !b.daDoc) {
            return 1;
          }
          
          // Ưu tiên 2: Các thông báo chưa đọc khác
          if (!a.daDoc && b.daDoc) {
            return -1;
          }
          if (a.daDoc && !b.daDoc) {
            return 1;
          }
          
          // Ưu tiên 3: Thời gian (mới nhất lên đầu)
          return new Date(b.ngayTao) - new Date(a.ngayTao);
        });
        
        // Cập nhật notifications theo chế độ nối thêm hoặc thay thế
        if (page === 1) {
          setNotifications(sortedNotifications);
        } else {
          setNotifications(prev => [...prev, ...sortedNotifications]);
        }
        
        // Cập nhật thông tin phân trang
        setPagination({
          current: page,
          pageSize: pagination.pageSize,
          total: totalElements,
          hasMore: !last
        });
        
        // So sánh với dữ liệu trước đó để phát hiện thông báo mới (chỉ khi page=1)
        if (page === 1) {
          const prevIds = new Set((lastDataRef.current || []).map(n => n.id));
          const hasNewNotification = sortedNotifications.some(n => !prevIds.has(n.id) && !n.daDoc);
          
          // Nếu có thông báo mới và không đang hiển thị dropdown
          if (hasNewNotification && !isDropdownVisible) {
            // Chỉ hiện thông báo khi có thông báo mới từ khách hàng
            const newCustomerNotifications = sortedNotifications.filter(
              n => !prevIds.has(n.id) && !n.daDoc && n.noiDung?.includes('Khách hàng tạo đơn hàng')
            );
            
            if (newCustomerNotifications.length > 0) {
              message.info({
                content: `Có ${newCustomerNotifications.length} đơn hàng mới cần xử lý`,
                duration: 5,
                icon: <UserOutlined style={{ color: '#ff4d4f' }} />,
                onClick: () => setIsDropdownVisible(true)
              });
            }
          }
          
          lastDataRef.current = sortedNotifications;
          
          // Đếm số thông báo chưa đọc (cập nhật từ API response)
          setUnreadCount(sortedNotifications.filter(n => !n.daDoc).length);
          
          // Đếm số đơn từ khách hàng chưa đọc
          setCustomerOrderCount(sortedNotifications.filter(
            n => !n.daDoc && n.noiDung?.includes('Khách hàng tạo đơn hàng')
          ).length);
        } else {
          // Nếu là trang tiếp theo, cập nhật lại số liệu đếm
          const allNotifications = [...notifications, ...sortedNotifications];
          setUnreadCount(allNotifications.filter(n => !n.daDoc).length);
          setCustomerOrderCount(allNotifications.filter(
            n => !n.daDoc && n.noiDung?.includes('Khách hàng tạo đơn hàng')
          ).length);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    } finally {
      if (page === 1) setLoading(false);
      setLoadingMore(false);
    }
  };

  // Xem thêm thông báo
  const loadMoreNotifications = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchNotifications(pagination.current + 1, false);
    }
  };

  // Lấy số lượng thông báo chưa đọc
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await api.get("/api/admin/thong-bao/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response?.data) {
        const newUnreadCount = response.data.unreadCount;
        
        // Nếu có thông báo mới, làm mới danh sách thông báo
        if (newUnreadCount > unreadCount) {
          fetchNotifications(1, false); // Không hiển thị loading khi cập nhật
        } else {
          setUnreadCount(newUnreadCount);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy số lượng thông báo:", error);
    }
  };

  // Thiết lập polling
  useEffect(() => {
    // Lấy thông báo lần đầu
    fetchNotifications(1);
    
    // Setup polling nhanh cho unread count (5 giây)
    fastPollingIntervalRef.current = setInterval(fetchUnreadCount, 5000);
    
    // Setup polling đầy đủ cho danh sách thông báo (30 giây)
    pollingIntervalRef.current = setInterval(() => fetchNotifications(1, false), 30000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (fastPollingIntervalRef.current) {
        clearInterval(fastPollingIntervalRef.current);
      }
    };
  }, []);
  
  // Xử lý click vào thông báo
  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu thông báo là đã đọc
      if (!notification.daDoc) {
        await api.put(`/api/admin/thong-bao/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setNotifications(prev => 
          prev.map(item => 
            item.id === notification.id ? { ...item, daDoc: true } : item
          )
        );
        
        // Giảm số thông báo chưa đọc
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Giảm đơn từ khách hàng nếu đó là đơn từ khách hàng
        if (notification.noiDung?.includes('Khách hàng tạo đơn hàng')) {
          setCustomerOrderCount(prev => Math.max(0, prev - 1));
        }
      }
      
      // Điều hướng tới trang chi tiết đơn hàng
      navigate(`/admin/hoa-don/detail/${notification.entityId}`);
      
      // Đóng dropdown khi chuyển đến trang mới
      setIsDropdownVisible(false);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };
  
  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/admin/thong-bao/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(item => ({ ...item, daDoc: true }))
      );
      setUnreadCount(0);
      setCustomerOrderCount(0);
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  // Lấy danh sách thông báo khi mở dropdown
  const handleDropdownVisibleChange = (visible) => {
    setIsDropdownVisible(visible);
    if (visible) {
      fetchNotifications(1);
    }
  };

  // Format thời gian thông báo
  const formatNotificationTime = (timestamp) => {
    return dayjs(timestamp).fromNow();
  };

  // Kiểm tra nếu là thông báo từ khách hàng
  const isCustomerNotification = (notification) => {
    return notification.loaiThongBao === 'HOA_DON_MOI_TU_KHACH' || 
           notification.noiDung?.includes('Khách hàng tạo đơn hàng');
  };

  // Lấy icon dựa trên loại thông báo
  const getNotificationIcon = (notification) => {
    // Kiểm tra nếu là thông báo từ khách hàng
    if (isCustomerNotification(notification)) {
      return <UserOutlined style={{ color: '#ff4d4f' }} />;
    }
    
    // Kiểm tra theo loại thông báo
    switch (notification.loaiThongBao) {
      case 'HOA_DON_MOI':
        return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;
      case 'HOA_DON_XAC_NHAN': 
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'HOA_DON_HOAN_THANH':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'HOA_DON_HUY':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  // Làm mới dữ liệu thông báo
  const handleRefreshNotifications = () => {
    // Reset pagination và làm mới dữ liệu
    setPagination({
      current: 1,
      pageSize: pagination.pageSize,
      total: 0,
      hasMore: true
    });
    fetchNotifications(1);
  };

  // Nội dung dropdown
  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto', backgroundColor: '#fff', boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08)', borderRadius: '4px' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
        <Text strong>Thông báo</Text>
        <div>
          <Button 
            type="text"
            icon={<SyncOutlined />} 
            size="small"
            onClick={handleRefreshNotifications}
            style={{ marginRight: 8 }}
            loading={loading}
          />
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={handleMarkAllAsRead}
              style={{ padding: 0 }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>
      
      {/* Hiển thị phần tiêu đề cho đơn hàng mới từ khách hàng nếu có */}
      {customerOrderCount > 0 && (
        <div style={{ padding: '8px 16px', backgroundColor: '#fff1f0', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: '44px', zIndex: 1 }}>
          <Text strong style={{ color: '#cf1322' }}>
            {customerOrderCount} đơn hàng mới từ khách hàng cần xác nhận
          </Text>
        </div>
      )}
      
      {loading && pagination.current === 1 ? (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <Text type="secondary">Không có thông báo</Text>
        </div>
      ) : (
        <>
          <List
            dataSource={notifications}
            locale={{ emptyText: "Không có thông báo" }}
            renderItem={item => (
              <List.Item
                onClick={() => handleNotificationClick(item)}
                style={{ 
                  padding: '12px 16px', 
                  cursor: 'pointer',
                  backgroundColor: isCustomerNotification(item) && !item.daDoc
                    ? '#fff1f0'  // Nền đỏ nhạt cho đơn từ khách chưa đọc
                    : item.daDoc ? 'transparent' : '#e6f7ff',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(item)} 
                      style={{ 
                        backgroundColor: isCustomerNotification(item) && !item.daDoc 
                          ? '#ffccc7' 
                          : item.daDoc ? '#f0f0f0' : '#fff' 
                      }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Text strong={!item.daDoc}>{item.tieuDe}</Text>
                      {item.maHoaDon && (
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                          #{item.maHoaDon}
                        </Text>
                      )}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Text>{item.noiDung}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatNotificationTime(item.ngayTao)}
                        </Text>
                        {item.entityId && (
                          <Button 
                            type="link" 
                            size="small" 
                            style={{ padding: '0', height: 'auto', fontSize: '12px' }}
                            onClick={(e) => {
                              e.stopPropagation(); 
                              navigate(`/admin/hoa-don/detail/${item.entityId}`);
                              setIsDropdownVisible(false);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        )}
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          
          {/* Nút "Xem thêm" */}
          {pagination.hasMore && (
            <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
              <Button 
                type="link" 
                onClick={loadMoreNotifications} 
                loading={loadingMore}
                disabled={loadingMore}
                icon={<DownOutlined />}
                block
              >
                {loadingMore ? 'Đang tải...' : 'Xem thêm'}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Footer */}
      <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: pagination.hasMore ? 'none' : '1px solid #f0f0f0' }}>
        <Button type="link" onClick={() => {
          navigate('/admin/notifications');
          setIsDropdownVisible(false);
        }}>
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown 
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      arrow
      trigger={['click']}
      onOpenChange={handleDropdownVisibleChange}
      open={isDropdownVisible}
    >
      <div className="notification-bell-container" style={{ position: 'relative' }}>
        {/* Hiển thị badge chính với tổng số thông báo chưa đọc */}
        <Badge 
          count={unreadCount} 
          overflowCount={99} 
          size="small"
          style={{ 
            // Nếu có đơn hàng mới từ khách hàng, đổi màu badge thành đỏ
            backgroundColor: customerOrderCount > 0 ? '#ff4d4f' : undefined 
          }}
        >
          <Button
            icon={<BellOutlined style={{ fontSize: 20 }} />}
            type="text"
            style={{ width: 40, height: 40 }}
          />
        </Badge>
        
        {/* Hiển thị chỉ báo nhỏ (dot) để phân biệt khi có đơn mới từ khách hàng */}
        {customerOrderCount > 0 && (
          <div 
            style={{ 
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ffcf00', // Màu vàng để thu hút chú ý
              borderRadius: '50%',
              zIndex: 10,
              border: '1px solid #fff'
            }}
          />
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationBell;