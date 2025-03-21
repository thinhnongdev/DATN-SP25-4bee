import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Tooltip,
  Space,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  FilterOutlined,
  EditOutlined,
  PrinterOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  CloseOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printingInvoices, setPrintingInvoices] = useState(new Set());
  const [tabValue, setTabValue] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });

  const [filters, setFilters] = useState({
    maHoaDon: "",
    trangThai: "",
    orderType: "",
    fromDate: dayjs().startOf("day"),
    toDate: dayjs().endOf("day"),
    minPrice: "",
    maxPrice: "",
    orderType: "", // Add this line
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
  };
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/hoa-don/search", {
        params: {
          page,
          size: rowsPerPage,
          keyword: filters.keyword || null,
          trangThai: filters.trangThai || null,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setInvoices(response.data.content);
        setTotalElements(response.data.totalElements);
      } else {
        toast.error("Không thể tải danh sách hóa đơn");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatusCounts = (filteredInvoices) => {
    const counts = filteredInvoices.reduce(
      (acc, invoice) => {
        acc[invoice.trangThai] = (acc[invoice.trangThai] || 0) + 1;
        acc.all = (acc.all || 0) + 1;
        return acc;
      },
      { all: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );
    setStatusCounts(counts);
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    const filteredResults = filterInvoices(invoices, filters);
    calculateStatusCounts(filteredResults);
  }, [invoices, filters]);

  const handleFilterChange = (field) => (value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleDateChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      fromDate: dates ? dates[0] : null,
      toDate: dates ? dates[1] : null,
    }));
    setPage(0);
  };

  const quickDateFilters = [
    { label: "Hôm nay", value: "today" },
    { label: "Tuần này", value: "thisWeek" },
    { label: "Tháng này", value: "thisMonth" },
  ];

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

  const handleResetFilters = () => {
    setFilters({
      maHoaDon: "",
      trangThai: "",
      orderType: "",
      fromDate: null,
      toDate: null,
      minPrice: "",
      maxPrice: "",
    });
    setPage(0);
  };

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
    setPage(0);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage - 1);
  };

  const handleChangeRowsPerPage = (current, size) => {
    setRowsPerPage(size);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(
        `/api/admin/hoa-don/${selectedInvoice.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Xóa hóa đơn thành công");
        setDeleteDialogOpen(false);
        if (invoices.length === 1 && page > 0) {
          setPage(page - 1);
        }
        fetchInvoices();
      } else {
        const errorMessage = response.data?.message || "Không thể xóa hóa đơn";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa hóa đơn");
    }
  };

  const handlePrintInvoice = async (id) => {
    try {
      setPrintingInvoices((prev) => new Set([...prev, id]));
      const response = await api.get(
        `/api/admin/hoa-don/${id}/print`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf, application/json"
          },
          responseType: "blob"
        }
      );

      const contentType = response.headers["content-type"];
      if (!contentType.includes("application/pdf")) {
        toast.error("Định dạng không hợp lệ từ máy chủ");
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
          toast.error("Lỗi khi in hóa đơn");
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch (error) {
      toast.error("Lỗi khi tải hóa đơn");
    } finally {
      setPrintingInvoices((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDirectPrint = () => {
    const iframe = document.getElementById("pdf-preview");
    iframe.contentWindow.print();
  };

  const handleTabChange = (key) => {
    setTabValue(key);
    setFilters((prev) => ({ ...prev, trangThai: key }));
    setPage(0);
    // Status counts will be updated by the useEffect that depends on filters
  };

  const filterInvoices = (invoices, filters) => {
    return invoices.filter((invoice) => {
      // Check if keyword filter matches any of the text fields
      if (filters.keyword && filters.keyword.trim() !== "") {
        const keyword = filters.keyword.toLowerCase();
        const maHoaDon = invoice.maHoaDon ? invoice.maHoaDon.toLowerCase() : "";
        const tenNguoiNhan = invoice.tenNguoiNhan
          ? invoice.tenNguoiNhan.toLowerCase()
          : "";
        const soDienThoai = invoice.soDienThoai
          ? invoice.soDienThoai.toLowerCase()
          : "";

        if (
          !maHoaDon.includes(keyword) &&
          !tenNguoiNhan.includes(keyword) &&
          !soDienThoai.includes(keyword)
        ) {
          return false;
        }
      }

      // Filter by trang thai if specified
      if (
        filters.trangThai &&
        invoice.trangThai.toString() !== filters.trangThai
      ) {
        return false;
      }

      // Filter by order type if specified
      if (
        filters.orderType &&
        invoice.loaiHoaDon?.toString() !== filters.orderType
      ) {
        return false;
      }

      // Filter by date range
      if (filters.fromDate && filters.toDate) {
        const invoiceDate = dayjs(invoice.ngayTao);
        if (
          !invoiceDate.isValid() ||
          invoiceDate.isBefore(filters.fromDate) ||
          invoiceDate.isAfter(filters.toDate)
        ) {
          return false;
        }
      }

      // Filter by price range
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
  };

  const sortInvoices = (invoices, filters) => {
    return invoices.sort((a, b) => {
      const keyword = filters.keyword?.toLowerCase() || "";
      const aMatches =
        a.maHoaDon.toLowerCase().includes(keyword) ||
        a.tenNguoiNhan.toLowerCase().includes(keyword) ||
        a.soDienThoai.includes(keyword);
      const bMatches =
        b.maHoaDon.toLowerCase().includes(keyword) ||
        b.tenNguoiNhan.toLowerCase().includes(keyword) ||
        b.soDienThoai.includes(keyword);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return new Date(a.ngayTao) - new Date(b.ngayTao);
    });
  };

  const filteredInvoices = filterInvoices(invoices, filters);
  const sortedInvoices = sortInvoices(filteredInvoices, filters);

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

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      render: (text, record, index) => index + 1 + page * rowsPerPage,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "maHoaDon",
      key: "maHoaDon",
      align: "center",
    },
    {
      title: "Người nhận",
      dataIndex: "tenNguoiNhan",
      key: "tenNguoiNhan",
      align: "center",
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
      align: "center",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "nhanVien",
      key: "nhanVien",
      align: "center",
      render: (text, record) =>
        record.nhanVien ? record.nhanVien.tenNhanVien : "N/A",
    },
    {
      title: "Loại",
      dataIndex: "loaiHoaDon",
      key: "loaiHoaDon",
      align: "center",
      render: (text, record) => <TypeChip type={record.loaiHoaDon} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
      render: (text) => formatDate(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      render: (text) => <StatusChip status={text} />,
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      key: "tongTien",
      align: "center",
      render: (text, record) => {
        const shippingCost = record.phiVanChuyen || 0;
        const total = Number(text) + Number(shippingCost);
        return formatCurrency(total);
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
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

  return (
    <Layout className="flex-1 overflow-auto relative z-10">
      <Header title="Quản lý hóa đơn" />
      <Content style={{ padding: "24px" }}>
        <Card
          title={
            <Title level={4}>
              <FilterOutlined /> Bộ lọc
            </Title>
          }
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Input
                placeholder="Nhập mã hóa đơn, tên người nhận, số điện thoại..."
                value={filters.keyword || ""}
                onChange={(e) => handleFilterChange("keyword")(e.target.value)}
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
                    toast.warning(
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
                    toast.warning(
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
          <Tabs activeKey={tabValue} onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả</span>} key="" />
            <TabPane
              tab={
                <span>
                  Chờ xác nhận{" "}
                  <sup style={{ color: "red" }}>{statusCounts[1]}</sup>
                </span>
              }
              key="1"
            />
            <TabPane
              tab={
                <span>
                  Đã xác nhận{" "}
                  <sup style={{ color: "red" }}>{statusCounts[2]}</sup>
                </span>
              }
              key="2"
            />
            <TabPane
              tab={
                <span>
                  Chờ giao hàng{" "}
                  <sup style={{ color: "red" }}>{statusCounts[3]}</sup>
                </span>
              }
              key="3"
            />
            <TabPane
              tab={
                <span>
                  Đang giao{" "}
                  <sup style={{ color: "red" }}>{statusCounts[4]}</sup>
                </span>
              }
              key="4"
            />
            <TabPane
              tab={
                <span>
                  Hoàn thành{" "}
                  <sup style={{ color: "red" }}>{statusCounts[5]}</sup>
                </span>
              }
              key="5"
            />
            <TabPane
              tab={
                <span>
                  Đã hủy <sup style={{ color: "red" }}>{statusCounts[6]}</sup>
                </span>
              }
              key="6"
            />
          </Tabs>
          <Table
            columns={columns}
            dataSource={sortedInvoices}
            rowKey="id"
            loading={loading}
            pagination={false}
            style={{ marginTop: "16px" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <Pagination
              total={totalElements}
              current={page + 1}
              pageSize={rowsPerPage}
              onChange={handleChangePage}
              onShowSizeChange={handleChangeRowsPerPage}
              showSizeChanger
            />
          </div>
        </Card>
        <PreviewModal />
        <Modal
          title="Quét mã QR Hóa Đơn"
          open={isQrModalOpen}
          onCancel={handleCloseQrModal}
          footer={null}
          destroyOnClose={true} // Hủy Modal khi đóng để tránh lặp
        >
          <QrScanner
            isActive={isQrModalOpen} // Chỉ quét khi modal mở
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
