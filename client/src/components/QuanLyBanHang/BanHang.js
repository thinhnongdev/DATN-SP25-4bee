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
  CreditCardOutlined,
  BankOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { BiQrScan } from "react-icons/bi";
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
  VNPAY: "VNPAY",
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
  // Thêm state để quản lý interval
  const [pollingInterval, setPollingInterval] = useState(null);
  // Thêm vào khai báo state ở đầu component BanHang
  const [processingVnpay, setProcessingVnpay] = useState(false);
  const PAYMENT_RULES = {
    VNPAY_EXCLUSIVE:
      "VNPAY phải được thanh toán độc lập, không kết hợp với các phương thức khác",
    QR_CASH_ONLY: "Chỉ có thể kết hợp thanh toán QR với tiền mặt",
    CASH_EXCESS:
      "Khách trả tiền mặt thừa, sẽ tính tiền thừa và tắt phương thức khác",
    AUTO_CALCULATE: "Khi có nhiều phương thức, số tiền sẽ được phân bổ tự động",
    COD_EXCLUSIVE:
      "COD phải được thanh toán độc lập, không kết hợp với các phương thức khác",
  };
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
              VNPAY phải được thanh toán độc lập, không kết hợp với các phương
              thức khác
            </li>
            <li>Chỉ có thể kết hợp QR và Tiền mặt khi thanh toán</li>
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
  // Tối ưu hàm xử lý thanh toán VNPAY
  const handleVnpayPayment = async (hoaDonId) => {
    try {
      setProcessingVnpay(true);
      message.loading({
        content: "Đang xử lý thanh toán VNPAY...",
        key: "vnpayProcessing",
        duration: 0,
      });

      // Lấy thông tin order hiện tại
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!currentOrder) {
        message.error({
          content: "Không thể tìm thấy thông tin đơn hàng",
          key: "vnpayProcessing",
        });
        setProcessingVnpay(false);
        return;
      }

      // Kiểm tra đơn hàng có sản phẩm không
      const currentProducts = orderProducts[hoaDonId] || [];
      if (!currentProducts || currentProducts.length === 0) {
        message.error({
          content: "Vui lòng thêm sản phẩm vào đơn hàng trước khi thanh toán",
          key: "vnpayProcessing",
        });
        setProcessingVnpay(false);
        return;
      }

      // Kiểm tra thay đổi giá kỹ hơn
      if (!priceChangesConfirmed[hoaDonId]) {
        const hasPriceChanges = await checkPriceChanges(false);
        if (hasPriceChanges) {
          message.warning({
            content:
              "Có sản phẩm thay đổi giá, vui lòng xác nhận thay đổi giá trước khi thanh toán VNPAY!",
            key: "vnpayProcessing",
          });
          setOpenPriceChangeDialog(true);
          setProcessingVnpay(false);
          return;
        }
      }

      // Xác nhận priceChangesConfirmed cho tab hiện tại
      setPriceChangesConfirmed((prev) => ({
        ...prev,
        [hoaDonId]: true,
      }));

      // Đặt lại các cảnh báo về thay đổi giá
      setPriceNeedsConfirmation(false);
      setOpenPriceChangeDialog(false);

      // Lấy tổng tiền chính xác bao gồm phí vận chuyển từ totals
      const orderTotal = Math.round(totals[hoaDonId]?.finalTotal || 0); // Làm tròn số tiền

      // Tìm thanh toán VNPAY trong danh sách thanh toán
      const vnpayPayment = currentOrder?.thanhToans?.find(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY
      );

      if (!vnpayPayment || vnpayPayment.soTien <= 0) {
        message.error({
          content: "Vui lòng nhập số tiền thanh toán VNPAY",
          key: "vnpayProcessing",
        });
        setProcessingVnpay(false);
        return;
      }

      // Hiển thị thông tin debug chi tiết hơn
      console.log("VNPAY payment details:", {
        hoaDonId,
        orderTotal,
        originalAmount: vnpayPayment.soTien,
        includesShipping: true,
        shippingFee: totals[hoaDonId]?.shippingFee || 0,
        discount: totals[hoaDonId]?.discountAmount || 0,
      });

      // QUAN TRỌNG: Cập nhật số tiền vnpayPayment để đảm bảo bằng tổng số tiền thanh toán
      // điều này đảm bảo phí vận chuyển được tính vào
      if (vnpayPayment.soTien !== orderTotal) {
        console.log(
          `Cập nhật số tiền thanh toán VNPAY từ ${vnpayPayment.soTien} thành ${orderTotal}`
        );

        // Cập nhật số tiền trong state
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId
              ? {
                  ...tab,
                  order: {
                    ...tab.order,
                    thanhToans: tab.order.thanhToans.map((p) =>
                      p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY
                        ? { ...p, soTien: orderTotal }
                        : p
                    ),
                  },
                }
              : tab
          )
        );
      }

      // Xử lý các phương thức thanh toán khác nếu có (để tổng tiền không vượt quá đơn hàng)
      const otherPayments = currentOrder.thanhToans.filter(
        (p) => p.maPhuongThucThanhToan !== PAYMENT_METHOD.VNPAY && p.soTien > 0
      );

      if (otherPayments.length > 0) {
        // Hiển thị cảnh báo nếu có phương thức thanh toán khác
        Modal.confirm({
          title: "Xác nhận thanh toán VNPAY",
          content:
            "Đơn hàng này đã có phương thức thanh toán khác. Bạn có muốn chỉ sử dụng VNPAY để thanh toán toàn bộ đơn hàng?",
          okText: "Thanh toán chỉ bằng VNPAY",
          cancelText: "Hủy",
          onOk: async () => {
            // Cập nhật state để chỉ sử dụng VNPAY
            setTabs((prev) =>
              prev.map((tab) =>
                tab.key === hoaDonId
                  ? {
                      ...tab,
                      order: {
                        ...tab.order,
                        thanhToans: tab.order.thanhToans.map((p) =>
                          p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY
                            ? { ...p, soTien: orderTotal }
                            : { ...p, soTien: 0 }
                        ),
                      },
                    }
                  : tab
              )
            );

            // Tiếp tục xử lý thanh toán VNPAY
            await processVnpayPayment(hoaDonId, orderTotal, currentOrder);
          },
          onCancel: () => {
            setProcessingVnpay(false);
          },
        });
      } else {
        // Nếu không có phương thức thanh toán khác, tiếp tục với VNPAY
        await processVnpayPayment(hoaDonId, orderTotal, currentOrder);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán VNPAY:", error);
      message.error({
        content:
          "Lỗi khi xử lý thanh toán VNPAY: " +
          (error.response?.data?.message || error.message),
        key: "vnpayProcessing",
      });
      setProcessingVnpay(false);
    }
  };

  // Tách phần gọi API ra thành một hàm riêng để dễ quản lý
  const processVnpayPayment = async (hoaDonId, orderTotal, currentOrder) => {
    try {
      // Gọi API để tạo URL thanh toán VNPAY với tổng tiền chính xác
      const response = await api.post(
        `/api/admin/hoa-don/${hoaDonId}/create-vnpay-payment`,
        {
          paymentAmount: orderTotal, // Quan trọng: Sử dụng orderTotal
          paymentId: `${hoaDonId}_VNPAY`,
          orderInfo: `Thanh toan don hang ${currentOrder.maHoaDon || hoaDonId}`,
        },
        {
          params: {
            returnUrl: window.location.origin + "/admin/ban-hang",
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // Lưu ID hóa đơn vào localStorage để kiểm tra khi quay lại
        localStorage.setItem("vnpayHoaDonId", hoaDonId);

        // Hiển thị thông báo xác nhận trước khi chuyển hướng
        Modal.success({
          title: "Chuyển hướng đến cổng thanh toán VNPAY",
          content: (
            <>
              <p>
                Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao
                dịch.
              </p>
              <p>
                Số tiền thanh toán: <b>{formatCurrency(orderTotal)}</b>
              </p>
              <p>
                Vui lòng không đóng trình duyệt cho đến khi hoàn tất quá trình
                thanh toán.
              </p>
            </>
          ),
          okText: "Đến trang thanh toán",
          onOk: () => {
            // Mở cửa sổ mới cho thanh toán VNPAY
            window.open(response.data, "_blank");

            message.success({
              content:
                "Đã chuyển hướng đến trang thanh toán VNPAY. Vui lòng hoàn tất thanh toán.",
              key: "vnpayProcessing",
              duration: 10,
            });
          },
        });
      } else {
        message.error({
          content: "Không thể tạo liên kết thanh toán VNPAY",
          key: "vnpayProcessing",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán VNPAY:", error);
      message.error({
        content:
          "Lỗi khi tạo URL thanh toán: " +
          (error.response?.data?.message || error.message),
        key: "vnpayProcessing",
      });
    } finally {
      setProcessingVnpay(false);
    }
  };

  // Tối ưu hàm xác nhận thanh toán VNPAY
  const confirmVnpayPayment = async (hoaDonId) => {
    try {
      setProcessingVnpay(true);
      message.loading({
        content: "Đang xác nhận thanh toán VNPAY...",
        key: "vnpayConfirm",
        duration: 0,
      });

      // Lấy tất cả tham số từ URL trả về từ VNPAY
      const urlParams = new URLSearchParams(window.location.search);
      const vnpParams = {};

      // Chuyển tất cả tham số vnp_ từ URL vào đối tượng để gửi đến server
      urlParams.forEach((value, key) => {
        if (key.startsWith("vnp_")) {
          vnpParams[key] = value;
        }
      });

      console.log("VNPAY response params:", vnpParams);

      if (Object.keys(vnpParams).length === 0) {
        message.error({
          content: "Không tìm thấy thông tin thanh toán VNPAY",
          key: "vnpayConfirm",
        });
        setProcessingVnpay(false);
        return;
      }

      // Gửi tất cả tham số vnp_ lên server để xác nhận thanh toán
      const response = await api.post(
        `/api/admin/hoa-don/${hoaDonId}/confirm-vnpay-payment`,
        vnpParams,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        message.success({
          content: "Thanh toán VNPAY đã được xác nhận thành công!",
          key: "vnpayConfirm",
        });

        // Cập nhật lại thông tin đơn hàng
        await fetchInvoiceById(hoaDonId);
        localStorage.removeItem("vnpayHoaDonId");

        // Xóa các tham số VNPAY khỏi URL để tránh xử lý lại
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán VNPAY:", error);
      message.error({
        content:
          "Không thể xác nhận thanh toán VNPAY: " +
          (error.response?.data?.message || error.message),
        key: "vnpayConfirm",
      });
    } finally {
      setProcessingVnpay(false);
    }
  };

  // Thêm useEffect để kiểm tra trạng thái VNPAY khi quay lại trang
  useEffect(() => {
    const checkVnpayPayment = async () => {
      try {
        // Lấy thông tin hoaDonId từ localStorage
        const hoaDonId = localStorage.getItem("vnpayHoaDonId");

        // Lấy tham số từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const vnpResponseCode = urlParams.get("vnp_ResponseCode");

        if (hoaDonId && urlParams.toString().includes("vnp_")) {
          // Thu thập tất cả tham số vnp_
          const vnpParams = {};
          urlParams.forEach((value, key) => {
            if (key.startsWith("vnp_")) {
              vnpParams[key] = value;
            }
          });

          if (vnpResponseCode === "00") {
            // Thanh toán thành công
            message.loading({
              content: "Đang xác nhận thanh toán VNPAY...",
              key: "vnpayConfirm",
            });

            // Gửi tất cả tham số từ VNPAY để backend xử lý
            const response = await api.post(
              `/api/admin/hoa-don/${hoaDonId}/confirm-vnpay-payment`,
              vnpParams,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
              message.success({
                content: "Thanh toán VNPay đã được xác nhận thành công!",
                key: "vnpayConfirm",
              });

              // Reset các state liên quan đến thay đổi giá trước khi hoàn tất
              setPriceNeedsConfirmation(false);
              setChangedProducts([]);
              setPriceChangeAmount(0);
              setOpenPriceChangeDialog(false);

              // In hóa đơn ngay sau khi xác nhận thành công
              await completeOrderProcess(hoaDonId);

              // Xóa tham số VNPay khỏi URL
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } else {
            message.error({
              content: `Thanh toán VNPAY không thành công (Mã lỗi: ${
                vnpResponseCode || "không xác định"
              })`,
              key: "vnpayConfirm",
            });
          }

          // Xóa dữ liệu trong localStorage và URL param để tránh xác nhận lại
          localStorage.removeItem("vnpayHoaDonId");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra kết quả thanh toán VNPAY:", error);
        message.error(
          "Không thể xác nhận thanh toán VNPAY: " +
            (error.response?.data?.message || error.message)
        );
      }
    };

    checkVnpayPayment();
  }, []);

  // Tối ưu hàm render nút thanh toán VNPAY
  const renderVnpaySection = (order, payment) => {
    if (!payment || payment.soTien <= 0) return null;

    const paymentAmount = formatCurrency(payment.soTien);

    return (
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Button
          type="primary"
          icon={<CreditCardOutlined />}
          onClick={() => handleVnpayPayment(order.id)}
          loading={processingVnpay}
          style={{
            width: "100%",
            background: "#2a5ada",
            borderColor: "#2a5ada",
            height: "40px",
            fontSize: "14px",
          }}
        >
          Thanh toán {paymentAmount} qua VNPAY
        </Button>
        <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
          Thanh toán trực tuyến an toàn qua cổng VNPAY
        </div>
      </div>
    );
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

    // Lấy phí vận chuyển
    let shippingFee = order.phiVanChuyen || 0;

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

    // THAY ĐỔI: Chỉ miễn phí vận chuyển cho đơn ≥ 2 triệu sau giảm giá
    // KHÔNG miễn phí vận chuyển cho đơn giảm giá 100% trừ khi giá trị ban đầu ≥ 2 triệu
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
                  Authorization: `Bearer ${token}`,
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

    // THAY ĐỔI: Đơn giao hàng được giảm 100% vẫn tính phí ship bình thường
    // nếu không đạt điều kiện miễn phí vận chuyển (≥ 2 triệu sau giảm giá)
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    return {
      subtotal,
      shippingFee,
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
    if (!address || !address.id) {
      message.error("Vui lòng chọn một địa chỉ hợp lệ.");
      return;
    }
    // So sánh với địa chỉ hiện tại để tránh cập nhật không cần thiết
    if (selectedAddress && selectedAddress.id === address.id) {
      return; // Không cập nhật nếu địa chỉ không thay đổi
    }
    setSelectedAddress(address);
    console.log("Đã chọn địa chỉ giao hàng:", address);

    if (!activeKey) {
      message.warning("Không tìm thấy hóa đơn để cập nhật địa chỉ.");
      return;
    }

    const payload = {
      diaChiId: address.id,
      diaChiCuThe: address.diaChiCuThe,
      xa: address.xa,
      huyen: address.huyen,
      tinh: address.tinh,
    };

    console.log("Gửi request cập nhật địa chỉ:", payload);

    try {
      await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${activeKey}/update-address`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      if (activeKey) {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.key === activeKey
              ? { ...tab, order: { ...tab.order, diaChiGiaoHang: address } }
              : tab
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ vào hóa đơn:", error);
      // message.error("Không thể cập nhật địa chỉ giao hàng, vui lòng thử lại.");
    }
  };

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
  // Cập nhật useEffect cho việc chọn tab để tải lại dữ liệu chính xác
  useEffect(() => {
    if (activeKey) {
      console.log("Tab changed to:", activeKey);

      const currentOrder = tabs.find((tab) => tab.key === activeKey)?.order;

      // Cập nhật selectedCustomer và selectedAddress theo tab hiện tại
      if (currentOrder) {
        // Reset selectedAddress để tránh dữ liệu từ tab trước bị lưu lại
        setSelectedAddress(null);
        setSelectedCustomer(currentOrder.khachHang || null);

        // Đảm bảo dữ liệu order có giá trị đúng
        if (currentOrder.phieuGiamGia) {
          // Đảm bảo loaiPhieuGiamGia là số nguyên
          currentOrder.phieuGiamGia.loaiPhieuGiamGia = parseInt(
            currentOrder.phieuGiamGia.loaiPhieuGiamGia,
            10
          );
          console.log(
            "Loại voucher sau chuyển đổi:",
            currentOrder.phieuGiamGia.loaiPhieuGiamGia
          );
        }
      } else {
        setSelectedCustomer(null);
        setSelectedAddress(null);
      }

      // Tải lại thông tin hóa đơn từ server
      fetchInvoiceById(activeKey).then(() => {
        // Sau khi có dữ liệu mới, tính toán lại tổng tiền
        const newTotals = calculateOrderTotals(activeKey);
        setTotals((prev) => ({
          ...prev,
          [activeKey]: newTotals,
        }));

        // Cập nhật UI
        setTotalBeforeDiscount(newTotals.subtotal);
        setTotalAmount(newTotals.finalTotal);

        // Tìm voucher tốt hơn và gợi ý
        findBestVoucherAndSuggest(activeKey);
      });

      // Đặt lại pagination
      setPagination({ current: 1, pageSize: 3 });
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
        `http://localhost:8080/api/admin/ban-hang/${activeKey}/add-product`,
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

        // THÊM DÒNG NÀY: Kiểm tra trực tiếp xem sản phẩm đã được thêm thành công chưa
        if (!updatedProducts || updatedProducts.length === 0) {
          message.error("Không thể thêm sản phẩm vào đơn hàng");
          return;
        }

        message.destroy(addToastId);
        message.success(
          `Đã thêm ${quantity} sản phẩm ${product.tenSanPham} vào đơn hàng`
        );

        // Đảm bảo sản phẩm đã được thêm thành công trước khi áp dụng voucher
        setTimeout(() => {
          autoApplyBestVoucher(activeKey);
        }, 500); // Tăng thời gian chờ để đảm bảo state đã được cập nhật
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
      // Lấy thông tin sản phẩm trước khi xóa để biết số lượng và ID sản phẩm
      const productToRemove = orderProducts[hoaDonId]?.find(
        (p) => p.id === hoaDonChiTietId
      );

      if (!productToRemove) {
        message.error("Không tìm thấy thông tin sản phẩm cần xóa");
        return;
      }

      const productId = productToRemove.sanPhamChiTietId || productToRemove.id;
      const quantity = productToRemove.soLuong || 0;

      // Cập nhật UI trước để tạo trải nghiệm người dùng mượt mà
      const updatedProducts = orderProducts[hoaDonId].filter(
        (product) => product.id !== hoaDonChiTietId
      );

      // Kiểm tra xem đây có phải là sản phẩm cuối cùng trong đơn hàng không
      const isLastProduct = updatedProducts.length === 0;

      setOrderProducts((prev) => ({ ...prev, [hoaDonId]: updatedProducts }));

      // Gọi API để xóa sản phẩm khỏi hóa đơn
      await api.delete(
        `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      // Cập nhật tồn kho trong cache (cộng lại số lượng đã xóa)
      if (productId && quantity > 0) {
        updateProductInventoryInCache(productId, quantity);
      }

      // Lấy thông tin hóa đơn hiện tại
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

      // Nếu đã xóa hết sản phẩm, tự động xóa voucher khỏi đơn hàng
      if (isLastProduct && currentOrder?.phieuGiamGia) {
        await handleRemoveVoucher(hoaDonId, false); // false = không hiển thị thông báo

        // Cập nhật UI ngay lập tức khi xóa voucher
        setTabs((prev) =>
          prev.map((tab) => {
            if (tab.key === hoaDonId) {
              const updatedOrder = { ...tab.order };
              delete updatedOrder.phieuGiamGia;
              updatedOrder.giamGia = 0;
              return { ...tab, order: updatedOrder };
            }
            return tab;
          })
        );

        message.info("Đã xóa voucher do đơn hàng không còn sản phẩm");
      } else {
        // Tính lại tổng tiền trước khi áp dụng voucher
        const newTotalBeforeVoucher =
          calculateTotalBeforeDiscount(updatedProducts) +
          (currentOrder?.phiVanChuyen || 0);

        // Kiểm tra nếu voucher hiện tại không còn hợp lệ (dưới mức tối thiểu)
        if (
          currentOrder?.phieuGiamGia &&
          newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
        ) {
          await handleRemoveVoucher(hoaDonId);
          message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
        }
      }

      // Cập nhật tổng tiền sau khi xóa sản phẩm
      const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));

      // Cập nhật UI hiển thị nếu đang ở tab này
      if (hoaDonId === activeKey) {
        setTotalBeforeDiscount(newTotals.subtotal);
        setTotalAmount(newTotals.finalTotal);
      }

      // Nếu vẫn còn sản phẩm, tự động áp dụng mã giảm giá tốt nhất
      if (!isLastProduct) {
        await autoApplyBestVoucher(hoaDonId);
      }

      // Tải lại danh sách sản phẩm và gợi ý voucher
      await fetchInvoiceProducts(hoaDonId);

      // Không tìm voucher nếu đã xóa hết sản phẩm
      if (!isLastProduct) {
        await findBestVoucherAndSuggest(hoaDonId);
      } else {
        // Nếu không còn sản phẩm, reset gợi ý voucher
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
        });
      }

      message.success("Đã xóa sản phẩm khỏi đơn hàng");

      // Fetch dữ liệu mới sau khi xóa
      await fetchLatestData();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);

      // Hiển thị thông báo lỗi chi tiết nếu có
      let errorMessage = "Lỗi khi xóa sản phẩm";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      message.error(errorMessage);

      // Tải lại dữ liệu từ server để đảm bảo tính nhất quán
      await fetchInvoiceProducts(hoaDonId);
    }
  };

  // 6. Apply voucher
  const handleVoucherSelected = async (hoaDonId, voucherId) => {
    try {
      console.log(" Áp dụng voucher:", { hoaDonId, voucherId });

      if (!hoaDonId || !voucherId) {
        message.error("Không thể áp dụng voucher");
        return;
      }

      const response = await api.post(
        `/api/admin/hoa-don/${hoaDonId}/voucher`,
        { voucherId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      if (!response.data) {
        throw new Error(" Dữ liệu trả về từ API không hợp lệ.");
      }

      const updatedOrder = response.data;
      // Tải lại danh sách sản phẩm để có thông tin chính xác
      const updatedProducts = await fetchInvoiceProducts(hoaDonId, true);

      // Tính toán tổng tiền chính xác sau khi áp dụng voucher
      const newTotals = calculateOrderTotals(
        hoaDonId,
        updatedProducts,
        updatedOrder
      );

      console.log("📌 Debug - Tổng tiền sau khi áp dụng voucher:", newTotals);

      //  Cập nhật state theo đúng trình tự
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
        )
      );

      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));

      if (hoaDonId === activeKey) {
        setTotalBeforeDiscount(newTotals.subtotal);
        setTotalAmount(newTotals.finalTotal);
      }

      setOpenVoucherDialog(false);
      message.success("🎉 Áp dụng voucher thành công!");
    } catch (error) {
      console.error(" Lỗi khi áp dụng voucher:", error);
      message.error("Lỗi khi áp dụng voucher, vui lòng thử lại.");
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

      const hasVnpay = validPayments.some(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY
      );

      const hasCod = validPayments.some(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.COD
      );

      // Nếu có VNPAY và có phương thức khác, hiển thị thông báo lỗi
      if (hasVnpay && validPayments.length > 1) {
        message.error(
          "VNPAY phải được sử dụng độc lập, không kết hợp với các phương thức khác!"
        );
        return;
      }
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

      const vnpayPayment = validPayments.find(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY
      );

      // Bước 0: Xử lý thanh toán VNPAY trước (nếu có) vì cần chuyển hướng tới cổng thanh toán
      if (vnpayPayment && vnpayPayment.soTien > 0) {
        try {
          await handleVnpayPayment(hoaDonId);
          return; // Trả về luôn vì VNPAY sẽ chuyển hướng người dùng
        } catch (error) {
          console.error("Lỗi khi xử lý thanh toán VNPAY:", error);
          message.error(
            "Lỗi khi xử lý thanh toán VNPAY: " +
              (error.response?.data?.message || error.message)
          );
          return;
        }
      }

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

  // Cập nhật lại findBestVoucherAndSuggest để chỉ hiện voucher tốt hơn
  const findBestVoucherAndSuggest = async (hoaDonId) => {
    try {
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!order) {
        return;
      }
  
      // Tắt hiển thị gợi ý trong khi đang tải
      setVoucherSuggestions({
        show: false,
        betterVouchers: [],
      });
  
      // Kiểm tra nếu không có sản phẩm, không cần gợi ý
      const currentProducts = orderProducts[hoaDonId] || [];
      if (currentProducts.length === 0) {
        return;
      }
  
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
        // Chỉ hiển thị các voucher tốt hơn voucher hiện tại
        const enhancedVouchers = data.betterVouchers.map(voucher => ({
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
          isBetterThanCurrent: voucher.isBetter
        }));
  
        // Chỉ hiển thị gợi ý khi có voucher tốt hơn
        setVoucherSuggestions({
          show: enhancedVouchers.length > 0,
          betterVouchers: enhancedVouchers,
        });
      } else {
        // Nếu không có voucher gợi ý, ẩn gợi ý
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm voucher tốt hơn:", error);
      setVoucherSuggestions({
        show: false,
        betterVouchers: [],
      });
    }
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

      // Cập nhật state tabs
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.key === activeKey
            ? { ...tab, order: { ...tab.order, phiVanChuyen: fee } }
            : tab
        )
      );

      // Cập nhật totals để hiển thị đúng tổng tiền
      setTotals((prevTotals) => {
        const currentTotal = prevTotals[activeKey] || {};
        return {
          ...prevTotals,
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
            {voucherSuggestions.show &&
              voucherSuggestions.betterVouchers?.length > 0 && (
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
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                      <InfoCircleOutlined style={{ marginRight: 8 }} />
                      {order.phieuGiamGia
                        ? `${voucherSuggestions.betterVouchers.length} voucher tốt hơn voucher hiện tại`
                        : `${voucherSuggestions.betterVouchers.length} voucher có thể áp dụng cho đơn hàng`}
                    </Text>
                    
                    {voucherSuggestions.betterVouchers.map((voucher, index) => {
                      return (
                        <Card
                          key={voucher.id}
                          size="small"
                          bordered={true}
                          style={{
                            background: "#fff",
                            marginBottom: "12px",
                            borderLeft: "4px solid #52c41a"
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
                              onClick={() => handleApplySuggestedVoucher(order.id, voucher.id)}
                              disabled={!voucher.canApply}
                            >
                              {voucher.canApply ? "Áp dụng" : "Chưa đủ"}
                            </Button>
                          }
                        >
                          <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            <div>
                              <Text style={{ fontSize: "14px" }}>
                                {voucher.loaiPhieuGiamGia === 1
                                  ? `Giảm ${
                                      voucher.giaTriGiam
                                    }% (tối đa ${formatCurrency(
                                      voucher.soTienGiamToiDa
                                    )})`
                                  : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: "13px" }}>
                                Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: "13px" }}>
                                Giá trị giảm: {formatCurrency(voucher.discountAmount)}
                              </Text>
                              
                              {/* Hiển thị số tiền tiết kiệm thêm */}
                              {voucher.additionalSavings > 0 && (
                                <div style={{ marginTop: 5 }}>
                                  <Text type="success">
                                    <ArrowUpOutlined /> Tiết kiệm thêm {formatCurrency(voucher.additionalSavings)}
                                  </Text>
                                </div>
                              )}
                            </div>
            
                            {/* Hiển thị thông tin số tiền cần mua thêm */}
                            {voucher.amountNeeded > 0 && (
                              <Alert
                                type="warning"
                                message={
                                  <Space>
                                    <InfoCircleOutlined />
                                    <Text style={{ fontSize: "13px" }}>
                                      Cần mua thêm{" "}
                                      <Text strong style={{ color: "#ff4d4f" }}>
                                        {formatCurrency(voucher.amountNeeded)}
                                      </Text>{" "}
                                      để áp dụng mã
                                    </Text>
                                  </Space>
                                }
                                style={{
                                  marginBottom: 8,
                                  fontSize: "13px",
                                  padding: "8px 12px",
                                }}
                              />
                            )}
            
                            {voucher.amountNeeded === 0 && (
                              <Alert
                                type="success"
                                message={
                                  <Space>
                                    <CheckCircleOutlined />
                                    <Text style={{ fontSize: "13px" }}>
                                      Đã đủ điều kiện áp dụng
                                    </Text>
                                  </Space>
                                }
                                style={{
                                  marginBottom: 8,
                                  fontSize: "13px",
                                  padding: "8px 12px",
                                }}
                              />
                            )}
                          </Space>
                        </Card>
                      );
                    })}
                  </Space>
                </div>
              )}

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
                      key={PAYMENT_METHOD.VNPAY}
                      value={PAYMENT_METHOD.VNPAY}
                      label="VNPAY"
                      disabled={order.thanhToans?.some(
                        (p) =>
                          (p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH ||
                            p.maPhuongThucThanhToan === PAYMENT_METHOD.QR ||
                            p.maPhuongThucThanhToan === PAYMENT_METHOD.COD) &&
                          p.soTien > 0
                      )}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CreditCardOutlined style={{ marginRight: 8 }} />
                        VNPAY
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          Thanh toán độc lập
                        </Tag>
                      </div>
                    </Select.Option>

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
                              p.maPhuongThucThanhToan === PAYMENT_METHOD.QR ||
                              p.maPhuongThucThanhToan ===
                                PAYMENT_METHOD.VNPAY) &&
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
                          (p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY ||
                            p.maPhuongThucThanhToan === PAYMENT_METHOD.COD) &&
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
                          (p.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY ||
                            p.maPhuongThucThanhToan === PAYMENT_METHOD.COD) &&
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
                          : payment.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.VNPAY
                          ? "#2a5ada"
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
                            PAYMENT_METHOD.VNPAY && (
                            <CreditCardOutlined style={{ color: "#2a5ada" }} />
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

                    {/* Hiển thị nút thanh toán VNPAY nếu là phương thức VNPAY và có số tiền */}
                    {payment.maPhuongThucThanhToan === PAYMENT_METHOD.VNPAY &&
                      payment.soTien > 0 &&
                      renderVnpaySection(order, payment)}
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
                              PAYMENT_METHOD.VNPAY && (
                              <CreditCardOutlined
                                style={{ color: "#2a5ada" }}
                              />
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
    const isDelivery = method === "giaoHang";
    const loaiHoaDon = isDelivery ? 3 : 2; // 3 là giao hàng, 2 là tại quầy

    try {
      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/update-loai-hoa-don`,
        { loaiHoaDon },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      // Cập nhật tabs state với loại hóa đơn mới
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.key === hoaDonId) {
            return { ...tab, order: { ...tab.order, loaiHoaDon: loaiHoaDon } };
          }
          return tab;
        })
      );

      // Nếu chuyển sang giao hàng và có khách hàng, tự động chọn địa chỉ đầu tiên
      if (isDelivery) {
        const currentTab = tabs.find((tab) => tab.key === hoaDonId);
        if (currentTab?.order?.khachHang && giaoHangRef.current) {
          // Đợi một chút để đảm bảo component GiaoHang đã được cập nhật với loại hóa đơn mới
          setTimeout(() => {
            giaoHangRef.current.selectFirstAddress();
          }, 300);
        }
      } else {
        // Nếu chuyển sang tại quầy, set phí vận chuyển về 0
        handleShippingFeeChange(hoaDonId, 0);

        // Reset địa chỉ đã chọn
        setSelectedAddress(null);
      }

      message.success(
        `Đã chuyển sang ${isDelivery ? "Giao hàng" : "Tại quầy"}`
      );

      // Sau khi chuyển sang giao hàng và chọn địa chỉ, tự động tính phí vận chuyển
      if (isDelivery && selectedAddress && giaoHangRef.current) {
        // Đợi lâu hơn một chút để đảm bảo địa chỉ đã được chọn
        setTimeout(async () => {
          try {
            const shippingFee =
              await giaoHangRef.current.calculateShippingFee();

            // Cập nhật tổng tiền sau khi có phí vận chuyển
            if (shippingFee) {
              setTotals((prevTotals) => {
                const currentTabTotal = prevTotals[hoaDonId] || {};
                return {
                  ...prevTotals,
                  [hoaDonId]: {
                    ...currentTabTotal,
                    shippingFee: shippingFee,
                    finalTotal:
                      (currentTabTotal.subtotal || 0) -
                      (currentTabTotal.discountAmount || 0) +
                      shippingFee,
                  },
                };
              });
            }
          } catch (error) {
            console.error("Lỗi khi tính phí vận chuyển:", error);
          }
        }, 800); // Đợi lâu hơn để đảm bảo quy trình chọn địa chỉ đã hoàn tất
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi loại hóa đơn:", error);
      message.error("Không thể thay đổi loại hóa đơn");
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
    // Kiểm tra xem có chọn VNPAY hay không
    const hasVnpay = selectedMethods.includes(PAYMENT_METHOD.VNPAY);
    const hasCod = selectedMethods.includes(PAYMENT_METHOD.COD);

    // Nếu có VNPAY, chỉ cho phép duy nhất phương thức VNPAY
    if (hasVnpay && selectedMethods.length > 1) {
      selectedMethods = [PAYMENT_METHOD.VNPAY];
      message.info(PAYMENT_RULES.VNPAY_EXCLUSIVE);
    } else if (hasCod && selectedMethods.length > 1) {
      selectedMethods = [PAYMENT_METHOD.COD];
      message.info(PAYMENT_RULES.COD_EXCLUSIVE);
    }
    // Nếu không có VNPAY hoặc COD, chỉ cho phép QR và CASH
    else if (!hasVnpay && !hasCod && selectedMethods.length > 0) {
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

    // Nếu là VNPAY, đảm bảo số tiền luôn bằng tổng đơn hàng
    if (
      methodCode === PAYMENT_METHOD.VNPAY ||
      methodCode === PAYMENT_METHOD.COD
    ) {
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
        message.success(`Đã cập nhật phí vận chuyển: ${formatCurrency(fee)}`);
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

      // Kiểm tra customerId có phải là "Khách hàng lẻ" không
      if (customerId === "Khách hàng lẻ") {
        message.error(
          "Không thể chọn 'Khách hàng lẻ'. Vui lòng chọn khách hàng khác."
        );
        return;
      }

      // Gửi đúng tên tham số là customerId
      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
        { customerId: customerId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
          // Đúng tên tham số theo yêu cầu API
        }
      );

      // Tìm khách hàng được chọn từ danh sách
      const selectedCustomer = customers.find((c) => c.id === customerId);

      if (!selectedCustomer) {
        message.error("Không tìm thấy thông tin khách hàng.");
        return;
      }

      // Cập nhật khách hàng trong state
      setSelectedCustomer(selectedCustomer);

      // Cập nhật tab với thông tin khách hàng đã chọn
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  khachHang: selectedCustomer,
                },
              }
            : tab
        )
      );

      setOpenCustomerDialog(false);
      message.success(`Đã chọn khách hàng: ${selectedCustomer.tenKhachHang}`);
      // Kiểm tra nếu đơn hàng có loại là "giao hàng" (loaiHoaDon = 3) thì tự động chọn địa chỉ đầu tiên của khách hàng
      const currentTab = tabs.find((tab) => tab.key === hoaDonId);
      if (currentTab?.order?.loaiHoaDon === 3 && giaoHangRef.current) {
        // Đợi một chút để đảm bảo các component khác đã cập nhật
        setTimeout(() => {
          // Gọi hàm chọn địa chỉ đầu tiên trong component GiaoHang
          giaoHangRef.current.selectFirstAddress();
        }, 300);
      }
    } catch (error) {
      console.error("Lỗi khi chọn khách hàng:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        console.error("Status code:", error.response.status);
      }
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

  // // Update useEffect for totalBeforeDiscount calculation
  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      const total = calculateTotalBeforeDiscount(orderProducts[activeKey]);
      if (total !== totalBeforeDiscount) {
        setTotalBeforeDiscount(total);
      }
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
    // Calculate total before discount
    const subtotal = calculateTotalBeforeDiscount(products);

    // Calculate shipping fee
    const shippingFee = order.phiVanChuyen || 0;

    // Calculate total before applying voucher
    const totalBeforeVoucher = subtotal + shippingFee;

    // Calculate discount amount if voucher exists
    const discountAmount = order.phieuGiamGia
      ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
      : 0;

    // Calculate final total
    const finalTotal = totalBeforeVoucher - discountAmount;

    // Update all state values
    setTotalBeforeDiscount(subtotal);
    setTotalAmount(totalBeforeVoucher);

    // Update the order in tabs with new totals
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.key === order.id) {
          return {
            ...tab,
            order: {
              ...tab.order,
              tongTien: totalBeforeVoucher,
              giamGia: discountAmount,
              tongThanhToan: finalTotal,
            },
          };
        }
        return tab;
      })
    );
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

      // THAY ĐỔI: Tải lại danh sách sản phẩm từ server để đảm bảo có dữ liệu mới nhất
      let currentProducts = [];
      try {
        // Tải sản phẩm mới nhất từ server thay vì sử dụng state
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
      const totalForVoucher = subtotal;
      const totalBeforeVoucher = subtotal + shippingFee;

      if (totalBeforeVoucher <= 0) {
        message.info({
          content: "Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá",
          key: messageKey,
        });
        return;
      }

      console.log("Tìm voucher tốt nhất cho đơn hàng:", {
        hoaDonId,
        subtotal,
        shippingFee,
        totalBeforeVoucher,
        productCount: currentProducts.length,
      });

      // Get customer ID from order
      const customerId = order.khachHang?.id || "";

      // Lấy danh sách tất cả voucher có thể áp dụng
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}&customerId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const availableVouchers = response.data || [];

      console.log(
        `Tìm thấy ${availableVouchers.length} voucher khả dụng:`,
        availableVouchers
      );

      if (!availableVouchers.length) {
        // Nếu đã có voucher, kiểm tra xem còn hợp lệ không
        if (order.phieuGiamGia) {
          if (totalBeforeVoucher < order.phieuGiamGia.giaTriToiThieu) {
            await handleRemoveVoucher(hoaDonId);
            message.info({
              content: "Đã xóa voucher do không đủ điều kiện áp dụng.",
              key: messageKey,
            });
          } else {
            message.info({
              content: "Đã giữ voucher hiện tại do vẫn còn hợp lệ.",
              key: messageKey,
            });
          }
          return;
        } else {
          message.info({
            content: "Không có mã giảm giá phù hợp với đơn hàng này.",
            key: messageKey,
          });
          return;
        }
      }

      // Lọc voucher đạt điều kiện áp dụng (đủ điều kiện tối thiểu)
      const eligibleVouchers = availableVouchers.filter(
        (voucher) => totalBeforeVoucher >= voucher.giaTriToiThieu
      );

      if (!eligibleVouchers.length) {
        // Nếu đã có voucher cũ, kiểm tra xem còn hợp lệ không
        if (
          order.phieuGiamGia &&
          totalBeforeVoucher < order.phieuGiamGia.giaTriToiThieu
        ) {
          await handleRemoveVoucher(hoaDonId);
          message.info({
            content: "Đã xóa voucher do không đủ điều kiện áp dụng.",
            key: messageKey,
          });
        } else {
          message.info({
            content: "Không có mã giảm giá đủ điều kiện áp dụng.",
            key: messageKey,
          });
        }
        return;
      }

      // Tìm voucher giảm giá cao nhất
      const bestVoucher = eligibleVouchers.reduce((best, current) => {
        const currentDiscount = calculateDiscountAmount(
          current,
          totalBeforeVoucher
        );
        const bestDiscount = best
          ? calculateDiscountAmount(best, totalBeforeVoucher)
          : 0;

        return currentDiscount > bestDiscount ? current : best;
      }, null);

      if (!bestVoucher) {
        message.info({
          content: "Không tìm thấy voucher tốt nhất.",
          key: messageKey,
        });
        return;
      }

      // Tính toán số tiền giảm giá cho voucher tốt nhất
      const bestDiscount = calculateDiscountAmount(
        bestVoucher,
        totalBeforeVoucher
      );

      // So sánh với voucher hiện tại (nếu có)
      const currentDiscount = order.phieuGiamGia
        ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
        : 0;

      // Nếu voucher mới không tốt hơn voucher hiện tại, giữ nguyên
      if (order.phieuGiamGia && bestDiscount <= currentDiscount) {
        message.info({
          content: "Voucher hiện tại đã là tốt nhất.",
          key: messageKey,
        });
        return;
      }

      // Nếu có voucher cũ, xóa trước khi áp dụng voucher mới
      if (order.phieuGiamGia) {
        await handleRemoveVoucher(hoaDonId, false); // false = không hiện thông báo
      }

      // Gọi API để áp dụng voucher mới
      const applyResponse = await api.post(
        `/api/admin/ban-hang/${hoaDonId}/voucher`,
        {
          voucherId: bestVoucher.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!applyResponse.data) {
        message.error({
          content: "Không thể áp dụng mã giảm giá.",
          key: messageKey,
        });
        return;
      }

      // Cập nhật UI và state ngay sau khi API thành công
      const updatedOrder = applyResponse.data;

      // Cập nhật state đồng bộ ngay lập tức
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
        )
      );

      // Cập nhật totals
      const newTotals = {
        ...totals[hoaDonId],
        discountAmount: bestDiscount,
        finalTotal: totalBeforeVoucher - bestDiscount,
      };

      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));
      const actualDiscount = Math.min(bestDiscount, subtotal);
      // QUAN TRỌNG: Hiển thị thông báo thành công ngay lập tức với cùng key
      message.success({
        content: `Đã áp dụng mã giảm giá tốt nhất: ${
          bestVoucher.maPhieuGiamGia
        } - Giảm ${formatCurrency(actualDiscount)}`,
        key: messageKey,
        duration: 3,
      });

      // Các thao tác async khác đưa vào setTimeout để không làm delay thông báo
      setTimeout(() => {
        // Tìm và hiển thị voucher tốt hơn (nếu có)
        findBestVoucherAndSuggest(hoaDonId);

        // Cập nhật lại toàn bộ thông tin đơn hàng từ server
        fetchInvoiceById(hoaDonId);
      }, 100);
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

  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      // Dùng timeout để debounce
      const timeoutId = setTimeout(() => {
        findBestVoucherAndSuggest(activeKey);
      }, 1000); // Delay 1 giây

      // Cleanup để tránh gọi nhiều lần
      return () => clearTimeout(timeoutId);
    }
  }, [activeKey, orderProducts[activeKey]]);

  // Thêm hàm fetchInvoiceById để tải lại thông tin hóa đơn từ server
  const fetchInvoiceById = async (hoaDonId) => {
    try {
      // Gọi API để lấy thông tin hóa đơn
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });

      if (response.data) {
        const updatedOrder = response.data;

        // Đảm bảo loaiPhieuGiamGia là số nguyên
        if (updatedOrder.phieuGiamGia) {
          updatedOrder.phieuGiamGia.loaiPhieuGiamGia = parseInt(
            updatedOrder.phieuGiamGia.loaiPhieuGiamGia,
            10
          );
          console.log(
            "Đã chuyển đổi loaiPhieuGiamGia thành số:",
            updatedOrder.phieuGiamGia.loaiPhieuGiamGia
          );
        }

        // Cập nhật order trong tabs
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
          )
        );

        // Tải lại danh sách sản phẩm
        const products = await fetchInvoiceProducts(hoaDonId, true);

        // Tính toán lại tổng tiền
        const subtotal = calculateTotalBeforeDiscount(products);
        const shippingFee = updatedOrder.phiVanChuyen || 0;
        const totalBeforeVoucher = subtotal + shippingFee;

        // Tính toán giảm giá dựa trên voucher
        let discountAmount = 0;
        if (updatedOrder.phieuGiamGia) {
          discountAmount = calculateDiscountAmount(
            updatedOrder.phieuGiamGia,
            totalBeforeVoucher
          );
        }

        const finalTotal = totalBeforeVoucher - discountAmount;

        // Cập nhật totals
        const newTotals = {
          subtotal,
          shippingFee,
          totalBeforeVoucher,
          discountAmount,
          finalTotal,
          voucherType: updatedOrder.phieuGiamGia?.loaiPhieuGiamGia || null,
          voucherValue: updatedOrder.phieuGiamGia?.giaTriGiam || null,
        };

        setTotals((prev) => ({
          ...prev,
          [hoaDonId]: newTotals,
        }));

        // Cập nhật UI nếu đang ở tab này
        if (hoaDonId === activeKey) {
          setTotalBeforeDiscount(subtotal);
          setTotalAmount(finalTotal);
        }

        return updatedOrder;
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin hóa đơn:", error);
    }

    return null;
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
              type="editable-card"
              onChange={setActiveKey}
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
