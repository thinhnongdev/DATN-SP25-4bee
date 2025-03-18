import React, { useEffect, useState, useRef } from "react";
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
  PrinterOutlined, // Add this import
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { BiQrScan } from "react-icons/bi";
import { AiOutlineSelect } from "react-icons/ai";
import { Option } from "antd/es/mentions";
import axios from "axios";
import { message } from "antd";
import api from "../../utils/api";
import { formatCurrency } from "../../utils/format";
import ProductTable from "../HoaDon/ProductTable";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MenuItem, FormControl, InputLabel } from "@mui/material";
import { checkPayment } from "./checkPayment"; // Import hàm checkPayment
import GiaoHang from "./GiaoHang";
import QrScanner from "../QrScanner";
const token = localStorage.getItem("token"); // Lấy token từ localStorage
const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Add near the top of the file with other constants
const PAYMENT_METHOD = {
  CASH: "COD",
  QR: "BANK",
  // Add other payment methods as needed
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
    // Tính số tiền giảm = tổng tiền * phần trăm giảm / 100
    discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);

    // Nếu có giới hạn giảm tối đa và số tiền giảm vượt quá giới hạn
    if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
      discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
      console.log("Áp dụng giới hạn tối đa:", discountAmount);
    }
  } else {
    // Loại khác: Giảm theo số tiền cố định
    discountAmount = Math.min(voucher.giaTriGiam, total);
    console.log("Tính giảm giá cố định:", {
      fixedAmount: voucher.giaTriGiam,
      total,
      finalDiscount: discountAmount,
    });
  }

  // Đảm bảo số tiền giảm không âm và không vượt quá tổng tiền
  discountAmount = Math.max(0, Math.min(discountAmount, total));

  console.log("Kết quả cuối cùng:", {
    voucherId: voucher.id,
    voucherCode: voucher.maPhieuGiamGia,
    total,
    finalDiscount: discountAmount,
  });

  return discountAmount;
};

const BanHang = () => {
  const socket = useRef(null);
  const [isModalPaymentQR, setIsModalVisiblePaymentQR] = useState(false); // Trạng thái hiển thị Modal
  const [isModalVisibleListSPCT, setIsModalVisibleListSPCT] = useState(false); // Trạng thái hiển thị Modal
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
  const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
  const [activeTab, setActiveTab] = useState(null);
  const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
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
  const [calculatingShippingFee, setCalculatingShippingFee] = useState(false);
  const [isQrScannerVisible, setIsQrScannerVisible] = useState(false);
  const [scanningForHoaDonId, setScanningForHoaDonId] = useState(null);
  const [modalHandlers, setModalHandlers] = useState({
  onCancel: () => setIsModalVisiblePaymentQR(false),
  onOk: () => setIsModalVisiblePaymentQR(false)
});
  
    // Add function to calculate all totals for an order
    const calculateOrderTotals = (hoaDonId, productsOverride, orderOverride) => {
      console.log("Calculating totals for order:", hoaDonId);
  
      // Sử dụng dữ liệu override nếu có, ngược lại lấy từ state
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
  
      // Tính tổng tiền sản phẩm
      const subtotal = calculateTotalBeforeDiscount(products);
  
      // Lấy phí vận chuyển từ order
      const shippingFee = order.phiVanChuyen || 0;
  
      // QUAN TRỌNG: Tổng tiền trước khi áp dụng voucher (KHÔNG bao gồm phí vận chuyển)
      // Voucher chỉ áp dụng cho tiền hàng, không áp dụng cho phí vận chuyển
      const totalBeforeVoucher = subtotal;
  
      // Tính toán giảm giá dựa trên voucher
      let discountAmount = 0;
      let voucherType = null;
      let voucherValue = null;
  
      if (order.phieuGiamGia) {
        // Chuyển đổi sang số nếu cần
        voucherType = Number(order.phieuGiamGia.loaiPhieuGiamGia);
        voucherValue = order.phieuGiamGia.giaTriGiam;
  
        // QUAN TRỌNG: Áp dụng voucher chỉ trên giá trị sản phẩm, không bao gồm phí vận chuyển
        const amountForDiscount = subtotal; // Chỉ áp dụng voucher cho tiền hàng
  
        discountAmount = calculateDiscountAmount(
          {
            ...order.phieuGiamGia,
            loaiPhieuGiamGia: voucherType,
          },
          amountForDiscount
        );
      }
  
      // Tổng tiền cuối cùng = tiền hàng - giảm giá + phí vận chuyển
      const finalTotal = subtotal - discountAmount + shippingFee;
  
      console.log("📊 Chi tiết tính toán:", {
        subtotal,
        shippingFee,
        totalBeforeVoucher,
        discountAmount,
        finalTotal,
        voucher: order.phieuGiamGia,
        voucherType,
        voucherValue,
      });
  
      return {
        subtotal,
        shippingFee,
        totalBeforeVoucher,
        discountAmount,
        finalTotal,
        voucherType,
        voucherValue,
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
    const checkShippingCalculationStatus = () => {
      if (giaoHangRef.current) {
        // Cập nhật trạng thái tính toán
        const isCalculating = giaoHangRef.current.calculatingFee;
        setCalculatingShippingFee(isCalculating);

        // Lấy phí vận chuyển hiện tại từ component GiaoHang
        const currentShippingFee = giaoHangRef.current.shippingFee;

        // Tìm tab hiện tại để cập nhật phí vận chuyển
        if (activeKey && currentShippingFee > 0) {
          // Cập nhật tabs với phí vận chuyển mới
          setTabs((prevTabs) =>
            prevTabs.map((tab) => {
              if (tab.key === activeKey) {
                // Chỉ cập nhật nếu phí vận chuyển đã thay đổi
                if (tab.order.phiVanChuyen !== currentShippingFee) {
                  console.log(
                    "Cập nhật phí vận chuyển từ GiaoHang:",
                    currentShippingFee
                  );
                  return {
                    ...tab,
                    order: {
                      ...tab.order,
                      phiVanChuyen: currentShippingFee,
                    },
                  };
                }
              }
              return tab;
            })
          );

          // Cập nhật totals với phí vận chuyển mới
          setTotals((prevTotals) => {
            const currentTotal = prevTotals[activeKey] || {};
            // Chỉ cập nhật nếu phí vận chuyển đã thay đổi
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

    // Kiểm tra trạng thái mỗi 300ms
    const intervalId = setInterval(checkShippingCalculationStatus, 300);

    return () => clearInterval(intervalId);
  }, [activeKey]);
  // Update generateQR function to set qrUrl as well
  const generateQR = (hoaDonId, amount) => {
    const account = "102876619993"; // Số tài khoản nhận
    const bank = "VietinBank"; // Ngân hàng (Vietinbank)
    // Lấy mã hóa đơn từ đối tượng order của tab hiện tại
    // const currentOrder = tabs.find(tab => tab.key === hoaDonId)?.order;
    // const maHoaDon = currentOrder?.maHoaDon || hoaDonId;
    const description = `SEVQR thanh toan don hang ${hoaDonId}`; // Nội dung thanh toán
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

    setSelectedAddress(address);
    console.log("Đã chọn địa chỉ giao hàng:", address);

    if (!activeKey) {
      message.warning("Không tìm thấy hóa đơn để cập nhật địa chỉ.");
      return;
    }

    const payload = {
      diaChiId: address.id, // 🟢 Đúng key như backend mong đợi
      moTa: address.moTa,
      xa: address.xa,
      huyen: address.huyen,
      tinh: address.tinh,
    };

    console.log("🚀 Gửi request cập nhật địa chỉ:", payload);

    try {
      await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${activeKey}/update-address`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        },
        
      );

      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === activeKey
            ? { ...tab, order: { ...tab.order, diaChi: address } }
            : tab
        )
      );

      message.success("Đã cập nhật địa chỉ giao hàng.");
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
      width: 60,
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
            Mã: {record.maSanPham}
          </Typography.Text>
          <Typography.Text type="secondary">
            Chất liệu: {record.chatLieu}
          </Typography.Text>
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
      width: 140,
      align: "center",
      render: (_, record) => formatCurrency(record.gia),
    },
    {
      title: "Số lượng",
      key: "soLuong",
      width: 120,
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.soLuongTonKho}
          value={record.soLuong}
          onChange={(value) =>
            handleUpdateQuantity(activeKey, record.id, value)
          }
          style={{ width: 80 }}
        />
      ),
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

  const handleTableChange = (pagination) => {
    setPagination(pagination);
    if (activeKey) {
      fetchInvoiceProducts(activeKey);
    }
  };
  // Hàm đóng modal
  const handleCancelListSanPhamChiTiet = () => {
    setIsModalVisibleListSPCT(false);
  };
  // 1. Load pending orders
  const fetchPendingOrders = async (isInitializing = false) => {
    try {
      const response = await api.get("/api/admin/ban-hang/hoadoncho", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      const orders = response.data;

      if (orders.length > 0) {
        console.log("Danh sách hóa đơn từ server:", orders);

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
        // Đặt cờ để tránh các cập nhật không cần thiết
        const isInitializing = true;

        // Tải phương thức thanh toán
        const paymentResponse = await api.get(
          "/api/admin/phuong-thuc-thanh-toan",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Thêm token vào header
            },
          }
        );
        setPaymentMethods(paymentResponse.data);

        // Khôi phục dữ liệu từ localStorage trước
        const savedOrders = localStorage.getItem("pendingOrders");
        const savedProducts = localStorage.getItem("orderProducts");
        const savedTotals = localStorage.getItem("orderTotals");

        if (savedOrders) {
          setTabs(JSON.parse(savedOrders));
        }
        if (savedProducts) {
          setOrderProducts(JSON.parse(savedProducts));
        }
        if (savedTotals) {
          const parsedTotals = JSON.parse(savedTotals);
          setTotals(parsedTotals);

          // Nếu có activeKey, cập nhật tổng tiền ngay lập tức
          const firstOrderId = JSON.parse(savedOrders)?.[0]?.key;
          if (firstOrderId && parsedTotals[firstOrderId]) {
            setTotalBeforeDiscount(parsedTotals[firstOrderId].subtotal);
            setTotalAmount(parsedTotals[firstOrderId].finalTotal);
          }
        }

        // Sau đó mới gọi API để cập nhật dữ liệu mới nhất
        await fetchPendingOrders(true); // Truyền tham số true để đánh dấu đây là lần khởi tạo
        // QUAN TRỌNG: Sau khi tải xong dữ liệu, tính lại tổng tiền và giảm giá cho tất cả tabs
        if (tabs && tabs.length > 0) {
          // Tạo một phiên bản mới của totals để cập nhật
          const newTotals = {};

          // Tính toán lại totals cho từng order
          for (const tab of tabs) {
            if (tab.key && tab.order) {
              // Tính toán chính xác discountAmount cho mỗi order
              const recalculatedTotals = calculateOrderTotals(tab.key);
              if (recalculatedTotals) {
                newTotals[tab.key] = recalculatedTotals;
              }
            }
          }

          // Cập nhật state với tất cả giá trị đã tính lại
          setTotals(newTotals);

          // Cập nhật UI cho tab hiện tại nếu có
          if (activeKey && newTotals[activeKey]) {
            setTotalBeforeDiscount(newTotals[activeKey].subtotal);
            setTotalAmount(newTotals[activeKey].finalTotal);
          }
        }
      } catch (error) {
        console.error("Lỗi khởi tạo dữ liệu:", error);
      }
    };

    initializeData();

    // Chỉ chạy một lần khi component mount
  }, []);

  // Cập nhật useEffect cho việc chọn tab để tải lại dữ liệu chính xác
  useEffect(() => {
    if (activeKey) {
      console.log("Tab changed to:", activeKey);

      const currentOrder = tabs.find((tab) => tab.key === activeKey)?.order;

      // Cập nhật selectedCustomer và selectedAddress theo tab hiện tại
      if (currentOrder) {
        setSelectedCustomer(currentOrder.khachHang || null);
        setSelectedAddress(currentOrder.diaChi || null);

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

  // Add WebSocket connection setup
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ WebSocket connected");

        // Subscribe to pending orders updates
        stompClient.subscribe("/topic/hoa-don-cho", (message) => {
          console.log("🔄 Pending orders updated");
          fetchPendingOrders();
        });

        // Subscribe to individual order updates
        tabs.forEach((tab) => {
          stompClient.subscribe(`/topic/hoa-don/${tab.key}`, (message) => {
            console.log(`🔄 Order ${tab.key} updated`);
            fetchInvoiceProducts(tab.key).then((products) => {
              setOrderProducts((prev) => ({
                ...prev,
                [tab.key]: products,
              }));
            });
          });
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        console.error("STOMP error details:", frame.body);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
      onDisconnect: () => console.log("❌ WebSocket disconnected"),
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [tabs]); // Reconnect when tabs change

  // Add this useEffect for initialization
  useEffect(() => {
    setOrderProducts({});
    setTotalBeforeDiscount(0);
    fetchPendingOrders();
  }, []);

  // 2. Create new order
  const addTab = async () => {
    try {
      // Check if there are already 5 pending orders
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
          emailNhanVien: "vnv@gmail.com", // Replace with actual logged-in user
        },
        {
          headers: {
        Authorization: `Bearer ${token}`, // Headers go here as third parameter
          }
        }
      );

      const newOrder = response.data;
      // Use id instead of maHoaDon for API calls
      const newOrderKey = newOrder.id;

      // Reset selectedAddress khi tạo đơn hàng mới
      setSelectedAddress(null);
      setSelectedCustomer(null);

      setTabs((prev) => [
        ...prev,
        {
          key: newOrderKey,
          title: `Đơn hàng ${prev.length + 1} - ${newOrder.maHoaDon}`, // Display maHoaDon
          order: newOrder,
        },
      ]);

      setOrderProducts((prev) => ({
        ...prev,
        [newOrderKey]: [],
      }));

      setActiveKey(newOrderKey);
      message.success("Tạo đơn hàng mới thành công");

      // After successful tab creation, subscribe to its updates
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

  // 3. Add product to order
  const handleAddProductToOrder = async (product) => {
    if (!activeKey) {
      message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
      return;
    }

    try {
      setLoading(true);

      // Lưu ID sản phẩm trước khi gọi API
      const productId = product.id;
      const quantity = product.quantity || 1;

      // Chuẩn bị payload để gửi lên API
      const payload = {
        sanPhamChiTietId: productId,
        soLuong: quantity,
      };

      // Gọi API để thêm sản phẩm vào đơn hàng
      const response = await api.post(
        `/api/admin/ban-hang/${activeKey}/add-product`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      if (!response || !response.data) {
        throw new Error("Dữ liệu API không hợp lệ");
      }

      console.log("Sản phẩm đã thêm vào đơn hàng:", response.data);

      // Cập nhật tồn kho trong cache
      updateProductInventoryInCache(productId, -quantity);

      // Tải lại danh sách sản phẩm của đơn hàng
      const updatedProducts = await fetchInvoiceProducts(activeKey);

      // Cập nhật state
      setOrderProducts((prev) => ({ ...prev, [activeKey]: updatedProducts }));

      // Tính toán lại tổng tiền sau khi thêm sản phẩm
      const newTotals = calculateOrderTotals(activeKey, updatedProducts);
      setTotals((prev) => ({
        ...prev,
        [activeKey]: newTotals,
      }));

      // Cập nhật UI hiển thị
      if (activeKey) {
        setTotalBeforeDiscount(newTotals.subtotal);
        setTotalAmount(newTotals.finalTotal);
      }

      // Tải lại thông tin hóa đơn từ server
      await fetchInvoiceById(activeKey);

      // Tự động áp dụng voucher tốt nhất nếu có thể
      await autoApplyBestVoucher(activeKey);

      // Cập nhật gợi ý voucher và sản phẩm
      setTimeout(() => {
        findBestVoucherAndSuggest(activeKey);
      }, 300);

      message.success(
        `Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`
      );
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      let errorMessage = "Lỗi khi thêm sản phẩm";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      message.error(errorMessage);

      // Tải lại dữ liệu từ server để đảm bảo tính nhất quán
      await fetchInvoiceProducts(activeKey);
    } finally {
      setLoading(false);
    }
  };

  // 4. Update product quantity
  const handleUpdateQuantity = async (
    hoaDonId,
    hoaDonChiTietId,
    newQuantity
  ) => {
    if (newQuantity < 1) return message.error("Số lượng phải lớn hơn 0");

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

      // 🟢 Tự động áp dụng mã giảm giá tốt nhất
      await autoApplyBestVoucher(hoaDonId);
      await fetchInvoiceProducts(hoaDonId);
      await findBestVoucherAndSuggest(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error("Lỗi khi cập nhật số lượng!");
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

      // Tự động áp dụng mã giảm giá tốt nhất
      await autoApplyBestVoucher(hoaDonId);

      // Tải lại danh sách sản phẩm và gợi ý voucher
      await fetchInvoiceProducts(hoaDonId);
      await findBestVoucherAndSuggest(hoaDonId);

      message.success("Đã xóa sản phẩm khỏi đơn hàng");
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
      console.log("🔄 Áp dụng voucher:", { hoaDonId, voucherId });

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
        throw new Error("❌ Dữ liệu trả về từ API không hợp lệ.");
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

      // ✅ Cập nhật state theo đúng trình tự
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
      console.error("❌ Lỗi khi áp dụng voucher:", error);
      message.error("Lỗi khi áp dụng voucher, vui lòng thử lại.");
    }
  };

  // 7. Remove voucher
  const handleRemoveVoucher = async (hoaDonId) => {
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
      message.error("Lỗi khi xóa voucher!");
      await fetchInvoiceProducts(hoaDonId);
    }
  };

  const fetchAvailableVouchers = async () => {
    try {
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}`,
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
  
      if (currentOrder.loaiHoaDon === 3 && !selectedAddress) {
        message.error("Vui lòng chọn địa chỉ giao hàng trước khi tiếp tục.");
        return;
      }
  
      // Kiểm tra tổng số tiền thanh toán có khớp không
      const totalNeeded = totals[hoaDonId]?.finalTotal || 0;
      const { remaining } = calculateChange(hoaDonId);
  
      // Nếu còn thiếu tiền, thông báo lỗi
      if (remaining > 0) {
        message.error(
          `Số tiền thanh toán chưa đủ. Còn thiếu ${formatCurrency(remaining)}`
        );
        return;
      }
  
      // Lọc danh sách thanh toán chỉ lấy những cái có số tiền > 0
      const validPayments = currentOrder.thanhToans.filter(
        (p) => p && p.soTien > 0
      );
  
      const cashPayment = validPayments.find(
        (p) => p && p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
      );
      const transferPayment = validPayments.find(
        (p) => p && p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
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
                    reject(new Error('Payment cancelled'));
                  };
            
                  while (!isPaid && attempts < maxAttempts) {
                    isPaid = await checkPayment(hoaDonId, transferPayment.soTien);
                    if (isPaid) {
                      resolve(true);
                      break;
                    }
                    await new Promise(r => setTimeout(r, 2000));
                    attempts++;
                  }
                  
                  if (!isPaid) {
                    reject(new Error('Payment timeout'));
                  }
                });
            
                // Hiển thị QR code trong modal hiện có thay vì sử dụng Modal.info
                setIsModalVisiblePaymentQR(true);
                
                // Bổ sung xử lý hủy thanh toán cho modal
                const handleQrModalCancel = () => {
                  if (cancelPaymentCheck) cancelPaymentCheck();
                  setIsModalVisiblePaymentQR(false);
                  loadingMsg(); // Hủy thông báo loading
                };
                
                // Gán handler cho sự kiện đóng modal (thực hiện trong useEffect hoặc custom hook)
                // Lưu vào state để truy cập từ modal component
                setModalHandlers({
                  onCancel: handleQrModalCancel,
                  onOk: () => {
                    setIsModalVisiblePaymentQR(false);
                    loadingMsg(); // Hủy thông báo loading
                  }
                });
            
                await paymentPromise;
                
                loadingMsg();
                setIsModalVisiblePaymentQR(false);
                message.success("Đã nhận được thanh toán chuyển khoản!");
              } catch (error) {
                setIsModalVisiblePaymentQR(false);
                message.error("Chưa nhận được thanh toán chuyển khoản, vui lòng thử lại!");
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
            // Xử lý danh sách thanh toán trước khi gửi đi
            const paymentsWithIds = validPayments.map((p) => ({
              id: p.id || `${hoaDonId}_${p.maPhuongThucThanhToan}`,
              maPhuongThucThanhToan: p.maPhuongThucThanhToan,
              soTien: p.soTien,
            }));
  
            // Gửi API hoàn tất thanh toán
            await api.post(
              `/api/admin/ban-hang/${hoaDonId}/complete`,
              {
                thanhToans: paymentsWithIds
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
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      let errorMsg = "Lỗi khi xác nhận đơn hàng!";
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg;
        console.error("Chi tiết lỗi:", error.response.data);
      }
      message.error(errorMsg);
    }
  };

  // Helper function for order completion process
  const completeOrderProcess = async (hoaDonId) => {
    try {
      // Lấy hóa đơn PDF để in
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
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

  // 10. Print invoice
  const handlePrintInvoice = async (hoaDonId) => {
    try {
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
        
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      message.error("Lỗi khi in hóa đơn");
    }
  };

  // Cập nhật lại findBestVoucherAndSuggest để sử dụng hàm helper
  const findBestVoucherAndSuggest = async (hoaDonId) => {
    try {
      console.log("🔍 Tìm voucher tốt hơn cho đơn hàng:", hoaDonId);

      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!order) {
        console.warn("⚠️ Không tìm thấy đơn hàng");
        return;
      }

      const currentProducts = orderProducts[hoaDonId] || [];
      const currentTotal = totals[hoaDonId]?.totalBeforeVoucher || 0;

      // Kiểm tra nếu tổng tiền quá nhỏ, không cần tìm voucher
      if (currentTotal < 10000) {
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
        });
        return;
      }

      // Sử dụng cache để tránh gọi API liên tục
      const cacheKey = `active_vouchers_${Math.floor(currentTotal / 10000)}`;
      let allVouchers = sessionStorage.getItem(cacheKey);

      if (!allVouchers) {
        // Lấy danh sách voucher đang hoạt động
        const response = await api.get("/api/phieu-giam-gia/active", {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        });
        allVouchers = response.data || [];
        sessionStorage.setItem(cacheKey, JSON.stringify(allVouchers));
      } else {
        allVouchers = JSON.parse(allVouchers);
      }

      // Tính giảm giá hiện tại
      const currentDiscount = order.phieuGiamGia
        ? calculateDiscountAmount(order.phieuGiamGia, currentTotal)
        : 0;

      // Lọc voucher có giá trị giảm tốt hơn voucher hiện tại
      const betterVouchers = allVouchers
        .filter((voucher) => {
          if (voucher.id === order.phieuGiamGia?.id) return false;

          const potentialDiscount = calculateDiscountAmount(
            voucher,
            Math.max(currentTotal, voucher.giaTriToiThieu)
          );

          return potentialDiscount > currentDiscount;
        })
        .map((voucher) => ({
          ...voucher,
          amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
          potentialDiscount: calculateDiscountAmount(
            voucher,
            Math.max(currentTotal, voucher.giaTriToiThieu)
          ),
          additionalSavings:
            calculateDiscountAmount(
              voucher,
              Math.max(currentTotal, voucher.giaTriToiThieu)
            ) - currentDiscount,
        }))
        .sort((a, b) => b.additionalSavings - a.additionalSavings)
        .slice(0, 3); // Giới hạn chỉ 3 voucher tốt nhất

      // Lấy ra 3 voucher tốt nhất mà không quan tâm đến voucher hiện tại
      const bestVouchers = allVouchers
        .map((voucher) => ({
          ...voucher,
          amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
          potentialDiscount: calculateDiscountAmount(
            voucher,
            Math.max(currentTotal, voucher.giaTriToiThieu)
          ),
        }))
        .sort((a, b) => b.potentialDiscount - a.potentialDiscount)
        .slice(0, 3); // Top 3 voucher tốt nhất

      if (betterVouchers.length > 0) {
        // CẤP NHẬT: Lấy tất cả sản phẩm chi tiết từ cửa hàng thay vì chỉ sản phẩm trong đơn hàng
        let allStoreProducts = sessionStorage.getItem("all_store_products");
        let storeProductsFetchTime = sessionStorage.getItem(
          "store_products_fetch_time"
        );
        const now = new Date().getTime();

        // Nếu chưa có dữ liệu trong cache hoặc dữ liệu đã cũ (hơn 5 phút)
        if (
          !allStoreProducts ||
          !storeProductsFetchTime ||
          now - storeProductsFetchTime > 300000
        ) {
          console.log("🔄 Tải lại danh sách sản phẩm từ API...");
          try {
            const response = await api.get(
              "/api/admin/sanpham/chitietsanpham",
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Thêm token vào header
                },
              }
            );
            allStoreProducts = response.data || [];

            // Tiền xử lý sản phẩm để đảm bảo đầy đủ thông tin
            allStoreProducts = allStoreProducts.map((product) => ({
              ...product,
              maSanPham:
                product.maSanPham ||
                product.sanPhamChiTiet?.maSanPham ||
                `SP${product.id}`,
              soLuong: product.soLuong || product.soLuongTonKho || 0,
            }));

            // Lọc ra những sản phẩm còn số lượng
            allStoreProducts = allStoreProducts.filter(
              (product) => product.soLuong > 0
            );

            // Lưu vào sessionStorage để tái sử dụng
            sessionStorage.setItem(
              "all_store_products",
              JSON.stringify(allStoreProducts)
            );
            sessionStorage.setItem("store_products_fetch_time", now.toString());
          } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
            allStoreProducts = [];
          }
        } else {
          allStoreProducts = JSON.parse(allStoreProducts);
          console.log("✅ Sử dụng danh sách sản phẩm từ cache");
        }

        // Danh sách ID sản phẩm đã có trong đơn hàng
        const currentProductIds = currentProducts.map(
          (p) => p.sanPhamChiTietId || p.id
        );

        // Xử lý gợi ý cho từng voucher
        const suggestedProducts = await Promise.all(
          betterVouchers
            .filter((v) => v.amountNeeded > 0)
            .map(async (voucher) => {
              // 1. Gợi ý tăng số lượng sản phẩm hiện có
              const currentProductSuggestions = currentProducts
                .filter((p) => p.gia > 0)
                .map((p) => ({
                  ...p,
                  quantityNeeded: Math.ceil(voucher.amountNeeded / p.gia),
                }))
                .sort((a, b) => a.quantityNeeded - b.quantityNeeded)
                .slice(0, 2);

              // 2. Gợi ý sản phẩm mới từ toàn bộ cửa hàng
              // Tìm sản phẩm có giá phù hợp với số tiền cần thêm
              let newProductSuggestions = [];

              if (allStoreProducts && allStoreProducts.length > 0) {
                // Lọc ra những sản phẩm chưa có trong đơn hàng
                const availableProducts = allStoreProducts.filter(
                  (p) => !currentProductIds.includes(p.id) && p.soLuong > 0
                );

                // Phân tích nhu cầu: tính toán mức giá phù hợp với số tiền cần thêm
                const amountNeeded = voucher.amountNeeded;

                // Chia thành các nhóm giá để tìm sản phẩm phù hợp
                // - Sản phẩm giá thấp (khoảng 50-80% số tiền cần thêm)
                // - Sản phẩm giá vừa (khoảng 80-120% số tiền cần thêm)
                // - Sản phẩm giá cao (khoảng 120-200% số tiền cần thêm)

                const lowerPriceProducts = availableProducts
                  .filter(
                    (p) =>
                      p.gia >= amountNeeded * 0.5 && p.gia <= amountNeeded * 0.8
                  )
                  .sort((a, b) => b.gia - a.gia) // Ưu tiên giá cao hơn
                  .slice(0, 2);

                const mediumPriceProducts = availableProducts
                  .filter(
                    (p) =>
                      p.gia > amountNeeded * 0.8 && p.gia <= amountNeeded * 1.2
                  )
                  .sort(
                    (a, b) =>
                      Math.abs(a.gia - amountNeeded) -
                      Math.abs(b.gia - amountNeeded)
                  ) // Ưu tiên gần với số tiền cần thêm
                  .slice(0, 3);

                const higherPriceProducts = availableProducts
                  .filter(
                    (p) =>
                      p.gia > amountNeeded * 1.2 && p.gia <= amountNeeded * 2
                  )
                  .sort((a, b) => a.gia - b.gia) // Ưu tiên giá thấp hơn
                  .slice(0, 2);

                // Kết hợp các nhóm sản phẩm và tính điểm phù hợp
                newProductSuggestions = [
                  ...mediumPriceProducts.map((p) => ({
                    ...p,
                    relevanceScore:
                      100 -
                      (Math.abs(p.gia - amountNeeded) / amountNeeded) * 100,
                    priceCategory: "perfect",
                  })),
                  ...lowerPriceProducts.map((p) => ({
                    ...p,
                    relevanceScore:
                      80 -
                      (Math.abs(p.gia - amountNeeded * 0.7) /
                        (amountNeeded * 0.7)) *
                        30,
                    priceCategory: "lower",
                  })),
                  ...higherPriceProducts.map((p) => ({
                    ...p,
                    relevanceScore:
                      70 -
                      (Math.abs(p.gia - amountNeeded * 1.5) /
                        (amountNeeded * 1.5)) *
                        20,
                    priceCategory: "higher",
                  })),
                ]
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)
                  .slice(0, 5);
              }

              return {
                voucherId: voucher.id,
                currentProducts: currentProductSuggestions,
                newProducts: newProductSuggestions,
              };
            })
        );

        // Cập nhật state với voucher và sản phẩm gợi ý
        setVoucherSuggestions({
          show: true,
          betterVouchers: betterVouchers.map((voucher) => ({
            ...voucher,
            suggestions: suggestedProducts.find(
              (s) => s?.voucherId === voucher.id
            ) || {
              currentProducts: [],
              newProducts: [],
            },
          })),
          bestVouchers: bestVouchers,
        });
      } else {
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
          bestVouchers: bestVouchers,
        });
      }
    } catch (error) {
      console.error("❌ Lỗi khi tìm voucher tốt hơn:", error);
      setVoucherSuggestions({
        show: false,
        betterVouchers: [],
        bestVouchers: [],
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
        {
          voucherId: voucherId,
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
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

        // Đóng gợi ý voucher
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher gợi ý:", error);
      message.error("Lỗi khi áp dụng voucher");
      return false;
    }
  };

  // Hàm xử lý khi người dùng thêm sản phẩm từ gợi ý
  const handleAddSuggestedProduct = async (product) => {
    try {
      if (!activeKey) {
        message.error("Vui lòng chọn đơn hàng trước khi thêm sản phẩm");
        return;
      }

      setLoading(true);

      // Lưu ID sản phẩm trước khi gọi API
      const productId = product.id;

      // Chuẩn bị payload để gửi lên API
      const payload = {
        sanPhamChiTietId: productId,
        soLuong: 1,
      };

      // Gọi API để thêm sản phẩm vào đơn hàng
      const response = await api.post(
        `/api/admin/ban-hang/${activeKey}/add-product`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
          
        }
      );

      if (response.data) {
        message.success(
          `Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`
        );

        // Cập nhật danh sách sản phẩm của đơn hàng
        await fetchInvoiceProducts(activeKey);

        // Tải lại thông tin đơn hàng
        await fetchInvoiceById(activeKey);

        // Cập nhật lại số lượng tồn kho trong danh sách gợi ý
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
                      // Giảm số lượng tồn kho của sản phẩm vừa thêm
                      return {
                        ...p,
                        soLuong: Math.max(0, p.soLuong - 1),
                      };
                    }
                    return p;
                  }),
                },
              };
            }),
          };
        });

        // Cập nhật cache sản phẩm toàn cục
        const allStoreProducts = sessionStorage.getItem("all_store_products");
        if (allStoreProducts) {
          const products = JSON.parse(allStoreProducts);
          const updatedProducts = products.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                soLuong: Math.max(0, p.soLuong - 1),
              };
            }
            return p;
          });
          sessionStorage.setItem(
            "all_store_products",
            JSON.stringify(updatedProducts)
          );
        }

        // Tính toán lại tổng tiền
        const newTotals = calculateOrderTotals(activeKey);
        setTotals((prev) => ({
          ...prev,
          [activeKey]: newTotals,
        }));

        // Cập nhật UI
        setTotalBeforeDiscount(newTotals.subtotal);
        setTotalAmount(newTotals.finalTotal);

        // Tự động áp dụng voucher tốt nhất
        await autoApplyBestVoucher(activeKey);

        // Cập nhật lại gợi ý voucher
        setTimeout(() => {
          findBestVoucherAndSuggest(activeKey);
        }, 500);
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm gợi ý:", error);
      let errorMessage = "Không thể thêm sản phẩm";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng tăng số lượng sản phẩm từ gợi ý
  const handleUpdateQuantityForSuggestion = async (
    hoaDonId,
    productId,
    newQuantity
  ) => {
    try {
      // Cập nhật số lượng sản phẩm
      await handleUpdateQuantity(hoaDonId, productId, newQuantity);
      message.success("Đã cập nhật số lượng sản phẩm");

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

      // Cập nhật lại gợi ý sau khi cập nhật số lượng
      setTimeout(() => {
        findBestVoucherAndSuggest(hoaDonId);
      }, 500);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error("Lỗi khi cập nhật số lượng sản phẩm");
    }
  };

  useEffect(() => {
    setSelectedAddress(null); // Reset địa chỉ khi đổi khách hàng
  }, [selectedCustomer]);

  // Gợi ý mua thêm tiền để áp dụng mã giảm giá tốt hơn
  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      console.log("🔄 Cập nhật tổng tiền...");

      // 🟢 Tính tổng tiền trước khi cập nhật vào `totals`
      const newTotals = calculateOrderTotals(activeKey);
      setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
      setTotalAmount(newTotals.finalTotal);

      console.log("📌 Tổng tiền mới:", newTotals);
    }
  }, [orderProducts, activeKey]);

  useEffect(() => {
    if (
      activeKey &&
      totals[activeKey] &&
      totals[activeKey].totalBeforeVoucher > 0
    ) {
      console.log("🔄 Tổng tiền đã cập nhật, tìm voucher tốt nhất...");
      findBestVoucherAndSuggest(activeKey);
    }
  }, [totals, activeKey]); // Chỉ chạy khi tổng tiền thay đổi
  // Thêm hàm này để cập nhật phí vận chuyển từ component GiaoHang
  const handleShippingFeeUpdate = (fee) => {
    if (activeKey) {
      console.log(`Cập nhật phí vận chuyển ${fee} cho tab ${activeKey}`);

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
          },
        };
      });
    }
  };
  // Update order content rendering to show products table
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
              type="primary"
              onClick={() => setOpenProductTable(true)}
              style={{ marginLeft: 8 }}
            >
              <IoIosAddCircle />
              Thêm sản phẩm
            </Button>
          </div>
          <Table
            dataSource={orderProducts[order.id] || []}
            columns={columns}
            pagination={{
              current: pagination.current,
              pageSize: 3,
              showSizeChanger: false,
              total: orderProducts[order.id]?.length || 0,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              size: "small",
              position: ["bottomCenter"],
              onChange: (page) => {
                setPagination({ current: page, pageSize: 3 });
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
                  <Avatar size={40} style={{ marginRight: 8 }} />
                  <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
                </Col>
              </Row>
              <div
                style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
              ></div>
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

              {/* Chỉ hiển thị GiaoHang khi chọn "Giao hàng" và có khách hàng */}
              {order.loaiHoaDon === 3 && (
                <>
                  <div style={{ marginTop: 10 }}>
                    {order.khachHang ? (
                      <GiaoHang
                        ref={giaoHangRef}
                        customerId={selectedCustomer?.id}
                        hoaDonId={activeKey}
                        onAddressSelect={handleAddressSelect}
                        onShippingFeeUpdate={handleShippingFeeUpdate} // Thêm prop này
                      />
                    ) : (
                      <Alert
                        message="Vui lòng chọn khách hàng trước khi thiết lập địa chỉ giao hàng"
                        type="warning"
                        showIcon
                      />
                    )}
                  </div>
                </>
              )}
            </div>
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
                  <Text strong>Chọn phương thức thanh toán:</Text>
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
                    {paymentMethods.map((method) => (
                      <Select.Option
                        key={method.id}
                        value={method.maPhuongThucThanhToan}
                        label={method.tenPhuongThucThanhToan}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {method.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.CASH && (
                            <WalletOutlined style={{ marginRight: 8 }} />
                          )}
                          {method.maPhuongThucThanhToan ===
                            PAYMENT_METHOD.QR && (
                            <QrcodeOutlined style={{ marginRight: 8 }} />
                          )}
                          {method.tenPhuongThucThanhToan}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              {/* Hiển thị ô nhập số tiền cho từng phương thức */}
              {(order.thanhToans || []).map((payment) => {
                // Xác định xem đơn hàng có cả 2 phương thức thanh toán không
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
                          : "#1890ff"
                      }`,
                      backgroundColor: "#fff",
                    }}
                    bodyStyle={{ padding: "12px 16px" }}
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
                          <Text strong>{payment.tenPhuongThucThanhToan}</Text>
                        </Space>
                      </Col>
                      <Col span={12}>
                        {isAutoCalculated ? (
                          // Hiển thị số tiền chuyển khoản (tự động tính) dưới dạng text
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
                          // Input nhập số tiền cho tiền mặt hoặc chuyển khoản (nếu chỉ có 1 phương thức)
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
                  {/* Phí vận chuyển */}
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
                    {order.loaiHoaDon === 3 ? (
                      <>
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
                            <InputNumber
                              value={order.phiVanChuyen || 0}
                              onChange={(value) => {
                                const fee = value || 0;
                                // Cập nhật phí vận chuyển
                                handleShippingFeeChange(activeKey, fee);
                              }}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, "")
                              }
                              min={0}
                              step={1000}
                              style={{ width: 120 }}
                            />
                            <Button
                              type="link"
                              size="small"
                              icon={<SyncOutlined />}
                              onClick={async () => {
                                if (selectedAddress && giaoHangRef.current) {
                                  const fee =
                                    await giaoHangRef.current.calculateShippingFee();

                                  // Cập nhật trực tiếp state của BanHang.js
                                  if (fee > 0) {
                                    // Cập nhật tabs
                                    setTabs((prevTabs) =>
                                      prevTabs.map((tab) => {
                                        if (tab.key === activeKey) {
                                          return {
                                            ...tab,
                                            order: {
                                              ...tab.order,
                                              phiVanChuyen: fee,
                                            },
                                          };
                                        }
                                        return tab;
                                      })
                                    );

                                    // Cập nhật totals
                                    setTotals((prevTotals) => {
                                      const currentTotal =
                                        prevTotals[activeKey] || {};
                                      return {
                                        ...prevTotals,
                                        [activeKey]: {
                                          ...currentTotal,
                                          shippingFee: fee,
                                          finalTotal:
                                            (currentTotal.subtotal || 0) -
                                            (currentTotal.discountAmount || 0) +
                                            fee,
                                        },
                                      };
                                    });
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
                          </div>
                        )}
                      </>
                    ) : (
                      <Text>0 ₫</Text>
                    )}
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
                              totals[order.id]?.discountAmount || 0
                            )}
                            )
                          </>
                        ) : (
                          formatCurrency(totals[order.id]?.discountAmount || 0)
                        )}
                      </Text>
                    ) : (
                      <Text>
                        {formatCurrency(totals[order.id]?.discountAmount || 0)}
                      </Text>
                    )}
                  </Col>
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
                    <Text strong style={{ color: "red", fontSize: 16 }}>
                      {formatCurrency(totals[order.id]?.finalTotal || 0)}
                    </Text>
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
            {/* Phần hiển thị gợi ý voucher */}
            {voucherSuggestions.show &&
              voucherSuggestions.betterVouchers?.length > 0 && (
                <div
                  className="voucher-suggestions"
                  style={{
                    margin: "16px 0",
                    padding: "12px",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
                      <InfoCircleOutlined style={{ marginRight: 8 }} />
                      Có {voucherSuggestions.betterVouchers.length} voucher tốt
                      hơn cho đơn hàng
                    </Text>

                    {voucherSuggestions.betterVouchers.map((voucher, index) => {
                      const currentDiscount = order.phieuGiamGia
                        ? calculateDiscountAmount(
                            order.phieuGiamGia,
                            totals[order.id]?.totalBeforeVoucher || 0
                          )
                        : 0;
                      // Đảm bảo totals đã được tính toán
                      if (!totals[order.id]) {
                        const initialTotals = calculateOrderTotals(order.id);
                        // Khi component mới render lần đầu và chưa có totals
                        if (initialTotals) {
                          // Tính toán ngay tại chỗ để render đúng
                          setTimeout(() => {
                            setTotals((prev) => ({
                              ...prev,
                              [order.id]: initialTotals,
                            }));
                          }, 0);
                        }
                      }

                      // Sử dụng giá trị totals đã tính hoặc tính ngay tại chỗ
                      const orderTotals =
                        totals[order.id] || calculateOrderTotals(order.id);
                      return (
                        <Card
                          key={voucher.id}
                          size="small"
                          bordered={true}
                          style={{ background: "#fff", marginBottom: 8 }}
                          title={
                            <Space>
                              <TagOutlined style={{ color: "#1890ff" }} />
                              <Text strong style={{ fontSize: "12px" }}>
                                {voucher.maPhieuGiamGia}
                              </Text>
                              <Tag color="green" style={{ fontSize: "11px" }}>
                                +{formatCurrency(voucher.additionalSavings)}
                              </Tag>
                            </Space>
                          }
                          extra={
                            <Button
                              type="primary"
                              size="small"
                              onClick={() =>
                                handleApplySuggestedVoucher(
                                  order.id,
                                  voucher.id
                                )
                              }
                              disabled={voucher.amountNeeded > 0}
                            >
                              {voucher.amountNeeded > 0 ? "Chưa đủ" : "Áp dụng"}
                            </Button>
                          }
                        >
                          <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="small"
                          >
                            <div>
                              <Text style={{ fontSize: "12px" }}>
                                {voucher.loaiPhieuGiamGia === 1
                                  ? `Giảm ${
                                      voucher.giaTriGiam
                                    }% (tối đa ${formatCurrency(
                                      voucher.soTienGiamToiDa
                                    )})`
                                  : `Giảm ${formatCurrency(
                                      voucher.giaTriGiam
                                    )}`}
                              </Text>
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Đơn tối thiểu:{" "}
                                {formatCurrency(voucher.giaTriToiThieu)}
                              </Text>
                            </div>

                            {voucher.amountNeeded > 0 && (
                              <Alert
                                type="warning"
                                message={`Cần mua thêm ${formatCurrency(
                                  voucher.amountNeeded
                                )}`}
                                style={{
                                  marginBottom: 8,
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                }}
                              />
                            )}

                            {/* Hiển thị gợi ý sản phẩm thu gọn */}
                            {(voucher.suggestions?.currentProducts?.length >
                              0 ||
                              voucher.suggestions?.newProducts?.length > 0) && (
                              <Collapse ghost size="small">
                                <Collapse.Panel
                                  header={
                                    <Text style={{ fontSize: "12px" }}>
                                      Xem gợi ý sản phẩm
                                    </Text>
                                  }
                                  key="1"
                                >
                                  {voucher.suggestions?.currentProducts
                                    ?.length > 0 && (
                                    <div style={{ marginTop: 4 }}>
                                      <Text strong style={{ fontSize: "12px" }}>
                                        Mua thêm sản phẩm đã chọn:
                                      </Text>
                                      <List
                                        size="small"
                                        dataSource={
                                          voucher.suggestions.currentProducts
                                        }
                                        renderItem={(product) => (
                                          <List.Item
                                            extra={
                                              <Button
                                                type="primary"
                                                size="small"
                                                onClick={() =>
                                                  handleUpdateQuantityForSuggestion(
                                                    order.id,
                                                    product.id,
                                                    product.soLuong +
                                                      product.quantityNeeded
                                                  )
                                                }
                                              >
                                                +{product.quantityNeeded}
                                              </Button>
                                            }
                                          >
                                            <List.Item.Meta
                                              avatar={
                                                <Avatar
                                                  src={product.hinhAnh?.[0]}
                                                  shape="square"
                                                  size="small"
                                                />
                                              }
                                              title={
                                                <Text
                                                  style={{ fontSize: "12px" }}
                                                >
                                                  {product.tenSanPham}
                                                </Text>
                                              }
                                              description={
                                                <Text
                                                  type="secondary"
                                                  style={{ fontSize: "11px" }}
                                                >
                                                  {formatCurrency(product.gia)}{" "}
                                                  x{product.soLuong}
                                                </Text>
                                              }
                                            />
                                          </List.Item>
                                        )}
                                      />
                                    </div>
                                  )}

                                  {voucher.suggestions?.newProducts?.length >
                                    0 && (
                                    <Collapse ghost>
                                      <Collapse.Panel
                                        header={
                                          <Text
                                            style={{
                                              fontSize: "14px",
                                              color: "#003a8c",
                                            }}
                                          >
                                            <ShoppingOutlined
                                              style={{ marginRight: 6 }}
                                            />
                                            Gợi ý{" "}
                                            {
                                              voucher.suggestions.newProducts
                                                .length
                                            }{" "}
                                            sản phẩm phù hợp
                                          </Text>
                                        }
                                        key={`product-suggestions-${voucher.id}`}
                                      >
                                        <List
                                          grid={{
                                            gutter: 8,
                                            xs: 1,
                                            sm: 1,
                                            md: 2,
                                            lg: 2,
                                            xl: 2,
                                            xxl: 2,
                                          }}
                                          dataSource={
                                            voucher.suggestions.newProducts
                                          }
                                          renderItem={(product) => (
                                            <List.Item>
                                              <Card
                                                size="small"
                                                hoverable
                                                style={{
                                                  marginBottom: 10,
                                                  boxShadow:
                                                    "0 1px 4px rgba(0,0,0,0.1)",
                                                  border: "1px solid #eee",
                                                }}
                                                cover={
                                                  <div
                                                    style={{
                                                      height: 120,
                                                      overflow: "hidden",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      backgroundColor:
                                                        "#f5f5f5",
                                                    }}
                                                  >
                                                    {Array.isArray(
                                                      product.hinhAnh
                                                    ) &&
                                                    product.hinhAnh.length >
                                                      0 ? (
                                                      <img
                                                        alt={product.tenSanPham}
                                                        src={product.hinhAnh[0]}
                                                        style={{
                                                          maxWidth: "100%",
                                                          maxHeight: "100%",
                                                          objectFit: "cover",
                                                        }}
                                                      />
                                                    ) : (
                                                      <AppstoreOutlined
                                                        style={{
                                                          fontSize: 24,
                                                          color: "#bfbfbf",
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                }
                                                actions={[
                                                  <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() =>
                                                      handleAddSuggestedProduct(
                                                        product
                                                      )
                                                    }
                                                    style={{
                                                      backgroundColor:
                                                        "#002140",
                                                      borderColor: "#002140",
                                                    }}
                                                    loading={loading}
                                                  >
                                                    Thêm
                                                  </Button>,
                                                ]}
                                              >
                                                <Card.Meta
                                                  title={
                                                    <Tooltip
                                                      title={product.tenSanPham}
                                                    >
                                                      <div
                                                        style={{
                                                          fontSize: "13px",
                                                          fontWeight: "bold",
                                                          overflow: "hidden",
                                                          textOverflow:
                                                            "ellipsis",
                                                          whiteSpace: "nowrap",
                                                          marginBottom: 4,
                                                          color: "#1f1f1f",
                                                        }}
                                                      >
                                                        {product.tenSanPham ||
                                                          "Không có tên"}
                                                      </div>
                                                    </Tooltip>
                                                  }
                                                  description={
                                                    <>
                                                      <Space
                                                        direction="vertical"
                                                        size={0}
                                                        style={{
                                                          width: "100%",
                                                        }}
                                                      >
                                                        {/* Hiển thị giá sản phẩm */}
                                                        <div
                                                          style={{
                                                            marginBottom: 8,
                                                          }}
                                                        >
                                                          <Text
                                                            type="danger"
                                                            strong
                                                            style={{
                                                              fontSize: "14px",
                                                            }}
                                                          >
                                                            {formatCurrency(
                                                              product.gia
                                                            )}
                                                          </Text>
                                                        </div>

                                                        {/* Mã sản phẩm - Thêm kiểm tra chi tiết */}
                                                        <Typography.Text
                                                          type="secondary"
                                                          style={{
                                                            fontSize: "12px",
                                                          }}
                                                        >
                                                          Mã:{" "}
                                                          <Typography.Text
                                                            strong
                                                            style={{
                                                              fontSize: "12px",
                                                            }}
                                                          >
                                                            {product.maSanPham ||
                                                              (product.sanPhamChiTiet &&
                                                                product
                                                                  .sanPhamChiTiet
                                                                  .maSanPham) ||
                                                              (product.sanPham &&
                                                                product.sanPham
                                                                  .maSanPham) ||
                                                              "N/A"}
                                                          </Typography.Text>
                                                        </Typography.Text>

                                                        {/* Chất liệu */}
                                                        <Typography.Text
                                                          type="secondary"
                                                          style={{
                                                            fontSize: "12px",
                                                          }}
                                                        >
                                                          Chất liệu:{" "}
                                                          <Typography.Text
                                                            strong
                                                            style={{
                                                              fontSize: "12px",
                                                            }}
                                                          >
                                                            {typeof product.chatLieu ===
                                                            "object"
                                                              ? product.chatLieu
                                                                  ?.tenChatLieu ||
                                                                "N/A"
                                                              : product.chatLieu ||
                                                                "N/A"}
                                                          </Typography.Text>
                                                        </Typography.Text>

                                                        {/* Màu sắc và kích thước */}
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            justifyContent:
                                                              "space-between",
                                                            marginTop: 2,
                                                          }}
                                                        >
                                                          <div>
                                                            <Typography.Text
                                                              type="secondary"
                                                              style={{
                                                                fontSize:
                                                                  "12px",
                                                              }}
                                                            >
                                                              Màu:{" "}
                                                              <Typography.Text
                                                                strong
                                                                style={{
                                                                  fontSize:
                                                                    "12px",
                                                                }}
                                                              >
                                                                {typeof product.mauSac ===
                                                                "object"
                                                                  ? product
                                                                      .mauSac
                                                                      ?.tenMau ||
                                                                    "N/A"
                                                                  : product.mauSac ||
                                                                    "N/A"}
                                                              </Typography.Text>
                                                              {product.maMauSac && (
                                                                <div
                                                                  style={{
                                                                    display:
                                                                      "inline-block",
                                                                    width: 16,
                                                                    height: 12,
                                                                    borderRadius: 4,
                                                                    backgroundColor:
                                                                      product.maMauSac ||
                                                                      "#FFFFFF",
                                                                    border:
                                                                      "1px solid rgba(0, 0, 0, 0.1)",
                                                                    verticalAlign:
                                                                      "middle",
                                                                    marginLeft: 5,
                                                                  }}
                                                                />
                                                              )}
                                                            </Typography.Text>
                                                          </div>
                                                          <Typography.Text
                                                            type="secondary"
                                                            style={{
                                                              fontSize: "12px",
                                                            }}
                                                          >
                                                            Size:{" "}
                                                            <Typography.Text
                                                              strong
                                                              style={{
                                                                fontSize:
                                                                  "12px",
                                                              }}
                                                            >
                                                              {typeof product.kichThuoc ===
                                                              "object"
                                                                ? product
                                                                    .kichThuoc
                                                                    ?.tenKichThuoc ||
                                                                  "N/A"
                                                                : product.kichThuoc ||
                                                                  "N/A"}
                                                            </Typography.Text>
                                                          </Typography.Text>
                                                        </div>

                                                        {/* Tồn kho - Kiểm tra nhiều cách hiển thị số lượng */}
                                                        <Typography.Text
                                                          type="secondary"
                                                          style={{
                                                            fontSize: "12px",
                                                            marginTop: 2,
                                                          }}
                                                        >
                                                          Tồn kho:{" "}
                                                          <Typography.Text
                                                            strong
                                                            style={{
                                                              fontSize: "12px",
                                                              color:
                                                                (product.soLuong ||
                                                                  product.soLuongTonKho ||
                                                                  0) > 0
                                                                  ? "#52c41a"
                                                                  : "#f5222d",
                                                            }}
                                                          >
                                                            {product.soLuong ||
                                                              product.soLuongTonKho ||
                                                              0}
                                                          </Typography.Text>
                                                        </Typography.Text>
                                                      </Space>
                                                    </>
                                                  }
                                                />
                                              </Card>
                                            </List.Item>
                                          )}
                                        />
                                      </Collapse.Panel>
                                    </Collapse>
                                  )}
                                </Collapse.Panel>
                              </Collapse>
                            )}
                          </Space>
                        </Card>
                      );
                    })}
                  </Space>
                </div>
              )}

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                onClick={() => handleConfirmOrder(order.id)}
              >
                Xác nhận đơn hàng
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
      // Nếu có dữ liệu khách hàng mới được truyền trực tiếp từ form
      if (newCustomerData) {
        console.log(
          "Sử dụng dữ liệu khách hàng mới từ CreateForm:",
          newCustomerData
        );

        // Cập nhật danh sách khách hàng
        setCustomers((prev) => [newCustomerData, ...prev]);

        // Sử dụng dữ liệu khách hàng vừa tạo
        try {
          // Gọi API để liên kết khách hàng với hóa đơn
          await axios.put(
            `http://localhost:8080/api/admin/ban-hang/${activeKey}/customer`,
            { customerId: newCustomerData.id }, // Request body
            {
              headers: {
                Authorization: `Bearer ${token}` // Headers go here as third parameter
              }
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

          message.success(
            `Đã tạo và chọn khách hàng: ${newCustomerData.tenKhachHang}`
          );
        } catch (error) {
          console.error("Lỗi khi liên kết khách hàng với hóa đơn:", error);
          console.error("Chi tiết:", error.response?.data);
          message.error("Không thể liên kết khách hàng mới với hóa đơn");
        }

        // Đóng modal
        handleCloseCreateCustomerModal();
        return;
      }

      // Nếu không có dữ liệu trực tiếp, tải lại danh sách
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
      console.error("Lỗi khi làm mới danh sách khách hàng:", error);
      message.error("Không thể cập nhật thông tin khách hàng mới");
    }
  };
  // Thêm component wrapper để tương thích với CreateForm
  const CustomerFormWrapper = ({ onCustomerCreated }) => {
    const [customersList, setCustomersList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Tải danh sách khách hàng khi component được mount
    useEffect(() => {
      const loadAllCustomers = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(
            "http://localhost:8080/api/admin/khach_hang",
            {
              headers: {
                Authorization: `Bearer ${token}`, // Thêm token vào header
              },
            }
          );
          setCustomersList(response.data || []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách khách hàng:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadAllCustomers();
    }, []);

    // Hàm trả về danh sách khách hàng khi CreateForm cần kiểm tra trùng lặp
    const getCustomerList = () => {
      return customersList;
    };

    // Xử lý khi khách hàng mới được tạo từ CreateForm
    const handleCustomerCreated = (newCustomerData) => {
      console.log("Khách hàng mới được tạo:", newCustomerData);
      if (newCustomerData && onCustomerCreated) {
        onCustomerCreated(newCustomerData);
      }
    };

    if (isLoading) {
      return (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spin tip="Đang tải..." />
        </div>
      );
    }

    return (
      <CreateForm
        getAllKhachHang={getCustomerList}
        handleClose={(newCustomerData) =>
          handleCustomerCreated(newCustomerData)
        }
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
  // Update handlePaymentMethodChange to include IDs for payment methods
const handlePaymentMethodChange = (hoaDonId, selectedMethods) => {
  const orderTotal = totals[hoaDonId]?.finalTotal || 0;
  const hasBothMethods = 
    selectedMethods.includes(PAYMENT_METHOD.CASH) && 
    selectedMethods.includes(PAYMENT_METHOD.QR);

  // Map selected methods to payment objects with proper structure
  const selectedPayments = selectedMethods.map(methodCode => {
    // Find the full payment method object from paymentMethods array
    const method = paymentMethods.find(m => m.maPhuongThucThanhToan === methodCode);
    
    if (!method) {
      console.error('Payment method not found:', methodCode);
      return null;
    }

    // Calculate default amount based on payment method
    let defaultAmount = 0;
    if (hasBothMethods) {
      if (methodCode === PAYMENT_METHOD.QR) {
        defaultAmount = orderTotal; // Default bank transfer to total amount
      }
      // Cash amount starts at 0 when both methods are selected
    } else if (selectedMethods.length === 1) {
      defaultAmount = orderTotal; // Single payment method gets full amount
    }

    // Create payment object with unique ID
    const paymentId = `${hoaDonId}_${methodCode}`;

    return {
      id: paymentId,
      maPhuongThucThanhToan: method.maPhuongThucThanhToan,
      tenPhuongThucThanhToan: method.tenPhuongThucThanhToan,
      soTien: defaultAmount,
    };
  }).filter(Boolean); // Remove any null values

  // Update tabs state with new payments
  setTabs(prev => prev.map(tab => 
    tab.key === hoaDonId 
      ? { 
          ...tab, 
          order: { 
            ...tab.order, 
            thanhToans: selectedPayments 
          } 
        }
      : tab
  ));

  // Generate QR code if bank transfer is selected
  if (selectedMethods.includes(PAYMENT_METHOD.QR)) {
    const qrAmount = hasBothMethods ? orderTotal : orderTotal;
    generateQR(hoaDonId, qrAmount);
  }
};

  // Update the payment input handler for better experience when using both payment methods
  // Update handlePaymentAmountChange to maintain payment IDs
  const handlePaymentAmountChange = (hoaDonId, methodCode, amount) => {
    const orderTotal = totals[hoaDonId]?.finalTotal || 0;
    const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

    if (!currentOrder?.thanhToans) return;

    const hasBothMethods =
      currentOrder.thanhToans.some(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
      ) &&
      currentOrder.thanhToans.some(
        (p) => p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
      );

    // Nếu là thanh toán tiền mặt và số tiền vượt quá tổng đơn hàng
    if (methodCode === PAYMENT_METHOD.CASH && amount > orderTotal) {
      // Người dùng đưa tiền nhiều hơn, chỉ dùng phương thức tiền mặt
      if (hasBothMethods) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId
              ? {
                  ...tab,
                  order: {
                    ...tab.order,
                    thanhToans: tab.order.thanhToans.map((p) =>
                      p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                        ? { ...p, soTien: amount } // Giữ nguyên số tiền người dùng nhập vào
                        : p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                        ? { ...p, soTien: 0 } // Đặt số tiền chuyển khoản về 0
                        : p
                    ),
                  },
                }
              : tab
          )
        );

        // Thông báo cho người dùng
        message.info("Đơn hàng sẽ thanh toán bằng tiền mặt và có tiền thừa");
      } else {
        // Nếu chỉ có một phương thức thanh toán tiền mặt, cập nhật bình thường
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
    }
    // Xử lý thanh toán tiền mặt bình thường khi số tiền <= tổng đơn hàng
    else if (methodCode === PAYMENT_METHOD.CASH) {
      // Nếu có cả hai phương thức thanh toán, tự động điều chỉnh số tiền chuyển khoản
      if (hasBothMethods) {
        const cashAmount = amount || 0;
        const transferAmount = Math.max(0, orderTotal - cashAmount);

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
                        ? { ...p, soTien: transferAmount }
                        : p
                    ),
                  },
                }
              : tab
          )
        );

        // Cập nhật QR code với số tiền chuyển khoản mới
        if (transferAmount > 0) {
          generateQR(hoaDonId, transferAmount);
        }
      }
      // Nếu chỉ có phương thức tiền mặt
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
    }
    // Xử lý khi người dùng nhập số tiền cho chuyển khoản
    else if (methodCode === PAYMENT_METHOD.QR) {
      // Nếu có cả hai phương thức thanh toán, tự động điều chỉnh số tiền tiền mặt
      if (hasBothMethods) {
        const transferAmount = amount || 0;

        // Nếu số tiền chuyển khoản vượt quá tổng đơn hàng
        if (transferAmount > orderTotal) {
          message.warning(
            "Số tiền chuyển khoản không nên vượt quá tổng đơn hàng"
          );
          // Giới hạn số tiền chuyển khoản bằng tổng đơn hàng và đặt tiền mặt về 0
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === hoaDonId
                ? {
                    ...tab,
                    order: {
                      ...tab.order,
                      thanhToans: tab.order.thanhToans.map((p) =>
                        p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                          ? { ...p, soTien: orderTotal }
                          : p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                          ? { ...p, soTien: 0 }
                          : p
                      ),
                    },
                  }
                : tab
            )
          );

          // Cập nhật QR code với số tiền đúng bằng tổng đơn hàng
          generateQR(hoaDonId, orderTotal);
        }
        // Xử lý bình thường nếu số tiền chuyển khoản không vượt quá tổng đơn hàng
        else {
          const cashAmount = Math.max(0, orderTotal - transferAmount);
          setTabs((prev) =>
            prev.map((tab) =>
              tab.key === hoaDonId
                ? {
                    ...tab,
                    order: {
                      ...tab.order,
                      thanhToans: tab.order.thanhToans.map((p) =>
                        p.maPhuongThucThanhToan === PAYMENT_METHOD.QR
                          ? { ...p, soTien: transferAmount }
                          : p.maPhuongThucThanhToan === PAYMENT_METHOD.CASH
                          ? { ...p, soTien: cashAmount }
                          : p
                      ),
                    },
                  }
                : tab
            )
          );

          // Cập nhật QR code với số tiền chuyển khoản mới
          if (transferAmount > 0) {
            generateQR(hoaDonId, transferAmount);
          }
        }
      }
      // Nếu chỉ có phương thức chuyển khoản
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

        // Cập nhật QR code nếu là phương thức chuyển khoản
        if (amount > 0) {
          generateQR(hoaDonId, amount);
        }
      }
    }
  };

  const handleShippingFeeChange = async (hoaDonId, fee) => {
    try {
      // Cập nhật state ngay lập tức cho UX tốt hơn
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? { ...tab, order: { ...tab.order, phiVanChuyen: fee } }
            : tab
        )
      );

      // Cập nhật tổng tiền với phí vận chuyển mới
      setTotals((prev) => {
        const current = prev[hoaDonId] || {};
        return {
          ...prev,
          [hoaDonId]: {
            ...current,
            shippingFee: fee,
            finalTotal:
              (current.subtotal || 0) - (current.discountAmount || 0) + fee,
          },
        };
      });

      // Gọi API với đường dẫn chính xác
      const response = await axios.post(
        `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
        { fee: fee },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      console.log("Cập nhật phí vận chuyển thành công:", response.data);
      message.success(
        `Đã cập nhật phí vận chuyển: ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(fee)}`
      );
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
          }
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
        {  customerId: customerId},
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

  // Update calculateTotalBeforeDiscount to handle undefined/null cases
  // const calculateTotalBeforeDiscount = (products) => {
  //   if (!products || !Array.isArray(products)) {
  //     return 0;
  //   }
  //   return products.reduce((sum, product) => {
  //     const price = product.gia || 0;
  //     const quantity = product.soLuong || 0;
  //     return sum + price * quantity;
  //   }, 0);
  // };

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

  // Add fetchPaymentHistory from InvoiceDetail if needed
  const fetchPaymentHistory = async () => {
    if (!activeKey) return;

    try {
      setLoadingPayments(true);
      const response = await api.get(
        `/api/admin/hoa-don/${activeKey}/payment-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      setPaymentHistory(response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Update fetchProducts to match InvoiceDetail format
  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/admin/hoa-don/san-pham/all", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      const productsData = response.data;

      // Lấy hình ảnh từ API
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Thêm token vào header
                },
              }
            );

            // Ensure imageUrls is always an array
            const imageUrls = Array.isArray(imgResponse.data)
              ? imgResponse.data.map((img) => img.anhUrl)
              : [];

            return {
              ...product,
              // Store full array of image URLs instead of just first one
              hinhAnh: imageUrls,
            };
          } catch (error) {
            console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
            return { ...product, hinhAnh: [] }; // Return empty array if error
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
      console.log(`📢 Fetching products for invoice: ${hoaDonId}`);

      // Sử dụng debounce để tránh gọi API quá nhiều lần
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
                    Authorization: `Bearer ${token}`, // Thêm token vào header
                  },
                }
              );
              let products = response.data || [];

              // Tối ưu: Chỉ lấy hình ảnh cho sản phẩm chưa có
              const productsWithImages = await Promise.all(
                products.map(async (product) => {
                  if (product.hinhAnh && product.hinhAnh.length > 0) {
                    return product;
                  }

                  try {
                    // Sử dụng cache để lưu hình ảnh
                    const cacheKey = `product_image_${product.id}`;
                    let cachedImages = sessionStorage.getItem(cacheKey);

                    if (cachedImages) {
                      return {
                        ...product,
                        hinhAnh: JSON.parse(cachedImages),
                      };
                    }

                    const imgResponse = await api.get(
                      `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`, // Thêm token vào header
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
                      ...product,
                      hinhAnh: imageUrls,
                    };
                  } catch (error) {
                    console.error(
                      `❌ Lỗi khi lấy ảnh sản phẩm ${product.id}:`,
                      error
                    );
                    return { ...product, hinhAnh: [] };
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
                  const newTotals = calculateOrderTotals(hoaDonId);

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

              resolve(productsWithImages);
            } catch (error) {
              console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
              resolve([]);
            }
          },
          skipUIUpdate ? 0 : 300
        ); // Không debounce khi đang khởi tạo
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
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

  // Add function to calculate all totals for an order
  // const calculateOrderTotals = (hoaDonId, productsOverride, orderOverride) => {
  //   console.log("Calculating totals for order:", hoaDonId);

  //   // Sử dụng dữ liệu override nếu có, ngược lại lấy từ state
  //   const products = productsOverride || orderProducts[hoaDonId] || [];
  //   const order =
  //     orderOverride || tabs.find((tab) => tab.key === hoaDonId)?.order;

  //   if (!order) {
  //     console.warn("No order found for totals calculation");
  //     return {
  //       subtotal: 0,
  //       shippingFee: 0,
  //       totalBeforeVoucher: 0,
  //       discountAmount: 0,
  //       finalTotal: 0,
  //       voucherType: null,
  //       voucherValue: null,
  //     };
  //   }

  //   // Tính tổng tiền sản phẩm
  //   const subtotal = calculateTotalBeforeDiscount(products);

  //   // Lấy phí vận chuyển từ order
  //   const shippingFee = order.phiVanChuyen || 0;

  //   // QUAN TRỌNG: Tổng tiền trước khi áp dụng voucher (KHÔNG bao gồm phí vận chuyển)
  //   // Voucher chỉ áp dụng cho tiền hàng, không áp dụng cho phí vận chuyển
  //   const totalBeforeVoucher = subtotal;

  //   // Tính toán giảm giá dựa trên voucher
  //   let discountAmount = 0;
  //   let voucherType = null;
  //   let voucherValue = null;

  //   if (order.phieuGiamGia) {
  //     // Chuyển đổi sang số nếu cần
  //     voucherType = Number(order.phieuGiamGia.loaiPhieuGiamGia);
  //     voucherValue = order.phieuGiamGia.giaTriGiam;

  //     // QUAN TRỌNG: Áp dụng voucher chỉ trên giá trị sản phẩm, không bao gồm phí vận chuyển
  //     const amountForDiscount = subtotal; // Chỉ áp dụng voucher cho tiền hàng

  //     discountAmount = calculateDiscountAmount(
  //       {
  //         ...order.phieuGiamGia,
  //         loaiPhieuGiamGia: voucherType,
  //       },
  //       amountForDiscount
  //     );
  //   }

  //   // Tổng tiền cuối cùng = tiền hàng - giảm giá + phí vận chuyển
  //   const finalTotal = subtotal - discountAmount + shippingFee;

  //   console.log("📊 Chi tiết tính toán:", {
  //     subtotal,
  //     shippingFee,
  //     totalBeforeVoucher,
  //     discountAmount,
  //     finalTotal,
  //     voucher: order.phieuGiamGia,
  //     voucherType,
  //     voucherValue,
  //   });

  //   return {
  //     subtotal,
  //     shippingFee,
  //     totalBeforeVoucher,
  //     discountAmount,
  //     finalTotal,
  //     voucherType,
  //     voucherValue,
  //   };
  // };

  // Update the autoApplyBestVoucher function
  const autoApplyBestVoucher = async (hoaDonId) => {
    try {
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (!order) return;

      // Lấy danh sách sản phẩm của đơn hàng
      const currentProducts = orderProducts[hoaDonId] || [];
      const totalBeforeVoucher =
        calculateTotalBeforeDiscount(currentProducts) +
        (order.phiVanChuyen || 0);

      if (totalBeforeVoucher <= 0) {
        message.info("Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá.");
        return;
      }

      // Gọi API lấy danh sách voucher hợp lệ
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      const availableVouchers = response.data || [];

      if (!availableVouchers.length) {
        message.info("Không có mã giảm giá phù hợp.");
        return;
      }

      // 🔍 Tìm voucher giảm giá cao nhất
      const bestVoucher = availableVouchers.reduce((best, current) => {
        if (totalBeforeVoucher < current.giaTriToiThieu) return best;

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
        message.info("Không tìm thấy phiếu giảm giá tốt hơn.");
        return;
      }

      // 🔍 Tính toán số tiền giảm giá
      const newDiscount = calculateDiscountAmount(
        bestVoucher,
        totalBeforeVoucher
      );
      const currentDiscount = order.phieuGiamGia
        ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
        : 0;

      if (newDiscount <= currentDiscount) {
        message.info("Mã giảm giá hiện tại đã là tốt nhất.");
        return;
      }

      //Gọi API để áp dụng phiếu giảm giá mới
      await api.post(
        `/api/admin/ban-hang/${hoaDonId}/voucher`,
        {
          voucherId: bestVoucher.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔹 Cập nhật `order` mới trong `tabs`
      const updatedOrder = {
        ...order,
        phieuGiamGia: bestVoucher,
        giamGia: newDiscount,
        tongThanhToan: totalBeforeVoucher - newDiscount,
      };

      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
        )
      );

      // 🔹 Cập nhật tổng tiền trong `totals`
      const newTotals = {
        subtotal: calculateTotalBeforeDiscount(currentProducts),
        shippingFee: order.phiVanChuyen || 0,
        totalBeforeVoucher,
        discountAmount: newDiscount,
        finalTotal: totalBeforeVoucher - newDiscount,
      };

      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: newTotals,
      }));

      message.success(
        `Đã áp dụng mã giảm giá tốt nhất: ${bestVoucher.maPhieuGiamGia}`
      );

      //Làm mới danh sách sản phẩm để đồng bộ dữ liệu
      await fetchInvoiceProducts(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi tự động áp dụng voucher:", error);
      message.error("Không thể áp dụng mã giảm giá tự động.");
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
      setPagination({ current: 1, pageSize: 3 });
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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setPaymentMethodsLoading(true);
      try {
        const response = await api.get("/api/admin/phuong-thuc-thanh-toan", {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        });
        setPaymentMethods(response.data);
      } catch (error) {
        message.error("Lỗi khi tải phương thức thanh toán");
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

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

  // Thêm useEffect mới để gọi findBestVoucherAndSuggest
  useEffect(() => {
    if (activeKey && orderProducts[activeKey]) {
      console.log("Triggering voucher suggestions...");
      findBestVoucherAndSuggest(activeKey);
    }
  }, [activeKey, orderProducts[activeKey]]); // Thêm dependency

  // Thêm hàm fetchInvoiceById để tải lại thông tin hóa đơn từ server
  const fetchInvoiceById = async (hoaDonId) => {
    try {
      console.log("Đang tải thông tin hóa đơn:", hoaDonId);

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

  // Thêm hàm findSuggestedProducts để tìm sản phẩm gợi ý
  const findSuggestedProducts = async (currentProducts, amountNeeded) => {
    try {
      // Lấy danh sách tất cả sản phẩm từ server
      const response = await api.get("/api/admin/san-pham", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      const allProducts = response.data || [];

      // Lọc ra các sản phẩm đang có trong đơn hàng để tránh gợi ý trùng lặp
      const currentProductIds = currentProducts.map((p) => p.id);

      // Lọc sản phẩm có số lượng tồn kho > 0
      const availableProducts = allProducts.filter(
        (p) => !currentProductIds.includes(p.id) && p.soLuong > 0
      );

      // Sắp xếp theo mức độ phù hợp với số tiền cần thêm
      availableProducts.sort((a, b) => {
        // Ưu tiên sản phẩm có giá gần với số tiền cần thêm
        const diffA = Math.abs(a.gia - amountNeeded);
        const diffB = Math.abs(b.gia - amountNeeded);
        return diffA - diffB;
      });

      // Trả về tối đa 10 sản phẩm gợi ý
      return availableProducts.slice(0, 10);
    } catch (error) {
      console.error("Lỗi khi tìm sản phẩm gợi ý:", error);
      return [];
    }
  };

  // Thêm hàm mới để cập nhật tổng tiền đơn hàng
  const updateOrderTotals = (hoaDonId) => {
    const calculatedTotals = calculateOrderTotals(hoaDonId);
    if (calculatedTotals) {
      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: calculatedTotals,
      }));

      // Cập nhật tổng tiền trong order
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.key === hoaDonId) {
            return {
              ...tab,
              order: {
                ...tab.order,
                tongTien: calculatedTotals.totalBeforeVoucher,
                giamGia: calculatedTotals.discountAmount,
                tongThanhToan: calculatedTotals.finalTotal,
              },
            };
          }
          return tab;
        })
      );
    }
  };

  // Thêm hàm để lấy tất cả sản phẩm từ server
  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/api/admin/sanpham/chitietsanpham", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });

      // Đảm bảo các trường quan trọng được giữ nguyên
      const processedProducts = response.data.map((product) => ({
        ...product,
        maSanPham:
          product.maSanPham ||
          product.sanPhamChiTiet?.maSanPham ||
          "SP" + product.id,
      }));

      return processedProducts || [];
    } catch (error) {
      console.error(" Lỗi khi lấy danh sách sản phẩm:", error);
      return [];
    }
  };

  // Thêm hàm mới để xử lý việc áp dụng voucher
  const applyVoucherToOrder = async (hoaDonId, voucherId) => {
    try {
      // Gọi API để áp dụng voucher
      const response = await api.post(
        `/api/admin/ban-hang/${hoaDonId}/voucher`,
        {voucherId: voucherId,
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
          
        }
      );

      if (response.data) {
        const updatedOrder = response.data;

        // Cập nhật order trong tabs
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
          )
        );

        // Lấy thông tin sản phẩm hiện tại
        const products = orderProducts[hoaDonId] || [];

        // Tính toán lại tổng tiền
        const subtotal = calculateTotalBeforeDiscount(products);
        const shippingFee = updatedOrder.phiVanChuyen || 0;
        const totalBeforeVoucher = subtotal + shippingFee;

        // Tính toán giảm giá
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

        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
      message.error("Lỗi khi áp dụng voucher");
      return false;
    }
  };

  // Thêm hàm mới để tải lại thông tin hóa đơn từ server
  const refreshInvoiceData = async (hoaDonId) => {
    try {
      console.log("🔄 Refreshing invoice data for:", hoaDonId);

      // Kiểm tra xem hoaDonId có hợp lệ không
      if (!hoaDonId) {
        console.warn("Không có hoaDonId hợp lệ để tải dữ liệu");
        return null;
      }

      // Gọi API để lấy thông tin hóa đơn mới nhất
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });

      if (response.data) {
        const updatedOrder = response.data;

        // Ghi log thông tin hóa đơn để debug
        console.log("Thông tin hóa đơn từ server:", {
          id: updatedOrder.id,
          maHoaDon: updatedOrder.maHoaDon,
          tongTien: updatedOrder.tongTien,
          giamGia: updatedOrder.giamGia,
          tongThanhToan: updatedOrder.tongThanhToan,
          phieuGiamGia: updatedOrder.phieuGiamGia,
        });

        // Cập nhật order trong tabs
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
          )
        );

        // Tải lại sản phẩm
        const products = await fetchInvoiceProducts(hoaDonId, true);

        // Tính toán lại tổng tiền
        const newTotals = calculateOrderTotals(hoaDonId);

        console.log("Tổng tiền sau khi tính toán:", newTotals);

        setTotals((prev) => ({
          ...prev,
          [hoaDonId]: newTotals,
        }));

        // Cập nhật UI nếu đang ở tab này
        if (hoaDonId === activeKey) {
          setTotalBeforeDiscount(newTotals.subtotal);
          setTotalAmount(newTotals.finalTotal);
        }

        return { updatedOrder, products, newTotals };
      }
    } catch (error) {
      console.error("Lỗi khi tải lại thông tin hóa đơn:", error);
      // Không hiển thị thông báo lỗi để tránh làm phiền người dùng
      // Thay vào đó, sử dụng dữ liệu hiện có

      // Lấy thông tin hóa đơn hiện tại từ tabs
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (currentOrder) {
        // Tải lại sản phẩm
        const products = await fetchInvoiceProducts(hoaDonId, true);

        // Tính toán lại tổng tiền dựa trên dữ liệu hiện có
        const subtotal = calculateTotalBeforeDiscount(products);
        const shippingFee = currentOrder.phiVanChuyen || 0;
        const totalBeforeVoucher = subtotal + shippingFee;
        const discountAmount = currentOrder.giamGia || 0;
        const finalTotal = totalBeforeVoucher - discountAmount;

        // Cập nhật totals
        const newTotals = {
          subtotal,
          shippingFee,
          totalBeforeVoucher,
          discountAmount,
          finalTotal,
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

        return { updatedOrder: currentOrder, products, newTotals };
      }
    }

    return null;
  };

  // Sửa hàm handleApplyBestVoucher để xử lý lỗi khi áp dụng voucher gợi ý
  const handleApplyBestVoucher = async (hoaDonId, voucherId) => {
    try {
      console.log("Áp dụng voucher gợi ý:", { hoaDonId, voucherId });

      // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
      if (!hoaDonId || !voucherId) {
        console.error("hoaDonId hoặc voucherId không hợp lệ");
        message.error("Không thể áp dụng voucher");
        return false;
      }

      // Sửa endpoint API - thêm /voucher vào cuối URL
      const response = await api.post(
        `/api/admin/hoa-don/${hoaDonId}/voucher`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
          voucherId: voucherId,
        }
      );

      if (response.data) {
        message.success("Áp dụng voucher thành công");

        // Cập nhật thông tin hóa đơn từ response
        const updatedOrder = response.data;

        // Cập nhật order trong tabs
        setTabs((prev) =>
          prev.map((tab) =>
            tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
          )
        );

        // Tải lại sản phẩm
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

        // Đóng gợi ý voucher
        setVoucherSuggestions({
          show: false,
          betterVouchers: [],
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher gợi ý:", error);
      message.error("Lỗi khi áp dụng voucher");
      return false;
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
      // Giả định rằng mã QR chứa ID của sản phẩm
      const productId = qrData;

      if (!scanningForHoaDonId) {
        message.error("Không xác định được hóa đơn đang xử lý");
        setIsQrScannerVisible(false);
        return;
      }

      // Gọi API để lấy thông tin sản phẩm
      const response = await axios.get(
        `http://localhost:8080/api/admin/sanpham/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );
      const product = response.data;

      // Thêm sản phẩm vào hóa đơn với số lượng mặc định là 1
      await handleAddProductToOrder(product);

      message.success(`Đã thêm sản phẩm "${product.tenSanPham}" vào hóa đơn`);
      setIsQrScannerVisible(false);
    } catch (error) {
      console.error("Lỗi khi xử lý mã QR:", error);
      message.error("Không tìm thấy sản phẩm từ mã QR hoặc có lỗi xảy ra");
    }
  };

  // Xử lý khi có lỗi quét QR
  const handleQrScanError = (error) => {
    console.error("Lỗi quét QR:", error);
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
          <div className="customer-modal-title">
            <div className="customer-modal-icon">
              <UserOutlined />
            </div>
            <span>Chọn khách hàng</span>
          </div>
        }
        open={openCustomerDialog}
        onCancel={() => setOpenCustomerDialog(false)}
        footer={null}
        width={800}
        className="customer-selection-modal"
        bodyStyle={{ padding: "0" }}
        style={{ top: 20 }}
      >
        <div className="customer-modal-content">
          <div className="customer-search-container">
            <Input.Search
              placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
              allowClear
              enterButton={false}
              onSearch={(value) => {
                // API search - implement if backend supports
              }}
              onChange={(e) => {
                const searchValue = e.target.value.toLowerCase();
                // Lọc dữ liệu trên client
                if (!searchValue) {
                  loadCustomers();
                } else {
                  const filtered = customers.filter(
                    (customer) =>
                      customer.tenKhachHang
                        ?.toLowerCase()
                        .includes(searchValue) ||
                      (customer.soDienThoai &&
                        customer.soDienThoai
                          .toLowerCase()
                          .includes(searchValue)) ||
                      (customer.email &&
                        customer.email.toLowerCase().includes(searchValue))
                  );
                  setCustomers(filtered);
                }
              }}
              className="customer-search-input"
            />
          </div>

          <List
            className="customer-list"
            itemLayout="horizontal"
            dataSource={customers}
            locale={{
              emptyText: (
                <div className="empty-customer-list">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy khách hàng"
                  />
                </div>
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
            renderItem={(customer) => (
              <List.Item
                className="customer-list-item"
                onClick={() => handleCustomerSelected(activeKey, customer.id)}
              >
                <List.Item.Meta
                  avatar={
                    <div className="avatar-container">
                      <Avatar
                        src={customer.avatar}
                        size={54}
                        className="customer-avatar"
                      >
                        {!customer.avatar &&
                          customer.tenKhachHang?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </div>
                  }
                  title={
                    <div className="customer-name-container">
                      <Text strong className="customer-name">
                        {customer.tenKhachHang}
                      </Text>
                    </div>
                  }
                  description={
                    <div className="customer-details">
                      {customer.soDienThoai && (
                        <div className="customer-contact-info">
                          <PhoneOutlined />
                          <Text type="secondary">{customer.soDienThoai}</Text>
                        </div>
                      )}
                      {customer.email && (
                        <div className="customer-contact-info">
                          <MailOutlined />
                          <Text type="secondary">{customer.email}</Text>
                        </div>
                      )}
                      {customer.diaChi && (
                        <div className="customer-contact-info">
                          <EnvironmentOutlined />
                          <Text
                            type="secondary"
                            ellipsis={{ tooltip: customer.diaChi }}
                          >
                            {customer.diaChi}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
                <div className="customer-action-btn">
                  <Button
                    type="primary"
                    icon={<SelectOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCustomerSelected(activeKey, customer.id);
                    }}
                  >
                    Chọn
                  </Button>
                </div>
              </List.Item>
            )}
          />

          <div className="customer-modal-footer">
            <Button onClick={() => setOpenCustomerDialog(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                setOpenCustomerDialog(false);
                handleAddNewCustomer();
              }}
            >
              Thêm khách hàng mới
            </Button>
          </div>
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
            const discountAmount = calculateDiscountAmount(
              voucher,
              originalTotal
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
          <Button
            key="cancel"
            onClick={modalHandlers.onCancel}
          >
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
        open={openProductTable}
        onClose={() => setOpenProductTable(false)}
      />
      {/* Modal thêm khách hàng mới */}
      <Modal
        title="Thêm Khách Hàng Mới"
        open={isCreateCustomerModalVisible}
        onCancel={handleCloseCreateCustomerModal}
        footer={null}
        width={900}
      >
        <CustomerFormWrapper onCustomerCreated={refreshCustomers} />
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
    </Layout>
  );
};

export default BanHang;
