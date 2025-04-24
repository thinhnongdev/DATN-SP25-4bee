import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Modal,
  Spin,
  Tabs,
  Badge,
  message,
  Breadcrumb,
  Tooltip,
  Space,
  Pagination,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  FilterOutlined,
  EditOutlined,
  PrinterOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  CloseOutlined,
  ScanOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { StatusChip, TypeChip } from "../components/StatusChip";
import { formatCurrency, formatDate } from "../utils/format";
import dayjs from "dayjs";
import api from "../utils/api";
import Header from "../components/common/Header";
import QrScanner from "../components/QrScanner";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function InvoiceList() {
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState([]); // Store all fetched invoices
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Start from 1 for better UX
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [printingInvoices, setPrintingInvoices] = useState(new Set());
  const [tabValue, setTabValue] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    trangThai: "",
    orderType: "",
    fromDate: dayjs().startOf("day"),
    toDate: dayjs().endOf("day"),
    minPrice: "",
    maxPrice: "",
  });
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch all invoices once on initial load
  const fetchAllInvoices = async () => {
    try {
      setLoading(true);
      // Fetch with a large page size to get all data at once
      const response = await api.get("/api/admin/hoa-don/search", {
        params: {
          page: 0,
          size: 1000, // Large page size to get as much data as possible
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setAllInvoices(response.data.content);
      } else {
        message.error("Không thể tải danh sách hóa đơn");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  // Filter invoices based on all filter criteria
  const filteredInvoices = useMemo(() => {
    setIsFiltering(true);

    const result = allInvoices.filter((invoice) => {
      // Keyword search (exact match or contains)
      if (filters.keyword && filters.keyword.trim() !== "") {
        const keyword = normalizeText(filters.keyword.trim());
        const maHoaDon = normalizeText(invoice.maHoaDon || "");
        const tenNguoiNhan = normalizeText(invoice.tenNguoiNhan || "");
        const soDienThoai = normalizeText(invoice.soDienThoai || "");

        // Search with normalized text (no accents)
        if (
          !maHoaDon.includes(keyword) &&
          !tenNguoiNhan.includes(keyword) &&
          !soDienThoai.includes(keyword)
        ) {
          return false;
        }
      }
      // Status filter
      if (
        filters.trangThai &&
        invoice.trangThai.toString() !== filters.trangThai
      ) {
        return false;
      }
      // Order type filter
      if (
        filters.orderType &&
        invoice.loaiHoaDon?.toString() !== filters.orderType
      ) {
        return false;
      }

      // Date range filter
      if (filters.fromDate && filters.toDate) {
        const invoiceDate = dayjs(invoice.ngayTao);
        if (
          !invoiceDate.isValid() ||
          invoiceDate.isBefore(filters.fromDate, "day") ||
          invoiceDate.isAfter(filters.toDate, "day")
        ) {
          return false;
        }
      }

      // Price range filter
      if (
        filters.minPrice &&
        Number(invoice.tongTien) < Number(filters.minPrice)
      ) {
        return false;
      }

      if (
        filters.maxPrice &&
        Number(invoice.tongTien) > Number(filters.maxPrice)
      ) {
        return false;
      }

      return true;
    });
    const sortedResult = [...result].sort((a, b) => {
      const dateA = new Date(a.ngayTao);
      const dateB = new Date(b.ngayTao);
      return dateA - dateB; // Sắp xếp tăng dần theo ngày tạo (cũ nhất lên đầu)
    });
  
    setTimeout(() => setIsFiltering(false), 300);
    return sortedResult;
  }, [allInvoices, filters]);

  // Get current page of data
  const currentInvoices = useMemo(() => {
    const indexOfLastInvoice = page * rowsPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - rowsPerPage;
    return filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  }, [filteredInvoices, page, rowsPerPage]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const invoicesForCounting = allInvoices.filter((invoice) => {
      if (filters.keyword && filters.keyword.trim() !== "") {
        const keyword = normalizeText(filters.keyword.trim());
        const maHoaDon = normalizeText(invoice.maHoaDon || "");
        const tenNguoiNhan = normalizeText(invoice.tenNguoiNhan || "");
        const soDienThoai = normalizeText(invoice.soDienThoai || "");

        if (
          !maHoaDon.includes(keyword) &&
          !tenNguoiNhan.includes(keyword) &&
          !soDienThoai.includes(keyword)
        ) {
          return false;
        }
      }

      // Order type filter
      if (
        filters.orderType &&
        invoice.loaiHoaDon?.toString() !== filters.orderType
      ) {
        return false;
      }

      // Date range filter
      if (filters.fromDate && filters.toDate) {
        const invoiceDate = dayjs(invoice.ngayTao);
        if (
          !invoiceDate.isValid() ||
          invoiceDate.isBefore(filters.fromDate, "day") ||
          invoiceDate.isAfter(filters.toDate, "day")
        ) {
          return false;
        }
      }

      // Price range filter
      if (
        filters.minPrice &&
        Number(invoice.tongTien) < Number(filters.minPrice)
      ) {
        return false;
      }

      if (
        filters.maxPrice &&
        Number(invoice.tongTien) > Number(filters.maxPrice)
      ) {
        return false;
      }

      return true;
    });

    // Đếm số lượng hóa đơn theo từng trạng thái
    const counts = invoicesForCounting.reduce(
      (acc, invoice) => {
        acc[invoice.trangThai] = (acc[invoice.trangThai] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    );

    return counts;
  }, [
    allInvoices,
    filters.keyword,
    filters.orderType,
    filters.fromDate,
    filters.toDate,
    filters.minPrice,
    filters.maxPrice,
  ]);

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (current, size) => {
    setRowsPerPage(size);
    setPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (field) => (value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      fromDate: dates ? dates[0] : null,
      toDate: dates ? dates[1] : null,
    }));
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      trangThai: "",
      orderType: "",
      fromDate: null,
      toDate: null,
      minPrice: "",
      maxPrice: "",
    });
    setPage(1);
  };

  // Quick date filters
  const quickDateFilters = [
    { label: "Hôm nay", value: "today" },
    { label: "Tuần này", value: "thisWeek" },
    { label: "Tháng này", value: "thisMonth" },
  ];

  // Check if quick date filter is active
  const isQuickFilterActive = (filterValue) => {
    if (!filters.fromDate || !filters.toDate) return false;
    const now = dayjs();

    switch (filterValue) {
      case "today":
        return (
          filters.fromDate.isSame(now, "day") &&
          filters.toDate.isSame(now, "day")
        );
      case "thisWeek":
        return (
          filters.fromDate.isSame(now.startOf("week"), "day") &&
          filters.toDate.isSame(now.endOf("week"), "day")
        );
      case "thisMonth":
        return (
          filters.fromDate.isSame(now.startOf("month"), "day") &&
          filters.toDate.isSame(now.endOf("month"), "day")
        );
      default:
        return false;
    }
  };

  // Apply quick date filter
  const applyQuickDateFilter = (filterValue) => {
    const now = dayjs();
    let fromDate = null;
    let toDate = null;

    switch (filterValue) {
      case "today":
        fromDate = now.startOf("day");
        toDate = now.endOf("day");
        break;
      case "thisWeek":
        fromDate = now.startOf("week");
        toDate = now.endOf("week");
        break;
      case "thisMonth":
        fromDate = now.startOf("month");
        toDate = now.endOf("month");
        break;
      default:
        break;
    }

    setFilters((prev) => ({ ...prev, fromDate, toDate }));
    setPage(1);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setTabValue(key);
    setFilters((prev) => ({ ...prev, trangThai: key }));
    setPage(1);
  };

  // Handle printing invoice
  const handlePrintInvoice = async (id) => {
    try {
      setPrintingInvoices((prev) => new Set([...prev, id]));
      const response = await api.get(`/api/admin/hoa-don/${id}/print`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, application/json",
        },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];
      if (!contentType.includes("application/pdf")) {
        message.error("Định dạng không hợp lệ từ máy chủ");
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow.print();
        } catch (error) {
          message.error("Lỗi khi in hóa đơn");
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch (error) {
      message.error("Lỗi khi tải hóa đơn");
    } finally {
      setPrintingInvoices((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Handle direct print
  const handleDirectPrint = () => {
    const iframe = document.getElementById("pdf-preview");
    iframe.contentWindow.print();
  };

  // Handle QR scanner
  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      render: (text, record, index) => index + 1 + (page - 1) * rowsPerPage,
      width: 70,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "maHoaDon",
      key: "maHoaDon",
      align: "center",
      width: 150,
    },
    {
      title: "Người nhận",
      dataIndex: "tenNguoiNhan",
      key: "tenNguoiNhan",
      align: "center",
      width: 180,
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
      align: "center",
      width: 130,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "tenNhanVien",
      key: "tenNhanVien",
      align: "center",
      width: 180,
      render: (text) => text || "---",
    },
    {
      title: "Loại",
      dataIndex: "loaiHoaDon",
      key: "loaiHoaDon",
      align: "center",
      width: 100,
      render: (text, record) => <TypeChip type={record.loaiHoaDon} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
      width: 140,
      render: (text) => formatDate(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 140,
      render: (text) => <StatusChip status={text} />,
    },
    {
      title: "Tổng tiền",
      key: "tongTien",
      align: "center",
      width: 150,
      render: (text, record) => (
        <div>
          <div>{formatCurrency(record.tongTien)}</div>
          {record.tongThanhToan > 0 && (
            <div
              style={{
                fontSize: "12px",
                color:
                  record.tongThanhToan >= record.tongTien
                    ? "#52c41a"
                    : "#faad14",
              }}
            >
              Đã thanh toán: {formatCurrency(record.tongThanhToan)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 120,
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Chi tiết">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/hoa-don/detail/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record.id)}
              loading={printingInvoices.has(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Modal for PDF preview
  const PreviewModal = () => (
    <Modal
      visible={previewOpen}
      onCancel={() => {
        setPreviewOpen(false);
        if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }}
      width="80%"
      footer={[
        <Button key="print" type="primary" onClick={handleDirectPrint}>
          In hóa đơn
        </Button>,
      ]}
    >
      <iframe
        id="pdf-preview"
        src={pdfUrl}
        width="100%"
        height="600px"
        style={{ border: "none" }}
        title="PDF Preview"
      />
    </Modal>
  );

  return (
    <Layout className="flex-1 overflow-auto relative z-10">
      <div style={{ padding: "16px 0 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumb
          items={[
            { title: "Quản lý hóa đơn" }
          ]}
          style={{ fontSize: "26px", fontWeight: "bold" }}
        />
      </div>
      <Content style={{ padding: "20px" }}>
        {/* Filter Card */}
        <Card
          title={
            <Title level={4}>
              <FilterOutlined /> Bộ lọc
            </Title>
          }
          bordered={false}
          extra={
            <Button
              icon={<SyncOutlined />}
              onClick={fetchAllInvoices}
              loading={loading}
            >
              Làm mới dữ liệu
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Nhập mã hóa đơn, tên người nhận, số điện thoại..."
                value={filters.keyword || ""}
                onChange={(e) => handleFilterChange("keyword")(e.target.value)}
                suffix={
                  <Tooltip title="Hỗ trợ tìm kiếm không dấu">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
              />
            </Col>
            <Col span={12}>
              <Select
                placeholder="Loại đơn"
                value={filters.orderType}
                onChange={handleFilterChange("orderType")}
                style={{ width: "100%" }}
              >
                <Option value="">Tất cả</Option>
                <Option value="1">Online</Option>
                <Option value="2">Tại quầy</Option>
                <Option value="3">Giao hàng</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Input
                placeholder="Giá tối thiểu"
                value={
                  filters.minPrice
                    ? filters.minPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  if (value === "" || /^\d+$/.test(value)) {
                    const numValue = value ? Number(value) : "";
                    handleFilterChange("minPrice")(numValue);
                  }
                }}
                onBlur={() => {
                  // Kiểm tra ràng buộc khi người dùng hoàn tất nhập liệu
                  if (
                    filters.minPrice &&
                    filters.maxPrice &&
                    Number(filters.minPrice) > Number(filters.maxPrice)
                  ) {
                    message.warning(
                      "Giá trị tối thiểu không được lớn hơn giá trị tối đa!"
                    );
                    // Đặt lại giá trị tối thiểu bằng giá trị tối đa
                    handleFilterChange("minPrice")(filters.maxPrice);
                  }
                }}
                status={
                  filters.maxPrice && filters.minPrice > filters.maxPrice
                    ? "error"
                    : ""
                }
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Giá tối đa"
                value={
                  filters.maxPrice
                    ? filters.maxPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  if (value === "" || /^\d+$/.test(value)) {
                    const numValue = value ? Number(value) : "";
                    handleFilterChange("maxPrice")(numValue);
                  }
                }}
                onBlur={() => {
                  // Kiểm tra ràng buộc khi người dùng hoàn tất nhập liệu
                  if (
                    filters.minPrice &&
                    filters.maxPrice &&
                    Number(filters.maxPrice) < Number(filters.minPrice)
                  ) {
                    message.warning(
                      "Giá trị tối đa không được nhỏ hơn giá trị tối thiểu!"
                    );
                    // Đặt lại giá trị tối đa bằng giá trị tối thiểu
                    handleFilterChange("maxPrice")(filters.minPrice);
                  }
                }}
                status={
                  filters.minPrice && filters.maxPrice < filters.minPrice
                    ? "error"
                    : ""
                }
              />
            </Col>
            <Col span={24}>
              <RangePicker
                value={[filters.fromDate, filters.toDate]}
                onChange={handleDateChange}
                style={{ width: "100%" }}
                allowClear
              />
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: "16px" }}>
            <Space>
              {quickDateFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type={
                    isQuickFilterActive(filter.value) ? "primary" : "default"
                  }
                  icon={<CalendarOutlined />}
                  onClick={() => applyQuickDateFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
              <Button
                type="default"
                icon={<CloseOutlined />}
                onClick={handleResetFilters}
                danger
                disabled={
                  !Object.values(filters).some((x) => x !== "" && x !== null)
                }
              >
                Đặt lại bộ lọc
              </Button>
            </Space>
          </Row>
        </Card>

        {/* Invoice List Card */}
        <Card
          title={
            <Title level={4}>
              <ShoppingCartOutlined /> Danh sách hóa đơn
            </Title>
          }
          bordered={false}
          extra={
            <Space>
              <Button
                type="primary"
                icon={<ScanOutlined />}
                onClick={() => setIsQrModalOpen(true)}
              >
                Quét mã QR
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/admin/ban-hang")}
              >
                Tạo mới
              </Button>
            </Space>
          }
          style={{ marginTop: "24px" }}
        >
          {/* Tabs with status counts */}
          <Tabs activeKey={tabValue} onChange={handleTabChange}>
            <TabPane
              tab={
                <span>
                  Tất cả{" "}
                  <sup style={{ color: "blue" }}>{statusCounts.all || 0}</sup>
                </span>
              }
              key=""
            />
            <TabPane
              tab={
                <span>
                  Chờ xác nhận{" "}
                  <sup style={{ color: "red" }}>{statusCounts[1] || 0}</sup>
                </span>
              }
              key="1"
            />
            <TabPane
              tab={
                <span>
                  Đã xác nhận{" "}
                  <sup style={{ color: "red" }}>{statusCounts[2] || 0}</sup>
                </span>
              }
              key="2"
            />
            <TabPane
              tab={
                <span>
                  Chờ giao hàng{" "}
                  <sup style={{ color: "red" }}>{statusCounts[3] || 0}</sup>
                </span>
              }
              key="3"
            />
            <TabPane
              tab={
                <span>
                  Đang giao{" "}
                  <sup style={{ color: "red" }}>{statusCounts[4] || 0}</sup>
                </span>
              }
              key="4"
            />
            <TabPane
              tab={
                <span>
                  Hoàn thành{" "}
                  <sup style={{ color: "red" }}>{statusCounts[5] || 0}</sup>
                </span>
              }
              key="5"
            />
            <TabPane
              tab={
                <span>
                  Đã hủy{" "}
                  <sup style={{ color: "red" }}>{statusCounts[6] || 0}</sup>
                </span>
              }
              key="6"
            />
          </Tabs>

          {/* Status message when filtering */}
          {isFiltering ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin tip="Đang lọc dữ liệu..." />
            </div>
          ) : (
            <>
              {/* Result count information */}
              <div style={{ margin: "10px 0" }}>
                <Text>
                  {filteredInvoices.length > 0
                    ? `Tìm thấy ${filteredInvoices.length} hóa đơn phù hợp với điều kiện`
                    : "Không tìm thấy hóa đơn nào phù hợp với điều kiện"}
                </Text>
              </div>

              {/* Invoice table */}
              <Table
                columns={columns}
                dataSource={currentInvoices}
                rowKey="id"
                loading={loading}
                pagination={false}
                style={{ marginTop: "10px" }}
                scroll={{ x: "max-content" }}
              />

              {/* Custom pagination */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <Pagination
                  total={filteredInvoices.length}
                  current={page}
                  pageSize={rowsPerPage}
                  onChange={handleChangePage}
                  onShowSizeChange={handleChangeRowsPerPage}
                  showSizeChanger
                  showTotal={(total) => `Tổng ${total} hóa đơn`}
                />
              </div>
            </>
          )}
        </Card>

        {/* Modals */}
        <PreviewModal />
        <Modal
          title="Quét mã QR Hóa Đơn"
          open={isQrModalOpen}
          onCancel={handleCloseQrModal}
          footer={null}
          destroyOnClose={true}
        >
          <QrScanner
            isActive={isQrModalOpen}
            onScanSuccess={(decodedText) => {
              setIsQrModalOpen(false);
              navigate(`/admin/hoa-don/detail/${decodedText}`);
            }}
            onScanError={(error) => {
              console.error("QR scan error:", error);
            }}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default InvoiceList;
