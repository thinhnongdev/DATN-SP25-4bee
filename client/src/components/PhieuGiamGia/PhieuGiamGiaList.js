import { useEffect, useState, useCallback, useMemo } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { fetchPhieuGiamGia, updateTrangThaiPhieuGiamGia } from "../Service/api";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  DatePicker,
  Select,
  Button,
  Pagination,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Tooltip,
  Badge
} from "antd";
import { EditOutlined, PlusOutlined, FileExcelOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Hàm kiểm tra trạng thái dựa trên thời gian
const getStatusBasedOnTime = (startDate, endDate,soLuong) => {
  if (soLuong <= 0) return 2;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 4; // Không xác định
  if (now < start) return 3; // Sắp diễn ra
  if (now >= start && now <= end) return 1; // Đang hoạt động
  if (now > end) return 2; // Đã kết thúc
  return 4; // Không xác định
};

const PhieuGiamGiaList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAutoChecking, setIsAutoChecking] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    dateRange: [],
    kieuGiamGia: "",
    trangThai: ""
  });

  const navigate = useNavigate();

  // Cập nhật trạng thái cho toàn bộ dữ liệu
  const updateStatusForAllData = useCallback((data) => {
    return data.map(item => ({
      ...item,
      trangThai: getStatusBasedOnTime(item.ngayBatDau, item.ngayKetThuc,item.soLuong)
    }));
  }, []);

  // Fetch dữ liệu từ API
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPhieuGiamGia({ pageNo: 0, pageSize: 1000 });
      const updatedData = updateStatusForAllData(res.data.content || []);
      setData(updatedData);
      setFilteredData(updatedData);
      setLastUpdated(new Date());
      toast.success("Dữ liệu đã được cập nhật");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [updateStatusForAllData]);

  // Effect để fetch dữ liệu ban đầu
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Effect để tự động cập nhật trạng thái và đồng bộ với backend
  useEffect(() => {
    if (!isAutoChecking) return;

    const intervalId = setInterval(async () => {
      setData(prevData => {
        const updatedData = updateStatusForAllData(prevData);
        if (JSON.stringify(updatedData) !== JSON.stringify(prevData)) {
          const changedItems = updatedData.filter(
            item => item.trangThai !== prevData.find(p => p.id === item.id)?.trangThai
          );
          if (changedItems.length > 0) {
            Promise.all(
              changedItems.map(item =>
                updateTrangThaiPhieuGiamGia(item.id, item.trangThai)
                  .catch(error => {
                    toast.error(`Lỗi cập nhật trạng thái cho ${item.maPhieuGiamGia}`);
                    return null;
                  })
              )
            ).then(() => {
              toast.success("Đã đồng bộ trạng thái với server");
            });
          }
          setLastUpdated(new Date());
          setFilteredData(updatedData); // Cập nhật filteredData để hiển thị thay đổi
          return updatedData;
        }
        return prevData;
      });
    }, 60000); // 1 phút

    return () => clearInterval(intervalId);
  }, [isAutoChecking, updateStatusForAllData]);

  // Áp dụng bộ lọc
  const applyFilters = useCallback(() => {
    let result = [...data];

    if (filters.search) {
      result = result.filter(
        item =>
          item.tenPhieuGiamGia?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.maPhieuGiamGia?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange.map(date => new Date(date));
      result = result.filter(item => {
        const ngayBatDau = new Date(item.ngayBatDau);
        const ngayKetThuc = new Date(item.ngayKetThuc);
        return (
          (ngayBatDau >= startDate && ngayBatDau <= endDate) ||
          (ngayKetThuc >= startDate && ngayKetThuc <= endDate) ||
          (ngayBatDau <= startDate && ngayKetThuc >= endDate)
        );
      });
    }

    if (filters.kieuGiamGia) {
      result = result.filter(item => {
        if (filters.kieuGiamGia === "%") return item.loaiPhieuGiamGia === 1;
        if (filters.kieuGiamGia === "VND") return item.loaiPhieuGiamGia === 2;
        return true;
      });
    }

    if (filters.trangThai) {
      result = result.filter(item => item.trangThai === Number(filters.trangThai));
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Tính toán dữ liệu phân trang
  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Xuất file Excel
  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item, index) => ({
        STT: index + 1,
        "Mã phiếu": item.maPhieuGiamGia,
        "Tên phiếu": item.tenPhieuGiamGia,
        "Kiểu giảm giá": item.loaiPhieuGiamGia === 1 ? "%" : "VND",
        "Giá trị giảm": item.loaiPhieuGiamGia === 1
          ? `${item.giaTriGiam}%`
          : `${item.giaTriGiam.toLocaleString()} VND`,
        "Số lượng": item.soLuong,
        "Ngày bắt đầu": moment(item.ngayBatDau).format("DD/MM/YYYY HH:mm"),
        "Ngày kết thúc": moment(item.ngayKetThuc).format("DD/MM/YYYY HH:mm"),
        "Trạng thái": renderStatusText(item.trangThai)
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachPhieuGiamGia");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `DanhSachPhieuGiamGia_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
    );
    toast.success("Xuất file Excel thành công!");
  }, [filteredData]);

  // Cấu hình trạng thái
  const statusConfig = {
    1: { text: "Hoạt động", color: "green", icon: <SyncOutlined spin /> },
    2: { text: "Đã kết thúc", color: "red" },
    3: { text: "Sắp diễn ra", color: "blue" },
    
  };

  const renderStatusText = (trangThai) => statusConfig[trangThai]?.text || "Không xác định";

  const renderStatusTag = (trangThai) => {
    const { color, text, icon } = statusConfig[trangThai] || { color: "gray", text: "Không xác định" };
    return (
      <Badge count={icon} offset={[10, 0]}>
        <Tag color={color} style={{ fontSize: 14, padding: "4px 12px", borderRadius: "15px" }}>
          {text}
        </Tag>
      </Badge>
    );
  };

  // Định nghĩa columns với width tối thiểu và không ellipsis cho tên
  const columns = [
    { 
      title: "STT", 
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, 
      width: "5%", 
      align: "center" 
    },
    { 
      title: "Mã", 
      dataIndex: "maPhieuGiamGia", 
      key: "maPhieuGiamGia", 
      width: "8%" 
    },
    { 
      title: "Tên", 
      dataIndex: "tenPhieuGiamGia", 
      key: "tenPhieuGiamGia", 
      width: "15%", 
      ellipsis: false ,
       align: "center"
    },
    {
      title: "Kiểu giảm giá",
      dataIndex: "loaiPhieuGiamGia",
      key: "loaiPhieuGiamGia",
      render: kieu => <Tag color={kieu === 1 ? "geekblue" : "purple"}>{kieu === 1 ? "%" : "VND"}</Tag>,
      width: "8%",
      align: "center"
    },
    {
      title: "Giá trị giảm",
      dataIndex: "giaTriGiam",
      key: "giaTriGiam",
      render: (giaTri, record) =>
        record.loaiPhieuGiamGia === 1 ? `${giaTri}%` : `${giaTri?.toLocaleString()} VND`,
      width: "10%",
       align: "center"
    },
    { 
      title: "Số lượng", 
      dataIndex: "soLuong", 
      key: "soLuong", 
      width: "8%", 
      align: "center"
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "giaTriToiThieu",
      key: "giaTriToiThieu",
      render: value => value ? `${value.toLocaleString()} VND` : "Không",
      width: "10%",
     align: "center"
    },
    {
      title: "Giảm tối đa",
      dataIndex: "soTienGiamToiDa",
      key: "soTienGiamToiDa",
      render: value => value ? `${value.toLocaleString()} VND` : "Không",
      width: "10%",
      align: "center"
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      render: ngay => moment(ngay).format("DD/MM/YYYY HH:mm"),
      width: "12%",
      align: "center"
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      render: ngay => moment(ngay).format("DD/MM/YYYY HH:mm"),
      width: "12%",
     align: "center"
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: renderStatusTag,
      width: "10%",
      filters: Object.entries(statusConfig).map(([value, { text }]) => ({ text, value: Number(value) })),
      onFilter: (value, record) => record.trangThai === value
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              onClick={() => navigate(`/admin/update-phieu-giam-gia/${record.id}`)}
              icon={<EditOutlined />}
            />
          </Tooltip>
        </Space>
      ),
      width: "8%",
      fixed: "right"
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 15 }}>
          <Col>
            <h5 style={{ margin: 0, display: "flex", alignItems: "center" }}>
              <FilterOutlined style={{ marginRight: 8 }} />
              Bộ lọc
            </h5>
          </Col>
          <Col>
            <Space>
              <span style={{ color: "#888", fontSize: 12 }}>
                {lastUpdated && `Cập nhật lúc: ${moment(lastUpdated).format("HH:mm:ss DD/MM/YYYY")}`}
              </span>
              <Button icon={<SyncOutlined />} onClick={fetchAllData} loading={loading}>
                Làm mới
              </Button>
              <Tooltip title={isAutoChecking ? "Tắt tự động cập nhật" : "Bật tự động cập nhật"}>
                <Button
                  type={isAutoChecking ? "primary" : "default"}
                  icon={<SyncOutlined spin={isAutoChecking} />}
                  onClick={() => setIsAutoChecking(!isAutoChecking)}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã hoặc tên"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              onChange={dates => setFilters({ ...filters, dateRange: dates || [] })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn kiểu giảm giá"
              style={{ width: "100%" }}
              value={filters.kieuGiamGia}
              onChange={value => setFilters({ ...filters, kieuGiamGia: value })}
              allowClear
            >
              <Option value="">Tất cả kiểu</Option>
              <Option value="%">Giảm theo %</Option>
              <Option value="VND">Giảm theo VND</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              value={filters.trangThai}
              onChange={value => setFilters({ ...filters, trangThai: value })}
              allowClear
            >
              <Option value="">Tất cả trạng thái</Option>
              {Object.entries(statusConfig).map(([value, { text }]) => (
                <Option key={value} value={Number(value)}>{text}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h5 style={{ margin: 0 }}>Danh sách phiếu giảm giá</h5>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => navigate("/admin/add-p")}
              >
                Thêm mới
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          rowKey="id"
          pagination={false}
          bordered
          style={{ minWidth: "100%", tableLayout: "auto" }}
          responsive={["xs", "sm", "md", "lg", "xl", "xxl"]}
        />

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#888" }}>
            Hiển thị {paginatedData.length} trên tổng {filteredData.length} phiếu
          </span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={page => setCurrentPage(page)}
            onShowSizeChange={(current, size) => setPageSize(size)}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </Card>
    </div>
  );
};

export default PhieuGiamGiaList;