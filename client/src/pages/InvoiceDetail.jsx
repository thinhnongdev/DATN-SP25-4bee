import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ProductTable from "../components/HoaDon/ProductTable";
import {
  Layout,
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Select,
  Row,
  Col,
  Table,
  Tooltip,
  Space,
  Divider,
  Steps,
  Tag,
  List,
  Radio,
  Spin,
  Form,
  Carousel,
  InputNumber,
  Popconfirm,
  Image,
  Checkbox,
  message,
  notification,
  Alert,
  Badge,
} from "antd";
import {
  EditOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  HistoryOutlined,
  CloseOutlined,
  TagOutlined,
  ReloadOutlined,
  SyncOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  WalletOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  RollbackOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
} from "@mui/material";
import { formatDate, formatCurrency } from "../utils/format";
import { StatusChip, TypeChip } from "../components/StatusChip";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const steps = [
  { label: "Chờ xác nhận", status: 1 },
  { label: "Đã xác nhận", status: 2 },
  { label: "Chuẩn bị giao hàng", status: 3 },
  { label: "Đang giao", status: 4 },
  { label: "Hoàn thành", status: 5 },
  { label: "Đã hủy", status: 6 },
];

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [editVoucherDialog, setEditVoucherDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");
  const [note, setNote] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [openEditRecipientDialog, setOpenEditRecipientDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [nextStatus, setNextStatus] = useState(null);
  const [cartChanged, setCartChanged] = useState(false);
  const [bestVoucher, setBestVoucher] = useState(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
  const token = localStorage.getItem("token");
  const [trackingAddressLoading, setTrackingAddressLoading] = useState(false);
  const [addressDataLoaded, setAddressDataLoaded] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [statusTimestamps, setStatusTimestamps] = useState({});
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [editRecipientDialogOpen, setEditRecipientDialogOpen] = useState(false);
  const [editRecipientLoading, setEditRecipientLoading] = useState(false);
  const [checkingPrice, setCheckingPrice] = useState(false);
  const [priceNeedsConfirmation, setPriceNeedsConfirmation] = useState(false);
  const [email, setEmail] = useState(invoice?.emailNguoiNhan || "");
  const [detailAddress, setDetailAddress] = useState("");
  const [openPriceChangeDialog, setOpenPriceChangeDialog] = useState(false);
  const [changedProducts, setChangedProducts] = useState([]);
  const [shippingFeeFromGHN, setShippingFeeFromGHN] = useState(null);
  const [loadingShippingFee, setLoadingShippingFee] = useState(false);
  const [updateAllPrices, setUpdateAllPrices] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [historySearchText, setHistorySearchText] = useState("");
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [actionHistorySearchText, setActionHistorySearchText] = useState("");
  const [hasExcessPayment, setHasExcessPayment] = useState(false);
  const [excessPaymentAmount, setExcessPaymentAmount] = useState(0);
  const [showExcessPaymentRefundDialog, setShowExcessPaymentRefundDialog] =
    useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingStatusChange, setProcessingStatusChange] = useState(false);
  const [editRecipientValues, setEditRecipientValues] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });
  const [priceChangeAmount, setPriceChangeAmount] = useState(0); // Số tiền thay đổi (+: cần thu thêm, -: hoàn lại)
  const [showPriceChangePaymentDialog, setShowPriceChangePaymentDialog] =
    useState(false); // Modal xử lý thanh toán khi thay đổi giá
  const [processingPriceChangePayment, setProcessingPriceChangePayment] =
    useState(false); // Loading state
  const renderPaymentMethodStatus = (payment) => {
    if (payment.trangThai === 2) {
      return <Tag color="orange">Chờ thanh toán</Tag>;
    } else if (payment.trangThai === 3) {
      return <Tag color="purple">Trả sau</Tag>;
    } else if (payment.trangThai === 1) {
      return <Tag color="green">Đã thanh toán</Tag>;
    } else if (payment.trangThai === 4) {
      return <Tag color="red">Hoàn tiền</Tag>;
    }
    return <Tag>Không xác định</Tag>;
  };
  // Add this state for predefined reasons
  const [predefinedReasons, setPredefinedReasons] = useState([
    "Khách hàng thay đổi quyết định sau khi đặt hàng",
    "Sản phẩm trong đơn hàng đã hết hàng tại kho",
    "Thông tin giao hàng không chính xác hoặc thiếu",
    "Không thể liên hệ được với khách hàng để xác nhận đơn",
    "Khách yêu cầu đổi sản phẩm khác nên cần hủy đơn cũ",
    "Sản phẩm không đáp ứng đúng kỳ vọng của khách hàng",
    "Khách hàng đã đặt nhầm sản phẩm, cần hủy đơn",
    "Đơn hàng bị lỗi hệ thống, không thể tiếp tục xử lý",
  ]);

  const [useCustomReason, setUseCustomReason] = useState(false);
  // Thêm các biến tính toán thanh toán
  const getPaymentSummary = () => {
    if (!paymentHistory || paymentHistory.length === 0) {
      return {
        actualPaidAmount: 0,
        refundedAmount: 0,
        pendingAmount: 0,
      };
    }

    // Đã thanh toán (chỉ tính status = 1)
    const actualPaidAmount = paymentHistory
      .filter((p) => p.trangThai === 1)
      .reduce((sum, p) => sum + p.tongTien, 0);

    // Đã hoàn tiền (status = 4)
    const refundedAmount = paymentHistory
      .filter((p) => p.trangThai === 4)
      .reduce((sum, p) => sum + p.tongTien, 0);

    // Đang chờ thanh toán/trả sau (status = 2 hoặc 3)
    const pendingAmount = paymentHistory
      .filter((p) => p.trangThai === 2 || p.trangThai === 3)
      .reduce((sum, p) => sum + p.tongTien, 0);

    return { actualPaidAmount, refundedAmount, pendingAmount };
  };
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "steps-custom-styles";

    styleElement.textContent = `
      /* Container chính cho Steps */
      .invoice-steps {
        padding: 32px 0 !important;
        margin: 0 auto !important;
        width: 100% !important;
      }
    
      /* Container cho từng Step */
      .ant-steps-item {
        padding: 0 12px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        min-width: 200px !important;
      }
  
      /* Icon container */
      .ant-steps-item-icon {
        width: 48px !important;
        height: 48px !important;
        line-height: 48px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto !important;
        position: relative !important;
        z-index: 2 !important;
      }
  
      /* Icon size */
      .ant-steps-item-icon .anticon {
        font-size: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        width: 100% !important;
      }
  
      /* Đường nối - Cách tiếp cận mới cho việc quay lại trạng thái */
      .ant-steps-item-tail::after {
        height: 2px !important;
        border-radius: 1px !important;
        margin: 0 !important;
        position: absolute !important;
        width: calc(100% - 24px) !important;
        left: -50% !important;
        background-color: #e8e8e8 !important; /* Màu xám mặc định */
        opacity: 1 !important;
      }
  
      /* Đường nối cho các bước đã hoàn thành */
      .ant-steps-item-finish .ant-steps-item-tail::after {
        background-color: #1890ff !important; /* Màu xanh */
        opacity: 1 !important;
      }
  
      /* Đường nối cho các bước sau trạng thái hiện tại */
      .ant-steps-item.ant-steps-next-error .ant-steps-item-tail::after {
        background-color: #e8e8e8 !important;
        opacity: 1 !important;
      }
  
      /* Vô hiệu hóa opacity transition */
      .ant-steps-item.ant-steps-item-wait,
      .ant-steps-item.ant-steps-item-process,
      .ant-steps-item.ant-steps-next-error {
        opacity: 1 !important;
      }
  
      .ant-steps-item.ant-steps-item-wait .ant-steps-item-tail::after,
      .ant-steps-item.ant-steps-item-process .ant-steps-item-tail::after,
      .ant-steps-item.ant-steps-next-error .ant-steps-item-tail::after {
        opacity: 1 !important;
      }
  
      /* Đảm bảo không có opacity transition */
      .ant-steps-item-tail::after {
        transition: background-color 0.3s !important;
        transition-property: background-color !important;
        transition-duration: 0.3s !important;
        transition-timing-function: ease !important;
        transition-delay: 0s !important;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById("steps-custom-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  useEffect(() => {
    if (
      invoice?.trangThai === 1 &&
      (invoice?.loaiHoaDon === 3 || invoice?.loaiHoaDon === 1)
    ) {
      const isFreeShipping = checkFreeShipping(totalBeforeDiscount);

      // Nếu đủ điều kiện miễn phí và phí vận chuyển khác 0, tự động cập nhật
      if (isFreeShipping && invoice.phiVanChuyen > 0) {
        calculateAndUpdateShippingFee(false);
      }
      // Thêm điều kiện kiểm tra: nếu không đủ điều kiện miễn phí nhưng phí vận chuyển = 0
      // Tức là trước đây đủ điều kiện, bây giờ không còn đủ nữa
      else if (!isFreeShipping && invoice.phiVanChuyen === 0) {
        calculateAndUpdateShippingFee(false);
      }
      // Nếu không đủ điều kiện miễn phí, nhưng có thay đổi đáng kể về giá sản phẩm
      else if (!isFreeShipping && priceChangeAmount !== 0) {
        // Tính lại phí vận chuyển sau 500ms để đảm bảo state đã cập nhật
        const timer = setTimeout(() => {
          calculateAndUpdateShippingFee(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [
    totalBeforeDiscount,
    invoice?.trangThai,
    invoice?.loaiHoaDon,
    invoice?.phiVanChuyen,
    priceChangeAmount,
  ]);
  useEffect(() => {
    if (showPriceChangePaymentDialog) {
      loadPaymentMethods();
    }
  }, [showPriceChangePaymentDialog]);
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "invoice-steps-styles";

    styleElement.textContent = `
      /* Thêm styles cho scrollbar */
      .invoice-steps-container::-webkit-scrollbar {
        height: 8px !important;
      }
  
      .invoice-steps-container::-webkit-scrollbar-track {
        background: #f0f0f0 !important;
        border-radius: 4px !important;
      }
  
      .invoice-steps-container::-webkit-scrollbar-thumb {
        background: #d9d9d9 !important;
        border-radius: 4px !important;
        transition: all 0.3s ease !important;
      }
  
      .invoice-steps-container::-webkit-scrollbar-thumb:hover {
        background: #bfbfbf !important;
      }
  
      /* Các styles cũ giữ nguyên */
      .invoice-steps {
        padding: 32px 0 !important;
        background: white !important;
        border-radius: 8px !important;
      }
  
      /* Đảm bảo các step không bị ảnh hưởng bởi scroll */
      .invoice-steps .ant-steps-item {
        padding: 0 12px !important;
        cursor: pointer !important;
        flex: none !important; /* Ngăn các step co giãn */
        min-width: 180px !important; /* Đặt chiều rộng tối thiểu cho mỗi step */
      }
      
      /* Thêm shadow cho cạnh khi scroll */
      .invoice-steps::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 30px;
        background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1));
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
  
      .invoice-steps::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 30px;
        background: linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,1));
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
  
      .invoice-steps-container.can-scroll-right .invoice-steps::after {
        opacity: 1;
      }
  
      .invoice-steps-container.can-scroll-left .invoice-steps::before {
        opacity: 1;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById("invoice-steps-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Thêm logic để kiểm tra và cập nhật trạng thái scroll
  useEffect(() => {
    const container = document.querySelector(".invoice-steps-container");
    if (!container) return;

    const checkScroll = () => {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight =
        container.scrollLeft < container.scrollWidth - container.clientWidth;

      container.classList.toggle("can-scroll-left", canScrollLeft);
      container.classList.toggle("can-scroll-right", canScrollRight);
    };

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll(); // Kiểm tra lần đầu

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const getAvailableStatuses = () => {
    // Nếu là hóa đơn tại quầy (loai 2), chỉ có 3 trạng thái
    if (invoice?.loaiHoaDon === 2) {
      return {
        1: "Chờ xác nhận",
        2: "Đã xác nhận",
        5: "Hoàn thành",
        6: "Đã hủy", // Vẫn giữ trạng thái hủy
      };
    }

    // Các loại hóa đơn khác có đầy đủ trạng thái
    return {
      1: "Chờ xác nhận",
      2: "Đã xác nhận",
      3: "Chờ giao hàng",
      4: "Đang giao hàng",
      5: "Hoàn thành",
      6: "Đã hủy",
    };
  };
  // Fixed version of calculatePriceChangeAmount
  const calculatePriceChangeAmount = (changedProducts) => {
    if (!changedProducts || changedProducts.length === 0) return 0;

    // Just calculate and return the value, don't update state here
    return changedProducts.reduce((total, product) => {
      const priceDifference =
        (product.giaHienTai - product.giaTaiThoiDiemThem) * product.soLuong;
      return total + priceDifference;
    }, 0);
  };

  // Use useEffect to update the state when changedProducts changes
  useEffect(() => {
    if (changedProducts && changedProducts.length > 0) {
      const amount = calculatePriceChangeAmount(changedProducts);
      setPriceChangeAmount(amount);
    }
  }, [changedProducts]);
  // 2. Cập nhật hàm getStatusText để phản ánh trạng thái đúng
  const getStatusText = (status) => {
    const statuses = getAvailableStatuses();
    return statuses[status] || "Không xác định";
  };
  const forceUpdate = () => {
    setForceUpdateCounter((prev) => prev + 1);
  };
  const addressCache = {
    provinces: new Map(),
    districts: new Map(),
    wards: new Map(),
  };
  // Hàm tải các phương thức thanh toán
  const loadPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await api.get("/api/admin/phuong-thuc-thanh-toan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setPaymentMethods(response.data);
        // Chọn mặc định phương thức thanh toán đầu tiên nếu có
        if (response.data.length > 0) {
          setSelectedPaymentMethod(response.data[0].maPhuongThucThanhToan);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải phương thức thanh toán:", error);
      message.error("Không thể tải danh sách phương thức thanh toán");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Cập nhật hàm tính số tiền còn thiếu
  const calculateRemainingPayment = () => {
    if (!invoice) return 0;

    console.log("Bắt đầu tính toán số tiền còn thiếu...");

    // Bỏ qua giá trị từ backend, luôn ưu tiên tính lại từ lịch sử thanh toán
    if (!paymentHistory || !Array.isArray(paymentHistory)) {
      console.log(
        "Không có lịch sử thanh toán, trả về tổng tiền hóa đơn:",
        invoice?.tongTien || 0
      );
      return invoice?.tongTien || 0;
    }

    // Tính tổng tiền hóa đơn bao gồm tất cả yếu tố
    const productTotal = totalBeforeDiscount || 0;
    const shippingFee = invoice.phiVanChuyen || 0;
    const discountAmount = getDiscountAmount();

    // Đảm bảo tổng tiền không âm
    const totalInvoiceAmount = Math.max(
      0,
      productTotal + shippingFee - discountAmount
    );

    // QUAN TRỌNG: Đảm bảo không tính trùng các khoản thanh toán
    const processedPaymentIds = new Set();

    // Tính số tiền đã thanh toán (tất cả trạng thái 1, 2 và 3)
    const paidAmount = paymentHistory.reduce((sum, p) => {
      // Bỏ qua các khoản thanh toán đã tính
      if (processedPaymentIds.has(p.id)) return sum;

      // Chỉ tính các khoản thanh toán có trạng thái hợp lệ
      if (p.trangThai === 1 || p.trangThai === 2 || p.trangThai === 3) {
        processedPaymentIds.add(p.id);
        console.log(
          `Tính khoản thanh toán: ${p.id}, ${p.tenPhuongThucThanhToan}, ${
            p.tongTien || p.soTien || 0
          }, trạng thái: ${p.trangThai}`
        );
        return sum + Number(p.tongTien || p.soTien || 0);
      }
      return sum;
    }, 0);

    // Tính số tiền đã hoàn lại (trạng thái = 4)
    const refundedAmount = paymentHistory.reduce((sum, p) => {
      // Bỏ qua các khoản thanh toán đã tính
      if (processedPaymentIds.has(p.id)) return sum;

      if (p.trangThai === 4) {
        processedPaymentIds.add(p.id);
        console.log(
          `Trừ khoản hoàn tiền: ${p.id}, ${p.tenPhuongThucThanhToan}, ${
            p.tongTien || p.soTien || 0
          }`
        );
        return sum + Number(p.tongTien || p.soTien || 0);
      }
      return sum;
    }, 0);

    // Số tiền thực tế đã thanh toán (đã trừ hoàn tiền)
    const actualPaidAmount = paidAmount - refundedAmount;

    // Số tiền còn thiếu = tổng tiền cần trả - số tiền thực tế đã thanh toán
    const remainingAmount = totalInvoiceAmount - actualPaidAmount;

    console.log("Tính lại số tiền còn thiếu:", {
      productTotal,
      shippingFee,
      discountAmount,
      totalInvoiceAmount,
      paidAmount,
      refundedAmount,
      actualPaidAmount,
      remainingAmount,
    });

    // Nếu có thanh toán thừa (số tiền còn thiếu âm), trả về 0
    return Math.max(0, Math.round(remainingAmount));
  };
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (paymentAmount <= 0) {
      message.error("Số tiền thanh toán không hợp lệ");
      return;
    }

    try {
      setProcessingPayment(true);
      const hideProcessing = message.loading("Đang xử lý thanh toán...", 0);
      // Chuẩn bị dữ liệu thanh toán
      const paymentData = {
        soTien: paymentAmount,
        thanhToanRequest: {
          maPhuongThucThanhToan: selectedPaymentMethod,
          soTien: paymentAmount,
          moTa:
            paymentHistory && paymentHistory.length > 0
              ? "Thanh toán bổ sung khi xác nhận đơn hàng"
              : "Thanh toán khi xác nhận đơn hàng",
        },
      };

      // Quan trọng: Gọi đến API thanh toán phụ phí, KHÔNG phải API update status
      const response = await api.post(
        `/api/admin/hoa-don/${id}/additional-payment`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật dữ liệu hóa đơn từ response
      setInvoice(response.data);

      // Đợi một chút để đảm bảo backend đã xử lý xong
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Làm mới dữ liệu thanh toán
      await fetchPaymentHistory();

      // Làm mới lịch sử đơn hàng
      await fetchOrderHistory();

      // Force update UI
      forceUpdate();

      // Đóng các modal và hiển thị thông báo
      setOpenPaymentModal(false);
      setOpenConfirmDialog(false);
      hideProcessing();
      message.success("Đã thanh toán thành công");
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      message.error(
        error.response?.data?.message || "Không thể xử lý thanh toán"
      );
    } finally {
      setProcessingPayment(false);
    }
  };
  const checkExcessPayment = async () => {
    try {
      // Kiểm tra nếu đang hiển thị dialog hoàn tiền thì không hiện thông báo
      if (showExcessPaymentRefundDialog) {
        return false;
      }

      // Tính toán số tiền thừa bằng cách sử dụng hàm calculateExcessAmount
      const excessAmount = calculateExcessAmount();

      // Cập nhật state với giá trị tính toán
      const hasExcess = excessAmount > 0;
      setHasExcessPayment(hasExcess);
      setExcessPaymentAmount(excessAmount);

      // Chỉ hiển thị thông báo nếu:
      // 1. Số tiền thừa đáng kể (>1000đ)
      // 2. Không đang hiển thị dialog xử lý hoàn tiền
      // 3. Chưa có thông báo tương tự đang hiển thị (sử dụng biến global/state để theo dõi)
      if (
        hasExcess &&
        excessAmount > 1000 &&
        !showExcessPaymentRefundDialog &&
        !window.excessNotificationShown
      ) {
        // Đánh dấu đã hiển thị thông báo
        window.excessNotificationShown = true;

        //   notification.warning({
        //     message: "Phát hiện thanh toán thừa",
        //     description: `Khách hàng đã thanh toán thừa ${formatCurrency(
        //       excessAmount
        //     )}. Bạn nên xử lý hoàn tiền.`,
        //     btn: (
        //       <Button
        //         type="primary"
        //         onClick={() => {
        //           handleShowRefundDialog(excessAmount);
        //           notification.destroy(); // Đóng tất cả notifications
        //         }}
        //       >
        //         Xử lý hoàn tiền
        //       </Button>
        //     ),
        //     key: "excess_payment_notification", // Thêm key để xác định unique notification
        //     duration: 0, // Không tự động đóng
        //     onClose: () => {
        //       // Reset trạng thái thông báo khi đóng
        //       window.excessNotificationShown = false;
        //     },
        //   });
      }

      return hasExcess;
    } catch (error) {
      console.error("Lỗi khi kiểm tra thanh toán thừa:", error);
      return false;
    }
  };
  // Thêm hàm này để tính toán chính xác số tiền thừa

  const calculateExcessAmount = () => {
    if (!paymentHistory || !invoice) return 0;

    console.log("Tính lại số tiền thừa:");

    // Tính tổng thực tế khách hàng cần thanh toán
    const productTotal = totalBeforeDiscount || 0;
    const shippingFee = invoice.phiVanChuyen || 0;
    const discountAmount = getDiscountAmount();

    // Tổng cuối cùng cần thanh toán (không âm)
    const actualTotalDue = Math.max(
      0,
      productTotal + shippingFee - discountAmount
    );
    console.log("Tổng thực tế cần thanh toán:", actualTotalDue);

    // Tính số tiền khách đã thanh toán (trạng thái = 1 - đã thanh toán)
    const totalPaid = paymentHistory.reduce((sum, p) => {
      if (p.trangThai === 1) {
        console.log(
          `Thanh toán đã tính: ${p.tongTien}, phương thức: ${p.tenPhuongThucThanhToan}`
        );
        return sum + (p.tongTien || 0);
      }
      return sum;
    }, 0);

    // Tính số tiền đã hoàn lại (trạng thái = 4 - hoàn tiền)
    const totalRefunded = paymentHistory.reduce((sum, p) => {
      if (p.trangThai === 4) {
        console.log(
          `Hoàn tiền đã tính: ${p.tongTien}, phương thức: ${p.tenPhuongThucThanhToan}`
        );
        return sum + (p.tongTien || 0);
      }
      return sum;
    }, 0);

    // Số tiền thực tế khách đã trả
    const actualPaid = totalPaid - totalRefunded;
    console.log("Số tiền thực tế đã trả:", actualPaid);
    console.log("Số tiền thực tế cần trả:", actualTotalDue);

    // Số tiền thừa (nếu có)
    const excess = Math.max(0, actualPaid - actualTotalDue);
    console.log("Số tiền thừa tính được:", excess);

    return Math.round(excess);
  };

  const [excessNotificationShown, setExcessNotificationShown] = useState(false);
  const checkAndShowExcessPaymentNotification = () => {
    if (
      !paymentHistory ||
      !invoice ||
      showExcessPaymentRefundDialog ||
      invoice.trangThai === 6
    ) {
      return;
    }

    // Tính toán số tiền thừa
    const excessAmount = calculateExcessAmount();

    // Cập nhật state
    const hasExcess = excessAmount > 0;
    setHasExcessPayment(hasExcess);
    setExcessPaymentAmount(excessAmount);

    // Chỉ hiển thị thông báo nếu có số tiền thừa đáng kể và chưa hiển thị trước đó
    if (excessAmount > 1000 && !excessNotificationShown) {
      setExcessNotificationShown(true);

      // Hiển thị thông báo nổi về tiền thừa
      notification.warning({
        key: "excess_payment_notification",
        message: "Phát hiện thanh toán thừa",
        description: `Khách hàng đã thanh toán thừa ${formatCurrency(
          excessAmount
        )}. Bạn nên xử lý hoàn tiền.`,
        btn: (
          <Button
            type="primary"
            onClick={() => {
              handleShowRefundDialog(excessAmount);
              notification.destroy("excess_payment_notification");
            }}
          >
            Xử lý hoàn tiền
          </Button>
        ),
        duration: 0,
        onClose: () => setExcessNotificationShown(false),
      });
    }
  };

  useEffect(() => {
    if (paymentHistory && paymentHistory.length > 0 && invoice?.tongTien) {
      // Tính toán số tiền thừa
      const excessAmount = calculateExcessAmount();

      // Chỉ cập nhật state
      setHasExcessPayment(excessAmount > 0);
      setExcessPaymentAmount(excessAmount);

      // Không hiển thị thông báo ở đây nữa
    }
  }, [paymentHistory, invoice?.tongTien]);

  const handleShowRefundDialog = (amount) => {
    // Đóng tất cả thông báo hiện tại
    notification.destroy("excess_payment_notification");

    // Reset trạng thái thông báo
    setExcessNotificationShown(false);

    // Tính toán lại số tiền thừa để đảm bảo chính xác
    const calculatedExcess = calculateExcessAmount();
    setExcessPaymentAmount(calculatedExcess);
    setSelectedPaymentMethod(null);
    loadPaymentMethods();
    setShowExcessPaymentRefundDialog(true);
  };

  const handleAdditionalPayment = async () => {
    if (!selectedPaymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (paymentAmount <= 0) {
      message.error("Số tiền thanh toán không hợp lệ");
      return;
    }

    try {
      setProcessingPayment(true);
      const hideLoading = message.loading(
        "Đang kiểm tra số tiền cần thanh toán...",
        0
      );

      // Tính lại số tiền còn thiếu để kiểm tra trước khi gửi request
      const remainingPayment = calculateRemainingPayment();
      console.log("Kiểm tra số tiền cần thanh toán:", {
        calculated: remainingPayment,
        requestAmount: paymentAmount,
      });

      // Nếu không còn thiếu tiền
      if (remainingPayment <= 0) {
        hideLoading();
        message.error(
          "Khách hàng đã thanh toán đủ. Không cần thanh toán thêm."
        );
        setProcessingPayment(false);
        setOpenPaymentModal(false);
        return;
      }

      // Nếu số tiền thanh toán vượt quá số tiền còn thiếu quá nhiều
      if (paymentAmount > remainingPayment * 1.1) {
        // cho phép vượt 10%
        hideLoading();
        message.error(
          `Số tiền thanh toán không được vượt quá số tiền còn thiếu (${formatCurrency(
            remainingPayment
          )}) quá nhiều`
        );
        setProcessingPayment(false);
        return;
      }

      // Cập nhật toast
      hideLoading();
      const hideProcessing = message.loading("Đang xử lý thanh toán...", 0);
      // Chuẩn bị dữ liệu thanh toán
      const paymentData = {
        soTien: paymentAmount,
        thanhToanRequest: {
          maPhuongThucThanhToan: selectedPaymentMethod,
          soTien: paymentAmount,
          moTa: "Thanh toán phụ phí bổ sung",
        },
      };

      // Gọi API thanh toán phụ phí
      const response = await api.post(
        `/api/admin/hoa-don/${id}/additional-payment`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật dữ liệu hóa đơn từ response
      setInvoice(response.data);

      // Refresh dữ liệu lần lượt
      await fetchPaymentHistory();
      await fetchOrderHistory();
      await refreshInvoice();

      // Force update UI để hiển thị dữ liệu mới
      forceUpdate();

      // Đóng modal và hiển thị thông báo
      setOpenPaymentModal(false);
      hideProcessing();
      message.success("Đã thanh toán phụ phí thành công");
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán phụ phí:", error);
      message.error(
        error.response?.data?.message || "Không thể xử lý thanh toán phụ phí"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // Thêm hàm kiểm tra thanh toán chờ/trả sau
  const hasPendingOrCodPayments = () => {
    if (!paymentHistory || !Array.isArray(paymentHistory)) {
      return false;
    }

    // Kiểm tra nếu có thanh toán trả sau hoặc chờ thanh toán ngân hàng
    return paymentHistory.some(
      (payment) =>
        // Trạng thái 2 (chờ thanh toán) hoặc 3 (trả sau/COD)
        (payment.trangThai === 2 || payment.trangThai === 3) &&
        // Mã phương thức COD hoặc chuyển khoản ngân hàng
        (payment.maPhuongThucThanhToan === "COD" ||
          payment.maPhuongThucThanhToan === "BANK")
    );
  };
  // Hàm phát hiện tiền thừa do hoàn thành đơn hàng
  const detectExcessFromOrderCompletion = () => {
    if (!orderHistory || orderHistory.length === 0) return false;

    // Tìm hành động gần nhất trong lịch sử liên quan đến hoàn thành đơn hàng
    const recentStatusUpdates = orderHistory
      .filter(
        (record) =>
          record.moTa?.includes("Cập nhật trạng thái: Hoàn thành") ||
          record.hanhDong?.includes("Điều chỉnh thanh toán") ||
          record.moTa?.includes(
            "Điều chỉnh thanh toán sau khi hoàn thành đơn hàng"
          )
      )
      .sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));

    // Nếu có hành động hoàn thành đơn hàng trong thời gian gần đây (10 phút)
    if (recentStatusUpdates.length > 0) {
      const mostRecentUpdate = recentStatusUpdates[0];
      const timeSinceUpdate =
        Date.now() - new Date(mostRecentUpdate.ngayTao).getTime();
      const tenMinutesInMs = 10 * 60 * 1000;

      if (timeSinceUpdate < tenMinutesInMs && invoice?.trangThai === 5) {
        console.log("Phát hiện tiền thừa do hoàn thành đơn hàng gần đây");
        return true;
      }
    }

    return false;
  };
  // Hàm xử lý hoàn tiền theo loại hóa đơn và loại thanh toán
  const processRefundByInvoiceType = async (amount, paymentMethod, reason) => {
    if (!invoice || amount <= 0) {
      return false;
    }

    try {
      // Xác định loại hóa đơn và cách xử lý phù hợp
      const invoiceType = invoice.loaiHoaDon;

      // Lấy thông tin các thanh toán đã thực hiện
      const completedPayments = paymentHistory.filter((p) => p.trangThai === 1);

      // Phương thức mặc định hoàn tiền - dựa trên thanh toán gần nhất
      let refundMethod = paymentMethod;
      if (!refundMethod && completedPayments.length > 0) {
        // Sắp xếp theo thời gian gần nhất
        const sortedPayments = [...completedPayments].sort(
          (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
        );
        refundMethod = sortedPayments[0].maPhuongThucThanhToan;
      }

      // Áp dụng logic khác nhau cho mỗi loại hóa đơn
      switch (invoiceType) {
        case 1: // Hóa đơn online
          // Ưu tiên hoàn qua phương thức đã thanh toán (online)
          return await executeRefund(
            amount,
            refundMethod || "BANK",
            reason,
            "Hoàn tiền cho đơn hàng online"
          );

        case 2: // Hóa đơn tại quầy
          // Ưu tiên hoàn tiền mặt cho đơn tại quầy
          return await executeRefund(
            amount,
            paymentMethod || "CASH",
            reason,
            "Hoàn tiền cho đơn hàng tại quầy"
          );

        case 3: // Hóa đơn giao hàng
          // Kiểm tra phương thức thanh toán cho đơn hàng giao hàng
          if (hasPendingOrCodPayments()) {
            // Nếu có COD, ưu tiên điều chỉnh số tiền COD
            return await refundToPendingPayment(amount);
          } else {
            // Nếu không có COD, hoàn theo phương thức được chỉ định
            return await executeRefund(
              amount,
              paymentMethod,
              reason,
              "Hoàn tiền cho đơn hàng giao hàng"
            );
          }

        default:
          console.error("Loại hóa đơn không được hỗ trợ:", invoiceType);
          return false;
      }
    } catch (error) {
      console.error("Lỗi khi xử lý hoàn tiền:", error);
      throw error;
    }
  };

  // Thực hiện hoàn tiền qua API
  const executeRefund = async (amount, paymentMethod, reason, description) => {
    const response = await api.post(
      `/api/admin/hoa-don/${id}/refund`,
      {
        soTien: amount,
        maPhuongThucThanhToan: paymentMethod,
        moTa: reason || description || "Hoàn tiền thừa cho khách hàng",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.status === 200;
  };

  // Áp dụng vào thanh toán chờ xác nhận/COD
  const refundToPendingPayment = async (amount) => {
    const response = await api.post(
      `/api/admin/hoa-don/${id}/refund-to-pending`,
      { soTien: amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.status === 200;
  };

  // Cập nhật lại hàm handleRefundExcessPayment để sử dụng logic mới
  const handleRefundExcessPayment = async () => {
    try {
      if (!selectedPaymentMethod) {
        message.error("Vui lòng chọn phương thức hoàn tiền");
        return;
      }

      setProcessingRefund(true);

      // Phát hiện lý do hoàn tiền
      const isFromOrderCompletion = detectExcessFromOrderCompletion();
      const refundReason = determineRefundReason(
        isFromOrderCompletion,
        orderHistory
      );

      // Hiển thị trạng thái đang xử lý
      const loadingToast = message.loading(
        `Đang ${isFromOrderCompletion ? "điều chỉnh" : "hoàn"} tiền...`
      );

      try {
        let success;

        // Sử dụng logic xử lý hoàn tiền dựa trên loại hóa đơn
        success = await processRefundByInvoiceType(
          excessPaymentAmount,
          selectedPaymentMethod,
          refundReason
        );

        if (success) {
          // Cập nhật UI
          await Promise.all([refreshInvoice(), refreshPaymentHistory()]);

          // Reset thông báo và trạng thái
          setExcessNotificationShown(false);
          setShowExcessPaymentRefundDialog(false);
          setHasExcessPayment(false);
          setExcessPaymentAmount(0);

          loadingToast();
          message.success(
            `Đã ${
              isFromOrderCompletion ? "điều chỉnh" : "hoàn"
            } ${formatCurrency(excessPaymentAmount)} thành công`
          );
        } else {
          loadingToast();
          throw new Error("Không thể xử lý hoàn tiền");
        }
      } catch (error) {
        loadingToast();
        console.error("Lỗi khi hoàn/điều chỉnh tiền:", error);
        message.error(
          "Lỗi khi xử lý: " + (error.response?.data?.message || error.message)
        );
        throw error;
      }
    } catch (error) {
      console.error("Error handling excess payment:", error);
    } finally {
      setProcessingRefund(false);
    }
  };

  // Hàm mới để xác định lý do hoàn tiền một cách nhất quán
  const determineRefundReason = (isFromOrderCompletion, orderHistory) => {
    if (isFromOrderCompletion) {
      return "Điều chỉnh thanh toán sau khi hoàn thành đơn hàng";
    }

    // Tìm hành động gần đây nhất trong lịch sử
    const recentActions = orderHistory
      .filter(
        (record) =>
          !record.moTa?.includes("Cập nhật trạng thái") &&
          !record.hanhDong?.includes("Cập nhật trạng thái") &&
          record.ngayTao
      )
      .sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));

    if (recentActions.length > 0) {
      const mostRecent = recentActions[0];

      // Xác định lý do dựa vào hành động gần nhất
      if (
        mostRecent.hanhDong?.includes("Thêm sản phẩm") ||
        mostRecent.hanhDong?.includes("Xóa sản phẩm") ||
        mostRecent.hanhDong?.includes("Cập nhật số lượng sản phẩm")
      ) {
        return "Hoàn tiền thừa sau khi thay đổi sản phẩm trong đơn hàng";
      } else if (
        window.priceNeedsConfirmation ||
        mostRecent.hanhDong?.includes("giá")
      ) {
        return "Hoàn tiền thừa do thay đổi giá sản phẩm";
      } else if (
        mostRecent.hanhDong?.includes("Áp dụng voucher") ||
        (invoice?.phieuGiamGia &&
          new Date(mostRecent.ngayTao) > new Date(Date.now() - 5 * 60000))
      ) {
        return "Hoàn tiền thừa sau khi áp dụng voucher";
      }
    }

    // Lý do mặc định nếu không xác định được
    return "Hoàn tiền thừa cho khách hàng";
  };
  // 1. Thêm useEffect để tự động tải orderHistory khi trạng thái hóa đơn thay đổi
  useEffect(() => {
    if (id && invoice?.trangThai) {
      // Tải lịch sử đơn hàng mỗi khi trạng thái thay đổi
      const loadOrderHistory = async () => {
        try {
          console.log("🔄 Tự động tải lịch sử khi trạng thái thay đổi");
          const response = await api.get(
            `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && Array.isArray(response.data)) {
            // Xử lý dữ liệu - đảm bảo datetime hợp lệ và định dạng đúng
            const processedData = response.data.map((record) => {
              let ngayTao = null;
              let ngaySua = null;

              try {
                ngayTao = record.ngayTao
                  ? new Date(record.ngayTao).toISOString()
                  : null;
              } catch (e) {
                console.error("Lỗi định dạng ngayTao:", e);
              }

              try {
                ngaySua = record.ngaySua
                  ? new Date(record.ngaySua).toISOString()
                  : null;
              } catch (e) {
                console.error("Lỗi định dạng ngaySua:", e);
              }

              return {
                ...record,
                ngayTao,
                ngaySua,
                timestamp: ngayTao || ngaySua,
                trangThai:
                  typeof record.trangThai === "string"
                    ? parseInt(record.trangThai, 10)
                    : record.trangThai,
              };
            });

            setOrderHistory(processedData);
            console.log(
              " Đã cập nhật orderHistory mới với",
              processedData.length,
              "bản ghi"
            );
          }
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        }
      };

      loadOrderHistory();
    }
  }, [id, invoice?.trangThai]);

  const handleOpenCancelDialog = () => {
    setCancelReason(""); // Reset lý do khi mở dialog
    // setUseCustomReason(false); // Đặt lại trạng thái lý do tùy chỉnh
    setOpenCancelDialog(true);
  };

  // 3. Thêm hàm xử lý hủy đơn với lý do
  const handleCancelOrder = async () => {
    if (!cancelReason || cancelReason.trim() === "") {
      message.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }
    if (cancelReason.trim().length < 20) {
      message.error("Lý do hủy đơn phải có ít nhất 20 ký tự");
      return;
    }

    try {
      // Kiểm tra nếu đơn hàng đã có thanh toán
      const hasPayments =
        paymentHistory &&
        paymentHistory.filter((p) => p.trangThai === 1).length > 0;

      if (hasPayments) {
        // Hiện dialog xác nhận hoàn tiền
        Modal.confirm({
          title: "Đơn hàng đã có thanh toán",
          content:
            "Đơn hàng này đã có thanh toán. Hệ thống sẽ tự động hoàn tiền cho khách hàng. Bạn có muốn tiếp tục?",
          okText: "Tiếp tục hủy đơn",
          cancelText: "Quay lại",
          onOk: async () => {
            await processCancelOrder();
          },
        });
      } else {
        // Nếu không có thanh toán, hủy bình thường
        await processCancelOrder();
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra thanh toán:", error);
      message.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Tách logic hủy đơn thành function riêng để tái sử dụng
  const processCancelOrder = async () => {
    // Hiển thị thông báo đang xử lý
    const cancelToastId = message.loading("Đang hủy đơn hàng...", 0);

    try {
      // Tính toán số tiền đã thanh toán để hiển thị thông tin
      const { actualPaidAmount, refundedAmount } = getPaymentSummary();
      const amountToRefund = actualPaidAmount - refundedAmount;

      // Chọn phương thức hoàn tiền mặc định (nếu cần hoàn tiền)
      let refundMethod = null;

      if (amountToRefund > 0) {
        // Tìm phương thức từ các thanh toán đã thực hiện
        const paidPayments = paymentHistory.filter((p) => p.trangThai === 1);
        if (paidPayments.length > 0) {
          // Ưu tiên phương thức thanh toán gần nhất
          refundMethod = paidPayments[0].maPhuongThucThanhToan;
        }

        // Nếu không tìm thấy, mặc định là tiền mặt
        if (!refundMethod) refundMethod = "BANK";
      }

      // Gửi tất cả thông tin trong một API call
      await api.post(
        `/api/admin/hoa-don/${id}/cancel`,
        {
          lyDo: cancelReason,
          amountToRefund: amountToRefund > 0 ? amountToRefund : 0,
          refundMethod: refundMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Ngừng thông báo xử lý
      cancelToastId();

      // Thông báo thành công
      if (amountToRefund > 0) {
        message.success(
          `Đã hủy đơn hàng và hoàn lại ${formatCurrency(
            amountToRefund
          )} cho khách hàng.`
        );
      } else {
        message.success("Đã hủy đơn hàng thành công.");
      }

      // Đóng dialog hủy đơn
      setOpenCancelDialog(false);

      // Cập nhật lại dữ liệu
      await fetchInvoice();
      await fetchOrderHistory();
      await fetchPaymentHistory();
    } catch (error) {
      // Xử lý lỗi
      cancelToastId();
      console.error("Lỗi khi hủy đơn hàng:", error);
      message.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng!");
    }
  };
  // Thêm các hàm trợ giúp từ GiaoHang.js để xử lý địa chỉ
  const addressHelpers = {
    // Lưu thông tin địa chỉ vào cache
    cacheAddressInfo: (type, id, name) => {
      if (!addressCache[type] || !id || !name) return;

      // Chuyển đổi id thành string để đảm bảo nhất quán
      const idStr = id.toString();

      // Lưu theo định dạng rõ ràng
      addressCache[type].set(`id_${idStr}`, name); // Lưu ID -> tên
      addressCache[type].set(`name_${name}`, idStr); // Lưu tên -> ID

      console.log(`Cached ${type}: ID ${idStr} -> "${name}"`);
    },

    // Lấy tên từ id
    getNameById: (type, id) => {
      if (!id || !addressCache[type]) return id;

      // Thử tìm với ID dạng string
      const idStr = id.toString();
      const result = addressCache[type].get(`id_${idStr}`);

      if (!result) {
        // Thử tìm với ID dạng số (cho trường hợp đã cache dưới dạng số)
        const idNum = parseInt(id, 10);
        const numResult = !isNaN(idNum)
          ? addressCache[type].get(`id_${idNum}`)
          : null;

        if (numResult) return numResult;

        // Tạo biểu thị người dùng thân thiện hơn khi không tìm thấy
        switch (type) {
          case "provinces":
            return `Tỉnh/TP: ${id}`;
          case "districts":
            return `Quận/Huyện: ${id}`;
          case "wards":
            return `Xã/Phường: ${id}`;
          default:
            return id;
        }
      }

      return result;
    },

    // Lấy id từ tên
    getIdByName: (type, name) => {
      if (!name || !addressCache[type]) return null;

      const result = addressCache[type].get(`name_${name}`);

      if (!result) {
        console.log(`Không tìm thấy ID cho ${type} name: ${name}`);
      }
      return result ? parseInt(result, 10) : null; // Trả về ID dưới dạng số
    },
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/hoa-don/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Tải thông tin hóa đơn thành công");
      if (response.data) {
        console.log(" Dữ liệu hóa đơn từ API:", response.data);
        setInvoice(response.data);
        setNewStatus(response.data.trangThai.toString());

        setRecipientName(response.data.tenNguoiNhan || "");
        setPhoneNumber(response.data.soDienThoai || "");
        setSpecificAddress(response.data.moTa || "");
        setNote(response.data.ghiChu || "");
        setShippingFee(response.data.phiVanChuyen || 0);

        if (provinces.length === 0) {
          await fetchProvinces();
        }

        // Tìm tỉnh, huyện, xã dựa trên dữ liệu từ API
        const foundProvince = provinces.find(
          (p) => p.name === response.data.tinh
        );
        if (foundProvince) {
          setProvince(foundProvince.code);
          setSelectedProvince(foundProvince);

          // Fetch quận/huyện
          const districtsData = await fetchDistricts(foundProvince.code);
          const foundDistrict = districtsData.find(
            (d) => d.name === response.data.huyen
          );
          if (foundDistrict) {
            setDistrict(foundDistrict.code);
            setSelectedDistrict(foundDistrict);

            // Fetch xã/phường
            const wardsData = await fetchWards(foundDistrict.code);
            const foundWard = wardsData.find(
              (w) => w.name === response.data.xa
            );
            if (foundWard) {
              setWard(foundWard.code);
              setSelectedWard(foundWard);
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải hóa đơn:", error);
      message.error("Lỗi khi tải thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  };
  const showPriceChangeAlert = (products) => {
    setChangedProducts(products);
    setOpenPriceChangeDialog(true);
  };
  // Thêm hàm để kiểm tra thay đổi giá sản phẩm
  // Cải thiện hàm kiểm tra thay đổi giá sản phẩm, thêm tham số để không hiển thị loading toàn trang
  const checkPriceChanges = async (showLoading = true) => {
    try {
      const priceCheckToastId = message.loading(
        "Đang kiểm tra thay đổi giá...",
        0
      );

      if (showLoading) {
        setCheckingPrice(true);
      }

      const response = await api.get(`/api/admin/hoa-don/${id}/kiem-tra-gia`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      priceCheckToastId();

      // Lưu kết quả kiểm tra
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
          danhMuc: item.danhMuc || "---",
          thuongHieu: item.thuongHieu || "---",
          chenhLech: item.chenhLech || 0,
        }));

        setChangedProducts(formattedItems);
        setOpenPriceChangeDialog(true);
        message.warning(`Có ${formattedItems.length} sản phẩm thay đổi giá`);
      } else if (showLoading) {
        // Chỉ hiển thị thông báo khi người dùng chủ động kiểm tra
        message.success("Giá sản phẩm không có thay đổi");
      }

      return hasPriceChanges;
    } catch (error) {
      console.error("Lỗi khi kiểm tra thay đổi giá:", error);
      if (showLoading) {
        message.error("Không thể kiểm tra thay đổi giá sản phẩm");
      }
      return false;
    } finally {
      if (showLoading) {
        setCheckingPrice(false);
      }
    }
  };
  // Thêm hàm xử lý cập nhật giá một sản phẩm
  const handleUpdateProductPrice = async (hoaDonChiTietId, useCurrentPrice) => {
    try {
      const updateToastId = message.loading(
        useCurrentPrice ? "Đang cập nhật giá mới..." : "Đang giữ giá cũ..."
      );

      // Lưu lại danh sách sản phẩm thay đổi hiện tại (trước khi cập nhật)
      // Đặc biệt quan trọng: tạo bản sao mới để tránh tham chiếu
      const currentChangedProducts = [...changedProducts];

      // Gọi API để cập nhật giá sản phẩm - sửa cách truyền tham số
      const response = await api.put(
        `/api/admin/hoa-don/${id}/chi-tiet/${hoaDonChiTietId}/gia?useCurrentPrice=${useCurrentPrice}`,
        {}, // Để body rỗng
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật UI sau khi API thành công
      if (response.data) {
        // Cập nhật danh sách sản phẩm cục bộ
        setInvoiceProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === hoaDonChiTietId
              ? {
                  ...p,
                  gia: useCurrentPrice ? p.giaHienTai : p.giaTaiThoiDiemThem,
                  giaThayDoi: false, // Đánh dấu đã xử lý xong việc thay đổi giá
                  chenhLech: 0, // Xóa chênh lệch vì đã xử lý
                  thanhTien: useCurrentPrice
                    ? p.giaHienTai * p.soLuong
                    : p.giaTaiThoiDiemThem * p.soLuong,
                }
              : p
          )
        );

        // Cập nhật danh sách sản phẩm thay đổi giá - loại bỏ sản phẩm đã xử lý
        const updatedChangedProducts = currentChangedProducts.filter(
          (product) => product.id !== hoaDonChiTietId
        );
        setChangedProducts(updatedChangedProducts);

        // Kiểm tra nếu không còn sản phẩm nào thay đổi giá
        if (updatedChangedProducts.length === 0) {
          setOpenPriceChangeDialog(false);
          setPriceNeedsConfirmation(false);
        }

        updateToastId();
        message.success(
          useCurrentPrice
            ? "Đã cập nhật giá mới cho sản phẩm"
            : "Đã giữ nguyên giá cũ cho sản phẩm"
        );

        // Làm mới dữ liệu để đảm bảo tính nhất quán
        await refreshInvoiceProducts();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giá sản phẩm:", error);
      message.error("Không thể cập nhật giá sản phẩm. Vui lòng thử lại.");

      // Làm mới dữ liệu từ server để đảm bảo đồng bộ
      await refreshInvoiceProducts();
    }
  };
  // Cập nhật hàm xử lý thanh toán/hoàn tiền khi thay đổi giá
  const handlePriceChangePayment = async () => {
    try {
      setProcessingPriceChangePayment(true);
      const loadingMessage = message.loading("Đang xử lý thanh toán...", 0);

      // Kiểm tra có thanh toán chờ xác nhận hoặc trả sau không
      const hasPendingPayment = paymentHistory.some(
        (p) => p.trangThai === 2 || p.trangThai === 3
      );

      // Nếu giảm giá và có thanh toán chờ/trả sau -> cập nhật trực tiếp
      if (priceChangeAmount < 0 && hasPendingPayment) {
        await api.put(
          `/api/admin/hoa-don/${id}/cap-nhat-gia`,
          {
            useCurrentPrices: true,
            adjustToPayments: true, // Thêm flag báo hiệu điều chỉnh vào thanh toán chờ/trả sau
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        loadingMessage();
        message.success(
          "Đã cập nhật giảm giá vào thanh toán chờ xác nhận/trả sau"
        );
      }
      // Nếu tăng giá hoặc không có thanh toán chờ/trả sau -> xử lý như bình thường
      else {
        if (!selectedPaymentMethod && priceChangeAmount !== 0) {
          loadingMessage();
          message.error("Vui lòng chọn phương thức thanh toán/hoàn tiền");
          return;
        }

        // Xác định loại thao tác dựa trên dấu của số tiền thay đổi
        const paymentAction = priceChangeAmount > 0 ? "payment" : "refund";

        // Chuẩn bị payload cho API
        const payload = {
          useCurrentPrices: true,
          paymentAction,
          paymentMethodId: selectedPaymentMethod,
          adjustmentAmount: Math.abs(priceChangeAmount),
          // Bổ sung thông tin mô tả cho giao dịch
          description:
            priceChangeAmount > 0
              ? "Thanh toán phụ phí do giá sản phẩm tăng"
              : "Hoàn tiền do giá sản phẩm giảm",
        };

        // Gọi API xử lý
        await api.put(`/api/admin/hoa-don/${id}/cap-nhat-gia`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        loadingMessage();
        message.success(
          priceChangeAmount > 0
            ? `Đã cập nhật giá và thu thêm ${formatCurrency(
                Math.abs(priceChangeAmount)
              )}`
            : `Đã cập nhật giá và hoàn ${formatCurrency(
                Math.abs(priceChangeAmount)
              )}`
        );
      }

      // Làm mới dữ liệu sau khi xử lý xong
      await Promise.all([
        refreshInvoice(),
        refreshPaymentHistory(),
        refreshInvoiceProducts(),
      ]);

      setPriceNeedsConfirmation(false);
      setShowPriceChangePaymentDialog(false);
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán thay đổi giá:", error);
      message.error(
        "Lỗi khi xử lý thanh toán: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setProcessingPriceChangePayment(false);
    }
  };
  // Thêm hàm cập nhật tất cả giá sản phẩm
  const handleUpdateAllPrices = async (useCurrentPrices = null) => {
    // Nếu không truyền tham số, sử dụng giá trị từ state
    const shouldUseCurrentPrices =
      useCurrentPrices !== null ? useCurrentPrices : updateAllPrices;

    try {
      // Kiểm tra nếu áp dụng giá mới và có thay đổi giá
      if (shouldUseCurrentPrices && changedProducts.length > 0) {
        // Tính toán số tiền chênh lệch
        const amountDifference = calculatePriceChangeAmount(changedProducts);

        // Kiểm tra nếu có thanh toán trước đó và số tiền thay đổi khác 0
        const hasPreviousPayments = paymentHistory && paymentHistory.length > 0;

        if (hasPreviousPayments && amountDifference !== 0) {
          // Mở modal xử lý thanh toán
          await loadPaymentMethods();
          setShowPriceChangePaymentDialog(true);
          return;
        }
      }

      const updateToastId = message.loading("Đang cập nhật giá sản phẩm...");

      await api.put(
        `/api/admin/hoa-don/${id}/cap-nhat-gia`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { useCurrentPrices: shouldUseCurrentPrices },
        }
      );

      // Cập nhật UI không gây loading toàn trang
      await Promise.all([refreshInvoiceProducts(), refreshInvoice()]);

      updateToastId();
      message.success(
        shouldUseCurrentPrices
          ? "Đã cập nhật tất cả sản phẩm sang giá mới"
          : "Đã giữ nguyên giá ban đầu cho tất cả sản phẩm"
      );

      // Đánh dấu đã xác nhận thay đổi giá
      setPriceChangeAmount(0);
      setPriceNeedsConfirmation(false);
      setOpenPriceChangeDialog(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật giá sản phẩm:", error);
      message.error("Không thể cập nhật giá sản phẩm. Vui lòng thử lại.");
    }
  };
  // Thêm hàm này để hiển thị loại thanh toán
  const getPaymentTypeDisplay = (payment) => {
    if (!payment.moTa) return "Thanh toán";

    if (payment.moTa.includes("Hoàn tiền")) {
      return "Hoàn tiền";
    } else if (payment.moTa.includes("Thanh toán phụ phí")) {
      return "Phụ phí";
    } else {
      return "Thanh toán";
    }
  };

  const getPaymentTypeColor = (payment) => {
    if (!payment.moTa) return "blue";

    if (payment.moTa.includes("Hoàn tiền")) {
      return "green";
    } else if (payment.moTa.includes("Thanh toán phụ phí")) {
      return "red";
    } else {
      return "blue";
    }
  };

  // Thêm hàm này vào trong component InvoiceDetail, trước return statement
  const getDiscountAmount = () => {
    // Ưu tiên giá trị từ backend nếu có
    if (invoice?.giamGia !== undefined && invoice?.giamGia !== null) {
      return invoice.giamGia;
    }

    // Không có voucher, không có giảm giá
    if (!invoice?.phieuGiamGia) return 0;

    // Tính toán dựa trên tổng tiền sản phẩm (không bao gồm phí vận chuyển)
    const subtotal = totalBeforeDiscount || 0;

    if (subtotal <= 0 || subtotal < invoice.phieuGiamGia.giaTriToiThieu) {
      return 0; // Không đủ điều kiện áp dụng
    }

    let discountAmount = 0;

    if (invoice.phieuGiamGia.loaiPhieuGiamGia === 1) {
      // Giảm giá theo phần trăm
      discountAmount = Math.floor(
        (subtotal * invoice.phieuGiamGia.giaTriGiam) / 100
      );

      // Kiểm tra giới hạn giảm tối đa
      if (
        invoice.phieuGiamGia.soTienGiamToiDa &&
        invoice.phieuGiamGia.soTienGiamToiDa > 0
      ) {
        discountAmount = Math.min(
          discountAmount,
          invoice.phieuGiamGia.soTienGiamToiDa
        );
      }
    } else {
      // Giảm giá cố định
      discountAmount = Math.min(invoice.phieuGiamGia.giaTriGiam, subtotal);
    }

    // Đảm bảo giảm giá không âm và không vượt quá tổng tiền
    return Math.max(0, Math.min(discountAmount, subtotal));
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/admin/hoa-don/san-pham/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const productsData = response.data;

      // Lấy hình ảnh từ API sản phẩm chi tiết
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Chuyển đổi hình ảnh thành mảng URLs
            const hinhAnhArray = imgResponse.data.map((img) => img.anhUrl);

            return {
              ...product,
              hinhAnh: hinhAnhArray,
              // Đảm bảo các trường khác có giá trị mặc định nếu không có
              chatLieu: product.chatLieu || "---",
              mauSac: product.mauSac || "---",
              maMauSac: product.maMauSac || "#FFFFFF",
              kichThuoc: product.kichThuoc || "---",
              danhMuc: product.danhMuc || "---",
              thuongHieu: product.thuongHieu || "---",
              kieuDang: product.kieuDang || "---",
              kieuCoAo: product.kieuCoAo || "---",
              kieuTayAo: product.kieuTayAo || "---",
              hoaTiet: product.hoaTiet || "---",
            };
          } catch (error) {
            console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
            return {
              ...product,
              hinhAnh: [],
              // Đảm bảo các trường khác có giá trị mặc định
              chatLieu: product.chatLieu || "---",
              mauSac: product.mauSac || "---",
              maMauSac: product.maMauSac || "#FFFFFF",
              kichThuoc: product.kichThuoc || "---",
            };
          }
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      message.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  const updateInvoiceTotal = async (updatedProducts) => {
    // Tính tổng tiền sản phẩm
    const newTotalBeforeDiscount =
      calculateTotalBeforeDiscount(updatedProducts);
    setTotalBeforeDiscount(newTotalBeforeDiscount);

    // Tính tổng tiền bao gồm phí vận chuyển
    const totalWithShipping =
      newTotalBeforeDiscount + (invoice?.phiVanChuyen || 0);

    // Tìm voucher tốt nhất dựa trên tổng mới
    let appliedVoucher = invoice.phieuGiamGia;
    let finalTotal = totalWithShipping;

    // Tính giảm giá nếu có voucher
    if (appliedVoucher) {
      // Kiểm tra xem voucher hiện tại còn áp dụng được không
      if (newTotalBeforeDiscount < appliedVoucher.giaTriToiThieu) {
        appliedVoucher = null;
      } else {
        // Tính lại giảm giá dựa trên tổng mới
        const discountAmount = calculateDiscountAmount(
          appliedVoucher,
          newTotalBeforeDiscount
        );
        finalTotal = totalWithShipping - discountAmount;
      }
    } else if (vouchers && vouchers.length > 0) {
      // Tìm voucher tốt nhất cho tổng mới
      const bestVoucher = findBestVoucher(vouchers, newTotalBeforeDiscount);
      if (bestVoucher) {
        const discountAmount = calculateDiscountAmount(
          bestVoucher,
          newTotalBeforeDiscount
        );
        appliedVoucher = bestVoucher;
        finalTotal = totalWithShipping - discountAmount;
      }
    }

    // Cập nhật state invoice
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      tongTien: finalTotal,
      phieuGiamGia: appliedVoucher,
    }));

    // NEW: Return a promise that resolves when all operations are complete
    const refreshPromises = [refreshInvoice(), refreshPaymentHistory()];

    await Promise.all(refreshPromises);

    // NEW: Calculate and update excess payment
    const excessAmount = calculateExcessAmount();
    setHasExcessPayment(excessAmount > 0);
    setExcessPaymentAmount(excessAmount);

    return {
      totalBeforeDiscount: newTotalBeforeDiscount,
      finalTotal: finalTotal,
      excessAmount: excessAmount,
    };
  };

  const calculateTotalBeforeDiscount = (products) => {
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, product) => {
      return total + product.gia * product.soLuong;
    }, 0);
  };

  const updateTotalBeforeDiscount = (products) => {
    setTotalBeforeDiscount(calculateTotalBeforeDiscount(products));
  };

  const fetchInvoiceProducts = async () => {
    try {
      const response = await api.get(`/api/admin/hoa-don/${id}/san-pham`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Lấy toàn bộ dữ liệu hình ảnh từ response
      const products = response.data;

      // Đảm bảo mảng hinhAnh luôn tồn tại cho mỗi sản phẩm
      const productsWithImages = products.map((product) => ({
        ...product,
        hinhAnh: Array.isArray(product.hinhAnh) ? product.hinhAnh : [],
      }));

      setInvoiceProducts(productsWithImages);
      updateTotalBeforeDiscount(productsWithImages);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
    }
  };

  const fetchAvailableVouchers = async () => {
    if (!invoice || invoice.tongTien === undefined) {
      console.warn("Không thể tải voucher vì invoice chưa có dữ liệu");
      return;
    }

    try {
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${invoice.tongTien}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Danh sách voucher từ API:", response.data);
      setVouchers(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách mã giảm giá");
    }
  };
  // Thêm vào component
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
        .ant-steps-item-tail::after {
          background-color: #1890ff !important;
          opacity: 0.8;
        }
        .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #1890ff !important;
          opacity: 1;
        }
        .ant-steps-item-process .ant-steps-item-tail::after {
          background-color: #e8e8e8 !important;
        }
        .ant-steps-item-wait .ant-steps-item-tail::after {
          background-color: #e8e8e8 !important;
        }
      `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  useEffect(() => {
    if (invoice && (invoice.loaiHoaDon === 3 || invoice.loaiHoaDon === 1)) {
      calculateShippingFeeFromGHN();
    }
  }, [invoice?.id]);

  useEffect(() => {
    // Chỉ thực hiện khi không mở modal chỉnh sửa
    if (!openEditRecipientDialog && invoice && invoice.diaChi) {
      const hasIdFormat = /^.*?,\s*\d+,\s*\d+,\s*\d+$/.test(invoice.diaChi);

      if (hasIdFormat && !addressDataLoaded && provinces.length > 0) {
        console.log("📦 Tự động tải thông tin địa chỉ khi hiển thị");
        tryLoadAddressFromIds();
        setAddressDataLoaded(true);
      }
    }
  }, [
    invoice?.diaChi,
    provinces.length,
    openEditRecipientDialog,
    addressDataLoaded,
  ]);
  useEffect(() => {
    if (id && invoice && invoice.trangThai === 1) {
      // Chỉ kiểm tra thay đổi giá nếu đơn hàng đang ở trạng thái "Chờ xác nhận"
      checkPriceChanges();
    }
  }, [id, invoice?.id]);
  // Thêm useEffect để xử lý khi mở/đóng modal
  useEffect(() => {
    const initializeAddressData = async () => {
      if (openEditRecipientDialog && invoice?.diaChi) {
        // Phân tích địa chỉ theo mẫu ID đặc biệt
        const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
        const match = invoice.diaChi.match(addressPattern);

        if (match) {
          // Đảm bảo provinces đã được tải
          if (provinces.length === 0) {
            await fetchProvinces();
          }

          console.log("Khởi tạo và hiển thị thông tin địa chỉ từ ID");
        }
      }
    };

    initializeAddressData();
  }, [openEditRecipientDialog]);
  useEffect(() => {
    if (openVoucherDialog) {
      fetchAvailableVouchers().then(() => {
        // Always suggest the best voucher
        const total = totalBeforeDiscount + (invoice?.phiVanChuyen || 0);
        const best = findBestVoucher(vouchers, total);
        setBestVoucher(best);
        setSelectedVoucher(best);

        if (best) {
          message.info(`Đã tự động chọn mã giảm giá tốt nhất`);
        }
      });
    }
  }, [openVoucherDialog]);

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) {
      message.error("Vui lòng chọn một mã giảm giá");
      return;
    }

    if (totalBeforeDiscount <= 0) {
      message.error(
        "Không thể áp dụng mã giảm giá cho đơn hàng không có sản phẩm"
      );
      return;
    }

    try {
      const response = await api.post(
        `/api/admin/hoa-don/${id}/voucher`,
        {
          voucherId: selectedVoucher.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Use only product total for discount calculation
      const productTotal = totalBeforeDiscount;
      const discountAmount = calculateDiscountAmount(
        selectedVoucher,
        productTotal
      );

      // Apply the discount to total including shipping
      const totalWithShipping = productTotal + (invoice?.phiVanChuyen || 0);
      const newTotal = totalWithShipping - discountAmount;

      if (newTotal < 0) {
        message.error("Tổng tiền sau giảm giá không hợp lệ!");
        return;
      }

      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        tongTien: newTotal,
        phieuGiamGia: selectedVoucher,
      }));

      setOpenVoucherDialog(false);
      setSelectedVoucher(null);
      message.success(
        `Đã áp dụng mã giảm giá ${selectedVoucher.maPhieuGiamGia}`
      );
      fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
      await refreshInvoice();
      await checkExcessPayment();
    } catch (error) {
      showErrorDialog(
        error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá"
      );
    }
  };

  const handleRemoveVoucher = async () => {
    if (!invoice.phieuGiamGia) {
      message.error("Không có mã giảm giá để xóa");
      return;
    }

    try {
      const loadingToast = message.loading("Đang xóa mã giảm giá...", 0);

      await api.delete(`/api/admin/hoa-don/${id}/voucher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Tính toán tổng tiền tạm thời (để hiển thị UI mượt mà)
      const totalWithShipping =
        (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0);

      if (totalWithShipping <= 0) {
        loadingToast();
        message.error("Tổng tiền sau khi xóa voucher không hợp lệ!");
        return;
      }
      if (invoice?.loaiHoaDon === 1 || invoice?.loaiHoaDon === 3) {
        // Kiểm tra điều kiện miễn phí vận chuyển
        const isFreeShipping = checkFreeShipping(totalBeforeDiscount);

        if (isFreeShipping !== (invoice.phiVanChuyen === 0)) {
          // Nếu điều kiện miễn phí vận chuyển thay đổi, tính lại phí vận chuyển
          calculateAndUpdateShippingFee(false);
        }
      }
      // Cập nhật invoice state tạm thời để UI phản hồi ngay lập tức
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        tongTien: totalWithShipping,
        phieuGiamGia: null,
      }));

      // Làm mới toàn bộ dữ liệu liên quan từ server
      await Promise.all([refreshInvoice(), refreshPaymentHistory()]);

      // Kiểm tra và cập nhật trạng thái thanh toán thừa/thiếu
      const excessAmount = calculateExcessAmount();
      setHasExcessPayment(excessAmount > 0);
      setExcessPaymentAmount(excessAmount);

      loadingToast();
      message.success("Đã xóa mã giảm giá");
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      message.error(error.response?.data?.message || "Lỗi khi xóa mã giảm giá");
    }
  };

  const handleSaveRecipientInfo = async () => {
    try {
      // Validate dữ liệu đầu vào
      if (!recipientName.trim()) {
        showErrorDialog("Vui lòng nhập tên người nhận");
        return;
      }

      if (invoice?.loaiHoaDon === 3 || invoice?.loaiHoaDon === 1) {
        if (!province) {
          showErrorDialog("Vui lòng chọn tỉnh/thành phố");
          return;
        }

        if (!district) {
          showErrorDialog("Vui lòng chọn quận/huyện");
          return;
        }

        if (!ward) {
          showErrorDialog("Vui lòng chọn phường/xã");
          return;
        }
      }

      setTrackingAddressLoading(true);
      const hideLoading = message.loading(
        "Đang cập nhật thông tin người nhận...",
        0
      );

      // Tạo địa chỉ đầy đủ
      let fullAddress = "";

      if (invoice?.loaiHoaDon === 3 || invoice?.loaiHoaDon === 1) {
        // Nếu là đơn giao hàng, sử dụng format mới: địa chỉ chi tiết, wardId, districtId, provinceId
        if (detailAddress) {
          fullAddress = `${detailAddress}, ${ward}, ${district}, ${province}`;
        } else {
          fullAddress = `${ward}, ${district}, ${province}`;
        }
      } else {
        // Nếu không phải đơn giao hàng, chỉ lấy địa chỉ chi tiết
        fullAddress = detailAddress;
      }

      // Tạo payload cập nhật
      const updateData = {
        tenNguoiNhan: recipientName,
        soDienThoai: phoneNumber || "",
        emailNguoiNhan: email || "",
        diaChi: fullAddress,
        ghiChu: note || "",
      };

      // Gọi API cập nhật
      const response = await api.put(
        `/api/admin/hoa-don/${invoice.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // Cập nhật lại state địa phương thay vì gọi API fetchInvoice
        setInvoice((prev) => ({
          ...prev,
          tenNguoiNhan: recipientName,
          soDienThoai: phoneNumber || "",
          emailNguoiNhan: email || "",
          diaChi: fullAddress,
          ghiChu: note || "",
        }));

        // Cập nhật địa chỉ đã định dạng
        setFormattedAddress(fullAddress);

        hideLoading();
        message.success("Cập nhật thông tin người nhận thành công");
        setOpenEditRecipientDialog(false);

        // Tự động tính lại phí vận chuyển nếu là đơn hàng giao hoặc online
        if (
          (invoice.loaiHoaDon === 3 || invoice.loaiHoaDon === 1) &&
          invoice.trangThai === 1
        ) {
          // Sử dụng timeout để đảm bảo state đã được cập nhật
          setTimeout(async () => {
            await calculateAndUpdateShippingFee(false);
          }, 500);
        }
      } else {
        throw new Error("Lỗi khi cập nhật thông tin người nhận");
      }

      setTrackingAddressLoading(false);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin người nhận:", error);
      setTrackingAddressLoading(false);
      showErrorDialog("Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại sau.");
    }
  };
  const calculateAndUpdateShippingFee = async (showToast = true) => {
    if (!invoice || (invoice.loaiHoaDon !== 3 && invoice.loaiHoaDon !== 1)) {
      return;
    }

    try {
      // Kiểm tra điều kiện miễn phí vận chuyển
      if (checkFreeShipping(totalBeforeDiscount)) {
        // Nếu đủ điều kiện miễn phí vận chuyển
        if (invoice.phiVanChuyen > 0) {
          // Gọi API để cập nhật phí vận chuyển = 0
          const updateResponse = await axios({
            method: "post",
            url: `http://localhost:8080/api/admin/hoa-don/${id}/cap-nhat-phi-van-chuyen`,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            data: { fee: 0 },
          });

          // Cập nhật UI
          setInvoice((prev) => ({
            ...prev,
            phiVanChuyen: 0,
          }));

          setShippingFeeFromGHN(0);

          if (showToast) {
            message.success("Đơn hàng được miễn phí vận chuyển");
          }
        }
        return;
      }

      // Nếu không đủ điều kiện miễn phí, tính phí vận chuyển mới
      const newShippingFee = await calculateShippingFeeFromGHN();

      // Nếu phí vận chuyển khác với hiện tại, cập nhật
      if (newShippingFee !== null && newShippingFee !== invoice.phiVanChuyen) {
        const updateResponse = await axios({
          method: "post",
          url: `http://localhost:8080/api/admin/hoa-don/${id}/cap-nhat-phi-van-chuyen`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          data: { fee: newShippingFee },
        });

        // Cập nhật hóa đơn trong state
        setInvoice((prev) => ({
          ...prev,
          phiVanChuyen: newShippingFee,
        }));

        setShippingFeeFromGHN(newShippingFee);

        if (showToast) {
          message.success(
            `Đã cập nhật phí vận chuyển: ${formatCurrency(newShippingFee)}`
          );
        }

        // Kiểm tra thanh toán thừa
        await checkExcessPayment();
      }
    } catch (error) {
      console.error("Lỗi khi tính lại phí vận chuyển:", error);
      if (showToast) {
        message.error("Không thể tính lại phí vận chuyển. Vui lòng thử lại.");
      }
    }
  };
  const fetchProvinces = async () => {
    try {
      const response = await api.get("/api/admin/hoa-don/dia-chi/tinh", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        // Transform data for Select component
        const formattedProvinces = response.data.map((province) => ({
          value: province.id.toString(),
          label: province.name,
        }));

        setProvinces(formattedProvinces);
        console.log(` Đã tải ${formattedProvinces.length} tỉnh/thành phố`);

        // Cache provinces data
        window.addressCache = window.addressCache || {};
        window.addressCache.provinces = window.addressCache.provinces || {};

        response.data.forEach((province) => {
          if (province.id && province.name) {
            window.addressCache.provinces[province.id.toString()] =
              province.name;
          }
        });
      }
    } catch (error) {
      console.error(" Lỗi khi tải danh sách tỉnh/thành phố:", error);
      showErrorDialog(
        "Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau."
      );
    }
  };

  const fetchDistrictsSafe = async (provinceId) => {
    try {
      // Chuẩn hóa và kiểm tra provinceId
      const normalizedProvinceId = normalizeId(provinceId, null);

      // Kiểm tra nghiêm ngặt hơn
      if (normalizedProvinceId === null || normalizedProvinceId === undefined) {
        console.error(
          " provinceId không được cung cấp cho API districts:",
          provinceId
        );
        setDistricts([]);
        return [];
      }

      console.log(
        `📣 Gọi API districts với provinceId: ${normalizedProvinceId}`
      );

      const response = await api.get("/api/admin/hoa-don/dia-chi/huyen", {
        headers: { Authorization: `Bearer ${token}` },
        params: { provinceId: normalizedProvinceId },
      });

      if (!response.data) {
        console.warn("⚠️ API trả về dữ liệu rỗng");
        setDistricts([]);
        return [];
      }

      // Format districts data cho Select component
      const formattedDistricts = response.data.map((district) => ({
        value: district.DistrictID?.toString() || district.id?.toString(),
        label: district.DistrictName || district.name,
      }));

      // Set districts và cache dữ liệu
      setDistricts(formattedDistricts);

      // Cache district data
      response.data.forEach((district) => {
        const districtId = normalizeId(district.DistrictID || district.id);
        const districtName = district.DistrictName || district.name;
        if (districtId && districtName) {
          addressHelpers.cacheAddressInfo(
            "districts",
            districtId,
            districtName
          );
        }
      });

      console.log(` Đã tải ${response.data.length} quận/huyện`);
      return response.data;
    } catch (error) {
      console.error(` Lỗi khi gọi API districts:`, error);
      setDistricts([]);
      return [];
    }
  };
  const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
      console.error("provinceId không được cung cấp cho API districts");
      return;
    }

    console.log("📣 Gọi API districts với provinceId:", provinceId);

    try {
      const response = await api.get(
        `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Kiểm tra cấu trúc dữ liệu thực tế
        console.log("🔍 Dữ liệu quận/huyện trả về:", response.data[0]);

        // Transform data for Select component - chắc chắn rằng value và label đúng
        const formattedDistricts = response.data.map((district) => {
          // Đảm bảo value luôn là string
          const districtId = district.id?.toString() || "";
          const districtName = district.name || "";

          console.log(
            `🏙️ Quận/huyện đã format: ${districtId} -> ${districtName}`
          );

          return {
            value: districtId,
            label: districtName,
          };
        });

        setDistricts(formattedDistricts);
        console.log(` Đã tải ${formattedDistricts.length} quận/huyện`);

        // Cache districts data cho việc hiển thị
        window.addressCache = window.addressCache || {};
        window.addressCache.districts = window.addressCache.districts || {};

        response.data.forEach((district) => {
          if (district.id && district.name) {
            const districtIdStr = district.id.toString();
            window.addressCache.districts[districtIdStr] = district.name;
            console.log(
              `💾 Cached district: ID ${districtIdStr} -> "${district.name}"`
            );
          }
        });
      }
    } catch (error) {
      console.error(" Lỗi khi tải danh sách quận/huyện:", error);
      message.error(
        "Không thể tải danh sách quận/huyện. Vui lòng thử lại sau."
      );
    }
  };

  // Cập nhật hàm fetchWards để tránh gọi API khi districtId không hợp lệ
  const fetchWards = async (districtId) => {
    if (!districtId) {
      console.error("districtId không được cung cấp cho API wards");
      return;
    }

    console.log("📍 Tải xã/phường cho districtId:", districtId);

    try {
      const response = await api.get(
        `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Transform data for Select component
        const formattedWards = response.data.map((ward) => ({
          value: ward.id.toString(),
          label: ward.name,
        }));

        setWards(formattedWards);
        console.log(` Đã tải ${formattedWards.length} phường/xã`);

        // Cache wards data
        window.addressCache = window.addressCache || {};
        window.addressCache.wards = window.addressCache.wards || {};

        response.data.forEach((ward) => {
          if (ward.id && ward.name) {
            window.addressCache.wards[ward.id.toString()] = ward.name;
          }
        });
      }
    } catch (error) {
      console.error(" Lỗi khi tải danh sách phường/xã:", error);
      showErrorDialog(
        "Không thể tải danh sách phường/xã. Vui lòng thử lại sau."
      );
    }
  };
  // Hàm chuẩn hóa chuỗi
  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim();
  };

  // Hàm tìm kiếm phần tử gần đúng trong danh sách
  const findClosestMatch = (name, list) => {
    if (!name || !list || !list.length) return null;

    name = name.trim();

    // Chuẩn hóa tên để so sánh
    const normalizedName = name.toLowerCase();
    const normalizedNoAccent = normalizeString(name);

    // 1. Tìm kiếm chính xác trước
    const exactMatch = list.find(
      (item) =>
        item.ProvinceName?.toLowerCase().trim() === normalizedName ||
        item.DistrictName?.toLowerCase().trim() === normalizedName ||
        item.WardName?.toLowerCase().trim() === normalizedName
    );

    if (exactMatch) {
      console.log(`Tìm thấy kết quả khớp chính xác cho "${name}"`);
      return exactMatch;
    }

    // 2. Tìm kiếm không phân biệt dấu
    const noAccentMatch = list.find(
      (item) =>
        normalizeString(
          item.ProvinceName || item.DistrictName || item.WardName
        ) === normalizedNoAccent
    );

    if (noAccentMatch) {
      console.log(`Tìm thấy kết quả khớp không dấu cho "${name}"`);
      return noAccentMatch;
    }

    // 3. Tìm kiếm chứa từ khóa
    const containsMatch = list.find((item) => {
      const itemName = item.ProvinceName || item.DistrictName || item.WardName;
      return (
        normalizeString(itemName).includes(normalizedNoAccent) ||
        normalizedNoAccent.includes(normalizeString(itemName))
      );
    });

    if (containsMatch) {
      console.log(`Tìm thấy kết quả chứa từ khóa cho "${name}"`);
      return containsMatch;
    }

    console.log(`Không tìm thấy kết quả gần đúng nào cho "${name}"`);
    return null;
  };
  const handleOpenEditRecipientDialog = async () => {
    console.log("🔍 handleOpenEditRecipientDialog được gọi");

    try {
      // 1. Mở modal và hiển thị loading
      setOpenEditRecipientDialog(true);
      setTrackingAddressLoading(true);

      // 2. Phân tích thông tin từ địa chỉ hiện tại
      const addressInfo = extractAddressInfo(invoice?.diaChi);
      console.log("📋 Thông tin địa chỉ đã phân tích:", addressInfo);

      // 3. Cập nhật giá trị state ban đầu
      setRecipientName(invoice?.tenNguoiNhan || "");
      setPhoneNumber(invoice?.soDienThoai || "");
      setEmail(invoice?.emailNguoiNhan || "");
      setDetailAddress(addressInfo.detailAddress);

      // 4. Reset các select địa chỉ trước khi tải lại
      setProvince("");
      setDistrict("");
      setWard("");
      setDistricts([]);
      setWards([]);

      // 5. Tải dữ liệu tỉnh/thành phố và thiết lập giá trị
      await fetchProvinces();

      if (addressInfo.provinceId) {
        console.log("🔄 Thiết lập tỉnh/thành phố:", addressInfo.provinceId);
        setProvince(addressInfo.provinceId);

        // 6. Nếu có province, tải districts
        const districtsData = await fetchDistrictsSafe(addressInfo.provinceId);

        if (addressInfo.districtId) {
          console.log("🔄 Thiết lập quận/huyện:", addressInfo.districtId);
          setDistrict(addressInfo.districtId);

          // 7. Nếu có district, tải wards
          await fetchWards(addressInfo.districtId);

          if (addressInfo.wardId) {
            console.log("🔄 Thiết lập phường/xã:", addressInfo.wardId);
            setWard(addressInfo.wardId);
          }
        }
      }

      // 8. Tắt loading khi hoàn thành
      setTrackingAddressLoading(false);
    } catch (error) {
      console.error(" Lỗi khi mở dialog chỉnh sửa:", error);
      setTrackingAddressLoading(false);
      showErrorDialog("Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.");
    }
  };

  // Cải thiện hàm loadAddressInfoFromIds
  const loadAddressInfoFromIds = async (tinhId, huyenId, xaId) => {
    console.log("🔍 Đang tải thông tin địa chỉ từ IDs:", {
      tinhId,
      huyenId,
      xaId,
    });

    // Normalize/validate the IDs
    const normalizedTinhId = normalizeId(tinhId);
    const normalizedHuyenId = normalizeId(huyenId);
    const normalizedXaId = String(xaId || "").trim(); // xaId might be alphanumeric

    // Kiểm tra nghiêm ngặt hơn cho các ID số
    if (
      !normalizedTinhId ||
      !normalizedHuyenId ||
      !normalizedXaId ||
      (typeof normalizedTinhId === "number" && normalizedTinhId <= 0) ||
      (typeof normalizedHuyenId === "number" && normalizedHuyenId <= 0)
    ) {
      console.error(" IDs không hợp lệ hoặc bằng 0:", {
        normalizedTinhId,
        normalizedHuyenId,
        normalizedXaId,
      });
      return false;
    }

    try {
      // 1. Kiểm tra và tải danh sách tỉnh nếu cần
      if (provinces.length === 0) {
        await fetchProvinces();
      }

      // 2. Tìm tỉnh bằng ID
      let foundProvince = provinces.find((p) => {
        const pId = normalizeId(p.ProvinceID || p.id);
        return pId === normalizedTinhId;
      });

      if (!foundProvince) {
        console.error(` Không tìm thấy tỉnh với ID: ${normalizedTinhId}`);
        return false;
      }

      // 3. Thiết lập tỉnh đã chọn
      setProvince(normalizedTinhId);
      setSelectedProvince(foundProvince);

      // 4. Tải quận/huyện (bỏ qua phần URL query trực tiếp)
      console.log(`🔄 Đang tải quận/huyện cho tỉnh ID: ${normalizedTinhId}`);
      const districtsData = await fetchDistrictsSafe(normalizedTinhId);

      // 5. Tìm huyện theo ID trong danh sách đã tải
      const foundDistrict = districtsData.find((d) => {
        const dId = normalizeId(d.DistrictID || d.id);
        return dId === normalizedHuyenId;
      });

      if (!foundDistrict) {
        console.error(` Không tìm thấy huyện với ID: ${normalizedHuyenId}`);
        return false;
      }

      // 6. Thiết lập huyện đã chọn
      setDistrict(normalizedHuyenId);
      setSelectedDistrict(foundDistrict);

      // 7. Tải xã/phường (bỏ qua phần URL query trực tiếp)
      console.log(`🔄 Đang tải xã/phường cho huyện ID: ${normalizedHuyenId}`);
      const wardsData = await fetchWards(normalizedHuyenId);

      // 8. Tìm xã theo ID/mã trong danh sách đã tải
      const foundWard = wardsData.find((w) => {
        const wardId = String(w.WardCode || w.id).trim();
        return wardId === normalizedXaId;
      });

      if (!foundWard) {
        console.error(` Không tìm thấy xã với ID: ${normalizedXaId}`);
        return false;
      }

      // 9. Thiết lập xã đã chọn
      setWard(normalizedXaId);
      setSelectedWard(foundWard);

      console.log(" Đã tải thành công thông tin địa chỉ");
      return true;
    } catch (error) {
      console.error(" Lỗi khi tải thông tin địa chỉ:", error);
      return false;
    }
  };
  const extractAddressInfo = (fullAddress) => {
    if (!fullAddress) {
      return {
        detailAddress: "",
        wardId: "",
        districtId: "",
        provinceId: "",
      };
    }

    console.log("🔍 Phân tích địa chỉ:", fullAddress);

    try {
      const parts = fullAddress.split(/,\s*/);

      if (parts.length < 4) {
        console.log("⚠️ Địa chỉ không đủ phần để phân tích");
        return {
          detailAddress: fullAddress,
          wardId: "",
          districtId: "",
          provinceId: "",
        };
      }

      // Lấy 3 phần cuối (có thể là ID hoặc tên đầy đủ)
      const lastThreeParts = [
        parts[parts.length - 3].trim(), // phường/xã
        parts[parts.length - 2].trim(), // quận/huyện
        parts[parts.length - 1].trim(), // tỉnh/thành phố
      ];

      // Địa chỉ chi tiết
      const detailAddress = parts.slice(0, parts.length - 3).join(", ");

      // Kiểm tra xem phần cuối có phải là ID không
      const allAreIds = lastThreeParts.every((part) => isAddressId(part));

      let wardId = "",
        districtId = "",
        provinceId = "";

      if (allAreIds) {
        // Nếu tất cả là ID, sử dụng trực tiếp
        wardId = lastThreeParts[0];
        districtId = lastThreeParts[1];
        provinceId = lastThreeParts[2];
        console.log(" Phát hiện địa chỉ có dạng ID");
      } else {
        // Nếu là tên địa lý, cần tìm ID tương ứng
        console.log("Phát hiện địa chỉ có tên đầy đủ, cần tìm ID");

        const provinceName = lastThreeParts[2];
        const districtName = lastThreeParts[1];
        const wardName = lastThreeParts[0];

        // Nếu có phần placeholder "Tỉnh/TP:", "Quận/Huyện:", "Xã/Phường:", cần loại bỏ
        const cleanProvinceName = provinceName.replace(/^(Tỉnh\/TP:)\s*/, "");
        const cleanDistrictName = districtName.replace(
          /^(Quận\/Huyện:)\s*/,
          ""
        );
        const cleanWardName = wardName.replace(/^(Xã\/Phường:)\s*/, "");

        // Kiểm tra xem phần đã làm sạch có phải ID không
        if (isAddressId(cleanProvinceName)) provinceId = cleanProvinceName;
        if (isAddressId(cleanDistrictName)) districtId = cleanDistrictName;
        if (isAddressId(cleanWardName)) wardId = cleanWardName;

        // Tìm ID từ window.addressCache (lưu ngược tên -> ID)
        if (!provinceId && window.addressCache?.provinces) {
          for (const [id, name] of Object.entries(
            window.addressCache.provinces
          )) {
            if (name === cleanProvinceName) {
              provinceId = id;
              break;
            }
          }
        }

        if (!districtId && window.addressCache?.districts) {
          for (const [id, name] of Object.entries(
            window.addressCache.districts
          )) {
            if (name === cleanDistrictName) {
              districtId = id;
              break;
            }
          }
        }

        if (!wardId && window.addressCache?.wards) {
          for (const [id, name] of Object.entries(window.addressCache.wards)) {
            if (name === cleanWardName) {
              wardId = id;
              break;
            }
          }
        }
      }

      return {
        detailAddress,
        wardId,
        districtId,
        provinceId,
      };
    } catch (error) {
      console.error(" Lỗi khi phân tích địa chỉ:", error);
      return {
        detailAddress: fullAddress,
        wardId: "",
        districtId: "",
        provinceId: "",
      };
    }
  };

  const prepareAddressDataForEdit = async () => {
    try {
      // Phân tích địa chỉ để lấy thông tin
      const addressInfo = extractAddressInfo(invoice?.diaChi);

      // Thiết lập các giá trị cho form
      setEditRecipientValues((prevValues) => ({
        ...prevValues,
        province: addressInfo.provinceId || "",
        district: addressInfo.districtId || "",
        ward: addressInfo.wardId || "",
        address: addressInfo.detailAddress || "",
      }));

      // Tải dữ liệu tỉnh/thành phố, quận/huyện, phường/xã
      await fetchProvinces();

      if (addressInfo.provinceId) {
        await fetchDistrictsSafe(addressInfo.provinceId);

        if (addressInfo.districtId) {
          await fetchWards(addressInfo.districtId);
        }
      }
    } catch (error) {
      console.error("Lỗi khi chuẩn bị dữ liệu địa chỉ:", error);
    }
  };
  const handleCloseEditRecipientDialog = () => {
    setOpenEditRecipientDialog(false);
  };
  const normalizeId = (id, fallback = null) => {
    // Check for undefined/null values
    if (id === undefined || id === null) {
      console.log(`normalizeId: ID không hợp lệ (${id}), trả về ${fallback}`);
      return fallback;
    }

    // If already a positive number, return as is
    if (typeof id === "number" && !isNaN(id) && id > 0) {
      return id;
    }

    // Try to convert string to number
    if (typeof id === "string") {
      if (!id.trim()) {
        return fallback;
      }

      const numId = parseInt(id.trim(), 10);
      if (!isNaN(numId) && numId > 0) {
        return numId;
      }

      // Return trimmed string if can't convert to number
      return id.trim();
    }

    return fallback;
  };
  // Cập nhật hàm handleProvinceChange để xử lý khi thay đổi tỉnh/thành phố
  const handleProvinceChange = async (value) => {
    try {
      console.log(`🔵 handleProvinceChange được gọi với value: ${value}`);

      // Cập nhật giá trị province và reset district, ward
      setProvince(value);
      setDistrict("");
      setWard("");

      // Xóa danh sách quận/huyện và phường/xã hiện tại
      setDistricts([]);
      setWards([]);

      // Tải danh sách quận/huyện mới
      if (value) {
        await fetchDistricts(value);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi tỉnh/thành phố:", error);
      showErrorDialog("Đã có lỗi xảy ra khi tải danh sách quận/huyện");
    }
  };

  // Cập nhật hàm handleDistrictChange để xử lý khi thay đổi quận/huyện
  const handleDistrictChange = async (value) => {
    try {
      console.log(`🔵 handleDistrictChange được gọi với value: ${value}`);

      // Cập nhật giá trị district và reset ward
      setDistrict(value);
      setWard("");

      // Xóa danh sách phường/xã hiện tại
      setWards([]);

      // Tải danh sách phường/xã mới
      if (value) {
        await fetchWards(value);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi quận/huyện:", error);
      showErrorDialog("Đã có lỗi xảy ra khi tải danh sách phường/xã");
    }
  };

  // Cập nhật hàm handleWardChange
  const handleWardChange = (value) => {
    console.log(`🔵 handleWardChange được gọi với value: ${value}`);

    // Cập nhật giá trị ward
    setWard(value);

    const selectedWard = wards.find((ward) => ward.value === value);
    if (selectedWard) {
      console.log(
        ` Đã chọn xã/phường: ${selectedWard.label} (${selectedWard.value})`
      );
    }
  };
  // Thêm useEffect để đảm bảo tải dữ liệu khi component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 1. Tải tỉnh/thành phố
        if (!provinces || provinces.length === 0) {
          const provincesData = await fetchProvinces();

          // 2. Tự động xử lý địa chỉ nếu có
          if (invoice?.diaChi) {
            const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
            const match = invoice.diaChi.match(addressPattern);

            if (match) {
              const [_, diaChiCuThe, xaId, huyenId, tinhId] = match;
              console.log("🔍 Phát hiện địa chỉ dạng ID khi component mount:", {
                tinhId,
                huyenId,
                xaId,
              });

              // Đảm bảo các ID được chuẩn hóa
              const normalizedTinhId = normalizeId(tinhId);
              const normalizedHuyenId = normalizeId(huyenId);
              const normalizedXaId = String(xaId || "").trim();

              // Tìm tỉnh
              const provinceObj = provincesData.find((p) => {
                return normalizeId(p.ProvinceID || p.id) === normalizedTinhId;
              });

              if (provinceObj) {
                const provinceIdValue =
                  provinceObj.ProvinceID || provinceObj.id;
                setProvince(provinceIdValue);
                setSelectedProvince(provinceObj);

                // Tải quận/huyện với provinceId đã xác định
                const districtsData = await fetchDistrictsSafe(provinceIdValue);

                // Tìm huyện
                const districtObj = districtsData.find((d) => {
                  return (
                    normalizeId(d.DistrictID || d.id) === normalizedHuyenId
                  );
                });

                if (districtObj) {
                  const districtIdValue =
                    districtObj.DistrictID || districtObj.id;
                  setDistrict(districtIdValue);
                  setSelectedDistrict(districtObj);

                  // Tải xã/phường với districtId đã xác định
                  const wardsData = await fetchWards(districtIdValue);

                  // Tìm xã
                  const wardObj = wardsData.find((w) => {
                    const wId = String(w.WardCode || w.id).trim();
                    return wId === normalizedXaId;
                  });

                  if (wardObj) {
                    const wardIdValue = wardObj.WardCode || wardObj.id;
                    setWard(wardIdValue);
                    setSelectedWard(wardObj);
                    setSpecificAddress(diaChiCuThe || "");
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(" Lỗi khởi tạo dữ liệu:", error);
      }
    };

    if (invoice?.diaChi) {
      initializeData();
    }
  }, [invoice?.diaChi]);
  // Thêm useEffect này vào danh sách các effects
  useEffect(() => {
    const loadInitialAddressData = async () => {
      if (!provinces || provinces.length === 0) {
        console.log("🔄 Tải dữ liệu tỉnh/thành phố ban đầu...");

        try {
          const response = await api.get("/api/admin/hoa-don/dia-chi/tinh", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const provincesData = response.data;
          setProvinces(provincesData);

          // Cache tất cả dữ liệu tỉnh/thành phố
          provincesData.forEach((p) => {
            addressHelpers.cacheAddressInfo(
              "provinces",
              p.ProvinceID,
              p.ProvinceName
            );
          });

          console.log(" Tải thành công dữ liệu tỉnh/thành phố ban đầu");
        } catch (error) {
          console.error(" Lỗi khi tải dữ liệu tỉnh/thành phố ban đầu:", error);
        }
      }
    };

    loadInitialAddressData();
  }, []);

  // Cải thiện useEffect hiện có để tự động tải địa chỉ khi component mount
  useEffect(() => {
    if (invoice && invoice.diaChi) {
      // Kiểm tra xem địa chỉ có phải định dạng ID không
      const hasIdFormat = /^.*?,\s*\d+,\s*\d+,\s*\d+$/.test(invoice.diaChi);

      if (hasIdFormat && !addressDataLoaded) {
        console.log("📦 Tự động tải thông tin địa chỉ khi component mount...");
        tryLoadAddressFromIds();
        setAddressDataLoaded(true);
      }
    }
  }, [invoice?.diaChi, provinces.length]);
  useEffect(() => {
    fetchProvinces();
  }, []);
  // Cải thiện useEffect để tải dữ liệu địa chỉ ngay khi có invoice

  // Thêm useEffect để tự động xử lý địa chỉ khi invoice thay đổi
  useEffect(() => {
    if (invoice && invoice.diaChi) {
      const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
      const match = invoice.diaChi.match(addressPattern);

      if (match && provinces.length > 0) {
        console.log(
          "🔄 Tự động xử lý địa chỉ ID khi invoice hoặc provinces thay đổi"
        );
        tryLoadAddressFromIds();
      }
    }
  }, [invoice?.diaChi, provinces.length]);

  // Hook lấy tên từ ID
  const getAddressNameById = (type, id) => {
    if (!id) return null;

    // Thử lấy từ cache trước
    const nameFromCache = addressHelpers.getNameById(type, id);
    if (nameFromCache && nameFromCache !== id.toString()) {
      return nameFromCache;
    }

    // Nếu không có trong cache, thử tìm trong danh sách đã tải
    switch (type) {
      case "provinces":
        const province = provinces.find(
          (p) => parseInt(p.ProvinceID || p.id, 10) === parseInt(id, 10)
        );
        if (province) {
          const name = province.ProvinceName || province.name;
          addressHelpers.cacheAddressInfo(type, id, name);
          return name;
        }
        break;

      case "districts":
        const district = districts.find(
          (d) => parseInt(d.DistrictID || d.id, 10) === parseInt(id, 10)
        );
        if (district) {
          const name = district.DistrictName || district.name;
          addressHelpers.cacheAddressInfo(type, id, name);
          return name;
        }
        break;

      case "wards":
        const ward = wards.find(
          (w) => String(w.WardCode || w.id) === String(id)
        );
        if (ward) {
          const name = ward.WardName || ward.name;
          addressHelpers.cacheAddressInfo(type, id, name);
          return name;
        }
        break;
    }

    // Nếu không tìm thấy, trả về ID với prefix cho biết loại địa chỉ
    return type === "provinces"
      ? `Tỉnh/TP: ${id}`
      : type === "districts"
      ? `Quận/Huyện: ${id}`
      : type === "wards"
      ? `Phường/Xã: ${id}`
      : `${id}`;
  };
  // Cập nhật useEffect liên quan đến province
  useEffect(() => {
    if (province) {
      // Đảm bảo province là giá trị hợp lệ
      const provinceIdNum = normalizeId(province);
      if (provinceIdNum) {
        console.log(`✓ UseEffect: Tải districts cho province ${provinceIdNum}`);
        fetchDistrictsSafe(provinceIdNum);
      } else {
        console.error(" UseEffect: provinceId không hợp lệ:", province);
        setDistricts([]);
        setWards([]);
      }
    } else {
      console.log(
        " UseEffect: province không có giá trị, xóa districts và wards"
      );
      setDistricts([]);
      setWards([]);
    }
  }, [province]);

  // Cập nhật useEffect cho district
  useEffect(() => {
    if (district) {
      const normalizedDistrictId = normalizeId(district);
      if (!normalizedDistrictId) {
        console.log(" UseEffect: district không hợp lệ, xóa wards");
        setWards([]);
        return;
      }

      console.log(
        `✓ UseEffect: Tải wards cho district ${normalizedDistrictId}`
      );

      const loadWards = async () => {
        try {
          await fetchWards(normalizedDistrictId);
        } catch (error) {
          console.error(" Lỗi khi tải wards trong useEffect:", error);
        }
      };

      loadWards();
    } else {
      console.log(" UseEffect: district không có giá trị, xóa wards");
      setWards([]);
    }
  }, [district]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchProducts();
      fetchInvoiceProducts();
      fetchPaymentHistory();
      const loadStatusHistory = async () => {
        try {
          const response = await api.get(
            `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const sortedHistory = response.data.sort(
            (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
          );

          // Tạo một object lưu thời gian cho mỗi trạng thái
          const timestamps = {};
          sortedHistory.forEach((record) => {
            // Chỉ lưu trạng thái đầu tiên tìm thấy cho mỗi trạng thái
            if (!timestamps[record.trangThai]) {
              timestamps[record.trangThai] = record.ngayTao;
            }
          });

          setStatusTimestamps(timestamps);
        } catch (error) {
          console.error("Lỗi khi tải lịch sử trạng thái:", error);
        }
      };

      loadStatusHistory();
      // Removed WebSocket connection setup and subscription logic
    }
  }, [id]);

  useEffect(() => {
    if (invoice) {
      setRecipientName(invoice.tenNguoiNhan);
      setPhoneNumber(invoice.soDienThoai);
      setSpecificAddress(invoice.diaChi);
      setNote(invoice.ghiChu);
      setShippingFee(invoice.phiVanChuyen);

      // Find province first
      const foundProvince = provinces.find((p) => p.name === invoice.tinh);
      if (foundProvince) {
        setProvince(foundProvince.code);

        // Fetch and set districts
        fetchDistricts(foundProvince.code).then(() => {
          const foundDistrict = districts.find((d) => d.name === invoice.huyen);
          if (foundDistrict) {
            setDistrict(foundDistrict.code);

            // Fetch and set wards
            fetchWards(foundDistrict.code).then(() => {
              const foundWard = wards.find((w) => w.name === invoice.xa);
              if (foundWard) {
                setWard(foundWard.code);
              }
            });
          }
        });
      }
    }
  }, [invoice, provinces]);
  // Thêm vào useEffect cho hóa đơn
  useEffect(() => {
    if (id) {
      const loadOrderHistory = async () => {
        try {
          setLoadingHistory(true);

          const response = await api.get(
            `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && Array.isArray(response.data)) {
            // Xử lý dữ liệu - đảm bảo datetime hợp lệ và định dạng đúng
            const processedData = response.data.map((record) => {
              // Chuyển đổi thời gian sang đối tượng Date rồi sang chuỗi ISO để đảm bảo định dạng nhất quán
              let ngayTao = null;
              let ngaySua = null;

              try {
                ngayTao = record.ngayTao
                  ? new Date(record.ngayTao).toISOString()
                  : null;
              } catch (e) {
                console.error("Lỗi định dạng ngayTao:", e);
              }

              try {
                ngaySua = record.ngaySua
                  ? new Date(record.ngaySua).toISOString()
                  : null;
              } catch (e) {
                console.error("Lỗi định dạng ngaySua:", e);
              }

              return {
                ...record,
                ngayTao,
                ngaySua,
                timestamp: ngayTao || ngaySua, // Thêm trường timestamp để dễ truy cập
                trangThai:
                  typeof record.trangThai === "string"
                    ? parseInt(record.trangThai, 10)
                    : record.trangThai,
              };
            });

            // Sắp xếp theo thời gian để đảm bảo thứ tự đúng
            const sortedData = processedData.sort((a, b) => {
              const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return timeA - timeB; // Sắp xếp tăng dần
            });

            setOrderHistory(sortedData);
          }
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
          setLoadingHistory(false);
        }
      };

      loadOrderHistory();
    }
  }, [id]);
  // Add useEffect for dialog open
  useEffect(() => {
    if (openEditRecipientDialog && invoice) {
      setRecipientName(invoice.tenNguoiNhan || "");
      setPhoneNumber(invoice.soDienThoai || "");
      setNote(invoice.ghiChu || "");
      setShippingFee(invoice.phiVanChuyen || 0);

      const loadLocationData = async () => {
        try {
          // Tải danh sách tỉnh/thành phố
          const provincesData = await fetchProvinces();

          if (!provincesData.length) return;

          // Tìm tỉnh/thành phố từ địa chỉ hiện có
          if (invoice.diaChi) {
            const addressParts = invoice.diaChi.split(", ").filter(Boolean);

            // Nếu địa chỉ có ít nhất 3 phần: địa chỉ cụ thể, phường/xã, quận/huyện, tỉnh/tp
            if (addressParts.length >= 3) {
              // Phần cuối cùng là tỉnh/thành phố
              const provinceName = addressParts[addressParts.length - 1];
              const matchingProvince = findClosestMatch(
                provinceName,
                provincesData
              );

              if (matchingProvince) {
                setProvince(matchingProvince.ProvinceID);
                setSelectedProvince(matchingProvince);

                // Tải quận/huyện
                const districtsData = await fetchDistricts(
                  matchingProvince.ProvinceID
                );

                // Phần kế cuối là quận/huyện
                const districtName = addressParts[addressParts.length - 2];
                const matchingDistrict = findClosestMatch(
                  districtName,
                  districtsData
                );

                if (matchingDistrict) {
                  setDistrict(matchingDistrict.DistrictID);
                  setSelectedDistrict(matchingDistrict);

                  // Tải phường/xã
                  const wardsData = await fetchWards(
                    matchingDistrict.DistrictID
                  );

                  // Phần trước quận/huyện là phường/xã
                  const wardName = addressParts[addressParts.length - 3];
                  const matchingWard = findClosestMatch(wardName, wardsData);

                  if (matchingWard) {
                    setWard(matchingWard.WardCode);
                    setSelectedWard(matchingWard);
                  }

                  // Địa chỉ cụ thể là tất cả các phần còn lại phía trước
                  if (addressParts.length > 3) {
                    const specificAddressParts = addressParts.slice(
                      0,
                      addressParts.length - 3
                    );
                    setSpecificAddress(specificAddressParts.join(", "));
                  } else {
                    setSpecificAddress(""); // Không có địa chỉ cụ thể
                  }
                }
              }
            } else {
              // Nếu địa chỉ không đủ các phần, coi như toàn bộ là địa chỉ cụ thể
              setSpecificAddress(invoice.diaChi);
            }
          } else {
            setSpecificAddress("");
          }
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
        }
      };

      loadLocationData();
    }
  }, [openEditRecipientDialog, invoice]);
  // Hàm tối ưu để cập nhật sản phẩm không gây loading toàn trang
  const refreshInvoiceProducts = async () => {
    try {
      const response = await api.get(`/api/admin/hoa-don/${id}/san-pham`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const products = response.data;
        const productsWithImages = products.map((product) => ({
          ...product,
          hinhAnh: Array.isArray(product.hinhAnh) ? product.hinhAnh : [],
        }));
        setInvoiceProducts(productsWithImages);
        updateTotalBeforeDiscount(productsWithImages);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    }
  };

  // Hàm tối ưu để cập nhật thông tin hóa đơn không gây loading toàn trang
  const refreshInvoice = async () => {
    try {
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await api.get(
        `/api/admin/hoa-don/${id}?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );

      if (response.data) {
        setInvoice(response.data);

        // Log thông tin quan trọng để debug
        console.log("Thông tin hóa đơn sau refresh:", {
          tongTien: response.data.tongTien,
          tongThanhToan: response.data.tongThanhToan,
          conThieu: response.data.tongTien - (response.data.tongThanhToan || 0),
        });
      }
    } catch (error) {
      console.error("Lỗi khi refresh hóa đơn:", error);
    }
  };

  const handleAddProduct = async (product, quantity) => {
    if (!product) {
      showErrorDialog("Vui lòng chọn sản phẩm");
      return;
    }

    try {
      const addToastId = message.loading("Đang thêm sản phẩm...", 0);

      // Gọi API để thêm sản phẩm vào hóa đơn
      const response = await api.post(
        `/api/admin/hoa-don/${id}/san-pham`,
        {
          sanPhamChiTietId: product.id,
          soLuong: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Quan trọng: Lấy ID mới của chi tiết hóa đơn từ response
      const hoaDonChiTietId = response.data?.id;

      // Tạo đối tượng sản phẩm đầy đủ để thêm vào state
      let newProduct = {
        ...response.data,
        id: hoaDonChiTietId, // Sử dụng id từ API trả về
        sanPhamChiTietId: product.id,
        tenSanPham: product.tenSanPham,
        maSanPham: product.maSanPham,
        maSanPhamChiTiet: product.maSanPhamChiTiet || "",
        chatLieu: product.chatLieu || "---",
        mauSac: product.mauSac || "---",
        maMauSac: product.maMauSac || "#FFFFFF",
        kichThuoc: product.kichThuoc || "---",
        danhMuc: product.danhMuc || "---",
        thuongHieu: product.thuongHieu || "---",
        kieuDang: product.kieuDang || "---",
        kieuCoAo: product.kieuCoAo || "---",
        kieuTayAo: product.kieuTayAo || "---",
        hoaTiet: product.hoaTiet || "---",
        gia: product.gia,
        soLuong: quantity,
        thanhTien: product.gia * quantity,
        hinhAnh: [],
      };

      // Cố gắng lấy hình ảnh nếu có
      try {
        const imgResponse = await api.get(
          `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (imgResponse.data && Array.isArray(imgResponse.data)) {
          newProduct.hinhAnh = imgResponse.data.map((img) => img.anhUrl);
        }
      } catch (imageError) {
        console.error("Không thể lấy hình ảnh sản phẩm:", imageError);
      }

      // Tải lại danh sách sản phẩm để đảm bảo thông tin nhất quán với server
      await refreshInvoiceProducts();

      // Cập nhật tổng tiền và invoice
      await refreshInvoice();

      addToastId();
      message.success(
        `Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`
      );
      setOpenAddProductDialog(false);

      // Đặt lại pagination để hiển thị trang chứa sản phẩm mới
      setPagination({ current: 1, pageSize: 3 });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
    }
  };
  const handleAddMultipleProducts = async (products) => {
    if (!products || products.length === 0) {
      showErrorDialog("Không có sản phẩm nào được chọn");
      return;
    }

    try {
      const addToastId = message.loading("Đang thêm sản phẩm...");

      // Chuẩn bị dữ liệu với số lượng tùy chỉnh cho từng sản phẩm
      const productList = products.map((product) => ({
        sanPhamChiTietId: product.id,
        soLuong: product.soLuongThem || 1, // Sử dụng số lượng đã chọn hoặc mặc định là 1
      }));

      // Gọi API để thêm nhiều sản phẩm cùng lúc
      await api.post(
        `/api/admin/hoa-don/${id}/san-pham`,
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

      // Làm mới danh sách sản phẩm và thông tin hóa đơn
      await refreshInvoiceProducts();
      await refreshInvoice();

      // Tính tổng số lượng sản phẩm đã thêm
      const totalQuantity = productList.reduce(
        (sum, item) => sum + item.soLuong,
        0
      );

      addToastId();
      message.success(
        `Đã thêm ${totalQuantity} sản phẩm (${products.length} mặt hàng) vào đơn hàng`
      );
      setOpenAddProductDialog(false);

      // Đặt lại pagination
      setPagination({ current: 1, pageSize: 3 });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      message.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
    }
  };
  const handleConfirmDelete = async () => {
    try {
      if (invoiceProducts.length === 1) {
        // Show modal suggesting order cancellation
        Modal.confirm({
          title: "Không thể xóa sản phẩm cuối cùng",
          content: (
            <div>
              <p>Đơn hàng phải có ít nhất một sản phẩm.</p>
              <p>Nếu muốn xóa sản phẩm cuối cùng, bạn nên hủy đơn hàng.</p>
            </div>
          ),
          okText: "Hủy đơn hàng",
          cancelText: "Đóng",
          okButtonProps: { danger: true },
          onOk: () => handleOpenCancelDialog(),
        });
        // Close the delete confirmation dialog
        setOpenConfirmDelete(false);
        return;
      }

      await api.delete(
        `/api/admin/hoa-don/${id}/chi-tiet/${deletingProductId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gắn token vào header
          },
        }
      );
      message.success("Xóa sản phẩm thành công");
      setInvoiceProducts((prevProducts) => {
        const updatedProducts = prevProducts.filter(
          (product) => product.id !== deletingProductId
        );
        updateTotalBeforeDiscount(updatedProducts);
        return updatedProducts;
      });
      await updateInvoiceTotal(
        invoiceProducts.filter((product) => product.id !== deletingProductId)
      );
      setOpenConfirmDelete(false);
    } catch (error) {
      console.error("Error removing product:", error);
      showErrorDialog(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (hoaDonChiTietId, newQuantity) => {
    if (newQuantity < 1) {
      message.error("Số lượng phải lớn hơn 0");
      return;
    }

    // Kiểm tra sản phẩm tồn tại trong danh sách
    const product = invoiceProducts.find((p) => p.id === hoaDonChiTietId);
    if (!product) {
      message.error("Không tìm thấy sản phẩm trong đơn hàng");
      return;
    }

    // Kiểm tra sản phẩm có thay đổi giá không
    if (product && product.giaThayDoi) {
      if (newQuantity > product.soLuong) {
        message.warning("Không thể tăng số lượng sản phẩm đã thay đổi giá");
        return;
      }
    }

    // Lưu biến để xác định thông báo loading được tạo hay chưa
    let updateToastId = null;

    try {
      updateToastId = message.loading("Đang cập nhật số lượng...", 0);

      // Cập nhật UI ngay lập tức để trải nghiệm người dùng tốt hơn
      const updatedProducts = invoiceProducts.map((p) =>
        p.id === hoaDonChiTietId
          ? {
              ...p,
              soLuong: newQuantity,
              thanhTien: p.gia * newQuantity,
            }
          : p
      );

      setInvoiceProducts(updatedProducts);

      // Tính toán tổng mới trước khi gọi API
      updateTotalBeforeDiscount(updatedProducts);

      // Gọi API để cập nhật số lượng
      await api.put(
        `/api/admin/hoa-don/${id}/chi-tiet/${hoaDonChiTietId}/so-luong`,
        { soLuong: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật tổng hóa đơn và kiểm tra thanh toán thừa/còn thiếu
      await updateInvoiceTotal(updatedProducts);

      // Làm mới lịch sử thanh toán và kiểm tra thanh toán thừa
      await refreshPaymentHistory();
      await checkExcessPayment();

      // Chỉ đóng thông báo loading nếu nó đã được tạo
      if (updateToastId) updateToastId();
      message.success("Cập nhật số lượng thành công");
    } catch (error) {
      // Đảm bảo đóng thông báo loading khi có lỗi
      if (updateToastId) updateToastId();

      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi cập nhật số lượng"
      );

      // Khôi phục dữ liệu ban đầu nếu có lỗi
      await fetchInvoiceProducts();
    }
  };
  const handleStatusChange = async (newStatus) => {
    if (invoice.trangThai === 6) {
      showErrorDialog("Không thể thay đổi trạng thái của đơn hàng đã hủy");
      return;
    }

    // Kiểm tra nếu đơn hàng không có sản phẩm và đang chuyển từ chờ xác nhận sang xác nhận
    if (
      invoice.trangThai === 1 &&
      newStatus === 2 &&
      (!invoiceProducts || invoiceProducts.length === 0)
    ) {
      showErrorDialog("Không thể xác nhận đơn hàng không có sản phẩm");
      return;
    }

    // Xác định nextStatus: với đơn tại quầy (loại 2), từ trạng thái 2 (đã xác nhận) chuyển thẳng sang 5 (hoàn thành)
    let nextStatusValue = newStatus;
    if (
      invoice.loaiHoaDon === 2 &&
      invoice.trangThai === 2 &&
      newStatus === 3
    ) {
      nextStatusValue = 5; // Chuyển thẳng sang Hoàn thành cho hóa đơn tại quầy
    }

    // Xử lý khi chuyển từ chờ xác nhận sang đã xác nhận và cần thanh toán
    if (invoice.trangThai === 1 && newStatus === 2) {
      const hasPayments = paymentHistory && paymentHistory.length > 0;
      const remainingAmount = calculateRemainingPayment();

      if (!hasPayments || remainingAmount > 0) {
        // Mở dialog thanh toán
        setNextStatus(newStatus);
        await loadPaymentMethods();
        setPaymentAmount(calculateRemainingPayment());
        setOpenPaymentModal(true);
        return;
      }
    }

    // Kiểm tra nếu đang chuyển từ trạng thái chờ xác nhận (1) sang đã xác nhận (2)
    // và chưa xác nhận thay đổi giá
    if (invoice.trangThai === 1 && newStatus === 2 && priceNeedsConfirmation) {
      Modal.confirm({
        title: "Cảnh báo thay đổi giá chưa được xác nhận",
        content:
          "Đơn hàng này có sản phẩm thay đổi giá chưa được xác nhận. Bạn cần xác nhận thay đổi giá trước khi xác nhận đơn hàng.",
        okText: "Xác nhận giá ngay",
        cancelText: "Đóng",
        onOk: () => setOpenPriceChangeDialog(true),
      });
      return;
    }

    // Nếu là trạng thái hủy đơn
    if (newStatus === 6) {
      handleOpenCancelDialog();
    } else {
      // Các trạng thái khác
      setNextStatus(nextStatusValue); // Sử dụng nextStatusValue đã được điều chỉnh
      setOpenConfirmDialog(true);
      setConfirmText("");
    }
  };
  const handlePrintInvoice = async () => {
    try {
      if (!invoice || !id) return;

      const printToastId = message.loading("Đang xử lý tài liệu in...", 0);

      // Tải file PDF dưới dạng blob
      const response = await api.get(`/api/admin/hoa-don/${id}/print`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, application/json",
        },
      });

      // Tạo URL từ blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Tạo một iframe ẩn để hiển thị và in PDF
      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.src = url;
      document.body.appendChild(printFrame);

      // Đợi iframe load xong
      printFrame.onload = () => {
        try {
          // In nội dung iframe
          printFrame.contentWindow.print();

          // Đóng thông báo loading
          printToastId();
          message.success("Đã gửi lệnh in hóa đơn");

          // Dọn dẹp sau khi in xong (sau 3 giây)
          setTimeout(() => {
            document.body.removeChild(printFrame);
            window.URL.revokeObjectURL(url);
          }, 3000);
        } catch (err) {
          console.error("Lỗi khi in:", err);
          printToastId();
          message.error("Có lỗi xảy ra khi in tài liệu");
          document.body.removeChild(printFrame);
          window.URL.revokeObjectURL(url);
        }
      };

      // Xử lý lỗi iframe không load được
      printFrame.onerror = () => {
        console.error("Lỗi khi tải iframe in");
        printToastId();
        message.error("Không thể tải tài liệu in");
        document.body.removeChild(printFrame);
        window.URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Lỗi khi xử lý tài liệu in:", error);
      message.error("Không thể xử lý tài liệu in. Vui lòng thử lại sau.");
    }
  };
  const handleConfirmStatusChange = async () => {
    let hideLoading = () => {};
    try {
      setProcessingStatusChange(true);
      hideLoading = message.loading("Đang xử lý chuyển trạng thái...", 0);

      // Kiểm tra số tiền cần thanh toán
      const remainingPayment = calculateRemainingPayment();

      // Kiểm tra xem có khoản thanh toán trả sau hoặc chuyển khoản ngân hàng không
      const hasPendingPayments = paymentHistory.some(
        (p) => p.trangThai === 2 || p.trangThai === 3
      );

      // Nếu chuyển sang trạng thái hủy đơn, xử lý hoàn tiền
      if (nextStatus === 6) {
        // Lấy tổng số tiền đã thanh toán
        const { actualPaidAmount } = getPaymentSummary();

        if (actualPaidAmount > 0) {
          // Xử lý hoàn tiền cho đơn hủy
          const defaultRefundMethod = determineDefaultRefundMethod();

          // Thêm thông tin hoàn tiền vào payload
          const requestPayload = {
            lyDo: cancelReason || "Đơn hàng bị hủy",
            refundInfo: {
              amount: actualPaidAmount,
              paymentMethod: defaultRefundMethod,
              description: `Hoàn tiền do hủy đơn hàng: ${
                cancelReason || "Đơn hàng bị hủy"
              }`,
            },
          };

          // Gọi API hủy đơn với thông tin hoàn tiền
          await api.patch(
            `/api/admin/hoa-don/${id}/status?trangThai=${nextStatus}`,
            requestPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          hideLoading();
          message.success(
            `Đã hủy đơn hàng và hoàn tiền ${formatCurrency(
              actualPaidAmount
            )} thành công`
          );
        } else {
          // Nếu chưa thanh toán, chỉ cần hủy đơn
          await api.patch(
            `/api/admin/hoa-don/${id}/status?trangThai=${nextStatus}`,
            { lyDo: cancelReason || "Đơn hàng bị hủy" },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          hideLoading();
          message.success("Đã hủy đơn hàng thành công");
        }
      }
      // Xử lý cho các trạng thái khác
      else {
        // Chỉ mở modal thanh toán khi còn thiếu tiền VÀ không có thanh toán COD/bank chờ xác nhận
        if (remainingPayment > 1000 && !hasPendingPayments) {
          hideLoading(); // đóng message
          setPaymentAmount(remainingPayment);
          setOpenPaymentModal(true);
          setProcessingStatusChange(false);
          return;
        }

        // Tạo payload cho API với thông tin thanh toán
        const requestPayload = { thanhToans: [] };

        // Nếu có thanh toán chờ xác nhận hoặc trả sau, thêm vào payload
        if (hasPendingPayments) {
          const pendingPayments = paymentHistory
            .filter(
              (p) =>
                (p.trangThai === 2 || p.trangThai === 3) &&
                (p.maPhuongThucThanhToan === "COD" ||
                  p.maPhuongThucThanhToan === "BANK")
            )
            .map((p) => ({
              maPhuongThucThanhToan: p.maPhuongThucThanhToan,
              soTien: p.tongTien || p.soTien,
              moTa:
                p.trangThai === 2
                  ? "Xác nhận thanh toán chuyển khoản"
                  : "Thanh toán khi xác nhận đơn hàng",
            }));

          requestPayload.thanhToans = pendingPayments;
        }

        // Gọi API với thông tin thanh toán
        await api.patch(
          `/api/admin/hoa-don/${id}/status?trangThai=${nextStatus}`,
          requestPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        hideLoading();
        message.success(`Đã chuyển trạng thái thành công`);
      }

      // Làm mới dữ liệu
      await refreshInvoice();
      await fetchOrderHistory();
      await refreshStepsHistory();
      await refreshPaymentHistory();

      setOpenConfirmDialog(false);

      // Xử lý in hóa đơn nếu cần
      if (nextStatus === 3) {
        handlePrintInvoice();
      }
    } catch (error) {
      hideLoading();
      console.error("Lỗi khi chuyển trạng thái:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi chuyển trạng thái"
      );
    } finally {
      setProcessingStatusChange(false);
    }
  };

  // Hàm xác định phương thức hoàn tiền mặc định
  const determineDefaultRefundMethod = () => {
    // Ưu tiên sử dụng phương thức thanh toán gần nhất
    const paidPayments = paymentHistory
      .filter((p) => p.trangThai === 1)
      .sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));

    if (paidPayments.length > 0) {
      // Ưu tiên hoàn tiền qua cùng phương thức
      const latestPayment = paidPayments[0];

      // Không thể hoàn qua COD
      if (latestPayment.maPhuongThucThanhToan === "COD") {
        return "CASH"; // Nếu COD, đổi sang tiền mặt
      }

      return latestPayment.maPhuongThucThanhToan;
    }

    // Mặc định hoàn tiền mặt
    return "CASH";
  };

  const handleGoBack = (currentStatus) => {
    if (currentStatus > 1) {
      // Xác định trạng thái trước dựa vào loại hóa đơn
      let prevStatus = currentStatus - 1;

      // Nếu là hóa đơn tại quầy và đang ở trạng thái Hoàn thành (5), quay lại Đã xác nhận (2)
      if (invoice.loaiHoaDon === 2 && currentStatus === 5) {
        prevStatus = 2;
      }

      setNextStatus(prevStatus);
      setOpenConfirmDialog(true);
      setConfirmText("");
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoadingPayments(true);

      // Thêm timestamp và cache-control để đảm bảo luôn lấy dữ liệu mới
      const timestamp = new Date().getTime();
      const response = await api.get(
        `/api/thanh-toan-hoa-don/hoa-don/${id}?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (response.data) {
        // Quan trọng: xử lý số liệu trước khi cập nhật state
        const processedPayments = response.data.map((payment) => ({
          ...payment,
          tongTien: payment.tongTien ? Number(payment.tongTien) : 0,
          soTien: payment.soTien ? Number(payment.soTien) : 0,
        }));

        console.log("Dữ liệu thanh toán mới:", processedPayments);
        setPaymentHistory(processedPayments);

        // Tính lại số tiền còn thiếu ngay sau khi cập nhật dữ liệu
        setTimeout(() => {
          const remaining = calculateRemainingPayment();
          console.log(
            "Số tiền còn thiếu sau khi cập nhật payment history:",
            remaining
          );

          // Đợi một chút để state cập nhật sau đó kiểm tra thanh toán thừa
          checkAndShowExcessPaymentNotification();
        }, 300);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      message.error("Lỗi khi tải lịch sử thanh toán");
    } finally {
      setLoadingPayments(false);
    }
  };
  // Add this new function to calculate discount amount
  const calculateDiscountAmount = (voucher, totalAmount) => {
    if (!voucher || !totalAmount) return 0;

    // Important: totalAmount here should be only the product total, excluding shipping fee
    let discountAmount = 0;

    if (voucher.loaiPhieuGiamGia === 1) {
      // Giảm theo % nhưng không vượt quá mức giảm tối đa
      discountAmount = (voucher.giaTriGiam / 100) * totalAmount;
      if (voucher.soTienGiamToiDa) {
        discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
      }
    } else {
      // Giảm số tiền cố định nhưng không vượt quá tổng đơn hàng
      discountAmount = Math.min(voucher.giaTriGiam, totalAmount);
    }

    // Đảm bảo chỉ áp dụng nếu đơn hàng đạt mức tối thiểu
    if (totalAmount < voucher.giaTriToiThieu) {
      return 0;
    }

    return discountAmount;
  };

  // Add this new function to find best voucher
  const findBestVoucher = (vouchers, totalAmount) => {
    if (!vouchers || vouchers.length === 0 || totalAmount <= 0) return null;

    return vouchers.reduce((best, current) => {
      if (totalAmount < current.giaTriToiThieu) return best;

      const currentDiscount = calculateDiscountAmount(current, totalAmount);
      const bestDiscount = best
        ? calculateDiscountAmount(best, totalAmount)
        : 0;

      return currentDiscount > bestDiscount ? current : best;
    }, null);
  };

  const fetchOrderHistory = async (openDialog = false) => {
    try {
      setLoadingHistory(true);
      const response = await api.get(
        `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Xử lý dữ liệu trả về
        const processedData = response.data.map((record) => {
          // Chuyển đổi trangThai thành số nếu chưa phải
          const trangThai =
            typeof record.trangThai === "string"
              ? parseInt(record.trangThai, 10)
              : record.trangThai;

          // Đảm bảo ngayTao và ngaySua là chuỗi ISO hợp lệ
          const ngayTao = record.ngayTao
            ? new Date(record.ngayTao).toISOString()
            : null;
          const ngaySua = record.ngaySua
            ? new Date(record.ngaySua).toISOString()
            : null;

          return {
            ...record,
            trangThai,
            ngayTao,
            ngaySua,
            timestamp: ngayTao || ngaySua,
          };
        });

        // Lưu toàn bộ lịch sử vào state
        setOrderHistory(processedData);
        console.log(
          "📋 Đã cập nhật orderHistory với",
          processedData.length,
          "bản ghi"
        );

        // Force update để Steps re-render
        forceUpdate();

        // Chỉ mở dialog nếu được yêu cầu và tham số openDialog là true
        if (openDialog) {
          setOpenHistoryDialog(true);
        }
        setShowHistoryTable(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
      message.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoadingHistory(false);
    }
  };
  const refreshStepsHistory = () => {
    fetchOrderHistory(false);
  };
  const isAddressId = (text) => {
    if (!text) return false;
    const trimmed = text.trim();

    // Các mẫu ID phổ biến:
    // 1. Chỉ có số: 123, 3303, 201
    // 2. Số + chữ cái + số: 1B2728
    // 3. Bắt đầu bằng số: 201ABC

    const patterns = [
      /^\d+$/, // Chỉ số
      /^\d+[A-Za-z]\d*$/, // Số+chữ+số
      /^\d+[A-Za-z]+$/, // Số+chữ
    ];

    return patterns.some((pattern) => pattern.test(trimmed));
  };

  const debugAddressId = (text) => {
    console.log(`🔍 Kiểm tra ID "${text}": ${isAddressId(text)}`);
    return isAddressId(text);
  };
  const getLocationNameById = (type, id) => {
    if (!id) return null;

    // Chuyển id thành chuỗi để so sánh
    const idStr = id.toString().trim();

    // Kiểm tra cache toàn cục (được cập nhật bởi hàm fetchAddressNames)
    if (
      window.addressCache &&
      window.addressCache[type] &&
      window.addressCache[type][idStr]
    ) {
      console.log(
        ` Tìm thấy địa chỉ trong cache toàn cục: ${window.addressCache[type][idStr]}`
      );
      return window.addressCache[type][idStr];
    }

    // Tìm trong cache của component trước
    const cachedName = getAddressNameById(type, idStr);
    if (cachedName) {
      console.log(` Tìm thấy địa chỉ trong cache component: ${cachedName}`);
      return cachedName;
    }

    // Thử tìm bằng findNameById nếu có
    if (typeof findNameById === "function") {
      const foundName = findNameById(type, idStr);
      if (foundName) {
        console.log(` Tìm thấy địa chỉ bằng findNameById: ${foundName}`);
        return foundName;
      }
    }

    return null;
  };
  const fetchAddressNames = async (provinceId, districtId, wardCode) => {
    try {
      console.log("🔄 Đang tải thông tin địa chỉ từ API:", {
        provinceId,
        districtId,
        wardCode,
      });

      // Bước 1: Tải danh sách tỉnh/thành phố
      const provincesResponse = await api.get(
        "/api/admin/hoa-don/dia-chi/tinh",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Đảm bảo có dữ liệu
      if (!provincesResponse.data || !Array.isArray(provincesResponse.data)) {
        console.error(" API tỉnh trả về dữ liệu không hợp lệ");
        return {};
      }

      // Tìm tỉnh/thành phố theo ID
      const provinceData = provincesResponse.data.find(
        (p) => p.id && provinceId && p.id.toString() === provinceId.toString()
      );

      let provinceName = null;
      let districtName = null;
      let wardName = null;

      if (provinceData) {
        provinceName = provinceData.name;
        console.log(
          ` Tìm thấy tỉnh/thành phố: ${provinceName} (${provinceId})`
        );

        // Bước 2: Tải danh sách quận/huyện
        try {
          const districtsResponse = await api.get(
            `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (districtsResponse.data && Array.isArray(districtsResponse.data)) {
            const districtData = districtsResponse.data.find(
              (d) =>
                d.id && districtId && d.id.toString() === districtId.toString()
            );

            if (districtData) {
              districtName = districtData.name;
              console.log(
                ` Tìm thấy quận/huyện: ${districtName} (${districtId})`
              );

              // Bước 3: Tải danh sách phường/xã
              try {
                const wardsResponse = await api.get(
                  `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (wardsResponse.data && Array.isArray(wardsResponse.data)) {
                  const wardData = wardsResponse.data.find(
                    (w) =>
                      w.id &&
                      wardCode &&
                      w.id.toString() === wardCode.toString()
                  );

                  if (wardData) {
                    wardName = wardData.name;
                    console.log(
                      ` Tìm thấy phường/xã: ${wardName} (${wardCode})`
                    );
                  } else {
                    console.log(
                      ` Không tìm thấy phường/xã với mã: ${wardCode}`
                    );
                  }
                }
              } catch (wardError) {
                console.error(" Lỗi khi tải danh sách phường/xã:", wardError);
              }
            } else {
              console.log(` Không tìm thấy quận/huyện với ID: ${districtId}`);
            }
          }
        } catch (districtError) {
          console.error(" Lỗi khi tải danh sách quận/huyện:", districtError);
        }
      } else {
        console.log(` Không tìm thấy tỉnh/thành phố với ID: ${provinceId}`);
      }

      // Khởi tạo cache toàn cục nếu chưa có
      window.addressCache = window.addressCache || {};
      window.addressCache.provinces = window.addressCache.provinces || {};
      window.addressCache.districts = window.addressCache.districts || {};
      window.addressCache.wards = window.addressCache.wards || {};

      // Cập nhật cache với dữ liệu mới tìm được
      if (provinceName) {
        window.addressCache.provinces[provinceId] = provinceName;
        console.log(`💾 Đã lưu cache tỉnh: ${provinceId} -> ${provinceName}`);
      }

      if (districtName) {
        window.addressCache.districts[districtId] = districtName;
        console.log(`💾 Đã lưu cache huyện: ${districtId} -> ${districtName}`);
      }

      if (wardName) {
        window.addressCache.wards[wardCode] = wardName;
        console.log(`💾 Đã lưu cache xã: ${wardCode} -> ${wardName}`);
      }

      return { provinceName, districtName, wardName };
    } catch (error) {
      console.error(" Lỗi khi tải thông tin địa chỉ:", error);
      return {};
    }
  };
  const formatFullAddress = () => {
    const diaChi = invoice?.diaChi;

    if (!diaChi || diaChi.trim() === "") {
      return "Không có địa chỉ";
    }

    console.log("📋 Xử lý địa chỉ:", diaChi);

    try {
      // Tách chuỗi địa chỉ theo dấu phẩy
      const parts = diaChi.split(/,\s*/);

      // Cần ít nhất 4 phần tử
      if (parts.length < 4) {
        return diaChi;
      }

      // Lấy các phần cuối
      const lastThreeParts = [
        parts[parts.length - 3].trim(),
        parts[parts.length - 2].trim(),
        parts[parts.length - 1].trim(),
      ];

      // Kiểm tra và debug xem có phải ID không
      console.log("🔍 Kiểm tra các phần cuối của địa chỉ:", lastThreeParts);
      const isIdFormat = lastThreeParts.every((part) => debugAddressId(part));

      if (!isIdFormat) {
        console.log("📌 Địa chỉ không phải định dạng ID (có tên địa lý)");

        // Nếu phần cuối cùng vẫn là ID (Tỉnh/TP: 201)
        if (lastThreeParts[2].includes("Tỉnh/TP:")) {
          // Thử lấy tên tỉnh từ ID
          const provinceIdStr = lastThreeParts[2]
            .replace("Tỉnh/TP:", "")
            .trim();
          const provinceName = getLocationNameById("provinces", provinceIdStr);

          // Trả về với tên tỉnh nếu có
          if (provinceName) {
            return `${parts
              .slice(0, parts.length - 1)
              .join(", ")}, ${provinceName}`;
          }
        }

        // Nếu đã có tên địa lý, trả về nguyên bản
        return diaChi;
      }

      // Lấy ID
      const wardCode = lastThreeParts[0];
      const districtId = lastThreeParts[1];
      const provinceId = lastThreeParts[2];

      // Lấy tên địa lý từ cache hoặc hiển thị placeholder
      const wardName = getLocationNameById("wards", wardCode);
      const districtName = getLocationNameById("districts", districtId);
      const provinceName = getLocationNameById("provinces", provinceId);

      console.log("📊 Thông tin địa chỉ từ cache:", {
        wardCode,
        wardName,
        districtId,
        districtName,
        provinceId,
        provinceName,
      });

      // Địa chỉ chi tiết
      const detailAddress = parts.slice(0, parts.length - 3).join(", ");

      // Nếu tìm được đầy đủ tên địa lý
      if (wardName && districtName && provinceName) {
        return `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
      }

      // Nếu không, sử dụng placeholder cho phần không tìm thấy
      const wardPart = wardName || `Xã/Phường: ${wardCode}`;
      const districtPart = districtName || `Quận/Huyện: ${districtId}`;
      const provincePart = provinceName || `Tỉnh/TP: ${provinceId}`;

      return `${detailAddress}, ${wardPart}, ${districtPart}, ${provincePart}`;
    } catch (error) {
      console.error(" Lỗi khi định dạng địa chỉ:", error);
      return diaChi;
    }
  };

  // Thêm một hàm riêng để tải thông tin địa chỉ và cập nhật cache
  const loadAddressNamesIfNeeded = async () => {
    if (!invoice?.diaChi) return;

    try {
      const parts = invoice.diaChi.split(/,\s*/);
      if (parts.length < 4) return;

      const wardCode = parts[parts.length - 3].trim();
      const districtId = parts[parts.length - 2].trim();
      const provinceId = parts[parts.length - 1].trim();

      // Kiểm tra xem có phải ID không
      const allAreIds = [wardCode, districtId, provinceId].every(
        (id) => /^\d+$/.test(id) || /^\d+[A-Za-z]\d*$/.test(id)
      );

      if (!allAreIds) return;

      // Kiểm tra xem đã có trong cache chưa
      const hasAllNames =
        getAddressNameById("wards", wardCode) &&
        getAddressNameById("districts", districtId) &&
        getAddressNameById("provinces", provinceId);

      // Nếu chưa có đầy đủ, tải thông tin địa chỉ
      if (!hasAllNames) {
        console.log(
          "🔄 Đang tải thông tin địa chỉ cho:",
          wardCode,
          districtId,
          provinceId
        );
        await loadAddressInfoFromIds(provinceId, districtId, wardCode);
        forceUpdate(); // Cập nhật UI sau khi tải xong
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin địa chỉ:", error);
    }
  };

  // Thêm state ở mức component
  const [formattedAddress, setFormattedAddress] = useState("");
  useEffect(() => {
    const processAddress = async () => {
      if (!invoice?.diaChi) {
        setFormattedAddress("");
        return;
      }

      // Hiển thị địa chỉ ban đầu dựa trên cache hiện có
      const initialFormatted = formatFullAddress();
      setFormattedAddress(initialFormatted);

      // Nếu địa chỉ có vẻ đang ở định dạng ID, thử tải thông tin
      const parts = invoice.diaChi.split(/,\s*/);
      if (parts.length >= 4) {
        try {
          // Tải thông tin địa chỉ
          await tryLoadAddressFromIds();

          // Cập nhật lại địa chỉ sau khi tải
          const updatedFormatted = formatFullAddress();
          console.log("📝 Địa chỉ sau khi tải:", updatedFormatted);

          // Kiểm tra xem địa chỉ mới có tốt hơn không (có ít phần "Xã/Phường:", "Quận/Huyện:", "Tỉnh/TP:" hơn)
          const oldPlaceholders = countPlaceholders(initialFormatted);
          const newPlaceholders = countPlaceholders(updatedFormatted);

          // Nếu địa chỉ mới có ít placeholder hơn hoặc khác hoàn toàn, cập nhật
          if (
            updatedFormatted !== initialFormatted &&
            (newPlaceholders < oldPlaceholders || oldPlaceholders === 0)
          ) {
            console.log("📢 Cập nhật địa chỉ hiển thị:", updatedFormatted);
            setFormattedAddress(updatedFormatted);
          }
        } catch (error) {
          console.error(" Lỗi khi xử lý địa chỉ:", error);
        }
      }
    };

    processAddress();
  }, [invoice?.diaChi]);
  // Cải thiện hàm findNameById để tìm tên từ ID trong các danh sách đã tải
  const countPlaceholders = (address) => {
    if (!address) return 0;

    let count = 0;
    if (address.includes("Xã/Phường:")) count++;
    if (address.includes("Quận/Huyện:")) count++;
    if (address.includes("Tỉnh/TP:")) count++;

    return count;
  };

  const findNameById = (type, id) => {
    if (!id) return null;

    try {
      // Chuyển đổi ID thành string để so sánh
      const idStr = id.toString();

      switch (type) {
        case "provinces":
          if (provinces && provinces.length > 0) {
            const province = provinces.find(
              (p) => p.ProvinceID?.toString() === idStr
            );
            return province ? province.ProvinceName : null;
          }
          break;

        case "districts":
          if (districts && districts.length > 0) {
            const district = districts.find(
              (d) => d.DistrictID?.toString() === idStr
            );
            return district ? district.DistrictName : null;
          }
          break;

        case "wards":
          if (wards && wards.length > 0) {
            const ward = wards.find((w) => w.WardCode?.toString() === idStr);
            return ward ? ward.WardName : null;
          }
          break;

        default:
          return null;
      }
    } catch (error) {
      console.error(`Lỗi khi tìm tên từ ID cho ${type} với ID=${id}:`, error);
      return null;
    }

    return null;
  };
  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorDialogMessage("");
  };

  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  };
  // Add new helper function to sort vouchers by potential savings
  const sortVouchersBySavings = (vouchers, totalAmount) => {
    if (totalAmount === 0) return [];
    return [...vouchers].sort((a, b) => {
      const savingsA = calculateDiscountAmount(a, totalAmount);
      const savingsB = calculateDiscountAmount(b, totalAmount);
      return savingsB - savingsA;
    });
  };

  // Hàm để chuyển đổi địa chỉ sang định dạng GHN
  const mapAddressToGHNFormat = async (address) => {
    if (!address || !address.tinh || !address.huyen || !address.xa) {
      console.error("Địa chỉ không đủ thông tin:", address);
      return null;
    }

    try {
      console.log("🔍 Đang chuyển đổi địa chỉ sang định dạng GHN:", address);
      let provinceId, districtId, wardCode;

      // Lấy danh sách tỉnh/thành phố
      const provincesResponse = await api.get(
        "/api/admin/hoa-don/dia-chi/tinh",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const provinces = provincesResponse.data;

      // Kiểm tra xem tỉnh là ID hay tên
      if (/^\d+$/.test(address.tinh)) {
        // Nếu là ID
        provinceId = parseInt(address.tinh);
        console.log(`✓ Sử dụng ID tỉnh: ${provinceId}`);
      } else {
        // Nếu là tên, tìm ID tương ứng
        const matchingProvince = provinces.find(
          (p) => normalizeString(p.name) === normalizeString(address.tinh)
        );

        if (!matchingProvince) {
          console.error("Không tìm thấy tỉnh/thành phố:", address.tinh);
          return null;
        }

        provinceId = matchingProvince.id;
        console.log(`✓ Tìm thấy ID tỉnh: ${provinceId} cho "${address.tinh}"`);
      }

      // Lấy danh sách quận/huyện
      const districtsResponse = await api.get(
        `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const districts = districtsResponse.data;

      // Kiểm tra xem huyện là ID hay tên
      if (/^\d+$/.test(address.huyen)) {
        // Nếu là ID
        districtId = parseInt(address.huyen);
        console.log(`✓ Sử dụng ID huyện: ${districtId}`);
      } else {
        // Nếu là tên, tìm ID tương ứng
        const matchingDistrict = districts.find(
          (d) => normalizeString(d.name) === normalizeString(address.huyen)
        );

        if (!matchingDistrict) {
          console.error("Không tìm thấy quận/huyện:", address.huyen);
          return null;
        }

        districtId = matchingDistrict.id;
        console.log(
          `✓ Tìm thấy ID huyện: ${districtId} cho "${address.huyen}"`
        );
      }

      // Lấy danh sách phường/xã
      const wardsResponse = await api.get(
        `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const wards = wardsResponse.data;

      // Kiểm tra xem xã là ID hay tên
      if (/^\d+$/.test(address.xa)) {
        // Nếu là ID
        wardCode = address.xa;
        console.log(`✓ Sử dụng mã xã: ${wardCode}`);
      } else {
        // Nếu là tên, tìm ID tương ứng
        const matchingWard = wards.find(
          (w) => normalizeString(w.name) === normalizeString(address.xa)
        );

        if (!matchingWard) {
          console.error("Không tìm thấy phường/xã:", address.xa);
          return null;
        }

        wardCode = matchingWard.id.toString();
        console.log(`✓ Tìm thấy mã xã: ${wardCode} cho "${address.xa}"`);
      }

      // Trả về thông tin định dạng GHN
      console.log(" Chuyển đổi địa chỉ thành công:", {
        to_district_id: districtId,
        to_ward_code: wardCode,
      });

      return {
        to_district_id: districtId,
        to_ward_code: wardCode,
      };
    } catch (error) {
      console.error(" Lỗi khi chuyển đổi địa chỉ:", error);
      return null;
    }
  };

  const parseAddress = (fullAddress) => {
    if (!fullAddress || typeof fullAddress !== "string") {
      return {
        diaChiCuThe: "",
        xa: "",
        huyen: "",
        tinh: "",
        isIdFormat: false,
      };
    }

    // Pattern: "specific address, wardId, districtId, provinceId"
    const specialPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
    const match = fullAddress.match(specialPattern);

    if (match) {
      console.log("🔍 Địa chỉ dạng ID được phát hiện:", fullAddress);
      const [_, diaChiCuThe, xaId, huyenId, tinhId] = match;

      return {
        diaChiCuThe: diaChiCuThe.trim(),
        xa: xaId,
        huyen: huyenId,
        tinh: tinhId,
        isIdFormat: true,
      };
    }

    // Nếu không phải định dạng ID, trả về dạng thông thường
    return {
      diaChiCuThe: fullAddress,
      xa: "",
      huyen: "",
      tinh: "",
      isIdFormat: false,
    };
  };
  // Cập nhật hàm tryLoadAddressFromIds để đảm bảo chuyển đổi ID đúng

  const tryLoadAddressFromIds = async () => {
    if (!invoice?.diaChi) return;

    try {
      console.log(
        "🔄 Đang phân tích địa chỉ để tải thông tin:",
        invoice.diaChi
      );

      // Phân tích địa chỉ
      const parts = invoice.diaChi.split(/,\s*/);
      if (parts.length < 4) {
        console.log("⚠️ Địa chỉ không đủ phần để phân tích");
        return;
      }

      // Lấy các phần cuối
      const lastThreeParts = [
        parts[parts.length - 3].trim(), // wardCode
        parts[parts.length - 2].trim(), // districtId
        parts[parts.length - 1].trim(), // provinceId
      ];

      const allAreIds = lastThreeParts.every((part) => isAddressId(part));

      if (!allAreIds) {
        console.log("📌 Địa chỉ không ở định dạng ID, không tải thông tin");
        return;
      }

      const wardCode = lastThreeParts[0];
      const districtId = lastThreeParts[1];
      const provinceId = lastThreeParts[2];

      // Tải thông tin địa chỉ trực tiếp từ API
      const addressInfo = await fetchAddressNames(
        provinceId,
        districtId,
        wardCode
      );

      // Cập nhật giao diện nếu tìm được thông tin mới
      if (
        addressInfo.provinceName ||
        addressInfo.districtName ||
        addressInfo.wardName
      ) {
        // Cập nhật giao diện
        forceUpdate();
      }

      return addressInfo;
    } catch (error) {
      console.error(" Lỗi khi tải thông tin địa chỉ:", error);
    }
  };
  // Thêm hàm kiểm tra điều kiện miễn phí vận chuyển
  const checkFreeShipping = (subtotal) => {
    const FREE_SHIPPING_THRESHOLD = 2000000; // 2 triệu đồng

    // Tính tổng tiền hàng sau khi trừ giảm giá (nếu có)
    const discountAmount = getDiscountAmount();
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Kiểm tra điều kiện miễn phí vận chuyển
    return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  };
  const calculateShippingFeeFromGHN = async () => {
    if (!invoice || (invoice.loaiHoaDon !== 3 && invoice.loaiHoaDon !== 1)) {
      console.error("Không phải hóa đơn giao hàng hoặc online");
      return null;
    }

    try {
      setLoadingShippingFee(true);

      // Kiểm tra miễn phí vận chuyển ngay từ đầu
      if (checkFreeShipping(totalBeforeDiscount)) {
        console.log("Đơn hàng đủ điều kiện miễn phí vận chuyển");
        setShippingFeeFromGHN(0);
        return 0;
      }
      // Phân tích địa chỉ
      const addressParts = invoice.diaChi?.split(/,\s*/);
      if (!addressParts || addressParts.length < 4) {
        console.error("Địa chỉ không đủ thông tin để tính phí vận chuyển");
        return null;
      }

      // Lấy ra 3 phần cuối của địa chỉ (phường/xã, quận/huyện, tỉnh/thành phố)
      const wardInfo = addressParts[addressParts.length - 3].trim();
      const districtInfo = addressParts[addressParts.length - 2].trim();
      const provinceInfo = addressParts[addressParts.length - 1].trim();

      // Kiểm tra xem có phải địa chỉ dạng ID không
      const isIdFormat = [wardInfo, districtInfo, provinceInfo].every((part) =>
        /^\d+$/.test(part)
      );

      let addressData;
      if (isIdFormat) {
        // Sử dụng ID trực tiếp
        addressData = {
          tinh: provinceInfo,
          huyen: districtInfo,
          xa: wardInfo,
        };
      } else {
        // Trường hợp địa chỉ dạng tên thông thường
        const addressInfo = extractAddressInfo(invoice?.diaChi);
        if (
          !addressInfo.provinceId ||
          !addressInfo.districtId ||
          !addressInfo.wardId
        ) {
          console.error("Không thể trích xuất ID từ địa chỉ");
          return null;
        }

        addressData = {
          tinh: addressInfo.provinceId,
          huyen: addressInfo.districtId,
          xa: addressInfo.wardId,
        };
      }

      const shopInfo = {
        district_id: 1482,
        ward_code: "11006",
      };

      // Chuyển đổi địa chỉ sang định dạng GHN
      const ghnAddress = await mapAddressToGHNFormat(addressData);
      if (!ghnAddress) {
        console.error("Không thể chuyển đổi địa chỉ GHN:", addressData);
        return null;
      }

      console.log("Địa chỉ GHN đã chuyển đổi:", ghnAddress);

      const payload = {
        from_district_id: shopInfo.district_id,
        from_ward_code: shopInfo.ward_code,
        to_district_id: ghnAddress.to_district_id,
        to_ward_code: ghnAddress.to_ward_code,
        service_type_id: 2, // Giao hàng tiêu chuẩn
        weight: 1000, // 500g
        length: 30, // 30cm
        width: 20, // 20cm
        height: 10, // 10cm
      };

      // Gọi API tính phí vận chuyển của GHN
      const response = await api.post(
        `/api/admin/hoa-don/phi-van-chuyen`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Xử lý kết quả từ API
      if (response.data && typeof response.data === "number") {
        const fee = response.data > 0 ? response.data : 30000;
        console.log("Phí vận chuyển tính được:", fee);
        setShippingFeeFromGHN(fee);
        return fee; // Đảm bảo luôn trả về fee
      }

      return null; // Trả về null nếu không nhận được response hợp lệ
    } catch (error) {
      console.error("Lỗi khi tính phí vận chuyển từ GHN:", error);
      return null; // Trả về null trong trường hợp lỗi
    } finally {
      setLoadingShippingFee(false);
    }
  };

  const refreshPaymentHistory = async () => {
    try {
      setLoadingPayments(true);

      // Add timestamp and cache-control to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await api.get(
        `/api/thanh-toan-hoa-don/hoa-don/${id}?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (response.data) {
        // Convert numeric values properly
        const processedPayments = response.data.map((payment) => ({
          ...payment,
          tongTien: payment.tongTien ? Number(payment.tongTien) : 0,
          soTien: payment.soTien ? Number(payment.soTien) : 0,
        }));

        console.log("Dữ liệu thanh toán mới:", processedPayments);
        setPaymentHistory(processedPayments);

        // Return the processed data for immediate use without waiting for state update
        return processedPayments;
      }
      return [];
    } catch (error) {
      console.error("Error fetching payment history:", error);
      message.error("Lỗi khi tải lịch sử thanh toán");
      return [];
    } finally {
      setLoadingPayments(false);
    }
  };
  // Cải tiến hàm handleRecalculateShipping để đảm bảo phí vận chuyển được cập nhật đúng
  const handleRecalculateShipping = async () => {
    const hideLoading = message.loading("Đang tính phí vận chuyển...", 0);
    setLoadingShippingFee(true);

    try {
      await calculateAndUpdateShippingFee(false);
      hideLoading();
      message.success("Đã cập nhật phí vận chuyển thành công");
    } catch (error) {
      hideLoading();
      message.error("Không thể tính lại phí vận chuyển. Vui lòng thử lại.");
    } finally {
      setLoadingShippingFee(false);
    }
  };
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex-1 overflow-auto relative z-10">
        <div style={{ padding: 24 }}>
          <Typography>Không tìm thấy thông tin hóa đơn</Typography>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/hoa-don")}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const getCompleteOrderHistory = () => {
    if (!orderHistory || orderHistory.length === 0) return [];

    // Lọc các bản ghi liên quan đến thay đổi trạng thái hoặc hủy đơn
    const statusRecords = orderHistory.filter(
      (record) =>
        (record.moTa?.includes("Cập nhật trạng thái") ||
          record.hanhDong?.includes("Cập nhật trạng thái") ||
          record.hanhDong === "Hủy hóa đơn") &&
        record.trangThai >= 1 &&
        record.trangThai <= 6
    );

    // Sắp xếp theo thời gian tăng dần để hiển thị theo đúng trình tự
    const sortedHistory = [...statusRecords].sort((a, b) => {
      // Đảm bảo sử dụng ngayTao hoặc ngaySua để sắp xếp chính xác
      const timeA = a.ngayTao
        ? new Date(a.ngayTao).getTime()
        : a.ngaySua
        ? new Date(a.ngaySua).getTime()
        : 0;

      const timeB = b.ngayTao
        ? new Date(b.ngayTao).getTime()
        : b.ngaySua
        ? new Date(b.ngaySua).getTime()
        : 0;

      return timeA - timeB; // Sắp xếp tăng dần theo thời gian
    });

    // Chuyển đổi sang định dạng phù hợp cho Steps
    const history = sortedHistory.map((record) => ({
      trangThai: record.trangThai,
      timestamp: record.ngayTao || record.ngaySua,
      moTa: record.moTa,
      tenNhanVien: record.tenNhanVien,
      hanhDong: record.hanhDong,
    }));

    return history;
  };
  // Hàm xác định trạng thái hiện tại của Steps
  const getStepsCurrent = (currentTrangThai, history) => {
    if (currentTrangThai === 6) {
      // Nếu là trạng thái hủy, điểm current là phần tử cuối (thường là trạng thái hủy)
      return history.length - 1;
    }

    // Tìm chỉ số của trạng thái hiện tại trong history
    // Nếu có nhiều phần tử cùng trạng thái, lấy cái cuối cùng
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].trangThai === currentTrangThai) {
        return i;
      }
    }

    // Nếu không tìm thấy, dùng currentTrangThai - 1 như trước
    return currentTrangThai - 1;
  };

  // Hàm xác định trạng thái của từng Step
  const getStepStatus = (
    stepTrangThai,
    currentTrangThai,
    stepIndex,
    totalSteps
  ) => {
    // Nếu là trạng thái hủy (6)
    if (stepTrangThai === 6) {
      return "error";
    }

    // Nếu đơn hàng đã hủy (currentTrangThai === 6)
    if (currentTrangThai === 6) {
      return stepIndex < totalSteps - 1 ? "finish" : "error";
    }

    // Nếu step hiện tại đang được xử lý
    if (stepTrangThai === currentTrangThai) {
      return "process";
    }

    // Các step đã hoàn thành (các step trước step hiện tại)
    if (stepTrangThai < currentTrangThai) {
      return "finish";
    }

    // Các step sau step hiện tại
    return "wait";
  };
  // Hàm hỗ trợ lấy chỉ số step từ trạng thái
  const getStepIndexByStatus = (status) => {
    const history = getCompleteOrderHistory();
    for (let i = 0; i < history.length; i++) {
      if (history[i].trangThai === status) {
        return i;
      }
    }
    return status - 1; // Fallback: trả về index = trạng thái - 1
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div
        style={{
          marginBottom: 24,
          padding: "16px 24px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Title level={5} style={{ marginBottom: 24 }}>
          Quá trình xử lý đơn hàng
        </Title>
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch", // Cho scroll mượt trên iOS
            position: "relative",
          }}
        >
          {/* Container cố định chiều rộng tối thiểu */}
          <div
            style={{
              minWidth: `${getCompleteOrderHistory().length * 200}px`, // 200px cho mỗi step
              paddingBottom: "20px", // Tạo khoảng trống cho scrollbar
            }}
          >
            <Steps
              current={getStepsCurrent(
                invoice.trangThai,
                getCompleteOrderHistory()
              )}
              progressDot={false}
              className="invoice-steps"
              status={invoice.trangThai === 6 ? "error" : "process"}
            >
              {getCompleteOrderHistory().map((record, idx) => {
                // Xác định icon cho mỗi trạng thái
                if (
                  invoice?.loaiHoaDon === 2 &&
                  (record.trangThai === 3 || record.trangThai === 4)
                ) {
                  return null;
                }
                let stepIcon;
                switch (record.trangThai) {
                  case 1:
                    stepIcon = <FieldTimeOutlined />;
                    break;
                  case 2:
                    stepIcon = <CheckCircleOutlined />;
                    break;
                  case 3:
                    stepIcon = <ShoppingOutlined />;
                    break;
                  case 4:
                    stepIcon = <CarOutlined />;
                    break;
                  case 5:
                    stepIcon = <TrophyOutlined />;
                    break;
                  case 6:
                    stepIcon = <CloseCircleOutlined />;
                    break;
                  default:
                    stepIcon = <FieldTimeOutlined />;
                }

                const stepStatus = getStepStatus(
                  record.trangThai,
                  invoice.trangThai,
                  idx,
                  getCompleteOrderHistory().length
                );

                return (
                  <Step
                    key={idx}
                    style={{
                      margin: "0",
                      padding: "0 8px",
                      maxWidth: "200px",
                    }}
                    icon={stepIcon}
                    title={
                      <Tooltip
                        title={
                          <div style={{ padding: "8px" }}>
                            <div
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                marginBottom: "4px",
                              }}
                            >
                              {getStatusText(record.trangThai)}
                            </div>
                            {record.timestamp && (
                              <div
                                style={{ color: "#8c8c8c", fontSize: "12px" }}
                              >
                                {formatDate(record.timestamp)}
                              </div>
                            )}
                            {record.tenNhanVien && (
                              <div
                                style={{
                                  color: "#1890ff",
                                  fontSize: "12px",
                                  marginTop: "4px",
                                  fontStyle: "italic",
                                }}
                              >
                                Người xác nhận: {record.tenNhanVien}
                              </div>
                            )}
                            {record.moTa && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  marginTop: "4px",
                                  color: "#595959",
                                }}
                              >
                                {record.moTa}
                              </div>
                            )}
                          </div>
                        }
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "4px",
                            }}
                          >
                            {getStatusText(record.trangThai)}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.65)",
                            }}
                          >
                            {formatDate(record.timestamp)}
                          </div>
                        </div>
                      </Tooltip>
                    }
                    description={
                      record.trangThai === 6 && record.moTa ? (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#ff4d4f",
                            maxWidth: "150px",
                            textAlign: "center",
                            marginTop: "4px",
                          }}
                        >
                          {record.moTa.includes("Hóa đơn bị hủy")
                            ? record.moTa.replace(
                                /^Hóa đơn bị hủy:?\s*/,
                                "Lý do: "
                              )
                            : `Lý do: ${record.moTa}`}
                        </div>
                      ) : null
                    }
                    status={getStepStatus(
                      record.trangThai,
                      invoice.trangThai,
                      idx,
                      getCompleteOrderHistory().length
                    )}
                  />
                );
              })}
            </Steps>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            gap: 16,
          }}
        >
          {invoice.trangThai !== 5 && invoice.trangThai !== 6 && (
            <>
              {priceNeedsConfirmation && invoice.trangThai === 1 && (
                <Button
                  danger
                  icon={<WarningOutlined />}
                  onClick={() => setOpenPriceChangeDialog(true)}
                >
                  Xác nhận thay đổi giá
                </Button>
              )}

              {invoice.trangThai > 1 && (
                <Button
                  type="default"
                  onClick={() => handleGoBack(invoice.trangThai)}
                >
                  Quay lại trạng thái trước
                </Button>
              )}

              <Button
                type="primary"
                onClick={() =>
                  handleStatusChange(
                    // Nếu là hóa đơn tại quầy và đang ở trạng thái "Đã xác nhận" (2)
                    // thì chuyển thẳng sang trạng thái "Hoàn thành" (5)
                    invoice.loaiHoaDon === 2 && invoice.trangThai === 2
                      ? 5
                      : invoice.trangThai + 1
                  )
                }
                disabled={
                  (priceNeedsConfirmation && invoice.trangThai === 1) ||
                  (invoice.trangThai === 1 &&
                    (!invoiceProducts || invoiceProducts.length === 0))
                }
                title={
                  invoice.trangThai === 1 &&
                  (!invoiceProducts || invoiceProducts.length === 0)
                    ? "Đơn hàng phải có ít nhất 1 sản phẩm để xác nhận"
                    : ""
                }
              >
                {invoice.trangThai === 1
                  ? "Xác nhận"
                  : invoice.trangThai === 2
                  ? invoice.loaiHoaDon === 2
                    ? "Hoàn thành" // Hóa đơn tại quầy: từ Đã xác nhận -> Hoàn thành
                    : "Chuẩn bị giao hàng" // Hóa đơn khác: từ Đã xác nhận -> Chuẩn bị giao hàng
                  : invoice.trangThai === 3
                  ? "Bắt đầu giao hàng"
                  : invoice.trangThai === 4
                  ? "Xác nhận hoàn thành"
                  : ""}
              </Button>

              {(invoice.trangThai === 1 || invoice.trangThai === 2) && (
                <Button type="default" onClick={() => handleStatusChange(6)}>
                  Hủy đơn hàng
                </Button>
              )}
            </>
          )}
          <Button
            type="default"
            onClick={refreshStepsHistory}
            icon={<SyncOutlined />}
          >
            Làm mới
          </Button>
          <Button
            type="default"
            onClick={() => fetchOrderHistory(true)}
            icon={<HistoryOutlined />}
          >
            Xem lịch sử
          </Button>
        </div>
      </div>

      {/* Payment History - Moved right after stepper */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Lịch sử thanh toán</Title>
        {loadingPayments ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 16 }}
          >
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={paymentHistory}
            columns={[
              {
                title: "STT",
                key: "index",
                width: 60,
                align: "center",
                render: (_, __, index) => index + 1,
              },
              {
                title: "Số tiền",
                dataIndex: "tongTien",
                key: "tongTien",
                align: "center",
                render: (text) => formatCurrency(text),
              },
              {
                title: "Phương thức",
                dataIndex: "tenPhuongThucThanhToan",
                key: "tenPhuongThucThanhToan",
                align: "center",
              },
              {
                title: "Thời gian",
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
                render: (_, record) => renderPaymentMethodStatus(record),
              },
              {
                title: "Ghi chú",
                dataIndex: "moTa",
                key: "moTa",
                align: "center",
                render: (text) => text || "---",
              },
              {
                title: "Người xác nhận",
                dataIndex: "nhanVien",
                key: "nhanVien",
                align: "center",
                render: (text) => text || "---",
              },
            ]}
            pagination={false}
            rowKey="id"
            locale={{ emptyText: "Chưa có lịch sử thanh toán" }}
          />
        )}
      </Card>
      {/* Dialog Hủy Đơn Hàng */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          <WarningIcon sx={{ mr: 1, fontSize: 28, verticalAlign: "middle" }} />
          Xác nhận hủy đơn hàng
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Typography variant="body1" mb={2} mt={1}>
            Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm và mã giảm giá sẽ
            được hoàn lại.
          </Typography>
          <Typography variant="body2" fontWeight="bold" mb={1}>
            Chọn lý do hủy đơn: <span style={{ color: "red" }}>*</span>
          </Typography>

          {!useCustomReason ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <Radio.Group
                  style={{ width: "100%" }}
                  onChange={(e) => setCancelReason(e.target.value)}
                  value={cancelReason}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {predefinedReasons.map((reason, index) => (
                      <Radio.Button
                        key={index}
                        value={reason}
                        style={{
                          width: "100%",
                          height: "auto",
                          padding: "10px",
                          marginBottom: "8px",
                          textAlign: "left",
                          whiteSpace: "normal",
                          borderRadius: "4px",
                        }}
                      >
                        {reason}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
              <Button
                type="link"
                onClick={() => {
                  setUseCustomReason(true);
                  setCancelReason("");
                }}
                icon={<PlusOutlined />}
              >
                Lý do khác
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn hàng..."
                required
                error={
                  cancelReason.trim() === "" || cancelReason.trim().length < 20
                }
                helperText={
                  cancelReason.trim() === ""
                    ? "Lý do hủy đơn không được để trống"
                    : cancelReason.trim().length < 20
                    ? `Lý do hủy đơn ít nhất 20 ký tự (còn thiếu ${
                        20 - cancelReason.trim().length
                      } ký tự)`
                    : ""
                }
              />
              <Button
                type="link"
                onClick={() => {
                  setUseCustomReason(false);
                  setCancelReason("");
                }}
                style={{ marginTop: 8, padding: 0 }}
              >
                Quay lại lý do có sẵn
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Đóng</Button>
          <Button
            onClick={handleCancelOrder}
            variant="contained"
            color="error"
            disabled={
              !cancelReason ||
              cancelReason.trim() === "" ||
              cancelReason.trim().length < 20
            }
          >
            Hủy đơn
          </Button>
        </DialogActions>
      </Dialog>
      {/* Rest of the content */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4}>Thông tin đơn hàng: {invoice.maHoaDon}</Title>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenEditRecipientDialog}
            disabled={invoice.trangThai !== 1 || refreshing}
          >
            Chỉnh sửa thông tin đơn hàng
          </Button>
        </div>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Trạng thái:</Text>{" "}
            <StatusChip status={invoice.trangThai} />
          </Col>
          <Col span={12}>
            <Text strong>Loại:</Text> <TypeChip type={invoice.loaiHoaDon} />
          </Col>
          <Col span={12}>
            <Text strong>Tên khách hàng:</Text> {recipientName || "---"}
          </Col>
          <Col span={12}>
            <Text strong>Số điện thoại:</Text> {phoneNumber || "---"}
          </Col>
          <Col span={12}>
            <Text strong>Địa chỉ:</Text> {formattedAddress || "---"}
          </Col>
          <Col span={12}>
            <Text strong>Thời gian nhận hàng:</Text>{" "}
            {invoice.trangThai >= 2 && invoice.trangThai <= 5
              ? invoice.thoiGianNhanHang
                ? formatDate(invoice.thoiGianNhanHang)
                : formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
              : "---"}
          </Col>

          {invoice.trangThai >= 3 && invoice.trangThai <= 5 && (
            <Col span={12}>
              <Text strong>Thời gian giao hàng:</Text>{" "}
              {invoice.thoiGianGiaoHang
                ? formatDate(invoice.thoiGianGiaoHang)
                : "Đang cập nhật"}
            </Col>
          )}
          <Col span={12}>
            <Text strong>Email:</Text> {invoice.emailNguoiNhan || "---"}
          </Col>
          <Col span={12}>
            <Text strong>Ghi chú:</Text> {note || "---"}
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4}>Thông tin sản phẩm đã mua</Title>
          <Space>
            {invoice.trangThai === 1 && (
              <Button
                onClick={() => checkPriceChanges(true)}
                icon={<SyncOutlined />}
                danger={priceNeedsConfirmation}
                loading={loading && checkingPrice}
                disabled={loading && !checkingPrice}
              >
                {priceNeedsConfirmation
                  ? "Xác nhận thay đổi giá!"
                  : "Kiểm tra thay đổi giá"}
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenAddProductDialog(true)}
              disabled={invoice.trangThai !== 1 || refreshing}
            >
              Thêm sản phẩm
            </Button>
          </Space>
          <ProductTable
            products={products}
            open={openAddProductDialog}
            onClose={() => setOpenAddProductDialog(false)}
            onAddProduct={handleAddProduct}
            onAddMultipleProducts={handleAddMultipleProducts}
            hoaDonId={invoice.id}
          />
        </div>
        <Table
          dataSource={invoiceProducts}
          columns={[
            {
              title: "STT",
              key: "index",
              width: 60,
              align: "center",
              render: (_, __, index) => index + 1,
            },
            {
              title: "Hình ảnh",
              dataIndex: "hinhAnh",
              key: "hinhAnh",
              align: "center",
              width: 180,
              render: (hinhAnh, record) => (
                <div
                  style={{
                    width: 150,
                    height: 120,
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto",
                  }}
                >
                  {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
                    <Carousel
                      autoplay
                      dots={false}
                      effect="fade"
                      style={{ width: "100%" }}
                    >
                      {hinhAnh.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <img
                            src={url}
                            alt={`${record.tenSanPham || "Sản phẩm"} ${
                              index + 1
                            }`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 5,
                              display: "block",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150x120?text=No+Image";
                            }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  ) : (
                    <img
                      src="https://via.placeholder.com/150x120?text=No+Image"
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
              ),
            },
            {
              title: "Thông tin",
              key: "thongTin",
              align: "center",
              width: 180,
              render: (_, record) => (
                <Space direction="vertical" size={0}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Typography.Text strong>
                      {record.tenSanPham}
                    </Typography.Text>
                    {record.giaThayDoi && (
                      <Tooltip title="Sản phẩm đã thay đổi giá, chỉ có thể giảm số lượng">
                        <Badge
                          count={
                            <InfoCircleOutlined style={{ color: "#ff4d4f" }} />
                          }
                          offset={[0, 0]}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <Typography.Text type="secondary">
                    Mã: {record.maSanPhamChiTiet}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Chất liệu: {record.chatLieu || "---"}
                  </Typography.Text>
                  {record.danhMuc && (
                    <Typography.Text type="secondary">
                      Danh mục: {record.danhMuc}
                    </Typography.Text>
                  )}
                  {record.thuongHieu && (
                    <Typography.Text type="secondary">
                      Thương hiệu: {record.thuongHieu}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: "Màu sắc",
              key: "mauSac",
              align: "center",
              width: 180,
              render: (_, record) => (
                <Space size="middle">
                  <Typography.Text>{record.mauSac || "---"}</Typography.Text>
                  <div
                    style={{
                      display: "inline-block",
                      width: 50,
                      height: 20,
                      borderRadius: 6,
                      backgroundColor: record.maMauSac || "#FFFFFF",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  ></div>
                </Space>
              ),
            },
            {
              title: "Thiết kế",
              key: "thietKe",
              align: "center",
              width: 180,
              render: (_, record) => (
                <Space direction="vertical" size={0}>
                  {record.kieuDang && (
                    <Typography.Text>
                      Kiểu dáng: {record.kieuDang}
                    </Typography.Text>
                  )}
                  {record.kieuCoAo && (
                    <Typography.Text>
                      Kiểu cổ áo: {record.kieuCoAo}
                    </Typography.Text>
                  )}
                  {record.kieuTayAo && (
                    <Typography.Text>
                      Kiểu tay áo: {record.kieuTayAo}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: "Kích thước",
              key: "kichThuoc",
              align: "center",
              width: 100,
              render: (_, record) => (
                <Typography.Text>{record.kichThuoc || "---"}</Typography.Text>
              ),
            },
            // Thay đổi cột "Đơn giá" trong bảng sản phẩm:
            {
              title: "Đơn giá",
              key: "gia",
              width: 140,
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
            // Trong phần columns của Table sản phẩm, thêm tooltip cho InputNumber:
            {
              title: "Số lượng",
              key: "soLuong",
              width: 120,
              align: "center",
              render: (_, record) => (
                <div>
                  <Tooltip
                    title={
                      record.giaThayDoi
                        ? "Sản phẩm đã thay đổi giá chỉ có thể giảm số lượng hoặc xóa"
                        : ""
                    }
                    placement="topLeft"
                  >
                    <InputNumber
                      min={1}
                      max={record.giaThayDoi ? record.soLuong : undefined}
                      value={record.soLuong}
                      onChange={(value) =>
                        handleUpdateQuantity(record.id, value)
                      }
                      disabled={invoice.trangThai !== 1}
                      style={{
                        width: 80,
                        backgroundColor: record.giaThayDoi
                          ? "#f5f5f5"
                          : undefined,
                      }}
                    />
                  </Tooltip>
                  {record.giaThayDoi && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#ff4d4f",
                        marginTop: "4px",
                      }}
                    >
                      Chỉ có thể giảm số lượng
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: "Thành tiền",
              key: "thanhTien",
              width: 140,
              align: "center",
              render: (_, record) => {
                // Tính thành tiền dựa trên giá hiện tại
                const price = record.giaThayDoi
                  ? record.gia || record.giaTaiThoiDiemThem || 0 // Sử dụng giá hiện tại nếu có thay đổi
                  : record.gia || 0;
                return formatCurrency(price * record.soLuong);
              },
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
                  disabled={invoice.trangThai !== 1}
                  onClick={() => {
                    // Check if this is the last product and prevent direct deletion
                    if (invoiceProducts.length === 1) {
                      Modal.confirm({
                        title: "Không thể xóa sản phẩm cuối cùng",
                        content: (
                          <div>
                            <p>Đơn hàng phải có ít nhất một sản phẩm.</p>
                            <p>
                              Nếu muốn xóa sản phẩm cuối cùng, bạn nên hủy đơn
                              hàng.
                            </p>
                          </div>
                        ),
                        okText: "Hủy đơn hàng",
                        cancelText: "Đóng",
                        okButtonProps: { danger: true },
                        onOk: () => handleOpenCancelDialog(),
                      });
                    } else {
                      setDeletingProductId(record.id);
                      setOpenConfirmDelete(true);
                    }
                  }}
                />
              ),
            },
          ]}
          pagination={{
            current: pagination.current,
            pageSize: 3,
            showSizeChanger: false,
            total: invoiceProducts.length,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            size: "small",
            position: ["bottomCenter"],
            onChange: (page) => {
              setPagination((prev) => ({ ...prev, current: page }));
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
          scroll={{ y: "calc(100vh - 550px)" }}
        />
      </Card>

      <Card style={{ marginTop: 24 }}>
        <div style={{ maxWidth: 400, marginLeft: "auto", paddingRight: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền hàng:</Text>
              <Text>{formatCurrency(totalBeforeDiscount)}</Text>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
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
                {checkFreeShipping(totalBeforeDiscount) && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Miễn phí
                  </Tag>
                )}
              </Text>
              <div style={{ display: "flex", alignItems: "center" }}>
                {loadingShippingFee ? (
                  <Spin size="small" style={{ marginRight: 8 }} />
                ) : (
                  <Text>
                    {formatCurrency(
                      checkFreeShipping(totalBeforeDiscount)
                        ? 0
                        : shippingFeeFromGHN !== null
                        ? shippingFeeFromGHN
                        : invoice?.phiVanChuyen || 0
                    )}
                  </Text>
                )}

                {(invoice.loaiHoaDon === 3 || invoice.loaiHoaDon === 1) && (
                  <Button
                    type="link"
                    icon={<ReloadOutlined />}
                    onClick={handleRecalculateShipping}
                    style={{ marginLeft: 8 }}
                    size="small"
                    loading={loadingShippingFee}
                    disabled={invoice.trangThai !== 1}
                  >
                    Tính lại
                  </Button>
                )}
              </div>
            </div>

            {/* Thông báo điều kiện miễn phí vận chuyển */}
            {totalBeforeDiscount < 2000000 && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: "12px",
                  fontStyle: "italic",
                  color: "#1890ff",
                }}
              >
                Miễn phí vận chuyển cho đơn hàng từ 2.000.000₫
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Voucher giảm giá:</Text>
              <div>
                {invoice.phieuGiamGia ? (
                  <Tag
                    closable={invoice.trangThai === 1} // Chỉ cho phép xóa nếu trạng thái === 1
                    onClose={
                      invoice.trangThai === 1 ? handleRemoveVoucher : undefined
                    }
                    color="black"
                  >
                    {invoice.phieuGiamGia.maPhieuGiamGia}
                  </Tag>
                ) : (
                  <Button
                    type="default"
                    icon={<TagOutlined />}
                    onClick={() => setOpenVoucherDialog(true)}
                    disabled={invoice.trangThai !== 1}
                  >
                    Thêm
                  </Button>
                )}
              </div>
            </div>
            {invoice.phieuGiamGia && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Giảm giá:</Text>
                <Text type="danger">
                  -{formatCurrency(getDiscountAmount())}
                </Text>
              </div>
            )}
            <Divider />
            {/* Hiển thị tóm tắt các phương thức thanh toán */}
            {paymentHistory && paymentHistory.length > 0 && (
              <>
                {paymentHistory.map((payment, index) => (
                  <Card key={index} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space direction="vertical">
                        <Tag color={getPaymentTypeColor(payment)}>
                          {getPaymentTypeDisplay(payment)}
                        </Tag>
                        <Text strong>{formatCurrency(payment.tongTien)}</Text>
                        <Text type="secondary">
                          {payment.tenPhuongThucThanhToan}
                        </Text>
                      </Space>
                      <Space direction="vertical" align="end">
                        <Text>{formatDate(payment.ngayTao)}</Text>
                        <Text type="secondary">{payment.moTa}</Text>
                      </Space>
                    </div>
                  </Card>
                ))}
                <Divider style={{ margin: "8px 0" }} />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền thanh toán:</Text>
              <Text type="danger" strong>
                {formatCurrency(
                  totalBeforeDiscount +
                    (shippingFeeFromGHN !== null
                      ? shippingFeeFromGHN
                      : invoice?.phiVanChuyen || 0) -
                    getDiscountAmount()
                )}
              </Text>
            </div>

            {/* Add remaining payment amount display if there are payments but not completed */}
            {paymentHistory &&
              paymentHistory.length > 0 &&
              calculateRemainingPayment() > 0 &&
              invoice.trangThai !== 6 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  <Text strong type="danger">
                    Còn thiếu:
                  </Text>
                  <Text strong type="danger">
                    {formatCurrency(calculateRemainingPayment())}
                  </Text>
                </div>
              )}
            {/* Hiển thị thanh toán thừa nếu có */}
            {hasExcessPayment && excessPaymentAmount > 0 && (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    backgroundColor: "#f6ffed",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Text strong style={{ color: "#52c41a" }}>
                    Khách đã thanh toán thừa:
                    <Tooltip title="Khách hàng đã thanh toán nhiều hơn tổng giá trị đơn hàng">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </Text>
                  <Text type="success" strong>
                    {formatCurrency(excessPaymentAmount)}
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<RollbackOutlined />}
                  onClick={() => handleShowRefundDialog(excessPaymentAmount)}
                  style={{ width: "100%" }}
                  ghost
                >
                  Xử lý hoàn tiền thừa
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>
      {/* Modal xử lý tiền thừa */}
      {showExcessPaymentRefundDialog && (
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <WalletOutlined
                style={{
                  fontSize: "24px",
                  color: detectExcessFromOrderCompletion()
                    ? "#1890ff"
                    : "#52c41a",
                  marginRight: "12px",
                }}
              />
              <span>
                {detectExcessFromOrderCompletion()
                  ? "Điều chỉnh tiền thừa"
                  : "Hoàn tiền thừa"}
              </span>
            </div>
          }
          open={showExcessPaymentRefundDialog}
          onCancel={() => setShowExcessPaymentRefundDialog(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowExcessPaymentRefundDialog(false)}
              disabled={processingRefund}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleRefundExcessPayment}
              loading={processingRefund}
              disabled={!selectedPaymentMethod}
            >
              {detectExcessFromOrderCompletion() ? "Điều chỉnh" : "Hoàn tiền"}
            </Button>,
          ]}
          width={600}
          centered
          destroyOnClose
        >
          <Alert
            message={
              detectExcessFromOrderCompletion()
                ? "Phát hiện tiền thừa sau khi hoàn thành đơn hàng"
                : "Khách hàng đã thanh toán thừa tiền"
            }
            description={
              detectExcessFromOrderCompletion()
                ? "Hệ thống phát hiện phát sinh tiền thừa khi hoàn thành đơn hàng do chuyển thanh toán trả sau sang đã thanh toán."
                : "Hệ thống phát hiện khách hàng đã thanh toán nhiều hơn tổng giá trị đơn hàng. Bạn nên hoàn lại số tiền thừa."
            }
            type="warning"
            showIcon
            style={{ marginBottom: "20px" }}
          />

          <div style={{ marginBottom: "24px" }}>
            <Typography.Text strong style={{ fontSize: "16px" }}>
              Chi tiết thanh toán:
            </Typography.Text>

            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text>Tổng tiền đơn hàng:</Text>
                <Text>{formatCurrency(invoice?.tongTien || 0)}</Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text>Phí vận chuyển:</Text>
                <Text>{formatCurrency(invoice?.phiVanChuyen || 0)}</Text>
              </div>

              {(() => {
                // Lấy dữ liệu thanh toán
                const { actualPaidAmount, refundedAmount, pendingAmount } =
                  getPaymentSummary();

                return (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Text>Đã thanh toán:</Text>
                      <Text type="success">
                        {formatCurrency(actualPaidAmount)}
                      </Text>
                    </div>

                    {refundedAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>Đã hoàn tiền:</Text>
                        <Text type="warning">
                          -{formatCurrency(refundedAmount)}
                        </Text>
                      </div>
                    )}

                    {pendingAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>Chờ thanh toán/trả sau:</Text>
                        <Text type="processing">
                          {formatCurrency(pendingAmount)}
                        </Text>
                      </div>
                    )}
                  </>
                );
              })()}

              <Divider style={{ margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>
                  Số tiền thừa cần{" "}
                  {detectExcessFromOrderCompletion() ? "điều chỉnh" : "hoàn"}:
                </Text>
                <Text type="success" strong>
                  {formatCurrency(excessPaymentAmount)}
                </Text>
              </div>
            </div>
          </div>

          <Form.Item
            label={`Chọn phương thức ${
              detectExcessFromOrderCompletion() ? "điều chỉnh" : "hoàn tiền"
            }`}
            required
          >
            <Radio.Group
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
              disabled={processingRefund}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {paymentMethods
                  .filter((method) =>
                    ["CASH", "BANK"].includes(method.maPhuongThucThanhToan)
                  )
                  .map((method) => (
                    <Radio.Button
                      key={method.id}
                      value={method.maPhuongThucThanhToan}
                      style={{
                        width: "100%",
                        height: "auto",
                        padding: "12px 16px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {method.maPhuongThucThanhToan === "CASH" && (
                          <DollarOutlined
                            style={{
                              fontSize: "24px",
                              color: "#52c41a",
                              marginRight: "12px",
                            }}
                          />
                        )}
                        {method.maPhuongThucThanhToan === "BANK" && (
                          <CreditCardOutlined
                            style={{
                              fontSize: "24px",
                              color: "#1890ff",
                              marginRight: "12px",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                            {method.tenPhuongThucThanhToan}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.45)",
                            }}
                          >
                            {method.moTa}
                          </div>
                        </div>
                      </div>
                    </Radio.Button>
                  ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        </Modal>
      )}
      {/* Edit Recipient Dialog */}
      <Modal
        title="Chỉnh sửa thông tin người nhận"
        open={openEditRecipientDialog}
        onCancel={handleCloseEditRecipientDialog}
        onOk={handleSaveRecipientInfo}
        okText="Lưu"
        cancelText="Hủy"
        centered
        width={600}
        destroyOnClose={true}
        okButtonProps={{
          disabled:
            !recipientName ||
            ((invoice?.loaiHoaDon === 3 || invoice?.loaiHoaDon === 1) &&
              (!province || !district || !ward)),
          loading: trackingAddressLoading,
        }}
      >
        {trackingAddressLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Đang tải thông tin địa chỉ..." />
          </div>
        ) : (
          <Form layout="vertical">
            <Form.Item
              label="Tên người nhận"
              required
              validateStatus={recipientName ? "success" : "error"}
            >
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nhập tên người nhận"
              />
            </Form.Item>
            <Form.Item label="Số điện thoại">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
            <Form.Item label="Email">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email (không bắt buộc)"
              />
            </Form.Item>

            {(invoice?.loaiHoaDon === 3 || invoice?.loaiHoaDon === 1) && (
              <>
                <Form.Item
                  label="Tỉnh/Thành phố"
                  required
                  validateStatus={province ? "success" : "error"}
                >
                  <Select
                    showSearch
                    value={province}
                    onChange={handleProvinceChange}
                    placeholder="Chọn tỉnh/thành phố"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={provinces}
                    loading={!provinces.length}
                    notFoundContent="Không tìm thấy dữ liệu"
                  />
                </Form.Item>
                <Form.Item
                  label="Quận/Huyện"
                  required
                  validateStatus={district ? "success" : "error"}
                >
                  <Select
                    showSearch
                    value={district}
                    onChange={handleDistrictChange}
                    placeholder="Chọn quận/huyện"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={districts}
                    loading={!districts.length && province}
                    disabled={!province}
                    notFoundContent="Hãy chọn tỉnh/thành phố trước"
                  />
                </Form.Item>
                <Form.Item
                  label="Phường/Xã"
                  required
                  validateStatus={ward ? "success" : "error"}
                >
                  <Select
                    showSearch
                    value={ward}
                    onChange={handleWardChange}
                    placeholder="Chọn phường/xã"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={wards}
                    loading={!wards.length && district}
                    disabled={!district}
                    notFoundContent="Hãy chọn quận/huyện trước"
                  />
                </Form.Item>
              </>
            )}

            <Form.Item label="Địa chỉ chi tiết">
              <Input.TextArea
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="Số nhà, tên đường, tổ/thôn/xóm..."
                rows={2}
              />
            </Form.Item>

            {/* Thêm trường ghi chú */}
            <Form.Item label="Ghi chú">
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho đơn hàng..."
                rows={2}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Dialog chọn voucher */}
      <Modal
        title="Chọn mã giảm giá"
        visible={openVoucherDialog}
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
          dataSource={
            totalBeforeDiscount > 0
              ? sortVouchersBySavings(vouchers, totalBeforeDiscount)
              : []
          }
          renderItem={(voucher, index) => {
            const productTotal = totalBeforeDiscount || 0;
            const discountAmount = calculateDiscountAmount(
              voucher,
              productTotal
            );

            // Prevent division by zero
            const savings =
              productTotal > 0
                ? ((discountAmount / productTotal) * 100).toFixed(1)
                : "0.0";

            const maxDiscount = vouchers.reduce((max, v) => {
              const vDiscount = calculateDiscountAmount(v, productTotal);
              return Math.max(max, vDiscount);
            }, 0);
            const isHighestDiscount =
              discountAmount === maxDiscount && discountAmount > 0;
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
                      <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                        Tên voucher: {voucher.tenPhieuGiamGia}
                      </div>
                      <div>
                        {voucher.loaiPhieuGiamGia === 1
                          ? `Giảm ${
                              voucher.giaTriGiam
                            }% (tối đa ${formatCurrency(
                              voucher.soTienGiamToiDa
                            )})`
                          : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
                      </div>
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
          locale={{
            emptyText:
              totalBeforeDiscount > 0
                ? "Không có mã giảm giá khả dụng"
                : "Không thể áp dụng mã giảm giá cho đơn hàng không có sản phẩm",
          }}
        />
      </Modal>

      {/* Add Confirmation Dialog */}
      <Modal
        title="Xác nhận thay đổi trạng thái"
        visible={openConfirmDialog}
        onCancel={() => setOpenConfirmDialog(false)}
        onOk={handleConfirmStatusChange}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ disabled: confirmText.toLowerCase() !== "đồng ý" }}
        centered
      >
        <Text>Vui lòng nhập "đồng ý" để xác nhận thay đổi trạng thái</Text>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="đồng ý"
        />
      </Modal>
      {/* Modal Thanh Toán */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <WalletOutlined
              style={{
                fontSize: "24px",
                color: "#1890ff",
                marginRight: "12px",
              }}
            />
            <span>
              {nextStatus === 2 ? "Thanh toán đơn hàng" : "Thanh toán phụ phí"}
            </span>
          </div>
        }
        open={openPaymentModal}
        onCancel={() => setOpenPaymentModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenPaymentModal(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={
              nextStatus === 2 ? handleConfirmPayment : handleAdditionalPayment
            }
            loading={processingPayment}
            disabled={!selectedPaymentMethod || paymentAmount <= 0}
          >
            Xác nhận thanh toán
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
      >
        {loadingPaymentMethods ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Spin tip="Đang tải phương thức thanh toán..." />
          </div>
        ) : (
          <Form layout="vertical">
            <div style={{ marginBottom: "24px" }}>
              <Typography.Text strong style={{ fontSize: "16px" }}>
                Chi tiết thanh toán:
              </Typography.Text>

              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>Tổng tiền hàng + phí vận chuyển:</Text>
                  <Text>
                    {formatCurrency(
                      (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0)
                    )}
                  </Text>
                </div>

                {invoice?.phieuGiamGia && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Text>Giảm giá:</Text>
                    <Text type="danger">
                      -{formatCurrency(getDiscountAmount() || 0)}
                    </Text>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>Tổng tiền đơn hàng:</Text>
                  <Text strong>
                    {formatCurrency(
                      (totalBeforeDiscount || 0) +
                        (invoice?.phiVanChuyen || 0) -
                        getDiscountAmount()
                    )}
                  </Text>
                </div>

                {/* Thông tin thanh toán */}
                {paymentHistory &&
                  paymentHistory.length > 0 &&
                  (() => {
                    const { actualPaidAmount, refundedAmount, pendingAmount } =
                      getPaymentSummary();
                    return (
                      <>
                        {actualPaidAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <Text>Đã thanh toán:</Text>
                            <Text type="success">
                              -{formatCurrency(actualPaidAmount)}
                            </Text>
                          </div>
                        )}

                        {refundedAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <Text>Đã hoàn tiền:</Text>
                            <Text type="warning">
                              +{formatCurrency(refundedAmount)}
                            </Text>
                          </div>
                        )}

                        {pendingAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <Text>Chờ thanh toán/trả sau:</Text>
                            <Text type="processing">
                              -{formatCurrency(pendingAmount)}
                            </Text>
                          </div>
                        )}
                      </>
                    );
                  })()}

                <Divider style={{ margin: "8px 0" }} />

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text strong>Cần thanh toán:</Text>
                  <Text type="danger" strong>
                    {formatCurrency(calculateRemainingPayment())}
                  </Text>
                </div>
              </div>
            </div>

            <Form.Item label="Chọn phương thức thanh toán" required>
              <Radio.Group
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {paymentMethods
                    .filter((method) => {
                      if (
                        invoice?.loaiHoaDon === 1 ||
                        invoice?.loaiHoaDon === 3
                      ) {
                        return method.maPhuongThucThanhToan !== "VNPAY";
                      } else {
                        return (
                          method.maPhuongThucThanhToan !== "COD" &&
                          method.maPhuongThucThanhToan !== "VNPAY"
                        );
                      }
                    })
                    .map((method) => (
                      <Radio.Button
                        key={method.id}
                        value={method.maPhuongThucThanhToan}
                        style={{
                          width: "100%",
                          height: "auto",
                          padding: "12px 16px",
                          marginBottom: "8px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {method.maPhuongThucThanhToan === "CASH" && (
                            <DollarOutlined
                              style={{
                                fontSize: "24px",
                                color: "#52c41a",
                                marginRight: "12px",
                              }}
                            />
                          )}
                          {method.maPhuongThucThanhToan === "BANK" && (
                            <CreditCardOutlined
                              style={{
                                fontSize: "24px",
                                color: "#1890ff",
                                marginRight: "12px",
                              }}
                            />
                          )}
                          {method.maPhuongThucThanhToan === "COD" && (
                            <CarOutlined
                              style={{
                                fontSize: "24px",
                                color: "#fa8c16",
                                marginRight: "12px",
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: "bold" }}>
                              {method.tenPhuongThucThanhToan}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "rgba(0,0,0,0.45)",
                              }}
                            >
                              {method.moTa}
                            </div>
                          </div>
                        </div>
                      </Radio.Button>
                    ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Số tiền thanh toán"
              required
              help="Nhập số tiền bạn muốn thanh toán"
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                value={paymentAmount}
                onChange={(value) => setPaymentAmount(value)}
                min={0}
                max={calculateRemainingPayment() * 1.1} // Cho phép thanh toán vượt 10% số tiền cần thanh toán
                step={1000}
                size="large"
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      {/* Confirm Delete Dialog */}
      <Modal
        title="Xác nhận xóa"
        visible={openConfirmDelete}
        onCancel={() => setOpenConfirmDelete(false)}
        onOk={handleConfirmDelete}
        okText="Xóa"
        cancelText="Hủy"
        centered
      >
        <Text>Bạn có chắc chắn muốn xóa sản phẩm này?</Text>
      </Modal>

      {/* Order History Dialog */}
      <Modal
        visible={openHistoryDialog}
        onCancel={() => setOpenHistoryDialog(false)}
        footer={[
          <Button key="close" onClick={() => setOpenHistoryDialog(false)}>
            Đóng
          </Button>,
        ]}
        width={1200}
        centered
      >
        {loadingHistory ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 16 }}
          >
            <Spin />
          </div>
        ) : (
          <>
            <Title level={5}>Lịch sử chuyển trạng thái</Title>
            <Input.Search
              placeholder="Tìm kiếm theo mô tả, người thực hiện..."
              style={{ marginBottom: 16 }}
              value={historySearchText}
              onChange={(e) => setHistorySearchText(e.target.value)}
              allowClear
            />
            <Table
              dataSource={orderHistory
                .filter(
                  (record) =>
                    record.moTa?.includes("Cập nhật trạng thái") ||
                    record.hanhDong?.includes("Cập nhật trạng thái") ||
                    record.hanhDong === "Hủy hóa đơn"
                )
                .filter((record) => {
                  if (!historySearchText) return true;
                  const searchLower = historySearchText.toLowerCase();
                  return (
                    (record.moTa || "").toLowerCase().includes(searchLower) ||
                    (record.tenNhanVien || "")
                      .toLowerCase()
                      .includes(searchLower) ||
                    (record.hanhDong || "")
                      .toLowerCase()
                      .includes(searchLower) ||
                    getStatusText(record.trangThai)
                      .toLowerCase()
                      .includes(searchLower)
                  );
                })
                // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
                .sort((a, b) => {
                  const dateA = new Date(a.ngayTao || a.ngaySua || 0);
                  const dateB = new Date(b.ngayTao || b.ngaySua || 0);
                  return dateB - dateA;
                })}
              columns={[
                {
                  title: "STT",
                  dataIndex: "index",
                  key: "index",
                  align: "center",
                  render: (text, record, index) => index + 1,
                  width: 50,
                },
                {
                  title: "Thời gian",
                  dataIndex: "ngayTao",
                  key: "ngayTao",
                  align: "center",
                  render: (text, record) =>
                    formatDate(record.ngayTao || record.ngaySua),
                  width: 180,
                  sorter: {
                    compare: (a, b) => {
                      const timeA = a.ngayTao
                        ? new Date(a.ngayTao).getTime()
                        : a.ngaySua
                        ? new Date(a.ngaySua).getTime()
                        : 0;
                      const timeB = b.ngayTao
                        ? new Date(b.ngayTao).getTime()
                        : b.ngaySua
                        ? new Date(b.ngaySua).getTime()
                        : 0;
                      return timeA - timeB;
                    },
                    multiple: 2,
                  },
                  defaultSortOrder: "descend",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "trangThai",
                  key: "trangThai",
                  align: "center",
                  render: (text) => (
                    <Tag
                      color={
                        text === 1
                          ? "orange"
                          : text === 2
                          ? "blue"
                          : text === 3
                          ? "cyan"
                          : text === 4
                          ? "purple"
                          : text === 5
                          ? "green"
                          : text === 6
                          ? "red"
                          : "default"
                      }
                    >
                      {getStatusText(text)}
                    </Tag>
                  ),
                  width: 150,
                  filters: [
                    { text: "Chờ xác nhận", value: 1 },
                    { text: "Đã xác nhận", value: 2 },
                    { text: "Chờ giao hàng", value: 3 },
                    { text: "Đang giao hàng", value: 4 },
                    { text: "Hoàn thành", value: 5 },
                    { text: "Đã hủy", value: 6 },
                  ],
                  onFilter: (value, record) => record.trangThai === value,
                },
                {
                  title: "Mô tả",
                  dataIndex: "moTa",
                  key: "moTa",
                  align: "center",
                  render: (text, record) => {
                    if (record.hanhDong === "Hủy hóa đơn") {
                      return (
                        <>
                          <Text>Hủy đơn hàng</Text>
                          <div
                            style={{
                              marginTop: 4,
                              color: "#ff4d4f",
                              fontStyle: "italic",
                              fontSize: "12px",
                            }}
                          >
                            {record.moTa
                              ? `Lý do: ${record.moTa.replace(
                                  /^Hóa đơn bị hủy:?\s*/,
                                  ""
                                )}`
                              : "---"}
                          </div>
                        </>
                      );
                    }
                    return text || "---";
                  },
                  width: 250,
                },
                {
                  title: "Người xác nhận",
                  dataIndex: "tenNhanVien",
                  key: "tenNhanVien",
                  align: "center",
                  render: (text) => text || "---",
                  width: 180,
                },
                {
                  title: "Ghi chú",
                  dataIndex: "hanhDong",
                  key: "hanhDong",
                  align: "center",
                  render: (text) => text || "---",
                  width: 180,
                },
              ]}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              rowKey={(record) =>
                `${record.id}-${record.ngayTao || record.ngaySua}`
              }
              locale={{ emptyText: "Không có lịch sử trạng thái" }}
              scroll={{ x: "max-content" }}
            />

            <Divider />

            <Title level={5}>Lịch sử đơn hàng</Title>
            <Input.Search
              placeholder="Tìm kiếm theo mô tả, người thực hiện..."
              style={{ marginBottom: 16 }}
              value={actionHistorySearchText}
              onChange={(e) => setActionHistorySearchText(e.target.value)}
              allowClear
            />
            <Table
              dataSource={orderHistory
                .filter(
                  (record) =>
                    !(
                      record.moTa?.includes("Cập nhật trạng thái") ||
                      record.hanhDong?.includes("Cập nhật trạng thái") ||
                      record.hanhDong === "Hủy hóa đơn"
                    )
                )
                .filter((record) => {
                  if (!actionHistorySearchText) return true;
                  const searchLower = actionHistorySearchText.toLowerCase();
                  return (
                    (record.moTa || "").toLowerCase().includes(searchLower) ||
                    (record.tenNhanVien || "")
                      .toLowerCase()
                      .includes(searchLower) ||
                    (record.hanhDong || "").toLowerCase().includes(searchLower)
                  );
                })}
              columns={[
                {
                  title: "STT",
                  dataIndex: "index",
                  key: "index",
                  align: "center",
                  render: (text, record, index) => index + 1,
                  width: 50,
                },
                {
                  title: "Thời gian",
                  dataIndex: ["ngayTao", "ngaySua"],
                  key: "ngayTaoOrNgaySua",
                  align: "center",
                  render: (text, record) => {
                    const displayDate = record.ngayTao
                      ? record.ngayTao
                      : record.ngaySua;
                    return formatDate(displayDate);
                  },
                  width: 180,

                  sorter: (a, b) => new Date(a.ngayTao) - new Date(b.ngayTao),
                },
                {
                  title: "Mô tả",
                  dataIndex: "moTa",
                  key: "moTa",
                  align: "center",
                  render: (text, record) => (
                    <>
                      {text || "---"}
                      {record.hanhDong === "Hủy hóa đơn" && record.moTa && (
                        <div
                          style={{
                            marginTop: 8,
                            color: "#ff4d4f",
                            fontStyle: "italic",
                            fontSize: "13px",
                          }}
                        >
                          {record.moTa.includes("Hóa đơn bị hủy")
                            ? null
                            : `Lý do: ${record.moTa}`}
                        </div>
                      )}
                    </>
                  ),
                  width: 300,
                },
                {
                  title: "Người thực hiện",
                  dataIndex: "tenNhanVien",
                  key: "tenNhanVien",
                  align: "center",
                  render: (text) => text || "---",
                  width: 180,
                },
                {
                  title: "Ghi chú",
                  dataIndex: "hanhDong",
                  key: "hanhDong",
                  align: "center",
                  render: (text, record) => (
                    <>
                      {text || "---"}
                      {record.hanhDong === "Hủy hóa đơn" && record.moTa && (
                        <div
                          style={{
                            marginTop: 8,
                            color: "#ff4d4f",
                            fontStyle: "italic",
                          }}
                        >
                          {record.moTa.includes("Hóa đơn bị hủy")
                            ? `Lý do: ${record.moTa.replace(
                                "Hóa đơn bị hủy: ",
                                ""
                              )}`
                            : `Lý do: ${record.moTa}`}
                        </div>
                      )}
                    </>
                  ),
                  width: 300,
                },
              ]}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              rowKey="id"
              locale={{ emptyText: "Không có lịch sử thay đổi" }}
              scroll={{ x: "max-content" }}
            />
          </>
        )}
      </Modal>
      {/* Modal xử lý thanh toán phụ phí hoặc hoàn tiền */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <WalletOutlined
              style={{
                fontSize: "24px",
                color: priceChangeAmount > 0 ? "#ff4d4f" : "#52c41a",
                marginRight: "12px",
              }}
            />
            <span>
              {priceChangeAmount > 0
                ? "Thanh toán phụ phí khi thay đổi giá"
                : "Hoàn tiền khi thay đổi giá"}
            </span>
          </div>
        }
        open={showPriceChangePaymentDialog}
        onCancel={() => setShowPriceChangePaymentDialog(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setShowPriceChangePaymentDialog(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type={priceChangeAmount > 0 ? "danger" : "primary"}
            onClick={handlePriceChangePayment}
            loading={processingPriceChangePayment}
            disabled={!selectedPaymentMethod}
          >
            {priceChangeAmount > 0 ? "Xác nhận thu thêm" : "Xác nhận hoàn tiền"}
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
      >
        <Alert
          message={
            priceChangeAmount > 0 ? "Cần thu thêm tiền" : "Cần hoàn tiền"
          }
          description={
            priceChangeAmount > 0
              ? "Giá sản phẩm đã tăng so với thời điểm đặt hàng. Bạn cần thu thêm phụ phí từ khách hàng."
              : "Giá sản phẩm đã giảm so với thời điểm đặt hàng. Hệ thống sẽ tự động điều chỉnh nếu có thanh toán đang chờ xác nhận hoặc trả sau, hoặc hoàn tiền cho khách nếu đã thanh toán đủ."
          }
          type={priceChangeAmount > 0 ? "error" : "success"}
          showIcon
          style={{ marginBottom: "20px" }}
        />

        {/* Kiểm tra có thanh toán chờ xác nhận hoặc trả sau không */}
        {priceChangeAmount < 0 &&
          paymentHistory.some(
            (p) => p.trangThai === 2 || p.trangThai === 3
          ) && (
            <Alert
              message="Có thanh toán chờ xác nhận hoặc trả sau"
              description="Hệ thống sẽ tự động điều chỉnh số tiền trong các khoản thanh toán chờ xác nhận hoặc trả sau."
              type="info"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}

        <div style={{ marginBottom: "24px" }}>
          <Typography.Text strong style={{ fontSize: "16px" }}>
            Chi tiết thay đổi giá:
          </Typography.Text>

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            {changedProducts.map((product, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  padding: "8px 0",
                  borderBottom:
                    index < changedProducts.length - 1
                      ? "1px dashed #d9d9d9"
                      : "none",
                }}
              >
                <div>
                  <Text>
                    {product.tenSanPham} (x{product.soLuong})
                  </Text>
                  <div>
                    <Text delete type="secondary" style={{ fontSize: "12px" }}>
                      {formatCurrency(product.giaTaiThoiDiemThem)}
                    </Text>
                    {" → "}
                    <Text
                      type={product.chenhLech > 0 ? "danger" : "success"}
                      style={{ fontSize: "12px" }}
                    >
                      {formatCurrency(product.giaHienTai)}
                    </Text>
                  </div>
                </div>
                <Text type={product.chenhLech > 0 ? "danger" : "success"}>
                  {product.chenhLech > 0 ? "+" : ""}
                  {formatCurrency(product.chenhLech * product.soLuong)}
                </Text>
              </div>
            ))}

            <Divider style={{ margin: "8px 0" }} />
            {/* Thông tin thanh toán */}
            {paymentHistory &&
              paymentHistory.length > 0 &&
              priceChangeAmount < 0 &&
              (() => {
                const { actualPaidAmount, refundedAmount, pendingAmount } =
                  getPaymentSummary();
                return (
                  <>
                    {actualPaidAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>Đã thanh toán:</Text>
                        <Text type="success">
                          {formatCurrency(actualPaidAmount)}
                        </Text>
                      </div>
                    )}

                    {refundedAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>Đã hoàn tiền:</Text>
                        <Text type="warning">
                          -{formatCurrency(refundedAmount)}
                        </Text>
                      </div>
                    )}

                    {pendingAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>Chờ thanh toán/trả sau:</Text>
                        <Text type="processing">
                          {formatCurrency(pendingAmount)}
                        </Text>
                      </div>
                    )}
                  </>
                );
              })()}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng thay đổi:</Text>
              <Text type={priceChangeAmount > 0 ? "danger" : "success"} strong>
                {priceChangeAmount > 0 ? "+" : ""}
                {formatCurrency(Math.abs(priceChangeAmount))}
              </Text>
            </div>
          </div>
        </div>

        {(priceChangeAmount > 0 ||
          (priceChangeAmount < 0 &&
            !paymentHistory.some(
              (p) => p.trangThai === 2 || p.trangThai === 3
            ))) && (
          <Form.Item
            label={
              priceChangeAmount > 0
                ? "Chọn phương thức thanh toán"
                : "Chọn phương thức hoàn tiền"
            }
            required
          >
            <Radio.Group
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {paymentMethods
                  .filter(
                    (method) =>
                      method.maPhuongThucThanhToan !== "COD" &&
                      method.maPhuongThucThanhToan !== "VNPAY"
                  )
                  .map((method) => (
                    <Radio.Button
                      key={method.id}
                      value={method.maPhuongThucThanhToan}
                      style={{
                        width: "100%",
                        height: "auto",
                        padding: "12px 16px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {method.maPhuongThucThanhToan === "CASH" && (
                          <DollarOutlined
                            style={{
                              fontSize: "24px",
                              color: "#52c41a",
                              marginRight: "12px",
                            }}
                          />
                        )}
                        {method.maPhuongThucThanhToan === "BANK" && (
                          <CreditCardOutlined
                            style={{
                              fontSize: "24px",
                              color: "#1890ff",
                              marginRight: "12px",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                            {method.tenPhuongThucThanhToan}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.45)",
                            }}
                          >
                            {method.moTa}
                          </div>
                        </div>
                      </div>
                    </Radio.Button>
                  ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
      </Modal>
      {/* Error Dialog */}
      <Modal
        title="Lỗi"
        visible={errorDialogOpen}
        onCancel={handleErrorDialogClose}
        footer={[
          <Button key="close" onClick={handleErrorDialogClose}>
            Đóng
          </Button>,
        ]}
        centered
      >
        <Text>{errorDialogMessage}</Text>
      </Modal>

      {/* Modal cảnh báo thay đổi giá */}
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
        bodyStyle={{ padding: "16px", maxHeight: "70vh", overflow: "auto" }}
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
                    Tổng thay đổi: {priceChangeAmount > 0 ? "+" : ""}
                    {formatCurrency(priceChangeAmount)}{" "}
                    {priceChangeAmount > 0 ? "(phụ phí)" : "(hoàn tiền)"}
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
              bodyStyle={{ padding: 16 }}
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
                        {product.chatLieu && (
                          <>
                            <Divider
                              type="vertical"
                              style={{ margin: "0 12px" }}
                            />
                            <div>
                              <span style={{ color: "#666" }}>Chất liệu: </span>
                              <span>{product.chatLieu}</span>
                            </div>
                          </>
                        )}
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
    </div>
  );
}
export default InvoiceDetail;
