import React, { useEffect, useState, useRef } from "react";

import "./BanHangCss.css";
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
  Tag,
  Carousel,
  Divider, // Add this import
  Modal as AntdModal, // Add this import
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  SelectOutlined,
  SearchOutlined,
  TagOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { checkPayment } from "./checkPayment"; // Import hàm checkPayment
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
const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Add near the top of the file with other constants
const PAYMENT_METHOD = {
  CASH: "COD",
  QR:"BANK"
  // Add other payment methods as needed
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
  const [previewOpen, setPreviewOpen] = useState(false); // Add this state
  const [pdfUrl, setPdfUrl] = useState(null); // Add this state
  const [customerPayment, setCustomerPayment] = useState({}); // Add this state

  // Add this function to calculate change/remaining amount
  const calculateChange = (hoaDonId) => {
    const orderTotals = totals[hoaDonId];
    if (!orderTotals) return { change: 0, remaining: 0 };

    const amountPaid = customerPayment[hoaDonId] || 0;
    const finalTotal = orderTotals.finalTotal || 0;

    if (amountPaid >= finalTotal) {
      return {
        change: amountPaid - finalTotal,
        remaining: 0,
      };
    } else {
      return {
        change: 0,
        remaining: finalTotal - amountPaid,
      };
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
      title: "",
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
  const fetchPendingOrders = async () => {
    try {
      const response = await api.get("/api/admin/ban-hang/hoadoncho");
      const orders = response.data;

      if (orders.length > 0) {
        const newTabs = orders.map((order, index) => ({
          key: order.id,
          title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
          order: order,
        }));
        setTabs(newTabs);
        setActiveKey(orders[0].id);

        // Initialize products and calculate totals for each order
        const productsMap = {};
        const totalsMap = {};

        for (const order of orders) {
          const products = await fetchInvoiceProducts(order.id);
          productsMap[order.id] = products;

          // Calculate totals for this order
          const orderTotals = {
            subtotal: calculateTotalBeforeDiscount(products),
            shippingFee: order.phiVanChuyen || 0,
            discountAmount: 0,
            finalTotal: 0,
          };

          orderTotals.totalBeforeVoucher =
            orderTotals.subtotal + orderTotals.shippingFee;

          if (order.phieuGiamGia) {
            orderTotals.discountAmount = calculateDiscountAmount(
              order.phieuGiamGia,
              orderTotals.totalBeforeVoucher
            );
          }

          orderTotals.finalTotal =
            orderTotals.totalBeforeVoucher - orderTotals.discountAmount;
          totalsMap[order.id] = orderTotals;
        }

        setOrderProducts(productsMap);
        setTotals(totalsMap);

        // Set initial totals for active tab
        if (orders[0]) {
          setTotalBeforeDiscount(totalsMap[orders[0].id]?.subtotal || 0);
          setTotalAmount(totalsMap[orders[0].id]?.totalBeforeVoucher || 0);
        }
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách hóa đơn");
    }
  };
  useEffect(() => {
    if (activeKey) {
      const currentTotals = totals[activeKey];
      if (currentTotals) {
        setTotalBeforeDiscount(currentTotals.subtotal);
        setTotalAmount(currentTotals.totalBeforeVoucher);
      }

      setPagination({ current: 1, pageSize: 3 });
      fetchInvoiceProducts(activeKey).then((products) => {
        // Recalculate totals after fetching products
        const newTotals = calculateOrderTotals(activeKey);
        setTotals((prev) => ({
          ...prev,
          [activeKey]: newTotals,
        }));
      });
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
      const response = await api.post("/api/admin/ban-hang/create", {
        emailNhanVien: "vnv@gmail.com", // Replace with actual logged-in user
      });

      const newOrder = response.data;
      // Use id instead of maHoaDon for API calls
      const newOrderKey = newOrder.id;

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
  const handleAddProductToOrder = async (products, quantity = null) => {
    if (!activeKey) {
        message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
        return;
    }

    if (!products || (Array.isArray(products) && products.length === 0)) {
        message.warning("Không có sản phẩm nào để thêm vào hóa đơn.");
        return;
    }

    try {
        const isMultiple = Array.isArray(products);
        const payload = isMultiple
            ? { productList: products.map(p => ({ sanPhamChiTietId: p.id, soLuong: p.soLuong })) }
            : { sanPhamChiTietId: products.id, soLuong: quantity || 1 };

        // ✅ Kiểm tra phản hồi từ API
        const response = await api.post(`/api/admin/ban-hang/${activeKey}/add-product`, payload);
        
        if (!response || !response.data) {
            throw new Error("Dữ liệu trả về từ API không hợp lệ.");
        }

        console.log("✅ API Response:", response.data);

        // ✅ Chạy các hàm cập nhật UI song song bằng Promise.all()
        const [updatedProducts] = await Promise.all([
            fetchInvoiceProducts(activeKey),
            autoApplyBestVoucher(activeKey),
        ]);

        setOrderProducts(prev => ({ ...prev, [activeKey]: updatedProducts }));
        setTotals(prev => ({
            ...prev,
            [activeKey]: calculateOrderTotals(activeKey),
        }));

        message.success("Thêm sản phẩm thành công");
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        message.error("Lỗi khi thêm sản phẩm, vui lòng kiểm tra lại.");
        await fetchInvoiceProducts(activeKey);
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
        { soLuong: newQuantity }
      );

      // 🟢 Tự động áp dụng mã giảm giá tốt nhất
      await autoApplyBestVoucher(hoaDonId);

      await fetchInvoiceProducts(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error("Lỗi khi cập nhật số lượng!");
      await fetchInvoiceProducts(hoaDonId);
    }
  };

  // 5. Remove product
  const handleRemoveProduct = async (hoaDonId, hoaDonChiTietId) => {
    try {
      const updatedProducts = orderProducts[hoaDonId].filter(
        (product) => product.id !== hoaDonChiTietId
      );

      setOrderProducts((prev) => ({ ...prev, [hoaDonId]: updatedProducts }));

      await api.delete(
        `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`
      );

      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const newTotalBeforeVoucher =
        calculateTotalBeforeDiscount(updatedProducts) +
        (currentOrder?.phiVanChuyen || 0);

      if (
        currentOrder?.phieuGiamGia &&
        newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
      ) {
        await handleRemoveVoucher(hoaDonId);
        message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
      }

      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: calculateOrderTotals(hoaDonId),
      }));

      await fetchInvoiceProducts(hoaDonId);

      // 🟢 Tự động áp dụng mã giảm giá tốt nhất
      await autoApplyBestVoucher(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      message.error("Lỗi khi xóa sản phẩm!");
    }
  };

  // 6. Apply voucher
  const handleVoucherSelected = async (hoaDonId) => {
    try {
      await fetchAvailableVouchers();
      const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
      const currentProducts = orderProducts[hoaDonId] || [];

      const subtotal = calculateTotalBeforeDiscount(currentProducts);
      const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);

      const bestVoucher = vouchers.reduce((best, current) => {
        if (totalWithShipping < current.giaTriToiThieu) {
          return best;
        }

        const currentDiscount = calculateDiscountAmount(
          current,
          totalWithShipping
        );
        const bestDiscount = best
          ? calculateDiscountAmount(best, totalWithShipping)
          : 0;

        return currentDiscount > bestDiscount ? current : best;
      }, null);

      if (!bestVoucher) {
        message.error("Không tìm thấy voucher hợp lệ");
        return;
      }

      const discountAmount = calculateDiscountAmount(
        bestVoucher,
        totalWithShipping
      );
      const finalTotal = totalWithShipping - discountAmount;

      // Cập nhật API
      await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
        voucherId: bestVoucher.id,
      });

      // Cập nhật UI
      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  tongTien: totalWithShipping,
                  giamGia: discountAmount,
                  tongThanhToan: finalTotal,
                  phieuGiamGia: bestVoucher,
                },
              }
            : tab
        )
      );

      // Cập nhật totals
      setTotals((prev) => ({
        ...prev,
        [hoaDonId]: {
          subtotal,
          shippingFee: currentOrder?.phiVanChuyen || 0,
          totalBeforeVoucher: totalWithShipping,
          discountAmount,
          finalTotal,
        },
      }));

      setOpenVoucherDialog(false);
      message.success("Áp dụng voucher thành công");

      await fetchInvoiceProducts(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
      message.error("Lỗi khi áp dụng voucher!");
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
      await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`);

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
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}`
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

      if (!currentOrder || !currentOrder.phuongThucThanhToan) {
        message.error(
          "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
        );
        return;
      }

      // Only check payment amount for cash payments
      if ( 
        currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
        PAYMENT_METHOD.CASH
      ) {
        const { remaining } = calculateChange(hoaDonId);
        if (remaining > 0) {
          message.error("Số tiền khách đưa chưa đủ để thanh toán!");
          return;
        }
      }
      //check payment qr
      if (
        currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
        PAYMENT_METHOD.QR
      ) {
        generateQR();
        setIsModalVisiblePaymentQR(true);
  
        let isPaid = false;
        let attempts = 0;
        const maxAttempts = 60; // Chờ tối đa 120 giây (mỗi 2 giây kiểm tra 1 lần)
  
        while (!isPaid && attempts < maxAttempts) {
          isPaid = await checkPayment(activeKey,totals[activeKey]?.finalTotal);
          if (isPaid) break;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ 2 giây
          attempts++;
        }
  
        if (!isPaid) {
          setIsModalVisiblePaymentQR(false)
          message.error("Chưa nhận được thanh toán, vui lòng thử lại!");
          return;
        }
      }
      

      await api.post(`/api/admin/ban-hang/${hoaDonId}/complete`, {
        phuongThucThanhToans: [
          currentOrder.phuongThucThanhToan.maPhuongThucThanhToan,
        ],
      });

      // Fetch the PDF for printing
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
        responseType: "blob",
        headers: { Accept: "application/pdf, application/json" },
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

      setTabs((prev) => prev.filter((tab) => tab.key !== hoaDonId));
      setIsModalVisiblePaymentQR(false);
      message.success("Xác nhận đơn hàng thành công");

    } catch (error) {
      message.error("Lỗi khi xác nhận đơn hàng");
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
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      message.error("Lỗi khi in hóa đơn");
    }
  };


  //thanh toán bằng mã qr
    const [qrUrl, setQrUrl] = useState("");
    const generateQR = () => {
        const account = "102876619993";  // Số tài khoản nhận
        const bank = "VietinBank";        // Ngân hàng (Vietinbank)
        console.log("hóa đơn tổng tiền",totals)
        const amount = totals[activeKey]?.finalTotal;            // Số tiền (VND)
        const description = `SEVQR thanh toan don hang ${activeKey}`; // Nội dung có mã hóa đơn
        const template = "compact";       // Giao diện hiển thị QR (có thể chỉnh)
        // Tạo URL QR Code theo chuẩn SePay
        const qrLink = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amount}&des=${encodeURIComponent(description)}&template=${template}&download=false`;
console.log(qrLink);
        setQrUrl(qrLink);
    };


  // Update order content rendering to show products table
  const renderOrderContent = (order) => (
    <Row gutter={16}>
      {/* Left side - Products section */}
      <Col
        span={17}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" ,height:"auto"}}>
          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button>
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

          {/* Update Products table */}
          <Table
            dataSource={orderProducts[order.id] || []}
            columns={columns}
            pagination={{
              current: pagination.current,
              pageSize: 3, // Changed to 3 items per page
              showSizeChanger: false, // Remove size changer
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
            scroll={undefined} // Remove scrolling
          />
        </Space>
      </Col>

      {/* Right side - Order information */}
      <Col span={7}>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {/* Customer section */}
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

              {/* Customer info display */}
              <Row style={{ marginTop: 8 }}>
                <Col
                  span={24}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Avatar size={40} style={{ marginRight: 8 }} />
                  <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
                </Col>
              </Row>

              {/* Delivery method */}
              <div
                style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
              ></div>
              <Row>
                <Col span={24}>
                  <Radio.Group
                    value={order.hinhThucNhan || "taiQuay"}
                    onChange={(e) =>
                      handleDeliveryMethodChange(order.id, e.target.value)
                    }
                  >
                    <Radio value="taiQuay">Tại quầy</Radio>
                    <Radio value="giaoHang">Giao hàng</Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </div>

            {/* Add voucher section */}
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

            {/* Payment section */}
            <Text strong>Thông tin thanh toán</Text>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {/* Payment method selection - unchanged */}
              <Row>
                <Col span={24}>
                  <Radio.Group
                    value={
                      order.phuongThucThanhToan?.maPhuongThucThanhToan || ""
                    }
                    onChange={(e) =>
                      handlePaymentMethodChange(order.id, e.target.value)
                    }
                  >
                    {paymentMethods.map((method) => (
                      <Radio
                        key={method.id}
                        value={method.maPhuongThucThanhToan}
                      >
                        {method.tenPhuongThucThanhToan}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Col>
              </Row>

              {/* Order summary - unchanged */}
              <Row style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text>Tổng tiền:</Text>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text strong>
                    {formatCurrency(totals[order.id]?.totalBeforeVoucher || 0)}
                  </Text>
                </Col>
              </Row>

              <Row style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text>Phí vận chuyển:</Text>
                </Col>
                <Col span={12}>
                  <InputNumber
                    style={{ width: "100%" }}
                    value={order.phiVanChuyen || 0}
                    onChange={(value) =>
                      handleShippingFeeChange(order.id, value)
                    }
                    formatter={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text>Giảm giá:</Text>
                </Col>
                <Col span={12}>
                  <InputNumber
                    style={{ width: "100%" }}
                    value={totals[order.id]?.discountAmount || 0}
                    disabled
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>Tổng thanh toán:</Text>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text strong style={{ color: "red" }}>
                    {formatCurrency(totals[order.id]?.finalTotal || 0)}
                  </Text>
                </Col>
              </Row>

              {/* Other existing rows... */}

              {/* Only show customer payment input for cash payments */}
              {order.phuongThucThanhToan?.maPhuongThucThanhToan ===
                PAYMENT_METHOD.CASH && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Row justify="space-between" align="middle">
                    <Col span={10}>
                      <Text>Tiền khách đưa:</Text>
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

                  {/* Show change/remaining only for cash payments */}
                  {calculateChange(order.id).change > 0 && (
                    <Row justify="space-between" style={{ marginTop: 8 }}>
                      <Col>
                        <Text strong style={{ color: "#52c41a" }}>
                          Tiền thừa:
                        </Text>
                      </Col>
                      <Col>
                        <Text strong style={{ color: "#52c41a" }}>
                          {formatCurrency(calculateChange(order.id).change)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                  {calculateChange(order.id).remaining > 0 && (
                    <Row justify="space-between" style={{ marginTop: 8 }}>
                      <Col>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          Còn thiếu:
                        </Text>
                      </Col>
                      <Col>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          {formatCurrency(calculateChange(order.id).remaining)}
                        </Text>
                      </Col>
                    </Row>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
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
    // Implement new customer creation logic
  };

  const handleDeliveryMethodChange = async (hoaDonId, method) => {
    // Implement delivery method change logic
  };

  const handlePaymentMethodChange = (hoaDonId, selectedId) => {
    const selectedMethod = paymentMethods.find(
      (method) => method.maPhuongThucThanhToan === selectedId
    );

    if (selectedMethod) {
      const newPaymentMethod = {
        id: selectedMethod.id,
        maPhuongThucThanhToan: selectedMethod.maPhuongThucThanhToan,
        tenPhuongThucThanhToan: selectedMethod.tenPhuongThucThanhToan,
        moTa: selectedMethod.moTa,
      };

      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId
            ? {
                ...tab,
                order: {
                  ...tab.order,
                  phuongThucThanhToan: selectedMethod,
                },
              }
            : tab
        )
      );
    } else {
      message.error("Phương thức thanh toán không hợp lệ!");
    }
  };

  const handleShippingFeeChange = async (hoaDonId, fee) => {
    // Implement shipping fee change logic
  };

  // Add function to load customers
  const loadCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/khach_hang");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  // Add function to handle customer selection
  const handleCustomerSelected = async (hoaDonId, customerId) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
        { customerId }
      );

      setTabs((prev) =>
        prev.map((tab) =>
          tab.key === hoaDonId ? { ...tab, order: response.data } : tab
        )
      );
      setOpenCustomerDialog(false);
    } catch (error) {
      message.error("Lỗi khi chọn khách hàng");
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
        `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher`
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
        `/api/admin/hoa-don/${activeKey}/payment-history`
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
      const response = await api.get("/api/admin/hoa-don/san-pham/all");
      const productsData = response.data;

      // Lấy hình ảnh từ API
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.id}/hinhanh`
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

  const fetchInvoiceProducts = async (hoaDonId) => {
    try {
      console.log(`📢 Fetching products for invoice: ${hoaDonId}`);

      // Lấy danh sách sản phẩm trong hóa đơn
      const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/san-pham`);
      console.log("API sản phẩm trả về:", response.data);

      const products = response.data;

      // Lấy hình ảnh cho từng sản phẩm (nếu chưa có)
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          if (product.hinhAnh && product.hinhAnh.length > 0) {
            console.log(
              `🎯 Sản phẩm ${product.id} đã có ảnh, không gọi lại API`
            );
            return product; // Giữ nguyên nếu đã có ảnh
          }

          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.id}/hinhanh`
            );

            console.log(
              `📸 Hình ảnh API cho sản phẩm ${product.id}:`,
              imgResponse.data
            );

            return {
              ...product,
              hinhAnh:
                imgResponse.data && imgResponse.data.length > 0
                  ? imgResponse.data.map((img) => img.anhUrl) // Lấy danh sách ảnh
                  : [], // Không có ảnh
            };
          } catch (error) {
            console.error(`Lỗi khi lấy ảnh sản phẩm ${product.id}:`, error);
            return { ...product, hinhAnh: [] };
          }
        })
      );

      console.log(
        "🔍 Dữ liệu sản phẩm sau khi gán hình ảnh:",
        productsWithImages
      );

      // Lấy thông tin hóa đơn để tính tổng tiền
      const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
      if (order) {
        const subtotal = calculateTotalBeforeDiscount(productsWithImages);
        const shippingFee = order.phiVanChuyen || 0;
        const totalBeforeVoucher = subtotal + shippingFee;
        
        // Tính lại giá trị giảm giá dựa trên voucher hiện tại
        let discountAmount = 0;
        if (order.phieuGiamGia) {
          discountAmount = calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher);
        }

        const finalTotal = totalBeforeVoucher - discountAmount;

        const newTotals = {
          subtotal,
          shippingFee,
          totalBeforeVoucher,
          discountAmount,
          finalTotal
        };

        // Cập nhật totals
        setTotals(prev => ({
          ...prev,
          [hoaDonId]: newTotals
        }));

        // Cập nhật tabs với giá trị giảm giá mới
        setTabs(prev => 
          prev.map(tab => 
            tab.key === hoaDonId 
              ? {
                  ...tab,
                  order: {
                    ...tab.order,
                    tongTien: totalBeforeVoucher,
                    giamGia: discountAmount,
                    tongThanhToan: finalTotal
                  }
                }
              : tab
          )
        );
      }

      // Cập nhật danh sách sản phẩm vào `orderProducts`
      setOrderProducts((prev) => ({
        ...prev,
        [hoaDonId]: productsWithImages,
      }));

      return productsWithImages;
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
        content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
        okText: "Hủy đơn",
        cancelText: "Đóng",
        okButtonProps: {
          danger: true,
        },
        onOk: async () => {
          try {
            // Call API to update order status to cancelled (5)
            await api.patch(`/api/admin/hoa-don/${targetKey}/status`, null, {
              params: { trangThai: 5 }, // 5 represents cancelled status
            });

            // Remove the tab from UI
            setTabs((prev) => prev.filter((tab) => tab.key !== targetKey));

            // Remove the products associated with this order
            setOrderProducts((prev) => {
              const newProducts = { ...prev };
              delete newProducts[targetKey];
              return newProducts;
            });

            // If the active tab is being removed, set active to the first remaining tab
            if (activeKey === targetKey) {
              const newActiveKey = tabs.find(
                (tab) => tab.key !== targetKey
              )?.key;
              setActiveKey(newActiveKey);
            }

            message.success("Đã hủy đơn hàng thành công");
          } catch (error) {
            console.error("Error cancelling order:", error);
            message.error(
              error.response?.data?.message || "Lỗi khi hủy đơn hàng"
            );
          }
        },
      });
    }
  };

  // Add helper function to calculate discount
  const calculateDiscountAmount = (voucher, total) => {
    if (!voucher || total < voucher.giaTriToiThieu) {
      return 0;
    }
  
    let discountAmount = 0;
    if (voucher.loaiPhieuGiamGia === 1) {
      // Tính số tiền giảm theo phần trăm
      discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);
      
      // Kiểm tra giới hạn giảm tối đa
      if (voucher.soTienGiamToiDa) {
        discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
      }
    } else {
      // Giảm giá theo số tiền cố định
      discountAmount = Math.min(voucher.giaTriGiam, total);
    }
  
    return discountAmount;
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
  const calculateOrderTotals = (hoaDonId) => {
    const products = orderProducts[hoaDonId] || [];
    const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
  
    if (!order) return null;
  
    const subtotal = products.reduce((sum, product) => sum + (product.gia || 0) * (product.soLuong || 0), 0);
    const shippingFee = order.phiVanChuyen || 0;
    const totalBeforeVoucher = subtotal + shippingFee;
  
    let discountAmount = order.phieuGiamGia
      ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
      : 0;
  
    const finalTotal = Math.max(totalBeforeVoucher - discountAmount, 0);
  
    return { subtotal, shippingFee, totalBeforeVoucher, discountAmount, finalTotal };
  };
  

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
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`
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

      // 🔄 Gọi API để áp dụng phiếu giảm giá mới
      await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
        voucherId: bestVoucher.id,
      });

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

      // 🔄 Làm mới danh sách sản phẩm để đồng bộ dữ liệu
      await fetchInvoiceProducts(hoaDonId);
    } catch (error) {
      console.error("Lỗi khi tự động áp dụng voucher:", error);
      message.error("Không thể áp dụng mã giảm giá tự động.");
    }
  };

  const renderPaymentSection = (order) => {
    const orderTotals = totals[order.id] || calculateOrderTotals(order.id);
    if (!orderTotals) return null;

    const { change, remaining } = calculateChange(order.id);

    return (
      <div style={{ maxWidth: 400, marginLeft: "auto" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* New payment input section */}
          <Divider style={{ margin: "12px 0" }} />
          <Row justify="space-between" align="middle">
            <Col span={10}>
              <Text>Tiền khách đưa:</Text>
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

          {/* Display change or remaining amount */}
          {change > 0 && (
            <Row justify="space-between">
              <Col>
                <Text strong style={{ color: "#52c41a" }}>
                  Tiền thừa:
                </Text>
              </Col>
              <Col>
                <Text strong style={{ color: "#52c41a" }}>
                  {formatCurrency(change)}
                </Text>
              </Col>
            </Row>
          )}
          {remaining > 0 && (
            <Row justify="space-between">
              <Col>
                <Text strong style={{ color: "#ff4d4f" }}>
                  Còn thiếu:
                </Text>
              </Col>
              <Col>
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatCurrency(remaining)}
                </Text>
              </Col>
            </Row>
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
        }, 300); // Đợi API trả dữ liệu rồi cập nhật
      });
    }
  }, [activeKey]);
  

  // Add new function to find best voucher
  const findBestVoucher = async (hoaDonId, totalAmount) => {
    try {
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${totalAmount}`
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
        const response = await api.get("/api/phuong-thuc-thanh-toan");
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
    </AntdModal>
  );

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
          height: "100%", // Đảm bảo Sider chiếm toàn bộ chiều cao
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
                zIndex: 1, // Đảm bảo nút ở trên cùng
              }}
            >
              <IoIosAddCircle />
              Tạo đơn hàng mới
            </Button>
          </Col>
        </Row>

        {/* Khi không có hóa đơn nào, hiển thị thông báo */}
        {tabs.length === 0 ? (
          <Row justify="center" align="middle" style={{ height: "100%" }}>
            <Col>
              <Title level={3}>
                Không có hóa đơn ở trạng thái chờ xác nhận
              </Title>
            </Col>
          </Row>
        ) : (
          <Tabs
            type="editable-card"
            onChange={setActiveKey}
            activeKey={activeKey}
            onEdit={handleEditTab}
            items={items}
          />
        )}
      </Sider>
      <Content
        style={{
          padding: 24,
          height: "100%", // Đảm bảo Content chiếm toàn bộ chiều cao
          overflow: "hidden", // Để nội dung không bị cuộn
        }}
      />

      {/* Modal thêm sản phẩm */}
      <Modal
        title="Danh sách sản phẩm chi tiết"
        open={isModalVisibleListSPCT}
        onCancel={handleCancelListSanPhamChiTiet}
        footer={[
          <Button
            key="add"
            type="primary"
            onClick={handleCancelListSanPhamChiTiet}
          >
            Đóng
          </Button>,
        ]}
        width={1200}
        ref={modalRef}
      >
        <div
          style={{
            boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
            height: "240px",
            marginBottom: "20px",
          }}
        >
          {/* Ô tìm kiếm */}
          <Row gutter={16} style={{ marginBottom: "26px" }}>
            <Col span={10}>
              <Input
                placeholder="Tìm kiếm mã sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
          </Row>
        </div>
        <div
          style={{
            boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
            height: "auto",
          }}
        >
          <Table
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
          />
        </div>
      </Modal>

      {/* Customer Selection Dialog */}
      <Modal
        title="Chọn khách hàng"
        visible={openCustomerDialog}
        onCancel={() => setOpenCustomerDialog(false)}
        footer={null}
      >
        <List
          dataSource={customers}
          renderItem={(customer) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleCustomerSelected(activeKey, customer.id)}
                >
                  Chọn
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={customer.avatar} />}
                title={customer.tenKhachHang}
                description={
                  <>
                    {customer.soDienThoai}
                    <br />
                    {customer.email}
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Voucher Selection Dialog */}
      <Modal
        title="Chọn voucher"
        open={openVoucherDialog}
        onCancel={() => setOpenVoucherDialog(false)}
        footer={null}
        ref={modalRef}
      >
        <List
          dataSource={vouchers}
          renderItem={(voucher) => (
            <List.Item
              style={{
                border:
                  selectedVoucher?.id === voucher.id
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "8px",
                backgroundColor:
                  selectedVoucher?.id === voucher.id ? "#f0f5ff" : "white",
              }}
              actions={[
                <Radio
                  checked={selectedVoucher?.id === voucher.id}
                  onChange={() => setSelectedVoucher(voucher)}
                />,
              ]}
            >
              <List.Item.Meta
                title={voucher.maPhieuGiamGia}
                description={
                  <div>
                    <div>
                      {voucher.loaiPhieuGiamGia === 1
                        ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
                            voucher.soTienGiamToiDa
                          )})`
                        : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
                    </div>
                    <div>
                      Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          block
          disabled={!selectedVoucher}
          onClick={() => handleVoucherSelected(activeKey, selectedVoucher.id)}
        >
          Áp dụng
        </Button>
      </Modal>

      {/* Add ProductTable component */}
      <ProductTable
        products={products}
        onAddProduct={handleAddProductToOrder}
        open={openProductTable}
        onClose={() => setOpenProductTable(false)}
      />

      {/* Add PreviewModal component */}
      <PreviewModal />
      <Modal
                title="Quét QR để thanh toán"
                open={isModalPaymentQR}
                onCancel={() => setIsModalVisiblePaymentQR(false)}
                footer={null} // Ẩn nút OK/Cancel mặc định
            >
                {qrUrl && (
                    <div style={{ textAlign: "center" }}>
                        <img src={qrUrl} alt="QR Code" style={{ width: "100%" }} />
                    </div>
                )}
                 {/* {activeKey && <PaymentChecker hoaDonId={activeKey} amount={totals[activeKey]?.finalTotal} onClose={() => setIsModalVisiblePaymentQR(false)} />} */}
            </Modal>
    </Layout>
    
  );
};

export default BanHang;
