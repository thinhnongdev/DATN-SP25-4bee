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
        `/api/admin/hoa-don/${selectedInvoice.id}`
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
      const response = await api.get(`/api/admin/hoa-don/${id}/print`, {
        responseType: "blob",
        headers: { Accept: "application/pdf, application/json" },
      });

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
  };

  const filterInvoices = (invoices, filters) => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.ngayTao);

      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const isWithinDateRange =
        (!fromDate || invoiceDate >= fromDate) &&
        (!toDate || invoiceDate <= toDate);

      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
      const isWithinPriceRange =
        (!minPrice || invoice.tongTien >= minPrice) &&
        (!maxPrice || invoice.tongTien <= maxPrice);

      const keywordMatch = filters.keyword
        ? invoice.maHoaDon.includes(filters.keyword) ||
          invoice.tenNguoiNhan
            .toLowerCase()
            .includes(filters.keyword.toLowerCase()) ||
          invoice.soDienThoai.includes(filters.keyword)
        : true;

      const orderTypeMatch =
        !filters.orderType ||
        invoice.loaiHoaDon === parseInt(filters.orderType);

      return (
        keywordMatch &&
        isWithinDateRange &&
        isWithinPriceRange &&
        orderTypeMatch
      );
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
      render: (text) => formatCurrency(text),
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
              onClick={() => navigate(`/hoa-don/detail/${record.id}`)}
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
              </Select>
            </Col>
            <Col span={12}>
              <Input
                placeholder="Giá tối thiểu"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice")(e.target.value)}
                type="number"
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Giá tối đa"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice")(e.target.value)}
                type="number"
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
                onClick={() => navigate("/hoa-don/create")}
              >
                Tạo mới
              </Button>
            </Space>
          }
          style={{ marginTop: "24px" }}
        >
          <Tabs activeKey={tabValue} onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="" />
            <TabPane tab={`Chờ xác nhận (${statusCounts[1]})`} key="1" />
            <TabPane tab={`Đã xác nhận (${statusCounts[2]})`} key="2" />
            <TabPane tab={`Đang giao (${statusCounts[3]})`} key="3" />
            <TabPane tab={`Đã giao (${statusCounts[4]})`} key="4" />
            <TabPane tab={`Đã hủy (${statusCounts[5]})`} key="5" />
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
        <Modal
          visible={deleteDialogOpen}
          onCancel={() => setDeleteDialogOpen(false)}
          onOk={handleDelete}
          okText="Xóa"
          cancelText="Hủy"
          title="Xác nhận xóa"
          centered
        >
          <Text>
            Bạn có chắc chắn muốn xóa hóa đơn {selectedInvoice?.maHoaDon}?
          </Text>
        </Modal>
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
              navigate(`/hoa-don/detail/${decodedText}`);
            }}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default InvoiceList;
