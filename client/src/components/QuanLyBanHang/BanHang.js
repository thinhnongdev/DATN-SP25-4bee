import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import "./BanHangCss.css";
import CreateForm from "../KhachHang/CreateForm";
import {
  Layout,
  Button,
  Row,
  Col,
  Tabs,
  Typography,
  Input,
  Table,
  Space,
  Avatar,
  Radio,
  InputNumber,
  Modal,
  Select,
  List,
  Image,
  Tag,
  Spin,
  Carousel,
  Divider, // Add this import
  Modal as AntdModal, // Add this import
  Alert, // Add this import
  Card, // Add this import
  Collapse, // Add this import
  Empty,
  Tooltip,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  SelectOutlined,
  SearchOutlined,
  TagOutlined, // Add this import
  InfoCircleOutlined, // Add this import
  DeleteOutlined,
  QrcodeOutlined,
  WalletOutlined,
  SyncOutlined,
  ArrowUpOutlined, // Add this import
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  BankOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { BiQrScan } from "react-icons/bi";
import { debounce } from "lodash";
import { AiOutlineSelect } from "react-icons/ai";
import { Option } from "antd/es/mentions";
import axios from "axios";
import { message, notification } from "antd";
import api from "../../utils/api";
import { formatCurrency } from "../../utils/format";
import ProductTable from "../HoaDon/ProductTable";
import { Client } from "@stomp/stompjs";
import { MenuItem, FormControl, InputLabel } from "@mui/material";
import { checkPayment } from "./checkPayment"; // Import hàm checkPayment
import GiaoHang from "./GiaoHang";
import QrScanner from "../QrScanner";
const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Add near the top of the file with other constants
const PAYMENT_METHOD = {
  CASH: "CASH",
  QR: "BANK",
  COD: "COD",
};

// Di chuyển các hàm helper ra ngoài component
const calculateDiscountAmount = (voucher, total) => {
  // Kiểm tra điều kiện áp dụng voucher
  if (!voucher || !total || total < voucher.giaTriToiThieu) {
    console.log("Không đủ điều kiện áp dụng voucher:", {
      total,
      minRequired: voucher?.giaTriToiThieu,
    });
    return 0;
  }

  let discountAmount = 0;

  // Kiểm tra loại voucher
  if (voucher.loaiPhieuGiamGia === 1) {
    // Loại 1: Giảm theo phần trăm
    // Tính số tiền giảm = tổng tiền hàng * phần trăm giảm / 100
    discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);

    // Nếu có giới hạn giảm tối đa và số tiền giảm vượt quá giới hạn
    if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
      discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
    }
  } else {
    // Loại khác: Giảm theo số tiền cố định
    discountAmount = Math.min(voucher.giaTriGiam, total);
  }

  // Đảm bảo số tiền giảm không âm và không vượt quá tổng tiền
  discountAmount = Math.max(0, Math.min(discountAmount, total));

  return discountAmount;
};

const BanHang = () => {
  const socket = useRef(null);
  const [isModalPaymentQR, setIsModalVisiblePaymentQR] = useState(false); // Trạng thái hiển thị Modal
  const [priceChangesConfirmed, setPriceChangesConfirmed] = useState({});
  const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
  const [activeTab, setActiveTab] = useState(null);
  const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 4 });
  const [activeKey, setActiveKey] = useState(null); // Giữ tab đang mở
  const [orderProducts, setOrderProducts] = useState({}); // Products in each order tab
  const [loading, setLoading] = useState(false);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [openProductTable, setOpenProductTable] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalRef] = useState(React.createRef());
  const [totalAmount, setTotalAmount] = useState(0); // Add new state for total amount
  const [totals, setTotals] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [customerPayment, setCustomerPayment] = useState({});
  const [suggestedVoucher, setSuggestedVoucher] = useState(null);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLoaiHoaDon, setSelectedLoaiHoaDon] = useState(2); // 2 = Tại quầy
  const [isLoaiHoaDonModalVisible, setIsLoaiHoaDonModalVisible] =
    useState(false);
  const [isCreateCustomerModalVisible, setIsCreateCustomerModalVisible] =
    useState(false);
  const [qrCode, setQrCode] = useState(""); // Thêm state này để lưu mã QR
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  const [calculatingShippingFee, setCalculatingShippingFee] = useState(false);
  const [isQrScannerVisible, setIsQrScannerVisible] = useState(false);
  const [scanningForHoaDonId, setScanningForHoaDonId] = useState(null);
  const [modalHandlers, setModalHandlers] = useState({
    onCancel: () => setIsModalVisiblePaymentQR(false),
    onOk: () => setIsModalVisiblePaymentQR(false),
  });
  const [hoaDonId, setHoaDonId] = useState(null); // Thêm state để lưu trữ hoaDonId hiện tại
  const [changedProducts, setChangedProducts] = useState([]);
  const [priceNeedsConfirmation, setPriceNeedsConfirmation] = useState(false);
  const [openPriceChangeDialog, setOpenPriceChangeDialog] = useState(false);
  const [priceChangeAmount, setPriceChangeAmount] = useState(0);
  const [updateAllPrices, setUpdateAllPrices] = useState(false);
  const [checkingPrice, setCheckingPrice] = useState(false);

  const [pollingInterval, setPollingInterval] = useState(null);

  const PAYMENT_RULES = {
    QR_CASH_ONLY: "Chỉ có thể kết hợp thanh toán QR với tiền mặt",
    CASH_EXCESS:
      "Khách trả tiền mặt thừa, sẽ tính tiền thừa và tắt phương thức khác",
    AUTO_CALCULATE: "Khi có nhiều phương thức, số tiền sẽ được phân bổ tự động",
    COD_EXCLUSIVE:
      "COD phải được thanh toán độc lập, không kết hợp với các phương thức khác",
  };
  // Tạo một component con riêng để hiển thị gợi ý voucher
  const VoucherSuggestionPanel = React.memo(
    ({ voucherSuggestions, order, handleApplySuggestedVoucher }) => {
      // Thêm kiểm tra rõ ràng để tránh render không cần thiết
      if (
        !voucherSuggestions ||
        !voucherSuggestions.show ||
        !Array.isArray(voucherSuggestions.betterVouchers) ||
        voucherSuggestions.betterVouchers.length === 0
      ) {
        return null;
      }

      // Component content remains mostly the same
      return (
        <div
          className="voucher-suggestions"
          style={{
            margin: "16px 0",
            padding: "16px",
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              {order.phieuGiamGia
                ? `${voucherSuggestions.betterVouchers.length} voucher tốt hơn voucher hiện tại`
                : `${voucherSuggestions.betterVouchers.length} voucher có thể áp dụng cho đơn hàng`}
            </Text>

            {voucherSuggestions.betterVouchers.map((voucher) => (
              <Card
                key={voucher.id}
                size="small"
                bordered={true}
                style={{
                  background: "#fff",
                  marginBottom: "12px",
                  borderLeft: "4px solid #52c41a",
                }}
                title={
                  <Space>
                    <TagOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ fontSize: "14px" }}>
                      {voucher.maPhieuGiamGia}
                    </Text>
                    <Tag color="green">Tốt hơn hiện tại</Tag>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    size="middle"
                    onClick={() =>
                      handleApplySuggestedVoucher(order.id, voucher.id)
                    }
                    disabled={!voucher.canApply}
                  >
                    {voucher.canApply ? "Áp dụng" : "Chưa đủ"}
                  </Button>
                }
              >
                <div style={{ padding: "0 4px" }}>
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      <div style={{ fontSize: "14px" }}>
                        <strong>{voucher.tenPhieuGiamGia}</strong>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div>
                        {Number(voucher.loaiPhieuGiamGia) === 1 ? (
                          <Tag color="blue">
                            Giảm {voucher.giaTriGiam}%
                            {voucher.soTienGiamToiDa > 0 &&
                              ` (tối đa ${formatCurrency(
                                voucher.soTienGiamToiDa
                              )})`}
                          </Tag>
                        ) : (
                          <Tag color="blue">
                            Giảm {formatCurrency(voucher.giaTriGiam)}
                          </Tag>
                        )}
                        <Tag color="orange">
                          Đơn tối thiểu:{" "}
                          {formatCurrency(voucher.giaTriToiThieu)}
                        </Tag>
                      </div>
                    </Col>

                    <Col span={24}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "13px",
                          color: "#52c41a",
                        }}
                      >
                        <Text type="success">
                          Tiết kiệm:{" "}
                          {formatCurrency(voucher.discountAmount || 0)}
                        </Text>
                        {voucher.additionalSavings > 0 && (
                          <Text type="success" strong>
                            <ArrowUpOutlined /> Thêm{" "}
                            {formatCurrency(voucher.additionalSavings)}
                          </Text>
                        )}
                      </div>
                    </Col>

                    {voucher.amountNeeded > 0 && (
                      <Col span={24}>
                        <Alert
                          message={`Mua thêm ${formatCurrency(
                            voucher.amountNeeded
                          )} để đủ điều kiện áp dụng`}
                          type="info"
                          showIcon
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                        />
                      </Col>
                    )}
                  </Row>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      );
    },
    // Tối ưu 2: Custom comparison function để tránh re-render không cần thiết
    (prevProps, nextProps) => {
      // Nếu cả hai đều không hiển thị, không cần re-render
      if (
        !prevProps.voucherSuggestions.show &&
        !nextProps.voucherSuggestions.show
      ) {
        return true; // props được coi là giống nhau, không cần render lại
      }

      // Nếu trạng thái hiển thị thay đổi, cần re-render
      if (
        prevProps.voucherSuggestions.show !== nextProps.voucherSuggestions.show
      ) {
        return false;
      }

      // So sánh ID của order
      if (prevProps.order?.id !== nextProps.order?.id) {
        return false;
      }

      // So sánh số lượng vouchers
      const prevLength =
        prevProps.voucherSuggestions?.betterVouchers?.length || 0;
      const nextLength =
        nextProps.voucherSuggestions?.betterVouchers?.length || 0;

      if (prevLength !== nextLength) {
        return false;
      }

      // So sánh ID của các vouchers để xác định xem có sự thay đổi không
      if (prevLength > 0 && nextLength > 0) {
        const prevIds = new Set(
          prevProps.voucherSuggestions.betterVouchers.map((v) => v.id)
        );
        const nextIds = new Set(
          nextProps.voucherSuggestions.betterVouchers.map((v) => v.id)
        );

        // Nếu có ít nhất một ID thay đổi, cần render lại
        if (prevIds.size !== nextIds.size) return false;

        for (const id of nextIds) {
          if (!prevIds.has(id)) return false;
        }
      }

      return true; // Không có thay đổi đáng kể, không cần render lại
    }
  );

  const showErrorMessage = (error) => {
    if (error.response && error.response.data) {
      // Nếu có thông báo cụ thể từ server
      const errorMessage = error.response.data.message || "Đã có lỗi xảy ra";
      message.error(errorMessage);
    } else {
      // Nếu không có thông tin chi tiết, hiển thị thông báo chung
      message.error("Đã có lỗi xảy ra: " + error.message);
    }
  };
  // Hàm hiển thị thông báo trợ giúp về thanh toán
  const showPaymentHelp = () => {
    Modal.info({
      title: "Hướng dẫn thanh toán",
      content: (
        <div>
          <p>
            <strong>Quy tắc thanh toán:</strong>
          </p>
          <ul>
            <li>
              <strong>Chỉ có thể kết hợp QR và Tiền mặt khi thanh toán</strong>
            </li>
            <li>
              Khi khách trả tiền mặt thừa, hệ thống sẽ tự động tính tiền thừa
            </li>
            <li>Khi có nhiều phương thức, số tiền sẽ được tự động phân bổ</li>
          </ul>
        </div>
      ),
      width: 500,
    });
  };

  const fetchLatestData = useCallback(async () => {
    try {
      if (!hoaDonId || loading) {
        return; // Không fetch nếu đang loading hoặc không có hoaDonId
      }

      // Dùng cờ hiệu để tránh nhiều cập nhật giao diện liên tiếp
      setLoading(true);

      // Chỉ fetch sản phẩm, không gọi các hàm khác
      await fetchInvoiceProducts(hoaDonId, true); // true = skipUIUpdate
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [hoaDonId, loading]);

  useEffect(() => {
    // Chỉ tạo polling interval khi có hoaDonId active
    if (hoaDonId) {
      console.log("Setting up polling interval for hoaDonId:", hoaDonId);

      // THAY ĐỔI: Tăng thời gian polling lên 15 giây để giảm tải server
      const interval = setInterval(fetchLatestData, 15000);
      setPollingInterval(interval);

      // Cleanup khi component unmount hoặc khi hoaDonId thay đổi
      return () => {
        console.log("Clearing polling interval for hoaDonId:", hoaDonId);
        if (interval) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      };
    }
  }, [hoaDonId]);

  // Update this method to handle additional recipient information
  const checkPriceChanges = async (showLoading = true) => {
    try {
      if (showLoading) {
        setCheckingPrice(true);
        setLoading(true);
      }

      if (!activeKey) {
        message.error("Không có đơn hàng được chọn");
        return false;
      }

      // Sử dụng endpoint chính xác: /api/admin/hoa-don/{id}/kiem-tra-gia
      const response = await api.get(
        `/api/admin/hoa-don/${activeKey}/kiem-tra-gia`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sửa lỗi: Kiểm tra cấu trúc dữ liệu trả về đúng như trong InvoiceDetail.jsx
      const hasPriceChanges =
        response.data &&
        response.data.hasPriceChanges === true &&
        response.data.changedItems &&
        response.data.changedItems.length > 0;

      // Lưu trạng thái có thay đổi giá để hiển thị cảnh báo
      setPriceNeedsConfirmation(hasPriceChanges);

      if (hasPriceChanges) {
        // Định dạng lại dữ liệu cho phù hợp với frontend
        const formattedItems = response.data.changedItems.map((item) => ({
          id: item.id,
          tenSanPham: item.tenSanPham || "Không có tên",
          giaTaiThoiDiemThem: item.giaCu || 0,
          giaHienTai: item.giaMoi || 0,
          soLuong: item.soLuong || 1,
          hinhAnh: item.anhUrl ? [item.anhUrl] : [],
          maSanPhamChiTiet: item.maSanPhamChiTiet || "",
          mauSac: item.mauSac || "---",
          maMauSac: item.maMauSac || "#FFFFFF",
          kichThuoc: item.kichThuoc || "---",
          chatLieu: item.chatLieu || "---",
          chenhLech: item.chenhLech || 0,
        }));

        setChangedProducts(formattedItems);

        // Tính tổng thay đổi giá
        const totalChange = formattedItems.reduce(
          (sum, item) => sum + item.chenhLech * item.soLuong,
          0
        );
        setPriceChangeAmount(totalChange);

        setOpenPriceChangeDialog(true);
        message.warning(`Có ${formattedItems.length} sản phẩm thay đổi giá`);
        await fetchInvoiceProducts(activeKey, false);
        return true;
      } else {
        setPriceNeedsConfirmation(false);
        if (showLoading) {
          message.success("Giá sản phẩm không có thay đổi");
        }
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra thay đổi giá:", error);
      if (showLoading) {
        message.error("Không thể kiểm tra thay đổi giá sản phẩm");
      }
      return false;
    } finally {
      if (showLoading) {
        setCheckingPrice(false);
        setLoading(false);
      }
    }
  };
  // 3. Hàm cập nhật giá một sản phẩm - sử dụng query param
  const handleUpdateProductPrice = async (hoaDonChiTietId, useCurrentPrice) => {
    try {
      setLoading(true);

      // Sử dụng endpoint chính xác: /api/admin/hoa-don/{id}/chi-tiet/{chiTietId}/gia
      await api.put(
        `/api/admin/hoa-don/${activeKey}/chi-tiet/${hoaDonChiTietId}/gia?useCurrentPrice=${useCurrentPrice}`,
        {}, // Body rỗng vì tham số truyền qua query param
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật danh sách sản phẩm đã thay đổi - loại bỏ sản phẩm đã xử lý
      const updatedChangedProducts = changedProducts.filter(
        (p) => p.id !== hoaDonChiTietId
      );
      setChangedProducts(updatedChangedProducts);

      // Nếu không còn sản phẩm nào thay đổi giá, đặt lại trạng thái
      if (updatedChangedProducts.length === 0) {
        setPriceNeedsConfirmation(false);
        setOpenPriceChangeDialog(false);

        // Đánh dấu là đã xác nhận thay đổi giá cho đơn hàng này
        setPriceChangesConfirmed((prev) => ({
          ...prev,
          [activeKey]: true,
        }));
      }

      // Tính toán lại tổng số tiền thay đổi
      const totalChange = updatedChangedProducts.reduce(
        (sum, item) => sum + item.chenhLech * item.soLuong,
        0
      );
      setPriceChangeAmount(totalChange);

      // Tải lại sản phẩm để cập nhật UI
      await fetchInvoiceProducts(activeKey);
      message.success(
        `Đã ${useCurrentPrice ? "áp dụng giá mới" : "giữ giá cũ"} cho sản phẩm`
      );

      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật giá sản phẩm:", error);
      message.error("Không thể cập nhật giá sản phẩm");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. Hàm cập nhật tất cả giá sản phẩm
  const handleUpdateAllPrices = async (useCurrentPrices = null) => {
    // Nếu không truyền tham số, sử dụng giá trị từ state
    const shouldUseCurrentPrices =
      useCurrentPrices !== null ? useCurrentPrices : updateAllPrices;

    try {
      setLoading(true);

      // Sử dụng endpoint chính xác: /api/admin/hoa-don/{id}/cap-nhat-gia
      await api.put(
        `/api/admin/hoa-don/${activeKey}/cap-nhat-gia`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { useCurrentPrices: shouldUseCurrentPrices },
        }
      );

      // Đặt lại trạng thái
      setPriceNeedsConfirmation(false);
      setChangedProducts([]);
      setOpenPriceChangeDialog(false);
      setPriceChangeAmount(0);

      setPriceChangesConfirmed((prev) => ({
        ...prev,
        [activeKey]: true,
      }));
      // Tải lại sản phẩm và tính toán lại tổng tiền
      await fetchInvoiceProducts(activeKey);

      // Hiển thị thông báo thành công
      message.success(
        shouldUseCurrentPrices
          ? "Đã cập nhật tất cả sản phẩm sang giá mới"
          : "Đã giữ nguyên giá ban đầu cho tất cả sản phẩm"
      );

      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật giá sản phẩm:", error);
      message.error("Không thể cập nhật giá sản phẩm");
      return false;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeKey) {
      // Kiểm tra thay đổi giá mà không hiển thị loading
      checkPriceChanges(false);
    }
  }, [activeKey]);
const calculateOrderTotals = (hoaDonId, productsOverride, orderOverride) => {
  // Sử dụng dữ liệu override nếu được cung cấp, nếu không thì lấy từ state
  const products = productsOverride || orderProducts[hoaDonId] || [];
  const order =
    orderOverride || tabs.find((tab) => tab.key === hoaDonId)?.order;

  if (!order) {
    console.warn("No order found for totals calculation");
    return {
      subtotal: 0,
      shippingFee: 0,
      totalBeforeVoucher: 0,
      discountAmount: 0,
      finalTotal: 0,
      voucherType: null,
      voucherValue: null,
    };
  }

  // Tính tổng tiền hàng
  const subtotal = calculateTotalBeforeDiscount(products);

  // Lấy phí vận chuyển - CHỈ ÁP DỤNG cho đơn GIAO HÀNG
  let shippingFee = order.loaiHoaDon === 3 ? (order.phiVanChuyen || 0) : 0;

  // Sử dụng giá trị giảm giá trực tiếp từ server (giamGia)
  let discountAmount = order.giamGia || 0;

  // Nếu không có giamGia từ server, tính toán dựa trên voucher
  if (!order.giamGia && order.phieuGiamGia) {
    const voucherType = Number(order.phieuGiamGia.loaiPhieuGiamGia);

    // Chỉ tính giảm giá dựa trên tổng tiền hàng, KHÔNG bao gồm phí vận chuyển
    discountAmount = calculateDiscountAmount(
      {
        ...order.phieuGiamGia,
        loaiPhieuGiamGia: voucherType,
      },
      subtotal
    );
  }

  // Giới hạn giảm giá không vượt quá tổng tiền hàng
  discountAmount = Math.min(discountAmount, subtotal);

  // Tính tổng tiền sau khi giảm giá
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Đánh dấu nếu đơn được giảm 100% tiền hàng
  const isFullyDiscounted = subtotal > 0 && subtotal === discountAmount;

  // QUAN TRỌNG: Chỉ miễn phí vận chuyển cho đơn ≥ 2 triệu sau giảm giá VÀ là đơn giao hàng
  if (subtotalAfterDiscount >= 2000000 && order.loaiHoaDon === 3) {
    shippingFee = 0;

    // Cập nhật phí vận chuyển trong API nếu cần
    if (order.phiVanChuyen > 0) {
      setTimeout(async () => {
        try {
          await axios.post(
            `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
            { fee: 0 },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log(
            "Đã áp dụng miễn phí vận chuyển (đơn sau giảm giá > 2 triệu)"
          );

          // Cập nhật order trong tabs với miễn phí vận chuyển
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === hoaDonId
                ? { ...tab, order: { ...tab.order, phiVanChuyen: 0 } }
                : tab
            )
          );
        } catch (error) {
          console.error("Lỗi khi cập nhật phí vận chuyển miễn phí:", error);
        }
      }, 0);
    }
  }

  // QUAN TRỌNG: Nếu là đơn tại quầy, đảm bảo phí vận chuyển = 0
  if (order.loaiHoaDon !== 3) {
    shippingFee = 0;
  }

  // Tính tổng cuối cùng - Cho đơn giao hàng hoặc tại quầy
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    subtotal,
    shippingFee, // Đã kiểm tra loại hóa đơn khi lấy phí vận chuyển
    totalBeforeVoucher: subtotal, // Không cộng phí vận chuyển ở đây
    discountAmount,
    finalTotal,
    subtotalAfterDiscount,
    voucherType: order.phieuGiamGia
      ? Number(order.phieuGiamGia.loaiPhieuGiamGia)
      : null,
    voucherValue: order.phieuGiamGia ? order.phieuGiamGia.giaTriGiam : null,
    freeShipping: subtotalAfterDiscount >= 2000000 && order.loaiHoaDon === 3,
    isFullyDiscounted, // Đánh dấu đơn hàng được giảm 100%
  };
};

  // Update calculateTotalBeforeDiscount to handle undefined/null cases
  const calculateTotalBeforeDiscount = (products) => {
    if (!products || !Array.isArray(products)) {
      return 0;
    }
    return products.reduce((sum, product) => {
      const price = product.gia || 0;
      const quantity = product.soLuong || 0;
      return sum + price * quantity;
    }, 0);
  };

  // Thêm vào component BanHang
  const giaoHangRef = useRef(null);
  useEffect(() => {
    if (!selectedAddress || selectedLoaiHoaDon !== 3) return;

    const checkShippingCalculationStatus = () => {
      if (giaoHangRef.current) {
        const isCalculating = giaoHangRef.current.calculatingFee;
        const currentShippingFee = giaoHangRef.current.shippingFee;

        setCalculatingShippingFee((prev) =>
          prev !== isCalculating ? isCalculating : prev
        );

        if (activeKey && currentShippingFee > 0) {
          setTabs((prevTabs) =>
            prevTabs.map((tab) => {
              if (
                tab.key === activeKey &&
                tab.order.phiVanChuyen !== currentShippingFee
              ) {
                return {
                  ...tab,
                  order: { ...tab.order, phiVanChuyen: currentShippingFee },
                };
              }
              return tab;
            })
          );

          setTotals((prevTotals) => {
            const currentTotal = prevTotals[activeKey] || {};
            if (currentTotal.shippingFee !== currentShippingFee) {
              return {
                ...prevTotals,
                [activeKey]: {
                  ...currentTotal,
                  shippingFee: currentShippingFee,
                  finalTotal:
                    (currentTotal.subtotal || 0) -
                    (currentTotal.discountAmount || 0) +
                    currentShippingFee,
                },
              };
            }
            return prevTotals;
          });
        }
      }
    };

    const intervalId = setInterval(checkShippingCalculationStatus, 5000); //  tăng thời gian

    return () => clearInterval(intervalId);
  }, [selectedAddress, selectedLoaiHoaDon, activeKey]);

  // Update generateQR function to set qrUrl as well
  const generateQR = (hoaDonId, amount) => {
    const account = "102876619993"; // Số tài khoản nhận
    const bank = "VietinBank"; // Ngân hàng (Vietinbank)

    // Lấy mã hóa đơn từ đối tượng order của tab hiện tại
    const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
    const maHoaDon = currentOrder?.maHoaDon || hoaDonId;

    // Thay đổi nội dung thanh toán theo yêu cầu
    const description = `SEVQR thanh toan ${maHoaDon}`; // Nội dung thanh toán mới
    const template = "compact"; // Kiểu hiển thị QR

    // Tạo URL QR Code
    const qrLink = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amount}&des=${encodeURIComponent(
      description
    )}&template=${template}&download=false`;

    setQrCode(qrLink); // Lưu mã QR vào state
    setQrUrl(qrLink); // Cũng lưu vào qrUrl để hiển thị trong modal
  };

  // Thêm state mới để kiểm soát việc hiển thị gợi ý
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Thêm state mới
  const [voucherSuggestion, setVoucherSuggestion] = useState({
    show: false,
    voucher: null,
    amountNeeded: 0,
    products: [],
  });
  // Cập nhật state để lưu nhiều gợi ý voucher
  const [voucherSuggestions, setVoucherSuggestions] = useState({
    show: false,
    betterVouchers: [],
  });

  // Update calculateChange function to handle both payment methods properly
  const calculateChange = (hoaDonId) => {
    const orderTotals = totals[hoaDonId];
    if (!orderTotals) return { change: 0, remaining: 0 };

    const finalTotal = orderTotals.finalTotal || 0;

    // Lấy thông tin order để xem có các phương thức thanh toán
    const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
    if (!order || !order.thanhToans) return { change: 0, remaining: 0 };

    // Tính tổng số tiền đã nhập qua tất cả phương thức thanh toán
    const totalPaid = order.thanhToans.reduce(
      (sum, payment) => sum + (payment.soTien || 0),
      0
    );

    if (totalPaid >= finalTotal) {
      return {
        change: totalPaid - finalTotal,
        remaining: 0,
      };
    } else {
      return {
        change: 0,
        remaining: finalTotal - totalPaid,
      };
    }
  };
  // Địa chỉ
  const handleAddressSelect = async (address) => {
    if (!activeKey) {
      message.warning("Không tìm thấy hóa đơn để cập nhật địa chỉ.");
      return;
    }

    // Get current tab data
    const currentTab = tabs.find((tab) => tab.key === activeKey);
    if (!currentTab) return;

    // Check if this is an anonymous customer - handle differently
    const isAnonymousCustomer = !currentTab.order.khachHang;

    // Create a customer-type specific key for this invoice
    const customerTypeSuffix = isAnonymousCustomer ? "_anon" : "_reg";
    const addressKey = `selected_address_${activeKey}${customerTypeSuffix}`;
    const previousAddressJson = localStorage.getItem(addressKey);

    // Generate a clean representation of the address for comparison
    const currentAddressJson = JSON.stringify({
      id: address.id,
      diaChiCuThe: address.diaChiCuThe,
      xa: address.xa,
      huyen: address.huyen,
      tinh: address.tinh,
      tenNguoiNhan: address.tenNguoiNhan,
      soDienThoai: address.soDienThoai,
      customerType: isAnonymousCustomer ? "anonymous" : "registered",
    });

    // If address hasn't changed, don't update
    if (previousAddressJson === currentAddressJson) {
      console.log("Địa chỉ không thay đổi, bỏ qua cập nhật");
      return;
    }

    // Store the selected address for this invoice with customer type
    localStorage.setItem(addressKey, currentAddressJson);

    // Update local state for display
    setSelectedAddress(address);

    try {
      setLoading(true);

      // Create payload with appropriate recipient information
      const payload = {
        diaChiId: address.id || null,
        diaChiCuThe: address.diaChiCuThe || "",
        xa: address.xa,
        huyen: address.huyen,
        tinh: address.tinh,
        tenNguoiNhan: address.tenNguoiNhan || "",
        soDienThoai: address.soDienThoai || "",
        isAnonymous: isAnonymousCustomer, // Include customer type in payload
        customerId: currentTab.order.khachHang?.id || null, // Include customerId in payload
      };

      console.log(
        `[BanHang] Sending address update for invoice ${activeKey}:`,
        payload
      );

      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${activeKey}/update-address`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (giaoHangRef.current && giaoHangRef.current.calculateShippingFee) {
        try {
          console.log(
            "Tự động tính lại phí vận chuyển cho địa chỉ mới:",
            address
          );
          const fee = await giaoHangRef.current.calculateShippingFee(address);
          console.log("Phí vận chuyển mới tính được:", fee);

          if (typeof fee === "number" && !isNaN(fee)) {
            // Kiểm tra áp dụng miễn phí ship cho đơn >= 2 triệu
            const currentTotals = totals[activeKey] || {};
            const subtotalAfterDiscount =
              currentTotals.subtotalAfterDiscount || 0;

            if (subtotalAfterDiscount >= 2000000) {
              console.log(
                "Đơn hàng đạt điều kiện miễn phí vận chuyển (>= 2 triệu)"
              );
              handleShippingFeeUpdate(0);
            } else {
              handleShippingFeeUpdate(fee);
            }
          }
        } catch (shippingError) {
          console.error("Lỗi khi tính phí vận chuyển tự động:", shippingError);
        } finally {
          setCalculatingShippingFee(false);
        }
      }
      // Refresh invoice data
      await fetchInvoiceById(activeKey);
    } catch (error) {
      console.error(
        `[BanHang] Error updating address for invoice ${activeKey}:`,
        error
      );

      if (error.response && error.response.data) {
        message.error(
          error.response.data.message || "Lỗi khi cập nhật địa chỉ"
        );
      } else {
        message.error("Không thể kết nối đến server để cập nhật địa chỉ");
      }

      // Reset selectedAddress on error
      setSelectedAddress(null);
      // Remove stored address on error
      localStorage.removeItem(addressKey);
    } finally {
      setLoading(false);
    }
  };
  const cleanupTabData = (oldTabKey) => {
    if (!oldTabKey) return;
    
    console.log(`[BanHang] Cleaning up data for tab: ${oldTabKey}`);
    
    // Xóa cache địa chỉ và phí vận chuyển cho tab cũ
    const addressKeysToRemove = [
      `invoice_address_${oldTabKey}_anon`,
      `invoice_address_${oldTabKey}_reg`,
      `selected_address_${oldTabKey}`,
      `selected_address_${oldTabKey}_anon`,
      `selected_address_${oldTabKey}_reg`,
      `submitted_address_${oldTabKey}_anon`,
      `submitted_address_${oldTabKey}_reg`,
      `last_applied_address_${oldTabKey}`,
      `shipping_fee_${oldTabKey}`,
    ];
    
    // Xóa tất cả các key liên quan
    addressKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Xóa các key khác có chứa oldTabKey trong localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(oldTabKey)) {
        console.log(`[BanHang] Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    }
  
    // Xóa các key khác có chứa oldTabKey trong sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes(oldTabKey)) {
        console.log(`[BanHang] Removing sessionStorage key: ${key}`);
        sessionStorage.removeItem(key);
      }
    }
    
    // Reset phí vận chuyển trong state
    setTabs((prev) => {
      return prev.map(tab => {
        if (tab.key === oldTabKey) {
          const isAnonymous = !tab.order?.khachHang || tab.order?.khachHang === "Khách hàng lẻ";
          
          // Nếu là khách hàng lẻ, reset phí vận chuyển về 0
          if (isAnonymous) {
            return {
              ...tab,
              order: {
                ...tab.order,
                phiVanChuyen: 0 // Reset phí vận chuyển
              }
            };
          }
        }
        return tab;
      });
    });
    
    // Reset GiaoHang component nếu có
    if (giaoHangRef.current && giaoHangRef.current.resetAddressState) {
      const currentTab = tabs.find(tab => tab.key === oldTabKey);
      if (currentTab) {
        const isAnonymous = !currentTab.khachHang || currentTab.khachHang === "Khách hàng lẻ";
        giaoHangRef.current.resetAddressState(isAnonymous);
      }
    }
  };
const resetAddressAndShippingFee = async (hoaDonId) => {
  if (!hoaDonId) {
    console.error("resetAddressAndShippingFee: Thiếu hoaDonId");
    return false;
  }
  
  try {
    console.log(`Đang reset địa chỉ và phí vận chuyển cho hóa đơn ${hoaDonId}`);
    
    // Gọi API reset địa chỉ
    await axios.put(`http://localhost:8080/api/admin/ban-hang/${hoaDonId}/reset-address`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    // Reset phí vận chuyển trên UI
    const updatedTotals = { ...totals };
    if (updatedTotals[hoaDonId]) {
      updatedTotals[hoaDonId].shippingFee = 0;
      updatedTotals[hoaDonId].finalTotal = updatedTotals[hoaDonId].subtotalAfterDiscount || 0;
      setTotals(updatedTotals);
    }
    
    // Cập nhật state tabs
    const updatedTabs = tabs.map(tab => {
      if (tab.key === hoaDonId) {
        return {
          ...tab,
          order: {
            ...tab.order,
            phiVanChuyen: 0
          }
        };
      }
      return tab;
    });
    setTabs(updatedTabs);
    
    // Reset component GiaoHang nếu có
    if (giaoHangRef.current && giaoHangRef.current.resetAddressState) {
      const currentTab = tabs.find(tab => tab.key === hoaDonId);
      const isAnonymous = currentTab && (!currentTab.khachHang || currentTab.khachHang === "Khách hàng lẻ");
      giaoHangRef.current.resetAddressState(isAnonymous);
    }
    
    console.log(`Đã reset thành công địa chỉ và phí vận chuyển cho hóa đơn ${hoaDonId}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi reset địa chỉ và phí vận chuyển cho hóa đơn ${hoaDonId}:`, error);
    return false;
  }
};
  const resetGiaoHangComponent = (currentTab) => {
    if (!currentTab || !currentTab.id) {
      console.log("Không thể reset component GiaoHang: thiếu thông tin tab");
      return;
    }
    
    // Kiểm tra giaoHangRef đã được khởi tạo chưa
    if (!giaoHangRef.current || !giaoHangRef.current.resetAddressState) {
      console.log("Không thể reset component GiaoHang: ref không tồn tại");
      return;
    }
    
    // Lấy thông tin khách hàng
    const isAnonymous = !currentTab.khachHang || currentTab.khachHang === "Khách hàng lẻ";
    
    // Kiểm tra loại hóa đơn
    if (currentTab.loaiHoaDon !== 3) {
      // Nếu là đơn tại quầy, reset toàn bộ thông tin
      giaoHangRef.current.resetAddressState(isAnonymous);
      
      // Reset địa chỉ và phí vận chuyển
      if (currentTab.id) {
        try {
          // Reset địa chỉ ở server
          axios.put(`http://localhost:8080/api/admin/ban-hang/${currentTab.id}/reset-address`, {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          // Reset phí vận chuyển về 0
          axios.post(
            `http://localhost:8080/api/admin/hoa-don/${currentTab.id}/cap-nhat-phi-van-chuyen`,
            { fee: 0 },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          // Cập nhật state tabs
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === currentTab.id
                ? { ...tab, order: { ...tab.order, phiVanChuyen: 0 } }
                : tab
            )
          );
          
          // Cập nhật totals 
          setTotals((prev) => {
            if (!prev[currentTab.id]) return prev;
            
            const currentTotal = prev[currentTab.id];
            return {
              ...prev,
              [currentTab.id]: {
                ...currentTotal,
                shippingFee: 0,
                finalTotal: currentTotal.subtotalAfterDiscount || 0
              }
            };
          });
          
          console.log(`Đã reset địa chỉ và phí vận chuyển trên server cho hóa đơn ${currentTab.id}`);
        } catch (error) {
          console.error("Lỗi khi reset thông tin giao hàng:", error);
        }
      }
    } else {
      // Nếu là đơn giao hàng, reset theo loại khách hàng
      const contactInfo = {
        recipientName: currentTab.tenNguoiNhan || "",
        phoneNumber: currentTab.soDienThoai || "",
      };
      
      // QUAN TRỌNG: Nếu khách hàng lẻ, reset phí vận chuyển
      if (isAnonymous) {
        console.log("Reset phí vận chuyển cho khách hàng lẻ");
        try {
          // Reset phí vận chuyển về 0
          axios.post(
            `http://localhost:8080/api/admin/hoa-don/${currentTab.id}/cap-nhat-phi-van-chuyen`,
            { fee: 0 },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          // Cập nhật state tabs
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === currentTab.id
                ? { ...tab, order: { ...tab.order, phiVanChuyen: 0 } }
                : tab
            )
          );
          
          // Cập nhật totals
          setTotals((prev) => {
            if (!prev[currentTab.id]) return prev;
            
            const currentTotal = prev[currentTab.id];
            return {
              ...prev,
              [currentTab.id]: {
                ...currentTotal,
                shippingFee: 0,
                finalTotal: currentTotal.subtotalAfterDiscount || 0
              }
            };
          });
        } catch (error) {
          console.error("Lỗi khi reset phí vận chuyển:", error);
        }
      }
      
      // Reset với thông tin tương ứng
      giaoHangRef.current.resetAddressState(isAnonymous, contactInfo);
      
      // Sau đó tải thông tin địa chỉ từ hóa đơn nếu có
      if (currentTab.id) {
        giaoHangRef.current.loadAddressFromInvoice(
          currentTab.id, 
          isAnonymous,
          contactInfo.recipientName,
          contactInfo.phoneNumber
        );
      }
    }
    
    setSelectedAddress(null);
    console.log(`Đã reset component GiaoHang cho ${isAnonymous ? 'khách lẻ' : 'khách hàng có tài khoản'}`);
  };

  const handleTabChange = async (newActiveKey) => {
    try {
      // Đánh dấu đang chuyển tab để ngăn các hoạt động khác
      setLoading(true);
      
      console.log(`Đang chuyển từ tab ${activeKey} sang tab ${newActiveKey}`);
      
      // Lưu tab cũ để cleanup và kiểm tra loại hóa đơn
      const oldTabKey = activeKey;
      const oldTab = tabs.find(tab => tab.key === oldTabKey);
      
      // Lấy thông tin về tab mới sắp chuyển đến
      const newTab = tabs.find(tab => tab.key === newActiveKey);
      
      // Tắt các cờ tính toán phí vận chuyển
      setCalculatingShippingFee(false);
      
      // 1. QUAN TRỌNG: Reset hoàn toàn data cũ trước khi chuyển tab
      if (oldTabKey) {
        try {
          // Dừng mọi tính toán phí vận chuyển đang chạy
          if (giaoHangRef.current) {
            console.log(`Resetting shipping fee for tab ${oldTabKey}`);
            
            // QUAN TRỌNG: Chỉ reset phí vận chuyển về 0 cho khách hàng lẻ
            const oldTabIsAnonymousDelivery = oldTab && oldTab.order && 
              oldTab.order.loaiHoaDon === 3 && 
              (!oldTab.order.khachHang || oldTab.order.khachHang === "Khách hàng lẻ");
            
            if (oldTabIsAnonymousDelivery) {
              // Reset hoàn toàn địa chỉ và phí vận chuyển trên server CHỈ cho khách lẻ
              await axios.put(`http://localhost:8080/api/admin/ban-hang/${oldTabKey}/reset-address`, {}, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              
              // Reset phí vận chuyển về 0 CHỈ cho khách lẻ
              await axios.post(
                `http://localhost:8080/api/admin/hoa-don/${oldTabKey}/cap-nhat-phi-van-chuyen`,
                { fee: 0 },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
            }
          }
        } catch (resetError) {
          console.error("Lỗi khi reset dữ liệu tab cũ:", resetError);
        }
      }
      
      // 2. Cleanup cache và storage cho tab cũ
      cleanupTabData(oldTabKey);
      
      // 3. Cập nhật active tab mới
      setActiveKey(newActiveKey);
      setHoaDonId(newActiveKey);
      
      // 4. QUAN TRỌNG: Xóa các trạng thái của tab cũ
      setSelectedAddress(null);
      setSelectedCustomer(null);
      setCustomerPayment({});
      
      // 5. Tải dữ liệu cơ bản của tab mới (sản phẩm, thông tin hóa đơn)
      await fetchInvoiceProducts(newActiveKey);
      const invoiceData = await fetchInvoiceById(newActiveKey);
      
      // 6. QUAN TRỌNG: Luôn sử dụng loại hóa đơn từ server, không tự thay đổi
      if (invoiceData) {
        // Luôn dùng loại hóa đơn từ server
        setSelectedLoaiHoaDon(invoiceData.loaiHoaDon || 2); // Nếu không có thì mặc định là "Tại quầy" (2)
      } else if (newTab && newTab.order) {
        setSelectedLoaiHoaDon(newTab.order.loaiHoaDon || 2);
      } else {
        // Nếu không lấy được từ đâu, mặc định là "Tại quầy"
        setSelectedLoaiHoaDon(2);
      }
      
      // 7. QUAN TRỌNG: Chỉ tải thông tin địa chỉ nếu đúng là đơn giao hàng
      if (invoiceData && invoiceData.loaiHoaDon === 3) {
        // Đánh dấu để không tự động tính phí vận chuyển ngay
        const isAnonymous = !invoiceData.khachHang || invoiceData.khachHang === "Khách hàng lẻ";
        
        console.log(`[BanHang] Đơn giao hàng: Đang tải địa chỉ cho hóa đơn ${newActiveKey}, khách hàng: ${isAnonymous ? 'khách lẻ' : 'đã đăng ký'}`,
          "tenNguoiNhan:", invoiceData.tenNguoiNhan,
          "soDienThoai:", invoiceData.soDienThoai);
        
        // Tải thông tin địa chỉ giao hàng từ server
        setTimeout(() => {
          if (giaoHangRef.current) {
            giaoHangRef.current.loadAddressFromInvoice(
              newActiveKey,
              isAnonymous,
              invoiceData.tenNguoiNhan || "",
              invoiceData.soDienThoai || "",
              true // force refresh
            );
          }
        }, 800);
      } else {
        // Quan trọng: nếu là đơn tại quầy, đảm bảo reset component GiaoHang
        if (giaoHangRef.current) {
          console.log(`[BanHang] Đơn tại quầy: Reset component GiaoHang`);
          giaoHangRef.current.resetAddressState();
        }
      }
      
      console.log(`Đã chuyển sang tab hóa đơn mới: ${newActiveKey}, loại: ${selectedLoaiHoaDon === 3 ? 'Giao hàng' : 'Tại quầy'}`);
    } catch (error) {
      console.error("Lỗi khi chuyển tab:", error);
      message.error("Có lỗi xảy ra khi chuyển tab");
    } finally {
      // Luôn tắt trạng thái loading
      setLoading(false);
    }
  };
  useEffect(() => { 
    return () => {
      // Cleanup function khi component unmount
      console.log("BanHang component unmounting - cleaning up");
      
      // Xóa tất cả các key liên quan đến phí vận chuyển và địa chỉ
      const tabsToCleanup = tabs.map(tab => tab.key);
      
      tabsToCleanup.forEach(tabKey => {
        // Xóa cache địa chỉ và phí vận chuyển cho tab
        const addressKeysToRemove = [
          `invoice_address_${tabKey}_anon`,
          `invoice_address_${tabKey}_reg`,
          `selected_address_${tabKey}`,
          `selected_address_${tabKey}_anon`,
          `selected_address_${tabKey}_reg`,
          `submitted_address_${tabKey}_anon`,
          `submitted_address_${tabKey}_reg`,
          `last_applied_address_${tabKey}`,
          `shipping_fee_${tabKey}`,
        ];
        
        addressKeysToRemove.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // Reset phí vận chuyển trên server nếu là khách hàng lẻ
        const currentTab = tabs.find(tab => tab.key === tabKey);
        if (currentTab && (!currentTab.khachHang || currentTab.khachHang === "Khách hàng lẻ")) {
          try {
            axios.post(
              `http://localhost:8080/api/admin/hoa-don/${tabKey}/cap-nhat-phi-van-chuyen`,
              { fee: 0 },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          } catch (error) {
            console.error(`Lỗi khi reset phí vận chuyển cho tab ${tabKey}:`, error);
          }
        }
      });
    };
  }, [tabs]);
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      //render: (_, __, index) => index + 1,
      render: (_, __, index) => {
        // Tính toán lại index khi chuyển trang
        return pagination.pageSize * (pagination.current - 1) + index + 1;
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 180,
      render: (hinhAnh) => {
        return (
          <div style={{ width: 150, height: 120, overflow: "hidden" }}>
            {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
              <Carousel autoplay dots={false} effect="fade">
                {hinhAnh.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Sản phẩm ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 5,
                      display: "block",
                    }}
                  />
                ))}
              </Carousel>
            ) : (
              <img
                src="https://via.placeholder.com/50"
                alt="Không có ảnh"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 5,
                  display: "block",
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Thông tin",
      key: "thongTin",
      align: "center",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.tenSanPham}</Typography.Text>
          <Typography.Text type="secondary">
            Mã: {record.maSanPhamChiTiet}
          </Typography.Text>
          <Typography.Text type="secondary">
            Chất liệu: {record.chatLieu}
          </Typography.Text>
          <Typography.Text type="secondary">
            Kiểu tay áo: {record.kieuTayAo}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Màu sắc",
      key: "mauSac",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Typography.Text>{record.mauSac}</Typography.Text>
          <div
            style={{
              display: "inline-block",
              width: 50, // Chiều rộng
              height: 20, // Chiều cao
              borderRadius: 6, // Bo góc mềm mại
              backgroundColor: record.maMauSac || "#FFFFFF",
              border: "1px solid rgba(0, 0, 0, 0.2)", // Viền tinh tế
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Hiệu ứng bóng đổ nhẹ
            }}
          ></div>
        </Space>
      ),
    },

    {
      title: "Kích thước",
      key: "kichThuoc",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Typography.Text>{record.kichThuoc}</Typography.Text>
      ),
    },

    {
      title: "Đơn giá",
      key: "gia",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div>
          {record.giaThayDoi ? (
            <>
              <Text delete type="secondary">
                {formatCurrency(record.giaTaiThoiDiemThem || 0)}
              </Text>
              <br />
              <Text type="danger" strong>
                {formatCurrency(record.giaHienTai || 0)}
                <Tooltip title="Giá đã thay đổi so với khi thêm vào đơn hàng">
                  <Tag
                    color={record.chenhLech > 0 ? "red" : "green"}
                    style={{ marginLeft: 4 }}
                  >
                    {record.chenhLech > 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(record.chenhLech))}
                  </Tag>
                </Tooltip>
              </Text>
            </>
          ) : (
            formatCurrency(record.gia || 0)
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "soLuong",
      width: 100,
      align: "center",
      render: (_, record) => {
        // Nếu sản phẩm có thay đổi giá, giới hạn số lượng tối đa là số lượng hiện tại
        const maxValue = record.giaThayDoi
          ? record.soLuong
          : record.soLuongTonKho;

        return (
          <div>
            <InputNumber
              min={1}
              max={maxValue}
              value={record.soLuong}
              onChange={(value) =>
                handleUpdateQuantity(activeKey, record.id, value)
              }
              style={{ width: 80 }}
            />
            {record.giaThayDoi && (
              <div style={{ marginTop: 4 }}>
                <Tag color="orange" style={{ fontSize: "11px" }}>
                  Chỉ được giảm số lượng
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "thanhTien",
      width: 140,
      align: "center",
      render: (_, record) => formatCurrency(record.gia * record.soLuong),
    },
    {
      title: "Hành động",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(activeKey, record.id)}
        />
      ),
    },
  ];

  // 1. Load pending orders
  const fetchPendingOrders = async (isInitializing = false) => {
    try {
      const response = await api.get("/api/admin/ban-hang/hoadontaiquay", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orders = response.data;

      if (orders.length > 0) {
        const newTabs = orders.map((order, index) => ({
          key: order.id,
          title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
          order: order,
        }));

        setTabs(newTabs);

        if (!activeKey || isInitializing) {
          setActiveKey(orders[0].id);
        }

        // Tải sản phẩm và tính toán tổng tiền cho mỗi hóa đơn
        const productsMap = {};
        const totalsMap = {};

        for (const order of orders) {
          try {
            // Tải sản phẩm
            const products = await fetchInvoiceProducts(order.id, true);
            productsMap[order.id] = products;

            // Sử dụng hàm calculateOrderTotals để tính toán chính xác
            const orderTotals = calculateOrderTotals(order.id, products, order);
            totalsMap[order.id] = orderTotals;
          } catch (error) {
            console.error(
              `Lỗi khi tải dữ liệu cho hóa đơn ${order.id}:`,
              error
            );
          }
        }

        // Cập nhật state
        setOrderProducts(productsMap);
        setTotals(totalsMap);

        // Cập nhật UI cho tab hiện tại
        if (activeKey && totalsMap[activeKey]) {
          setTotalBeforeDiscount(totalsMap[activeKey].subtotal);
          setTotalAmount(totalsMap[activeKey].finalTotal);
        }

        // Lưu vào localStorage
        localStorage.setItem("pendingOrders", JSON.stringify(newTabs));
        localStorage.setItem("orderProducts", JSON.stringify(productsMap));
        localStorage.setItem("orderTotals", JSON.stringify(totalsMap));

        return orders;
      } else {
        // Nếu không có đơn hàng, xóa dữ liệu cũ
        setTabs([]);
        setOrderProducts({});
        setTotals({});
        setActiveKey(null);
        setTotalBeforeDiscount(0);
        setTotalAmount(0);
        localStorage.removeItem("pendingOrders");
        localStorage.removeItem("orderProducts");
        localStorage.removeItem("orderTotals");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hóa đơn:", error);
      message.error("Lỗi khi tải danh sách hóa đơn");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchProducts();
        const orders = await fetchPendingOrders(true); // 🔥 nhận danh sách đơn hàng

        if (Array.isArray(orders) && orders.length > 0) {
          const firstOrderId = orders[0].id;
          setActiveKey(firstOrderId); // 🔥 set Active tab
          await fetchInvoiceById(firstOrderId); // 🔥 fetch đúng hóa đơn theo id đầu tiên

          // Nếu muốn tính lại tổng tiền:
          const newTotals = calculateOrderTotals(firstOrderId);
          setTotals((prev) => ({
            ...prev,
            [firstOrderId]: newTotals,
          }));

          setTotalBeforeDiscount(newTotals.subtotal);
          setTotalAmount(newTotals.finalTotal);
        } else {
          console.warn("Không có đơn hàng nào được trả về từ API.");
        }

        await fetchPaymentMethods();
        await loadCustomers();
      } catch (error) {
        console.error("Lỗi khi khởi tạo dữ liệu:", error);
        message.error("Không thể tải dữ liệu ban đầu");
      }
    };
    initializeData();
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    if (tabs.length === 0) {
      // Nếu không còn tab nào, reset các state liên quan đến giá
      setPriceNeedsConfirmation(false);
      setChangedProducts([]);
      setPriceChangeAmount(0);
      setOpenPriceChangeDialog(false);
      setPriceChangesConfirmed({});
    }
  }, [tabs]);
  // Cập nhật useEffect xử lý khi activeKey thay đổi
  useEffect(() => {
    if (activeKey) {
      // Store the previous hoaDonId to clean up
      const previousHoaDonId = hoaDonId;

      // Clean up any lingering data from previous tab
      cleanupTabData(previousHoaDonId);

      // Set current hoaDonId
      setHoaDonId(activeKey);

      // Fetch the current tab's data
      fetchInvoiceById(activeKey).then((invoiceData) => {
        // After loading invoice data, load products
        fetchInvoiceProducts(activeKey);

        // Get current tab data to reset GiaoHang component
        const currentTab = tabs.find((tab) => tab.key === activeKey);

        // Update selected customer if available
        if (invoiceData?.khachHang) {
          setSelectedCustomer(invoiceData.khachHang);
        }

        if (currentTab) {
          resetGiaoHangComponent(currentTab);
        }
      });
    }
  }, [activeKey]);
  // Update or add this function at the appropriate place
  const loadAddressDataForActiveTab = async () => {
    if (!activeKey) return;

    // Get the current tab's order details
    const currentTab = tabs.find((tab) => tab.key === activeKey);
    if (!currentTab) return;

    const order = currentTab.order;

    // Only load address for delivery orders
    if (order.loaiHoaDon !== 3) {
      setSelectedAddress(null);
      return;
    }

    // Try to load address from GiaoHang component
    try {
      if (giaoHangRef.current) {
        // Set a loading indicator if needed
        setCalculatingShippingFee(true);

        // Try to load address from invoice
        const success = await giaoHangRef.current.loadAddressFromInvoice(
          activeKey
        );

        // If address was loaded successfully, try to calculate shipping fee
        if (success && order.loaiHoaDon === 3) {
          // Calculate shipping fee if needed
          await giaoHangRef.current.calculateShippingFee();
        }
      }
    } catch (error) {
      console.error("Error loading address data:", error);
    } finally {
      setCalculatingShippingFee(false);
    }
  };

  // Update the existing useEffect for activeKey
  useEffect(() => {
    if (activeKey) {
      // Store the previous hoaDonId to clean up
      const previousHoaDonId = hoaDonId;

      // Clean up any lingering data from previous tab
      cleanupTabData(previousHoaDonId);

      // Set current hoaDonId
      setHoaDonId(activeKey);

      // Fetch the current tab's data
      fetchInvoiceById(activeKey).then(() => {
        // After loading invoice data, load products
        fetchInvoiceProducts(activeKey);

        // Load address data if this is a delivery order
        loadAddressDataForActiveTab();
      });
    }
  }, [activeKey]);
  // 2. Create new order
  const addTab = async () => {
    try {
      const pendingOrdersCount = tabs.filter(
        (tab) => tab.order.trangThai === 1
      ).length;
      if (pendingOrdersCount >= 10) {
        message.error("Bạn chỉ có thể tạo tối đa 10 đơn hàng chờ xác nhận");
        return;
      }

      setLoading(true);
      const response = await api.post(
        "/api/admin/ban-hang/create",
        {
          emailNhanVien: "vnv@gmail.com",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset state khi tạo tab mới
      setPriceNeedsConfirmation(false);
      setChangedProducts([]);
      setPriceChangeAmount(0);

      const newOrder = response.data;
      const newOrderKey = newOrder.id;

      // Reset selectedAddress và selectedCustomer khi tạo đơn hàng mới
      setSelectedAddress(null);
      setSelectedCustomer(null);

      // Đánh dấu đây là đơn hàng mới trong sessionStorage
      sessionStorage.setItem(`new_order_${newOrderKey}`, "true");

      // Đặt hoaDonId mới để component GiaoHang biết đơn hàng đã thay đổi
      setHoaDonId(newOrderKey);

      setTabs((prev) => [
        ...prev,
        {
          key: newOrderKey,
          title: `Đơn hàng ${prev.length + 1} - ${newOrder.maHoaDon}`,
          order: newOrder,
        },
      ]);

      setOrderProducts((prev) => ({
        ...prev,
        [newOrderKey]: [],
      }));

      setActiveKey(newOrderKey);
      message.success("Tạo đơn hàng mới thành công");

      if (socket.current) {
        socket.current.subscribe(`/topic/hoa-don/${newOrderKey}`, (message) => {
          fetchInvoiceProducts(newOrderKey).then((products) => {
            setOrderProducts((prev) => ({
              ...prev,
              [newOrderKey]: products,
            }));
          });
        });
      }
    } catch (error) {
      message.error("Lỗi khi tạo đơn hàng mới");
    } finally {
      setLoading(false);
    }
  };
  const ProductImage = ({ sanPhamChiTietId }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
      const fetchProductImage = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/admin/sanphamchitiet/${sanPhamChiTietId}/hinhanh`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Lấy URL của ảnh đầu tiên nếu có
          if (response.data && response.data.length > 0) {
            setImage(response.data[0].anhUrl);
          }
          setLoading(false);
        } catch (error) {
          console.error("Lỗi khi lấy ảnh sản phẩm:", error);
          setLoading(false);
        }
      };

      if (sanPhamChiTietId) {
        fetchProductImage();
      }
    }, [sanPhamChiTietId, token]);

    if (loading) {
      return <Spin size="small" />;
    }

    return image ? (
      <img
        src={image}
        alt={`Ảnh sản phẩm`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/140x140?text=No+Image";
        }}
      />
    ) : (
      <AppstoreOutlined style={{ fontSize: 28, color: "#bfbfbf" }} />
    );
  };
  const handleAddProductToOrder = async (product, quantity = 1) => {
    if (!activeKey) {
      message.warning("Vui lòng tạo hoặc chọn hóa đơn trước!");
      return;
    }

    try {
      const addToastId = message.loading("Đang thêm sản phẩm...");

      // Sử dụng quantity được truyền vào thay vì mặc định là 1
      const request = {
        sanPhamChiTietId: product.id,
        soLuong: quantity,
      };

      const response = await axios.post(
        `http://localhost:8080/api/admin/ban-hang/${activeKey}/add-product?delayApplyVoucher=false`, // Tham số mới, không trì hoãn áp dụng voucher
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Cập nhật tồn kho trong cache
        updateProductInventoryInCache(product.id, quantity);

        // Lấy lại danh sách sản phẩm sau khi thêm
        const updatedProducts = await fetchInvoiceProducts(activeKey);

        message.destroy(addToastId);
        message.success(
          `Đã thêm ${quantity} sản phẩm ${product.tenSanPham} vào đơn hàng`
        );

        // Tải lại thông tin đơn hàng từ server
        await fetchInvoiceById(activeKey);

        // Cập nhật giao diện hiển thị gợi ý voucher
        await findBestVoucherAndSuggest(activeKey);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddMultipleProducts = async (products) => {
    if (!products || products.length === 0) {
      message.error("Không có sản phẩm nào được chọn");
      return;
    }

    if (!activeKey) {
      message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
      return;
    }

    try {
      const addToastId = message.loading("Đang thêm sản phẩm...");

      // Chuẩn bị dữ liệu với số lượng tùy chỉnh cho từng sản phẩm
      const productList = products.map((product) => ({
        sanPhamChiTietId: product.id,
        soLuong: product.soLuongThem || 1,
      }));

      // Gọi API để thêm nhiều sản phẩm cùng lúc
      await api.post(
        `/api/admin/hoa-don/${activeKey}/san-pham`,
        {
          productList: productList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật cache tồn kho cho tất cả sản phẩm với số lượng tương ứng
      products.forEach((product) => {
        updateProductInventoryInCache(product.id, product.soLuongThem || 1);
      });

      // Làm mới danh sách sản phẩm và thông tin hóa đơn
      await fetchInvoiceProducts(activeKey);
      await fetchInvoiceById(activeKey);

      // Tự động áp dụng voucher tốt nhất sau khi thêm sản phẩm
      setTimeout(() => {
        autoApplyBestVoucher(activeKey);
      }, 300);

      message.destroy(addToastId);

      // Tính tổng số lượng sản phẩm đã thêm
      const totalQuantityAdded = productList.reduce(
        (sum, item) => sum + item.soLuong,
        0
      );
      message.success(
        `Đã thêm ${totalQuantityAdded} sản phẩm (${products.length} mặt hàng) vào đơn hàng`
      );

      setOpenProductTable(false);

      // Đặt lại pagination
      setPagination({ current: 1, pageSize: 3 });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      showErrorMessage(error);

      // Tải lại dữ liệu từ server
      await fetchInvoiceProducts(activeKey);
    }
  };
  // 4. Update product quantity
  const handleUpdateQuantity = async (
    hoaDonId,
    hoaDonChiTietId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return message.error("Số lượng phải lớn hơn 0");
    }

    // Tìm sản phẩm hiện tại trong danh sách sản phẩm của đơn hàng
    const currentProduct = orderProducts[hoaDonId]?.find(
      (product) => product.id === hoaDonChiTietId
    );

    if (!currentProduct) {
      return message.error("Không tìm thấy thông tin sản phẩm");
    }

    const currentQuantity = currentProduct.soLuong || 0;

    // Kiểm tra nếu sản phẩm có thay đổi giá VÀ số lượng mới lớn hơn số lượng hiện tại
    if (currentProduct.giaThayDoi === true && newQuantity > currentQuantity) {
      message.warning(
        "Không thể tăng số lượng sản phẩm đã thay đổi giá. Chỉ có thể giảm số lượng hoặc xóa sản phẩm."
      );
      return;
    }

    try {
      setOrderProducts((prev) => ({
        ...prev,
        [hoaDonId]: prev[hoaDonId].map((product) =>
          product.id === hoaDonChiTietId
            ? { ...product, soLuong: newQuantity }
            : product
        ),
      }));

      const updatedProducts = orderProducts[hoaDonId].map((product) =>
        product.id === hoaDonChiTietId
          ? { ...product, soLuong: newQuantity }
          : product
      );

      const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
      setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));

      await api.put(
        `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}/so-luong`,
        { soLuong: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      await autoApplyBestVoucher(hoaDonId);
      await fetchLatestData();
      await findBestVoucherAndSuggest(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      showErrorMessage(error);
      await fetchInvoiceProducts(hoaDonId);
    }
  };

  // 5. Remove product
  const handleRemoveProduct = async (hoaDonId, hoaDonChiTietId) => {
    try {
      setLoading(true);

      // Lấy danh sách sản phẩm hiện tại trước khi xóa
      const currentProducts = [...(orderProducts[hoaDonId] || [])];
      const productToRemove = currentProducts.find(
        (p) => p.id === hoaDonChiTietId
      );
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;

      await api.delete(
        `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state immediately
      const updatedProducts = currentProducts.filter(
        (p) => p.id !== hoaDonChiTietId
      );
      setOrderProducts((prev) => ({
        ...prev,
        [hoaDonId]: updatedProducts,
      }));

      // Calculate new subtotal after product removal
      const subtotal = calculateTotalBeforeDiscount(updatedProducts);

      // Kiểm tra đặc biệt: Nếu đây là sản phẩm cuối cùng bị xóa
      if (updatedProducts.length === 0) {
        // Nếu có voucher đang áp dụng, xóa nó
        if (order?.phieuGiamGia) {
          await handleRemoveVoucher(hoaDonId, false);
        }

        // Cập nhật UI ngay lập tức
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId
              ? {
                  ...tab,
                  order: {
                    ...tab.order,
                    phieuGiamGia: null,
                    giamGia: 0,
                  },
                }
              : tab
          )
        );

        // Ẩn gợi ý voucher khi không còn sản phẩm
        setVoucherSuggestions({ show: false, betterVouchers: [] });
      }
      // Nếu vẫn còn sản phẩm, kiểm tra voucher hiện tại có còn hợp lệ không
      else if (
        order?.phieuGiamGia &&
        subtotal < order.phieuGiamGia.giaTriToiThieu
      ) {
        message.warning(
          `Sau khi xóa sản phẩm, giá trị đơn hàng (${formatCurrency(
            subtotal
          )}) không đủ áp dụng voucher ${
            order.phieuGiamGia.maPhieuGiamGia
          } (tối thiểu ${formatCurrency(order.phieuGiamGia.giaTriToiThieu)})`,
          3
        );

        // Remove the voucher
        await handleRemoveVoucher(hoaDonId, false);

        // Update UI
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId
              ? {
                  ...tab,
                  order: {
                    ...tab.order,
                    phieuGiamGia: null,
                    giamGia: 0,
                  },
                }
              : tab
          )
        );
      }
      // If no voucher is applied, check if a new one can be applied
      else if (!order?.phieuGiamGia && subtotal > 0) {
        // Automatically find and apply the best voucher
        setTimeout(async () => {
          try {
            // Get available vouchers
            const customerId = order?.khachHang?.id || "";
            const vouchersResponse = await api.get(
              `/api/admin/phieu-giam-gia/available?orderTotal=${subtotal}&customerId=${customerId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const availableVouchers = vouchersResponse.data || [];
            const eligibleVouchers = availableVouchers.filter(
              (v) => subtotal >= v.giaTriToiThieu
            );

            // If there are eligible vouchers, apply the best one
            if (eligibleVouchers.length > 0) {
              await autoApplyBestVoucher(hoaDonId);
            }
          } catch (error) {
            console.error(
              "Lỗi khi tìm voucher tự động sau khi xóa sản phẩm:",
              error
            );
          }
        }, 500);
      }

      // Update totals
      const updatedOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const newTotals = calculateOrderTotals(
        hoaDonId,
        updatedProducts,
        updatedOrder
      );
      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));

      // Hiện thị gợi ý voucher nếu có (chỉ khi vẫn còn sản phẩm)
      setTimeout(() => {
        if (updatedProducts.length > 0) {
          findBestVoucherAndSuggest(hoaDonId);
        }
      }, 300);

      message.success("Xóa sản phẩm thành công");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      message.error("Lỗi khi xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // 6. Apply voucher
  const handleVoucherSelected = async (hoaDonId, voucherId) => {
    try {
      setLoading(true);

      // Calculate current subtotal before applying voucher
      const currentProducts = orderProducts[hoaDonId] || [];
      const currentSubtotal = calculateTotalBeforeDiscount(currentProducts);

      // Get voucher details to check minimum requirement
      const selectedVoucher = vouchers.find((v) => v.id === voucherId);

      if (selectedVoucher && currentSubtotal < selectedVoucher.giaTriToiThieu) {
        message.error(
          `Giá trị đơn hàng (${formatCurrency(
            currentSubtotal
          )}) không đủ áp dụng voucher này (tối thiểu ${formatCurrency(
            selectedVoucher.giaTriToiThieu
          )})`
        );
        return;
      }

      const response = await api.post(
        `/api/admin/ban-hang/${hoaDonId}/voucher`,
        { voucherId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update local state with new data
        const updatedOrder = response.data;

        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
          )
        );

        setSelectedVoucher(null);
        message.success("Áp dụng mã giảm giá thành công");

        // Recalculate totals with the applied voucher
        updateAllTotals(orderProducts[hoaDonId], updatedOrder);
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      const errorMsg =
        error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 7. Remove voucher
  const handleRemoveVoucher = async (hoaDonId, showNotification = true) => {
    try {
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const currentProducts = orderProducts[hoaDonId] || [];

      // Tính toán lại tổng tiền ngay lập tức
      const subtotal = calculateTotalBeforeDiscount(currentProducts);
      const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);
      const finalTotal = totalWithShipping; // Không còn mã giảm giá

      // Cập nhật UI ngay lập tức
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  tongTien: totalWithShipping,
                  giamGia: 0,
                  tongThanhToan: finalTotal,
                  phieuGiamGia: null, // Xóa voucher khỏi state
                },
              }
            : tab
        )
      );

      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: {
          subtotal,
          shippingFee: currentOrder?.phiVanChuyen || 0,
          totalBeforeVoucher: totalWithShipping,
          discountAmount: 0,
          finalTotal,
        },
      }));

      //Gọi API để xóa voucher trên server
      await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`, {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });

      message.success("Đã xóa voucher");
      await fetchInvoiceProducts(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
      if (showNotification) {
        message.error("Không thể xóa voucher: " + error.message);
      }
    }
  };

  const fetchAvailableVouchers = async () => {
    try {
      // Get the current order to extract customer information
      const currentOrder = tabs.find((tab) => tab.key === activeKey)?.order;
      const customerId = currentOrder?.khachHang?.id || ""; // Default to empty string if no customer

      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}&customerId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      setVouchers(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách voucher");
    }
  };

  // Replace loadVouchers function with fetchAvailableVouchers
  const loadVouchers = async (hoaDonId) => {
    try {
      await fetchAvailableVouchers();
    } catch (error) {
      message.error("Lỗi khi tải danh sách voucher");
    }
  };

  // 9. Confirm order
  const handleConfirmOrder = async (hoaDonId) => {
    try {
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const currentProducts = orderProducts[hoaDonId] || [];

      // Kiểm tra có sản phẩm trong đơn hàng hay không
      if (!currentProducts || currentProducts.length === 0) {
        message.error(
          "Vui lòng thêm sản phẩm vào đơn hàng trước khi xác nhận!"
        );
        return;
      }

      // Kiểm tra thay đổi giá (nếu có)
      if (!priceChangesConfirmed[hoaDonId]) {
        const hasPriceChanges = await checkPriceChanges(false);
        if (hasPriceChanges) {
          message.warning(
            "Có sản phẩm thay đổi giá, vui lòng xác nhận thay đổi giá trước khi thanh toán!"
          );
          setOpenPriceChangeDialog(true);
          return;
        }
      }
      const totalNeeded = totals[hoaDonId]?.finalTotal || 0;
      const isDeliveryOrderWithShipping =
        currentOrder.loaiHoaDon === 3 &&
        (currentOrder.phiVanChuyen > 0 || totals[hoaDonId]?.shippingFee > 0);

      if (totalNeeded === 0 && currentOrder.loaiHoaDon !== 3) {
        Modal.confirm({
          title: "Xác nhận đơn hàng miễn phí",
          content: (
            <div>
              <p>Đơn hàng này được miễn phí hoàn toàn! (Giảm giá 100%)</p>
              <p>
                Mã đơn: <strong>{currentOrder.maHoaDon}</strong>
              </p>
              <p>
                Số lượng sản phẩm: <strong>{currentProducts.length}</strong>
              </p>
              <p>
                <strong style={{ color: "#52c41a" }}>
                  Tổng thanh toán: 0đ
                </strong>
              </p>
              <p>
                Hình thức: <strong>Tại quầy</strong>
              </p>
              {currentOrder.khachHang && (
                <p>
                  Khách hàng:{" "}
                  <strong>{currentOrder.khachHang.tenKhachHang}</strong>
                </p>
              )}
            </div>
          ),
          okText: "Xác nhận đơn miễn phí",
          cancelText: "Hủy",
          okButtonProps: {
            style: { background: "#52c41a", borderColor: "#52c41a" },
          },
          onOk: async () => {
            // Gửi API hoàn tất đơn hàng với thanh toán = 0
            await api.post(
              `/api/admin/ban-hang/${hoaDonId}/complete`,
              {
                thanhToans: [
                  {
                    id: `${hoaDonId}_FREE`,
                    maPhuongThucThanhToan: PAYMENT_METHOD.CASH,
                    soTien: 0,
                  },
                ],
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            message.success("Đơn hàng miễn phí đã được xác nhận");
            await completeOrderProcess(hoaDonId);
          },
        });
        return;
      }
      // Kiểm tra phương thức thanh toán
      if (
        !currentOrder ||
        !currentOrder.thanhToans ||
        currentOrder.thanhToans.length === 0
      ) {
        message.error(
          "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
        );
        return;
      }

      // Lọc danh sách thanh toán chỉ lấy những phương thức có số tiền > 0
      const validPayments = currentOrder.thanhToans.filter(
        (p) => p && p.soTien > 0
      );

      if (validPayments.length === 0) {
        message.error("Vui lòng nhập số tiền thanh toán!");
        return;
      }

      const hasCod = validPayments.some(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.COD
      );

      // Nếu có COD và có phương thức khác, hiển thị thông báo lỗi
      if (hasCod && validPayments.length > 1) {
        message.error("COD phải được thanh toán độc lập");
        return;
      }
      // Kiểm tra số lượng phương thức thanh toán và loại phương thức
      if (validPayments.length > 2) {
        message.error("Chỉ có thể sử dụng tối đa 2 phương thức thanh toán!");
        return;
      }

      // Nếu có 2 phương thức, đảm bảo chỉ là CASH và QR
      if (validPayments.length === 2) {
        const methods = validPayments.map((p) => p.maPhuongThucThanhToan);
        const hasCash = methods.includes(PAYMENT_METHOD.CASH);
        const hasQR = methods.includes(PAYMENT_METHOD.QR);

        if (!(hasCash && hasQR)) {
          message.error("Chỉ có thể kết hợp QR và Tiền mặt khi thanh toán!");
          return;
        }
      }

      // Kiểm tra địa chỉ giao hàng nếu là đơn giao hàng
      if (currentOrder.loaiHoaDon === 3) {
        try {
          const addressDetailsResponse = await axios.get(
            `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const addressDetails = addressDetailsResponse.data;
          if (
            !addressDetails ||
            !addressDetails.tinh ||
            !addressDetails.huyen ||
            !addressDetails.xa
          ) {
            message.error(
              "Vui lòng nhập đầy đủ địa chỉ giao hàng trước khi tiếp tục."
            );
            return;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra địa chỉ hóa đơn:", error);
          message.error("Vui lòng nhập địa chỉ giao hàng trước khi tiếp tục.");
          return;
        }
      }

      // Kiểm tra tổng số tiền thanh toán có khớp không

      const { remaining } = calculateChange(hoaDonId);

      // Nếu còn thiếu tiền, thông báo lỗi
      if (remaining > 0) {
        message.error(
          `Số tiền thanh toán chưa đủ. Còn thiếu ${formatCurrency(remaining)}`
        );
        return;
      }

      const cashPayment = validPayments.find(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
      );

      const transferPayment = validPayments.find(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
      );

      // Bước 1: Xử lý thanh toán QR trước (nếu có)
      let qrPaymentSuccess = true;
      if (transferPayment && transferPayment.soTien > 0) {
        // Tạo mã QR với số tiền cần chuyển khoản
        generateQR(hoaDonId, transferPayment.soTien);

        try {
          // Chờ người dùng quét mã và thanh toán
          const loadingMsg = message.loading(
            "Vui lòng quét mã QR và hoàn tất thanh toán",
            0
          );

          // Tạo một biến để lưu hàm cancel bên ngoài promise
          let cancelPaymentCheck = null;

          // Tạo một Promise có thể cancel
          const paymentPromise = new Promise(async (resolve, reject) => {
            let isPaid = false;
            let attempts = 0;
            const maxAttempts = 60; // Chờ tối đa 60 giây

            // Lưu trữ function để có thể cancel check payment loop
            cancelPaymentCheck = () => {
              reject(new Error("Payment cancelled"));
            };

            while (!isPaid && attempts < maxAttempts) {
              isPaid = await checkPayment(hoaDonId, transferPayment.soTien);
              if (isPaid) {
                resolve(true);
                break;
              }
              await new Promise((r) => setTimeout(r, 2000));
              attempts++;
            }

            if (!isPaid) {
              reject(new Error("Payment timeout"));
            }
          });

          // Hiển thị QR code trong modal
          setIsModalVisiblePaymentQR(true);

          // Bổ sung xử lý hủy thanh toán cho modal
          const handleQrModalCancel = () => {
            if (cancelPaymentCheck) cancelPaymentCheck();
            setIsModalVisiblePaymentQR(false);
            loadingMsg(); // Hủy thông báo loading
          };

          setModalHandlers({
            onCancel: handleQrModalCancel,
            onOk: () => {
              setIsModalVisiblePaymentQR(false);
              loadingMsg();
            },
          });

          await paymentPromise;

          loadingMsg();
          setIsModalVisiblePaymentQR(false);
          message.success("Đã nhận được thanh toán chuyển khoản!");
        } catch (error) {
          setIsModalVisiblePaymentQR(false);
          message.error(
            "Chưa nhận được thanh toán chuyển khoản, vui lòng thử lại!"
          );
          qrPaymentSuccess = false;
          return;
        }
      }

      // Bước 2: Nếu thanh toán QR thành công (hoặc không có QR), hiển thị hộp thoại xác nhận
      if (qrPaymentSuccess) {
        Modal.confirm({
          title: "Xác nhận đơn hàng",
          content: (
            <div>
              <p>Bạn có chắc chắn muốn xác nhận đơn hàng này?</p>
              <p>
                Mã đơn: <strong>{currentOrder.maHoaDon}</strong>
              </p>
              <p>
                Số lượng sản phẩm: <strong>{currentProducts.length}</strong>
              </p>
              <p>
                Tổng tiền thanh toán:{" "}
                <strong style={{ color: "#ff4d4f" }}>
                  {formatCurrency(totalNeeded)}
                </strong>
              </p>
              <p>
                Hình thức:{" "}
                <strong>
                  {currentOrder.loaiHoaDon === 3 ? "Giao hàng" : "Tại quầy"}
                </strong>
              </p>
              {currentOrder.khachHang && (
                <p>
                  Khách hàng:{" "}
                  <strong>{currentOrder.khachHang.tenKhachHang}</strong>
                </p>
              )}
            </div>
          ),
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            // Điều chỉnh số tiền thanh toán trước khi gửi API
            const adjustedPayments = validPayments.map((p, index) => {
              let adjustedAmount = p.soTien;

              // Nếu là phương thức thanh toán cuối và tổng thanh toán vượt quá
              if (index === validPayments.length - 1) {
                const previousTotal = validPayments
                  .slice(0, -1)
                  .reduce((sum, payment) => sum + payment.soTien, 0);

                // Điều chỉnh số tiền của phương thức cuối để tổng bằng đúng giá trị đơn hàng
                if (previousTotal < totalNeeded) {
                  adjustedAmount = totalNeeded - previousTotal;
                } else if (previousTotal >= totalNeeded) {
                  adjustedAmount = 0;
                }
              }
              // Nếu không phải phương thức cuối, giữ nguyên số tiền nhưng không vượt quá tổng cần thanh toán
              else {
                adjustedAmount = Math.min(p.soTien, totalNeeded);
              }

              return {
                id: p.id || `${hoaDonId}_${p.maPhuongThucThanhToan}`,
                maPhuongThucThanhToan: p.maPhuongThucThanhToan,
                soTien: adjustedAmount,
              };
            });

            // Gửi API hoàn tất thanh toán với số tiền đã điều chỉnh
            await api.post(
              `/api/admin/ban-hang/${hoaDonId}/complete`,
              {
                thanhToans: adjustedPayments,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // Xử lý tiền thừa nếu có
            const { change } = calculateChange(hoaDonId);
            if (change > 0) {
              message.success(`Tiền thừa: ${formatCurrency(change)}`);
            }

            await completeOrderProcess(hoaDonId);
          },
        });
      }

      // Fetch dữ liệu mới sau khi xác nhận
      await fetchLatestData();
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      message.error("Không thể xác nhận đơn hàng: " + error.message);
    }
  };

  // Helper function for order completion process
  const completeOrderProcess = async (hoaDonId) => {
    try {
      // Đặt lại các state liên quan đến kiểm tra giá
      setPriceNeedsConfirmation(false);
      setChangedProducts([]);
      setPriceChangeAmount(0);
      setOpenPriceChangeDialog(false);

      setPriceChangesConfirmed((prev) => {
        const newState = { ...prev };
        delete newState[hoaDonId]; // Xóa trạng thái xác nhận của hóa đơn đã thanh toán
        return newState;
      });

      // Lấy hóa đơn PDF để in
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, application/json",
        },
      });

      if (!response || !response.data) {
        message.error("Không nhận được dữ liệu từ máy chủ!");
        return;
      }

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("application/pdf")) {
        message.error("Dữ liệu trả về không hợp lệ!");
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      setPdfUrl(url);
      setPreviewOpen(true);

      // Đóng tab đơn hàng sau khi hoàn tất
      setTabs((prev) => prev.filter((tab) => tab.key !== hoaDonId));
      message.success("Xác nhận đơn hàng thành công");
    } catch (error) {
      console.error("Lỗi khi hoàn tất thanh toán:", error);
      message.error("Có lỗi xảy ra khi in hóa đơn");
    }
  };

  const handleDirectPrint = () => {
    const iframe = document.getElementById("pdf-preview");
    iframe.contentWindow.print();
  };

  // Tối ưu 3: Sử dụng useRef để lưu trữ và so sánh kết quả API
  const lastSuggestionsRef = useRef({});
  const suggestionTimerRef = useRef(null);

  // Tối ưu 4: Thay đổi hàm findBestVoucherAndSuggest sử dụng debounce
  // Tạo hàm debounced bên ngoài component render
  const debouncedFindBestVoucher = useCallback(
    debounce(
      async (hoaDonId, token, orderProducts, tabs, setVoucherSuggestions) => {
        try {
          // Kiểm tra xem có đơn hàng và sản phẩm không
          const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
          const currentProducts = orderProducts[hoaDonId] || [];

          if (!order || currentProducts.length === 0) {
            setVoucherSuggestions({ show: false, betterVouchers: [] });
            return;
          }

          // Cache key dựa trên hoaDonId và hash của dữ liệu sản phẩm
          const productsHash = JSON.stringify(
            currentProducts.map((p) => ({
              id: p.id,
              soLuong: p.soLuong,
              gia: p.gia,
            }))
          );
          const cacheKey = `${hoaDonId}_${
            order.phieuGiamGia?.id || "none"
          }_${productsHash}`;

          // Kiểm tra cache
          if (lastSuggestionsRef.current[cacheKey]) {
            // Nếu đã có kết quả trước đó và chưa đổi, sử dụng kết quả đó
            setVoucherSuggestions(lastSuggestionsRef.current[cacheKey]);
            return;
          }

          // Không hiển thị gợi ý trong khi đang tải API
          // setVoucherSuggestions({ show: false, betterVouchers: [] });

          // Gọi API backend để lấy voucher tốt hơn
          const response = await api.get(
            `/api/admin/phieu-giam-gia/better-vouchers?hoaDonId=${hoaDonId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data;

          if (data.betterVouchers && data.betterVouchers.length > 0) {
            const enhancedVouchers = data.betterVouchers.map((voucher) => ({
              id: voucher.id,
              maPhieuGiamGia: voucher.maPhieuGiamGia,
              tenPhieuGiamGia: voucher.tenPhieuGiamGia,
              loaiPhieuGiamGia: voucher.loaiPhieuGiamGia,
              giaTriGiam: voucher.giaTriGiam,
              giaTriToiThieu: voucher.giaTriToiThieu,
              soTienGiamToiDa: voucher.soTienGiamToiDa,
              amountNeeded: voucher.amountNeeded,
              discountAmount: voucher.discountAmount,
              additionalSavings: voucher.additionalSavings,
              canApply: voucher.canApply,
              isBetterThanCurrent: voucher.isBetter,
            }));

            const suggestionData = {
              show: enhancedVouchers.length > 0,
              betterVouchers: enhancedVouchers,
            };

            // Lưu kết quả vào cache
            lastSuggestionsRef.current[cacheKey] = suggestionData;

            // Cập nhật state
            setVoucherSuggestions(suggestionData);
          } else {
            // Nếu không có vouchers tốt hơn, ẩn panel
            const emptyData = { show: false, betterVouchers: [] };
            lastSuggestionsRef.current[cacheKey] = emptyData;
            setVoucherSuggestions(emptyData);
          }
        } catch (error) {
          console.error("Lỗi khi tìm voucher tốt hơn:", error);
          setVoucherSuggestions({ show: false, betterVouchers: [] });
        }
      },
      800
    ), // Debounce 800ms
    [
      /* dependencies */
    ]
  );

  // Tối ưu 5: Thay thế hàm findBestVoucherAndSuggest cũ
  const findBestVoucherAndSuggest = (hoaDonId) => {
    // Hủy timer trước đó nếu có
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

    // Gọi phiên bản debounced
    debouncedFindBestVoucher(
      hoaDonId,
      token,
      orderProducts,
      tabs,
      setVoucherSuggestions
    );
  };
  // Thêm hàm mới để cập nhật tồn kho trong cache
  const updateProductInventoryInCache = (productId, quantityChange = -1) => {
    try {
      // Cập nhật trong cache sản phẩm toàn cục
      const allStoreProductsStr = sessionStorage.getItem("all_store_products");
      if (allStoreProductsStr) {
        const allStoreProducts = JSON.parse(allStoreProductsStr);
        const updatedProducts = allStoreProducts.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              soLuong: Math.max(0, p.soLuong + quantityChange),
            };
          }
          return p;
        });
        sessionStorage.setItem(
          "all_store_products",
          JSON.stringify(updatedProducts)
        );
      }

      // Cập nhật trong cache voucher suggestion
      setVoucherSuggestions((prev) => {
        if (!prev.betterVouchers) return prev;

        return {
          ...prev,
          betterVouchers: prev.betterVouchers.map((voucher) => {
            if (!voucher.suggestions?.newProducts) return voucher;

            return {
              ...voucher,
              suggestions: {
                ...voucher.suggestions,
                newProducts: voucher.suggestions.newProducts.map((p) => {
                  if (p.id === productId) {
                    return {
                      ...p,
                      soLuong: Math.max(0, p.soLuong + quantityChange),
                    };
                  }
                  return p;
                }),
              },
            };
          }),
        };
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật tồn kho trong cache:", error);
    }
  };
  // Hàm xử lý khi người dùng áp dụng voucher được gợi ý
  const handleApplySuggestedVoucher = async (hoaDonId, voucherId) => {
    try {
      console.log("Áp dụng voucher gợi ý:", { hoaDonId, voucherId });

      // Gọi API để áp dụng voucher
      const response = await api.post(
        `/api/admin/hoa-don/${hoaDonId}/voucher`,
        { voucherId: voucherId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        message.success("Áp dụng voucher thành công");

        // Tải lại thông tin hóa đơn từ server
        await fetchInvoiceById(hoaDonId);

        // Tính toán lại tổng tiền
        const newTotals = calculateOrderTotals(hoaDonId);
        setTotals((prev) => ({
          ...prev,
          [hoaDonId]: newTotals,
        }));

        // Cập nhật UI nếu đang ở tab này
        if (hoaDonId === activeKey) {
          setTotalBeforeDiscount(newTotals.subtotal);
          setTotalAmount(newTotals.finalTotal);
        }

        // Sau khi áp dụng voucher thành công, tìm kiếm lại voucher tốt hơn
        setTimeout(async () => {
          await findBestVoucherAndSuggest(hoaDonId);
        }, 300);

        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher gợi ý:", error);
      message.error("Lỗi khi áp dụng voucher");
      return false;
    }
  };

  useEffect(() => {
    setSelectedAddress(null); // Reset địa chỉ khi đổi khách hàng
  }, [selectedCustomer]);

  // Gợi ý mua thêm tiền để áp dụng mã giảm giá tốt hơn
  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      //Tính tổng tiền trước khi cập nhật vào `totals`
      const newTotals = calculateOrderTotals(activeKey);
      setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
      setTotalAmount(newTotals.finalTotal);
    }
  }, [orderProducts, activeKey]);

  useEffect(() => {
    // Dùng biến để kiểm soát debounce
    const debounceTimer = setTimeout(() => {
      if (
        activeKey &&
        totals[activeKey] &&
        totals[activeKey].totalBeforeVoucher > 0
      ) {
        findBestVoucherAndSuggest(activeKey);
      }
    }, 500); // Tăng thời gian debounce lên 500ms

    // Cleanup function
    return () => clearTimeout(debounceTimer);
  }, [totals, activeKey]);

  // Update handleShippingFeeUpdate to apply free shipping rule
  const handleShippingFeeUpdate = (fee) => {
    if (activeKey) {
      console.log(`Cập nhật phí vận chuyển ${fee} cho tab ${activeKey}`);

      // Check if order qualifies for free shipping
      const subtotal = totals[activeKey]?.subtotal || 0;
      const order = tabs.find((tab) => tab.key === activeKey)?.order;

      // Apply free shipping for orders >= 2 million and delivery orders
      if (subtotal >= 2000000 && order?.loaiHoaDon === 3) {
        fee = 0;
      }

      // Cập nhật state ngay lập tức cho UX tốt hơn
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === activeKey
            ? { ...tab, order: { ...tab.order, phiVanChuyen: fee } }
            : tab
        )
      );

      // Cập nhật totals để hiển thị đúng tổng tiền
      setTotals((prev) => {
        const currentTotal = prev[activeKey] || {};
        return {
          ...prev,
          [activeKey]: {
            ...currentTotal,
            shippingFee: fee,
            finalTotal:
              (currentTotal.subtotal || 0) -
              (currentTotal.discountAmount || 0) +
              fee,
            freeShipping: subtotal >= 2000000 && order?.loaiHoaDon === 3,
          },
        };
      });
    }
  };
  const renderOrderContent = (order) => (
    <Row gutter={16}>
      <Col
        span={17}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          maxHeight: "calc(100vh - 180px)",
          overflowY: "auto",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => openQrScanner(order.id)}>
              <BiQrScan />
              Quét mã QR
            </Button>
            <Button
              onClick={() => checkPriceChanges(true)}
              icon={<SyncOutlined />}
              danger={priceNeedsConfirmation}
              loading={checkingPrice}
              style={{ marginRight: 8, marginLeft: 8 }}
            >
              {priceNeedsConfirmation
                ? "Xác nhận thay đổi giá!"
                : "Kiểm tra thay đổi giá"}
            </Button>
            <Button
              type="primary"
              onClick={() => setOpenProductTable(true)}
              style={{ marginLeft: 8 }}
            >
              <IoIosAddCircle />
              Thêm sản phẩm
            </Button>
          </div>
          <Table
            dataSource={
              Array.isArray(orderProducts[order.id])
                ? orderProducts[order.id]
                : []
            }
            columns={columns}
            pagination={{
              current: pagination.current,
              pageSize: 4,
              showSizeChanger: false,
              total: Array.isArray(orderProducts[order.id])
                ? orderProducts[order.id].length
                : 0,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              size: "small",
              position: ["bottomCenter"],
              onChange: (page) => {
                setPagination({ current: page, pageSize: 4 });
              },
            }}
            rowKey="id"
            bordered
            size="small"
            style={{
              marginTop: "10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            scroll={{ y: "calc(100vh - 350px)" }}
          />
        </Space>
      </Col>
      <Col span={7}>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Thông tin khách hàng</Text>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {/* Phần chọn khách hàng - đưa lên trước Radio.Group */}
              <Row>
                <Col span={10}>
                  <Text>Khách hàng</Text>
                </Col>
                <Col span={14}>
                  <Row style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() => handleSelectCustomer(order.id)}
                    >
                      <AiOutlineSelect />
                      Chọn
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleAddNewCustomer()}
                    >
                      <IoIosAddCircle />
                      Thêm mới
                    </Button>
                  </Row>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col
                  span={24}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Avatar
                    size={40}
                    style={{
                      marginRight: 8,
                      backgroundColor: order.khachHang ? "#1890ff" : "#d9d9d9",
                      color: "#ffffff",
                      fontSize: 18,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {order.khachHang?.tenKhachHang ? (
                      order.khachHang.tenKhachHang.charAt(0).toUpperCase()
                    ) : (
                      <UserOutlined />
                    )}
                  </Avatar>
                  <div>
                    <Text strong>
                      {order.khachHang?.tenKhachHang || "Khách lẻ"}
                    </Text>
                    {order.khachHang?.soDienThoai && (
                      <div>
                        <Text type="secondary">
                          <PhoneOutlined style={{ marginRight: 4 }} />
                          {order.khachHang.soDienThoai}
                        </Text>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              <div
                style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
              ></div>

              {/* Phần chọn loại hóa đơn */}
              <Row>
                <Col span={24}>
                  <Radio.Group
                    value={order.loaiHoaDon === 3 ? "giaoHang" : "taiQuay"}
                    onChange={(e) =>
                      handleDeliveryMethodChange(order.id, e.target.value)
                    }
                  >
                    <Radio value="taiQuay">Tại quầy</Radio>
                    <Radio value="giaoHang">Giao hàng</Radio>
                  </Radio.Group>
                </Col>
              </Row>

              {/* Chỉ hiển thị GiaoHang khi chọn "Giao hàng"*/}
              {order.loaiHoaDon === 3 && (
                <>
                  <Alert
                    message="Miễn phí vận chuyển khi tổng tiền hàng sau khi trừ giảm giá từ 2 triệu đồng"
                    type="info"
                    showIcon
                    style={{
                      marginTop: 8,
                      padding: "4px 8px",
                      fontSize: "12px",
                    }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <GiaoHang
                      ref={giaoHangRef}
                      customerId={order.khachHang?.id}
                      hoaDonId={activeKey}
                      onAddressSelect={handleAddressSelect}
                      onShippingFeeUpdate={handleShippingFeeUpdate}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Phần Voucher giảm giá */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong>Voucher giảm giá:</Text>
              <div>
                {order.phieuGiamGia ? (
                  <Tag
                    closable
                    onClose={() => handleRemoveVoucher(order.id)}
                    color="black"
                  >
                    {order.phieuGiamGia.maPhieuGiamGia}
                  </Tag>
                ) : (
                  <Space>
                    <Button
                      type="default"
                      icon={<TagOutlined />}
                      onClick={() => {
                        loadVouchers(order.id);
                        setOpenVoucherDialog(true);
                      }}
                    >
                      Chọn mã
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => autoApplyBestVoucher(order.id)}
                    >
                      Áp dụng tốt nhất
                    </Button>
                  </Space>
                )}
              </div>
            </div>
            {/* Phần hiển thị gợi ý voucher - Di chuyển lên dưới phần voucher */}
            <VoucherSuggestionPanel
              voucherSuggestions={voucherSuggestions}
              order={order}
              handleApplySuggestedVoucher={handleApplySuggestedVoucher}
            />

            <Text strong>Thông tin thanh toán</Text>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                background: "#f9f9f9",
              }}
            >
              <Row gutter={[0, 12]}>
                <Col span={24}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong>Chọn phương thức thanh toán:</Text>
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={showPaymentHelp}
                      size="small"
                    />
                  </div>{" "}
                  <Select
                    mode="multiple"
                    style={{ width: "100%", marginTop: 8 }}
                    placeholder="Chọn phương thức thanh toán"
                    value={
                      order.thanhToans?.map((p) => p.maPhuongThucThanhToan) ||
                      []
                    }
                    onChange={(selectedMethods) =>
                      handlePaymentMethodChange(order.id, selectedMethods)
                    }
                    optionLabelProp="label"
                  >
                    <Select.Option
                      key={PAYMENT_METHOD.COD}
                      value={PAYMENT_METHOD.COD}
                      label="COD (Thu hộ)"
                      disabled={
                        // Chỉ cho phép COD khi là đơn giao hàng và không có phương thức khác
                        order.loaiHoaDon !== 3 ||
                        order.thanhToans?.some(
                          (p) =>
                            (p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH ||
                              p.maPhuongThucThanhToan === PAYMENT_METHOD.QR) &&
                            p.soTien > 0
                        )
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <ShoppingOutlined style={{ marginRight: 8 }} />
                        COD (Thu hộ)
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          Thanh toán độc lập
                        </Tag>
                      </div>
                    </Select.Option>

                    <Select.Option
                      key={PAYMENT_METHOD.CASH}
                      value={PAYMENT_METHOD.CASH}
                      label="Tiền mặt"
                      disabled={order.thanhToans?.some(
                        (p) =>
                          p.maPhuongThucThanhToan === PAYMENT_METHOD.COD &&
                          p.soTien > 0
                      )}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <WalletOutlined style={{ marginRight: 8 }} />
                        Tiền mặt
                      </div>
                    </Select.Option>

                    <Select.Option
                      key={PAYMENT_METHOD.QR}
                      value={PAYMENT_METHOD.QR}
                      label="QR (Chuyển khoản)"
                      disabled={order.thanhToans?.some(
                        (p) =>
                          p.maPhuongThucThanhToan === PAYMENT_METHOD.COD &&
                          p.soTien > 0
                      )}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <QrcodeOutlined style={{ marginRight: 8 }} />
                        QR (Chuyển khoản)
                      </div>
                    </Select.Option>
                  </Select>
                </Col>
              </Row>

              {/* Hiển thị ô nhập số tiền cho từng phương thức */}
              {(order.thanhToans || []).map((payment) => {
                // Biến để kiểm tra có nhiều phương thức thanh toán không
                const hasBothPaymentMethods =
                  order.thanhToans &&
                  order.thanhToans.some(
                    (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                  ) &&
                  order.thanhToans.some(
                    (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                  );

                // Nếu là chuyển khoản và có cả 2 phương thức, không hiển thị ô nhập mà sẽ tự động tính
                const isAutoCalculated =
                  payment.maPhuongThucThanhToan === PAYMENT_METHOD.QR &&
                  hasBothPaymentMethods;

                return (
                  <Card
                    key={payment.maPhuongThucThanhToan}
                    size="small"
                    style={{
                      marginTop: 12,
                      borderLeft: `4px solid ${
                        payment.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                          ? "#52c41a"
                          : payment.maPhuongThucThanhToan === PAYMENT_METHOD.COD
                          ? "#fa8c16"
                          : "#1890ff"
                      }`,
                      backgroundColor: "#fff",
                    }}
                    styles={{ body: { padding: "12px 16px" } }}
                  >
                    <Row align="middle">
                      <Col span={12}>
                        <Space>
                          {payment.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.CASH && (
                            <WalletOutlined style={{ color: "#52c41a" }} />
                          )}
                          {payment.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.QR && (
                            <QrcodeOutlined style={{ color: "#1890ff" }} />
                          )}
                          {payment.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.COD && (
                            <ShoppingOutlined style={{ color: "#fa8c16" }} />
                          )}
                          <Text strong>{payment.tenPhuongThucThanhToan}</Text>
                        </Space>
                      </Col>
                      <Col span={12}>
                        {isAutoCalculated ? (
                          <div
                            style={{
                              padding: "4px 11px",
                              border: "1px solid #d9d9d9",
                              borderRadius: "2px",
                              backgroundColor: "#f5f5f5",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(payment.soTien || 0)}
                          </div>
                        ) : (
                          <InputNumber
                            style={{ width: "100%" }}
                            value={payment.soTien}
                            onChange={(value) => {
                              // Xử lý khi người dùng nhập số tiền
                              handlePaymentAmountChange(
                                order.id,
                                payment.maPhuongThucThanhToan,
                                value
                              );
                            }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            min={0}
                            step={1000}
                            placeholder="Nhập số tiền"
                            addonAfter="₫"
                            size="large"
                          />
                        )}
                      </Col>
                    </Row>

                    {/* Hiển thị mã QR nếu là phương thức chuyển khoản và có số tiền */}
                    {payment.maPhuongThucThanhToan === PAYMENT_METHOD.QR &&
                      payment.soTien > 0 && (
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                          <Button
                            type="primary"
                            icon={<QrcodeOutlined />}
                            onClick={() => {
                              generateQR(order.id, payment.soTien);
                              setIsModalVisiblePaymentQR(true);
                            }}
                            style={{
                              backgroundColor: "#1890ff",
                              borderColor: "#1890ff",
                              boxShadow: "0 2px 0 rgba(0,0,0,0.045)",
                              margin: "0 auto",
                            }}
                          >
                            <Space>
                              <span>Quét mã thanh toán</span>
                            </Space>
                          </Button>
                        </div>
                      )}
                  </Card>
                );
              })}

              {/* Tổng kết thông tin thanh toán */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px",
                  background: "#f0f7ff",
                  borderRadius: "8px",
                  border: "1px solid #d6e4ff",
                }}
              >
                <Row gutter={[0, 8]}>
                  <Col span={12}>
                    <Text>Tổng tiền hàng:</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text>
                      {formatCurrency(totals[order.id]?.subtotal || 0)}
                    </Text>
                  </Col>
                  {/* Giảm giá */}
                  <Col span={12}>
                    <Text>Giảm giá: </Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    {order.phieuGiamGia ? (
                      <Text strong style={{ color: "#f50" }}>
                        {Number(order.phieuGiamGia.loaiPhieuGiamGia) === 1 ? (
                          <>
                            {order.phieuGiamGia.giaTriGiam}% (
                            {formatCurrency(
                              order.giamGia ||
                                totals[order.id]?.discountAmount ||
                                0
                            )}
                            )
                          </>
                        ) : (
                          formatCurrency(
                            order.giamGia ||
                              totals[order.id]?.discountAmount ||
                              0
                          )
                        )}
                      </Text>
                    ) : (
                      <Text>
                        {formatCurrency(
                          order.giamGia || totals[order.id]?.discountAmount || 0
                        )}
                      </Text>
                    )}
                  </Col>

                  {/* Phí vận chuyển - Chỉ hiện khi là đơn giao hàng */}
                  {order.loaiHoaDon === 3 && (
                    <>
                      <Col span={12}>
                        <Text>
                          Phí vận chuyển{" "}
                          <Image
                            src="/logo/GHNLogo.png"
                            preview={false}
                            style={{
                              width: "50px",
                              height: "30px",
                              marginLeft: "5px",
                              verticalAlign: "middle",
                            }}
                          />
                        </Text>
                      </Col>
                      <Col span={12} style={{ textAlign: "right" }}>
                        {calculatingShippingFee ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Spin size="small" style={{ marginRight: "8px" }} />
                            <Text type="secondary">Đang tính...</Text>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            {/* THAY ĐỔI: Chỉ hiển thị miễn phí vận chuyển khi đơn hàng sau giảm giá >= 2 triệu */}
                            {totals[order.id]?.subtotalAfterDiscount >=
                            2000000 ? (
                              <Text
                                style={{ color: "#52c41a", fontWeight: "bold" }}
                              >
                                Miễn phí (đơn ≥ 2 triệu)
                              </Text>
                            ) : (
                              <InputNumber
                                value={order.phiVanChuyen || 0}
                                onChange={(value) => {
                                  const fee = value || 0;
                                  handleShippingFeeChange(activeKey, fee);
                                }}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) =>
                                  value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={1000}
                                style={{ width: 120 }}
                              />
                            )}

                            {/* THAY ĐỔI: Chỉ hiển thị nút tính lại nếu không đủ điều kiện miễn phí */}
                            {totals[order.id]?.subtotalAfterDiscount <
                              2000000 && (
                              <Button
                                type="link"
                                size="small"
                                icon={<SyncOutlined />}
                                onClick={async () => {
                                  if (selectedAddress && giaoHangRef.current) {
                                    const fee =
                                      await giaoHangRef.current.calculateShippingFee();

                                    // Kiểm tra lại điều kiện miễn phí vận chuyển
                                    const subtotalAfterDiscount =
                                      totals[activeKey]?.subtotalAfterDiscount;
                                    if (subtotalAfterDiscount >= 2000000) {
                                      // Miễn phí vận chuyển
                                      handleShippingFeeUpdate(0);
                                    } else {
                                      // Cập nhật phí vận chuyển đã tính
                                      handleShippingFeeUpdate(fee);
                                    }
                                  }
                                }}
                                disabled={!selectedAddress}
                                title={
                                  !selectedAddress
                                    ? "Vui lòng chọn địa chỉ trước"
                                    : "Tính lại phí"
                                }
                                style={{ padding: 0, marginLeft: 8 }}
                              />
                            )}
                          </div>
                        )}
                      </Col>
                    </>
                  )}
                </Row>

                <Divider style={{ margin: "12px 0" }} />

                {/* Tổng thanh toán */}
                <Row align="middle">
                  <Col span={12}>
                    <Text strong style={{ fontSize: 16 }}>
                      Tổng thanh toán:
                    </Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    {totals[order.id]?.isFullyDiscounted &&
                    order.loaiHoaDon !== 3 ? (
                      // Trường hợp đơn miễn phí hoàn toàn và KHÔNG là giao hàng
                      <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                        MIỄN PHÍ
                      </Text>
                    ) : (
                      // Trường hợp có phí vận chuyển hoặc không được miễn phí
                      <Text strong style={{ color: "red", fontSize: 16 }}>
                        {formatCurrency(totals[order.id]?.finalTotal || 0)}
                      </Text>
                    )}
                    {/* Hiển thị ghi chú nếu là đơn giảm 100% nhưng vẫn phải thanh toán phí ship */}
                    {totals[order.id]?.isFullyDiscounted &&
                      order.loaiHoaDon === 3 &&
                      totals[order.id]?.shippingFee > 0 && (
                        <div style={{ fontSize: 12, color: "#595959" }}>
                          (Chỉ thanh toán phí vận chuyển)
                        </div>
                      )}
                  </Col>
                </Row>

                {/* Thông tin số tiền đã nhập cho các phương thức */}
                {order.thanhToans && order.thanhToans.length > 0 && (
                  <>
                    <Divider dashed style={{ margin: "12px 0" }} />

                    {/* Hiển thị từng phương thức thanh toán */}
                    {order.thanhToans.map((payment) => (
                      <Row
                        key={payment.maPhuongThucThanhToan}
                        style={{ marginBottom: 4 }}
                      >
                        <Col span={12}>
                          <Space>
                            {payment.maPhuongThucThanhToan ===
                              PAYMENT_METHOD.CASH && (
                              <WalletOutlined style={{ color: "#52c41a" }} />
                            )}
                            {payment.maPhuongThucThanhToan ===
                              PAYMENT_METHOD.QR && (
                              <QrcodeOutlined style={{ color: "#1890ff" }} />
                            )}
                            {payment.maPhuongThucThanhToan ===
                              PAYMENT_METHOD.COD && (
                              <ShoppingOutlined style={{ color: "#fa8c16" }} />
                            )}
                            <Text>{payment.tenPhuongThucThanhToan}:</Text>
                          </Space>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                          <Text>{formatCurrency(payment.soTien || 0)}</Text>
                        </Col>
                      </Row>
                    ))}

                    <Row style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text strong>Tổng đã nhập:</Text>
                      </Col>
                      <Col span={12} style={{ textAlign: "right" }}>
                        <Text strong>
                          {formatCurrency(
                            order.thanhToans.reduce(
                              (sum, p) => sum + (p.soTien || 0),
                              0
                            )
                          )}
                        </Text>
                      </Col>
                    </Row>

                    {/* Hiển thị còn thiếu hoặc thừa */}
                    {calculateChange(order.id).remaining > 0 && (
                      <Row
                        style={{
                          marginTop: 8,
                          background: "#fff1f0",
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: "1px solid #ffccc7",
                        }}
                      >
                        <Col span={12}>
                          <Text type="danger" strong>
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span style={{ marginRight: 4 }}>⚠️</span> Còn
                              thiếu:
                            </span>
                          </Text>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                          <Text type="danger" strong>
                            {formatCurrency(
                              calculateChange(order.id).remaining
                            )}
                          </Text>
                        </Col>
                      </Row>
                    )}

                    {calculateChange(order.id).change > 0 && (
                      <Row
                        style={{
                          marginTop: 8,
                          background: "#f6ffed",
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        <Col span={12}>
                          <Text type="success" strong>
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span style={{ marginRight: 4 }}>💰</span> Tiền
                              thừa:
                            </span>
                          </Text>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                          <Text type="success" strong>
                            {formatCurrency(calculateChange(order.id).change)}
                          </Text>
                        </Col>
                      </Row>
                    )}
                  </>
                )}
              </div>
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                onClick={() => handleConfirmOrder(order.id)}
                style={
                  totals[order.id]?.isFullyDiscounted
                    ? { background: "#52c41a", borderColor: "#52c41a" }
                    : {}
                }
              >
                {totals[order.id]?.isFullyDiscounted
                  ? "Xác nhận đơn hàng miễn phí"
                  : "Xác nhận đơn hàng"}
              </Button>
            </Space>
          </Space>
        </div>
      </Col>
    </Row>
  );
  // Add these handler functions
  const handleAddNewCustomer = () => {
    // Kiểm tra xem có đơn hàng active không
    if (!activeKey) {
      message.error("Vui lòng tạo hoặc chọn đơn hàng trước");
      return;
    }

    if (openCustomerDialog || openVoucherDialog) {
      message.warning(
        "Vui lòng đóng cửa sổ đang mở trước khi thêm khách hàng mới"
      );
      return;
    }

    // Mở modal thêm khách hàng mới
    setIsCreateCustomerModalVisible(true);
  };
  // Định nghĩa hàm đóng modal tạo khách hàng mới
  const handleCloseCreateCustomerModal = () => {
    setIsCreateCustomerModalVisible(false);
  };
  // Hàm tải lại danh sách khách hàng sau khi thêm mới
  const refreshCustomers = async (newCustomerData = null) => {
    try {
      // Nếu có dữ liệu khách hàng mới được truyền từ form
      if (newCustomerData && newCustomerData.id) {
        console.log("Nhận dữ liệu khách hàng mới từ form:", newCustomerData);

        // Cập nhật danh sách khách hàng
        setCustomers((prev) => [newCustomerData, ...prev]);

        try {
          // Gọi API để liên kết khách hàng với hóa đơn
          await axios.put(
            `http://localhost:8080/api/admin/ban-hang/${activeKey}/customer`,
            { customerId: newCustomerData.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Cập nhật UI
          setSelectedCustomer(newCustomerData);
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === activeKey
                ? {
                    ...tab,
                    order: {
                      ...tab.order,
                      khachHang: newCustomerData,
                    },
                  }
                : tab
            )
          );

          // Kiểm tra nếu đơn là giao hàng, tự động chọn địa chỉ đầu tiên
          const currentTab = tabs.find((tab) => tab.key === activeKey);
          if (currentTab?.order?.loaiHoaDon === 3 && giaoHangRef.current) {
            setTimeout(() => {
              giaoHangRef.current.selectFirstAddress();
            }, 300);
          }

          message.success(
            `Đã tạo và chọn khách hàng: ${newCustomerData.tenKhachHang}`
          );
        } catch (error) {
          console.error("Lỗi khi liên kết khách hàng với hóa đơn:", error);
          message.error("Không thể liên kết khách hàng mới với hóa đơn");
        }

        // Đóng modal
        setIsCreateCustomerModalVisible(false);
        return;
      }

      // Nếu không có dữ liệu trực tiếp, tải lại danh sách
      const response = await axios.get(
        "http://localhost:8080/api/admin/khach_hang",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Lỗi khi làm mới danh sách khách hàng:", error);
      message.error("Không thể cập nhật thông tin khách hàng mới");
    }
  };

  // Sửa lỗi CustomerFormWrapper để ngăn render và API call liên tục

  const CustomerFormWrapper = ({ onCustomerCreated }) => {
    const [customersList, setCustomersList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // Sử dụng ref để chỉ gọi API một lần
    const hasLoadedRef = useRef(false);

    useEffect(() => {
      // Chỉ gọi API nếu chưa từng gọi
      if (!hasLoadedRef.current) {
        const loadAllCustomers = async () => {
          try {
            setIsLoading(true);
            const response = await axios.get(
              "http://localhost:8080/api/admin/khach_hang",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setCustomersList(response.data || []);
            hasLoadedRef.current = true;
          } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
            message.error("Không thể tải danh sách khách hàng");
          } finally {
            setIsLoading(false);
          }
        };

        loadAllCustomers();
      }
    }, [token]);

    // Memoize hàm để tránh re-render không cần thiết
    const getCustomerList = useCallback(() => {
      return customersList;
    }, [customersList]);

    // Xử lý khi khách hàng mới được tạo
    const handleCustomerCreated = useCallback(
      (newCustomerData) => {
        if (newCustomerData && onCustomerCreated) {
          // Gọi callback để cập nhật state trong component cha
          onCustomerCreated(newCustomerData);
        }
      },
      [onCustomerCreated]
    );

    const handleCloseForm = useCallback(() => {
      if (typeof onCustomerCreated === "function") {
        // When closing without creating, just call the function with no args
        onCustomerCreated();
      }
    }, [onCustomerCreated]);

    if (isLoading) {
      return (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spin tip="Đang tải danh sách khách hàng..." />
        </div>
      );
    }

    return (
      <CreateForm
        getAllKhachHang={getCustomerList}
        handleClose={handleCustomerCreated}
        onCancel={handleCloseForm}
      />
    );
  };

  const handleDeliveryMethodChange = async (hoaDonId, method) => {
    try {
      setLoading(true);
      
      // Xác định loại hóa đơn mới (2: tại quầy, 3: giao hàng)
      const newOrderType = method === "giaoHang" ? 3 : 2;
      
      // Cập nhật state local trước để UI phản hồi ngay lập tức
      setSelectedLoaiHoaDon(newOrderType);
      
      // Tìm tab hiện tại để kiểm tra khách hàng
      const currentTab = tabs.find((tab) => tab.key === hoaDonId);
      const oldOrderType = currentTab?.order?.loaiHoaDon;
      
      // Nếu chuyển từ Giao hàng -> Tại quầy, reset địa chỉ và phí vận chuyển
      if (method === "taiQuay" && oldOrderType === 3) {
        await resetAddressAndShippingFee(hoaDonId);
      }
      
      // Gửi API request để cập nhật loại hóa đơn
      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/update-loai-hoa-don`,
        { loaiHoaDon: newOrderType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Đã cập nhật hình thức mua hàng thành công");
        
        // Fetch lại toàn bộ thông tin hóa đơn để đảm bảo dữ liệu đồng bộ
        await fetchLatestData();
        
        // Cập nhật tabs
        const updatedTabs = tabs.map((tab) => {
          if (tab.key === hoaDonId) {
            return {
              ...tab,
              order: {
                ...tab.order,
                loaiHoaDon: newOrderType,
                // Reset phí vận chuyển khi chuyển sang tại quầy
                phiVanChuyen: newOrderType === 2 ? 0 : tab.order.phiVanChuyen,
              },
            };
          }
          return tab;
        });
        setTabs(updatedTabs);
        
        // Nếu chuyển từ tại quầy sang giao hàng, hiển thị form nhập địa chỉ
        if (newOrderType === 3) {
          // Chuyển sang chế độ nhập địa chỉ mới
          if (giaoHangRef.current && giaoHangRef.current.resetAddressState) {
            const isAnonymous = !currentTab?.order?.khachHang || currentTab?.order?.khachHang === "Khách hàng lẻ";
            giaoHangRef.current.resetAddressState(isAnonymous, {
              recipientName: currentTab?.order?.tenNguoiNhan || "",
              phoneNumber: currentTab?.order?.soDienThoai || ""
            });
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật hình thức mua hàng:", error);
      message.error("Không thể cập nhật hình thức mua hàng");
    } finally {
      setLoading(false);
    }
  };
    // Thêm hàm mới để reset phí vận chuyển
  const resetShippingFee = async (hoaDonId) => {
    if (!hoaDonId) {
      console.error("Không có ID hóa đơn để reset phí vận chuyển");
      return false;
    }
    
    try {
      console.log(`Reset phí vận chuyển cho hóa đơn ${hoaDonId}`);
      
      // Reset trên server trước để đồng bộ
      await axios.post(
        `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
        { fee: 0 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Cập nhật state tabs để UI phản hồi ngay lập tức
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.key === hoaDonId) {
            return {
              ...tab, 
              order: {
                ...tab.order,
                phiVanChuyen: 0
              }
            };
          }
          return tab;
        })
      );
      
      // Cập nhật state totals để tính lại tổng tiền
      setTotals((prev) => {
        if (!prev[hoaDonId]) return prev;
        
        const currentTotal = prev[hoaDonId];
        return {
          ...prev,
          [hoaDonId]: {
            ...currentTotal,
            shippingFee: 0,
            finalTotal: currentTotal.subtotalAfterDiscount || 0
          }
        };
      });
      
      console.log(`Đã reset phí vận chuyển thành công cho hóa đơn ${hoaDonId}`);
      return true;
    } catch (error) {
      console.error("Lỗi khi reset phí vận chuyển:", error);
      return false;
    }
  };
  const handlePaymentMethodChange = (hoaDonId, selectedMethods) => {
    const orderTotals = totals[hoaDonId] || {};
    const isFullyDiscounted = orderTotals.isFullyDiscounted || false;
    const finalTotal = orderTotals.finalTotal || 0;
    const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
    const isDeliveryOrder = order?.loaiHoaDon === 3;

    // Nếu đơn hàng miễn phí hoàn toàn, không cần chọn phương thức thanh toán
    if (isFullyDiscounted && (!isDeliveryOrder || finalTotal === 0)) {
      message.info(
        "Đơn hàng được miễn phí hoàn toàn, không cần chọn phương thức thanh toán"
      );
      // Đặt lại về không có phương thức thanh toán
      selectedMethods = [];
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  thanhToans: [], // Không có phương thức thanh toán cho đơn miễn phí
                },
              }
            : tab
        )
      );
      return;
    }

    const hasCod = selectedMethods.includes(PAYMENT_METHOD.COD);

    // Nếu có COD, chỉ cho phép duy nhất phương thức COD
    if (hasCod && selectedMethods.length > 1) {
      selectedMethods = [PAYMENT_METHOD.COD];
      message.info(PAYMENT_RULES.COD_EXCLUSIVE);
    }
    // Nếu không có COD, chỉ cho phép QR và CASH
    else if (!hasCod && selectedMethods.length > 0) {
      const validMethods = selectedMethods.filter(
        (method) =>
          method === PAYMENT_METHOD.QR || method === PAYMENT_METHOD.CASH
      );

      if (validMethods.length < selectedMethods.length) {
        message.info(PAYMENT_RULES.QR_CASH_ONLY);
        selectedMethods = validMethods;
      }
    }

    // Map các phương thức đã chọn thành đối tượng thanh toán
    const selectedPayments = selectedMethods
      .map((methodCode) => {
        // Tìm thông tin đầy đủ của phương thức từ danh sách
        const method = paymentMethods.find(
          (m) => m.maPhuongThucThanhToan === methodCode
        );

        if (!method) {
          console.error("Payment method not found:", methodCode);
          return null;
        }

        // Tính toán số tiền mặc định dựa trên phương thức
        let defaultAmount = 0;

        if (selectedMethods.length === 1) {
          // Nếu chỉ có một phương thức thanh toán, gán toàn bộ số tiền
          defaultAmount = finalTotal;
        } else if (methodCode === PAYMENT_METHOD.CASH) {
          // Nếu có nhiều phương thức và là tiền mặt, mặc định là 0
          // (sẽ được tính toán lại ở hàm khác)
          defaultAmount = 0;
        } else if (methodCode === PAYMENT_METHOD.QR) {
          // Nếu là QR và có nhiều phương thức, mặc định là tổng số tiền
          defaultAmount = finalTotal;
        }

        // Tạo đối tượng thanh toán với ID duy nhất
        const paymentId = `${hoaDonId}_${methodCode}`;

        return {
          id: paymentId,
          maPhuongThucThanhToan: method.maPhuongThucThanhToan,
          tenPhuongThucThanhToan: method.tenPhuongThucThanhToan,
          soTien: defaultAmount,
        };
      })
      .filter(Boolean); // Loại bỏ các giá trị null

    // Cập nhật state tabs với các thanh toán mới
    setTabs((prev) =>
      prev.map((tab) =>
        tab.key === hoaDonId
          ? {
              ...tab,
              order: {
                ...tab.order,
                thanhToans: selectedPayments,
              },
            }
          : tab
      )
    );
  };
  // Update the payment input handler for better experience when using both payment methods
  const handlePaymentAmountChange = (hoaDonId, methodCode, amount) => {
    const orderTotal = totals[hoaDonId]?.finalTotal || 0;
    const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

    if (!currentOrder?.thanhToans) return;

    // Nếu là COD, đảm bảo số tiền luôn bằng tổng đơn hàng
    if (methodCode === PAYMENT_METHOD.COD) {
      amount = orderTotal;
    }

    // Kiểm tra có cả phương thức tiền mặt và QR không
    const hasCashMethod = currentOrder.thanhToans.some(
      (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
    );

    const hasQrMethod = currentOrder.thanhToans.some(
      (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
    );

    const hasBothMethods = hasCashMethod && hasQrMethod;

    // Nếu là tiền mặt và có QR, tự động điều chỉnh số tiền QR
    if (methodCode === PAYMENT_METHOD.CASH && hasBothMethods) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  thanhToans: tab.order.thanhToans.map((p) => {
                    if (p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH) {
                      return { ...p, soTien: amount };
                    } else if (p.maPhuongThucThanhToan === PAYMENT_METHOD.QR) {
                      // Số tiền QR = tổng tiền - tiền mặt (không âm)
                      return { ...p, soTien: Math.max(0, orderTotal - amount) };
                    }
                    return p;
                  }),
                },
              }
            : tab
        )
      );
    }
    // Nếu là QR và có tiền mặt, tự động điều chỉnh số tiền mặt
    else if (methodCode === PAYMENT_METHOD.QR && hasBothMethods) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  thanhToans: tab.order.thanhToans.map((p) => {
                    if (p.maPhuongThucThanhToan === PAYMENT_METHOD.QR) {
                      return { ...p, soTien: amount };
                    } else if (
                      p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                    ) {
                      // Số tiền mặt = tổng tiền - tiền QR (không âm)
                      return { ...p, soTien: Math.max(0, orderTotal - amount) };
                    }
                    return p;
                  }),
                },
              }
            : tab
        )
      );
    }
    // Trường hợp còn lại, chỉ cập nhật phương thức đang thay đổi
    else {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  thanhToans: tab.order.thanhToans.map((p) =>
                    p.maPhuongThucThanhToan === methodCode
                      ? { ...p, soTien: amount }
                      : p
                  ),
                },
              }
            : tab
        )
      );
    }
  };

  const handleShippingFeeChange = async (hoaDonId, fee) => {
    try {
      // Check if eligible for free shipping based on total BEFORE discount
      const orderTotals = totals[hoaDonId] || calculateOrderTotals(hoaDonId);
      const subtotal = orderTotals.subtotal;
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const isFullyDiscounted = orderTotals.isFullyDiscounted;

      // THAY ĐỔI: Chỉ miễn phí vận chuyển khi tổng tiền trước giảm giá >= 2 triệu
      if (subtotal >= 2000000 && order?.loaiHoaDon === 3) {
        fee = 0;
        message.info("Áp dụng miễn phí vận chuyển cho đơn hàng ≥ 2 triệu");
      }

      // Cập nhật state ngay lập tức cho UX tốt hơn
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? { ...tab, order: { ...tab.order, phiVanChuyen: fee } }
            : tab
        )
      );

      // Cập nhật totals với phí vận chuyển mới
      setTotals((prev) => {
        const current = prev[hoaDonId] || {};
        // THAY ĐỔI: Với đơn giảm giá 100%, finalTotal = phí vận chuyển nếu là đơn giao hàng
        const finalTotal = current.isFullyDiscounted
          ? order?.loaiHoaDon === 3
            ? fee
            : 0
          : (current.subtotal || 0) - (current.discountAmount || 0) + fee;

        return {
          ...prev,
          [hoaDonId]: {
            ...current,
            shippingFee: fee,
            finalTotal: finalTotal,
            freeShipping: subtotal >= 2000000 && order?.loaiHoaDon === 3,
          },
        };
      });

      // Gọi API với đường dẫn chính xác
      const response = await axios.post(
        `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
        { fee: fee },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Cập nhật phí vận chuyển thành công:", response.data);
      if (fee === 0 && subtotal >= 2000000 && order?.loaiHoaDon === 3) {
        message.success("Đã áp dụng miễn phí vận chuyển (đơn ≥ 2 triệu)");
      } else {
        // message.success(`Đã cập nhật phí vận chuyển: ${formatCurrency(fee)}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phí vận chuyển:", error);
      message.error("Không thể cập nhật phí vận chuyển");

      // Roll back changes if API call fails
      fetchInvoiceById(hoaDonId);
    }
  };

  // Add function to load customers
  const loadCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/admin/khach_hang",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const handleCustomerSelected = async (hoaDonId, customerId) => {
    try {
      console.log(
        "Chọn khách hàng với ID:",
        customerId,
        "cho hóa đơn:",
        hoaDonId
      );

      if (customerId === "Khách hàng lẻ") {
        message.error(
          "Không thể chọn 'Khách hàng lẻ'. Vui lòng chọn khách hàng khác."
        );
        return;
      }

      // Find the selected customer first to ensure we have the data
      const selectedCustomer = customers.find((c) => c.id === customerId);
      if (!selectedCustomer) {
        message.error("Không tìm thấy thông tin khách hàng.");
        return;
      }

      // Update the local customer state immediately
      setSelectedCustomer(selectedCustomer);

      // Get the current tab and prepare recipient information
      const currentTab = tabs.find((tab) => tab.key === hoaDonId);
      const tenNguoiNhan = selectedCustomer.tenKhachHang;
      const soDienThoai = selectedCustomer.soDienThoai;

      // Update UI immediately with customer info to avoid flicker
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  khachHang: selectedCustomer,
                  tenNguoiNhan: tenNguoiNhan,
                  soDienThoai: soDienThoai,
                },
              }
            : tab
        )
      );

      // Close the dialog immediately for better UX
      setOpenCustomerDialog(false);

      // Send update to server with complete customer information
      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
        {
          customerId: customerId,
          tenNguoiNhan: tenNguoiNhan,
          soDienThoai: soDienThoai,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server response after customer selection:", response.data);
      message.success(`Đã chọn khách hàng: ${selectedCustomer.tenKhachHang}`);

      // Handle delivery-specific functionality if needed
      if (currentTab && currentTab.order?.loaiHoaDon === 3) {
        resetGiaoHangComponent(currentTab);
      }
    } catch (error) {
      console.error("Lỗi khi chọn khách hàng:", error);
      message.error("Lỗi khi chọn khách hàng. Vui lòng thử lại.");
    }
  };
  // Add function to handle customer selection
  const handleSelectCustomer = async (hoaDonId) => {
    try {
      await loadCustomers();
      setOpenCustomerDialog(true);
    } catch (error) {
      message.error("Lỗi khi tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      // Dùng timeout để debounce
      const timeoutId = setTimeout(async () => {
        const order = tabs.find((tab) => tab.key === activeKey)?.order;

        if (order && order.phieuGiamGia) {
          // Calculate current subtotal
          const subtotal = calculateTotalBeforeDiscount(
            orderProducts[activeKey]
          );

          // Check if the current order total meets voucher minimum requirement
          if (subtotal < order.phieuGiamGia.giaTriToiThieu) {
            // Show warning notification
            message.warning(
              `Giá trị đơn hàng (${formatCurrency(
                subtotal
              )}) không đủ áp dụng voucher ${
                order.phieuGiamGia.maPhieuGiamGia
              } (tối thiểu ${formatCurrency(
                order.phieuGiamGia.giaTriToiThieu
              )})`,
              3
            );

            try {
              // Remove the voucher since it's no longer applicable
              await handleRemoveVoucher(activeKey, false);

              // Update the order in tabs immediately after API call
              setTabs((prev) =>
                prev.map((tab) =>
                  tab.key === activeKey
                    ? {
                        ...tab,
                        order: {
                          ...tab.order,
                          phieuGiamGia: null,
                          giamGia: 0,
                        },
                      }
                    : tab
                )
              );

              // Fetch the latest order data to make sure UI is updated correctly
              await fetchInvoiceById(activeKey);

              // Calculate new totals without voucher
              const products = orderProducts[activeKey] || [];
              const newTotals = calculateOrderTotals(activeKey, products, {
                ...order,
                phieuGiamGia: null,
                giamGia: 0,
              });

              // Update totals state
              setTotals((prev) => ({
                ...prev,
                [activeKey]: newTotals,
              }));

              // Update UI display values
              setTotalBeforeDiscount(newTotals.subtotal);
              setTotalAmount(newTotals.finalTotal);
            } catch (error) {
              console.error("Error removing invalid voucher:", error);
              message.error("Không thể xóa voucher không hợp lệ");
            }
          }
        }
      }, 500);

      // Cleanup để tránh gọi nhiều lần
      return () => clearTimeout(timeoutId);
    }
  }, [activeKey, orderProducts]);
  // Tự động tính lại tổng tiền khi danh sách sản phẩm thay đổi
  const calculateOrderTotal = (products, shippingFee = 0, discount = 0) => {
    const subtotal = products.reduce(
      (sum, product) => sum + product.gia * product.soLuong,
      0
    );
    return subtotal + shippingFee - discount;
  };
  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      const newTotals = calculateOrderTotals(activeKey);
      setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
      setTotalAmount(newTotals.finalTotal);
    }
  }, [orderProducts, activeKey]);

  useEffect(() => {
    if (activeKey && totals[activeKey]) {
      setTotalAmount(totals[activeKey].finalTotal);
    }
  }, [totals, activeKey, orderProducts]); // Theo dõi thêm `orderProducts`

  // Add applyBestVoucher function from InvoiceDetail
  const applyBestVoucher = async (hoaDonId) => {
    try {
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!order) return null;

      const totalBeforeVoucher = calculateOrderTotal(
        orderProducts[hoaDonId],
        order.phiVanChuyen || 0,
        0
      );

      // Kiểm tra nếu mã giảm giá hiện tại không còn hợp lệ
      const currentVoucher = order.phieuGiamGia;
      if (
        currentVoucher &&
        totalBeforeVoucher < currentVoucher.giaTriToiThieu
      ) {
        await handleRemoveVoucher(hoaDonId);
        message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
      }

      // Tìm mã giảm giá tốt nhất
      const response = await api.post(
        `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      const updatedOrder = response.data;

      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
        )
      );

      // Cập nhật tổng tiền ngay lập tức
      const newTotals = calculateOrderTotals(hoaDonId);
      setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));
      setTotalAmount(newTotals.finalTotal);

      return updatedOrder;
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
      return null;
    }
  };

  // Update fetchProducts to match InvoiceDetail format
  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/admin/hoa-don/san-pham/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const productsData = response.data;

      // Lấy hình ảnh từ API
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            // Sử dụng cache để tránh request lặp lại
            const cacheKey = `product_image_${product.id}`;
            const cachedImages = sessionStorage.getItem(cacheKey);

            if (cachedImages) {
              return {
                ...product,
                hinhAnh: JSON.parse(cachedImages),
              };
            }

            const imgResponse = await axios.get(
              `http://localhost:8080/api/admin/sanphamchitiet/${product.id}/hinhanh`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // Đảm bảo hinhAnh luôn là một mảng
            const imageUrls = Array.isArray(imgResponse.data)
              ? imgResponse.data.map((img) => img.anhUrl)
              : [];

            // Lưu vào cache
            sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));

            return {
              ...product,
              hinhAnh: imageUrls,
            };
          } catch (error) {
            console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
            return { ...product, hinhAnh: [] };
          }
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  // Add useEffect to load products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchInvoiceProducts = async (hoaDonId, skipUIUpdate = false) => {
    try {
      // Clear existing timer
      if (fetchInvoiceProducts.timer) {
        clearTimeout(fetchInvoiceProducts.timer);
      }

      return new Promise((resolve) => {
        fetchInvoiceProducts.timer = setTimeout(
          async () => {
            try {
              const response = await api.get(
                `/api/admin/hoa-don/${hoaDonId}/san-pham`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              let products = response.data || [];

              // Kiểm tra rõ ràng sản phẩm trả về
              if (!products || products.length === 0) {
                console.warn(`Không tìm thấy sản phẩm cho hóa đơn ${hoaDonId}`);

                // Cập nhật state trống
                if (!skipUIUpdate) {
                  setOrderProducts((prev) => ({
                    ...prev,
                    [hoaDonId]: [],
                  }));
                }

                resolve([]);
                return;
              }

              // Tối ưu: Chỉ lấy hình ảnh cho sản phẩm chưa có
              const productsWithImages = await Promise.all(
                products.map(async (product) => {
                  // Cập nhật thông tin thay đổi giá
                  const isChanged =
                    product.giaHienTai &&
                    product.giaTaiThoiDiemThem &&
                    product.giaHienTai !== product.giaTaiThoiDiemThem;

                  // Tính toán chênh lệch giá
                  const priceDiff = isChanged
                    ? product.giaHienTai - product.giaTaiThoiDiemThem
                    : 0;

                  const enhancedProduct = {
                    ...product,
                    giaThayDoi: isChanged,
                    chenhLech: priceDiff,
                  };

                  if (product.hinhAnh && product.hinhAnh.length > 0) {
                    return enhancedProduct;
                  }

                  try {
                    // Sử dụng cache để lưu hình ảnh
                    const cacheKey = `product_image_${product.id}`;
                    let cachedImages = sessionStorage.getItem(cacheKey);

                    if (cachedImages) {
                      return {
                        ...enhancedProduct,
                        hinhAnh: JSON.parse(cachedImages),
                      };
                    }

                    const imgResponse = await api.get(
                      `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    const imageUrls =
                      imgResponse.data && imgResponse.data.length > 0
                        ? imgResponse.data.map((img) => img.anhUrl)
                        : [];

                    // Lưu vào cache
                    sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));

                    return {
                      ...enhancedProduct,
                      hinhAnh: imageUrls,
                    };
                  } catch (error) {
                    console.error(
                      `Lỗi khi lấy ảnh sản phẩm ${product.id}:`,
                      error
                    );
                    return { ...enhancedProduct, hinhAnh: [] };
                  }
                })
              );

              // Chỉ cập nhật UI nếu không phải đang khởi tạo
              if (!skipUIUpdate) {
                // Cập nhật state ngay lập tức
                setOrderProducts((prev) => ({
                  ...prev,
                  [hoaDonId]: productsWithImages,
                }));

                // Lấy thông tin hóa đơn hiện tại
                const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
                if (order) {
                  // Tính toán lại tổng tiền
                  const newTotals = calculateOrderTotals(
                    hoaDonId,
                    productsWithImages,
                    order
                  );

                  setTotals((prev) => ({
                    ...prev,
                    [hoaDonId]: newTotals,
                  }));

                  // Cập nhật UI với tổng tiền mới
                  if (hoaDonId === activeKey) {
                    setTotalBeforeDiscount(newTotals.subtotal);
                    setTotalAmount(newTotals.finalTotal);
                  }
                }
              } else {
                // Nếu đang khởi tạo, chỉ cập nhật orderProducts
                setOrderProducts((prev) => ({
                  ...prev,
                  [hoaDonId]: productsWithImages,
                }));
              }

              // THÊM MỚI: Tự động tìm voucher tốt hơn sau khi tải sản phẩm
              if (!skipUIUpdate && hoaDonId === activeKey) {
                setTimeout(() => {
                  findBestVoucherAndSuggest(hoaDonId);
                }, 300);
              }

              resolve(productsWithImages);
            } catch (error) {
              console.error("Lỗi khi lấy danh sách sản phẩm:", error);
              resolve([]);
            }
          },
          skipUIUpdate ? 0 : 300
        ); // Không debounce khi đang khởi tạo
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
      return [];
    }
  };

  // Convert tabs to items format
  const items = tabs.map((tab) => ({
    key: tab.key,
    label: (
      <span>
        {tab.title}
        {orderProducts[tab.key]?.length > 0 && (
          <sup
            style={{
              marginLeft: "4px",
              color: "#ff4d4f",
              fontWeight: "bold",
            }}
          >
            ({orderProducts[tab.key].length})
          </sup>
        )}
      </span>
    ),
    children: renderOrderContent(tab.order),
  }));

  // Add this function to handle tab editing (adding/removing)
  const handleEditTab = (targetKey, action) => {
    if (action === "add") {
      addTab();
    } else if (action === "remove") {
      Modal.confirm({
        title: "Xác nhận hủy đơn hàng",
        content:
          "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm sẽ được hoàn lại kho.",
        okText: "Hủy đơn",
        cancelText: "Đóng",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            // Gọi API hủy hóa đơn, đảm bảo sản phẩm được hoàn lại kho
            await api.delete(`/api/admin/hoa-don/${targetKey}`, {
              headers: {
                Authorization: `Bearer ${token}`, // Thêm token vào header
              },
            });

            // Xóa tab khỏi giao diện
            setTabs((prev) => prev.filter((tab) => tab.key !== targetKey));

            // Xóa sản phẩm liên quan đến đơn hàng bị hủy
            setOrderProducts((prev) => {
              const newProducts = { ...prev };
              delete newProducts[targetKey];
              return newProducts;
            });
            setPriceChangesConfirmed((prev) => {
              const newState = { ...prev };
              delete newState[targetKey];
              return newState;
            });
            // Nếu tab hiện tại bị xóa, chuyển sang tab đầu tiên còn lại
            if (activeKey === targetKey) {
              const newActiveKey = tabs.find(
                (tab) => tab.key !== targetKey
              )?.key;
              setActiveKey(newActiveKey);
            }

            message.success("Đã hủy đơn hàng và hoàn lại sản phẩm vào kho.");
          } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            message.error(
              error.response?.data?.message || "Lỗi khi hủy đơn hàng."
            );
          }
        },
      });
    }
  };

  // Add function to calculate and update all totals
  const updateAllTotals = (products, order) => {
    if (!order || !order.id) return;

    // Bước 1: Tính tổng tiền hàng
    const subtotal = Array.isArray(products)
      ? products.reduce(
          (sum, product) => sum + product.gia * product.soLuong,
          0
        )
      : 0;

    // Bước 2: Tính tiền giảm giá
    let discountAmount = 0;
    if (order.phieuGiamGia) {
      discountAmount = calculateDiscountAmount(order.phieuGiamGia, subtotal);
    }

    // Bước 3: Tính tổng sau giảm giá
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Bước 4: Tính phí vận chuyển - CHỈ KHI LÀ ĐƠN GIAO HÀNG
    let shippingFee = 0;
    if (order.loaiHoaDon === 3) {
      // CHỈ tính phí vận chuyển nếu là đơn giao hàng
      // Áp dụng miễn phí vận chuyển nếu đơn từ 2 triệu sau giảm giá
      if (subtotalAfterDiscount >= 2000000) {
        shippingFee = 0; // Miễn phí vận chuyển
      } else {
        shippingFee = order.phiVanChuyen || 0;
      }
    } else {
      shippingFee = 0; // Đơn tại quầy không có phí vận chuyển
    }

    // Bước 5: Tính tổng cuối cùng
    const finalTotal = subtotalAfterDiscount + shippingFee;

    // Bước 6: Kiểm tra xem đơn có được miễn phí hoàn toàn không
    const isFullyDiscounted = subtotalAfterDiscount <= 0;

    // Cập nhật state totals
    const updatedTotals = {
      ...totals,
      [order.id]: {
        subtotal,
        discountAmount,
        subtotalAfterDiscount,
        shippingFee,
        finalTotal,
        isFullyDiscounted,
      },
    };

    setTotals(updatedTotals);
    return updatedTotals[order.id];
  };

  const autoApplyBestVoucher = async (hoaDonId) => {
    try {
      // Hiển thị thông báo đang xử lý - SỬ DỤNG CÙNG KEY cho tất cả messages
      const messageKey = "applying-best-voucher";
      message.loading({
        content: "Đang tìm mã giảm giá tốt nhất...",
        key: messageKey,
        duration: 0,
      });

      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!order) {
        message.error({
          content: "Không tìm thấy thông tin đơn hàng",
          key: messageKey,
        });
        return;
      }

      // Tải lại danh sách sản phẩm từ server để đảm bảo có dữ liệu mới nhất
      let currentProducts = [];
      try {
        const productsResponse = await api.get(
          `/api/admin/hoa-don/${hoaDonId}/san-pham`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        currentProducts = productsResponse.data || [];
      } catch (err) {
        // Nếu không thể tải từ server, sử dụng state hiện tại
        currentProducts = orderProducts[hoaDonId] || [];
      }

      // Kiểm tra một lần nữa với dữ liệu mới nhất
      if (currentProducts.length === 0) {
        message.info({
          content: "Không tìm thấy sản phẩm trong đơn hàng để áp dụng voucher",
          key: messageKey,
        });
        return;
      }

      const subtotal = calculateTotalBeforeDiscount(currentProducts);
      const shippingFee = order.phiVanChuyen || 0;
      const totalForVoucher = subtotal; // Chỉ sử dụng tổng tiền hàng cho voucher, không tính phí ship

      if (totalForVoucher <= 0) {
        message.info({
          content: "Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá",
          key: messageKey,
        });
        return;
      }

      // Get customer ID from order
      const customerId = order.khachHang?.id || "";

      // Trực tiếp gọi API apply-best-voucher của server để sử dụng logic của server
      const response = await api.post(
        `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher?customerId=${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data) {
        message.info({
          content: "Không tìm thấy voucher phù hợp cho đơn hàng này.",
          key: messageKey,
        });
        return;
      }

      const updatedOrder = response.data;

      // Cập nhật UI với thông tin đơn hàng mới
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
        )
      );

      // Tính toán lại totals
      const newTotals = calculateOrderTotals(
        hoaDonId,
        currentProducts,
        updatedOrder
      );
      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));

      const discountAmount =
        updatedOrder.giamGia || newTotals.discountAmount || 0;

      // Hiển thị thông báo thành công với thông tin voucher
      if (updatedOrder.phieuGiamGia) {
        message.success({
          content: `Đã áp dụng mã giảm giá tốt nhất: ${
            updatedOrder.phieuGiamGia.maPhieuGiamGia
          } - Giảm ${formatCurrency(discountAmount)}`,
          key: messageKey,
          duration: 3,
        });
      } else {
        message.info({
          content: "Không có voucher nào tốt hơn để áp dụng",
          key: messageKey,
        });
      }

      // Cập nhật giao diện hiển thị gợi ý voucher
      setTimeout(() => {
        findBestVoucherAndSuggest(hoaDonId);
      }, 300);

      return updatedOrder;
    } catch (error) {
      console.error("Lỗi khi tự động áp dụng voucher:", error);
      message.error({
        content:
          "Không thể áp dụng mã giảm giá tự động: " +
          (error.response?.data?.message || error.message),
        key: "applying-best-voucher",
      });
    }
  };

  const handleCashAmountChange = (hoaDonId, cashAmount) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.key === hoaDonId
          ? {
              ...tab,
              order: {
                ...tab.order,
                thanhToans: tab.order.thanhToans.map((p) =>
                  p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                    ? { ...p, soTien: cashAmount }
                    : p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                    ? {
                        ...p,
                        soTien: Math.max(
                          0,
                          totals[hoaDonId]?.finalTotal - cashAmount
                        ),
                      }
                    : p
                ),
              },
            }
          : tab
      )
    );

    // Tự động tạo QR nếu khách chọn chuyển khoản
    const transferAmount = Math.max(
      0,
      totals[hoaDonId]?.finalTotal - cashAmount
    );
    if (transferAmount > 0) {
      generateQR(hoaDonId, transferAmount);
    }
  };

  const renderPaymentSection = (order) => {
    const orderTotals = totals[order.id] || calculateOrderTotals(order.id);
    if (!orderTotals) return null;

    const { change, remaining } = calculateChange(order.id);

    // Kiểm tra khách chọn tiền mặt hay không
    const hasCash = order.thanhToans.some(
      (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
    );
    const hasQR = order.thanhToans.some(
      (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
    );

    return (
      <div style={{ maxWidth: 400, marginLeft: "auto" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Divider style={{ margin: "12px 0" }} />

          {/* Nếu khách chọn tiền mặt, hiển thị ô nhập */}
          {hasCash && (
            <Row justify="space-between" align="middle">
              <Col span={10}>
                <Text>Tiền mặt:</Text>
              </Col>
              <Col span={14}>
                <InputNumber
                  style={{ width: "100%" }}
                  value={customerPayment[order.id] || 0}
                  onChange={(value) => {
                    setCustomerPayment((prev) => ({
                      ...prev,
                      [order.id]: value || 0,
                    }));

                    // Tự động tính toán số tiền chuyển khoản
                    const transferAmount = Math.max(
                      0,
                      orderTotals.finalTotal - value
                    );
                    setTabs((prev) =>
                      prev.map((tab) =>
                        tab.key === order.id
                          ? {
                              ...tab,
                              order: {
                                ...tab.order,
                                thanhToans: tab.order.thanhToans.map((p) =>
                                  p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                                    ? { ...p, soTien: transferAmount }
                                    : p
                                ),
                              },
                            }
                          : tab
                      )
                    );

                    // Tạo QR cho chuyển khoản ngay sau khi nhập tiền mặt
                    if (transferAmount > 0) {
                      generateQR(order.id, transferAmount);
                    }
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  step={1000}
                />
              </Col>
            </Row>
          )}

          {/* Hiển thị mã QR nếu khách chọn chuyển khoản */}
          {hasQR && qrCode && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Text strong>Quét mã để thanh toán:</Text>
              <img
                src={qrCode}
                alt="QR Code"
                style={{ width: 200, marginTop: 8 }}
              />
            </div>
          )}
        </Space>
      </div>
    );
  };

  // Update useEffect for tab changes to ensure totals are calculated
  useEffect(() => {
    if (activeKey) {
      if (!priceChangesConfirmed[activeKey]) {
        // Kiểm tra thay đổi giá mà không hiển thị loading
        checkPriceChanges(false);
      } else {
        // Nếu đã xác nhận trước đó, đảm bảo UI không hiện cảnh báo
        setPriceNeedsConfirmation(false);
      }
      setPagination({ current: 1, pageSize: 4 });
      fetchInvoiceProducts(activeKey).then(() => {
        setTimeout(() => {
          const newTotals = calculateOrderTotals(activeKey);
          setTotals((prev) => ({
            ...prev,
            [activeKey]: newTotals,
          }));
          findBestVoucherAndSuggest(activeKey); // Add this line
        }, 300); // Đợi API trả dữ liệu rồi cập nhật
      });
    }
  }, [activeKey]);

  // Add new function to find best voucher
  const findBestVoucher = async (hoaDonId, totalAmount) => {
    try {
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalAmount}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      const availableVouchers = response.data;

      if (!availableVouchers || availableVouchers.length === 0) return null;

      // 1️⃣ Lọc danh sách voucher hợp lệ (đơn hàng đạt điều kiện tối thiểu)
      const validVouchers = availableVouchers.filter(
        (voucher) => totalAmount >= voucher.giaTriToiThieu
      );

      if (validVouchers.length === 0) return null;

      // 2️⃣ Tìm voucher có mức giảm giá cao nhất
      return validVouchers.reduce((best, current) => {
        const currentDiscount = calculateDiscountAmount(current, totalAmount);
        const bestDiscount = best
          ? calculateDiscountAmount(best, totalAmount)
          : 0;
        return currentDiscount > bestDiscount ? current : best;
      }, null);
    } catch (error) {
      console.error("Lỗi khi tìm mã giảm giá tốt nhất:", error);
      return null;
    }
  };

  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const response = await api.get(
        "/api/admin/phuong-thuc-thanh-toan/bank-and-cash",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      setPaymentMethods(response.data);
    } catch (error) {
      message.error("Lỗi khi tải phương thức thanh toán");
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const PreviewModal = () => (
    <AntdModal
      open={previewOpen}
      onCancel={() => {
        setPreviewOpen(false);
        if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }}
      width="70%"
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
        height="1200"
        style={{ border: "none" }}
        title="PDF Preview"
      />
    </AntdModal>
  );

  // Thay thế useEffect hiện tại với đoạn code tối ưu
  useEffect(() => {
    // Chỉ gọi khi thực sự cần thiết
    if (activeKey) {
      const currentProducts = orderProducts[activeKey] || [];
      const currentOrder = tabs.find((tab) => tab.key === activeKey)?.order;

      // Chỉ gọi khi có sản phẩm và đơn hàng
      if (currentProducts.length > 0 && currentOrder) {
        findBestVoucherAndSuggest(activeKey);
      } else {
        // Ẩn gợi ý voucher khi không còn sản phẩm
        setVoucherSuggestions({ show: false, betterVouchers: [] });

        // Nếu không còn sản phẩm nhưng vẫn còn voucher, xóa voucher khỏi đơn hàng
        if (currentProducts.length === 0 && currentOrder?.phieuGiamGia) {
          handleRemoveVoucher(activeKey, false).then(() => {
            // Cập nhật UI sau khi xóa voucher
            setTabs((prev) =>
              prev.map((tab) =>
                tab.key === activeKey
                  ? {
                      ...tab,
                      order: {
                        ...tab.order,
                        phieuGiamGia: null,
                        giamGia: 0,
                      },
                    }
                  : tab
              )
            );
          });
        }
      }
    }

    // Cleanup function để hủy các request đang chờ khi unmount
    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
      debouncedFindBestVoucher.cancel();
    };
  }, [
    activeKey,
    // Chỉ theo dõi những thay đổi quan trọng
    JSON.stringify(
      orderProducts[activeKey]?.map((p) => ({ id: p.id, soLuong: p.soLuong }))
    ),
    tabs.find((tab) => tab.key === activeKey)?.order?.phieuGiamGia?.id,
  ]);

  // Thêm hàm fetchInvoiceById để tải lại thông tin hóa đơn từ server
  const fetchInvoiceById = async (hoaDonId) => {
    if (!hoaDonId) return null;

    try {
      setLoading(true);

      // Store current data from UI before fetching
      const currentTab = tabs.find((tab) => tab.key === hoaDonId);
      const currentCustomerInfo = currentTab?.order?.khachHang;
      const currentRecipientName = currentTab?.order?.tenNguoiNhan;
      const currentPhone = currentTab?.order?.soDienThoai;

      console.log("[DEBUG] Thông tin trước fetchInvoice:", {
        customer: currentCustomerInfo,
        recipientName: currentRecipientName,
        phone: currentPhone,
      });

      // Fetch invoice data from server
      const response = await axios.get(
        `http://localhost:8080/api/admin/hoa-don/${hoaDonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const invoiceData = response.data;

      // Prioritize server data but fallback to current data if missing
      // IMPORTANT: Use consistent conditional logic to handle null/empty values
      const updatedCustomer = invoiceData.khachHang || currentCustomerInfo;

      // For recipient name, check if server data exists AND is not empty
      let updatedRecipientName = currentRecipientName; // Default to current value
      if (invoiceData.tenNguoiNhan && invoiceData.tenNguoiNhan.trim() !== "") {
        updatedRecipientName = invoiceData.tenNguoiNhan;
      } else if (updatedCustomer?.tenKhachHang) {
        // If no server value and we have a customer, use customer name
        updatedRecipientName = updatedCustomer.tenKhachHang;
      }

      // For phone number, check if server data exists AND is not empty
      let updatedPhone = currentPhone; // Default to current value
      if (invoiceData.soDienThoai && invoiceData.soDienThoai.trim() !== "") {
        updatedPhone = invoiceData.soDienThoai;
      } else if (updatedCustomer?.soDienThoai) {
        // If no server value and we have a customer, use customer phone
        updatedPhone = updatedCustomer.soDienThoai;
      }

      console.log("[DEBUG] Thông tin sau khi nhận từ API:", {
        serverCustomer: invoiceData.khachHang,
        serverRecipient: invoiceData.tenNguoiNhan,
        serverPhone: invoiceData.soDienThoai,
        finalCustomer: updatedCustomer,
        finalRecipient: updatedRecipientName,
        finalPhone: updatedPhone,
      });

      // Update UI with merged data
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.key === hoaDonId) {
            return {
              ...tab,
              order: {
                ...invoiceData,
                khachHang: updatedCustomer,
                tenNguoiNhan: updatedRecipientName || "",
                soDienThoai: updatedPhone || "",
              },
            };
          }
          return tab;
        })
      );

      // Update selectedCustomer state if customer exists
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }

      // Return updated data
      return {
        ...invoiceData,
        khachHang: updatedCustomer,
        tenNguoiNhan: updatedRecipientName || "",
        soDienThoai: updatedPhone || "",
      };
    } catch (error) {
      console.error(`Error fetching invoice ${hoaDonId}:`, error);
      message.error("Lỗi khi tải thông tin hóa đơn");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm sắp xếp voucher theo số tiền tiết kiệm được
  const sortVouchersBySavings = (voucherList, totalAmount) => {
    if (!voucherList || !Array.isArray(voucherList)) return [];

    return [...voucherList].sort((a, b) => {
      const savingsA = calculateDiscountAmount(a, totalAmount);
      const savingsB = calculateDiscountAmount(b, totalAmount);
      return savingsB - savingsA; // Sắp xếp giảm dần theo số tiền giảm giá
    });
  };

  // Thêm hàm xử lý áp dụng voucher khi nhấn nút OK
  const handleApplyVoucher = () => {
    if (selectedVoucher && activeKey) {
      handleVoucherSelected(activeKey, selectedVoucher.id);
    }
  };

  // Hàm xử lý khi quét mã QR thành công
  const handleQrScanSuccess = async (qrData) => {
    try {
      // Kiểm tra ID hóa đơn
      if (!scanningForHoaDonId) {
        message.error("Không xác định được hóa đơn đang xử lý");
        setIsQrScannerVisible(false);
        return;
      }

      // Hiển thị trạng thái đang xử lý
      const loadingKey = "qrScanning";
      message.loading({
        content: "Đang tìm sản phẩm...",
        key: loadingKey,
        duration: 0,
      });
      setLoading(true);

      // Gọi API với mã sản phẩm chi tiết
      const response = await api.get(
        `/api/admin/sanpham/sanphamchitiet/ma/${qrData}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response?.data) {
        throw new Error("Không tìm thấy sản phẩm từ mã QR");
      }

      const product = response.data;
      message.destroy(loadingKey);

      // Kiểm tra tồn kho
      if (product.soLuong <= 0 || product.soLuongTonKho <= 0) {
        notification.warning({
          key: "stockWarning",
          message: "Sản phẩm đã hết hàng",
          description: `Sản phẩm "${product.tenSanPham}" hiện không còn trong kho.`,
          icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
          placement: "topRight",
          duration: 4,
        });
        setLoading(false);
        return;
      }

      // Animation trước khi thêm sản phẩm
      const successKey = "addProductSuccess";
      message.loading({
        content: "Đang thêm sản phẩm...",
        key: successKey,
        duration: 0.5,
      });

      // Thêm sản phẩm vào hóa đơn
      await handleAddProductToOrder(product);
      message.destroy(successKey);

      // Thông báo thành công
      notification.success({
        message: "Đã thêm sản phẩm vào hóa đơn",
        description: (
          <div>
            <div style={{ fontWeight: "bold" }}>{product.tenSanPham}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <span>
                Mã: {product.maSanPhamChiTiet || product.maSanPham || "N/A"}
              </span>
              <span style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                {formatCurrency(product.gia)}
              </span>
            </div>
            {product.mauSac && product.kichThuoc && (
              <div style={{ marginTop: 3, fontSize: "12px", color: "#8c8c8c" }}>
                {typeof product.mauSac === "string"
                  ? product.mauSac
                  : product.mauSac?.tenMau || "N/A"}{" "}
                -
                {typeof product.kichThuoc === "string"
                  ? product.kichThuoc
                  : product.kichThuoc?.tenKichThuoc || "N/A"}
              </div>
            )}
          </div>
        ),
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Đóng modal quét QR trước khi hiển thị modal xác nhận
      setIsQrScannerVisible(false);

      // Sau khi đóng modal quét QR, hiển thị modal hỏi người dùng
      setTimeout(() => {
        Modal.confirm({
          title: "Quét thành công!",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          content: "Bạn có muốn tiếp tục quét sản phẩm?",
          okText: "Tiếp tục",
          cancelText: "Đóng",
          onOk: () => {
            // Mở lại modal quét QR
            setIsQrScannerVisible(true);
          },
          onCancel: () => {
            // Không làm gì, vì modal QR đã đóng
          },
          autoFocusButton: "ok",
          centered: true,
        });
      }, 300); // Chờ một chút để đảm bảo modal quét QR đã đóng hoàn toàn
    } catch (error) {
      console.error("Lỗi khi xử lý mã QR:", error);

      // Thông báo lỗi chi tiết hơn
      let errorMessage = "Không tìm thấy sản phẩm từ mã QR hoặc có lỗi xảy ra";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      notification.error({
        message: "Lỗi quét mã QR",
        description: errorMessage,
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Đóng modal quét QR trong trường hợp lỗi
      setIsQrScannerVisible(false);
    } finally {
      setLoading(false);
    }
  };
  // Xử lý khi có lỗi quét QR
  const handleQrScanError = (error) => {
    message.error("Lỗi khi quét mã QR, vui lòng thử lại");
  };

  // Mở màn hình quét QR cho hóa đơn cụ thể
  const openQrScanner = (hoaDonId) => {
    setScanningForHoaDonId(hoaDonId);
    setIsQrScannerVisible(true);
  };

  return (
    <Layout
      style={{ height: "100vh", boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)" }}
    >
      <Sider
        width="100%"
        style={{
          background: "#fff",
          padding: 20,
          position: "relative",
          height: "100%",
          overflowY: "hidden", // Ngăn scroll toàn bộ Sider
        }}
      >
        {/* Dòng chứa Nút "Tạo hóa đơn" */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={20}>
            <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
              Quản lý bán hàng
            </Text>
          </Col>
          <Col span={4}>
            <Button
              onClick={addTab}
              type="primary"
              style={{
                zIndex: 1,
              }}
            >
              <IoIosAddCircle />
              Tạo đơn hàng mới
            </Button>
          </Col>
        </Row>

        {/* Khi không có hóa đơn nào, hiển thị thông báo */}
        {tabs.length === 0 ? (
          <Row
            justify="center"
            align="middle"
            style={{ height: "calc(100% - 60px)" }}
          >
            <Col>
              <Title level={3}>
                Không có hóa đơn ở trạng thái chờ xác nhận
              </Title>
            </Col>
          </Row>
        ) : (
          <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
            <Tabs
              hideAdd
              type="editable-card"
              onChange={handleTabChange}
              activeKey={activeKey}
              onEdit={handleEditTab}
              items={items}
            />
          </div>
        )}
      </Sider>
      <Content
        style={{
          padding: 24,
          height: "100%",
          overflow: "hidden",
        }}
      />

      {/* Customer Selection Dialog */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <span style={{ fontSize: 20, fontWeight: "bold" }}>
              Chọn khách hàng
            </span>
          </div>
        }
        open={openCustomerDialog}
        onCancel={() => setOpenCustomerDialog(false)}
        footer={null}
        width={750}
        className="customer-selection-modal"
        styles={{ body: { padding: 24, paddingTop: 0 } }}
        style={{ top: 40 }}
      >
        {/* Ô tìm kiếm */}
        <Input
          placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
          allowClear
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          onChange={(e) => {
            const searchValue = e.target.value.toLowerCase();
            if (!searchValue) {
              loadCustomers();
            } else {
              const filtered = customers.filter(
                (customer) =>
                  customer.tenKhachHang?.toLowerCase().includes(searchValue) ||
                  customer.soDienThoai?.toLowerCase().includes(searchValue) ||
                  customer.email?.toLowerCase().includes(searchValue)
              );
              setCustomers(filtered);
            }
          }}
          style={{ marginBottom: 24 }}
          size="large"
        />

        {/* Danh sách khách hàng */}
        <List
          dataSource={customers}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy khách hàng"
              />
            ),
          }}
          pagination={{
            pageSize: 5,
            size: "small",
            position: "bottom",
            align: "center",
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} khách hàng`,
          }}
          itemLayout="horizontal"
          renderItem={(customer) => (
            <List.Item
              style={{
                padding: 20,
                marginBottom: 12,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s",
                border: "1px solid #f0f0f0",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={customer.avatar}
                    size={64}
                    style={{
                      backgroundColor: "#1890ff",
                      fontSize: 20,
                      textTransform: "uppercase",
                    }}
                  >
                    {!customer.avatar && customer.tenKhachHang?.charAt(0)}
                  </Avatar>
                }
                title={
                  <Text strong style={{ fontSize: 16 }}>
                    {customer.tenKhachHang}
                  </Text>
                }
                description={
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {customer.soDienThoai && (
                      <Text type="secondary">
                        <PhoneOutlined style={{ marginRight: 6 }} />
                        {customer.soDienThoai}
                      </Text>
                    )}
                    {customer.email && (
                      <Text type="secondary">
                        <MailOutlined style={{ marginRight: 6 }} />
                        {customer.email}
                      </Text>
                    )}
                  </div>
                }
              />
              <Button
                type="primary"
                ghost
                icon={<SelectOutlined />}
                style={{
                  borderRadius: 8,
                  transition: "all 0.3s",
                }}
                onClick={() => handleCustomerSelected(activeKey, customer.id)}
              >
                Chọn
              </Button>
            </List.Item>
          )}
        />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 32,
          }}
        >
          <Button onClick={() => setOpenCustomerDialog(false)} size="large">
            Đóng
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            onClick={() => {
              setOpenCustomerDialog(false);
              handleAddNewCustomer();
            }}
          >
            Thêm khách hàng mới
          </Button>
        </div>
      </Modal>

      {/* Voucher Selection Dialog */}
      <Modal
        title="Chọn mã giảm giá"
        open={openVoucherDialog}
        onCancel={() => setOpenVoucherDialog(false)}
        onOk={handleApplyVoucher}
        okText="Áp dụng"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedVoucher }}
        centered
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Gợi ý mã giảm giá tốt nhất cho đơn hàng của bạn:
          </Text>
        </div>
        <List
          dataSource={sortVouchersBySavings(
            vouchers,
            totals[activeKey]?.totalBeforeVoucher || 0
          )}
          renderItem={(voucher, index) => {
            const originalTotal = totals[activeKey]?.totalBeforeVoucher || 0;
            const currentTotal = originalTotal;
            const discountAmount = calculateDiscountAmount(
              voucher,
              Math.max(currentTotal, voucher.giaTriToiThieu)
            );
            const savings = ((discountAmount / originalTotal) * 100).toFixed(1);
            const maxDiscount = vouchers.reduce((max, v) => {
              const vDiscount = calculateDiscountAmount(v, originalTotal);
              return Math.max(max, vDiscount);
            }, 0);
            const isHighestDiscount = discountAmount === maxDiscount;
            const isSelected = selectedVoucher?.id === voucher.id;

            return (
              <List.Item
                style={{
                  border: isSelected
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "8px",
                  position: "relative",
                  backgroundColor: isSelected ? "#f0f5ff" : "white",
                }}
                actions={[
                  <Radio
                    checked={isSelected}
                    onChange={() => setSelectedVoucher(voucher)}
                  />,
                ]}
              >
                {isHighestDiscount && (
                  <Tag
                    color="gold"
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "16px",
                      padding: "4px 8px",
                      zIndex: 1,
                    }}
                  >
                    Tiết kiệm nhất
                  </Tag>
                )}
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{voucher.maPhieuGiamGia}</Text>
                      <Text type="success">Tiết kiệm {savings}%</Text>
                    </Space>
                  }
                  description={
                    <div>
                      <div>
                        {voucher.loaiPhieuGiamGia === 1
                          ? `Giảm ${
                              voucher.giaTriGiam
                            }% (tối đa ${formatCurrency(
                              voucher.soTienGiamToiDa
                            )})`
                          : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
                      </div>
                      <div>Tên phiếu giảm giá: {voucher.tenPhieuGiamGia}</div>
                      <div>Số lượng: {voucher.soLuong}</div>

                      <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                        Số tiền giảm: {formatCurrency(discountAmount)}
                      </div>
                      <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                        Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
          locale={{ emptyText: "Không có mã giảm giá khả dụng" }}
        />
      </Modal>
      {/* Modal quets qr thanh toán */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <QrcodeOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            <span>Quét mã QR để thanh toán</span>
          </div>
        }
        open={isModalPaymentQR}
        onCancel={modalHandlers.onCancel}
        footer={[
          <Button key="cancel" onClick={modalHandlers.onCancel}>
            Đóng
          </Button>,
          <Button
            key="check"
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => {
              if (activeKey) {
                // Lấy thông tin thanh toán chuyển khoản
                const order = tabs.find((tab) => tab.key === activeKey)?.order;
                const transferPayment = order?.thanhToans?.find(
                  (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                );

                if (transferPayment && transferPayment.soTien > 0) {
                  message.loading("Đang kiểm tra thanh toán...", 1.5);

                  setTimeout(() => {
                    checkPayment(activeKey, transferPayment.soTien).then(
                      (isPaid) => {
                        if (isPaid) {
                          message.success("Thanh toán đã được xác nhận!");
                          setIsModalVisiblePaymentQR(false);
                          // Tiếp tục quá trình xác nhận đơn hàng sau khi thanh toán thành công
                          handleConfirmOrder(activeKey);
                        } else {
                          message.error(
                            "Chưa nhận được thanh toán, vui lòng thử lại!"
                          );
                        }
                      }
                    );
                  }, 1500);
                }
              }
            }}
          >
            Kiểm tra thanh toán
          </Button>,
        ]}
        centered
        width={400}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 15,
              background: "#f0f7ff",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            Số tiền:{" "}
            <span style={{ color: "#1890ff" }}>
              {activeKey &&
                (() => {
                  const order = tabs.find(
                    (tab) => tab.key === activeKey
                  )?.order;
                  const transferPayment = order?.thanhToans?.find(
                    (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                  );
                  return formatCurrency(transferPayment?.soTien || 0);
                })()}
            </span>
          </div>

          {qrCode && (
            <div
              style={{
                padding: "10px",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: 15,
              }}
            >
              <img
                src={qrCode}
                alt="QR Code"
                style={{
                  width: "100%",
                  maxWidth: 280,
                  margin: "0 auto",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}

          <Alert
            message="Hướng dẫn thanh toán"
            description={
              <ol style={{ textAlign: "left", paddingLeft: "20px" }}>
                <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                <li>Quét mã QR này bằng ứng dụng</li>
                <li>Xác nhận thông tin và số tiền thanh toán</li>
                <li>Hoàn tất giao dịch</li>
              </ol>
            }
            type="info"
            showIcon
            style={{ marginTop: 10, textAlign: "left" }}
          />
        </div>
      </Modal>
      {/* Add ProductTable component */}
      <ProductTable
        products={products}
        onAddProduct={handleAddProductToOrder}
        onAddMultipleProducts={handleAddMultipleProducts}
        open={openProductTable}
        onClose={() => setOpenProductTable(false)}
      />
      {/* Modal thêm khách hàng mới */}
      <Modal
        title="Thêm khách hàng mới"
        open={isCreateCustomerModalVisible}
        onCancel={handleCloseCreateCustomerModal}
        width={800}
        footer={null}
        destroyOnClose={true}
      >
        <CustomerFormWrapper
          onCustomerCreated={(newCustomerData) => {
            if (newCustomerData) {
              refreshCustomers(newCustomerData);
            }
            handleCloseCreateCustomerModal();
          }}
        />
      </Modal>
      {/* Add PreviewModal component */}
      <PreviewModal />

      {/* QR Scanner Modal */}
      <Modal
        title="Quét mã QR sản phẩm"
        open={isQrScannerVisible}
        onCancel={() => setIsQrScannerVisible(false)}
        destroyOnClose={true} // Hủy Modal khi đóng để tránh lặp
        footer={[
          <Button key="cancel" onClick={() => setIsQrScannerVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <QrScanner
          onScanSuccess={handleQrScanSuccess}
          onScanError={handleQrScanError}
          isActive={isQrScannerVisible}
        />
      </Modal>
      {/* Modal xác nhận thay đổi giá */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#fff2f0",
                padding: "8px",
                borderRadius: "50%",
                display: "inline-flex",
                marginRight: "12px",
              }}
            >
              <WarningOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                Cảnh báo thay đổi giá sản phẩm
              </div>
              <div style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.65)" }}>
                Có {changedProducts.length} sản phẩm đã thay đổi giá so với khi
                thêm vào đơn hàng
              </div>
            </div>
          </div>
        }
        open={openPriceChangeDialog}
        onCancel={() => setOpenPriceChangeDialog(false)}
        width={900}
        styles={{
          body: { padding: "16px", maxHeight: "70vh", overflow: "auto" },
        }}
        centered
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Checkbox
                checked={updateAllPrices}
                onChange={(e) => setUpdateAllPrices(e.target.checked)}
              >
                <Text strong>Áp dụng giá mới cho tất cả sản phẩm</Text>
              </Checkbox>

              {priceChangeAmount !== 0 && (
                <div style={{ marginTop: "8px" }}>
                  <Text type={priceChangeAmount > 0 ? "danger" : "success"}>
                    {priceChangeAmount > 0 ? "Tăng giá: +" : "Giảm giá: "}
                    {formatCurrency(Math.abs(priceChangeAmount))}
                  </Text>
                </div>
              )}
            </div>
            <Space>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setOpenPriceChangeDialog(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={() => handleUpdateAllPrices(false)}
                style={{ margin: "0 8px" }}
              >
                Giữ tất cả giá ban đầu
              </Button>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => handleUpdateAllPrices(true)}
              >
                Cập nhật tất cả giá mới
              </Button>
            </Space>
          </div>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={changedProducts}
          renderItem={(product) => (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
              }}
              styles={{ body: { padding: 16 } }}
            >
              <List.Item
                style={{ padding: 0 }}
                actions={[
                  <Button
                    key="keep-old-price"
                    onClick={() => handleUpdateProductPrice(product.id, false)}
                    style={{ width: 120 }}
                  >
                    Giữ giá cũ
                  </Button>,
                  <Button
                    key="use-new-price"
                    type="primary"
                    onClick={() => handleUpdateProductPrice(product.id, true)}
                    style={{ width: 120 }}
                  >
                    Dùng giá mới
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        overflow: "hidden",
                        borderRadius: "4px",
                        marginRight: "16px",
                        border: "1px solid #eee",
                      }}
                    >
                      <img
                        src={
                          product.hinhAnh && product.hinhAnh.length > 0
                            ? product.hinhAnh[0]
                            : "https://via.placeholder.com/80x80?text=No+Image"
                        }
                        alt={product.tenSanPham}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  title={
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span>{product.tenSanPham}</span>
                      <Text
                        type="secondary"
                        style={{ fontSize: "13px", marginLeft: "8px" }}
                      >
                        #{product.maSanPhamChiTiet || ""}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div>
                          <span style={{ color: "#666" }}>Màu: </span>
                          <span>{product.mauSac || "---"}</span>
                          {product.maMauSac && (
                            <div
                              style={{
                                display: "inline-block",
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                backgroundColor: product.maMauSac,
                                verticalAlign: "middle",
                                marginLeft: "5px",
                                border: "1px solid rgba(0, 0, 0, 0.1)",
                              }}
                            />
                          )}
                        </div>
                        <Divider type="vertical" style={{ margin: "0 12px" }} />
                        <div>
                          <span style={{ color: "#666" }}>Kích thước: </span>
                          <span>{product.kichThuoc || "---"}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "8px",
                        }}
                      >
                        <div>
                          <div style={{ marginBottom: "4px" }}>
                            <Text
                              delete
                              type="secondary"
                              style={{ fontSize: "14px" }}
                            >
                              Giá cũ:{" "}
                              {formatCurrency(product.giaTaiThoiDiemThem)}
                            </Text>
                          </div>
                          <div>
                            <Text
                              type="danger"
                              strong
                              style={{ fontSize: "16px" }}
                            >
                              Giá mới: {formatCurrency(product.giaHienTai)}
                            </Text>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Tag
                            color={product.chenhLech > 0 ? "red" : "green"}
                            style={{
                              padding: "4px 8px",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            {product.chenhLech > 0
                              ? `Tăng ${formatCurrency(
                                  Math.abs(product.chenhLech)
                                )}`
                              : `Giảm ${formatCurrency(
                                  Math.abs(product.chenhLech)
                                )}`}
                          </Tag>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            {product.chenhLech > 0
                              ? `+${(
                                  (Math.abs(product.chenhLech) /
                                    product.giaTaiThoiDiemThem) *
                                  100
                                ).toFixed(1)}%`
                              : `-${(
                                  (Math.abs(product.chenhLech) /
                                    product.giaTaiThoiDiemThem) *
                                  100
                                ).toFixed(1)}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            </Card>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default BanHang;
