// // // // import React, { useEffect, useState, useRef } from "react";
// // // // import "./BanHangCss.css";
// // // // import {
// // // //   Layout,
// // // //   Button,
// // // //   Row,
// // // //   Col,
// // // //   Tabs,
// // // //   Typography,
// // // //   Input,
// // // //   Table,
// // // //   Space,
// // // //   Avatar,
// // // //   Radio,
// // // //   InputNumber,
// // // //   Modal,
// // // //   Select,
// // // //   List,
// // // //   Tag,
// // // //   Carousel,
// // // //   Divider, // Add this import
// // // //   Modal as AntdModal, // Add this import
// // // //   Alert, // Add this import
// // // //   Card, // Add this import
// // // //   Collapse, // Add this import
// // // // } from "antd";
// // // // import {
// // // //   PlusOutlined,
// // // //   CloseOutlined,
// // // //   SelectOutlined,
// // // //   SearchOutlined,
// // // //   TagOutlined, // Add this import
// // // //   InfoCircleOutlined, // Add this import
// // // //   DeleteOutlined,
// // // //   PrinterOutlined, // Add this import
// // // // } from "@ant-design/icons";
// // // // import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
// // // // import { BiQrScan } from "react-icons/bi";
// // // // import { AiOutlineSelect } from "react-icons/ai";
// // // // import { Option } from "antd/es/mentions";
// // // // import axios from "axios";
// // // // import { message } from "antd";
// // // // import api from "../../utils/api";
// // // // import { formatCurrency } from "../../utils/format";
// // // // import ProductTable from "../HoaDon/ProductTable";
// // // // import { Client } from "@stomp/stompjs";
// // // // import SockJS from "sockjs-client";
// // // // import { MenuItem, FormControl, InputLabel } from "@mui/material";
// // // // const { Content, Sider } = Layout;
// // // // const { TabPane } = Tabs;
// // // // const { Title, Text } = Typography;

// // // // // Add near the top of the file with other constants
// // // // const PAYMENT_METHOD = {
// // // //   CASH: "COD",
// // // //   // Add other payment methods as needed
// // // // };

// // // // // Di chuyển các hàm helper ra ngoài component
// // // // const calculateDiscountAmount = (voucher, total) => {
// // // //   // Kiểm tra điều kiện áp dụng voucher
// // // //   if (!voucher || !total || total < voucher.giaTriToiThieu) {
// // // //     console.log('Không đủ điều kiện áp dụng voucher:', {
// // // //       total,
// // // //       minRequired: voucher?.giaTriToiThieu
// // // //     });
// // // //     return 0;
// // // //   }

// // // //   let discountAmount = 0;

// // // //   // Kiểm tra loại voucher
// // // //   if (voucher.loaiPhieuGiamGia === 1) {
// // // //     // Loại 1: Giảm theo phần trăm
// // // //     // Tính số tiền giảm = tổng tiền * phần trăm giảm / 100
// // // //     discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);
    
// // // //     console.log('Tính giảm giá theo %:', {
// // // //       total,
// // // //       percent: voucher.giaTriGiam,
// // // //       calculatedDiscount: discountAmount,
// // // //       maxDiscount: voucher.soTienGiamToiDa
// // // //     });

// // // //     // Nếu có giới hạn giảm tối đa và số tiền giảm vượt quá giới hạn
// // // //     if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
// // // //       discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
// // // //       console.log('Áp dụng giới hạn tối đa:', discountAmount);
// // // //     }
// // // //   } else {
// // // //     // Loại khác: Giảm theo số tiền cố định
// // // //     discountAmount = Math.min(voucher.giaTriGiam, total);
// // // //     console.log('Tính giảm giá cố định:', {
// // // //       fixedAmount: voucher.giaTriGiam,
// // // //       total,
// // // //       finalDiscount: discountAmount
// // // //     });
// // // //   }

// // // //   // Đảm bảo số tiền giảm không âm và không vượt quá tổng tiền
// // // //   discountAmount = Math.max(0, Math.min(discountAmount, total));
  
// // // //   console.log('Kết quả cuối cùng:', {
// // // //     voucherId: voucher.id,
// // // //     voucherCode: voucher.maPhieuGiamGia,
// // // //     total,
// // // //     finalDiscount: discountAmount
// // // //   });
  
// // // //   return discountAmount;
// // // // };

// // // // const BanHang = () => {
// // // //   const socket = useRef(null);
// // // //   const [isModalVisibleListSPCT, setIsModalVisibleListSPCT] = useState(false); // Trạng thái hiển thị Modal
// // // //   const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
// // // //   const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
// // // //   const [activeTab, setActiveTab] = useState(null);
// // // //   const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
// // // //   const [searchText, setSearchText] = useState("");
// // // //   const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
// // // //   const [activeKey, setActiveKey] = useState(null); // Giữ tab đang mở
// // // //   const [orderProducts, setOrderProducts] = useState({}); // Products in each order tab
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
// // // //   const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
// // // //   const [selectedVoucher, setSelectedVoucher] = useState(null);
// // // //   const [vouchers, setVouchers] = useState([]);
// // // //   const [customers, setCustomers] = useState([]);
// // // //   const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
// // // //   const [loadingPayments, setLoadingPayments] = useState(false);
// // // //   const [paymentHistory, setPaymentHistory] = useState([]);
// // // //   const [openProductTable, setOpenProductTable] = useState(false);
// // // //   const [selectedProducts, setSelectedProducts] = useState([]);
// // // //   const [modalRef] = useState(React.createRef());
// // // //   const [totalAmount, setTotalAmount] = useState(0); // Add new state for total amount
// // // //   const [totals, setTotals] = useState({});
// // // //   const [paymentMethods, setPaymentMethods] = useState([]);
// // // //   const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
// // // //   const [previewOpen, setPreviewOpen] = useState(false);
// // // //   const [pdfUrl, setPdfUrl] = useState(null);
// // // //   const [customerPayment, setCustomerPayment] = useState({});
// // // //   const [suggestedVoucher, setSuggestedVoucher] = useState(null);
// // // //   const [additionalAmount, setAdditionalAmount] = useState(0);
// // // //   const [suggestedProducts, setSuggestedProducts] = useState([]);
// // // //   // Thêm state mới để kiểm soát việc hiển thị gợi ý
// // // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // // //   // Thêm state mới
// // // //   const [voucherSuggestion, setVoucherSuggestion] = useState({
// // // //     show: false,
// // // //     voucher: null,
// // // //     amountNeeded: 0,
// // // //     products: []
// // // //   });
// // // //   // Cập nhật state để lưu nhiều gợi ý voucher
// // // //   const [voucherSuggestions, setVoucherSuggestions] = useState({
// // // //     show: false,
// // // //     betterVouchers: []
// // // //   });

// // // //   // Add this function to calculate change/remaining amount
// // // //   const calculateChange = (hoaDonId) => {
// // // //     const orderTotals = totals[hoaDonId];
// // // //     if (!orderTotals) return { change: 0, remaining: 0 };

// // // //     const amountPaid = customerPayment[hoaDonId] || 0;
// // // //     const finalTotal = orderTotals.finalTotal || 0;

// // // //     if (amountPaid >= finalTotal) {
// // // //       return {
// // // //         change: amountPaid - finalTotal,
// // // //         remaining: 0,
// // // //       };
// // // //     } else {
// // // //       return {
// // // //         change: 0,
// // // //         remaining: finalTotal - amountPaid,
// // // //       };
// // // //     }
// // // //   };

// // // //   // Cấu hình cột cho bảng
// // // //   const columns = [
// // // //     {
// // // //       title: "STT",
// // // //       key: "index",
// // // //       width: 60,
// // // //       align: "center",
// // // //       //render: (_, __, index) => index + 1,
// // // //       render: (_, __, index) => {
// // // //         // Tính toán lại index khi chuyển trang
// // // //         return pagination.pageSize * (pagination.current - 1) + index + 1;
// // // //       },
// // // //     },
// // // //     {
// // // //       title: "Hình ảnh",
// // // //       dataIndex: "hinhAnh",
// // // //       key: "hinhAnh",
// // // //       align: "center",
// // // //       width: 180,
// // // //       render: (hinhAnh) => {
// // // //         return (
// // // //           <div style={{ width: 150, height: 120, overflow: "hidden" }}>
// // // //             {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
// // // //               <Carousel autoplay dots={false} effect="fade">
// // // //                 {hinhAnh.map((url, index) => (
// // // //                   <img
// // // //                     key={index}
// // // //                     src={url}
// // // //                     alt={`Sản phẩm ${index}`}
// // // //                     style={{
// // // //                       width: "100%",
// // // //                       height: "100%",
// // // //                       objectFit: "cover",
// // // //                       borderRadius: 5,
// // // //                       display: "block",
// // // //                     }}
// // // //                   />
// // // //                 ))}
// // // //               </Carousel>
// // // //             ) : (
// // // //               <img
// // // //                 src="https://via.placeholder.com/50"
// // // //                 alt="Không có ảnh"
// // // //                 style={{
// // // //                   width: "100%",
// // // //                   height: "100%",
// // // //                   objectFit: "cover",
// // // //                   borderRadius: 5,
// // // //                   display: "block",
// // // //                 }}
// // // //               />
// // // //             )}
// // // //           </div>
// // // //         );
// // // //       },
// // // //     },
// // // //     {
// // // //       title: "Thông tin",
// // // //       key: "thongTin",
// // // //       align: "center",
// // // //       width: 180,
// // // //       render: (_, record) => (
// // // //         <Space direction="vertical" size={0}>
// // // //           <Typography.Text strong>{record.tenSanPham}</Typography.Text>
// // // //           <Typography.Text type="secondary">
// // // //             Mã: {record.maSanPham}
// // // //           </Typography.Text>
// // // //           <Typography.Text type="secondary">
// // // //             Chất liệu: {record.chatLieu}
// // // //           </Typography.Text>
// // // //         </Space>
// // // //       ),
// // // //     },
// // // //     {
// // // //       title: "Màu sắc",
// // // //       key: "mauSac",
// // // //       align: "center",
// // // //       width: 180,
// // // //       render: (_, record) => (
// // // //         <Space size="middle">
// // // //           <Typography.Text>{record.mauSac}</Typography.Text>
// // // //           <div
// // // //             style={{
// // // //               display: "inline-block",
// // // //               width: 50, // Chiều rộng
// // // //               height: 20, // Chiều cao
// // // //               borderRadius: 6, // Bo góc mềm mại
// // // //               backgroundColor: record.maMauSac || "#FFFFFF",
// // // //               border: "1px solid rgba(0, 0, 0, 0.2)", // Viền tinh tế
// // // //               boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Hiệu ứng bóng đổ nhẹ
// // // //             }}
// // // //           ></div>
// // // //         </Space>
// // // //       ),
// // // //     },

// // // //     {
// // // //       title: "Kích thước",
// // // //       key: "kichThuoc",
// // // //       align: "center",
// // // //       width: 100,
// // // //       render: (_, record) => (
// // // //         <Typography.Text>{record.kichThuoc}</Typography.Text>
// // // //       ),
// // // //     },

// // // //     {
// // // //       title: "Đơn giá",
// // // //       key: "gia",
// // // //       width: 140,
// // // //       align: "center",
// // // //       render: (_, record) => formatCurrency(record.gia),
// // // //     },
// // // //     {
// // // //       title: "Số lượng",
// // // //       key: "soLuong",
// // // //       width: 120,
// // // //       align: "center",
// // // //       render: (_, record) => (
// // // //         <InputNumber
// // // //           min={1}
// // // //           max={record.soLuongTonKho}
// // // //           value={record.soLuong}
// // // //           onChange={(value) =>
// // // //             handleUpdateQuantity(activeKey, record.id, value)
// // // //           }
// // // //           style={{ width: 80 }}
// // // //         />
// // // //       ),
// // // //     },
// // // //     {
// // // //       title: "Thành tiền",
// // // //       key: "thanhTien",
// // // //       width: 140,
// // // //       align: "center",
// // // //       render: (_, record) => formatCurrency(record.gia * record.soLuong),
// // // //     },
// // // //     {
// // // //       title: "",
// // // //       key: "action",
// // // //       width: 80,
// // // //       align: "center",
// // // //       render: (_, record) => (
// // // //         <Button
// // // //           type="link"
// // // //           danger
// // // //           icon={<DeleteOutlined />}
// // // //           onClick={() => handleRemoveProduct(activeKey, record.id)}
// // // //         />
// // // //       ),
// // // //     },
// // // //   ];

// // // //   const handleTableChange = (pagination) => {
// // // //     setPagination(pagination);
// // // //     if (activeKey) {
// // // //       fetchInvoiceProducts(activeKey);
// // // //     }
// // // //   };
// // // //   // Hàm đóng modal
// // // //   const handleCancelListSanPhamChiTiet = () => {
// // // //     setIsModalVisibleListSPCT(false);
// // // //   };
// // // //   // 1. Load pending orders
// // // //   const fetchPendingOrders = async (isInitializing = false) => {
// // // //     try {
// // // //       const response = await api.get("/api/admin/ban-hang/hoadoncho");
// // // //       const orders = response.data;

// // // //       if (orders.length > 0) {
// // // //         // Ghi log thông tin hóa đơn để debug
// // // //         // console.log('Danh sách hóa đơn từ server:'), orders.map(order => ({
// // // //         //   id: order.id,
// // // //         //   maHoaDon: order.maHoaDon,
// // // //         //   tongTien: order.tongTien,
// // // //         //   giamGia: order.giamGia,
// // // //         //   tongThanhToan: order.tongThanhToan,
// // // //         //   phieuGiamGia: order.phieuGiamGia
// // // //         // }));
        
// // // //         const newTabs = orders.map((order, index) => ({
// // // //           key: order.id,
// // // //           title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
// // // //           order: order,
// // // //         }));

// // // //         setTabs(newTabs);
        
// // // //         // Chỉ đặt activeKey nếu chưa có hoặc đang khởi tạo
// // // //         if (!activeKey || isInitializing) {
// // // //           setActiveKey(orders[0].id);
// // // //         }

// // // //         // Tải sản phẩm và tính toán tổng tiền cho mỗi hóa đơn
// // // //         // Không gọi refreshInvoiceData để tránh lỗi API
// // // //         const productsMap = {};
// // // //         const totalsMap = {};
        
// // // //         for (const order of orders) {
// // // //           try {
// // // //             // Tải sản phẩm
// // // //             const products = await fetchInvoiceProducts(order.id, true);
// // // //             productsMap[order.id] = products;
            
// // // //             // Tính toán tổng tiền
// // // //             const subtotal = calculateTotalBeforeDiscount(products);
// // // //             const shippingFee = order.phiVanChuyen || 0;
// // // //             const totalBeforeVoucher = subtotal + shippingFee;
// // // //             const discountAmount = order.giamGia || 0;
// // // //             const finalTotal = totalBeforeVoucher - discountAmount;
            
// // // //             totalsMap[order.id] = {
// // // //               subtotal,
// // // //               shippingFee,
// // // //               totalBeforeVoucher,
// // // //               discountAmount,
// // // //               finalTotal,
// // // //             };
// // // //           } catch (error) {
// // // //             console.error(`Lỗi khi tải dữ liệu cho hóa đơn ${order.id}:`, error);
// // // //           }
// // // //         }
        
// // // //         // Cập nhật state
// // // //         setOrderProducts(productsMap);
// // // //         setTotals(totalsMap);
        
// // // //         // Cập nhật UI cho tab hiện tại
// // // //         if (activeKey && totalsMap[activeKey]) {
// // // //           setTotalBeforeDiscount(totalsMap[activeKey].subtotal);
// // // //           setTotalAmount(totalsMap[activeKey].finalTotal);
// // // //         }

// // // //         // Lưu vào localStorage
// // // //         localStorage.setItem("pendingOrders", JSON.stringify(newTabs));
// // // //         localStorage.setItem("orderProducts", JSON.stringify(productsMap));
// // // //         localStorage.setItem("orderTotals", JSON.stringify(totalsMap));
// // // //       } else {
// // // //         // Nếu không có đơn hàng, xóa dữ liệu cũ
// // // //         setTabs([]);
// // // //         setOrderProducts({});
// // // //         setTotals({});
// // // //         setActiveKey(null);
// // // //         setTotalBeforeDiscount(0);
// // // //         setTotalAmount(0);
        
// // // //         // Xóa localStorage
// // // //         localStorage.removeItem("pendingOrders");
// // // //         localStorage.removeItem("orderProducts");
// // // //         localStorage.removeItem("orderTotals");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi tải danh sách hóa đơn:", error);
// // // //       message.error("Lỗi khi tải danh sách hóa đơn");
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     const initializeData = async () => {
// // // //       try {
// // // //         // Đặt cờ để tránh các cập nhật không cần thiết
// // // //         const isInitializing = true;
        
// // // //         // Tải phương thức thanh toán
// // // //         const paymentResponse = await api.get("/api/phuong-thuc-thanh-toan");
// // // //         setPaymentMethods(paymentResponse.data);
        
// // // //         // Khôi phục dữ liệu từ localStorage trước
// // // //         const savedOrders = localStorage.getItem("pendingOrders");
// // // //         const savedProducts = localStorage.getItem("orderProducts");
// // // //         const savedTotals = localStorage.getItem("orderTotals");

// // // //         if (savedOrders) {
// // // //           setTabs(JSON.parse(savedOrders));
// // // //         }
// // // //         if (savedProducts) {
// // // //           setOrderProducts(JSON.parse(savedProducts));
// // // //         }
// // // //         if (savedTotals) {
// // // //           const parsedTotals = JSON.parse(savedTotals);
// // // //           setTotals(parsedTotals);
          
// // // //           // Nếu có activeKey, cập nhật tổng tiền ngay lập tức
// // // //           const firstOrderId = JSON.parse(savedOrders)?.[0]?.key;
// // // //           if (firstOrderId && parsedTotals[firstOrderId]) {
// // // //             setTotalBeforeDiscount(parsedTotals[firstOrderId].subtotal);
// // // //             setTotalAmount(parsedTotals[firstOrderId].finalTotal);
// // // //           }
// // // //         }
        
// // // //         // Sau đó mới gọi API để cập nhật dữ liệu mới nhất
// // // //         await fetchPendingOrders(true); // Truyền tham số true để đánh dấu đây là lần khởi tạo
// // // //       } catch (error) {
// // // //         console.error("Lỗi khởi tạo dữ liệu:", error);
// // // //       }
// // // //     };
    
// // // //     initializeData();
    
// // // //     // Chỉ chạy một lần khi component mount
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     if (activeKey) {
// // // //       console.log('Tab changed to:', activeKey);
      
// // // //       // Lấy thông tin hóa đơn hiện tại từ tabs
// // // //       const currentOrder = tabs.find(tab => tab.key === activeKey)?.order;
// // // //       if (currentOrder) {
// // // //         // Tải lại sản phẩm và tính toán tổng tiền
// // // //         fetchInvoiceProducts(activeKey, false).then(products => {
// // // //           // Tính toán lại tổng tiền
// // // //           const subtotal = calculateTotalBeforeDiscount(products);
// // // //           const shippingFee = currentOrder.phiVanChuyen || 0;
// // // //           const totalBeforeVoucher = subtotal + shippingFee;
          
// // // //           // Tính toán giảm giá dựa trên voucher
// // // //           let discountAmount = 0;
// // // //           if (currentOrder.phieuGiamGia) {
// // // //             discountAmount = calculateDiscountAmount(
// // // //               currentOrder.phieuGiamGia,
// // // //               totalBeforeVoucher
// // // //             );
// // // //           }
          
// // // //           const finalTotal = totalBeforeVoucher - discountAmount;
          
// // // //           // Cập nhật totals
// // // //           const newTotals = {
// // // //             subtotal,
// // // //             shippingFee,
// // // //             totalBeforeVoucher,
// // // //             discountAmount,
// // // //             finalTotal,
// // // //           };
          
// // // //           setTotals(prev => ({
// // // //             ...prev,
// // // //             [activeKey]: newTotals
// // // //           }));
          
// // // //           // Cập nhật UI
// // // //           setTotalBeforeDiscount(subtotal);
// // // //           setTotalAmount(finalTotal);
// // // //         });
// // // //       }
      
// // // //       // Đặt lại pagination
// // // //       setPagination({ current: 1, pageSize: 3 });
// // // //     }
// // // //   }, [activeKey]);

// // // //   // Add WebSocket connection setup
// // // //   useEffect(() => {
// // // //     // Initialize WebSocket connection
// // // //     const socket = new SockJS("http://localhost:8080/ws");
// // // //     const stompClient = new Client({
// // // //       webSocketFactory: () => socket,
// // // //       onConnect: () => {
// // // //         console.log("✅ WebSocket connected");

// // // //         // Subscribe to pending orders updates
// // // //         stompClient.subscribe("/topic/hoa-don-cho", (message) => {
// // // //           console.log("🔄 Pending orders updated");
// // // //           fetchPendingOrders();
// // // //         });

// // // //         // Subscribe to individual order updates
// // // //         tabs.forEach((tab) => {
// // // //           stompClient.subscribe(`/topic/hoa-don/${tab.key}`, (message) => {
// // // //             console.log(`🔄 Order ${tab.key} updated`);
// // // //             fetchInvoiceProducts(tab.key).then((products) => {
// // // //               setOrderProducts((prev) => ({
// // // //                 ...prev,
// // // //                 [tab.key]: products,
// // // //               }));
// // // //             });
// // // //           });
// // // //         });
// // // //       },
// // // //       onStompError: (frame) => {
// // // //         console.error("STOMP error:", frame.headers["message"]);
// // // //         console.error("STOMP error details:", frame.body);
// // // //       },
// // // //       onWebSocketError: (event) => {
// // // //         console.error("WebSocket error:", event);
// // // //       },
// // // //       onDisconnect: () => console.log("❌ WebSocket disconnected"),
// // // //     });

// // // //     stompClient.activate();

// // // //     return () => {
// // // //       stompClient.deactivate();
// // // //     };
// // // //   }, [tabs]); // Reconnect when tabs change

// // // //   // Add this useEffect for initialization
// // // //   useEffect(() => {
// // // //     setOrderProducts({});
// // // //     setTotalBeforeDiscount(0);
// // // //     fetchPendingOrders();
// // // //   }, []);

// // // //   // 2. Create new order
// // // //   const addTab = async () => {
// // // //     try {
// // // //       // Check if there are already 5 pending orders
// // // //       const pendingOrdersCount = tabs.filter(
// // // //         (tab) => tab.order.trangThai === 1
// // // //       ).length;
// // // //       if (pendingOrdersCount >= 10) {
// // // //         message.error("Bạn chỉ có thể tạo tối đa 10 đơn hàng chờ xác nhận");
// // // //         return;
// // // //       }

// // // //       setLoading(true);
// // // //       const response = await api.post("/api/admin/ban-hang/create", {
// // // //         emailNhanVien: "vnv@gmail.com", // Replace with actual logged-in user
// // // //       });

// // // //       const newOrder = response.data;
// // // //       // Use id instead of maHoaDon for API calls
// // // //       const newOrderKey = newOrder.id;

// // // //       setTabs((prev) => [
// // // //         ...prev,
// // // //         {
// // // //           key: newOrderKey,
// // // //           title: `Đơn hàng ${prev.length + 1} - ${newOrder.maHoaDon}`, // Display maHoaDon
// // // //           order: newOrder,
// // // //         },
// // // //       ]);

// // // //       setOrderProducts((prev) => ({
// // // //         ...prev,
// // // //         [newOrderKey]: [],
// // // //       }));

// // // //       setActiveKey(newOrderKey);
// // // //       message.success("Tạo đơn hàng mới thành công");

// // // //       // After successful tab creation, subscribe to its updates
// // // //       if (socket.current) {
// // // //         socket.current.subscribe(`/topic/hoa-don/${newOrderKey}`, (message) => {
// // // //           fetchInvoiceProducts(newOrderKey).then((products) => {
// // // //             setOrderProducts((prev) => ({
// // // //               ...prev,
// // // //               [newOrderKey]: products,
// // // //             }));
// // // //           });
// // // //         });
// // // //       }
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi tạo đơn hàng mới");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // 3. Add product to order
// // // //   const handleAddProductToOrder = async (product) => {
// // // //     if (!activeKey) {
// // // //       message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
// // // //       return;
// // // //     }
  
// // // //     try {
// // // //       const response = await api.post(`/api/admin/ban-hang/${activeKey}/add-product`, {
// // // //         sanPhamChiTietId: product.id,
// // // //         soLuong: 1,
// // // //       });
  
// // // //       if (!response || !response.data) {
// // // //         throw new Error("Dữ liệu API không hợp lệ");
// // // //       }
  
// // // //       console.log("✅ Sản phẩm đã thêm vào đơn hàng:", response.data);
  
// // // //       // Cập nhật sản phẩm và tổng tiền ngay lập tức
// // // //       const updatedProducts = await fetchInvoiceProducts(activeKey);
  
// // // //       setOrderProducts((prev) => ({ ...prev, [activeKey]: updatedProducts }));
// // // //       setTotals((prev) => ({
// // // //         ...prev,
// // // //         [activeKey]: calculateOrderTotals(activeKey),
// // // //       }));
  
// // // //       // 🔄 Cập nhật lại gợi ý voucher & sản phẩm
// // // //       await findBestVoucherAndSuggest(activeKey);
  
// // // //       message.success("Thêm sản phẩm thành công");
// // // //     } catch (error) {
// // // //       console.error("❌ Lỗi khi thêm sản phẩm:", error);
// // // //       message.error("Lỗi khi thêm sản phẩm, vui lòng kiểm tra lại.");
// // // //     }
// // // //   };
  

// // // //   // 4. Update product quantity
// // // //   const handleUpdateQuantity = async (
// // // //     hoaDonId,
// // // //     hoaDonChiTietId,
// // // //     newQuantity
// // // //   ) => {
// // // //     if (newQuantity < 1) return message.error("Số lượng phải lớn hơn 0");

// // // //     try {
// // // //       setOrderProducts((prev) => ({
// // // //         ...prev,
// // // //         [hoaDonId]: prev[hoaDonId].map((product) =>
// // // //           product.id === hoaDonChiTietId
// // // //             ? { ...product, soLuong: newQuantity }
// // // //             : product
// // // //         ),
// // // //       }));

// // // //       const updatedProducts = orderProducts[hoaDonId].map((product) =>
// // // //         product.id === hoaDonChiTietId
// // // //           ? { ...product, soLuong: newQuantity }
// // // //           : product
// // // //       );

// // // //       const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
// // // //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));

// // // //       await api.put(
// // // //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}/so-luong`,
// // // //         { soLuong: newQuantity }
// // // //       );

// // // //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// // // //       await autoApplyBestVoucher(hoaDonId);
// // // //       await fetchInvoiceProducts(hoaDonId);
// // // //       await findBestVoucherAndSuggest(hoaDonId);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi cập nhật số lượng:", error);
// // // //       message.error("Lỗi khi cập nhật số lượng!");
// // // //       await fetchInvoiceProducts(hoaDonId);
// // // //     }
// // // //   };

// // // //   // 5. Remove product
// // // //   const handleRemoveProduct = async (hoaDonId, hoaDonChiTietId) => {
// // // //     try {
// // // //       const updatedProducts = orderProducts[hoaDonId].filter(
// // // //         (product) => product.id !== hoaDonChiTietId
// // // //       );

// // // //       setOrderProducts((prev) => ({ ...prev, [hoaDonId]: updatedProducts }));

// // // //       await api.delete(
// // // //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`
// // // //       );

// // // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //       const newTotalBeforeVoucher =
// // // //         calculateTotalBeforeDiscount(updatedProducts) +
// // // //         (currentOrder?.phiVanChuyen || 0);

// // // //       if (
// // // //         currentOrder?.phieuGiamGia &&
// // // //         newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
// // // //       ) {
// // // //         await handleRemoveVoucher(hoaDonId);
// // // //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// // // //       }

// // // //       setTotals((prev) => ({
// // // //         ...prev,
// // // //         [hoaDonId]: calculateOrderTotals(hoaDonId),
// // // //       }));

// // // //       await fetchInvoiceProducts(hoaDonId);

// // // //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// // // //       await autoApplyBestVoucher(hoaDonId);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi xóa sản phẩm:", error);
// // // //       message.error("Lỗi khi xóa sản phẩm!");
// // // //     }
// // // //   };

// // // //   // 6. Apply voucher
// // // //   const handleVoucherSelected = async (hoaDonId, voucherId) => {
// // // //     try {
// // // //       console.log('Áp dụng voucher từ dialog:', { hoaDonId, voucherId });
      
// // // //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// // // //       if (!hoaDonId || !voucherId) {
// // // //         console.error('hoaDonId hoặc voucherId không hợp lệ');
// // // //         message.error('Không thể áp dụng voucher');
// // // //         return;
// // // //       }
      
// // // //       // Gọi API để áp dụng voucher
// // // //       const response = await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // // //         voucherId: voucherId,
// // // //       });

// // // //       if (response.data) {
// // // //         const updatedOrder = response.data;
        
// // // //         // Cập nhật order trong tabs
// // // //         setTabs(prev =>
// // // //           prev.map(tab =>
// // // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //           )
// // // //         );
        
// // // //         // Tải lại sản phẩm
// // // //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// // // //         // Tính toán lại tổng tiền dựa trên voucher
// // // //         const newTotals = calculateOrderTotals(hoaDonId);
        
// // // //         setTotals(prev => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(newTotals.subtotal);
// // // //           setTotalAmount(newTotals.finalTotal);
// // // //         }
        
// // // //         setOpenVoucherDialog(false);
// // // //         message.success("Áp dụng voucher thành công");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi áp dụng voucher:", error);
// // // //       message.error("Lỗi khi áp dụng voucher");
// // // //     }
// // // //   };

// // // //   // 7. Remove voucher
// // // //   const handleRemoveVoucher = async (hoaDonId) => {
// // // //     try {
// // // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //       const currentProducts = orderProducts[hoaDonId] || [];

// // // //       // Tính toán lại tổng tiền ngay lập tức
// // // //       const subtotal = calculateTotalBeforeDiscount(currentProducts);
// // // //       const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);
// // // //       const finalTotal = totalWithShipping; // Không còn mã giảm giá

// // // //       // Cập nhật UI ngay lập tức
// // // //       setTabs((prev) =>
// // // //         prev.map((tab) =>
// // // //           tab.key === hoaDonId
// // // //             ? {
// // // //                 ...tab,
// // // //                 order: {
// // // //                   ...tab.order,
// // // //                   tongTien: totalWithShipping,
// // // //                   giamGia: 0,
// // // //                   tongThanhToan: finalTotal,
// // // //                   phieuGiamGia: null, // Xóa voucher khỏi state
// // // //                 },
// // // //               }
// // // //             : tab
// // // //         )
// // // //       );

// // // //       setTotals((prev) => ({
// // // //         ...prev,
// // // //         [hoaDonId]: {
// // // //           subtotal,
// // // //           shippingFee: currentOrder?.phiVanChuyen || 0,
// // // //           totalBeforeVoucher: totalWithShipping,
// // // //           discountAmount: 0,
// // // //           finalTotal,
// // // //         },
// // // //       }));

// // // //       //Gọi API để xóa voucher trên server
// // // //       await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`);

// // // //       message.success("Đã xóa voucher");
// // // //       await fetchInvoiceProducts(hoaDonId);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi xóa voucher:", error);
// // // //       message.error("Lỗi khi xóa voucher!");
// // // //       await fetchInvoiceProducts(hoaDonId);
// // // //     }
// // // //   };

// // // //   const fetchAvailableVouchers = async () => {
// // // //     try {
// // // //       const response = await api.get(
// // // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}`
// // // //       );
// // // //       setVouchers(response.data);
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi tải danh sách voucher");
// // // //     }
// // // //   };

// // // //   // Replace loadVouchers function with fetchAvailableVouchers
// // // //   const loadVouchers = async (hoaDonId) => {
// // // //     try {
// // // //       await fetchAvailableVouchers();
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi tải danh sách voucher");
// // // //     }
// // // //   };

// // // //   // 9. Confirm order
// // // //   const handleConfirmOrder = async (hoaDonId) => {
// // // //     try {
// // // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

// // // //       if (!currentOrder || !currentOrder.phuongThucThanhToan) {
// // // //         message.error(
// // // //           "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
// // // //         );
// // // //         return;
// // // //       }

// // // //       // Only check payment amount for cash payments
// // // //       if (
// // // //         currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
// // // //         PAYMENT_METHOD.CASH
// // // //       ) {
// // // //         const { remaining } = calculateChange(hoaDonId);
// // // //         if (remaining > 0) {
// // // //           message.error("Số tiền khách đưa chưa đủ để thanh toán!");
// // // //           return;
// // // //         }
// // // //       }

// // // //       await api.post(`/api/admin/ban-hang/${hoaDonId}/complete`, {
// // // //         phuongThucThanhToans: [
// // // //           currentOrder.phuongThucThanhToan.maPhuongThucThanhToan,
// // // //         ],
// // // //       });

// // // //       // Fetch the PDF for printing
// // // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// // // //         responseType: "blob",
// // // //         headers: { Accept: "application/pdf, application/json" },
// // // //       });

// // // //       const contentType = response.headers["content-type"];
// // // //       if (!contentType.includes("application/pdf")) {
// // // //         message.error("Định dạng không hợp lệ từ máy chủ");
// // // //         return;
// // // //       }

// // // //       const blob = new Blob([response.data], { type: "application/pdf" });
// // // //       const url = window.URL.createObjectURL(blob);

// // // //       // Lưu URL của PDF và mở modal xem trước
// // // //       setPdfUrl(url);
// // // //       setPreviewOpen(true);

// // // //       // Đóng tab sau khi xác nhận thành công
// // // //       setTabs((prev) => prev.filter((tab) => prev.key !== hoaDonId));
// // // //       message.success("Xác nhận đơn hàng thành công");
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi xác nhận đơn hàng");
// // // //     }
// // // //   };

// // // //   const handleDirectPrint = () => {
// // // //     const iframe = document.getElementById("pdf-preview");
// // // //     iframe.contentWindow.print();
// // // //   };

// // // //   // 10. Print invoice
// // // //   const handlePrintInvoice = async (hoaDonId) => {
// // // //     try {
// // // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// // // //         responseType: "blob",
// // // //       });

// // // //       const blob = new Blob([response.data], { type: "application/pdf" });
// // // //       const url = window.URL.createObjectURL(blob);
// // // //       window.open(url);
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi in hóa đơn");
// // // //     }
// // // //   };

// // // //   // Cập nhật lại findBestVoucherAndSuggest để sử dụng hàm helper
// // // //   const findBestVoucherAndSuggest = async (hoaDonId) => {
// // // //     try {
// // // //       console.log('🔍 Tìm voucher tốt hơn cho đơn hàng:', hoaDonId);
      
// // // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //       if (!order) {
// // // //         console.warn('⚠️ Không tìm thấy đơn hàng');
// // // //         return;
// // // //       }

// // // //       const currentProducts = orderProducts[hoaDonId] || [];
// // // //       const currentTotal = totals[hoaDonId]?.totalBeforeVoucher || 0;
      
// // // //       // Kiểm tra nếu tổng tiền quá nhỏ, không cần tìm voucher
// // // //       if (currentTotal < 10000) {
// // // //         setVoucherSuggestions({
// // // //           show: false,
// // // //           betterVouchers: []
// // // //         });
// // // //         return;
// // // //       }

// // // //       // Sử dụng cache để tránh gọi API liên tục
// // // //       const cacheKey = `vouchers_${Math.floor(currentTotal/10000)}`;
// // // //       let allVouchers = sessionStorage.getItem(cacheKey);
      
// // // //       if (!allVouchers) {
// // // //         const response = await api.get('/api/phieu-giam-gia');
// // // //         allVouchers = response.data || [];
// // // //         sessionStorage.setItem(cacheKey, JSON.stringify(allVouchers));
// // // //       } else {
// // // //         allVouchers = JSON.parse(allVouchers);
// // // //       }
      
// // // //       // Tính giảm giá hiện tại
// // // //       const currentDiscount = order.phieuGiamGia 
// // // //         ? calculateDiscountAmount(order.phieuGiamGia, currentTotal)
// // // //         : 0;
      
// // // //       // Lọc voucher có giá trị giảm tốt hơn voucher hiện tại
// // // //       const betterVouchers = allVouchers
// // // //         .filter(voucher => {
// // // //           if (voucher.id === order.phieuGiamGia?.id) return false;
          
// // // //           const potentialDiscount = calculateDiscountAmount(
// // // //             voucher, 
// // // //             Math.max(currentTotal, voucher.giaTriToiThieu)
// // // //           );
          
// // // //           return potentialDiscount > currentDiscount;
// // // //         })
// // // //         .map(voucher => ({
// // // //           ...voucher,
// // // //           amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
// // // //           potentialDiscount: calculateDiscountAmount(
// // // //             voucher, 
// // // //             Math.max(currentTotal, voucher.giaTriToiThieu)
// // // //           ),
// // // //           additionalSavings: calculateDiscountAmount(
// // // //             voucher, 
// // // //             Math.max(currentTotal, voucher.giaTriToiThieu)
// // // //           ) - currentDiscount
// // // //         }))
// // // //         .sort((a, b) => b.additionalSavings - a.additionalSavings)
// // // //         .slice(0, 3); // Giới hạn chỉ 3 voucher tốt nhất

// // // //       if (betterVouchers.length > 0) {
// // // //         // Tối ưu: Chỉ tìm sản phẩm gợi ý cho voucher cần thêm tiền
// // // //         const suggestedProducts = await Promise.all(
// // // //           betterVouchers
// // // //             .filter(v => v.amountNeeded > 0)
// // // //             .map(async voucher => {
// // // //               // Gợi ý tăng số lượng sản phẩm hiện có
// // // //               const currentProductSuggestions = currentProducts
// // // //                 .filter(p => p.gia > 0)
// // // //                 .map(p => ({
// // // //                   ...p,
// // // //                   quantityNeeded: Math.ceil(voucher.amountNeeded / p.gia)
// // // //                 }))
// // // //                 .sort((a, b) => a.quantityNeeded - b.quantityNeeded)
// // // //                 .slice(0, 2);
              
// // // //               // Lấy sản phẩm mới từ cache hoặc API
// // // //               let allProducts = sessionStorage.getItem('all_products');
// // // //               if (!allProducts) {
// // // //                 allProducts = await fetchAllProducts();
// // // //                 sessionStorage.setItem('all_products', JSON.stringify(allProducts));
// // // //               } else {
// // // //                 allProducts = JSON.parse(allProducts);
// // // //               }
              
// // // //               const currentProductIds = currentProducts.map(p => p.id);
              
// // // //               // Tìm sản phẩm có giá phù hợp
// // // //               const minPrice = voucher.amountNeeded * 0.7;
// // // //               const maxPrice = voucher.amountNeeded * 1.5;
              
// // // //               const newProductSuggestions = allProducts
// // // //                 .filter(p => !currentProductIds.includes(p.id))
// // // //                 .filter(p => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0)
// // // //                 .sort((a, b) => Math.abs(a.gia - voucher.amountNeeded) - Math.abs(b.gia - voucher.amountNeeded))
// // // //                 .slice(0, 3);
                
// // // //               return {
// // // //                 voucherId: voucher.id,
// // // //                 currentProducts: currentProductSuggestions,
// // // //                 newProducts: newProductSuggestions
// // // //               };
// // // //             })
// // // //         );
        
// // // //         // Cập nhật state với voucher và sản phẩm gợi ý
// // // //         setVoucherSuggestions({
// // // //           show: true,
// // // //           betterVouchers: betterVouchers.map((voucher, index) => ({
// // // //             ...voucher,
// // // //             suggestions: suggestedProducts.find(s => s?.voucherId === voucher.id) || {
// // // //               currentProducts: [],
// // // //               newProducts: []
// // // //             }
// // // //           }))
// // // //         });
// // // //       } else {
// // // //         setVoucherSuggestions({
// // // //           show: false,
// // // //           betterVouchers: []
// // // //         });
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi tìm voucher tốt hơn:', error);
// // // //       setVoucherSuggestions({
// // // //         show: false,
// // // //         betterVouchers: []
// // // //       });
// // // //     }
// // // //   };

// // // //   // Hàm xử lý khi người dùng áp dụng voucher được gợi ý
// // // //   const handleApplySuggestedVoucher = async (hoaDonId, voucherId) => {
// // // //     try {
// // // //       console.log('Áp dụng voucher gợi ý:', { hoaDonId, voucherId });
      
// // // //       // Gọi API để áp dụng voucher
// // // //       const response = await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // // //         voucherId: voucherId
// // // //       });
      
// // // //       if (response.data) {
// // // //         // Cập nhật thông tin hóa đơn trong tabs với dữ liệu mới
// // // //         const updatedOrder = response.data;
// // // //         setTabs(prev => 
// // // //           prev.map(tab => 
// // // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //           )
// // // //         );
        
// // // //         // Tải lại danh sách sản phẩm
// // // //         const updatedProducts = await fetchInvoiceProducts(hoaDonId, true);
        
// // // //         // Tính toán lại tổng tiền
// // // //         const subtotal = calculateTotalBeforeDiscount(updatedProducts);
// // // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // // //         const totalBeforeVoucher = subtotal + shippingFee;
        
// // // //         // Tính toán giảm giá dựa trên voucher đã áp dụng
// // // //         let discountAmount = 0;
// // // //         if (updatedOrder.phieuGiamGia) {
// // // //           discountAmount = calculateDiscountAmount(
// // // //             updatedOrder.phieuGiamGia,
// // // //             totalBeforeVoucher
// // // //           );
// // // //         }
        
// // // //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// // // //         // Cập nhật totals
// // // //         const newTotals = {
// // // //           subtotal,
// // // //           shippingFee,
// // // //           totalBeforeVoucher,
// // // //           discountAmount,
// // // //           finalTotal
// // // //         };
        
// // // //         setTotals(prev => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(subtotal);
// // // //           setTotalAmount(finalTotal);
// // // //         }
        
// // // //         message.success('Đã áp dụng voucher thành công!');
        
// // // //         // Ẩn gợi ý sau khi áp dụng
// // // //         setVoucherSuggestions({
// // // //           show: false,
// // // //           betterVouchers: []
// // // //         });
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi áp dụng voucher:', error);
// // // //       message.error('Không thể áp dụng voucher. Vui lòng thử lại!');
// // // //     }
// // // //   };

// // // //   // Hàm xử lý khi người dùng thêm sản phẩm từ gợi ý
// // // //   const handleAddSuggestedProduct = async (product) => {
// // // //     try {
// // // //       await handleAddProductToOrder(product);
// // // //       message.success(`Đã thêm ${product.tenSanPham} vào đơn hàng`);
      
// // // //       // Cập nhật lại gợi ý sau khi thêm sản phẩm
// // // //       setTimeout(() => {
// // // //         findBestVoucherAndSuggest(activeKey);
// // // //       }, 500);
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi thêm sản phẩm:', error);
// // // //       message.error('Lỗi khi thêm sản phẩm vào đơn hàng');
// // // //     }
// // // //   };

// // // //   // Hàm xử lý khi người dùng tăng số lượng sản phẩm từ gợi ý
// // // //   const handleUpdateQuantityForSuggestion = async (hoaDonId, productId, newQuantity) => {
// // // //     try {
// // // //       await handleUpdateQuantity(hoaDonId, productId, newQuantity);
// // // //       message.success('Đã cập nhật số lượng sản phẩm');
      
// // // //       // Cập nhật lại gợi ý sau khi thêm sản phẩm
// // // //       setTimeout(() => {
// // // //         findBestVoucherAndSuggest(hoaDonId);
// // // //       }, 500);
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi cập nhật số lượng:', error);
// // // //       message.error('Lỗi khi cập nhật số lượng sản phẩm');
// // // //     }
// // // //   };

// // // //   // Gợi ý mua thêm tiền để áp dụng mã giảm giá tốt hơn
// // // //   useEffect(() => {
// // // //     if (activeKey && orderProducts[activeKey]) {
// // // //       console.log("🔄 Cập nhật tổng tiền...");
  
// // // //       // 🟢 Tính tổng tiền trước khi cập nhật vào `totals`
// // // //       const newTotals = calculateOrderTotals(activeKey);
// // // //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// // // //       setTotalAmount(newTotals.finalTotal);
  
// // // //       console.log("📌 Tổng tiền mới:", newTotals);
// // // //     }
// // // //   }, [orderProducts, activeKey]);
  
// // // //   useEffect(() => {
// // // //     if (activeKey && totals[activeKey] && totals[activeKey].totalBeforeVoucher > 0) {
// // // //       console.log("🔄 Tổng tiền đã cập nhật, tìm voucher tốt nhất...");
// // // //       findBestVoucherAndSuggest(activeKey);
// // // //     }
// // // //   }, [totals, activeKey]); // Chỉ chạy khi tổng tiền thay đổi
  
  
    
// // // //   // Update order content rendering to show products table
// // // //  const renderOrderContent = (order) => (
// // // //   <Row gutter={16}>
// // // //     <Col
// // // //       span={17}
// // // //       style={{
// // // //         border: "1px solid #ccc",
// // // //         borderRadius: "8px",
// // // //         padding: "16px",
// // // //         maxHeight: "calc(100vh - 180px)",
// // // //         overflowY: "auto"
// // // //       }}
// // // //     >
// // // //       <Space direction="vertical" style={{ width: "100%" }}>
// // // //         <div style={{ display: "flex", justifyContent: "flex-end" }}>
// // // //           <Button>
// // // //             <BiQrScan />
// // // //             Quét mã QR
// // // //           </Button>
// // // //           <Button
// // // //             type="primary"
// // // //             onClick={() => setOpenProductTable(true)}
// // // //             style={{ marginLeft: 8 }}
// // // //           >
// // // //             <IoIosAddCircle />
// // // //             Thêm sản phẩm
// // // //           </Button>
// // // //         </div>
// // // //         <Table
// // // //           dataSource={orderProducts[order.id] || []}
// // // //           columns={columns}
// // // //           pagination={{
// // // //             current: pagination.current,
// // // //             pageSize: 3,
// // // //             showSizeChanger: false,
// // // //             total: orderProducts[order.id]?.length || 0,
// // // //             showTotal: (total) => `Tổng ${total} sản phẩm`,
// // // //             size: "small",
// // // //             position: ["bottomCenter"],
// // // //             onChange: (page) => {
// // // //               setPagination({ current: page, pageSize: 3 });
// // // //             },
// // // //           }}
// // // //           rowKey="id"
// // // //           bordered
// // // //           size="small"
// // // //           style={{
// // // //             marginTop: "10px",
// // // //             borderRadius: "8px",
// // // //             boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
// // // //           }}
// // // //           scroll={{ y: 'calc(100vh - 350px)' }}
// // // //         />
// // // //       </Space>
// // // //     </Col>
// // // //     <Col span={7}>
// // // //       <div
// // // //         style={{
// // // //           border: "1px solid #ccc",
// // // //           borderRadius: "8px",
// // // //           padding: "10px",
// // // //           maxHeight: "calc(100vh - 180px)",
// // // //           overflowY: "auto"
// // // //         }}
// // // //       >
// // // //         <Space direction="vertical" style={{ width: "100%" }}>
// // // //           <Text strong>Thông tin khách hàng</Text>
// // // //           <div
// // // //             style={{
// // // //               border: "1px solid #ccc",
// // // //               borderRadius: "8px",
// // // //               padding: "10px",
// // // //             }}
// // // //           >
// // // //             <Row>
// // // //               <Col span={10}>
// // // //                 <Text>Khách hàng</Text>
// // // //               </Col>
// // // //               <Col span={14}>
// // // //                 <Row style={{ display: "flex", justifyContent: "flex-end" }}>
// // // //                   <Button
// // // //                     size="small"
// // // //                     onClick={() => handleSelectCustomer(order.id)}
// // // //                   >
// // // //                     <AiOutlineSelect />
// // // //                     Chọn
// // // //                   </Button>
// // // //                   <Button
// // // //                     type="primary"
// // // //                     size="small"
// // // //                     style={{ marginLeft: 8 }}
// // // //                     onClick={() => handleAddNewCustomer()}
// // // //                   >
// // // //                     <IoIosAddCircle />
// // // //                     Thêm mới
// // // //                   </Button>
// // // //                 </Row>
// // // //               </Col>
// // // //             </Row>
// // // //             <Row style={{ marginTop: 8 }}>
// // // //               <Col
// // // //                 span={24}
// // // //                 style={{ display: "flex", alignItems: "center" }}
// // // //               >
// // // //                 <Avatar size={40} style={{ marginRight: 8 }} />
// // // //                 <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
// // // //               </Col>
// // // //             </Row>
// // // //             <div
// // // //               style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
// // // //             ></div>
// // // //             <Row>
// // // //               <Col span={24}>
// // // //                 <Radio.Group
// // // //                   value={order.hinhThucNhan || "taiQuay"}
// // // //                   onChange={(e) =>
// // // //                     handleDeliveryMethodChange(order.id, e.target.value)
// // // //                   }
// // // //                 >
// // // //                   <Radio value="taiQuay">Tại quầy</Radio>
// // // //                   <Radio value="giaoHang">Giao hàng</Radio>
// // // //                 </Radio.Group>
// // // //               </Col>
// // // //             </Row>
// // // //           </div>
// // // //           <div
// // // //             style={{
// // // //               display: "flex",
// // // //               justifyContent: "space-between",
// // // //               alignItems: "center",
// // // //             }}
// // // //           >
// // // //             <Text strong>Voucher giảm giá:</Text>
// // // //             <div>
// // // //               {order.phieuGiamGia ? (
// // // //                 <Tag
// // // //                   closable
// // // //                   onClose={() => handleRemoveVoucher(order.id)}
// // // //                   color="black"
// // // //                 >
// // // //                   {order.phieuGiamGia.maPhieuGiamGia}
// // // //                 </Tag>
// // // //               ) : (
// // // //                 <Space>
// // // //                   <Button
// // // //                     type="default"
// // // //                     icon={<TagOutlined />}
// // // //                     onClick={() => {
// // // //                       loadVouchers(order.id);
// // // //                       setOpenVoucherDialog(true);
// // // //                     }}
// // // //                   >
// // // //                     Chọn mã
// // // //                   </Button>
// // // //                   <Button
// // // //                     type="primary"
// // // //                     onClick={() => autoApplyBestVoucher(order.id)}
// // // //                   >
// // // //                     Áp dụng tốt nhất
// // // //                   </Button>
// // // //                 </Space>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //           <Text strong>Thông tin thanh toán</Text>
// // // //           <div
// // // //             style={{
// // // //               border: "1px solid #ccc",
// // // //               borderRadius: "8px",
// // // //               padding: "10px",
// // // //             }}
// // // //           >
// // // //             <Row>
// // // //               <Col span={24}>
// // // //                 <Radio.Group
// // // //                   value={
// // // //                     order.phuongThucThanhToan?.maPhuongThucThanhToan || ""
// // // //                   }
// // // //                   onChange={(e) =>
// // // //                     handlePaymentMethodChange(order.id, e.target.value)
// // // //                   }
// // // //                 >
// // // //                   {paymentMethods.map((method) => (
// // // //                     <Radio
// // // //                       key={method.id}
// // // //                       value={method.maPhuongThucThanhToan}
// // // //                     >
// // // //                       {method.tenPhuongThucThanhToan}
// // // //                     </Radio>
// // // //                   ))}
// // // //                 </Radio.Group>
// // // //               </Col>
// // // //             </Row>
// // // //             <Row style={{ marginTop: 8 }}>
// // // //               <Col span={12}>
// // // //                 <Text>Tổng tiền:</Text>
// // // //               </Col>
// // // //               <Col span={12} style={{ textAlign: "right" }}>
// // // //                 <Text strong>
// // // //                   {formatCurrency(totals[order.id]?.totalBeforeVoucher || 0)}
// // // //                 </Text>
// // // //               </Col>
// // // //             </Row>
// // // //             <Row style={{ marginTop: 8 }}>
// // // //               <Col span={12}>
// // // //                 <Text>Phí vận chuyển:</Text>
// // // //               </Col>
// // // //               <Col span={12}>
// // // //                 <InputNumber
// // // //                   style={{ width: "100%" }}
// // // //                   value={order.phiVanChuyen || 0}
// // // //                   onChange={(value) =>
// // // //                     handleShippingFeeChange(order.id, value)
// // // //                   }
// // // //                   formatter={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
// // // //                   parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // // //                 />
// // // //               </Col>
// // // //             </Row>
// // // //             <Row style={{ marginTop: 8 }}>
// // // //               <Col span={12}>
// // // //                 <Text>Giảm giá:</Text>
// // // //               </Col>
// // // //               <Col span={12} style={{ textAlign: "right" }}>
// // // //                 {order.phieuGiamGia ? (
// // // //                   <Text strong style={{ color: '#f50' }}>
// // // //                     {order.phieuGiamGia.loaiPhieuGiamGia === 1 ? (
// // // //                       <span>
// // // //                         {order.phieuGiamGia.giaTriGiam}% (
// // // //                         {formatCurrency(totals[order.id]?.discountAmount || 0)})
// // // //                       </span>
// // // //                     ) : (
// // // //                       formatCurrency(totals[order.id]?.discountAmount || 0)
// // // //                     )}
// // // //                   </Text>
// // // //                 ) : (
// // // //                   <Text>{formatCurrency(totals[order.id]?.discountAmount || 0)}</Text>
// // // //                 )}
// // // //               </Col>
// // // //             </Row>
// // // //             <Row style={{ marginTop: 8 }}>
// // // //               <Col span={12}>
// // // //                 <Text strong>Tổng thanh toán:</Text>
// // // //               </Col>
// // // //               <Col span={12} style={{ textAlign: "right" }}>
// // // //                 <Text strong style={{ color: "red" }}>
// // // //                   {formatCurrency(totals[order.id]?.finalTotal || 0)}
// // // //                 </Text>
// // // //               </Col>
// // // //             </Row>
// // // //             {order.phuongThucThanhToan?.maPhuongThucThanhToan ===
// // // //               PAYMENT_METHOD.CASH && (
// // // //               <>
// // // //                 <Divider style={{ margin: "12px 0" }} />
// // // //                 <Row justify="space-between" align="middle">
// // // //                   <Col span={10}>
// // // //                     <Text>Tiền khách đưa:</Text>
// // // //                   </Col>
// // // //                   <Col span={14}>
// // // //                     <InputNumber
// // // //                       style={{ width: "100%" }}
// // // //                       value={customerPayment[order.id] || 0}
// // // //                       onChange={(value) => {
// // // //                         setCustomerPayment((prev) => ({
// // // //                           ...prev,
// // // //                           [order.id]: value || 0,
// // // //                         }));
// // // //                       }}
// // // //                       formatter={(value) =>
// // // //                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// // // //                       }
// // // //                       parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // // //                       min={0}
// // // //                       step={1000}
// // // //                     />
// // // //                   </Col>
// // // //                 </Row>
// // // //                 {calculateChange(order.id).change > 0 && (
// // // //                   <Row justify="space-between" style={{ marginTop: 8 }}>
// // // //                     <Col>
// // // //                       <Text strong style={{ color: "#52c41a" }}>
// // // //                         Tiền thừa:
// // // //                       </Text>
// // // //                     </Col>
// // // //                     <Col>
// // // //                       <Text strong style={{ color: "#52c41a" }}>
// // // //                         {formatCurrency(calculateChange(order.id).change)}
// // // //                       </Text>
// // // //                     </Col>
// // // //                   </Row>
// // // //                 )}
// // // //                 {calculateChange(order.id).remaining > 0 && (
// // // //                   <Row justify="space-between" style={{ marginTop: 8 }}>
// // // //                     <Col>
// // // //                       <Text strong style={{ color: "#ff4d4f" }}>
// // // //                         Còn thiếu:
// // // //                       </Text>
// // // //                     </Col>
// // // //                     <Col>
// // // //                       <Text strong style={{ color: "#ff4d4f" }}>
// // // //                         {formatCurrency(calculateChange(order.id).remaining)}
// // // //                       </Text>
// // // //                     </Col>
// // // //                   </Row>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </div>
// // // //           {/* Phần hiển thị gợi ý voucher */}
// // // //           {voucherSuggestions.show && voucherSuggestions.betterVouchers?.length > 0 && (
// // // //             <div className="voucher-suggestions"
// // // //               style={{
// // // //                 margin: '16px 0',
// // // //                 padding: '12px',
// // // //                 background: '#f6ffed',
// // // //                 border: '1px solid #b7eb8f',
// // // //                 borderRadius: '8px',
// // // //                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
// // // //                 maxHeight: '300px',
// // // //                 overflowY: 'auto'
// // // //               }}
// // // //             >
// // // //               <Space direction="vertical" size="small" style={{ width: '100%' }}>
// // // //                 <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
// // // //                   <InfoCircleOutlined style={{ marginRight: 8 }} />
// // // //                   Có {voucherSuggestions.betterVouchers.length} voucher tốt hơn cho đơn hàng
// // // //                 </Text>

// // // //                 {voucherSuggestions.betterVouchers.map((voucher, index) => {
// // // //                   const currentDiscount = order.phieuGiamGia 
// // // //                     ? calculateDiscountAmount(order.phieuGiamGia, totals[order.id]?.totalBeforeVoucher || 0)
// // // //                     : 0;

// // // //                   return (
// // // //                     <Card 
// // // //                       key={voucher.id} 
// // // //                       size="small" 
// // // //                       bordered={true}
// // // //                       style={{ background: '#fff', marginBottom: 8 }}
// // // //                       title={
// // // //                         <Space>
// // // //                           <TagOutlined style={{ color: '#1890ff' }} />
// // // //                           <Text strong style={{ fontSize: '12px' }}>{voucher.maPhieuGiamGia}</Text>
// // // //                           <Tag color="green" style={{ fontSize: '11px' }}>
// // // //                             +{formatCurrency(voucher.additionalSavings)}
// // // //                           </Tag>
// // // //                         </Space>
// // // //                       }
// // // //                       extra={
// // // //                         <Button 
// // // //                           type="primary" 
// // // //                           size="small"
// // // //                           onClick={() => handleApplySuggestedVoucher(order.id, voucher.id)}
// // // //                           disabled={voucher.amountNeeded > 0}
// // // //                         >
// // // //                           {voucher.amountNeeded > 0 ? 'Chưa đủ' : 'Áp dụng'}
// // // //                         </Button>
// // // //                       }
// // // //                     >
// // // //                       <Space direction="vertical" style={{ width: '100%' }} size="small">
// // // //                         <div>
// // // //                           <Text style={{ fontSize: '12px' }}>
// // // //                             {voucher.loaiPhieuGiamGia === 1
// // // //                               ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
// // // //                             voucher.soTienGiamToiDa
// // // //                           )})`
// // // //                         : `Giảm ${formatCurrency(voucher.giaTriGiam)}`
// // // //                             }
// // // //                           </Text>
// // // //                           <br />
// // // //                           <Text type="secondary" style={{ fontSize: '12px' }}>
// // // //                             Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
// // // //                           </Text>
// // // //                         </div>

// // // //                         {voucher.amountNeeded > 0 && (
// // // //                           <Alert
// // // //                             type="warning"
// // // //                             message={`Cần mua thêm ${formatCurrency(voucher.amountNeeded)}`}
// // // //                             style={{ marginBottom: 8, fontSize: '12px', padding: '4px 8px' }}
// // // //                           />
// // // //                         )}

// // // //                         {/* Hiển thị gợi ý sản phẩm thu gọn */}
// // // //                         {(voucher.suggestions?.currentProducts?.length > 0 || 
// // // //                           voucher.suggestions?.newProducts?.length > 0) && (
// // // //                           <Collapse ghost size="small">
// // // //                             <Collapse.Panel 
// // // //                               header={<Text style={{ fontSize: '12px' }}>Xem gợi ý sản phẩm</Text>} 
// // // //                               key="1"
// // // //                             >
// // // //                               {voucher.suggestions?.currentProducts?.length > 0 && (
// // // //                                 <div style={{ marginTop: 4 }}>
// // // //                                   <Text strong style={{ fontSize: '12px' }}>Mua thêm sản phẩm đã chọn:</Text>
// // // //                                   <List
// // // //                                     size="small"
// // // //                                     dataSource={voucher.suggestions.currentProducts}
// // // //                                     renderItem={product => (
// // // //                                       <List.Item
// // // //                                         extra={
// // // //                                           <Button 
// // // //                                             type="primary"
// // // //                                             size="small"
// // // //                                             onClick={() => handleUpdateQuantityForSuggestion(
// // // //                                               order.id,
// // // //                                               product.id,
// // // //                                               product.soLuong + product.quantityNeeded
// // // //                                             )}
// // // //                                           >
// // // //                                             +{product.quantityNeeded}
// // // //                                           </Button>
// // // //                                         }
// // // //                                       >
// // // //                                         <List.Item.Meta
// // // //                                           avatar={<Avatar src={product.hinhAnh?.[0]} shape="square" size="small" />}
// // // //                                           title={<Text style={{ fontSize: '12px' }}>{product.tenSanPham}</Text>}
// // // //                                           description={
// // // //                                             <Text type="secondary" style={{ fontSize: '11px' }}>
// // // //                                               {formatCurrency(product.gia)} x{product.soLuong}
// // // //                                             </Text>
// // // //                                           }
// // // //                                         />
// // // //                                       </List.Item>
// // // //                                     )}
// // // //                                   />
// // // //                                 </div>
// // // //                               )}

// // // //                               {voucher.suggestions?.newProducts?.length > 0 && (
// // // //                                 <div style={{ marginTop: 4 }}>
// // // //                                   <Text strong style={{ fontSize: '12px' }}>Thêm sản phẩm mới:</Text>
// // // //                                   <List
// // // //                                     size="small"
// // // //                                     dataSource={voucher.suggestions.newProducts}
// // // //                                     renderItem={product => (
// // // //                                       <List.Item
// // // //                                         extra={
// // // //                                           <Button
// // // //                                             type="primary"
// // // //                                             size="small"
// // // //                                             icon={<PlusOutlined />}
// // // //                                             onClick={() => handleAddSuggestedProduct(product)}
// // // //                                           >
// // // //                                             Thêm
// // // //                                           </Button>
// // // //                                         }
// // // //                                       >
// // // //                                         <List.Item.Meta
// // // //                                           avatar={<Avatar src={product.hinhAnh?.[0]} shape="square" size="small" />}
// // // //                                           title={<Text style={{ fontSize: '12px' }}>{product.tenSanPham}</Text>}
// // // //                                           description={
// // // //                                             <Text type="success" style={{ fontSize: '11px' }}>
// // // //                                               {formatCurrency(product.gia)}
// // // //                                             </Text>
// // // //                                           }
// // // //                                         />
// // // //                                       </List.Item>
// // // //                                     )}
// // // //                                   />
// // // //                                 </div>
// // // //                               )}
// // // //                             </Collapse.Panel>
// // // //                           </Collapse>
// // // //                         )}
// // // //                       </Space>
// // // //                     </Card>
// // // //                   );
// // // //                 })}
// // // //               </Space>
// // // //             </div>
// // // //           )}

// // // //           <Space direction="vertical" style={{ width: "100%" }}>
// // // //             <Button
// // // //               type="primary"
// // // //               block
// // // //               onClick={() => handleConfirmOrder(order.id)}
// // // //             >
// // // //               Xác nhận đơn hàng
// // // //             </Button>
// // // //           </Space>
// // // //         </Space>
// // // //       </div>
// // // //     </Col>
// // // //   </Row>
// // // // );
// // // //   // Add these handler functions
// // // //   const handleAddNewCustomer = () => {
// // // //     // Implement new customer creation logic
// // // //   };

// // // //   const handleDeliveryMethodChange = async (hoaDonId, method) => {
// // // //     // Implement delivery method change logic
// // // //   };

// // // //   const handlePaymentMethodChange = (hoaDonId, selectedId) => {
// // // //     const selectedMethod = paymentMethods.find(
// // // //       (method) => method.maPhuongThucThanhToan === selectedId
// // // //     );

// // // //     if (selectedMethod) {
// // // //       const newPaymentMethod = {
// // // //         id: selectedMethod.id,
// // // //         maPhuongThucThanhToan: selectedMethod.maPhuongThucThanhToan,
// // // //         tenPhuongThucThanhToan: selectedMethod.tenPhuongThucThanhToan,
// // // //         moTa: selectedMethod.moTa,
// // // //       };

// // // //       setTabs((prev) =>
// // // //         prev.map((tab) =>
// // // //           tab.key === hoaDonId
// // // //             ? {
// // // //                 ...tab,
// // // //                 order: {
// // // //                   ...tab.order,
// // // //                   phuongThucThanhToan: selectedMethod,
// // // //                 },
// // // //               }
// // // //             : tab
// // // //         )
// // // //       );
// // // //     } else {
// // // //       message.error("Phương thức thanh toán không hợp lệ!");
// // // //     }
// // // //   };

// // // //   const handleShippingFeeChange = async (hoaDonId, fee) => {
// // // //     // Implement shipping fee change logic
// // // //   };

// // // //   // Add function to load customers
// // // //   const loadCustomers = async () => {
// // // //     try {
// // // //       const response = await axios.get("http://localhost:8080/api/khach_hang");
// // // //       setCustomers(response.data);
// // // //     } catch (error) {
// // // //       console.error("Error loading customers:", error);
// // // //     }
// // // //   };

// // // //   // Add function to handle customer selection
// // // //   const handleCustomerSelected = async (hoaDonId, customerId) => {
// // // //     try {
// // // //       const response = await axios.put(
// // // //         `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
// // // //         { customerId }
// // // //       );

// // // //       setTabs((prev) =>
// // // //         prev.map((tab) =>
// // // //           tab.key === hoaDonId ? { ...tab, order: response.data } : tab
// // // //         )
// // // //       );
// // // //       setOpenCustomerDialog(false);
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi chọn khách hàng");
// // // //     }
// // // //   };

// // // //   // Add function to handle customer selection
// // // //   const handleSelectCustomer = async (hoaDonId) => {
// // // //     try {
// // // //       await loadCustomers();
// // // //       setOpenCustomerDialog(true);
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi tải danh sách khách hàng");
// // // //     }
// // // //   };

// // // //   // Update calculateTotalBeforeDiscount to handle undefined/null cases
// // // //   const calculateTotalBeforeDiscount = (products) => {
// // // //     if (!products || !Array.isArray(products)) {
// // // //       return 0;
// // // //     }
// // // //     return products.reduce((sum, product) => {
// // // //       const price = product.gia || 0;
// // // //       const quantity = product.soLuong || 0;
// // // //       return sum + price * quantity;
// // // //     }, 0);
// // // //   };

// // // //   // // Update useEffect for totalBeforeDiscount calculation
// // // //   useEffect(() => {
// // // //     if (activeKey && orderProducts[activeKey]) {
// // // //       const total = calculateTotalBeforeDiscount(orderProducts[activeKey]);
// // // //       if (total !== totalBeforeDiscount) {
// // // //         setTotalBeforeDiscount(total);
// // // //       }
// // // //     }
// // // //   }, [activeKey, orderProducts]);
// // // //   // Tự động tính lại tổng tiền khi danh sách sản phẩm thay đổi
// // // //   const calculateOrderTotal = (products, shippingFee = 0, discount = 0) => {
// // // //     const subtotal = products.reduce(
// // // //       (sum, product) => sum + product.gia * product.soLuong,
// // // //       0
// // // //     );
// // // //     return subtotal + shippingFee - discount;
    
// // // //   };
// // // //   useEffect(() => {
// // // //     if (activeKey && orderProducts[activeKey]) {
// // // //       const newTotals = calculateOrderTotals(activeKey);
// // // //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// // // //       setTotalAmount(newTotals.finalTotal);
// // // //     }
// // // //   }, [orderProducts, activeKey]);

// // // //   useEffect(() => {
// // // //     if (activeKey && totals[activeKey]) {
// // // //       setTotalAmount(totals[activeKey].finalTotal);
// // // //     }
// // // //   }, [totals, activeKey, orderProducts]); // Theo dõi thêm `orderProducts`

// // // //   // Add applyBestVoucher function from InvoiceDetail
// // // //   const applyBestVoucher = async (hoaDonId) => {
// // // //     try {
// // // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //       if (!order) return null;

// // // //       const totalBeforeVoucher = calculateOrderTotal(
// // // //         orderProducts[hoaDonId],
// // // //         order.phiVanChuyen || 0,
// // // //         0
// // // //       );

// // // //       // Kiểm tra nếu mã giảm giá hiện tại không còn hợp lệ
// // // //       const currentVoucher = order.phieuGiamGia;
// // // //       if (
// // // //         currentVoucher &&
// // // //         totalBeforeVoucher < currentVoucher.giaTriToiThieu
// // // //       ) {
// // // //         await handleRemoveVoucher(hoaDonId);
// // // //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// // // //       }

// // // //       // Tìm mã giảm giá tốt nhất
// // // //       const response = await api.post(
// // // //         `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher`
// // // //       );
// // // //       const updatedOrder = response.data;

// // // //       setTabs((prev) =>
// // // //         prev.map((tab) =>
// // // //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //         )
// // // //       );

// // // //       // Cập nhật tổng tiền ngay lập tức
// // // //       const newTotals = calculateOrderTotals(hoaDonId);
// // // //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));
// // // //       setTotalAmount(newTotals.finalTotal);

// // // //       return updatedOrder;
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi áp dụng voucher:", error);
// // // //       return null;
// // // //     }
// // // //   };

// // // //   // Add fetchPaymentHistory from InvoiceDetail if needed
// // // //   const fetchPaymentHistory = async () => {
// // // //     if (!activeKey) return;

// // // //     try {
// // // //       setLoadingPayments(true);
// // // //       const response = await api.get(
// // // //         `/api/admin/hoa-don/${activeKey}/payment-history`
// // // //       );
// // // //       setPaymentHistory(response.data);
// // // //     } catch (error) {
// // // //       console.error("Error fetching payment history:", error);
// // // //     } finally {
// // // //       setLoadingPayments(false);
// // // //     }
// // // //   };

// // // //   // Update fetchProducts to match InvoiceDetail format
// // // //   const fetchProducts = async () => {
// // // //     try {
// // // //       const response = await api.get("/api/admin/hoa-don/san-pham/all");
// // // //       const productsData = response.data;

// // // //       // Lấy hình ảnh từ API
// // // //       const productsWithImages = await Promise.all(
// // // //         productsData.map(async (product) => {
// // // //           try {
// // // //             const imgResponse = await api.get(
// // // //               `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// // // //             );

// // // //             // Ensure imageUrls is always an array
// // // //             const imageUrls = Array.isArray(imgResponse.data)
// // // //               ? imgResponse.data.map((img) => img.anhUrl)
// // // //               : [];

// // // //             return {
// // // //               ...product,
// // // //               // Store full array of image URLs instead of just first one
// // // //               hinhAnh: imageUrls,
// // // //             };
// // // //           } catch (error) {
// // // //             console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
// // // //             return { ...product, hinhAnh: [] }; // Return empty array if error
// // // //           }
// // // //         })
// // // //       );

// // // //       setProducts(productsWithImages);
// // // //     } catch (error) {
// // // //       message.error("Lỗi khi tải danh sách sản phẩm");
// // // //     }
// // // //   };

// // // //   // Add useEffect to load products
// // // //   useEffect(() => {
// // // //     fetchProducts();
// // // //   }, []);

// // // //   const fetchInvoiceProducts = async (hoaDonId, skipUIUpdate = false) => {
// // // //     try {
// // // //       console.log(`📢 Fetching products for invoice: ${hoaDonId}`);

// // // //       // Sử dụng debounce để tránh gọi API quá nhiều lần
// // // //       if (fetchInvoiceProducts.timer) {
// // // //         clearTimeout(fetchInvoiceProducts.timer);
// // // //       }

// // // //       return new Promise((resolve) => {
// // // //         fetchInvoiceProducts.timer = setTimeout(async () => {
// // // //           try {
// // // //             const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/san-pham`);
// // // //             let products = response.data || [];

// // // //             // Tối ưu: Chỉ lấy hình ảnh cho sản phẩm chưa có
// // // //             const productsWithImages = await Promise.all(
// // // //               products.map(async (product) => {
// // // //                 if (product.hinhAnh && product.hinhAnh.length > 0) {
// // // //                   return product;
// // // //                 }

// // // //                 try {
// // // //                   // Sử dụng cache để lưu hình ảnh
// // // //                   const cacheKey = `product_image_${product.id}`;
// // // //                   let cachedImages = sessionStorage.getItem(cacheKey);
                  
// // // //                   if (cachedImages) {
// // // //                     return {
// // // //                       ...product,
// // // //                       hinhAnh: JSON.parse(cachedImages)
// // // //                     };
// // // //                   }
                  
// // // //                   const imgResponse = await api.get(
// // // //                     `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// // // //                   );
                  
// // // //                   const imageUrls = imgResponse.data && imgResponse.data.length > 0
// // // //                     ? imgResponse.data.map((img) => img.anhUrl)
// // // //                     : [];
                    
// // // //                   // Lưu vào cache
// // // //                   sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));
                  
// // // //                   return {
// // // //                     ...product,
// // // //                     hinhAnh: imageUrls
// // // //                   };
// // // //                 } catch (error) {
// // // //                   console.error(`❌ Lỗi khi lấy ảnh sản phẩm ${product.id}:`, error);
// // // //                   return { ...product, hinhAnh: [] };
// // // //                 }
// // // //               })
// // // //             );

// // // //             // Chỉ cập nhật UI nếu không phải đang khởi tạo
// // // //             if (!skipUIUpdate) {
// // // //               // Cập nhật state ngay lập tức
// // // //               setOrderProducts((prev) => ({
// // // //                 ...prev,
// // // //                 [hoaDonId]: productsWithImages,
// // // //               }));

// // // //               // Lấy thông tin hóa đơn hiện tại
// // // //               const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //               if (order) {
// // // //                 // Tính toán lại tổng tiền
// // // //                 const newTotals = calculateOrderTotals(hoaDonId);
                
// // // //                 setTotals((prev) => ({
// // // //                   ...prev,
// // // //                   [hoaDonId]: newTotals,
// // // //                 }));
                
// // // //                 // Cập nhật UI với tổng tiền mới
// // // //                 if (hoaDonId === activeKey) {
// // // //                   setTotalBeforeDiscount(newTotals.subtotal);
// // // //                   setTotalAmount(newTotals.finalTotal);
// // // //                 }
// // // //               }
// // // //             } else {
// // // //               // Nếu đang khởi tạo, chỉ cập nhật orderProducts
// // // //               setOrderProducts((prev) => ({
// // // //                 ...prev,
// // // //                 [hoaDonId]: productsWithImages,
// // // //               }));
// // // //             }

// // // //             resolve(productsWithImages);
// // // //           } catch (error) {
// // // //             console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// // // //             resolve([]);
// // // //           }
// // // //         }, skipUIUpdate ? 0 : 300); // Không debounce khi đang khởi tạo
// // // //       });
// // // //     } catch (error) {
// // // //       console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// // // //       message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
// // // //       return [];
// // // //     }
// // // //   };

// // // //   // Convert tabs to items format
// // // //   const items = tabs.map((tab) => ({
// // // //     key: tab.key,
// // // //     label: (
// // // //       <span>
// // // //         {tab.title}
// // // //         {orderProducts[tab.key]?.length > 0 && (
// // // //           <sup
// // // //             style={{
// // // //               marginLeft: "4px",
// // // //               color: "#ff4d4f",
// // // //               fontWeight: "bold",
// // // //             }}
// // // //           >
// // // //             ({orderProducts[tab.key].length})
// // // //           </sup>
// // // //         )}
// // // //       </span>
// // // //     ),
// // // //     children: renderOrderContent(tab.order),
// // // //   }));

// // // //   // Add this function to handle tab editing (adding/removing)
// // // //   const handleEditTab = (targetKey, action) => {
// // // //     if (action === "add") {
// // // //       addTab();
// // // //     } else if (action === "remove") {
// // // //       Modal.confirm({
// // // //         title: "Xác nhận hủy đơn hàng",
// // // //         content: "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm sẽ được hoàn lại kho.",
// // // //         okText: "Hủy đơn",
// // // //         cancelText: "Đóng",
// // // //         okButtonProps: { danger: true },
// // // //         onOk: async () => {
// // // //           try {
// // // //             // Gọi API hủy hóa đơn, đảm bảo sản phẩm được hoàn lại kho
// // // //             await api.delete(`/api/admin/hoa-don/${targetKey}`);
  
// // // //             // Xóa tab khỏi giao diện
// // // //             setTabs((prev) => prev.filter((tab) => tab.key !== targetKey));
  
// // // //             // Xóa sản phẩm liên quan đến đơn hàng bị hủy
// // // //             setOrderProducts((prev) => {
// // // //               const newProducts = { ...prev };
// // // //               delete newProducts[targetKey];
// // // //               return newProducts;
// // // //             });
  
// // // //             // Nếu tab hiện tại bị xóa, chuyển sang tab đầu tiên còn lại
// // // //             if (activeKey === targetKey) {
// // // //               const newActiveKey = tabs.find((tab) => tab.key !== targetKey)?.key;
// // // //               setActiveKey(newActiveKey);
// // // //             }
  
// // // //             message.success("Đã hủy đơn hàng và hoàn lại sản phẩm vào kho.");
// // // //           } catch (error) {
// // // //             console.error("Lỗi khi hủy đơn hàng:", error);
// // // //             message.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng.");
// // // //           }
// // // //         },
// // // //       });
// // // //     }
// // // //   };
  

// // // //   // Add function to calculate and update all totals
// // // //   const updateAllTotals = (products, order) => {
// // // //     // Calculate total before discount
// // // //     const subtotal = calculateTotalBeforeDiscount(products);

// // // //     // Calculate shipping fee
// // // //     const shippingFee = order.phiVanChuyen || 0;

// // // //     // Calculate total before applying voucher
// // // //     const totalBeforeVoucher = subtotal + shippingFee;

// // // //     // Calculate discount amount if voucher exists
// // // //     const discountAmount = order.phieuGiamGia
// // // //       ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// // // //       : 0;

// // // //     // Calculate final total
// // // //     const finalTotal = totalBeforeVoucher - discountAmount;

// // // //     // Update all state values
// // // //     setTotalBeforeDiscount(subtotal);
// // // //     setTotalAmount(totalBeforeVoucher);

// // // //     // Update the order in tabs with new totals
// // // //     setTabs((prev) =>
// // // //       prev.map((tab) => {
// // // //         if (tab.key === order.id) {
// // // //           return {
// // // //             ...tab,
// // // //             order: {
// // // //               ...tab.order,
// // // //               tongTien: totalBeforeVoucher,
// // // //               giamGia: discountAmount,
// // // //               tongThanhToan: finalTotal,
// // // //             },
// // // //           };
// // // //         }
// // // //         return tab;
// // // //       })
// // // //     );
// // // //   };

// // // //   // Add function to calculate all totals for an order
// // // //   const calculateOrderTotals = (hoaDonId) => {
// // // //     console.log('Calculating totals for order:', hoaDonId);
// // // //     const products = orderProducts[hoaDonId] || [];
// // // //     const order = tabs.find((tab) => tab.key === hoaDonId)?.order;

// // // //     if (!order) {
// // // //       console.warn('No order found for totals calculation');
// // // //       return {
// // // //         subtotal: 0,
// // // //         shippingFee: 0,
// // // //         totalBeforeVoucher: 0,
// // // //         discountAmount: 0,
// // // //         finalTotal: 0,
// // // //       };
// // // //     }

// // // //     const subtotal = calculateTotalBeforeDiscount(products);
// // // //     const shippingFee = order.phiVanChuyen || 0;
// // // //     const totalBeforeVoucher = subtotal + shippingFee;

// // // //     // Tính toán giảm giá dựa trên voucher
// // // //     let discountAmount = 0;
// // // //     if (order.phieuGiamGia) {
// // // //       // Sử dụng hàm helper để tính giảm giá chính xác
// // // //       discountAmount = calculateDiscountAmount(
// // // //         order.phieuGiamGia,
// // // //         totalBeforeVoucher
// // // //       );
      
// // // //       console.log('Tính toán giảm giá:', {
// // // //         voucher: order.phieuGiamGia.maPhieuGiamGia,
// // // //         voucherType: order.phieuGiamGia.loaiPhieuGiamGia,
// // // //         value: order.phieuGiamGia.giaTriGiam,
// // // //         totalBeforeVoucher,
// // // //         calculatedDiscount: discountAmount
// // // //       });
// // // //     }

// // // //     const finalTotal = totalBeforeVoucher - discountAmount;

// // // //     return {
// // // //       subtotal,
// // // //       shippingFee,
// // // //       totalBeforeVoucher,
// // // //       discountAmount,
// // // //       finalTotal,
// // // //     };
// // // //   };

// // // //   // Update the autoApplyBestVoucher function
// // // //   const autoApplyBestVoucher = async (hoaDonId) => {
// // // //     try {
// // // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // // //       if (!order) return;

// // // //       // Lấy danh sách sản phẩm của đơn hàng
// // // //       const currentProducts = orderProducts[hoaDonId] || [];
// // // //       const totalBeforeVoucher =
// // // //         calculateTotalBeforeDiscount(currentProducts) +
// // // //         (order.phiVanChuyen || 0);

// // // //       if (totalBeforeVoucher <= 0) {
// // // //         message.info("Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá.");
// // // //         return;
// // // //       }

// // // //       // Gọi API lấy danh sách voucher hợp lệ
// // // //       const response = await api.get(
// // // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`
// // // //       );
// // // //       const availableVouchers = response.data || [];

// // // //       if (!availableVouchers.length) {
// // // //         message.info("Không có mã giảm giá phù hợp.");
// // // //         return;
// // // //       }

// // // //       // 🔍 Tìm voucher giảm giá cao nhất
// // // //       const bestVoucher = availableVouchers.reduce((best, current) => {
// // // //         if (totalBeforeVoucher < current.giaTriToiThieu) return best;

// // // //         const currentDiscount = calculateDiscountAmount(
// // // //           current,
// // // //           totalBeforeVoucher
// // // //         );
// // // //         const bestDiscount = best
// // // //           ? calculateDiscountAmount(best, totalBeforeVoucher)
// // // //           : 0;

// // // //         return currentDiscount > bestDiscount ? current : best;
// // // //       }, null);

// // // //       if (!bestVoucher) {
// // // //         message.info("Không tìm thấy phiếu giảm giá tốt hơn.");
// // // //         return;
// // // //       }

// // // //       // 🔍 Tính toán số tiền giảm giá
// // // //       const newDiscount = calculateDiscountAmount(
// // // //         bestVoucher,
// // // //         totalBeforeVoucher
// // // //       );
// // // //       const currentDiscount = order.phieuGiamGia
// // // //         ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// // // //         : 0;

// // // //       if (newDiscount <= currentDiscount) {
// // // //         message.info("Mã giảm giá hiện tại đã là tốt nhất.");
// // // //         return;
// // // //       }

// // // //       // 🔄 Gọi API để áp dụng phiếu giảm giá mới
// // // //       await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // // //         voucherId: bestVoucher.id,
// // // //       });

// // // //       // 🔹 Cập nhật `order` mới trong `tabs`
// // // //       const updatedOrder = {
// // // //         ...order,
// // // //         phieuGiamGia: bestVoucher,
// // // //         giamGia: newDiscount,
// // // //         tongThanhToan: totalBeforeVoucher - newDiscount,
// // // //       };

// // // //       setTabs((prev) =>
// // // //         prev.map((tab) =>
// // // //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //         )
// // // //       );

// // // //       // 🔹 Cập nhật tổng tiền trong `totals`
// // // //       const newTotals = {
// // // //         subtotal: calculateTotalBeforeDiscount(currentProducts),
// // // //         shippingFee: order.phiVanChuyen || 0,
// // // //         totalBeforeVoucher,
// // // //         discountAmount: newDiscount,
// // // //         finalTotal: totalBeforeVoucher - newDiscount,
// // // //       };

// // // //       setTotals((prev) => ({
// // // //         ...prev,
// // // //         [hoaDonId]: newTotals,
// // // //       }));

// // // //       message.success(
// // // //         `Đã áp dụng mã giảm giá tốt nhất: ${bestVoucher.maPhieuGiamGia}`
// // // //       );

// // // //       // 🔄 Làm mới danh sách sản phẩm để đồng bộ dữ liệu
// // // //       await fetchInvoiceProducts(hoaDonId);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi tự động áp dụng voucher:", error);
// // // //       message.error("Không thể áp dụng mã giảm giá tự động.");
// // // //     }
// // // //   };

// // // //   const renderPaymentSection = (order) => {
// // // //     const orderTotals = totals[order.id] || calculateOrderTotals(order.id);
// // // //     if (!orderTotals) return null;

// // // //     const { change, remaining } = calculateChange(order.id);

// // // //     return (
// // // //       <div style={{ maxWidth: 400, marginLeft: "auto" }}>
// // // //         <Space direction="vertical" size="middle" style={{ width: "100%" }}>
// // // //           {/* New payment input section */}
// // // //           <Divider style={{ margin: "12px 0" }} />
// // // //           <Row justify="space-between" align="middle">
// // // //             <Col span={10}>
// // // //               <Text>Tiền khách đưa:</Text>
// // // //             </Col>
// // // //             <Col span={14}>
// // // //               <InputNumber
// // // //                 style={{ width: "100%" }}
// // // //                 value={customerPayment[order.id] || 0}
// // // //                 onChange={(value) => {
// // // //                   setCustomerPayment((prev) => ({
// // // //                     ...prev,
// // // //                     [order.id]: value || 0,
// // // //                   }));
// // // //                 }}
// // // //                 formatter={(value) =>
// // // //                   `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// // // //                 }
// // // //                 parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // // //                 min={0}
// // // //                 step={1000}
// // // //               />
// // // //             </Col>
// // // //           </Row>

// // // //           {/* Display change or remaining amount */}
// // // //           {change > 0 && (
// // // //             <Row justify="space-between">
// // // //               <Col>
// // // //                 <Text strong style={{ color: "#52c41a" }}>
// // // //                   Tiền thừa:
// // // //                 </Text>
// // // //               </Col>
// // // //               <Col>
// // // //                 <Text strong style={{ color: "#52c41a" }}>
// // // //                   {formatCurrency(change)}
// // // //                 </Text>
// // // //               </Col>
// // // //             </Row>
// // // //           )}
// // // //           {remaining > 0 && (
// // // //             <Row justify="space-between">
// // // //               <Col>
// // // //                 <Text strong style={{ color: "#ff4d4f" }}>
// // // //                   Còn thiếu:
// // // //                 </Text>
// // // //               </Col>
// // // //               <Col>
// // // //                 <Text strong style={{ color: "#ff4d4f" }}>
// // // //                   {formatCurrency(remaining)}
// // // //                 </Text>
// // // //               </Col>
// // // //             </Row>
// // // //           )}
// // // //         </Space>
// // // //       </div>
// // // //     );
// // // //   };

// // // //   // Update useEffect for tab changes to ensure totals are calculated
// // // //   useEffect(() => {
// // // //     if (activeKey) {
// // // //       setPagination({ current: 1, pageSize: 3 });
// // // //       fetchInvoiceProducts(activeKey).then(() => {
// // // //         setTimeout(() => {
// // // //           const newTotals = calculateOrderTotals(activeKey);
// // // //           setTotals((prev) => ({
// // // //             ...prev,
// // // //             [activeKey]: newTotals,
// // // //           }));
// // // //           findBestVoucherAndSuggest(activeKey); // Add this line
// // // //         }, 300); // Đợi API trả dữ liệu rồi cập nhật
// // // //       });
// // // //     }
// // // //   }, [activeKey]);

// // // //   // Add new function to find best voucher
// // // //   const findBestVoucher = async (hoaDonId, totalAmount) => {
// // // //     try {
// // // //       const response = await api.get(
// // // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalAmount}`
// // // //       );
// // // //       const availableVouchers = response.data;

// // // //       if (!availableVouchers || availableVouchers.length === 0) return null;

// // // //       // 1️⃣ Lọc danh sách voucher hợp lệ (đơn hàng đạt điều kiện tối thiểu)
// // // //       const validVouchers = availableVouchers.filter(
// // // //         (voucher) => totalAmount >= voucher.giaTriToiThieu
// // // //       );

// // // //       if (validVouchers.length === 0) return null;

// // // //       // 2️⃣ Tìm voucher có mức giảm giá cao nhất
// // // //       return validVouchers.reduce((best, current) => {
// // // //         const currentDiscount = calculateDiscountAmount(current, totalAmount);
// // // //         const bestDiscount = best
// // // //           ? calculateDiscountAmount(best, totalAmount)
// // // //           : 0;
// // // //         return currentDiscount > bestDiscount ? current : best;
// // // //       }, null);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi tìm mã giảm giá tốt nhất:", error);
// // // //       return null;
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     const fetchPaymentMethods = async () => {
// // // //       setPaymentMethodsLoading(true);
// // // //       try {
// // // //         const response = await api.get("/api/phuong-thuc-thanh-toan");
// // // //         setPaymentMethods(response.data);
// // // //       } catch (error) {
// // // //         message.error("Lỗi khi tải phương thức thanh toán");
// // // //       } finally {
// // // //         setPaymentMethodsLoading(false);
// // // //       }
// // // //     };

// // // //     fetchPaymentMethods();
// // // //   }, []);

// // // //   const PreviewModal = () => (
// // // //     <AntdModal
// // // //       open={previewOpen}
// // // //       onCancel={() => {
// // // //         setPreviewOpen(false);
// // // //         if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
// // // //         setPdfUrl(null);
// // // //       }}
// // // //       width="80%"
// // // //       footer={[
// // // //         <Button key="print" type="primary" onClick={handleDirectPrint}>
// // // //           In hóa đơn
// // // //         </Button>,
// // // //       ]}
// // // //     >
// // // //       <iframe
// // // //         id="pdf-preview"
// // // //         src={pdfUrl}
// // // //         width="100%"
// // // //         height="600px"
// // // //         style={{ border: "none" }}
// // // //         title="PDF Preview"
// // // //       />
// // // //     </AntdModal>
// // // //   );

// // // //   // Thêm useEffect mới để gọi findBestVoucherAndSuggest
// // // //   useEffect(() => {
// // // //     if (activeKey && orderProducts[activeKey]) {
// // // //       console.log('Triggering voucher suggestions...');
// // // //       findBestVoucherAndSuggest(activeKey);
// // // //     }
// // // //   }, [activeKey, orderProducts[activeKey]]); // Thêm dependency

// // // //   // Thêm hàm fetchInvoiceById để cập nhật thông tin hóa đơn
// // // //   const fetchInvoiceById = async (hoaDonId) => {
// // // //     try {
// // // //       console.log('Fetching invoice details for:', hoaDonId);
// // // //       const response = await api.get(`/api/admin/ban-hang/${hoaDonId}`);
      
// // // //       if (response.data) {
// // // //         // Cập nhật thông tin hóa đơn trong tabs
// // // //         setTabs(prevTabs => 
// // // //           prevTabs.map(tab => {
// // // //             if (tab.key === hoaDonId) {
// // // //               return {
// // // //                 ...tab,
// // // //                 order: response.data
// // // //               };
// // // //             }
// // // //             return tab;
// // // //           })
// // // //         );
        
// // // //         // Cập nhật lại danh sách sản phẩm
// // // //         await fetchInvoiceProducts(hoaDonId);
        
// // // //         // Tính toán lại tổng tiền
// // // //         updateOrderTotals(hoaDonId);
        
// // // //         return response.data;
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Error fetching invoice:', error);
// // // //       message.error('Lỗi khi lấy thông tin hóa đơn');
// // // //     }
// // // //   };

// // // //   // Thêm hàm findSuggestedProducts để tìm sản phẩm gợi ý
// // // //   const findSuggestedProducts = async (currentProducts, amountNeeded) => {
// // // //     try {
// // // //       // Lấy danh sách sản phẩm nếu chưa có
// // // //       let productList = products;
// // // //       if (productList.length === 0) {
// // // //         const response = await api.get('/api/admin/san-pham');
// // // //         productList = response.data || [];
// // // //       }
      
// // // //       const currentProductIds = currentProducts.map(p => p.id);
      
// // // //       // Tìm sản phẩm có giá phù hợp với số tiền cần thêm
// // // //       const minPrice = amountNeeded * 0.7;  // 70% của số tiền cần thêm
// // // //       const maxPrice = amountNeeded * 1.5;  // 150% của số tiền cần thêm
      
// // // //       const suggestedProducts = productList
// // // //         .filter(p => !currentProductIds.includes(p.id)) // Loại bỏ sản phẩm đã có
// // // //         .filter(p => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0) // Lọc theo giá và tồn kho
// // // //         .sort((a, b) => Math.abs(a.gia - amountNeeded) - Math.abs(b.gia - amountNeeded)) // Sắp xếp theo giá gần nhất
// // // //         .slice(0, 3);
        
// // // //       return suggestedProducts;
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi tìm sản phẩm gợi ý:', error);
// // // //       return [];
// // // //     }
// // // //   };

// // // //   // Thêm hàm updateOrderTotals để cập nhật tổng tiền đơn hàng
// // // //   const updateOrderTotals = (hoaDonId) => {
// // // //     const calculatedTotals = calculateOrderTotals(hoaDonId);
// // // //     if (calculatedTotals) {
// // // //       setTotals(prev => ({
// // // //         ...prev,
// // // //         [hoaDonId]: calculatedTotals
// // // //       }));
      
// // // //       // Cập nhật tổng tiền trong order
// // // //       setTabs(prev => 
// // // //         prev.map(tab => {
// // // //           if (tab.key === hoaDonId) {
// // // //             return {
// // // //               ...tab,
// // // //               order: {
// // // //                 ...tab.order,
// // // //                 tongTien: calculatedTotals.totalBeforeVoucher,
// // // //                 giamGia: calculatedTotals.discountAmount,
// // // //                 tongThanhToan: calculatedTotals.finalTotal
// // // //               }
// // // //             };
// // // //           }
// // // //           return tab;
// // // //         })
// // // //       );
// // // //     }
// // // //   };

// // // //   // Thêm hàm để lấy tất cả sản phẩm từ server
// // // //   const fetchAllProducts = async () => {
// // // //     try {
// // // //       const response = await api.get('/api/admin/san-pham');
// // // //       return response.data || [];
// // // //     } catch (error) {
// // // //       console.error('Lỗi khi lấy danh sách sản phẩm:', error);
// // // //       return [];
// // // //     }
// // // //   };

// // // //   // Thêm hàm mới để xử lý việc áp dụng voucher
// // // //   const applyVoucherToOrder = async (hoaDonId, voucherId) => {
// // // //     try {
// // // //       // Gọi API để áp dụng voucher
// // // //       const response = await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // // //         voucherId: voucherId,
// // // //       });

// // // //       if (response.data) {
// // // //         const updatedOrder = response.data;
        
// // // //         // Cập nhật order trong tabs
// // // //         setTabs((prev) =>
// // // //           prev.map((tab) =>
// // // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //           )
// // // //         );
        
// // // //         // Lấy thông tin sản phẩm hiện tại
// // // //         const products = orderProducts[hoaDonId] || [];
        
// // // //         // Tính toán lại tổng tiền
// // // //         const subtotal = calculateTotalBeforeDiscount(products);
// // // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // // //         const totalBeforeVoucher = subtotal + shippingFee;
        
// // // //         // Tính toán giảm giá
// // // //         let discountAmount = 0;
// // // //         if (updatedOrder.phieuGiamGia) {
// // // //           discountAmount = calculateDiscountAmount(
// // // //             updatedOrder.phieuGiamGia,
// // // //             totalBeforeVoucher
// // // //           );
// // // //         }
        
// // // //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// // // //         // Cập nhật totals
// // // //         const newTotals = {
// // // //           subtotal,
// // // //           shippingFee,
// // // //           totalBeforeVoucher,
// // // //           discountAmount,
// // // //           finalTotal,
// // // //         };
        
// // // //         setTotals((prev) => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals,
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(subtotal);
// // // //           setTotalAmount(finalTotal);
// // // //         }
        
// // // //         return true;
// // // //       }
// // // //       return false;
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi áp dụng voucher:", error);
// // // //       message.error("Lỗi khi áp dụng voucher");
// // // //       return false;
// // // //     }
// // // //   };

// // // //   // Thêm hàm mới để tải lại thông tin hóa đơn từ server
// // // //   const refreshInvoiceData = async (hoaDonId) => {
// // // //     try {
// // // //       console.log('🔄 Refreshing invoice data for:', hoaDonId);
      
// // // //       // Kiểm tra xem hoaDonId có hợp lệ không
// // // //       if (!hoaDonId) {
// // // //         console.warn('Không có hoaDonId hợp lệ để tải dữ liệu');
// // // //         return null;
// // // //       }
      
// // // //       // Gọi API để lấy thông tin hóa đơn mới nhất
// // // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);
      
// // // //       if (response.data) {
// // // //         const updatedOrder = response.data;
        
// // // //         // Ghi log thông tin hóa đơn để debug
// // // //         console.log('Thông tin hóa đơn từ server:', {
// // // //           id: updatedOrder.id,
// // // //           maHoaDon: updatedOrder.maHoaDon,
// // // //           tongTien: updatedOrder.tongTien,
// // // //           giamGia: updatedOrder.giamGia,
// // // //           tongThanhToan: updatedOrder.tongThanhToan,
// // // //           phieuGiamGia: updatedOrder.phieuGiamGia
// // // //         });
        
// // // //         // Cập nhật order trong tabs
// // // //         setTabs((prev) =>
// // // //           prev.map((tab) =>
// // // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //           )
// // // //         );
        
// // // //         // Tải lại sản phẩm
// // // //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// // // //         // Tính toán lại tổng tiền
// // // //         const newTotals = calculateOrderTotals(hoaDonId);
        
// // // //         console.log('Tổng tiền sau khi tính toán:', newTotals);
        
// // // //         setTotals((prev) => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals,
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(newTotals.subtotal);
// // // //           setTotalAmount(newTotals.finalTotal);
// // // //         }
        
// // // //         return { updatedOrder, products, newTotals };
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('❌ Lỗi khi tải lại thông tin hóa đơn:', error);
// // // //       // Không hiển thị thông báo lỗi để tránh làm phiền người dùng
// // // //       // Thay vào đó, sử dụng dữ liệu hiện có
      
// // // //       // Lấy thông tin hóa đơn hiện tại từ tabs
// // // //       const currentOrder = tabs.find(tab => tab.key === hoaDonId)?.order;
// // // //       if (currentOrder) {
// // // //         // Tải lại sản phẩm
// // // //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// // // //         // Tính toán lại tổng tiền dựa trên dữ liệu hiện có
// // // //         const subtotal = calculateTotalBeforeDiscount(products);
// // // //         const shippingFee = currentOrder.phiVanChuyen || 0;
// // // //         const totalBeforeVoucher = subtotal + shippingFee;
// // // //         const discountAmount = currentOrder.giamGia || 0;
// // // //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// // // //         // Cập nhật totals
// // // //         const newTotals = {
// // // //           subtotal,
// // // //           shippingFee,
// // // //           totalBeforeVoucher,
// // // //           discountAmount,
// // // //           finalTotal,
// // // //         };
        
// // // //         setTotals((prev) => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals,
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(subtotal);
// // // //           setTotalAmount(finalTotal);
// // // //         }
        
// // // //         return { updatedOrder: currentOrder, products, newTotals };
// // // //       }
// // // //     }
    
// // // //     return null;
// // // //   };

// // // //   // Sửa hàm handleApplyBestVoucher để xử lý lỗi khi áp dụng voucher gợi ý
// // // //   const handleApplyBestVoucher = async (hoaDonId, voucherId) => {
// // // //     try {
// // // //       console.log('Áp dụng voucher gợi ý:', { hoaDonId, voucherId });
      
// // // //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// // // //       if (!hoaDonId || !voucherId) {
// // // //         console.error('hoaDonId hoặc voucherId không hợp lệ');
// // // //         message.error('Không thể áp dụng voucher');
// // // //         return false;
// // // //       }
      
// // // //       // Gọi API để áp dụng voucher
// // // //       const response = await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // // //         voucherId: voucherId,
// // // //       });

// // // //       if (response.data) {
// // // //         message.success("Áp dụng voucher thành công");
        
// // // //         // Cập nhật thông tin hóa đơn từ response
// // // //         const updatedOrder = response.data;
        
// // // //         // Cập nhật order trong tabs
// // // //         setTabs(prev =>
// // // //           prev.map(tab =>
// // // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // // //           )
// // // //         );
        
// // // //         // Tải lại sản phẩm
// // // //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// // // //         // Tính toán lại tổng tiền
// // // //         const subtotal = calculateTotalBeforeDiscount(products);
// // // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // // //         const totalBeforeVoucher = subtotal + shippingFee;
        
// // // //         // Tính toán giảm giá dựa trên voucher
// // // //         let discountAmount = 0;
// // // //         if (updatedOrder.phieuGiamGia) {
// // // //           discountAmount = calculateDiscountAmount(
// // // //             updatedOrder.phieuGiamGia,
// // // //             totalBeforeVoucher
// // // //           );
// // // //         }
        
// // // //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// // // //         // Cập nhật totals
// // // //         const newTotals = {
// // // //           subtotal,
// // // //           shippingFee,
// // // //           totalBeforeVoucher,
// // // //           discountAmount,
// // // //           finalTotal,
// // // //         };
        
// // // //         setTotals(prev => ({
// // // //           ...prev,
// // // //           [hoaDonId]: newTotals
// // // //         }));
        
// // // //         // Cập nhật UI nếu đang ở tab này
// // // //         if (hoaDonId === activeKey) {
// // // //           setTotalBeforeDiscount(subtotal);
// // // //           setTotalAmount(finalTotal);
// // // //         }
        
// // // //         // Đóng gợi ý voucher
// // // //         setVoucherSuggestions({
// // // //           show: false,
// // // //           betterVouchers: []
// // // //         });
        
// // // //         return true;
// // // //       }
// // // //       return false;
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi áp dụng voucher gợi ý:", error);
// // // //       message.error("Lỗi khi áp dụng voucher");
// // // //       return false;
// // // //     }
// // // //   };

// // // //   return (
// // // //     <Layout
// // // //       style={{ height: "100vh", boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)" }}
// // // //     >
// // // //       <Sider
// // // //         width="100%"
// // // //         style={{
// // // //           background: "#fff",
// // // //           padding: 20,
// // // //           position: "relative",
// // // //           height: "100%",
// // // //           overflowY: "hidden", // Ngăn scroll toàn bộ Sider
// // // //         }}
// // // //       >
// // // //         {/* Dòng chứa Nút "Tạo hóa đơn" */}
// // // //         <Row style={{ marginBottom: 16 }}>
// // // //           <Col span={20}>
// // // //             <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
// // // //               Quản lý bán hàng
// // // //             </Text>
// // // //           </Col>
// // // //           <Col span={4}>
// // // //             <Button
// // // //               onClick={addTab}
// // // //               type="primary"
// // // //               style={{
// // // //                 zIndex: 1,
// // // //               }}
// // // //             >
// // // //               <IoIosAddCircle />
// // // //               Tạo đơn hàng mới
// // // //             </Button>
// // // //           </Col>
// // // //         </Row>

// // // //         {/* Khi không có hóa đơn nào, hiển thị thông báo */}
// // // //         {tabs.length === 0 ? (
// // // //           <Row justify="center" align="middle" style={{ height: "calc(100% - 60px)" }}>
// // // //             <Col>
// // // //               <Title level={3}>
// // // //                 Không có hóa đơn ở trạng thái chờ xác nhận
// // // //               </Title>
// // // //             </Col>
// // // //           </Row>
// // // //         ) : (
// // // //           <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
// // // //             <Tabs
// // // //               type="editable-card"
// // // //               onChange={setActiveKey}
// // // //               activeKey={activeKey}
// // // //               onEdit={handleEditTab}
// // // //               items={items}
// // // //             />
// // // //           </div>
// // // //         )}
// // // //       </Sider>
// // // //       <Content
// // // //         style={{
// // // //           padding: 24,
// // // //           height: "100%",
// // // //           overflow: "hidden",
// // // //         }}
// // // //       />

// // // //       {/* Customer Selection Dialog */}
// // // //       <Modal
// // // //         title="Chọn khách hàng"
// // // //         visible={openCustomerDialog}
// // // //         onCancel={() => setOpenCustomerDialog(false)}
// // // //         footer={null}
// // // //       >
// // // //         <List
// // // //           dataSource={customers}
// // // //           renderItem={(customer) => (
// // // //             <List.Item
// // // //               actions={[
// // // //                 <Button
// // // //                   type="primary"
// // // //                   onClick={() => handleCustomerSelected(activeKey, customer.id)}
// // // //                 >
// // // //                   Chọn
// // // //                 </Button>,
// // // //               ]}
// // // //             >
// // // //               <List.Item.Meta
// // // //                 avatar={<Avatar src={customer.avatar} />}
// // // //                 title={customer.tenKhachHang}
// // // //                 description={
// // // //                   <>
// // // //                     {customer.soDienThoai}
// // // //                     <br />
// // // //                     {customer.email}
// // // //                   </>
// // // //                 }
// // // //               />
// // // //             </List.Item>
// // // //           )}
// // // //         />
// // // //       </Modal>

// // // //       {/* Voucher Selection Dialog */}
// // // //       <Modal
// // // //         title="Chọn voucher"
// // // //         open={openVoucherDialog}
// // // //         onCancel={() => setOpenVoucherDialog(false)}
// // // //         footer={null}
// // // //         ref={modalRef}
// // // //       >
// // // //         <List
// // // //           dataSource={vouchers}
// // // //           renderItem={(voucher) => (
// // // //             <List.Item
// // // //               style={{
// // // //                 border:
// // // //                   selectedVoucher?.id === voucher.id
// // // //                     ? "2px solid #1890ff"
// // // //                     : "1px solid #d9d9d9",
// // // //                 borderRadius: "8px",
// // // //                 padding: "16px",
// // // //                 marginBottom: "8px",
// // // //                 backgroundColor:
// // // //                   selectedVoucher?.id === voucher.id ? "#f0f5ff" : "white",
// // // //               }}
// // // //               actions={[
// // // //                 <Radio
// // // //                   checked={selectedVoucher?.id === voucher.id}
// // // //                   onChange={() => setSelectedVoucher(voucher)}
// // // //                 />,
// // // //               ]}
// // // //             >
// // // //               <List.Item.Meta
// // // //                 title={voucher.maPhieuGiamGia}
// // // //                 description={
// // // //                   <div>
// // // //                     <div>
// // // //                       {voucher.loaiPhieuGiamGia === 1
// // // //                         ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
// // // //                             voucher.soTienGiamToiDa
// // // //                           )})`
// // // //                         : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
// // // //                     </div>
// // // //                     <div>
// // // //                       Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
// // // //                     </div>
// // // //                   </div>
// // // //                 }
// // // //               />
// // // //             </List.Item>
// // // //           )}
// // // //         />
// // // //         <Button
// // // //           type="primary"
// // // //           block
// // // //           disabled={!selectedVoucher}
// // // //           onClick={() => handleVoucherSelected(activeKey, selectedVoucher.id)}
// // // //         >
// // // //           Áp dụng
// // // //         </Button>
// // // //       </Modal>

// // // //       {/* Add ProductTable component */}
// // // //       <ProductTable
// // // //         products={products}
// // // //         onAddProduct={handleAddProductToOrder}
// // // //         open={openProductTable}
// // // //         onClose={() => setOpenProductTable(false)}
// // // //       />

// // // //       {/* Add PreviewModal component */}
// // // //       <PreviewModal />
// // // //     </Layout>
// // // //   );
// // // // };

// // // // export default BanHang;
// // // import React, { useEffect, useState, useRef } from "react";
// // // import "./BanHangCss.css";
// // // import {
// // //   Layout,
// // //   Button,
// // //   Row,
// // //   Col,
// // //   Tabs,
// // //   Typography,
// // //   Input,
// // //   Table,
// // //   Space,
// // //   Avatar,
// // //   Radio,
// // //   InputNumber,
// // //   Modal,
// // //   Select,
// // //   List,
// // //   Tag,
// // //   Carousel,
// // //   Divider, // Add this import
// // //   Modal as AntdModal, // Add this import
// // //   Alert, // Add this import
// // //   Card, // Add this import
// // //   Collapse, // Add this import
// // // } from "antd";
// // // import {
// // //   PlusOutlined,
// // //   CloseOutlined,
// // //   SelectOutlined,
// // //   SearchOutlined,
// // //   TagOutlined, // Add this import
// // //   InfoCircleOutlined, // Add this import
// // //   DeleteOutlined,
// // //   PrinterOutlined, // Add this import
// // // } from "@ant-design/icons";
// // // import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
// // // import { BiQrScan } from "react-icons/bi";
// // // import { AiOutlineSelect } from "react-icons/ai";
// // // import { Option } from "antd/es/mentions";
// // // import axios from "axios";
// // // import { message } from "antd";
// // // import api from "../../utils/api";
// // // import { formatCurrency } from "../../utils/format";
// // // import ProductTable from "../HoaDon/ProductTable";
// // // import { Client } from "@stomp/stompjs";
// // // import SockJS from "sockjs-client";
// // // import { MenuItem, FormControl, InputLabel } from "@mui/material";
// // // const { Content, Sider } = Layout;
// // // const { TabPane } = Tabs;
// // // const { Title, Text } = Typography;

// // // // Add near the top of the file with other constants
// // // const PAYMENT_METHOD = {
// // //   CASH: "COD",
// // //   // Add other payment methods as needed
// // // };

// // // // Di chuyển các hàm helper ra ngoài component
// // // const calculateDiscountAmount = (voucher, total) => {
// // //   // Kiểm tra điều kiện áp dụng voucher
// // //   if (!voucher || !total || total < voucher.giaTriToiThieu) {
// // //     console.log("Không đủ điều kiện áp dụng voucher:", {
// // //       total,
// // //       minRequired: voucher?.giaTriToiThieu,
// // //     });
// // //     return 0;
// // //   }

// // //   let discountAmount = 0;

// // //   // Kiểm tra loại voucher
// // //   if (voucher.loaiPhieuGiamGia === 1) {
// // //     // Loại 1: Giảm theo phần trăm
// // //     // Tính số tiền giảm = tổng tiền * phần trăm giảm / 100
// // //     discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);

// // //     console.log("Tính giảm giá theo %:", {
// // //       total,
// // //       percent: voucher.giaTriGiam,
// // //       calculatedDiscount: discountAmount,
// // //       maxDiscount: voucher.soTienGiamToiDa,
// // //     });

// // //     // Nếu có giới hạn giảm tối đa và số tiền giảm vượt quá giới hạn
// // //     if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
// // //       discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
// // //       console.log("Áp dụng giới hạn tối đa:", discountAmount);
// // //     }
// // //   } else {
// // //     // Loại khác: Giảm theo số tiền cố định
// // //     discountAmount = Math.min(voucher.giaTriGiam, total);
// // //     console.log("Tính giảm giá cố định:", {
// // //       fixedAmount: voucher.giaTriGiam,
// // //       total,
// // //       finalDiscount: discountAmount,
// // //     });
// // //   }

// // //   // Đảm bảo số tiền giảm không âm và không vượt quá tổng tiền
// // //   discountAmount = Math.max(0, Math.min(discountAmount, total));

// // //   console.log("Kết quả cuối cùng:", {
// // //     voucherId: voucher.id,
// // //     voucherCode: voucher.maPhieuGiamGia,
// // //     total,
// // //     finalDiscount: discountAmount,
// // //   });

// // //   return discountAmount;
// // // };

// // // const BanHang = () => {
// // //   const socket = useRef(null);
// // //   const [isModalVisibleListSPCT, setIsModalVisibleListSPCT] = useState(false); // Trạng thái hiển thị Modal
// // //   const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
// // //   const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
// // //   const [activeTab, setActiveTab] = useState(null);
// // //   const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
// // //   const [searchText, setSearchText] = useState("");
// // //   const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
// // //   const [activeKey, setActiveKey] = useState(null); // Giữ tab đang mở
// // //   const [orderProducts, setOrderProducts] = useState({}); // Products in each order tab
// // //   const [loading, setLoading] = useState(false);
// // //   const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
// // //   const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
// // //   const [selectedVoucher, setSelectedVoucher] = useState(null);
// // //   const [vouchers, setVouchers] = useState([]);
// // //   const [customers, setCustomers] = useState([]);
// // //   const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
// // //   const [loadingPayments, setLoadingPayments] = useState(false);
// // //   const [paymentHistory, setPaymentHistory] = useState([]);
// // //   const [openProductTable, setOpenProductTable] = useState(false);
// // //   const [selectedProducts, setSelectedProducts] = useState([]);
// // //   const [modalRef] = useState(React.createRef());
// // //   const [totalAmount, setTotalAmount] = useState(0); // Add new state for total amount
// // //   const [totals, setTotals] = useState({});
// // //   const [paymentMethods, setPaymentMethods] = useState([]);
// // //   const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
// // //   const [previewOpen, setPreviewOpen] = useState(false);
// // //   const [pdfUrl, setPdfUrl] = useState(null);
// // //   const [customerPayment, setCustomerPayment] = useState({});
// // //   const [suggestedVoucher, setSuggestedVoucher] = useState(null);
// // //   const [additionalAmount, setAdditionalAmount] = useState(0);
// // //   const [suggestedProducts, setSuggestedProducts] = useState([]);
// // //   // Thêm state mới để kiểm soát việc hiển thị gợi ý
// // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // //   // Thêm state mới
// // //   const [voucherSuggestion, setVoucherSuggestion] = useState({
// // //     show: false,
// // //     voucher: null,
// // //     amountNeeded: 0,
// // //     products: [],
// // //   });
// // //   // Cập nhật state để lưu nhiều gợi ý voucher
// // //   const [voucherSuggestions, setVoucherSuggestions] = useState({
// // //     show: false,
// // //     betterVouchers: [],
// // //   });

// // //   // Add this function to calculate change/remaining amount
// // //   const calculateChange = (hoaDonId) => {
// // //     const orderTotals = totals[hoaDonId];
// // //     if (!orderTotals) return { change: 0, remaining: 0 };

// // //     const amountPaid = customerPayment[hoaDonId] || 0;
// // //     const finalTotal = orderTotals.finalTotal || 0;

// // //     if (amountPaid >= finalTotal) {
// // //       return {
// // //         change: amountPaid - finalTotal,
// // //         remaining: 0,
// // //       };
// // //     } else {
// // //       return {
// // //         change: 0,
// // //         remaining: finalTotal - amountPaid,
// // //       };
// // //     }
// // //   };

// // //   // Cấu hình cột cho bảng
// // //   const columns = [
// // //     {
// // //       title: "STT",
// // //       key: "index",
// // //       width: 60,
// // //       align: "center",
// // //       //render: (_, __, index) => index + 1,
// // //       render: (_, __, index) => {
// // //         // Tính toán lại index khi chuyển trang
// // //         return pagination.pageSize * (pagination.current - 1) + index + 1;
// // //       },
// // //     },
// // //     {
// // //       title: "Hình ảnh",
// // //       dataIndex: "hinhAnh",
// // //       key: "hinhAnh",
// // //       align: "center",
// // //       width: 180,
// // //       render: (hinhAnh) => {
// // //         return (
// // //           <div style={{ width: 150, height: 120, overflow: "hidden" }}>
// // //             {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
// // //               <Carousel autoplay dots={false} effect="fade">
// // //                 {hinhAnh.map((url, index) => (
// // //                   <img
// // //                     key={index}
// // //                     src={url}
// // //                     alt={`Sản phẩm ${index}`}
// // //                     style={{
// // //                       width: "100%",
// // //                       height: "100%",
// // //                       objectFit: "cover",
// // //                       borderRadius: 5,
// // //                       display: "block",
// // //                     }}
// // //                   />
// // //                 ))}
// // //               </Carousel>
// // //             ) : (
// // //               <img
// // //                 src="https://via.placeholder.com/50"
// // //                 alt="Không có ảnh"
// // //                 style={{
// // //                   width: "100%",
// // //                   height: "100%",
// // //                   objectFit: "cover",
// // //                   borderRadius: 5,
// // //                   display: "block",
// // //                 }}
// // //               />
// // //             )}
// // //           </div>
// // //         );
// // //       },
// // //     },
// // //     {
// // //       title: "Thông tin",
// // //       key: "thongTin",
// // //       align: "center",
// // //       width: 180,
// // //       render: (_, record) => (
// // //         <Space direction="vertical" size={0}>
// // //           <Typography.Text strong>{record.tenSanPham}</Typography.Text>
// // //           <Typography.Text type="secondary">
// // //             Mã: {record.maSanPham}
// // //           </Typography.Text>
// // //           <Typography.Text type="secondary">
// // //             Chất liệu: {record.chatLieu}
// // //           </Typography.Text>
// // //         </Space>
// // //       ),
// // //     },
// // //     {
// // //       title: "Màu sắc",
// // //       key: "mauSac",
// // //       align: "center",
// // //       width: 180,
// // //       render: (_, record) => (
// // //         <Space size="middle">
// // //           <Typography.Text>{record.mauSac}</Typography.Text>
// // //           <div
// // //             style={{
// // //               display: "inline-block",
// // //               width: 50, // Chiều rộng
// // //               height: 20, // Chiều cao
// // //               borderRadius: 6, // Bo góc mềm mại
// // //               backgroundColor: record.maMauSac || "#FFFFFF",
// // //               border: "1px solid rgba(0, 0, 0, 0.2)", // Viền tinh tế
// // //               boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Hiệu ứng bóng đổ nhẹ
// // //             }}
// // //           ></div>
// // //         </Space>
// // //       ),
// // //     },

// // //     {
// // //       title: "Kích thước",
// // //       key: "kichThuoc",
// // //       align: "center",
// // //       width: 100,
// // //       render: (_, record) => (
// // //         <Typography.Text>{record.kichThuoc}</Typography.Text>
// // //       ),
// // //     },

// // //     {
// // //       title: "Đơn giá",
// // //       key: "gia",
// // //       width: 140,
// // //       align: "center",
// // //       render: (_, record) => formatCurrency(record.gia),
// // //     },
// // //     {
// // //       title: "Số lượng",
// // //       key: "soLuong",
// // //       width: 120,
// // //       align: "center",
// // //       render: (_, record) => (
// // //         <InputNumber
// // //           min={1}
// // //           max={record.soLuongTonKho}
// // //           value={record.soLuong}
// // //           onChange={(value) =>
// // //             handleUpdateQuantity(activeKey, record.id, value)
// // //           }
// // //           style={{ width: 80 }}
// // //         />
// // //       ),
// // //     },
// // //     {
// // //       title: "Thành tiền",
// // //       key: "thanhTien",
// // //       width: 140,
// // //       align: "center",
// // //       render: (_, record) => formatCurrency(record.gia * record.soLuong),
// // //     },
// // //     {
// // //       title: "",
// // //       key: "action",
// // //       width: 80,
// // //       align: "center",
// // //       render: (_, record) => (
// // //         <Button
// // //           type="link"
// // //           danger
// // //           icon={<DeleteOutlined />}
// // //           onClick={() => handleRemoveProduct(activeKey, record.id)}
// // //         />
// // //       ),
// // //     },
// // //   ];

// // //   const handleTableChange = (pagination) => {
// // //     setPagination(pagination);
// // //     if (activeKey) {
// // //       fetchInvoiceProducts(activeKey);
// // //     }
// // //   };
// // //   // Hàm đóng modal
// // //   const handleCancelListSanPhamChiTiet = () => {
// // //     setIsModalVisibleListSPCT(false);
// // //   };
// // //   // 1. Load pending orders
// // //   const fetchPendingOrders = async (isInitializing = false) => {
// // //     try {
// // //       const response = await api.get("/api/admin/ban-hang/hoadoncho");
// // //       const orders = response.data;

// // //       if (orders.length > 0) {
// // //         // Ghi log thông tin hóa đơn để debug
// // //         console.log(
// // //           "Danh sách hóa đơn từ server:",
// // //           orders.map((order) => ({
// // //             id: order.id,
// // //             maHoaDon: order.maHoaDon,
// // //             tongTien: order.tongTien,
// // //             giamGia: order.giamGia,
// // //             tongThanhToan: order.tongThanhToan,
// // //             phieuGiamGia: order.phieuGiamGia,
// // //           }))
// // //         );

// // //         const newTabs = orders.map((order, index) => ({
// // //           key: order.id,
// // //           title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
// // //           order: order,
// // //         }));

// // //         setTabs(newTabs);

// // //         // Chỉ đặt activeKey nếu chưa có hoặc đang khởi tạo
// // //         if (!activeKey || isInitializing) {
// // //           setActiveKey(orders[0].id);
// // //         }

// // //         // Tải sản phẩm và tính toán tổng tiền cho mỗi hóa đơn
// // //         // Không gọi refreshInvoiceData để tránh lỗi API
// // //         const productsMap = {};
// // //         const totalsMap = {};

// // //         for (const order of orders) {
// // //           try {
// // //             // Tải sản phẩm
// // //             const products = await fetchInvoiceProducts(order.id, true);
// // //             productsMap[order.id] = products;

// // //             // Tính toán tổng tiền
// // //             const subtotal = calculateTotalBeforeDiscount(products);
// // //             const shippingFee = order.phiVanChuyen || 0;
// // //             const totalBeforeVoucher = subtotal + shippingFee;
// // //             const discountAmount = order.giamGia || 0;
// // //             const finalTotal = totalBeforeVoucher - discountAmount;

// // //             totalsMap[order.id] = {
// // //               subtotal,
// // //               shippingFee,
// // //               totalBeforeVoucher,
// // //               discountAmount,
// // //               finalTotal,
// // //             };
// // //           } catch (error) {
// // //             console.error(
// // //               `Lỗi khi tải dữ liệu cho hóa đơn ${order.id}:`,
// // //               error
// // //             );
// // //           }
// // //         }

// // //         // Cập nhật state
// // //         setOrderProducts(productsMap);
// // //         setTotals(totalsMap);

// // //         // Cập nhật UI cho tab hiện tại
// // //         if (activeKey && totalsMap[activeKey]) {
// // //           setTotalBeforeDiscount(totalsMap[activeKey].subtotal);
// // //           setTotalAmount(totalsMap[activeKey].finalTotal);
// // //         }

// // //         // Lưu vào localStorage
// // //         localStorage.setItem("pendingOrders", JSON.stringify(newTabs));
// // //         localStorage.setItem("orderProducts", JSON.stringify(productsMap));
// // //         localStorage.setItem("orderTotals", JSON.stringify(totalsMap));
// // //       } else {
// // //         // Nếu không có đơn hàng, xóa dữ liệu cũ
// // //         setTabs([]);
// // //         setOrderProducts({});
// // //         setTotals({});
// // //         setActiveKey(null);
// // //         setTotalBeforeDiscount(0);
// // //         setTotalAmount(0);

// // //         // Xóa localStorage
// // //         localStorage.removeItem("pendingOrders");
// // //         localStorage.removeItem("orderProducts");
// // //         localStorage.removeItem("orderTotals");
// // //       }
// // //     } catch (error) {
// // //       console.error("Lỗi khi tải danh sách hóa đơn:", error);
// // //       message.error("Lỗi khi tải danh sách hóa đơn");
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const initializeData = async () => {
// // //       try {
// // //         // Đặt cờ để tránh các cập nhật không cần thiết
// // //         const isInitializing = true;

// // //         // Tải phương thức thanh toán
// // //         const paymentResponse = await api.get("/api/phuong-thuc-thanh-toan");
// // //         setPaymentMethods(paymentResponse.data);

// // //         // Khôi phục dữ liệu từ localStorage trước
// // //         const savedOrders = localStorage.getItem("pendingOrders");
// // //         const savedProducts = localStorage.getItem("orderProducts");
// // //         const savedTotals = localStorage.getItem("orderTotals");

// // //         if (savedOrders) {
// // //           setTabs(JSON.parse(savedOrders));
// // //         }
// // //         if (savedProducts) {
// // //           setOrderProducts(JSON.parse(savedProducts));
// // //         }
// // //         if (savedTotals) {
// // //           const parsedTotals = JSON.parse(savedTotals);
// // //           setTotals(parsedTotals);

// // //           // Nếu có activeKey, cập nhật tổng tiền ngay lập tức
// // //           const firstOrderId = JSON.parse(savedOrders)?.[0]?.key;
// // //           if (firstOrderId && parsedTotals[firstOrderId]) {
// // //             setTotalBeforeDiscount(parsedTotals[firstOrderId].subtotal);
// // //             setTotalAmount(parsedTotals[firstOrderId].finalTotal);
// // //           }
// // //         }

// // //         // Sau đó mới gọi API để cập nhật dữ liệu mới nhất
// // //         await fetchPendingOrders(true); // Truyền tham số true để đánh dấu đây là lần khởi tạo
// // //       } catch (error) {
// // //         console.error("Lỗi khởi tạo dữ liệu:", error);
// // //       }
// // //     };

// // //     initializeData();

// // //     // Chỉ chạy một lần khi component mount
// // //   }, []);

// // //   // Cập nhật useEffect cho việc chọn tab để tải lại dữ liệu chính xác
// // //   useEffect(() => {
// // //     if (activeKey) {
// // //       console.log("Tab changed to:", activeKey);

// // //       // Tải lại thông tin hóa đơn từ server
// // //       fetchInvoiceById(activeKey).then(() => {
// // //         // Sau khi có dữ liệu mới, tính toán lại tổng tiền
// // //         const newTotals = calculateOrderTotals(activeKey);
// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [activeKey]: newTotals,
// // //         }));

// // //         // Cập nhật UI
// // //         setTotalBeforeDiscount(newTotals.subtotal);
// // //         setTotalAmount(newTotals.finalTotal);

// // //         // Tìm voucher tốt hơn và gợi ý
// // //         findBestVoucherAndSuggest(activeKey);
// // //       });

// // //       // Đặt lại pagination
// // //       setPagination({ current: 1, pageSize: 3 });
// // //     }
// // //   }, [activeKey]);

// // //   // Add WebSocket connection setup
// // //   useEffect(() => {
// // //     // Initialize WebSocket connection
// // //     const socket = new SockJS("http://localhost:8080/ws");
// // //     const stompClient = new Client({
// // //       webSocketFactory: () => socket,
// // //       onConnect: () => {
// // //         console.log("✅ WebSocket connected");

// // //         // Subscribe to pending orders updates
// // //         stompClient.subscribe("/topic/hoa-don-cho", (message) => {
// // //           console.log("🔄 Pending orders updated");
// // //           fetchPendingOrders();
// // //         });

// // //         // Subscribe to individual order updates
// // //         tabs.forEach((tab) => {
// // //           stompClient.subscribe(`/topic/hoa-don/${tab.key}`, (message) => {
// // //             console.log(`🔄 Order ${tab.key} updated`);
// // //             fetchInvoiceProducts(tab.key).then((products) => {
// // //               setOrderProducts((prev) => ({
// // //                 ...prev,
// // //                 [tab.key]: products,
// // //               }));
// // //             });
// // //           });
// // //         });
// // //       },
// // //       onStompError: (frame) => {
// // //         console.error("STOMP error:", frame.headers["message"]);
// // //         console.error("STOMP error details:", frame.body);
// // //       },
// // //       onWebSocketError: (event) => {
// // //         console.error("WebSocket error:", event);
// // //       },
// // //       onDisconnect: () => console.log("❌ WebSocket disconnected"),
// // //     });

// // //     stompClient.activate();

// // //     return () => {
// // //       stompClient.deactivate();
// // //     };
// // //   }, [tabs]); // Reconnect when tabs change

// // //   // Add this useEffect for initialization
// // //   useEffect(() => {
// // //     setOrderProducts({});
// // //     setTotalBeforeDiscount(0);
// // //     fetchPendingOrders();
// // //   }, []);

// // //   // 2. Create new order
// // //   const addTab = async () => {
// // //     try {
// // //       // Check if there are already 5 pending orders
// // //       const pendingOrdersCount = tabs.filter(
// // //         (tab) => tab.order.trangThai === 1
// // //       ).length;
// // //       if (pendingOrdersCount >= 10) {
// // //         message.error("Bạn chỉ có thể tạo tối đa 10 đơn hàng chờ xác nhận");
// // //         return;
// // //       }

// // //       setLoading(true);
// // //       const response = await api.post("/api/admin/ban-hang/create", {
// // //         emailNhanVien: "vnv@gmail.com", // Replace with actual logged-in user
// // //       });

// // //       const newOrder = response.data;
// // //       // Use id instead of maHoaDon for API calls
// // //       const newOrderKey = newOrder.id;

// // //       setTabs((prev) => [
// // //         ...prev,
// // //         {
// // //           key: newOrderKey,
// // //           title: `Đơn hàng ${prev.length + 1} - ${newOrder.maHoaDon}`, // Display maHoaDon
// // //           order: newOrder,
// // //         },
// // //       ]);

// // //       setOrderProducts((prev) => ({
// // //         ...prev,
// // //         [newOrderKey]: [],
// // //       }));

// // //       setActiveKey(newOrderKey);
// // //       message.success("Tạo đơn hàng mới thành công");

// // //       // After successful tab creation, subscribe to its updates
// // //       if (socket.current) {
// // //         socket.current.subscribe(`/topic/hoa-don/${newOrderKey}`, (message) => {
// // //           fetchInvoiceProducts(newOrderKey).then((products) => {
// // //             setOrderProducts((prev) => ({
// // //               ...prev,
// // //               [newOrderKey]: products,
// // //             }));
// // //           });
// // //         });
// // //       }
// // //     } catch (error) {
// // //       message.error("Lỗi khi tạo đơn hàng mới");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // 3. Add product to order
// // //   const handleAddProductToOrder = async (product) => {
// // //     if (!activeKey) {
// // //       message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
// // //       return;
// // //     }

// // //     try {
// // //       const response = await api.post(
// // //         `/api/admin/ban-hang/${activeKey}/add-product`,
// // //         {
// // //           sanPhamChiTietId: product.id,
// // //           soLuong: 1,
// // //         }
// // //       );

// // //       if (!response || !response.data) {
// // //         throw new Error("Dữ liệu API không hợp lệ");
// // //       }

// // //       console.log("✅ Sản phẩm đã thêm vào đơn hàng:", response.data);

// // //       // Cập nhật sản phẩm và tổng tiền ngay lập tức
// // //       const updatedProducts = await fetchInvoiceProducts(activeKey);

// // //       setOrderProducts((prev) => ({ ...prev, [activeKey]: updatedProducts }));
// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [activeKey]: calculateOrderTotals(activeKey),
// // //       }));

// // //       // 🔄 Cập nhật lại gợi ý voucher & sản phẩm
// // //       await findBestVoucherAndSuggest(activeKey);

// // //       message.success("Thêm sản phẩm thành công");
// // //     } catch (error) {
// // //       console.error("❌ Lỗi khi thêm sản phẩm:", error);
// // //       message.error("Lỗi khi thêm sản phẩm, vui lòng kiểm tra lại.");
// // //     }
// // //   };

// // //   // 4. Update product quantity
// // //   const handleUpdateQuantity = async (
// // //     hoaDonId,
// // //     hoaDonChiTietId,
// // //     newQuantity
// // //   ) => {
// // //     if (newQuantity < 1) return message.error("Số lượng phải lớn hơn 0");

// // //     try {
// // //       setOrderProducts((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: prev[hoaDonId].map((product) =>
// // //           product.id === hoaDonChiTietId
// // //             ? { ...product, soLuong: newQuantity }
// // //             : product
// // //         ),
// // //       }));

// // //       const updatedProducts = orderProducts[hoaDonId].map((product) =>
// // //         product.id === hoaDonChiTietId
// // //           ? { ...product, soLuong: newQuantity }
// // //           : product
// // //       );

// // //       const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
// // //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));

// // //       await api.put(
// // //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}/so-luong`,
// // //         { soLuong: newQuantity }
// // //       );

// // //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// // //       await autoApplyBestVoucher(hoaDonId);
// // //       await fetchInvoiceProducts(hoaDonId);
// // //       await findBestVoucherAndSuggest(hoaDonId);
// // //     } catch (error) {
// // //       console.error("Lỗi khi cập nhật số lượng:", error);
// // //       message.error("Lỗi khi cập nhật số lượng!");
// // //       await fetchInvoiceProducts(hoaDonId);
// // //     }
// // //   };

// // //   // 5. Remove product
// // //   const handleRemoveProduct = async (hoaDonId, hoaDonChiTietId) => {
// // //     try {
// // //       const updatedProducts = orderProducts[hoaDonId].filter(
// // //         (product) => product.id !== hoaDonChiTietId
// // //       );

// // //       setOrderProducts((prev) => ({ ...prev, [hoaDonId]: updatedProducts }));

// // //       await api.delete(
// // //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`
// // //       );

// // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       const newTotalBeforeVoucher =
// // //         calculateTotalBeforeDiscount(updatedProducts) +
// // //         (currentOrder?.phiVanChuyen || 0);

// // //       if (
// // //         currentOrder?.phieuGiamGia &&
// // //         newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
// // //       ) {
// // //         await handleRemoveVoucher(hoaDonId);
// // //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// // //       }

// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: calculateOrderTotals(hoaDonId),
// // //       }));

// // //       await fetchInvoiceProducts(hoaDonId);

// // //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// // //       await autoApplyBestVoucher(hoaDonId);
// // //     } catch (error) {
// // //       console.error("Lỗi khi xóa sản phẩm:", error);
// // //       message.error("Lỗi khi xóa sản phẩm!");
// // //     }
// // //   };

// // //   // 6. Apply voucher
// // //   const handleVoucherSelected = async (hoaDonId, voucherId) => {
// // //     try {
// // //       console.log("Áp dụng voucher từ dialog:", { hoaDonId, voucherId });

// // //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// // //       if (!hoaDonId || !voucherId) {
// // //         console.error("hoaDonId hoặc voucherId không hợp lệ");
// // //         message.error("Không thể áp dụng voucher");
// // //         return;
// // //       }

// // //       // Sửa endpoint API - thêm /voucher vào cuối URL
// // //       const response = await api.post(
// // //         `/api/admin/hoa-don/${hoaDonId}/voucher`,
// // //         {
// // //           voucherId: voucherId,
// // //         }
// // //       );

// // //       if (response.data) {
// // //         const updatedOrder = response.data;

// // //         // Cập nhật order trong tabs
// // //         setTabs((prev) =>
// // //           prev.map((tab) =>
// // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //           )
// // //         );

// // //         // Tải lại sản phẩm
// // //         const products = await fetchInvoiceProducts(hoaDonId, true);

// // //         // Tính toán lại tổng tiền
// // //         const subtotal = calculateTotalBeforeDiscount(products);
// // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // //         const totalBeforeVoucher = subtotal + shippingFee;

// // //         // Tính toán giảm giá dựa trên voucher
// // //         let discountAmount = 0;
// // //         if (updatedOrder.phieuGiamGia) {
// // //           discountAmount = calculateDiscountAmount(
// // //             updatedOrder.phieuGiamGia,
// // //             totalBeforeVoucher
// // //           );
// // //         }

// // //         const finalTotal = totalBeforeVoucher - discountAmount;

// // //         // Cập nhật totals
// // //         const newTotals = {
// // //           subtotal,
// // //           shippingFee,
// // //           totalBeforeVoucher,
// // //           discountAmount,
// // //           finalTotal,
// // //         };

// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(subtotal);
// // //           setTotalAmount(finalTotal);
// // //         }

// // //         setOpenVoucherDialog(false);
// // //         message.success("Áp dụng voucher thành công");
// // //       }
// // //     } catch (error) {
// // //       console.error("Lỗi khi áp dụng voucher:", error);
// // //       message.error("Lỗi khi áp dụng voucher");
// // //     }
// // //   };

// // //   // 7. Remove voucher
// // //   const handleRemoveVoucher = async (hoaDonId) => {
// // //     try {
// // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       const currentProducts = orderProducts[hoaDonId] || [];

// // //       // Tính toán lại tổng tiền ngay lập tức
// // //       const subtotal = calculateTotalBeforeDiscount(currentProducts);
// // //       const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);
// // //       const finalTotal = totalWithShipping; // Không còn mã giảm giá

// // //       // Cập nhật UI ngay lập tức
// // //       setTabs((prev) =>
// // //         prev.map((tab) =>
// // //           tab.key === hoaDonId
// // //             ? {
// // //                 ...tab,
// // //                 order: {
// // //                   ...tab.order,
// // //                   tongTien: totalWithShipping,
// // //                   giamGia: 0,
// // //                   tongThanhToan: finalTotal,
// // //                   phieuGiamGia: null, // Xóa voucher khỏi state
// // //                 },
// // //               }
// // //             : tab
// // //         )
// // //       );

// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: {
// // //           subtotal,
// // //           shippingFee: currentOrder?.phiVanChuyen || 0,
// // //           totalBeforeVoucher: totalWithShipping,
// // //           discountAmount: 0,
// // //           finalTotal,
// // //         },
// // //       }));

// // //       //Gọi API để xóa voucher trên server
// // //       await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`);

// // //       message.success("Đã xóa voucher");
// // //       await fetchInvoiceProducts(hoaDonId);
// // //     } catch (error) {
// // //       console.error("Lỗi khi xóa voucher:", error);
// // //       message.error("Lỗi khi xóa voucher!");
// // //       await fetchInvoiceProducts(hoaDonId);
// // //     }
// // //   };

// // //   const fetchAvailableVouchers = async () => {
// // //     try {
// // //       const response = await api.get(
// // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}`
// // //       );
// // //       setVouchers(response.data);
// // //     } catch (error) {
// // //       message.error("Lỗi khi tải danh sách voucher");
// // //     }
// // //   };

// // //   // Replace loadVouchers function with fetchAvailableVouchers
// // //   const loadVouchers = async (hoaDonId) => {
// // //     try {
// // //       await fetchAvailableVouchers();
// // //     } catch (error) {
// // //       message.error("Lỗi khi tải danh sách voucher");
// // //     }
// // //   };

// // //   // 9. Confirm order
// // //   const handleConfirmOrder = async (hoaDonId) => {
// // //     try {
// // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

// // //       if (!currentOrder || !currentOrder.phuongThucThanhToan) {
// // //         message.error(
// // //           "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
// // //         );
// // //         return;
// // //       }

// // //       // Only check payment amount for cash payments
// // //       if (
// // //         currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
// // //         PAYMENT_METHOD.CASH
// // //       ) {
// // //         const { remaining } = calculateChange(hoaDonId);
// // //         if (remaining > 0) {
// // //           message.error("Số tiền khách đưa chưa đủ để thanh toán!");
// // //           return;
// // //         }
// // //       }

// // //       await api.post(`/api/admin/ban-hang/${hoaDonId}/complete`, {
// // //         phuongThucThanhToans: [
// // //           currentOrder.phuongThucThanhToan.maPhuongThucThanhToan,
// // //         ],
// // //       });

// // //       // Fetch the PDF for printing
// // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// // //         responseType: "blob",
// // //         headers: { Accept: "application/pdf, application/json" },
// // //       });

// // //       const contentType = response.headers["content-type"];
// // //       if (!contentType.includes("application/pdf")) {
// // //         message.error("Định dạng không hợp lệ từ máy chủ");
// // //         return;
// // //       }

// // //       const blob = new Blob([response.data], { type: "application/pdf" });
// // //       const url = window.URL.createObjectURL(blob);

// // //       // Lưu URL của PDF và mở modal xem trước
// // //       setPdfUrl(url);
// // //       setPreviewOpen(true);

// // //       // Đóng tab sau khi xác nhận thành công
// // //       setTabs((prev) => prev.filter((tab) => tab.key !== hoaDonId));
// // //       message.success("Xác nhận đơn hàng thành công");
// // //     } catch (error) {
// // //       message.error("Lỗi khi xác nhận đơn hàng");
// // //     }
// // //   };

// // //   const handleDirectPrint = () => {
// // //     const iframe = document.getElementById("pdf-preview");
// // //     iframe.contentWindow.print();
// // //   };

// // //   // 10. Print invoice
// // //   const handlePrintInvoice = async (hoaDonId) => {
// // //     try {
// // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// // //         responseType: "blob",
// // //       });

// // //       const blob = new Blob([response.data], { type: "application/pdf" });
// // //       const url = window.URL.createObjectURL(blob);
// // //       window.open(url);
// // //     } catch (error) {
// // //       message.error("Lỗi khi in hóa đơn");
// // //     }
// // //   };

// // //   // Cập nhật lại findBestVoucherAndSuggest để sử dụng hàm helper
// // //   const findBestVoucherAndSuggest = async (hoaDonId) => {
// // //     try {
// // //       console.log("🔍 Tìm voucher tốt hơn cho đơn hàng:", hoaDonId);

// // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       if (!order) {
// // //         console.warn("⚠️ Không tìm thấy đơn hàng");
// // //         return;
// // //       }

// // //       const currentProducts = orderProducts[hoaDonId] || [];
// // //       const currentTotal = totals[hoaDonId]?.totalBeforeVoucher || 0;

// // //       // Kiểm tra nếu tổng tiền quá nhỏ, không cần tìm voucher
// // //       if (currentTotal < 10000) {
// // //         setVoucherSuggestions({
// // //           show: false,
// // //           betterVouchers: [],
// // //         });
// // //         return;
// // //       }

// // //       // Sử dụng cache để tránh gọi API liên tục
// // //       const cacheKey = `vouchers_${Math.floor(currentTotal / 10000)}`;
// // //       let allVouchers = sessionStorage.getItem(cacheKey);

// // //       if (!allVouchers) {
// // //         const response = await api.get("/api/phieu-giam-gia");
// // //         allVouchers = response.data || [];
// // //         sessionStorage.setItem(cacheKey, JSON.stringify(allVouchers));
// // //       } else {
// // //         allVouchers = JSON.parse(allVouchers);
// // //       }

// // //       // Tính giảm giá hiện tại
// // //       const currentDiscount = order.phieuGiamGia
// // //         ? calculateDiscountAmount(order.phieuGiamGia, currentTotal)
// // //         : 0;

// // //       // Lọc voucher có giá trị giảm tốt hơn voucher hiện tại
// // //       const betterVouchers = allVouchers
// // //         .filter((voucher) => {
// // //           if (voucher.id === order.phieuGiamGia?.id) return false;

// // //           const potentialDiscount = calculateDiscountAmount(
// // //             voucher,
// // //             Math.max(currentTotal, voucher.giaTriToiThieu)
// // //           );

// // //           return potentialDiscount > currentDiscount;
// // //         })
// // //         .map((voucher) => ({
// // //           ...voucher,
// // //           amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
// // //           potentialDiscount: calculateDiscountAmount(
// // //             voucher,
// // //             Math.max(currentTotal, voucher.giaTriToiThieu)
// // //           ),
// // //           additionalSavings:
// // //             calculateDiscountAmount(
// // //               voucher,
// // //               Math.max(currentTotal, voucher.giaTriToiThieu)
// // //             ) - currentDiscount,
// // //         }))
// // //         .sort((a, b) => b.additionalSavings - a.additionalSavings)
// // //         .slice(0, 3); // Giới hạn chỉ 3 voucher tốt nhất

// // //       if (betterVouchers.length > 0) {
// // //         // Tối ưu: Chỉ tìm sản phẩm gợi ý cho voucher cần thêm tiền
// // //         const suggestedProducts = await Promise.all(
// // //           betterVouchers
// // //             .filter((v) => v.amountNeeded > 0)
// // //             .map(async (voucher) => {
// // //               // Gợi ý tăng số lượng sản phẩm hiện có
// // //               const currentProductSuggestions = currentProducts
// // //                 .filter((p) => p.gia > 0)
// // //                 .map((p) => ({
// // //                   ...p,
// // //                   quantityNeeded: Math.ceil(voucher.amountNeeded / p.gia),
// // //                 }))
// // //                 .sort((a, b) => a.quantityNeeded - b.quantityNeeded)
// // //                 .slice(0, 2);

// // //               // Lấy sản phẩm mới từ cache hoặc API
// // //               let allProducts = sessionStorage.getItem("all_products");
// // //               if (!allProducts) {
// // //                 allProducts = await fetchAllProducts();
// // //                 sessionStorage.setItem(
// // //                   "all_products",
// // //                   JSON.stringify(allProducts)
// // //                 );
// // //               } else {
// // //                 allProducts = JSON.parse(allProducts);
// // //               }

// // //               const currentProductIds = currentProducts.map((p) => p.id);

// // //               // Tìm sản phẩm có giá phù hợp
// // //               const minPrice = voucher.amountNeeded * 0.7;
// // //               const maxPrice = voucher.amountNeeded * 1.5;

// // //               const newProductSuggestions = allProducts
// // //                 .filter((p) => !currentProductIds.includes(p.id))
// // //                 .filter(
// // //                   (p) => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0
// // //                 )
// // //                 .sort(
// // //                   (a, b) =>
// // //                     Math.abs(a.gia - voucher.amountNeeded) -
// // //                     Math.abs(b.gia - voucher.amountNeeded)
// // //                 )
// // //                 .slice(0, 3);

// // //               return {
// // //                 voucherId: voucher.id,
// // //                 currentProducts: currentProductSuggestions,
// // //                 newProducts: newProductSuggestions,
// // //               };
// // //             })
// // //         );

// // //         // Cập nhật state với voucher và sản phẩm gợi ý
// // //         setVoucherSuggestions({
// // //           show: true,
// // //           betterVouchers: betterVouchers.map((voucher, index) => ({
// // //             ...voucher,
// // //             suggestions: suggestedProducts.find(
// // //               (s) => s?.voucherId === voucher.id
// // //             ) || {
// // //               currentProducts: [],
// // //               newProducts: [],
// // //             },
// // //           })),
// // //         });
// // //       } else {
// // //         setVoucherSuggestions({
// // //           show: false,
// // //           betterVouchers: [],
// // //         });
// // //       }
// // //     } catch (error) {
// // //       console.error("Lỗi khi tìm voucher tốt hơn:", error);
// // //       setVoucherSuggestions({
// // //         show: false,
// // //         betterVouchers: [],
// // //       });
// // //     }
// // //   };

// // //   // Hàm xử lý khi người dùng áp dụng voucher được gợi ý
// // //   const handleApplySuggestedVoucher = async (hoaDonId, voucherId) => {
// // //     try {
// // //       console.log("Áp dụng voucher gợi ý:", { hoaDonId, voucherId });

// // //       // Gọi API để áp dụng voucher
// // //       const response = await api.post(
// // //         `/api/admin/hoa-don/${hoaDonId}/voucher`,
// // //         {
// // //           voucherId: voucherId,
// // //         }
// // //       );

// // //       if (response.data) {
// // //         message.success("Áp dụng voucher thành công");

// // //         // Tải lại thông tin hóa đơn từ server
// // //         await fetchInvoiceById(hoaDonId);

// // //         // Tính toán lại tổng tiền
// // //         const newTotals = calculateOrderTotals(hoaDonId);
// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(newTotals.subtotal);
// // //           setTotalAmount(newTotals.finalTotal);
// // //         }

// // //         // Đóng gợi ý voucher
// // //         setVoucherSuggestions({
// // //           show: false,
// // //           betterVouchers: [],
// // //         });

// // //         return true;
// // //       }
// // //       return false;
// // //     } catch (error) {
// // //       console.error("Lỗi khi áp dụng voucher gợi ý:", error);
// // //       message.error("Lỗi khi áp dụng voucher");
// // //       return false;
// // //     }
// // //   };

// // //   // Hàm xử lý khi người dùng thêm sản phẩm từ gợi ý
// // //   const handleAddSuggestedProduct = async (product) => {
// // //     try {
// // //       // Thêm sản phẩm vào đơn hàng
// // //       await handleAddProductToOrder(product);
// // //       message.success(`Đã thêm ${product.tenSanPham} vào đơn hàng`);

// // //       // Tải lại thông tin hóa đơn từ server
// // //       await fetchInvoiceById(activeKey);

// // //       // Tính toán lại tổng tiền
// // //       const newTotals = calculateOrderTotals(activeKey);
// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [activeKey]: newTotals,
// // //       }));

// // //       // Cập nhật UI
// // //       setTotalBeforeDiscount(newTotals.subtotal);
// // //       setTotalAmount(newTotals.finalTotal);

// // //       // Cập nhật lại gợi ý sau khi thêm sản phẩm
// // //       setTimeout(() => {
// // //         findBestVoucherAndSuggest(activeKey);
// // //       }, 500);
// // //     } catch (error) {
// // //       console.error("Lỗi khi thêm sản phẩm:", error);
// // //       message.error("Lỗi khi thêm sản phẩm vào đơn hàng");
// // //     }
// // //   };

// // //   // Hàm xử lý khi người dùng tăng số lượng sản phẩm từ gợi ý
// // //   const handleUpdateQuantityForSuggestion = async (
// // //     hoaDonId,
// // //     productId,
// // //     newQuantity
// // //   ) => {
// // //     try {
// // //       // Cập nhật số lượng sản phẩm
// // //       await handleUpdateQuantity(hoaDonId, productId, newQuantity);
// // //       message.success("Đã cập nhật số lượng sản phẩm");

// // //       // Tải lại thông tin hóa đơn từ server
// // //       await fetchInvoiceById(hoaDonId);

// // //       // Tính toán lại tổng tiền
// // //       const newTotals = calculateOrderTotals(hoaDonId);
// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: newTotals,
// // //       }));

// // //       // Cập nhật UI nếu đang ở tab này
// // //       if (hoaDonId === activeKey) {
// // //         setTotalBeforeDiscount(newTotals.subtotal);
// // //         setTotalAmount(newTotals.finalTotal);
// // //       }

// // //       // Cập nhật lại gợi ý sau khi cập nhật số lượng
// // //       setTimeout(() => {
// // //         findBestVoucherAndSuggest(hoaDonId);
// // //       }, 500);
// // //     } catch (error) {
// // //       console.error("Lỗi khi cập nhật số lượng:", error);
// // //       message.error("Lỗi khi cập nhật số lượng sản phẩm");
// // //     }
// // //   };

// // //   // Gợi ý mua thêm tiền để áp dụng mã giảm giá tốt hơn
// // //   useEffect(() => {
// // //     if (activeKey && orderProducts[activeKey]) {
// // //       console.log("🔄 Cập nhật tổng tiền...");

// // //       // 🟢 Tính tổng tiền trước khi cập nhật vào `totals`
// // //       const newTotals = calculateOrderTotals(activeKey);
// // //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// // //       setTotalAmount(newTotals.finalTotal);

// // //       console.log("📌 Tổng tiền mới:", newTotals);
// // //     }
// // //   }, [orderProducts, activeKey]);

// // //   useEffect(() => {
// // //     if (
// // //       activeKey &&
// // //       totals[activeKey] &&
// // //       totals[activeKey].totalBeforeVoucher > 0
// // //     ) {
// // //       console.log("🔄 Tổng tiền đã cập nhật, tìm voucher tốt nhất...");
// // //       findBestVoucherAndSuggest(activeKey);
// // //     }
// // //   }, [totals, activeKey]); // Chỉ chạy khi tổng tiền thay đổi

// // //   // Update order content rendering to show products table
// // //   const renderOrderContent = (order) => (
// // //     <Row gutter={16}>
// // //       <Col
// // //         span={17}
// // //         style={{
// // //           border: "1px solid #ccc",
// // //           borderRadius: "8px",
// // //           padding: "16px",
// // //           maxHeight: "calc(100vh - 180px)",
// // //           overflowY: "auto",
// // //         }}
// // //       >
// // //         <Space direction="vertical" style={{ width: "100%" }}>
// // //           <div style={{ display: "flex", justifyContent: "flex-end" }}>
// // //             <Button>
// // //               <BiQrScan />
// // //               Quét mã QR
// // //             </Button>
// // //             <Button
// // //               type="primary"
// // //               onClick={() => setOpenProductTable(true)}
// // //               style={{ marginLeft: 8 }}
// // //             >
// // //               <IoIosAddCircle />
// // //               Thêm sản phẩm
// // //             </Button>
// // //           </div>
// // //           <Table
// // //             dataSource={orderProducts[order.id] || []}
// // //             columns={columns}
// // //             pagination={{
// // //               current: pagination.current,
// // //               pageSize: 3,
// // //               showSizeChanger: false,
// // //               total: orderProducts[order.id]?.length || 0,
// // //               showTotal: (total) => `Tổng ${total} sản phẩm`,
// // //               size: "small",
// // //               position: ["bottomCenter"],
// // //               onChange: (page) => {
// // //                 setPagination({ current: page, pageSize: 3 });
// // //               },
// // //             }}
// // //             rowKey="id"
// // //             bordered
// // //             size="small"
// // //             style={{
// // //               marginTop: "10px",
// // //               borderRadius: "8px",
// // //               boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
// // //             }}
// // //             scroll={{ y: "calc(100vh - 350px)" }}
// // //           />
// // //         </Space>
// // //       </Col>
// // //       <Col span={7}>
// // //         <div
// // //           style={{
// // //             border: "1px solid #ccc",
// // //             borderRadius: "8px",
// // //             padding: "10px",
// // //             maxHeight: "calc(100vh - 180px)",
// // //             overflowY: "auto",
// // //           }}
// // //         >
// // //           <Space direction="vertical" style={{ width: "100%" }}>
// // //             <Text strong>Thông tin khách hàng</Text>
// // //             <div
// // //               style={{
// // //                 border: "1px solid #ccc",
// // //                 borderRadius: "8px",
// // //                 padding: "10px",
// // //               }}
// // //             >
// // //               <Row>
// // //                 <Col span={10}>
// // //                   <Text>Khách hàng</Text>
// // //                 </Col>
// // //                 <Col span={14}>
// // //                   <Row style={{ display: "flex", justifyContent: "flex-end" }}>
// // //                     <Button
// // //                       size="small"
// // //                       onClick={() => handleSelectCustomer(order.id)}
// // //                     >
// // //                       <AiOutlineSelect />
// // //                       Chọn
// // //                     </Button>
// // //                     <Button
// // //                       type="primary"
// // //                       size="small"
// // //                       style={{ marginLeft: 8 }}
// // //                       onClick={() => handleAddNewCustomer()}
// // //                     >
// // //                       <IoIosAddCircle />
// // //                       Thêm mới
// // //                     </Button>
// // //                   </Row>
// // //                 </Col>
// // //               </Row>
// // //               <Row style={{ marginTop: 8 }}>
// // //                 <Col
// // //                   span={24}
// // //                   style={{ display: "flex", alignItems: "center" }}
// // //                 >
// // //                   <Avatar size={40} style={{ marginRight: 8 }} />
// // //                   <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
// // //                 </Col>
// // //               </Row>
// // //               <div
// // //                 style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
// // //               ></div>
// // //               <Row>
// // //                 <Col span={24}>
// // //                   <Radio.Group
// // //                     value={order.hinhThucNhan || "taiQuay"}
// // //                     onChange={(e) =>
// // //                       handleDeliveryMethodChange(order.id, e.target.value)
// // //                     }
// // //                   >
// // //                     <Radio value="taiQuay">Tại quầy</Radio>
// // //                     <Radio value="giaoHang">Giao hàng</Radio>
// // //                   </Radio.Group>
// // //                 </Col>
// // //               </Row>
// // //             </div>
// // //             <div
// // //               style={{
// // //                 display: "flex",
// // //                 justifyContent: "space-between",
// // //                 alignItems: "center",
// // //               }}
// // //             >
// // //               <Text strong>Voucher giảm giá:</Text>
// // //               <div>
// // //                 {order.phieuGiamGia ? (
// // //                   <Tag
// // //                     closable
// // //                     onClose={() => handleRemoveVoucher(order.id)}
// // //                     color="black"
// // //                   >
// // //                     {order.phieuGiamGia.maPhieuGiamGia}
// // //                   </Tag>
// // //                 ) : (
// // //                   <Space>
// // //                     <Button
// // //                       type="default"
// // //                       icon={<TagOutlined />}
// // //                       onClick={() => {
// // //                         loadVouchers(order.id);
// // //                         setOpenVoucherDialog(true);
// // //                       }}
// // //                     >
// // //                       Chọn mã
// // //                     </Button>
// // //                     <Button
// // //                       type="primary"
// // //                       onClick={() => autoApplyBestVoucher(order.id)}
// // //                     >
// // //                       Áp dụng tốt nhất
// // //                     </Button>
// // //                   </Space>
// // //                 )}
// // //               </div>
// // //             </div>
// // //             <Text strong>Thông tin thanh toán</Text>
// // //             <div
// // //               style={{
// // //                 border: "1px solid #ccc",
// // //                 borderRadius: "8px",
// // //                 padding: "10px",
// // //               }}
// // //             >
// // //               <Row>
// // //                 <Col span={24}>
// // //                   <Radio.Group
// // //                     value={
// // //                       order.phuongThucThanhToan?.maPhuongThucThanhToan || ""
// // //                     }
// // //                     onChange={(e) =>
// // //                       handlePaymentMethodChange(order.id, e.target.value)
// // //                     }
// // //                   >
// // //                     {paymentMethods.map((method) => (
// // //                       <Radio
// // //                         key={method.id}
// // //                         value={method.maPhuongThucThanhToan}
// // //                       >
// // //                         {method.tenPhuongThucThanhToan}
// // //                       </Radio>
// // //                     ))}
// // //                   </Radio.Group>
// // //                 </Col>
// // //               </Row>
// // //               <Row style={{ marginTop: 8 }}>
// // //                 <Col span={12}>
// // //                   <Text>Tổng tiền:</Text>
// // //                 </Col>
// // //                 <Col span={12} style={{ textAlign: "right" }}>
// // //                   <Text strong>
// // //                     {formatCurrency(totals[order.id]?.totalBeforeVoucher || 0)}
// // //                   </Text>
// // //                 </Col>
// // //               </Row>
// // //               <Row style={{ marginTop: 8 }}>
// // //                 <Col span={12}>
// // //                   <Text>Phí vận chuyển:</Text>
// // //                 </Col>
// // //                 <Col span={12}>
// // //                   <InputNumber
// // //                     style={{ width: "100%" }}
// // //                     value={order.phiVanChuyen || 0}
// // //                     onChange={(value) =>
// // //                       handleShippingFeeChange(order.id, value)
// // //                     }
// // //                     formatter={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
// // //                     parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // //                   />
// // //                 </Col>
// // //               </Row>
// // //               <Row style={{ marginTop: 8 }}>
// // //                 <Col span={12}>
// // //                   <Text>Giảm giá:</Text>
// // //                 </Col>
// // //                 <Col span={12} style={{ textAlign: "right" }}>
// // //                   {order.phieuGiamGia ? (
// // //                     order.phieuGiamGia.loaiPhieuGiamGia === 1 ? (
// // //                       <Text strong style={{ color: "#f50" }}>
// // //                         {order.phieuGiamGia.giaTriGiam}% (
// // //                         {formatCurrency(totals[order.id]?.discountAmount || 0)})
// // //                       </Text>
// // //                     ) : (
// // //                       <Text strong style={{ color: "#f50" }}>
// // //                         {formatCurrency(totals[order.id]?.discountAmount || 0)}
// // //                       </Text>
// // //                     )
// // //                   ) : (
// // //                     <Text>
// // //                       {formatCurrency(totals[order.id]?.discountAmount || 0)}
// // //                     </Text>
// // //                   )}
// // //                 </Col>
// // //               </Row>
// // //               <Row style={{ marginTop: 8 }}>
// // //                 <Col span={12}>
// // //                   <Text strong>Tổng thanh toán:</Text>
// // //                 </Col>
// // //                 <Col span={12} style={{ textAlign: "right" }}>
// // //                   <Text strong style={{ color: "red" }}>
// // //                     {formatCurrency(totals[order.id]?.finalTotal || 0)}
// // //                   </Text>
// // //                 </Col>
// // //               </Row>
// // //               {order.phuongThucThanhToan?.maPhuongThucThanhToan ===
// // //                 PAYMENT_METHOD.CASH && (
// // //                 <>
// // //                   <Divider style={{ margin: "12px 0" }} />
// // //                   <Row justify="space-between" align="middle">
// // //                     <Col span={10}>
// // //                       <Text>Tiền khách đưa:</Text>
// // //                     </Col>
// // //                     <Col span={14}>
// // //                       <InputNumber
// // //                         style={{ width: "100%" }}
// // //                         value={customerPayment[order.id] || 0}
// // //                         onChange={(value) => {
// // //                           setCustomerPayment((prev) => ({
// // //                             ...prev,
// // //                             [order.id]: value || 0,
// // //                           }));
// // //                         }}
// // //                         formatter={(value) =>
// // //                           `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// // //                         }
// // //                         parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // //                         min={0}
// // //                         step={1000}
// // //                       />
// // //                     </Col>
// // //                   </Row>
// // //                   {calculateChange(order.id).change > 0 && (
// // //                     <Row justify="space-between" style={{ marginTop: 8 }}>
// // //                       <Col>
// // //                         <Text strong style={{ color: "#52c41a" }}>
// // //                           Tiền thừa:
// // //                         </Text>
// // //                       </Col>
// // //                       <Col>
// // //                         <Text strong style={{ color: "#52c41a" }}>
// // //                           {formatCurrency(calculateChange(order.id).change)}
// // //                         </Text>
// // //                       </Col>
// // //                     </Row>
// // //                   )}
// // //                   {calculateChange(order.id).remaining > 0 && (
// // //                     <Row justify="space-between" style={{ marginTop: 8 }}>
// // //                       <Col>
// // //                         <Text strong style={{ color: "#ff4d4f" }}>
// // //                           Còn thiếu:
// // //                         </Text>
// // //                       </Col>
// // //                       <Col>
// // //                         <Text strong style={{ color: "#ff4d4f" }}>
// // //                           {formatCurrency(calculateChange(order.id).remaining)}
// // //                         </Text>
// // //                       </Col>
// // //                     </Row>
// // //                   )}
// // //                 </>
// // //               )}
// // //             </div>
// // //             {/* Phần hiển thị gợi ý voucher */}
// // //             {voucherSuggestions.show &&
// // //               voucherSuggestions.betterVouchers?.length > 0 && (
// // //                 <div
// // //                   className="voucher-suggestions"
// // //                   style={{
// // //                     margin: "16px 0",
// // //                     padding: "12px",
// // //                     background: "#f6ffed",
// // //                     border: "1px solid #b7eb8f",
// // //                     borderRadius: "8px",
// // //                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// // //                     maxHeight: "300px",
// // //                     overflowY: "auto",
// // //                   }}
// // //                 >
// // //                   <Space
// // //                     direction="vertical"
// // //                     size="small"
// // //                     style={{ width: "100%" }}
// // //                   >
// // //                     <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
// // //                       <InfoCircleOutlined style={{ marginRight: 8 }} />
// // //                       Có {voucherSuggestions.betterVouchers.length} voucher tốt
// // //                       hơn cho đơn hàng
// // //                     </Text>

// // //                     {voucherSuggestions.betterVouchers.map((voucher, index) => {
// // //                       const currentDiscount = order.phieuGiamGia
// // //                         ? calculateDiscountAmount(
// // //                             order.phieuGiamGia,
// // //                             totals[order.id]?.totalBeforeVoucher || 0
// // //                           )
// // //                         : 0;

// // //                       return (
// // //                         <Card
// // //                           key={voucher.id}
// // //                           size="small"
// // //                           bordered={true}
// // //                           style={{ background: "#fff", marginBottom: 8 }}
// // //                           title={
// // //                             <Space>
// // //                               <TagOutlined style={{ color: "#1890ff" }} />
// // //                               <Text strong style={{ fontSize: "12px" }}>
// // //                                 {voucher.maPhieuGiamGia}
// // //                               </Text>
// // //                               <Tag color="green" style={{ fontSize: "11px" }}>
// // //                                 +{formatCurrency(voucher.additionalSavings)}
// // //                               </Tag>
// // //                             </Space>
// // //                           }
// // //                           extra={
// // //                             <Button
// // //                               type="primary"
// // //                               size="small"
// // //                               onClick={() =>
// // //                                 handleApplySuggestedVoucher(
// // //                                   order.id,
// // //                                   voucher.id
// // //                                 )
// // //                               }
// // //                               disabled={voucher.amountNeeded > 0}
// // //                             >
// // //                               {voucher.amountNeeded > 0 ? "Chưa đủ" : "Áp dụng"}
// // //                             </Button>
// // //                           }
// // //                         >
// // //                           <Space
// // //                             direction="vertical"
// // //                             style={{ width: "100%" }}
// // //                             size="small"
// // //                           >
// // //                             <div>
// // //                               <Text style={{ fontSize: "12px" }}>
// // //                                 {voucher.loaiPhieuGiamGia === 1
// // //                                   ? `Giảm ${
// // //                                       voucher.giaTriGiam
// // //                                     }% (tối đa ${formatCurrency(
// // //                                       voucher.soTienGiamToiDa
// // //                                     )})`
// // //                                   : `Giảm ${formatCurrency(
// // //                                       voucher.giaTriGiam
// // //                                     )}`}
// // //                               </Text>
// // //                               <br />
// // //                               <Text
// // //                                 type="secondary"
// // //                                 style={{ fontSize: "12px" }}
// // //                               >
// // //                                 Đơn tối thiểu:{" "}
// // //                                 {formatCurrency(voucher.giaTriToiThieu)}
// // //                               </Text>
// // //                             </div>

// // //                             {voucher.amountNeeded > 0 && (
// // //                               <Alert
// // //                                 type="warning"
// // //                                 message={`Cần mua thêm ${formatCurrency(
// // //                                   voucher.amountNeeded
// // //                                 )}`}
// // //                                 style={{
// // //                                   marginBottom: 8,
// // //                                   fontSize: "12px",
// // //                                   padding: "4px 8px",
// // //                                 }}
// // //                               />
// // //                             )}

// // //                             {/* Hiển thị gợi ý sản phẩm thu gọn */}
// // //                             {(voucher.suggestions?.currentProducts?.length >
// // //                               0 ||
// // //                               voucher.suggestions?.newProducts?.length > 0) && (
// // //                               <Collapse ghost size="small">
// // //                                 <Collapse.Panel
// // //                                   header={
// // //                                     <Text style={{ fontSize: "12px" }}>
// // //                                       Xem gợi ý sản phẩm
// // //                                     </Text>
// // //                                   }
// // //                                   key="1"
// // //                                 >
// // //                                   {voucher.suggestions?.currentProducts
// // //                                     ?.length > 0 && (
// // //                                     <div style={{ marginTop: 4 }}>
// // //                                       <Text strong style={{ fontSize: "12px" }}>
// // //                                         Mua thêm sản phẩm đã chọn:
// // //                                       </Text>
// // //                                       <List
// // //                                         size="small"
// // //                                         dataSource={
// // //                                           voucher.suggestions.currentProducts
// // //                                         }
// // //                                         renderItem={(product) => (
// // //                                           <List.Item
// // //                                             extra={
// // //                                               <Button
// // //                                                 type="primary"
// // //                                                 size="small"
// // //                                                 onClick={() =>
// // //                                                   handleUpdateQuantityForSuggestion(
// // //                                                     order.id,
// // //                                                     product.id,
// // //                                                     product.soLuong +
// // //                                                       product.quantityNeeded
// // //                                                   )
// // //                                                 }
// // //                                               >
// // //                                                 +{product.quantityNeeded}
// // //                                               </Button>
// // //                                             }
// // //                                           >
// // //                                             <List.Item.Meta
// // //                                               avatar={
// // //                                                 <Avatar
// // //                                                   src={product.hinhAnh?.[0]}
// // //                                                   shape="square"
// // //                                                   size="small"
// // //                                                 />
// // //                                               }
// // //                                               title={
// // //                                                 <Text
// // //                                                   style={{ fontSize: "12px" }}
// // //                                                 >
// // //                                                   {product.tenSanPham}
// // //                                                 </Text>
// // //                                               }
// // //                                               description={
// // //                                                 <Text
// // //                                                   type="secondary"
// // //                                                   style={{ fontSize: "11px" }}
// // //                                                 >
// // //                                                   {formatCurrency(product.gia)}{" "}
// // //                                                   x{product.soLuong}
// // //                                                 </Text>
// // //                                               }
// // //                                             />
// // //                                           </List.Item>
// // //                                         )}
// // //                                       />
// // //                                     </div>
// // //                                   )}

// // //                                   {voucher.suggestions?.newProducts?.length >
// // //                                     0 && (
// // //                                     <div style={{ marginTop: 4 }}>
// // //                                       <Text strong style={{ fontSize: "12px" }}>
// // //                                         Thêm sản phẩm mới:
// // //                                       </Text>
// // //                                       <List
// // //                                         size="small"
// // //                                         dataSource={
// // //                                           voucher.suggestions.newProducts
// // //                                         }
// // //                                         renderItem={(product) => (
// // //                                           <List.Item
// // //                                             extra={
// // //                                               <Button
// // //                                                 type="primary"
// // //                                                 size="small"
// // //                                                 icon={<PlusOutlined />}
// // //                                                 onClick={() =>
// // //                                                   handleAddSuggestedProduct(
// // //                                                     product
// // //                                                   )
// // //                                                 }
// // //                                               >
// // //                                                 Thêm
// // //                                               </Button>
// // //                                             }
// // //                                           >
// // //                                             <List.Item.Meta
// // //                                               avatar={
// // //                                                 <Avatar
// // //                                                   src={product.hinhAnh?.[0]}
// // //                                                   shape="square"
// // //                                                   size="small"
// // //                                                 />
// // //                                               }
// // //                                               title={
// // //                                                 <Text
// // //                                                   style={{ fontSize: "12px" }}
// // //                                                 >
// // //                                                   {product.tenSanPham}
// // //                                                 </Text>
// // //                                               }
// // //                                               description={
// // //                                                 <Text
// // //                                                   type="success"
// // //                                                   style={{ fontSize: "11px" }}
// // //                                                 >
// // //                                                   {formatCurrency(product.gia)}
// // //                                                 </Text>
// // //                                               }
// // //                                             />
// // //                                           </List.Item>
// // //                                         )}
// // //                                       />
// // //                                     </div>
// // //                                   )}
// // //                                 </Collapse.Panel>
// // //                               </Collapse>
// // //                             )}
// // //                           </Space>
// // //                         </Card>
// // //                       );
// // //                     })}
// // //                   </Space>
// // //                 </div>
// // //               )}

// // //             <Space direction="vertical" style={{ width: "100%" }}>
// // //               <Button
// // //                 type="primary"
// // //                 block
// // //                 onClick={() => handleConfirmOrder(order.id)}
// // //               >
// // //                 Xác nhận đơn hàng
// // //               </Button>
// // //             </Space>
// // //           </Space>
// // //         </div>
// // //       </Col>
// // //     </Row>
// // //   );
// // //   // Add these handler functions
// // //   const handleAddNewCustomer = () => {
// // //     // Implement new customer creation logic
// // //   };

// // //   const handleDeliveryMethodChange = async (hoaDonId, method) => {
// // //     // Implement delivery method change logic
// // //   };

// // //   const handlePaymentMethodChange = (hoaDonId, selectedId) => {
// // //     const selectedMethod = paymentMethods.find(
// // //       (method) => method.maPhuongThucThanhToan === selectedId
// // //     );

// // //     if (selectedMethod) {
// // //       const newPaymentMethod = {
// // //         id: selectedMethod.id,
// // //         maPhuongThucThanhToan: selectedMethod.maPhuongThucThanhToan,
// // //         tenPhuongThucThanhToan: selectedMethod.tenPhuongThucThanhToan,
// // //         moTa: selectedMethod.moTa,
// // //       };

// // //       setTabs((prev) =>
// // //         prev.map((tab) =>
// // //           tab.key === hoaDonId
// // //             ? {
// // //                 ...tab,
// // //                 order: {
// // //                   ...tab.order,
// // //                   phuongThucThanhToan: selectedMethod,
// // //                 },
// // //               }
// // //             : tab
// // //         )
// // //       );
// // //     } else {
// // //       message.error("Phương thức thanh toán không hợp lệ!");
// // //     }
// // //   };

// // //   const handleShippingFeeChange = async (hoaDonId, fee) => {
// // //     // Implement shipping fee change logic
// // //   };

// // //   // Add function to load customers
// // //   const loadCustomers = async () => {
// // //     try {
// // //       const response = await axios.get("http://localhost:8080/api/khach_hang");
// // //       setCustomers(response.data);
// // //     } catch (error) {
// // //       console.error("Error loading customers:", error);
// // //     }
// // //   };

// // //   // Add function to handle customer selection
// // //   const handleCustomerSelected = async (hoaDonId, customerId) => {
// // //     try {
// // //       const response = await axios.put(
// // //         `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
// // //         { customerId }
// // //       );

// // //       setTabs((prev) =>
// // //         prev.map((tab) =>
// // //           tab.key === hoaDonId ? { ...tab, order: response.data } : tab
// // //         )
// // //       );
// // //       setOpenCustomerDialog(false);
// // //     } catch (error) {
// // //       message.error("Lỗi khi chọn khách hàng");
// // //     }
// // //   };

// // //   // Add function to handle customer selection
// // //   const handleSelectCustomer = async (hoaDonId) => {
// // //     try {
// // //       await loadCustomers();
// // //       setOpenCustomerDialog(true);
// // //     } catch (error) {
// // //       message.error("Lỗi khi tải danh sách khách hàng");
// // //     }
// // //   };

// // //   // Update calculateTotalBeforeDiscount to handle undefined/null cases
// // //   const calculateTotalBeforeDiscount = (products) => {
// // //     if (!products || !Array.isArray(products)) {
// // //       return 0;
// // //     }
// // //     return products.reduce((sum, product) => {
// // //       const price = product.gia || 0;
// // //       const quantity = product.soLuong || 0;
// // //       return sum + price * quantity;
// // //     }, 0);
// // //   };

// // //   // // Update useEffect for totalBeforeDiscount calculation
// // //   useEffect(() => {
// // //     if (activeKey && orderProducts[activeKey]) {
// // //       const total = calculateTotalBeforeDiscount(orderProducts[activeKey]);
// // //       if (total !== totalBeforeDiscount) {
// // //         setTotalBeforeDiscount(total);
// // //       }
// // //     }
// // //   }, [activeKey, orderProducts]);
// // //   // Tự động tính lại tổng tiền khi danh sách sản phẩm thay đổi
// // //   const calculateOrderTotal = (products, shippingFee = 0, discount = 0) => {
// // //     const subtotal = products.reduce(
// // //       (sum, product) => sum + product.gia * product.soLuong,
// // //       0
// // //     );
// // //     return subtotal + shippingFee - discount;
// // //   };
// // //   useEffect(() => {
// // //     if (activeKey && orderProducts[activeKey]) {
// // //       const newTotals = calculateOrderTotals(activeKey);
// // //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// // //       setTotalAmount(newTotals.finalTotal);
// // //     }
// // //   }, [orderProducts, activeKey]);

// // //   useEffect(() => {
// // //     if (activeKey && totals[activeKey]) {
// // //       setTotalAmount(totals[activeKey].finalTotal);
// // //     }
// // //   }, [totals, activeKey, orderProducts]); // Theo dõi thêm `orderProducts`

// // //   // Add applyBestVoucher function from InvoiceDetail
// // //   const applyBestVoucher = async (hoaDonId) => {
// // //     try {
// // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       if (!order) return null;

// // //       const totalBeforeVoucher = calculateOrderTotal(
// // //         orderProducts[hoaDonId],
// // //         order.phiVanChuyen || 0,
// // //         0
// // //       );

// // //       // Kiểm tra nếu mã giảm giá hiện tại không còn hợp lệ
// // //       const currentVoucher = order.phieuGiamGia;
// // //       if (
// // //         currentVoucher &&
// // //         totalBeforeVoucher < currentVoucher.giaTriToiThieu
// // //       ) {
// // //         await handleRemoveVoucher(hoaDonId);
// // //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// // //       }

// // //       // Tìm mã giảm giá tốt nhất
// // //       const response = await api.post(
// // //         `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher`
// // //       );
// // //       const updatedOrder = response.data;

// // //       setTabs((prev) =>
// // //         prev.map((tab) =>
// // //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //         )
// // //       );

// // //       // Cập nhật tổng tiền ngay lập tức
// // //       const newTotals = calculateOrderTotals(hoaDonId);
// // //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));
// // //       setTotalAmount(newTotals.finalTotal);

// // //       return updatedOrder;
// // //     } catch (error) {
// // //       console.error("Lỗi khi áp dụng voucher:", error);
// // //       return null;
// // //     }
// // //   };

// // //   // Add fetchPaymentHistory from InvoiceDetail if needed
// // //   const fetchPaymentHistory = async () => {
// // //     if (!activeKey) return;

// // //     try {
// // //       setLoadingPayments(true);
// // //       const response = await api.get(
// // //         `/api/admin/hoa-don/${activeKey}/payment-history`
// // //       );
// // //       setPaymentHistory(response.data);
// // //     } catch (error) {
// // //       console.error("Error fetching payment history:", error);
// // //     } finally {
// // //       setLoadingPayments(false);
// // //     }
// // //   };

// // //   // Update fetchProducts to match InvoiceDetail format
// // //   const fetchProducts = async () => {
// // //     try {
// // //       const response = await api.get("/api/admin/hoa-don/san-pham/all");
// // //       const productsData = response.data;

// // //       // Lấy hình ảnh từ API
// // //       const productsWithImages = await Promise.all(
// // //         productsData.map(async (product) => {
// // //           try {
// // //             const imgResponse = await api.get(
// // //               `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// // //             );

// // //             // Ensure imageUrls is always an array
// // //             const imageUrls = Array.isArray(imgResponse.data)
// // //               ? imgResponse.data.map((img) => img.anhUrl)
// // //               : [];

// // //             return {
// // //               ...product,
// // //               // Store full array of image URLs instead of just first one
// // //               hinhAnh: imageUrls,
// // //             };
// // //           } catch (error) {
// // //             console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
// // //             return { ...product, hinhAnh: [] }; // Return empty array if error
// // //           }
// // //         })
// // //       );

// // //       setProducts(productsWithImages);
// // //     } catch (error) {
// // //       message.error("Lỗi khi tải danh sách sản phẩm");
// // //     }
// // //   };

// // //   // Add useEffect to load products
// // //   useEffect(() => {
// // //     fetchProducts();
// // //   }, []);

// // //   const fetchInvoiceProducts = async (hoaDonId, skipUIUpdate = false) => {
// // //     try {
// // //       console.log(`📢 Fetching products for invoice: ${hoaDonId}`);

// // //       // Sử dụng debounce để tránh gọi API quá nhiều lần
// // //       if (fetchInvoiceProducts.timer) {
// // //         clearTimeout(fetchInvoiceProducts.timer);
// // //       }

// // //       return new Promise((resolve) => {
// // //         fetchInvoiceProducts.timer = setTimeout(
// // //           async () => {
// // //             try {
// // //               const response = await api.get(
// // //                 `/api/admin/hoa-don/${hoaDonId}/san-pham`
// // //               );
// // //               let products = response.data || [];

// // //               // Tối ưu: Chỉ lấy hình ảnh cho sản phẩm chưa có
// // //               const productsWithImages = await Promise.all(
// // //                 products.map(async (product) => {
// // //                   if (product.hinhAnh && product.hinhAnh.length > 0) {
// // //                     return product;
// // //                   }

// // //                   try {
// // //                     // Sử dụng cache để lưu hình ảnh
// // //                     const cacheKey = `product_image_${product.id}`;
// // //                     let cachedImages = sessionStorage.getItem(cacheKey);

// // //                     if (cachedImages) {
// // //                       return {
// // //                         ...product,
// // //                         hinhAnh: JSON.parse(cachedImages),
// // //                       };
// // //                     }

// // //                     const imgResponse = await api.get(
// // //                       `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// // //                     );

// // //                     const imageUrls =
// // //                       imgResponse.data && imgResponse.data.length > 0
// // //                         ? imgResponse.data.map((img) => img.anhUrl)
// // //                         : [];

// // //                     // Lưu vào cache
// // //                     sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));

// // //                     return {
// // //                       ...product,
// // //                       hinhAnh: imageUrls,
// // //                     };
// // //                   } catch (error) {
// // //                     console.error(
// // //                       `❌ Lỗi khi lấy ảnh sản phẩm ${product.id}:`,
// // //                       error
// // //                     );
// // //                     return { ...product, hinhAnh: [] };
// // //                   }
// // //                 })
// // //               );

// // //               // Chỉ cập nhật UI nếu không phải đang khởi tạo
// // //               if (!skipUIUpdate) {
// // //                 // Cập nhật state ngay lập tức
// // //                 setOrderProducts((prev) => ({
// // //                   ...prev,
// // //                   [hoaDonId]: productsWithImages,
// // //                 }));

// // //                 // Lấy thông tin hóa đơn hiện tại
// // //                 const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //                 if (order) {
// // //                   // Tính toán lại tổng tiền
// // //                   const newTotals = calculateOrderTotals(hoaDonId);

// // //                   setTotals((prev) => ({
// // //                     ...prev,
// // //                     [hoaDonId]: newTotals,
// // //                   }));

// // //                   // Cập nhật UI với tổng tiền mới
// // //                   if (hoaDonId === activeKey) {
// // //                     setTotalBeforeDiscount(newTotals.subtotal);
// // //                     setTotalAmount(newTotals.finalTotal);
// // //                   }
// // //                 }
// // //               } else {
// // //                 // Nếu đang khởi tạo, chỉ cập nhật orderProducts
// // //                 setOrderProducts((prev) => ({
// // //                   ...prev,
// // //                   [hoaDonId]: productsWithImages,
// // //                 }));
// // //               }

// // //               resolve(productsWithImages);
// // //             } catch (error) {
// // //               console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// // //               resolve([]);
// // //             }
// // //           },
// // //           skipUIUpdate ? 0 : 300
// // //         ); // Không debounce khi đang khởi tạo
// // //       });
// // //     } catch (error) {
// // //       console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// // //       message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
// // //       return [];
// // //     }
// // //   };

// // //   // Convert tabs to items format
// // //   const items = tabs.map((tab) => ({
// // //     key: tab.key,
// // //     label: (
// // //       <span>
// // //         {tab.title}
// // //         {orderProducts[tab.key]?.length > 0 && (
// // //           <sup
// // //             style={{
// // //               marginLeft: "4px",
// // //               color: "#ff4d4f",
// // //               fontWeight: "bold",
// // //             }}
// // //           >
// // //             ({orderProducts[tab.key].length})
// // //           </sup>
// // //         )}
// // //       </span>
// // //     ),
// // //     children: renderOrderContent(tab.order),
// // //   }));

// // //   // Add this function to handle tab editing (adding/removing)
// // //   const handleEditTab = (targetKey, action) => {
// // //     if (action === "add") {
// // //       addTab();
// // //     } else if (action === "remove") {
// // //       Modal.confirm({
// // //         title: "Xác nhận hủy đơn hàng",
// // //         content:
// // //           "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm sẽ được hoàn lại kho.",
// // //         okText: "Hủy đơn",
// // //         cancelText: "Đóng",
// // //         okButtonProps: { danger: true },
// // //         onOk: async () => {
// // //           try {
// // //             // Gọi API hủy hóa đơn, đảm bảo sản phẩm được hoàn lại kho
// // //             await api.delete(`/api/admin/hoa-don/${targetKey}`);

// // //             // Xóa tab khỏi giao diện
// // //             setTabs((prev) => prev.filter((tab) => tab.key !== targetKey));

// // //             // Xóa sản phẩm liên quan đến đơn hàng bị hủy
// // //             setOrderProducts((prev) => {
// // //               const newProducts = { ...prev };
// // //               delete newProducts[targetKey];
// // //               return newProducts;
// // //             });

// // //             // Nếu tab hiện tại bị xóa, chuyển sang tab đầu tiên còn lại
// // //             if (activeKey === targetKey) {
// // //               const newActiveKey = tabs.find(
// // //                 (tab) => tab.key !== targetKey
// // //               )?.key;
// // //               setActiveKey(newActiveKey);
// // //             }

// // //             message.success("Đã hủy đơn hàng và hoàn lại sản phẩm vào kho.");
// // //           } catch (error) {
// // //             console.error("Lỗi khi hủy đơn hàng:", error);
// // //             message.error(
// // //               error.response?.data?.message || "Lỗi khi hủy đơn hàng."
// // //             );
// // //           }
// // //         },
// // //       });
// // //     }
// // //   };

// // //   // Add function to calculate and update all totals
// // //   const updateAllTotals = (products, order) => {
// // //     // Calculate total before discount
// // //     const subtotal = calculateTotalBeforeDiscount(products);

// // //     // Calculate shipping fee
// // //     const shippingFee = order.phiVanChuyen || 0;

// // //     // Calculate total before applying voucher
// // //     const totalBeforeVoucher = subtotal + shippingFee;

// // //     // Calculate discount amount if voucher exists
// // //     const discountAmount = order.phieuGiamGia
// // //       ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// // //       : 0;

// // //     // Calculate final total
// // //     const finalTotal = totalBeforeVoucher - discountAmount;

// // //     // Update all state values
// // //     setTotalBeforeDiscount(subtotal);
// // //     setTotalAmount(totalBeforeVoucher);

// // //     // Update the order in tabs with new totals
// // //     setTabs((prev) =>
// // //       prev.map((tab) => {
// // //         if (tab.key === order.id) {
// // //           return {
// // //             ...tab,
// // //             order: {
// // //               ...tab.order,
// // //               tongTien: totalBeforeVoucher,
// // //               giamGia: discountAmount,
// // //               tongThanhToan: finalTotal,
// // //             },
// // //           };
// // //         }
// // //         return tab;
// // //       })
// // //     );
// // //   };

// // //   // Add function to calculate all totals for an order
// // //   const calculateOrderTotals = (hoaDonId) => {
// // //     console.log("Calculating totals for order:", hoaDonId);
// // //     const products = orderProducts[hoaDonId] || [];
// // //     const order = tabs.find((tab) => tab.key === hoaDonId)?.order;

// // //     if (!order) {
// // //       console.warn("No order found for totals calculation");
// // //       return {
// // //         subtotal: 0,
// // //         shippingFee: 0,
// // //         totalBeforeVoucher: 0,
// // //         discountAmount: 0,
// // //         finalTotal: 0,
// // //       };
// // //     }

// // //     const subtotal = calculateTotalBeforeDiscount(products);
// // //     const shippingFee = order.phiVanChuyen || 0;
// // //     const totalBeforeVoucher = subtotal + shippingFee;

// // //     // Tính toán giảm giá dựa trên voucher
// // //     let discountAmount = 0;
// // //     if (order.phieuGiamGia) {
// // //       discountAmount = calculateDiscountAmount(
// // //         order.phieuGiamGia,
// // //         totalBeforeVoucher
// // //       );
// // //     }

// // //     const finalTotal = totalBeforeVoucher - discountAmount;

// // //     return {
// // //       subtotal,
// // //       shippingFee,
// // //       totalBeforeVoucher,
// // //       discountAmount,
// // //       finalTotal,
// // //     };
// // //   };

// // //   // Update the autoApplyBestVoucher function
// // //   const autoApplyBestVoucher = async (hoaDonId) => {
// // //     try {
// // //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       if (!order) return;

// // //       // Lấy danh sách sản phẩm của đơn hàng
// // //       const currentProducts = orderProducts[hoaDonId] || [];
// // //       const totalBeforeVoucher =
// // //         calculateTotalBeforeDiscount(currentProducts) +
// // //         (order.phiVanChuyen || 0);

// // //       if (totalBeforeVoucher <= 0) {
// // //         message.info("Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá.");
// // //         return;
// // //       }

// // //       // Gọi API lấy danh sách voucher hợp lệ
// // //       const response = await api.get(
// // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`
// // //       );
// // //       const availableVouchers = response.data || [];

// // //       if (!availableVouchers.length) {
// // //         message.info("Không có mã giảm giá phù hợp.");
// // //         return;
// // //       }

// // //       // 🔍 Tìm voucher giảm giá cao nhất
// // //       const bestVoucher = availableVouchers.reduce((best, current) => {
// // //         if (totalBeforeVoucher < current.giaTriToiThieu) return best;

// // //         const currentDiscount = calculateDiscountAmount(
// // //           current,
// // //           totalBeforeVoucher
// // //         );
// // //         const bestDiscount = best
// // //           ? calculateDiscountAmount(best, totalBeforeVoucher)
// // //           : 0;

// // //         return currentDiscount > bestDiscount ? current : best;
// // //       }, null);

// // //       if (!bestVoucher) {
// // //         message.info("Không tìm thấy phiếu giảm giá tốt hơn.");
// // //         return;
// // //       }

// // //       // 🔍 Tính toán số tiền giảm giá
// // //       const newDiscount = calculateDiscountAmount(
// // //         bestVoucher,
// // //         totalBeforeVoucher
// // //       );
// // //       const currentDiscount = order.phieuGiamGia
// // //         ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// // //         : 0;

// // //       if (newDiscount <= currentDiscount) {
// // //         message.info("Mã giảm giá hiện tại đã là tốt nhất.");
// // //         return;
// // //       }

// // //       // 🔄 Gọi API để áp dụng phiếu giảm giá mới
// // //       await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// // //         voucherId: bestVoucher.id,
// // //       });

// // //       // 🔹 Cập nhật `order` mới trong `tabs`
// // //       const updatedOrder = {
// // //         ...order,
// // //         phieuGiamGia: bestVoucher,
// // //         giamGia: newDiscount,
// // //         tongThanhToan: totalBeforeVoucher - newDiscount,
// // //       };

// // //       setTabs((prev) =>
// // //         prev.map((tab) =>
// // //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //         )
// // //       );

// // //       // 🔹 Cập nhật tổng tiền trong `totals`
// // //       const newTotals = {
// // //         subtotal: calculateTotalBeforeDiscount(currentProducts),
// // //         shippingFee: order.phiVanChuyen || 0,
// // //         totalBeforeVoucher,
// // //         discountAmount: newDiscount,
// // //         finalTotal: totalBeforeVoucher - newDiscount,
// // //       };

// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: newTotals,
// // //       }));

// // //       message.success(
// // //         `Đã áp dụng mã giảm giá tốt nhất: ${bestVoucher.maPhieuGiamGia}`
// // //       );

// // //       // 🔄 Làm mới danh sách sản phẩm để đồng bộ dữ liệu
// // //       await fetchInvoiceProducts(hoaDonId);
// // //     } catch (error) {
// // //       console.error("Lỗi khi tự động áp dụng voucher:", error);
// // //       message.error("Không thể áp dụng mã giảm giá tự động.");
// // //     }
// // //   };

// // //   const renderPaymentSection = (order) => {
// // //     const orderTotals = totals[order.id] || calculateOrderTotals(order.id);
// // //     if (!orderTotals) return null;

// // //     const { change, remaining } = calculateChange(order.id);

// // //     return (
// // //       <div style={{ maxWidth: 400, marginLeft: "auto" }}>
// // //         <Space direction="vertical" size="middle" style={{ width: "100%" }}>
// // //           {/* New payment input section */}
// // //           <Divider style={{ margin: "12px 0" }} />
// // //           <Row justify="space-between" align="middle">
// // //             <Col span={10}>
// // //               <Text>Tiền khách đưa:</Text>
// // //             </Col>
// // //             <Col span={14}>
// // //               <InputNumber
// // //                 style={{ width: "100%" }}
// // //                 value={customerPayment[order.id] || 0}
// // //                 onChange={(value) => {
// // //                   setCustomerPayment((prev) => ({
// // //                     ...prev,
// // //                     [order.id]: value || 0,
// // //                   }));
// // //                 }}
// // //                 formatter={(value) =>
// // //                   `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// // //                 }
// // //                 parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// // //                 min={0}
// // //                 step={1000}
// // //               />
// // //             </Col>
// // //           </Row>

// // //           {/* Display change or remaining amount */}
// // //           {change > 0 && (
// // //             <Row justify="space-between">
// // //               <Col>
// // //                 <Text strong style={{ color: "#52c41a" }}>
// // //                   Tiền thừa:
// // //                 </Text>
// // //               </Col>
// // //               <Col>
// // //                 <Text strong style={{ color: "#52c41a" }}>
// // //                   {formatCurrency(change)}
// // //                 </Text>
// // //               </Col>
// // //             </Row>
// // //           )}
// // //           {remaining > 0 && (
// // //             <Row justify="space-between">
// // //               <Col>
// // //                 <Text strong style={{ color: "#ff4d4f" }}>
// // //                   Còn thiếu:
// // //                 </Text>
// // //               </Col>
// // //               <Col>
// // //                 <Text strong style={{ color: "#ff4d4f" }}>
// // //                   {formatCurrency(remaining)}
// // //                 </Text>
// // //               </Col>
// // //             </Row>
// // //           )}
// // //         </Space>
// // //       </div>
// // //     );
// // //   };

// // //   // Update useEffect for tab changes to ensure totals are calculated
// // //   useEffect(() => {
// // //     if (activeKey) {
// // //       setPagination({ current: 1, pageSize: 3 });
// // //       fetchInvoiceProducts(activeKey).then(() => {
// // //         setTimeout(() => {
// // //           const newTotals = calculateOrderTotals(activeKey);
// // //           setTotals((prev) => ({
// // //             ...prev,
// // //             [activeKey]: newTotals,
// // //           }));
// // //           findBestVoucherAndSuggest(activeKey); // Add this line
// // //         }, 300); // Đợi API trả dữ liệu rồi cập nhật
// // //       });
// // //     }
// // //   }, [activeKey]);

// // //   // Add new function to find best voucher
// // //   const findBestVoucher = async (hoaDonId, totalAmount) => {
// // //     try {
// // //       const response = await api.get(
// // //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalAmount}`
// // //       );
// // //       const availableVouchers = response.data;

// // //       if (!availableVouchers || availableVouchers.length === 0) return null;

// // //       // 1️⃣ Lọc danh sách voucher hợp lệ (đơn hàng đạt điều kiện tối thiểu)
// // //       const validVouchers = availableVouchers.filter(
// // //         (voucher) => totalAmount >= voucher.giaTriToiThieu
// // //       );

// // //       if (validVouchers.length === 0) return null;

// // //       // 2️⃣ Tìm voucher có mức giảm giá cao nhất
// // //       return validVouchers.reduce((best, current) => {
// // //         const currentDiscount = calculateDiscountAmount(current, totalAmount);
// // //         const bestDiscount = best
// // //           ? calculateDiscountAmount(best, totalAmount)
// // //           : 0;
// // //         return currentDiscount > bestDiscount ? current : best;
// // //       }, null);
// // //     } catch (error) {
// // //       console.error("Lỗi khi tìm mã giảm giá tốt nhất:", error);
// // //       return null;
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const fetchPaymentMethods = async () => {
// // //       setPaymentMethodsLoading(true);
// // //       try {
// // //         const response = await api.get("/api/phuong-thuc-thanh-toan");
// // //         setPaymentMethods(response.data);
// // //       } catch (error) {
// // //         message.error("Lỗi khi tải phương thức thanh toán");
// // //       } finally {
// // //         setPaymentMethodsLoading(false);
// // //       }
// // //     };

// // //     fetchPaymentMethods();
// // //   }, []);

// // //   const PreviewModal = () => (
// // //     <AntdModal
// // //       open={previewOpen}
// // //       onCancel={() => {
// // //         setPreviewOpen(false);
// // //         if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
// // //         setPdfUrl(null);
// // //       }}
// // //       width="80%"
// // //       footer={[
// // //         <Button key="print" type="primary" onClick={handleDirectPrint}>
// // //           In hóa đơn
// // //         </Button>,
// // //       ]}
// // //     >
// // //       <iframe
// // //         id="pdf-preview"
// // //         src={pdfUrl}
// // //         width="100%"
// // //         height="600px"
// // //         style={{ border: "none" }}
// // //         title="PDF Preview"
// // //       />
// // //     </AntdModal>
// // //   );

// // //   // Thêm useEffect mới để gọi findBestVoucherAndSuggest
// // //   useEffect(() => {
// // //     if (activeKey && orderProducts[activeKey]) {
// // //       console.log("Triggering voucher suggestions...");
// // //       findBestVoucherAndSuggest(activeKey);
// // //     }
// // //   }, [activeKey, orderProducts[activeKey]]); // Thêm dependency

// // //   // Thêm hàm fetchInvoiceById để tải lại thông tin hóa đơn từ server
// // //   const fetchInvoiceById = async (hoaDonId) => {
// // //     try {
// // //       console.log("🔄 Fetching invoice data for:", hoaDonId);

// // //       // Gọi API để lấy thông tin hóa đơn
// // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);

// // //       if (response.data) {
// // //         const updatedOrder = response.data;

// // //         // Cập nhật order trong tabs
// // //         setTabs((prev) =>
// // //           prev.map((tab) =>
// // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //           )
// // //         );

// // //         // Tải lại danh sách sản phẩm
// // //         await fetchInvoiceProducts(hoaDonId, false);

// // //         return updatedOrder;
// // //       }
// // //     } catch (error) {
// // //       console.error("❌ Lỗi khi tải thông tin hóa đơn:", error);
// // //     }

// // //     return null;
// // //   };

// // //   // Thêm hàm findSuggestedProducts để tìm sản phẩm gợi ý
// // //   const findSuggestedProducts = async (currentProducts, amountNeeded) => {
// // //     try {
// // //       // Lấy danh sách sản phẩm nếu chưa có
// // //       let productList = products;
// // //       if (productList.length === 0) {
// // //         const response = await api.get("/api/admin/san-pham");
// // //         productList = response.data || [];
// // //       }

// // //       const currentProductIds = currentProducts.map((p) => p.id);

// // //       // Tìm sản phẩm có giá phù hợp với số tiền cần thêm
// // //       const minPrice = amountNeeded * 0.7; // 70% của số tiền cần thêm
// // //       const maxPrice = amountNeeded * 1.5; // 150% của số tiền cần thêm

// // //       const suggestedProducts = productList
// // //         .filter((p) => !currentProductIds.includes(p.id)) // Loại bỏ sản phẩm đã có
// // //         .filter((p) => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0) // Lọc theo giá và tồn kho
// // //         .sort(
// // //           (a, b) =>
// // //             Math.abs(a.gia - amountNeeded) - Math.abs(b.gia - amountNeeded)
// // //         ) // Sắp xếp theo giá gần nhất
// // //         .slice(0, 3);

// // //       return suggestedProducts;
// // //     } catch (error) {
// // //       console.error("Lỗi khi tìm sản phẩm gợi ý:", error);
// // //       return [];
// // //     }
// // //   };

// // //   // Thêm hàm updateOrderTotals để cập nhật tổng tiền đơn hàng
// // //   const updateOrderTotals = (hoaDonId) => {
// // //     const calculatedTotals = calculateOrderTotals(hoaDonId);
// // //     if (calculatedTotals) {
// // //       setTotals((prev) => ({
// // //         ...prev,
// // //         [hoaDonId]: calculatedTotals,
// // //       }));

// // //       // Cập nhật tổng tiền trong order
// // //       setTabs((prev) =>
// // //         prev.map((tab) => {
// // //           if (tab.key === hoaDonId) {
// // //             return {
// // //               ...tab,
// // //               order: {
// // //                 ...tab.order,
// // //                 tongTien: calculatedTotals.totalBeforeVoucher,
// // //                 giamGia: calculatedTotals.discountAmount,
// // //                 tongThanhToan: calculatedTotals.finalTotal,
// // //               },
// // //             };
// // //           }
// // //           return tab;
// // //         })
// // //       );
// // //     }
// // //   };

// // //   // Thêm hàm để lấy tất cả sản phẩm từ server
// // //   const fetchAllProducts = async () => {
// // //     try {
// // //       const response = await api.get("/api/admin/san-pham");
// // //       return response.data || [];
// // //     } catch (error) {
// // //       console.error("Lỗi khi lấy danh sách sản phẩm:", error);
// // //       return [];
// // //     }
// // //   };

// // //   // Thêm hàm mới để xử lý việc áp dụng voucher
// // //   const applyVoucherToOrder = async (hoaDonId, voucherId) => {
// // //     try {
// // //       // Gọi API để áp dụng voucher
// // //       const response = await api.post(
// // //         `/api/admin/ban-hang/${hoaDonId}/voucher`,
// // //         {
// // //           voucherId: voucherId,
// // //         }
// // //       );

// // //       if (response.data) {
// // //         const updatedOrder = response.data;

// // //         // Cập nhật order trong tabs
// // //         setTabs((prev) =>
// // //           prev.map((tab) =>
// // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //           )
// // //         );

// // //         // Lấy thông tin sản phẩm hiện tại
// // //         const products = orderProducts[hoaDonId] || [];

// // //         // Tính toán lại tổng tiền
// // //         const subtotal = calculateTotalBeforeDiscount(products);
// // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // //         const totalBeforeVoucher = subtotal + shippingFee;

// // //         // Tính toán giảm giá
// // //         let discountAmount = 0;
// // //         if (updatedOrder.phieuGiamGia) {
// // //           discountAmount = calculateDiscountAmount(
// // //             updatedOrder.phieuGiamGia,
// // //             totalBeforeVoucher
// // //           );
// // //         }

// // //         const finalTotal = totalBeforeVoucher - discountAmount;

// // //         // Cập nhật totals
// // //         const newTotals = {
// // //           subtotal,
// // //           shippingFee,
// // //           totalBeforeVoucher,
// // //           discountAmount,
// // //           finalTotal,
// // //         };

// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(subtotal);
// // //           setTotalAmount(finalTotal);
// // //         }

// // //         return true;
// // //       }
// // //       return false;
// // //     } catch (error) {
// // //       console.error("Lỗi khi áp dụng voucher:", error);
// // //       message.error("Lỗi khi áp dụng voucher");
// // //       return false;
// // //     }
// // //   };

// // //   // Thêm hàm mới để tải lại thông tin hóa đơn từ server
// // //   const refreshInvoiceData = async (hoaDonId) => {
// // //     try {
// // //       console.log("🔄 Refreshing invoice data for:", hoaDonId);

// // //       // Kiểm tra xem hoaDonId có hợp lệ không
// // //       if (!hoaDonId) {
// // //         console.warn("Không có hoaDonId hợp lệ để tải dữ liệu");
// // //         return null;
// // //       }

// // //       // Gọi API để lấy thông tin hóa đơn mới nhất
// // //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);

// // //       if (response.data) {
// // //         const updatedOrder = response.data;

// // //         // Ghi log thông tin hóa đơn để debug
// // //         console.log("Thông tin hóa đơn từ server:", {
// // //           id: updatedOrder.id,
// // //           maHoaDon: updatedOrder.maHoaDon,
// // //           tongTien: updatedOrder.tongTien,
// // //           giamGia: updatedOrder.giamGia,
// // //           tongThanhToan: updatedOrder.tongThanhToan,
// // //           phieuGiamGia: updatedOrder.phieuGiamGia,
// // //         });

// // //         // Cập nhật order trong tabs
// // //         setTabs((prev) =>
// // //           prev.map((tab) =>
// // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //           )
// // //         );

// // //         // Tải lại sản phẩm
// // //         const products = await fetchInvoiceProducts(hoaDonId, true);

// // //         // Tính toán lại tổng tiền
// // //         const newTotals = calculateOrderTotals(hoaDonId);

// // //         console.log("Tổng tiền sau khi tính toán:", newTotals);

// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(newTotals.subtotal);
// // //           setTotalAmount(newTotals.finalTotal);
// // //         }

// // //         return { updatedOrder, products, newTotals };
// // //       }
// // //     } catch (error) {
// // //       console.error("❌ Lỗi khi tải lại thông tin hóa đơn:", error);
// // //       // Không hiển thị thông báo lỗi để tránh làm phiền người dùng
// // //       // Thay vào đó, sử dụng dữ liệu hiện có

// // //       // Lấy thông tin hóa đơn hiện tại từ tabs
// // //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// // //       if (currentOrder) {
// // //         // Tải lại sản phẩm
// // //         const products = await fetchInvoiceProducts(hoaDonId, true);

// // //         // Tính toán lại tổng tiền dựa trên dữ liệu hiện có
// // //         const subtotal = calculateTotalBeforeDiscount(products);
// // //         const shippingFee = currentOrder.phiVanChuyen || 0;
// // //         const totalBeforeVoucher = subtotal + shippingFee;
// // //         const discountAmount = currentOrder.giamGia || 0;
// // //         const finalTotal = totalBeforeVoucher - discountAmount;

// // //         // Cập nhật totals
// // //         const newTotals = {
// // //           subtotal,
// // //           shippingFee,
// // //           totalBeforeVoucher,
// // //           discountAmount,
// // //           finalTotal,
// // //         };

// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(subtotal);
// // //           setTotalAmount(finalTotal);
// // //         }

// // //         return { updatedOrder: currentOrder, products, newTotals };
// // //       }
// // //     }

// // //     return null;
// // //   };

// // //   // Sửa hàm handleApplyBestVoucher để xử lý lỗi khi áp dụng voucher gợi ý
// // //   const handleApplyBestVoucher = async (hoaDonId, voucherId) => {
// // //     try {
// // //       console.log("Áp dụng voucher gợi ý:", { hoaDonId, voucherId });

// // //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// // //       if (!hoaDonId || !voucherId) {
// // //         console.error("hoaDonId hoặc voucherId không hợp lệ");
// // //         message.error("Không thể áp dụng voucher");
// // //         return false;
// // //       }

// // //       // Sửa endpoint API - thêm /voucher vào cuối URL
// // //       const response = await api.post(
// // //         `/api/admin/hoa-don/${hoaDonId}/voucher`,
// // //         {
// // //           voucherId: voucherId,
// // //         }
// // //       );

// // //       if (response.data) {
// // //         message.success("Áp dụng voucher thành công");

// // //         // Cập nhật thông tin hóa đơn từ response
// // //         const updatedOrder = response.data;

// // //         // Cập nhật order trong tabs
// // //         setTabs((prev) =>
// // //           prev.map((tab) =>
// // //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// // //           )
// // //         );

// // //         // Tải lại sản phẩm
// // //         const products = await fetchInvoiceProducts(hoaDonId, true);

// // //         // Tính toán lại tổng tiền
// // //         const subtotal = calculateTotalBeforeDiscount(products);
// // //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// // //         const totalBeforeVoucher = subtotal + shippingFee;

// // //         // Tính toán giảm giá dựa trên voucher
// // //         let discountAmount = 0;
// // //         if (updatedOrder.phieuGiamGia) {
// // //           discountAmount = calculateDiscountAmount(
// // //             updatedOrder.phieuGiamGia,
// // //             totalBeforeVoucher
// // //           );
// // //         }

// // //         const finalTotal = totalBeforeVoucher - discountAmount;

// // //         // Cập nhật totals
// // //         const newTotals = {
// // //           subtotal,
// // //           shippingFee,
// // //           totalBeforeVoucher,
// // //           discountAmount,
// // //           finalTotal,
// // //         };

// // //         setTotals((prev) => ({
// // //           ...prev,
// // //           [hoaDonId]: newTotals,
// // //         }));

// // //         // Cập nhật UI nếu đang ở tab này
// // //         if (hoaDonId === activeKey) {
// // //           setTotalBeforeDiscount(subtotal);
// // //           setTotalAmount(finalTotal);
// // //         }

// // //         // Đóng gợi ý voucher
// // //         setVoucherSuggestions({
// // //           show: false,
// // //           betterVouchers: [],
// // //         });

// // //         return true;
// // //       }
// // //       return false;
// // //     } catch (error) {
// // //       console.error("Lỗi khi áp dụng voucher gợi ý:", error);
// // //       message.error("Lỗi khi áp dụng voucher");
// // //       return false;
// // //     }
// // //   };

// // //   return (
// // //     <Layout
// // //       style={{ height: "100vh", boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)" }}
// // //     >
// // //       <Sider
// // //         width="100%"
// // //         style={{
// // //           background: "#fff",
// // //           padding: 20,
// // //           position: "relative",
// // //           height: "100%",
// // //           overflowY: "hidden", // Ngăn scroll toàn bộ Sider
// // //         }}
// // //       >
// // //         {/* Dòng chứa Nút "Tạo hóa đơn" */}
// // //         <Row style={{ marginBottom: 16 }}>
// // //           <Col span={20}>
// // //             <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
// // //               Quản lý bán hàng
// // //             </Text>
// // //           </Col>
// // //           <Col span={4}>
// // //             <Button
// // //               onClick={addTab}
// // //               type="primary"
// // //               style={{
// // //                 zIndex: 1,
// // //               }}
// // //             >
// // //               <IoIosAddCircle />
// // //               Tạo đơn hàng mới
// // //             </Button>
// // //           </Col>
// // //         </Row>

// // //         {/* Khi không có hóa đơn nào, hiển thị thông báo */}
// // //         {tabs.length === 0 ? (
// // //           <Row
// // //             justify="center"
// // //             align="middle"
// // //             style={{ height: "calc(100% - 60px)" }}
// // //           >
// // //             <Col>
// // //               <Title level={3}>
// // //                 Không có hóa đơn ở trạng thái chờ xác nhận
// // //               </Title>
// // //             </Col>
// // //           </Row>
// // //         ) : (
// // //           <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
// // //             <Tabs
// // //               type="editable-card"
// // //               onChange={setActiveKey}
// // //               activeKey={activeKey}
// // //               onEdit={handleEditTab}
// // //               items={items}
// // //             />
// // //           </div>
// // //         )}
// // //       </Sider>
// // //       <Content
// // //         style={{
// // //           padding: 24,
// // //           height: "100%",
// // //           overflow: "hidden",
// // //         }}
// // //       />

// // //       {/* Customer Selection Dialog */}
// // //       <Modal
// // //         title="Chọn khách hàng"
// // //         visible={openCustomerDialog}
// // //         onCancel={() => setOpenCustomerDialog(false)}
// // //         footer={null}
// // //       >
// // //         <List
// // //           dataSource={customers}
// // //           renderItem={(customer) => (
// // //             <List.Item
// // //               actions={[
// // //                 <Button
// // //                   type="primary"
// // //                   onClick={() => handleCustomerSelected(activeKey, customer.id)}
// // //                 >
// // //                   Chọn
// // //                 </Button>,
// // //               ]}
// // //             >
// // //               <List.Item.Meta
// // //                 avatar={<Avatar src={customer.avatar} />}
// // //                 title={customer.tenKhachHang}
// // //                 description={
// // //                   <>
// // //                     {customer.soDienThoai}
// // //                     <br />
// // //                     {customer.email}
// // //                   </>
// // //                 }
// // //               />
// // //             </List.Item>
// // //           )}
// // //         />
// // //       </Modal>

// // //       {/* Voucher Selection Dialog */}
// // //       <Modal
// // //         title="Chọn voucher"
// // //         open={openVoucherDialog}
// // //         onCancel={() => setOpenVoucherDialog(false)}
// // //         footer={null}
// // //         ref={modalRef}
// // //       >
// // //         <List
// // //           dataSource={vouchers}
// // //           renderItem={(voucher) => (
// // //             <List.Item
// // //               style={{
// // //                 border:
// // //                   selectedVoucher?.id === voucher.id
// // //                     ? "2px solid #1890ff"
// // //                     : "1px solid #d9d9d9",
// // //                 borderRadius: "8px",
// // //                 padding: "16px",
// // //                 marginBottom: "8px",
// // //                 backgroundColor:
// // //                   selectedVoucher?.id === voucher.id ? "#f0f5ff" : "white",
// // //               }}
// // //               actions={[
// // //                 <Radio
// // //                   checked={selectedVoucher?.id === voucher.id}
// // //                   onChange={() => setSelectedVoucher(voucher)}
// // //                 />,
// // //               ]}
// // //             >
// // //               <List.Item.Meta
// // //                 title={voucher.maPhieuGiamGia}
// // //                 description={
// // //                   <div>
// // //                     <div>
// // //                       {voucher.loaiPhieuGiamGia === 1
// // //                         ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
// // //                             voucher.soTienGiamToiDa
// // //                           )})`
// // //                         : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
// // //                     </div>
// // //                     <div>
// // //                       Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
// // //                     </div>
// // //                   </div>
// // //                 }
// // //               />
// // //             </List.Item>
// // //           )}
// // //         />
// // //         <Button
// // //           type="primary"
// // //           block
// // //           disabled={!selectedVoucher}
// // //           onClick={() => handleVoucherSelected(activeKey, selectedVoucher.id)}
// // //         >
// // //           Áp dụng
// // //         </Button>
// // //       </Modal>

// // //       {/* Add ProductTable component */}
// // //       <ProductTable
// // //         products={products}
// // //         onAddProduct={handleAddProductToOrder}
// // //         open={openProductTable}
// // //         onClose={() => setOpenProductTable(false)}
// // //       />

// // //       {/* Add PreviewModal component */}
// // //       <PreviewModal />
// // //     </Layout>
// // //   );
// // // };

// // // export default BanHang;
// // import React, { useEffect, useState, useRef } from "react";
// // import "./BanHangCss.css";
// // import {
// //   Layout,
// //   Button,
// //   Row,
// //   Col,
// //   Tabs,
// //   Typography,
// //   Input,
// //   Table,
// //   Space,
// //   Avatar,
// //   Radio,
// //   InputNumber,
// //   Modal,
// //   Select,
// //   List,
// //   Tag,
// //   Carousel,
// //   Divider, // Add this import
// //   Modal as AntdModal, // Add this import
// //   Alert, // Add this import
// //   Card, // Add this import
// //   Collapse, // Add this import
// // } from "antd";
// // import {
// //   PlusOutlined,
// //   CloseOutlined,
// //   SelectOutlined,
// //   SearchOutlined,
// //   TagOutlined, // Add this import
// //   InfoCircleOutlined, // Add this import
// //   DeleteOutlined,
// //   PrinterOutlined, // Add this import
// // } from "@ant-design/icons";
// // import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
// // import { BiQrScan } from "react-icons/bi";
// // import { AiOutlineSelect } from "react-icons/ai";
// // import { Option } from "antd/es/mentions";
// // import axios from "axios";
// // import { message } from "antd";
// // import api from "../../utils/api";
// // import { formatCurrency } from "../../utils/format";
// // import ProductTable from "../HoaDon/ProductTable";
// // import { Client } from "@stomp/stompjs";
// // import SockJS from "sockjs-client";
// // import { MenuItem, FormControl, InputLabel } from "@mui/material";
// // const { Content, Sider } = Layout;
// // const { TabPane } = Tabs;
// // const { Title, Text } = Typography;

// // // Add near the top of the file with other constants
// // const PAYMENT_METHOD = {
// //   CASH: "COD",
// //   // Add other payment methods as needed
// // };

// // // Di chuyển các hàm helper ra ngoài component
// // const calculateDiscountAmount = (voucher, total) => {
// //   // Kiểm tra điều kiện áp dụng voucher
// //   if (!voucher || !total || total < voucher.giaTriToiThieu) {
// //     console.log('Không đủ điều kiện áp dụng voucher:', {
// //       total,
// //       minRequired: voucher?.giaTriToiThieu
// //     });
// //     return 0;
// //   }

// //   let discountAmount = 0;

// //   // Kiểm tra loại voucher
// //   if (voucher.loaiPhieuGiamGia === 1) {
// //     // Loại 1: Giảm theo phần trăm
// //     // Tính số tiền giảm = tổng tiền * phần trăm giảm / 100
// //     discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);
    
// //     console.log('Tính giảm giá theo %:', {
// //       total,
// //       percent: voucher.giaTriGiam,
// //       calculatedDiscount: discountAmount,
// //       maxDiscount: voucher.soTienGiamToiDa
// //     });

// //     // Nếu có giới hạn giảm tối đa và số tiền giảm vượt quá giới hạn
// //     if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
// //       discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
// //       console.log('Áp dụng giới hạn tối đa:', discountAmount);
// //     }
// //   } else {
// //     // Loại khác: Giảm theo số tiền cố định
// //     discountAmount = Math.min(voucher.giaTriGiam, total);
// //     console.log('Tính giảm giá cố định:', {
// //       fixedAmount: voucher.giaTriGiam,
// //       total,
// //       finalDiscount: discountAmount
// //     });
// //   }

// //   // Đảm bảo số tiền giảm không âm và không vượt quá tổng tiền
// //   discountAmount = Math.max(0, Math.min(discountAmount, total));
  
// //   console.log('Kết quả cuối cùng:', {
// //     voucherId: voucher.id,
// //     voucherCode: voucher.maPhieuGiamGia,
// //     total,
// //     finalDiscount: discountAmount
// //   });
  
// //   return discountAmount;
// // };

// // const BanHang = () => {
// //   const socket = useRef(null);
// //   const [isModalVisibleListSPCT, setIsModalVisibleListSPCT] = useState(false); // Trạng thái hiển thị Modal
// //   const [sanPhamChiTiet, setSanPhamChiTiet] = useState([]);
// //   const [tabs, setTabs] = useState([]); // Bắt đầu không có tab
// //   const [activeTab, setActiveTab] = useState(null);
// //   const [products, setProducts] = useState([]); // Danh sách sản phẩm trong tab
// //   const [searchText, setSearchText] = useState("");
// //   const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
// //   const [activeKey, setActiveKey] = useState(null); // Giữ tab đang mở
// //   const [orderProducts, setOrderProducts] = useState({}); // Products in each order tab
// //   const [loading, setLoading] = useState(false);
// //   const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
// //   const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
// //   const [selectedVoucher, setSelectedVoucher] = useState(null);
// //   const [vouchers, setVouchers] = useState([]);
// //   const [customers, setCustomers] = useState([]);
// //   const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
// //   const [loadingPayments, setLoadingPayments] = useState(false);
// //   const [paymentHistory, setPaymentHistory] = useState([]);
// //   const [openProductTable, setOpenProductTable] = useState(false);
// //   const [selectedProducts, setSelectedProducts] = useState([]);
// //   const [modalRef] = useState(React.createRef());
// //   const [totalAmount, setTotalAmount] = useState(0); // Add new state for total amount
// //   const [totals, setTotals] = useState({});
// //   const [paymentMethods, setPaymentMethods] = useState([]);
// //   const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
// //   const [previewOpen, setPreviewOpen] = useState(false);
// //   const [pdfUrl, setPdfUrl] = useState(null);
// //   const [customerPayment, setCustomerPayment] = useState({});
// //   const [suggestedVoucher, setSuggestedVoucher] = useState(null);
// //   const [additionalAmount, setAdditionalAmount] = useState(0);
// //   const [suggestedProducts, setSuggestedProducts] = useState([]);
// //   // Thêm state mới để kiểm soát việc hiển thị gợi ý
// //   const [showSuggestions, setShowSuggestions] = useState(false);
// //   // Thêm state mới
// //   const [voucherSuggestion, setVoucherSuggestion] = useState({
// //     show: false,
// //     voucher: null,
// //     amountNeeded: 0,
// //     products: []
// //   });
// //   // Cập nhật state để lưu nhiều gợi ý voucher
// //   const [voucherSuggestions, setVoucherSuggestions] = useState({
// //     show: false,
// //     betterVouchers: []
// //   });

// //   // Add this function to calculate change/remaining amount
// //   const calculateChange = (hoaDonId) => {
// //     const orderTotals = totals[hoaDonId];
// //     if (!orderTotals) return { change: 0, remaining: 0 };

// //     const amountPaid = customerPayment[hoaDonId] || 0;
// //     const finalTotal = orderTotals.finalTotal || 0;

// //     if (amountPaid >= finalTotal) {
// //       return {
// //         change: amountPaid - finalTotal,
// //         remaining: 0,
// //       };
// //     } else {
// //       return {
// //         change: 0,
// //         remaining: finalTotal - amountPaid,
// //       };
// //     }
// //   };

// //   // Cấu hình cột cho bảng
// //   const columns = [
// //     {
// //       title: "STT",
// //       key: "index",
// //       width: 60,
// //       align: "center",
// //       //render: (_, __, index) => index + 1,
// //       render: (_, __, index) => {
// //         // Tính toán lại index khi chuyển trang
// //         return pagination.pageSize * (pagination.current - 1) + index + 1;
// //       },
// //     },
// //     {
// //       title: "Hình ảnh",
// //       dataIndex: "hinhAnh",
// //       key: "hinhAnh",
// //       align: "center",
// //       width: 180,
// //       render: (hinhAnh) => {
// //         return (
// //           <div style={{ width: 150, height: 120, overflow: "hidden" }}>
// //             {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
// //               <Carousel autoplay dots={false} effect="fade">
// //                 {hinhAnh.map((url, index) => (
// //                   <img
// //                     key={index}
// //                     src={url}
// //                     alt={`Sản phẩm ${index}`}
// //                     style={{
// //                       width: "100%",
// //                       height: "100%",
// //                       objectFit: "cover",
// //                       borderRadius: 5,
// //                       display: "block",
// //                     }}
// //                   />
// //                 ))}
// //               </Carousel>
// //             ) : (
// //               <img
// //                 src="https://via.placeholder.com/50"
// //                 alt="Không có ảnh"
// //                 style={{
// //                   width: "100%",
// //                   height: "100%",
// //                   objectFit: "cover",
// //                   borderRadius: 5,
// //                   display: "block",
// //                 }}
// //               />
// //             )}
// //           </div>
// //         );
// //       },
// //     },
// //     {
// //       title: "Thông tin",
// //       key: "thongTin",
// //       align: "center",
// //       width: 180,
// //       render: (_, record) => (
// //         <Space direction="vertical" size={0}>
// //           <Typography.Text strong>{record.tenSanPham}</Typography.Text>
// //           <Typography.Text type="secondary">
// //             Mã: {record.maSanPham}
// //           </Typography.Text>
// //           <Typography.Text type="secondary">
// //             Chất liệu: {record.chatLieu}
// //           </Typography.Text>
// //         </Space>
// //       ),
// //     },
// //     {
// //       title: "Màu sắc",
// //       key: "mauSac",
// //       align: "center",
// //       width: 180,
// //       render: (_, record) => (
// //         <Space size="middle">
// //           <Typography.Text>{record.mauSac}</Typography.Text>
// //           <div
// //             style={{
// //               display: "inline-block",
// //               width: 50, // Chiều rộng
// //               height: 20, // Chiều cao
// //               borderRadius: 6, // Bo góc mềm mại
// //               backgroundColor: record.maMauSac || "#FFFFFF",
// //               border: "1px solid rgba(0, 0, 0, 0.2)", // Viền tinh tế
// //               boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Hiệu ứng bóng đổ nhẹ
// //             }}
// //           ></div>
// //         </Space>
// //       ),
// //     },

// //     {
// //       title: "Kích thước",
// //       key: "kichThuoc",
// //       align: "center",
// //       width: 100,
// //       render: (_, record) => (
// //         <Typography.Text>{record.kichThuoc}</Typography.Text>
// //       ),
// //     },

// //     {
// //       title: "Đơn giá",
// //       key: "gia",
// //       width: 140,
// //       align: "center",
// //       render: (_, record) => formatCurrency(record.gia),
// //     },
// //     {
// //       title: "Số lượng",
// //       key: "soLuong",
// //       width: 120,
// //       align: "center",
// //       render: (_, record) => (
// //         <InputNumber
// //           min={1}
// //           max={record.soLuongTonKho}
// //           value={record.soLuong}
// //           onChange={(value) =>
// //             handleUpdateQuantity(activeKey, record.id, value)
// //           }
// //           style={{ width: 80 }}
// //         />
// //       ),
// //     },
// //     {
// //       title: "Thành tiền",
// //       key: "thanhTien",
// //       width: 140,
// //       align: "center",
// //       render: (_, record) => formatCurrency(record.gia * record.soLuong),
// //     },
// //     {
// //       title: "",
// //       key: "action",
// //       width: 80,
// //       align: "center",
// //       render: (_, record) => (
// //         <Button
// //           type="link"
// //           danger
// //           icon={<DeleteOutlined />}
// //           onClick={() => handleRemoveProduct(activeKey, record.id)}
// //         />
// //       ),
// //     },
// //   ];

// //   const handleTableChange = (pagination) => {
// //     setPagination(pagination);
// //     if (activeKey) {
// //       fetchInvoiceProducts(activeKey);
// //     }
// //   };
// //   // Hàm đóng modal
// //   const handleCancelListSanPhamChiTiet = () => {
// //     setIsModalVisibleListSPCT(false);
// //   };
// //   // 1. Load pending orders
// //   const fetchPendingOrders = async (isInitializing = false) => {
// //     try {
// //       const response = await api.get("/api/admin/ban-hang/hoadoncho");
// //       const orders = response.data;

// //       if (orders.length > 0) {
// //         // Ghi log thông tin hóa đơn để debug
// //         console.log('Danh sách hóa đơn từ server:', orders.map(order => ({
// //           id: order.id,
// //           maHoaDon: order.maHoaDon,
// //           tongTien: order.tongTien,
// //           giamGia: order.giamGia,
// //           tongThanhToan: order.tongThanhToan,
// //           phieuGiamGia: order.phieuGiamGia
// //         })));
        
// //         const newTabs = orders.map((order, index) => ({
// //           key: order.id,
// //           title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
// //           order: order,
// //         }));

// //         setTabs(newTabs);
        
// //         // Chỉ đặt activeKey nếu chưa có hoặc đang khởi tạo
// //         if (!activeKey || isInitializing) {
// //           setActiveKey(orders[0].id);
// //         }

// //         // Tải sản phẩm và tính toán tổng tiền cho mỗi hóa đơn
// //         // Không gọi refreshInvoiceData để tránh lỗi API
// //         const productsMap = {};
// //         const totalsMap = {};
        
// //         for (const order of orders) {
// //           try {
// //             // Tải sản phẩm
// //             const products = await fetchInvoiceProducts(order.id, true);
// //             productsMap[order.id] = products;
            
// //             // Tính toán tổng tiền
// //             const subtotal = calculateTotalBeforeDiscount(products);
// //             const shippingFee = order.phiVanChuyen || 0;
// //             const totalBeforeVoucher = subtotal + shippingFee;
// //             const discountAmount = order.giamGia || 0;
// //             const finalTotal = totalBeforeVoucher - discountAmount;
            
// //             totalsMap[order.id] = {
// //               subtotal,
// //               shippingFee,
// //               totalBeforeVoucher,
// //               discountAmount,
// //               finalTotal,
// //             };
// //           } catch (error) {
// //             console.error(`Lỗi khi tải dữ liệu cho hóa đơn ${order.id}:`, error);
// //           }
// //         }
        
// //         // Cập nhật state
// //         setOrderProducts(productsMap);
// //         setTotals(totalsMap);
        
// //         // Cập nhật UI cho tab hiện tại
// //         if (activeKey && totalsMap[activeKey]) {
// //           setTotalBeforeDiscount(totalsMap[activeKey].subtotal);
// //           setTotalAmount(totalsMap[activeKey].finalTotal);
// //         }

// //         // Lưu vào localStorage
// //         localStorage.setItem("pendingOrders", JSON.stringify(newTabs));
// //         localStorage.setItem("orderProducts", JSON.stringify(productsMap));
// //         localStorage.setItem("orderTotals", JSON.stringify(totalsMap));
// //       } else {
// //         // Nếu không có đơn hàng, xóa dữ liệu cũ
// //         setTabs([]);
// //         setOrderProducts({});
// //         setTotals({});
// //         setActiveKey(null);
// //         setTotalBeforeDiscount(0);
// //         setTotalAmount(0);
        
// //         // Xóa localStorage
// //         localStorage.removeItem("pendingOrders");
// //         localStorage.removeItem("orderProducts");
// //         localStorage.removeItem("orderTotals");
// //       }
// //     } catch (error) {
// //       console.error("Lỗi khi tải danh sách hóa đơn:", error);
// //       message.error("Lỗi khi tải danh sách hóa đơn");
// //     }
// //   };

// //   useEffect(() => {
// //     const initializeData = async () => {
// //       try {
// //         // Đặt cờ để tránh các cập nhật không cần thiết
// //         const isInitializing = true;
        
// //         // Tải phương thức thanh toán
// //         const paymentResponse = await api.get("/api/phuong-thuc-thanh-toan");
// //         setPaymentMethods(paymentResponse.data);
        
// //         // Khôi phục dữ liệu từ localStorage trước
// //         const savedOrders = localStorage.getItem("pendingOrders");
// //         const savedProducts = localStorage.getItem("orderProducts");
// //         const savedTotals = localStorage.getItem("orderTotals");

// //         if (savedOrders) {
// //           setTabs(JSON.parse(savedOrders));
// //         }
// //         if (savedProducts) {
// //           setOrderProducts(JSON.parse(savedProducts));
// //         }
// //         if (savedTotals) {
// //           const parsedTotals = JSON.parse(savedTotals);
// //           setTotals(parsedTotals);
          
// //           // Nếu có activeKey, cập nhật tổng tiền ngay lập tức
// //           const firstOrderId = JSON.parse(savedOrders)?.[0]?.key;
// //           if (firstOrderId && parsedTotals[firstOrderId]) {
// //             setTotalBeforeDiscount(parsedTotals[firstOrderId].subtotal);
// //             setTotalAmount(parsedTotals[firstOrderId].finalTotal);
// //           }
// //         }
        
// //         // Sau đó mới gọi API để cập nhật dữ liệu mới nhất
// //         await fetchPendingOrders(true); // Truyền tham số true để đánh dấu đây là lần khởi tạo
// //       } catch (error) {
// //         console.error("Lỗi khởi tạo dữ liệu:", error);
// //       }
// //     };
    
// //     initializeData();
    
// //     // Chỉ chạy một lần khi component mount
// //   }, []);

// //   // Cập nhật useEffect cho việc chọn tab để tải lại dữ liệu chính xác
// //   useEffect(() => {
// //     if (activeKey) {
// //       console.log('Tab changed to:', activeKey);
      
// //       // Tải lại thông tin hóa đơn từ server
// //       fetchInvoiceById(activeKey).then(() => {
// //         // Sau khi có dữ liệu mới, tính toán lại tổng tiền
// //         const newTotals = calculateOrderTotals(activeKey);
// //         setTotals(prev => ({
// //           ...prev,
// //           [activeKey]: newTotals
// //         }));
        
// //         // Cập nhật UI
// //         setTotalBeforeDiscount(newTotals.subtotal);
// //         setTotalAmount(newTotals.finalTotal);
        
// //         // Tìm voucher tốt hơn và gợi ý
// //         findBestVoucherAndSuggest(activeKey);
// //       });
      
// //       // Đặt lại pagination
// //       setPagination({ current: 1, pageSize: 3 });
// //     }
// //   }, [activeKey]);

// //   // Add WebSocket connection setup
// //   useEffect(() => {
// //     // Initialize WebSocket connection
// //     const socket = new SockJS("http://localhost:8080/ws");
// //     const stompClient = new Client({
// //       webSocketFactory: () => socket,
// //       onConnect: () => {
// //         console.log("✅ WebSocket connected");

// //         // Subscribe to pending orders updates
// //         stompClient.subscribe("/topic/hoa-don-cho", (message) => {
// //           console.log("🔄 Pending orders updated");
// //           fetchPendingOrders();
// //         });

// //         // Subscribe to individual order updates
// //         tabs.forEach((tab) => {
// //           stompClient.subscribe(`/topic/hoa-don/${tab.key}`, (message) => {
// //             console.log(`🔄 Order ${tab.key} updated`);
// //             fetchInvoiceProducts(tab.key).then((products) => {
// //               setOrderProducts((prev) => ({
// //                 ...prev,
// //                 [tab.key]: products,
// //               }));
// //             });
// //           });
// //         });
// //       },
// //       onStompError: (frame) => {
// //         console.error("STOMP error:", frame.headers["message"]);
// //         console.error("STOMP error details:", frame.body);
// //       },
// //       onWebSocketError: (event) => {
// //         console.error("WebSocket error:", event);
// //       },
// //       onDisconnect: () => console.log("❌ WebSocket disconnected"),
// //     });

// //     stompClient.activate();

// //     return () => {
// //       stompClient.deactivate();
// //     };
// //   }, [tabs]); // Reconnect when tabs change

// //   // Add this useEffect for initialization
// //   useEffect(() => {
// //     setOrderProducts({});
// //     setTotalBeforeDiscount(0);
// //     fetchPendingOrders();
// //   }, []);

// //   // 2. Create new order
// //   const addTab = async () => {
// //     try {
// //       // Check if there are already 5 pending orders
// //       const pendingOrdersCount = tabs.filter(
// //         (tab) => tab.order.trangThai === 1
// //       ).length;
// //       if (pendingOrdersCount >= 10) {
// //         message.error("Bạn chỉ có thể tạo tối đa 10 đơn hàng chờ xác nhận");
// //         return;
// //       }

// //       setLoading(true);
// //       const response = await api.post("/api/admin/ban-hang/create", {
// //         emailNhanVien: "vnv@gmail.com", // Replace with actual logged-in user
// //       });

// //       const newOrder = response.data;
// //       // Use id instead of maHoaDon for API calls
// //       const newOrderKey = newOrder.id;

// //       setTabs((prev) => [
// //         ...prev,
// //         {
// //           key: newOrderKey,
// //           title: `Đơn hàng ${prev.length + 1} - ${newOrder.maHoaDon}`, // Display maHoaDon
// //           order: newOrder,
// //         },
// //       ]);

// //       setOrderProducts((prev) => ({
// //         ...prev,
// //         [newOrderKey]: [],
// //       }));

// //       setActiveKey(newOrderKey);
// //       message.success("Tạo đơn hàng mới thành công");

// //       // After successful tab creation, subscribe to its updates
// //       if (socket.current) {
// //         socket.current.subscribe(`/topic/hoa-don/${newOrderKey}`, (message) => {
// //           fetchInvoiceProducts(newOrderKey).then((products) => {
// //             setOrderProducts((prev) => ({
// //               ...prev,
// //               [newOrderKey]: products,
// //             }));
// //           });
// //         });
// //       }
// //     } catch (error) {
// //       message.error("Lỗi khi tạo đơn hàng mới");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 3. Add product to order
// //   const handleAddProductToOrder = async (products, quantity = 1) => {
// //     if (!activeKey) {
// //         message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
// //         return;
// //     }

// //     if (!products || (Array.isArray(products) && products.length === 0)) {
// //         message.warning("Không có sản phẩm nào để thêm vào hóa đơn.");
// //         return;
// //     }

// //     try {
// //         // Kiểm tra xem có phải danh sách sản phẩm không
// //         const isMultiple = Array.isArray(products);
// //         const productList = isMultiple 
// //             ? products.map(p => ({ sanPhamChiTietId: p.id, soLuong: p.soLuong || 1 }))
// //             : [{ sanPhamChiTietId: products.id, soLuong: quantity || 1 }];

// //         // Gửi API yêu cầu thêm sản phẩm
// //         const response = await api.post(`/api/admin/ban-hang/${activeKey}/add-product`, { productList });

// //         if (!response || !response.data) {
// //             throw new Error("Dữ liệu trả về từ API không hợp lệ.");
// //         }

// //         console.log("✅ API Response:", response.data);

// //         // Cập nhật UI sau khi thêm sản phẩm thành công
// //         const [updatedProducts] = await Promise.all([
// //             fetchInvoiceProducts(activeKey),
// //             autoApplyBestVoucher(activeKey),
// //         ]);

// //         setOrderProducts(prev => ({ ...prev, [activeKey]: updatedProducts }));
// //         setTotals(prev => ({
// //             ...prev,
// //             [activeKey]: calculateOrderTotals(activeKey),
// //         }));

// //         message.success(`Đã thêm ${isMultiple ? `${products.length} sản phẩm` : "sản phẩm"} vào hóa đơn`);
// //     } catch (error) {
// //         console.error("❌ Lỗi khi thêm sản phẩm:", error);
// //         message.error("Lỗi khi thêm sản phẩm, vui lòng kiểm tra lại.");
// //     }
// // };

  

// //   // 4. Update product quantity
// //   const handleUpdateQuantity = async (
// //     hoaDonId,
// //     hoaDonChiTietId,
// //     newQuantity
// //   ) => {
// //     if (newQuantity < 1) return message.error("Số lượng phải lớn hơn 0");

// //     try {
// //       setOrderProducts((prev) => ({
// //         ...prev,
// //         [hoaDonId]: prev[hoaDonId].map((product) =>
// //           product.id === hoaDonChiTietId
// //             ? { ...product, soLuong: newQuantity }
// //             : product
// //         ),
// //       }));

// //       const updatedProducts = orderProducts[hoaDonId].map((product) =>
// //         product.id === hoaDonChiTietId
// //           ? { ...product, soLuong: newQuantity }
// //           : product
// //       );

// //       const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
// //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));

// //       await api.put(
// //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}/so-luong`,
// //         { soLuong: newQuantity }
// //       );

// //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// //       await autoApplyBestVoucher(hoaDonId);
// //       await fetchInvoiceProducts(hoaDonId);
// //       await findBestVoucherAndSuggest(hoaDonId);
// //     } catch (error) {
// //       console.error("Lỗi khi cập nhật số lượng:", error);
// //       message.error("Lỗi khi cập nhật số lượng!");
// //       await fetchInvoiceProducts(hoaDonId);
// //     }
// //   };

// //   // 5. Remove product
// //   const handleRemoveProduct = async (hoaDonId, hoaDonChiTietId) => {
// //     try {
// //       const updatedProducts = orderProducts[hoaDonId].filter(
// //         (product) => product.id !== hoaDonChiTietId
// //       );

// //       setOrderProducts((prev) => ({ ...prev, [hoaDonId]: updatedProducts }));

// //       await api.delete(
// //         `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`
// //       );

// //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //       const newTotalBeforeVoucher =
// //         calculateTotalBeforeDiscount(updatedProducts) +
// //         (currentOrder?.phiVanChuyen || 0);

// //       if (
// //         currentOrder?.phieuGiamGia &&
// //         newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
// //       ) {
// //         await handleRemoveVoucher(hoaDonId);
// //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// //       }

// //       setTotals((prev) => ({
// //         ...prev,
// //         [hoaDonId]: calculateOrderTotals(hoaDonId),
// //       }));

// //       await fetchInvoiceProducts(hoaDonId);

// //       // 🟢 Tự động áp dụng mã giảm giá tốt nhất
// //       await autoApplyBestVoucher(hoaDonId);
// //     } catch (error) {
// //       console.error("Lỗi khi xóa sản phẩm:", error);
// //       message.error("Lỗi khi xóa sản phẩm!");
// //     }
// //   };

// //   // 6. Apply voucher
// //   const handleVoucherSelected = async (hoaDonId, voucherId) => {
// //     try {
// //       console.log('Áp dụng voucher từ dialog:', { hoaDonId, voucherId });
      
// //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// //       if (!hoaDonId || !voucherId) {
// //         console.error('hoaDonId hoặc voucherId không hợp lệ');
// //         message.error('Không thể áp dụng voucher');
// //         return;
// //       }
      
// //       // Sửa endpoint API - thêm /voucher vào cuối URL
// //       const response = await api.post(`/api/admin/hoa-don/${hoaDonId}/voucher`, {
// //         voucherId: voucherId,
// //       });

// //       if (response.data) {
// //         const updatedOrder = response.data;
        
// //         // Cập nhật order trong tabs
// //         setTabs(prev =>
// //           prev.map(tab =>
// //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //           )
// //         );
        
// //         // Tải lại sản phẩm
// //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// //         // Tính toán lại tổng tiền
// //         const subtotal = calculateTotalBeforeDiscount(products);
// //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// //         const totalBeforeVoucher = subtotal + shippingFee;
        
// //         // Tính toán giảm giá dựa trên voucher
// //         let discountAmount = 0;
// //         if (updatedOrder.phieuGiamGia) {
// //           discountAmount = calculateDiscountAmount(
// //             updatedOrder.phieuGiamGia,
// //             totalBeforeVoucher
// //           );
// //         }
        
// //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// //         // Cập nhật totals
// //         const newTotals = {
// //           subtotal,
// //           shippingFee,
// //           totalBeforeVoucher,
// //           discountAmount,
// //           finalTotal,
// //         };
        
// //         setTotals(prev => ({
// //           ...prev,
// //           [hoaDonId]: newTotals
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(subtotal);
// //           setTotalAmount(finalTotal);
// //         }
        
// //         setOpenVoucherDialog(false);
// //         message.success("Áp dụng voucher thành công");
// //       }
// //     } catch (error) {
// //       console.error("Lỗi khi áp dụng voucher:", error);
// //       message.error("Lỗi khi áp dụng voucher");
// //     }
// //   };

// //   // 7. Remove voucher
// //   const handleRemoveVoucher = async (hoaDonId) => {
// //     try {
// //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //       const currentProducts = orderProducts[hoaDonId] || [];

// //       // Tính toán lại tổng tiền ngay lập tức
// //       const subtotal = calculateTotalBeforeDiscount(currentProducts);
// //       const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);
// //       const finalTotal = totalWithShipping; // Không còn mã giảm giá

// //       // Cập nhật UI ngay lập tức
// //       setTabs((prev) =>
// //         prev.map((tab) =>
// //           tab.key === hoaDonId
// //             ? {
// //                 ...tab,
// //                 order: {
// //                   ...tab.order,
// //                   tongTien: totalWithShipping,
// //                   giamGia: 0,
// //                   tongThanhToan: finalTotal,
// //                   phieuGiamGia: null, // Xóa voucher khỏi state
// //                 },
// //               }
// //             : tab
// //         )
// //       );

// //       setTotals((prev) => ({
// //         ...prev,
// //         [hoaDonId]: {
// //           subtotal,
// //           shippingFee: currentOrder?.phiVanChuyen || 0,
// //           totalBeforeVoucher: totalWithShipping,
// //           discountAmount: 0,
// //           finalTotal,
// //         },
// //       }));

// //       //Gọi API để xóa voucher trên server
// //       await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`);

// //       message.success("Đã xóa voucher");
// //       await fetchInvoiceProducts(hoaDonId);
// //     } catch (error) {
// //       console.error("Lỗi khi xóa voucher:", error);
// //       message.error("Lỗi khi xóa voucher!");
// //       await fetchInvoiceProducts(hoaDonId);
// //     }
// //   };

// //   const fetchAvailableVouchers = async () => {
// //     try {
// //       const response = await api.get(
// //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeDiscount}`
// //       );
// //       setVouchers(response.data);
// //     } catch (error) {
// //       message.error("Lỗi khi tải danh sách voucher");
// //     }
// //   };

// //   // Replace loadVouchers function with fetchAvailableVouchers
// //   const loadVouchers = async (hoaDonId) => {
// //     try {
// //       await fetchAvailableVouchers();
// //     } catch (error) {
// //       message.error("Lỗi khi tải danh sách voucher");
// //     }
// //   };

// //   // 9. Confirm order
// //   const handleConfirmOrder = async (hoaDonId) => {
// //     try {
// //       const currentOrder = tabs.find((tab) => tab.key === hoaDonId)?.order;

// //       if (!currentOrder || !currentOrder.phuongThucThanhToan) {
// //         message.error(
// //           "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
// //         );
// //         return;
// //       }

// //       // Only check payment amount for cash payments
// //       if (
// //         currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
// //         PAYMENT_METHOD.CASH
// //       ) {
// //         const { remaining } = calculateChange(hoaDonId);
// //         if (remaining > 0) {
// //           message.error("Số tiền khách đưa chưa đủ để thanh toán!");
// //           return;
// //         }
// //       }

// //       await api.post(`/api/admin/ban-hang/${hoaDonId}/complete`, {
// //         phuongThucThanhToans: [
// //           currentOrder.phuongThucThanhToan.maPhuongThucThanhToan,
// //         ],
// //       });

// //       // Fetch the PDF for printing
// //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// //         responseType: "blob",
// //         headers: { Accept: "application/pdf, application/json" },
// //       });

// //       const contentType = response.headers["content-type"];
// //       if (!contentType.includes("application/pdf")) {
// //         message.error("Định dạng không hợp lệ từ máy chủ");
// //         return;
// //       }

// //       const blob = new Blob([response.data], { type: "application/pdf" });
// //       const url = window.URL.createObjectURL(blob);

// //       // Lưu URL của PDF và mở modal xem trước
// //       setPdfUrl(url);
// //       setPreviewOpen(true);

// //       // Đóng tab sau khi xác nhận thành công
// //       setTabs((prev) => prev.filter((tab) => tab.key !== hoaDonId));
// //       message.success("Xác nhận đơn hàng thành công");
// //     } catch (error) {
// //       message.error("Lỗi khi xác nhận đơn hàng");
// //     }
// //   };

// //   const handleDirectPrint = () => {
// //     const iframe = document.getElementById("pdf-preview");
// //     iframe.contentWindow.print();
// //   };

// //   // 10. Print invoice
// //   const handlePrintInvoice = async (hoaDonId) => {
// //     try {
// //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
// //         responseType: "blob",
// //       });

// //       const blob = new Blob([response.data], { type: "application/pdf" });
// //       const url = window.URL.createObjectURL(blob);
// //       window.open(url);
// //     } catch (error) {
// //       message.error("Lỗi khi in hóa đơn");
// //     }
// //   };

// //   // Cập nhật lại findBestVoucherAndSuggest để sử dụng hàm helper
// //   const findBestVoucherAndSuggest = async (hoaDonId) => {
// //     try {
// //       console.log('🔍 Tìm voucher tốt hơn cho đơn hàng:', hoaDonId);
      
// //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //       if (!order) {
// //         console.warn('⚠️ Không tìm thấy đơn hàng');
// //         return;
// //       }

// //       const currentProducts = orderProducts[hoaDonId] || [];
// //       const currentTotal = totals[hoaDonId]?.totalBeforeVoucher || 0;
      
// //       // Kiểm tra nếu tổng tiền quá nhỏ, không cần tìm voucher
// //       if (currentTotal < 10000) {
// //         setVoucherSuggestions({
// //           show: false,
// //           betterVouchers: []
// //         });
// //         return;
// //       }

// //       // Sử dụng cache để tránh gọi API liên tục
// //       const cacheKey = `vouchers_${Math.floor(currentTotal/10000)}`;
// //       let allVouchers = sessionStorage.getItem(cacheKey);
      
// //       if (!allVouchers) {
// //         const response = await api.get('/api/phieu-giam-gia');
// //         allVouchers = response.data || [];
// //         sessionStorage.setItem(cacheKey, JSON.stringify(allVouchers));
// //       } else {
// //         allVouchers = JSON.parse(allVouchers);
// //       }
      
// //       // Tính giảm giá hiện tại
// //       const currentDiscount = order.phieuGiamGia 
// //         ? calculateDiscountAmount(order.phieuGiamGia, currentTotal)
// //         : 0;
      
// //       // Lọc voucher có giá trị giảm tốt hơn voucher hiện tại
// //       const betterVouchers = allVouchers
// //         .filter(voucher => {
// //           if (voucher.id === order.phieuGiamGia?.id) return false;
          
// //           const potentialDiscount = calculateDiscountAmount(
// //             voucher, 
// //             Math.max(currentTotal, voucher.giaTriToiThieu)
// //           );
          
// //           return potentialDiscount > currentDiscount;
// //         })
// //         .map(voucher => ({
// //           ...voucher,
// //           amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
// //           potentialDiscount: calculateDiscountAmount(
// //             voucher, 
// //             Math.max(currentTotal, voucher.giaTriToiThieu)
// //           ),
// //           additionalSavings: calculateDiscountAmount(
// //             voucher, 
// //             Math.max(currentTotal, voucher.giaTriToiThieu)
// //           ) - currentDiscount
// //         }))
// //         .sort((a, b) => b.additionalSavings - a.additionalSavings)
// //         .slice(0, 3); // Giới hạn chỉ 3 voucher tốt nhất

// //       if (betterVouchers.length > 0) {
// //         // Tối ưu: Chỉ tìm sản phẩm gợi ý cho voucher cần thêm tiền
// //         const suggestedProducts = await Promise.all(
// //           betterVouchers
// //             .filter(v => v.amountNeeded > 0)
// //             .map(async voucher => {
// //               // Gợi ý tăng số lượng sản phẩm hiện có
// //               const currentProductSuggestions = currentProducts
// //                 .filter(p => p.gia > 0)
// //                 .map(p => ({
// //                   ...p,
// //                   quantityNeeded: Math.ceil(voucher.amountNeeded / p.gia)
// //                 }))
// //                 .sort((a, b) => a.quantityNeeded - b.quantityNeeded)
// //                 .slice(0, 2);
              
// //               // Lấy sản phẩm mới từ cache hoặc API
// //               let allProducts = sessionStorage.getItem('all_products');
// //               if (!allProducts) {
// //                 allProducts = await fetchAllProducts();
// //                 sessionStorage.setItem('all_products', JSON.stringify(allProducts));
// //               } else {
// //                 allProducts = JSON.parse(allProducts);
// //               }
              
// //               const currentProductIds = currentProducts.map(p => p.id);
              
// //               // Tìm sản phẩm có giá phù hợp
// //               const minPrice = voucher.amountNeeded * 0.7;
// //               const maxPrice = voucher.amountNeeded * 1.5;
              
// //               const newProductSuggestions = allProducts
// //                 .filter(p => !currentProductIds.includes(p.id))
// //                 .filter(p => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0)
// //                 .sort((a, b) => Math.abs(a.gia - voucher.amountNeeded) - Math.abs(b.gia - voucher.amountNeeded))
// //                 .slice(0, 3);
                
// //               return {
// //                 voucherId: voucher.id,
// //                 currentProducts: currentProductSuggestions,
// //                 newProducts: newProductSuggestions
// //               };
// //             })
// //         );
        
// //         // Cập nhật state với voucher và sản phẩm gợi ý
// //         setVoucherSuggestions({
// //           show: true,
// //           betterVouchers: betterVouchers.map((voucher, index) => ({
// //             ...voucher,
// //             suggestions: suggestedProducts.find(s => s?.voucherId === voucher.id) || {
// //               currentProducts: [],
// //               newProducts: []
// //             }
// //           }))
// //         });
// //       } else {
// //         setVoucherSuggestions({
// //           show: false,
// //           betterVouchers: []
// //         });
// //       }
// //     } catch (error) {
// //       console.error('Lỗi khi tìm voucher tốt hơn:', error);
// //       setVoucherSuggestions({
// //         show: false,
// //         betterVouchers: []
// //       });
// //     }
// //   };

// //   // Hàm xử lý khi người dùng áp dụng voucher được gợi ý
// //   const handleApplySuggestedVoucher = async (hoaDonId, voucherId) => {
// //     try {
// //       console.log('Áp dụng voucher gợi ý:', { hoaDonId, voucherId });
      
// //       // Gọi API để áp dụng voucher
// //       const response = await api.post(`/api/admin/hoa-don/${hoaDonId}/voucher`, {
// //         voucherId: voucherId,
// //       });

// //       if (response.data) {
// //         message.success("Áp dụng voucher thành công");
        
// //         // Tải lại thông tin hóa đơn từ server
// //         await fetchInvoiceById(hoaDonId);
        
// //         // Tính toán lại tổng tiền
// //         const newTotals = calculateOrderTotals(hoaDonId);
// //         setTotals(prev => ({
// //           ...prev,
// //           [hoaDonId]: newTotals
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(newTotals.subtotal);
// //           setTotalAmount(newTotals.finalTotal);
// //         }
        
// //         // Đóng gợi ý voucher
// //         setVoucherSuggestions({
// //           show: false,
// //           betterVouchers: []
// //         });
        
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.error("Lỗi khi áp dụng voucher gợi ý:", error);
// //       message.error("Lỗi khi áp dụng voucher");
// //       return false;
// //     }
// //   };

// //   // Hàm xử lý khi người dùng thêm sản phẩm từ gợi ý
// //   const handleAddSuggestedProduct = async (product) => {
// //     try {
// //       // Thêm sản phẩm vào đơn hàng
// //       await handleAddProductToOrder(product);
// //       message.success(`Đã thêm ${product.tenSanPham} vào đơn hàng`);
      
// //       // Tải lại thông tin hóa đơn từ server
// //       await fetchInvoiceById(activeKey);
      
// //       // Tính toán lại tổng tiền
// //       const newTotals = calculateOrderTotals(activeKey);
// //       setTotals(prev => ({
// //         ...prev,
// //         [activeKey]: newTotals
// //       }));
      
// //       // Cập nhật UI
// //       setTotalBeforeDiscount(newTotals.subtotal);
// //       setTotalAmount(newTotals.finalTotal);
      
// //       // Cập nhật lại gợi ý sau khi thêm sản phẩm
// //       setTimeout(() => {
// //         findBestVoucherAndSuggest(activeKey);
// //       }, 500);
// //     } catch (error) {
// //       console.error('Lỗi khi thêm sản phẩm:', error);
// //       message.error('Lỗi khi thêm sản phẩm vào đơn hàng');
// //     }
// //   };

// //   // Hàm xử lý khi người dùng tăng số lượng sản phẩm từ gợi ý
// //   const handleUpdateQuantityForSuggestion = async (hoaDonId, productId, newQuantity) => {
// //     try {
// //       // Cập nhật số lượng sản phẩm
// //       await handleUpdateQuantity(hoaDonId, productId, newQuantity);
// //       message.success('Đã cập nhật số lượng sản phẩm');
      
// //       // Tải lại thông tin hóa đơn từ server
// //       await fetchInvoiceById(hoaDonId);
      
// //       // Tính toán lại tổng tiền
// //       const newTotals = calculateOrderTotals(hoaDonId);
// //       setTotals(prev => ({
// //         ...prev,
// //         [hoaDonId]: newTotals
// //       }));
      
// //       // Cập nhật UI nếu đang ở tab này
// //       if (hoaDonId === activeKey) {
// //         setTotalBeforeDiscount(newTotals.subtotal);
// //         setTotalAmount(newTotals.finalTotal);
// //       }
      
// //       // Cập nhật lại gợi ý sau khi cập nhật số lượng
// //       setTimeout(() => {
// //         findBestVoucherAndSuggest(hoaDonId);
// //       }, 500);
// //     } catch (error) {
// //       console.error('Lỗi khi cập nhật số lượng:', error);
// //       message.error('Lỗi khi cập nhật số lượng sản phẩm');
// //     }
// //   };

// //   // Gợi ý mua thêm tiền để áp dụng mã giảm giá tốt hơn
// //   useEffect(() => {
// //     if (activeKey && orderProducts[activeKey]) {
// //       console.log("🔄 Cập nhật tổng tiền...");
  
// //       // 🟢 Tính tổng tiền trước khi cập nhật vào `totals`
// //       const newTotals = calculateOrderTotals(activeKey);
// //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// //       setTotalAmount(newTotals.finalTotal);
  
// //       console.log("📌 Tổng tiền mới:", newTotals);
// //     }
// //   }, [orderProducts, activeKey]);
  
// //   useEffect(() => {
// //     if (activeKey && totals[activeKey] && totals[activeKey].totalBeforeVoucher > 0) {
// //       console.log("🔄 Tổng tiền đã cập nhật, tìm voucher tốt nhất...");
// //       findBestVoucherAndSuggest(activeKey);
// //     }
// //   }, [totals, activeKey]); // Chỉ chạy khi tổng tiền thay đổi
  
  
    
// //   // Update order content rendering to show products table
// //  const renderOrderContent = (order) => (
// //   <Row gutter={16}>
// //     <Col
// //       span={17}
// //       style={{
// //         border: "1px solid #ccc",
// //         borderRadius: "8px",
// //         padding: "16px",
// //         maxHeight: "calc(100vh - 180px)",
// //         overflowY: "auto"
// //       }}
// //     >
// //       <Space direction="vertical" style={{ width: "100%" }}>
// //         <div style={{ display: "flex", justifyContent: "flex-end" }}>
// //           <Button>
// //             <BiQrScan />
// //             Quét mã QR
// //           </Button>
// //           <Button
// //             type="primary"
// //             onClick={() => setOpenProductTable(true)}
// //             style={{ marginLeft: 8 }}
// //           >
// //             <IoIosAddCircle />
// //             Thêm sản phẩm
// //           </Button>
// //         </div>
// //         <Table
// //           dataSource={orderProducts[order.id] || []}
// //           columns={columns}
// //           pagination={{
// //             current: pagination.current,
// //             pageSize: 3,
// //             showSizeChanger: false,
// //             total: orderProducts[order.id]?.length || 0,
// //             showTotal: (total) => `Tổng ${total} sản phẩm`,
// //             size: "small",
// //             position: ["bottomCenter"],
// //             onChange: (page) => {
// //               setPagination({ current: page, pageSize: 3 });
// //             },
// //           }}
// //           rowKey="id"
// //           bordered
// //           size="small"
// //           style={{
// //             marginTop: "10px",
// //             borderRadius: "8px",
// //             boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
// //           }}
// //           scroll={{ y: 'calc(100vh - 350px)' }}
// //         />
// //       </Space>
// //     </Col>
// //     <Col span={7}>
// //       <div
// //         style={{
// //           border: "1px solid #ccc",
// //           borderRadius: "8px",
// //           padding: "10px",
// //           maxHeight: "calc(100vh - 180px)",
// //           overflowY: "auto"
// //         }}
// //       >
// //         <Space direction="vertical" style={{ width: "100%" }}>
// //           <Text strong>Thông tin khách hàng</Text>
// //           <div
// //             style={{
// //               border: "1px solid #ccc",
// //               borderRadius: "8px",
// //               padding: "10px",
// //             }}
// //           >
// //             <Row>
// //               <Col span={10}>
// //                 <Text>Khách hàng</Text>
// //               </Col>
// //               <Col span={14}>
// //                 <Row style={{ display: "flex", justifyContent: "flex-end" }}>
// //                   <Button
// //                     size="small"
// //                     onClick={() => handleSelectCustomer(order.id)}
// //                   >
// //                     <AiOutlineSelect />
// //                     Chọn
// //                   </Button>
// //                   <Button
// //                     type="primary"
// //                     size="small"
// //                     style={{ marginLeft: 8 }}
// //                     onClick={() => handleAddNewCustomer()}
// //                   >
// //                     <IoIosAddCircle />
// //                     Thêm mới
// //                   </Button>
// //                 </Row>
// //               </Col>
// //             </Row>
// //             <Row style={{ marginTop: 8 }}>
// //               <Col
// //                 span={24}
// //                 style={{ display: "flex", alignItems: "center" }}
// //               >
// //                 <Avatar size={40} style={{ marginRight: 8 }} />
// //                 <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
// //               </Col>
// //             </Row>
// //             <div
// //               style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
// //             ></div>
// //             <Row>
// //               <Col span={24}>
// //                 <Radio.Group
// //                   value={order.hinhThucNhan || "taiQuay"}
// //                   onChange={(e) =>
// //                     handleDeliveryMethodChange(order.id, e.target.value)
// //                   }
// //                 >
// //                   <Radio value="taiQuay">Tại quầy</Radio>
// //                   <Radio value="giaoHang">Giao hàng</Radio>
// //                 </Radio.Group>
// //               </Col>
// //             </Row>
// //           </div>
// //           <div
// //             style={{
// //               display: "flex",
// //               justifyContent: "space-between",
// //               alignItems: "center",
// //             }}
// //           >
// //             <Text strong>Voucher giảm giá:</Text>
// //             <div>
// //               {order.phieuGiamGia ? (
// //                 <Tag
// //                   closable
// //                   onClose={() => handleRemoveVoucher(order.id)}
// //                   color="black"
// //                 >
// //                   {order.phieuGiamGia.maPhieuGiamGia}
// //                 </Tag>
// //               ) : (
// //                 <Space>
// //                   <Button
// //                     type="default"
// //                     icon={<TagOutlined />}
// //                     onClick={() => {
// //                       loadVouchers(order.id);
// //                       setOpenVoucherDialog(true);
// //                     }}
// //                   >
// //                     Chọn mã
// //                   </Button>
// //                   <Button
// //                     type="primary"
// //                     onClick={() => autoApplyBestVoucher(order.id)}
// //                   >
// //                     Áp dụng tốt nhất
// //                   </Button>
// //                 </Space>
// //               )}
// //             </div>
// //           </div>
// //           <Text strong>Thông tin thanh toán</Text>
// //           <div
// //             style={{
// //               border: "1px solid #ccc",
// //               borderRadius: "8px",
// //               padding: "10px",
// //             }}
// //           >
// //             <Row>
// //               <Col span={24}>
// //                 <Radio.Group
// //                   value={
// //                     order.phuongThucThanhToan?.maPhuongThucThanhToan || ""
// //                   }
// //                   onChange={(e) =>
// //                     handlePaymentMethodChange(order.id, e.target.value)
// //                   }
// //                 >
// //                   {paymentMethods.map((method) => (
// //                     <Radio
// //                       key={method.id}
// //                       value={method.maPhuongThucThanhToan}
// //                     >
// //                       {method.tenPhuongThucThanhToan}
// //                     </Radio>
// //                   ))}
// //                 </Radio.Group>
// //               </Col>
// //             </Row>
// //             <Row style={{ marginTop: 8 }}>
// //               <Col span={12}>
// //                 <Text>Tổng tiền:</Text>
// //               </Col>
// //               <Col span={12} style={{ textAlign: "right" }}>
// //                 <Text strong>
// //                   {formatCurrency(totals[order.id]?.totalBeforeVoucher || 0)}
// //                 </Text>
// //               </Col>
// //             </Row>
// //             <Row style={{ marginTop: 8 }}>
// //               <Col span={12}>
// //                 <Text>Phí vận chuyển:</Text>
// //               </Col>
// //               <Col span={12}>
// //                 <InputNumber
// //                   style={{ width: "100%" }}
// //                   value={order.phiVanChuyen || 0}
// //                   onChange={(value) =>
// //                     handleShippingFeeChange(order.id, value)
// //                   }
// //                   formatter={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
// //                   parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// //                 />
// //               </Col>
// //             </Row>
// //             <Row style={{ marginTop: 8 }}>
// //               <Col span={12}>
// //                 <Text>Giảm giá:</Text>
// //               </Col>
// //               <Col span={12} style={{ textAlign: "right" }}>
// //                 {order.phieuGiamGia ? (
// //                   order.phieuGiamGia.loaiPhieuGiamGia === 1 ? (
// //                     <Text strong style={{ color: '#f50' }}>
// //                       {order.phieuGiamGia.giaTriGiam}% ({formatCurrency(totals[order.id]?.discountAmount || 0)})
// //                     </Text>
// //                   ) : (
// //                     <Text strong style={{ color: '#f50' }}>
// //                       {formatCurrency(totals[order.id]?.discountAmount || 0)}
// //                     </Text>
// //                   )
// //                 ) : (
// //                   <Text>{formatCurrency(totals[order.id]?.discountAmount || 0)}</Text>
// //                 )}
// //               </Col>
// //             </Row>
// //             <Row style={{ marginTop: 8 }}>
// //               <Col span={12}>
// //                 <Text strong>Tổng thanh toán:</Text>
// //               </Col>
// //               <Col span={12} style={{ textAlign: "right" }}>
// //                 <Text strong style={{ color: "red" }}>
// //                   {formatCurrency(totals[order.id]?.finalTotal || 0)}
// //                 </Text>
// //               </Col>
// //             </Row>
// //             {order.phuongThucThanhToan?.maPhuongThucThanhToan ===
// //               PAYMENT_METHOD.CASH && (
// //               <>
// //                 <Divider style={{ margin: "12px 0" }} />
// //                 <Row justify="space-between" align="middle">
// //                   <Col span={10}>
// //                     <Text>Tiền khách đưa:</Text>
// //                   </Col>
// //                   <Col span={14}>
// //                     <InputNumber
// //                       style={{ width: "100%" }}
// //                       value={customerPayment[order.id] || 0}
// //                       onChange={(value) => {
// //                         setCustomerPayment((prev) => ({
// //                           ...prev,
// //                           [order.id]: value || 0,
// //                         }));
// //                       }}
// //                       formatter={(value) =>
// //                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// //                       }
// //                       parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// //                       min={0}
// //                       step={1000}
// //                     />
// //                   </Col>
// //                 </Row>
// //                 {calculateChange(order.id).change > 0 && (
// //                   <Row justify="space-between" style={{ marginTop: 8 }}>
// //                     <Col>
// //                       <Text strong style={{ color: "#52c41a" }}>
// //                         Tiền thừa:
// //                       </Text>
// //                     </Col>
// //                     <Col>
// //                       <Text strong style={{ color: "#52c41a" }}>
// //                         {formatCurrency(calculateChange(order.id).change)}
// //                       </Text>
// //                     </Col>
// //                   </Row>
// //                 )}
// //                 {calculateChange(order.id).remaining > 0 && (
// //                   <Row justify="space-between" style={{ marginTop: 8 }}>
// //                     <Col>
// //                       <Text strong style={{ color: "#ff4d4f" }}>
// //                         Còn thiếu:
// //                       </Text>
// //                     </Col>
// //                     <Col>
// //                       <Text strong style={{ color: "#ff4d4f" }}>
// //                         {formatCurrency(calculateChange(order.id).remaining)}
// //                       </Text>
// //                     </Col>
// //                   </Row>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //           {/* Phần hiển thị gợi ý voucher */}
// //           {voucherSuggestions.show && voucherSuggestions.betterVouchers?.length > 0 && (
// //             <div className="voucher-suggestions"
// //               style={{
// //                 margin: '16px 0',
// //                 padding: '12px',
// //                 background: '#f6ffed',
// //                 border: '1px solid #b7eb8f',
// //                 borderRadius: '8px',
// //                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
// //                 maxHeight: '300px',
// //                 overflowY: 'auto'
// //               }}
// //             >
// //               <Space direction="vertical" size="small" style={{ width: '100%' }}>
// //                 <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
// //                   <InfoCircleOutlined style={{ marginRight: 8 }} />
// //                   Có {voucherSuggestions.betterVouchers.length} voucher tốt hơn cho đơn hàng
// //                 </Text>

// //                 {voucherSuggestions.betterVouchers.map((voucher, index) => {
// //                   const currentDiscount = order.phieuGiamGia 
// //                     ? calculateDiscountAmount(order.phieuGiamGia, totals[order.id]?.totalBeforeVoucher || 0)
// //                     : 0;

// //                   return (
// //                     <Card 
// //                       key={voucher.id} 
// //                       size="small" 
// //                       bordered={true}
// //                       style={{ background: '#fff', marginBottom: 8 }}
// //                       title={
// //                         <Space>
// //                           <TagOutlined style={{ color: '#1890ff' }} />
// //                           <Text strong style={{ fontSize: '12px' }}>{voucher.maPhieuGiamGia}</Text>
// //                           <Tag color="green" style={{ fontSize: '11px' }}>
// //                             +{formatCurrency(voucher.additionalSavings)}
// //                           </Tag>
// //                         </Space>
// //                       }
// //                       extra={
// //                         <Button 
// //                           type="primary" 
// //                           size="small"
// //                           onClick={() => handleApplySuggestedVoucher(order.id, voucher.id)}
// //                           disabled={voucher.amountNeeded > 0}
// //                         >
// //                           {voucher.amountNeeded > 0 ? 'Chưa đủ' : 'Áp dụng'}
// //                         </Button>
// //                       }
// //                     >
// //                       <Space direction="vertical" style={{ width: '100%' }} size="small">
// //                         <div>
// //                           <Text style={{ fontSize: '12px' }}>
// //                             {voucher.loaiPhieuGiamGia === 1
// //                               ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
// //                             voucher.soTienGiamToiDa
// //                           )})`
// //                         : `Giảm ${formatCurrency(voucher.giaTriGiam)}`
// //                             }
// //                           </Text>
// //                           <br />
// //                           <Text type="secondary" style={{ fontSize: '12px' }}>
// //                             Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
// //                           </Text>
// //                         </div>

// //                         {voucher.amountNeeded > 0 && (
// //                           <Alert
// //                             type="warning"
// //                             message={`Cần mua thêm ${formatCurrency(voucher.amountNeeded)}`}
// //                             style={{ marginBottom: 8, fontSize: '12px', padding: '4px 8px' }}
// //                           />
// //                         )}

// //                         {/* Hiển thị gợi ý sản phẩm thu gọn */}
// //                         {(voucher.suggestions?.currentProducts?.length > 0 || 
// //                           voucher.suggestions?.newProducts?.length > 0) && (
// //                           <Collapse ghost size="small">
// //                             <Collapse.Panel 
// //                               header={<Text style={{ fontSize: '12px' }}>Xem gợi ý sản phẩm</Text>} 
// //                               key="1"
// //                             >
// //                               {voucher.suggestions?.currentProducts?.length > 0 && (
// //                                 <div style={{ marginTop: 4 }}>
// //                                   <Text strong style={{ fontSize: '12px' }}>Mua thêm sản phẩm đã chọn:</Text>
// //                                   <List
// //                                     size="small"
// //                                     dataSource={voucher.suggestions.currentProducts}
// //                                     renderItem={product => (
// //                                       <List.Item
// //                                         extra={
// //                                           <Button 
// //                                             type="primary"
// //                                             size="small"
// //                                             onClick={() => handleUpdateQuantityForSuggestion(
// //                                               order.id,
// //                                               product.id,
// //                                               product.soLuong + product.quantityNeeded
// //                                             )}
// //                                           >
// //                                             +{product.quantityNeeded}
// //                                           </Button>
// //                                         }
// //                                       >
// //                                         <List.Item.Meta
// //                                           avatar={<Avatar src={product.hinhAnh?.[0]} shape="square" size="small" />}
// //                                           title={<Text style={{ fontSize: '12px' }}>{product.tenSanPham}</Text>}
// //                                           description={
// //                                             <Text type="secondary" style={{ fontSize: '11px' }}>
// //                                               {formatCurrency(product.gia)} x{product.soLuong}
// //                                             </Text>
// //                                           }
// //                                         />
// //                                       </List.Item>
// //                                     )}
// //                                   />
// //                                 </div>
// //                               )}

// //                               {voucher.suggestions?.newProducts?.length > 0 && (
// //                                 <div style={{ marginTop: 4 }}>
// //                                   <Text strong style={{ fontSize: '12px' }}>Thêm sản phẩm mới:</Text>
// //                                   <List
// //                                     size="small"
// //                                     dataSource={voucher.suggestions.newProducts}
// //                                     renderItem={product => (
// //                                       <List.Item
// //                                         extra={
// //                                           <Button
// //                                             type="primary"
// //                                             size="small"
// //                                             icon={<PlusOutlined />}
// //                                             onClick={() => handleAddSuggestedProduct(product)}
// //                                           >
// //                                             Thêm
// //                                           </Button>
// //                                         }
// //                                       >
// //                                         <List.Item.Meta
// //                                           avatar={<Avatar src={product.hinhAnh?.[0]} shape="square" size="small" />}
// //                                           title={<Text style={{ fontSize: '12px' }}>{product.tenSanPham}</Text>}
// //                                           description={
// //                                             <Text type="success" style={{ fontSize: '11px' }}>
// //                                               {formatCurrency(product.gia)}
// //                                             </Text>
// //                                           }
// //                                         />
// //                                       </List.Item>
// //                                     )}
// //                                   />
// //                                 </div>
// //                               )}
// //                             </Collapse.Panel>
// //                           </Collapse>
// //                         )}
// //                       </Space>
// //                     </Card>
// //                   );
// //                 })}
// //               </Space>
// //             </div>
// //           )}

// //           <Space direction="vertical" style={{ width: "100%" }}>
// //             <Button
// //               type="primary"
// //               block
// //               onClick={() => handleConfirmOrder(order.id)}
// //             >
// //               Xác nhận đơn hàng
// //             </Button>
// //           </Space>
// //         </Space>
// //       </div>
// //     </Col>
// //   </Row>
// // );
// //   // Add these handler functions
// //   const handleAddNewCustomer = () => {
// //     // Implement new customer creation logic
// //   };

// //   const handleDeliveryMethodChange = async (hoaDonId, method) => {
// //     // Implement delivery method change logic
// //   };

// //   const handlePaymentMethodChange = (hoaDonId, selectedId) => {
// //     const selectedMethod = paymentMethods.find(
// //       (method) => method.maPhuongThucThanhToan === selectedId
// //     );

// //     if (selectedMethod) {
// //       const newPaymentMethod = {
// //         id: selectedMethod.id,
// //         maPhuongThucThanhToan: selectedMethod.maPhuongThucThanhToan,
// //         tenPhuongThucThanhToan: selectedMethod.tenPhuongThucThanhToan,
// //         moTa: selectedMethod.moTa,
// //       };

// //       setTabs((prev) =>
// //         prev.map((tab) =>
// //           tab.key === hoaDonId
// //             ? {
// //                 ...tab,
// //                 order: {
// //                   ...tab.order,
// //                   phuongThucThanhToan: selectedMethod,
// //                 },
// //               }
// //             : tab
// //         )
// //       );
// //     } else {
// //       message.error("Phương thức thanh toán không hợp lệ!");
// //     }
// //   };

// //   const handleShippingFeeChange = async (hoaDonId, fee) => {
// //     // Implement shipping fee change logic
// //   };

// //   // Add function to load customers
// //   const loadCustomers = async () => {
// //     try {
// //       const response = await axios.get("http://localhost:8080/api/khach_hang");
// //       setCustomers(response.data);
// //     } catch (error) {
// //       console.error("Error loading customers:", error);
// //     }
// //   };

// //   // Add function to handle customer selection
// //   const handleCustomerSelected = async (hoaDonId, customerId) => {
// //     try {
// //       const response = await axios.put(
// //         `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
// //         { customerId }
// //       );

// //       setTabs((prev) =>
// //         prev.map((tab) =>
// //           tab.key === hoaDonId ? { ...tab, order: response.data } : tab
// //         )
// //       );
// //       setOpenCustomerDialog(false);
// //     } catch (error) {
// //       message.error("Lỗi khi chọn khách hàng");
// //     }
// //   };

// //   // Add function to handle customer selection
// //   const handleSelectCustomer = async (hoaDonId) => {
// //     try {
// //       await loadCustomers();
// //       setOpenCustomerDialog(true);
// //     } catch (error) {
// //       message.error("Lỗi khi tải danh sách khách hàng");
// //     }
// //   };

// //   // Update calculateTotalBeforeDiscount to handle undefined/null cases
// //   const calculateTotalBeforeDiscount = (products) => {
// //     if (!products || !Array.isArray(products)) {
// //       return 0;
// //     }
// //     return products.reduce((sum, product) => {
// //       const price = product.gia || 0;
// //       const quantity = product.soLuong || 0;
// //       return sum + price * quantity;
// //     }, 0);
// //   };

// //   // // Update useEffect for totalBeforeDiscount calculation
// //   useEffect(() => {
// //     if (activeKey && orderProducts[activeKey]) {
// //       const total = calculateTotalBeforeDiscount(orderProducts[activeKey]);
// //       if (total !== totalBeforeDiscount) {
// //         setTotalBeforeDiscount(total);
// //       }
// //     }
// //   }, [activeKey, orderProducts]);
// //   // Tự động tính lại tổng tiền khi danh sách sản phẩm thay đổi
// //   const calculateOrderTotal = (products, shippingFee = 0, discount = 0) => {
// //     const subtotal = products.reduce(
// //       (sum, product) => sum + product.gia * product.soLuong,
// //       0
// //     );
// //     return subtotal + shippingFee - discount;
    
// //   };
// //   useEffect(() => {
// //     if (activeKey && orderProducts[activeKey]) {
// //       const newTotals = calculateOrderTotals(activeKey);
// //       setTotals((prev) => ({ ...prev, [activeKey]: newTotals }));
// //       setTotalAmount(newTotals.finalTotal);
// //     }
// //   }, [orderProducts, activeKey]);

// //   useEffect(() => {
// //     if (activeKey && totals[activeKey]) {
// //       setTotalAmount(totals[activeKey].finalTotal);
// //     }
// //   }, [totals, activeKey, orderProducts]); // Theo dõi thêm `orderProducts`

// //   // Add applyBestVoucher function from InvoiceDetail
// //   const applyBestVoucher = async (hoaDonId) => {
// //     try {
// //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //       if (!order) return null;

// //       const totalBeforeVoucher = calculateOrderTotal(
// //         orderProducts[hoaDonId],
// //         order.phiVanChuyen || 0,
// //         0
// //       );

// //       // Kiểm tra nếu mã giảm giá hiện tại không còn hợp lệ
// //       const currentVoucher = order.phieuGiamGia;
// //       if (
// //         currentVoucher &&
// //         totalBeforeVoucher < currentVoucher.giaTriToiThieu
// //       ) {
// //         await handleRemoveVoucher(hoaDonId);
// //         message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
// //       }

// //       // Tìm mã giảm giá tốt nhất
// //       const response = await api.post(
// //         `/api/admin/ban-hang/${hoaDonId}/apply-best-voucher`
// //       );
// //       const updatedOrder = response.data;

// //       setTabs((prev) =>
// //         prev.map((tab) =>
// //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //         )
// //       );

// //       // Cập nhật tổng tiền ngay lập tức
// //       const newTotals = calculateOrderTotals(hoaDonId);
// //       setTotals((prev) => ({ ...prev, [hoaDonId]: newTotals }));
// //       setTotalAmount(newTotals.finalTotal);

// //       return updatedOrder;
// //     } catch (error) {
// //       console.error("Lỗi khi áp dụng voucher:", error);
// //       return null;
// //     }
// //   };

// //   // Add fetchPaymentHistory from InvoiceDetail if needed
// //   const fetchPaymentHistory = async () => {
// //     if (!activeKey) return;

// //     try {
// //       setLoadingPayments(true);
// //       const response = await api.get(
// //         `/api/admin/hoa-don/${activeKey}/payment-history`
// //       );
// //       setPaymentHistory(response.data);
// //     } catch (error) {
// //       console.error("Error fetching payment history:", error);
// //     } finally {
// //       setLoadingPayments(false);
// //     }
// //   };

// //   // Update fetchProducts to match InvoiceDetail format
// //   const fetchProducts = async () => {
// //     try {
// //       const response = await api.get("/api/admin/hoa-don/san-pham/all");
// //       const productsData = response.data;

// //       // Lấy hình ảnh từ API
// //       const productsWithImages = await Promise.all(
// //         productsData.map(async (product) => {
// //           try {
// //             const imgResponse = await api.get(
// //               `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// //             );

// //             // Ensure imageUrls is always an array
// //             const imageUrls = Array.isArray(imgResponse.data)
// //               ? imgResponse.data.map((img) => img.anhUrl)
// //               : [];

// //             return {
// //               ...product,
// //               // Store full array of image URLs instead of just first one
// //               hinhAnh: imageUrls,
// //             };
// //           } catch (error) {
// //             console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
// //             return { ...product, hinhAnh: [] }; // Return empty array if error
// //           }
// //         })
// //       );

// //       setProducts(productsWithImages);
// //     } catch (error) {
// //       message.error("Lỗi khi tải danh sách sản phẩm");
// //     }
// //   };

// //   // Add useEffect to load products
// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   const fetchInvoiceProducts = async (hoaDonId, skipUIUpdate = false) => {
// //     try {
// //       console.log(`📢 Fetching products for invoice: ${hoaDonId}`);

// //       // Sử dụng debounce để tránh gọi API quá nhiều lần
// //       if (fetchInvoiceProducts.timer) {
// //         clearTimeout(fetchInvoiceProducts.timer);
// //       }

// //       return new Promise((resolve) => {
// //         fetchInvoiceProducts.timer = setTimeout(async () => {
// //           try {
// //             const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/san-pham`);
// //             let products = response.data || [];

// //             // Tối ưu: Chỉ lấy hình ảnh cho sản phẩm chưa có
// //             const productsWithImages = await Promise.all(
// //               products.map(async (product) => {
// //                 if (product.hinhAnh && product.hinhAnh.length > 0) {
// //                   return product;
// //                 }

// //                 try {
// //                   // Sử dụng cache để lưu hình ảnh
// //                   const cacheKey = `product_image_${product.id}`;
// //                   let cachedImages = sessionStorage.getItem(cacheKey);
                  
// //                   if (cachedImages) {
// //                     return {
// //                       ...product,
// //                       hinhAnh: JSON.parse(cachedImages)
// //                     };
// //                   }
                  
// //                   const imgResponse = await api.get(
// //                     `/api/admin/sanphamchitiet/${product.id}/hinhanh`
// //                   );
                  
// //                   const imageUrls = imgResponse.data && imgResponse.data.length > 0
// //                     ? imgResponse.data.map((img) => img.anhUrl)
// //                     : [];
                    
// //                   // Lưu vào cache
// //                   sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));
                  
// //                   return {
// //                     ...product,
// //                     hinhAnh: imageUrls
// //                   };
// //                 } catch (error) {
// //                   console.error(`❌ Lỗi khi lấy ảnh sản phẩm ${product.id}:`, error);
// //                   return { ...product, hinhAnh: [] };
// //                 }
// //               })
// //             );

// //             // Chỉ cập nhật UI nếu không phải đang khởi tạo
// //             if (!skipUIUpdate) {
// //               // Cập nhật state ngay lập tức
// //               setOrderProducts((prev) => ({
// //                 ...prev,
// //                 [hoaDonId]: productsWithImages,
// //               }));

// //               // Lấy thông tin hóa đơn hiện tại
// //               const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //               if (order) {
// //                 // Tính toán lại tổng tiền
// //                 const newTotals = calculateOrderTotals(hoaDonId);
                
// //                 setTotals((prev) => ({
// //                   ...prev,
// //                   [hoaDonId]: newTotals,
// //                 }));
                
// //                 // Cập nhật UI với tổng tiền mới
// //                 if (hoaDonId === activeKey) {
// //                   setTotalBeforeDiscount(newTotals.subtotal);
// //                   setTotalAmount(newTotals.finalTotal);
// //                 }
// //               }
// //             } else {
// //               // Nếu đang khởi tạo, chỉ cập nhật orderProducts
// //               setOrderProducts((prev) => ({
// //                 ...prev,
// //                 [hoaDonId]: productsWithImages,
// //               }));
// //             }

// //             resolve(productsWithImages);
// //           } catch (error) {
// //             console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// //             resolve([]);
// //           }
// //         }, skipUIUpdate ? 0 : 300); // Không debounce khi đang khởi tạo
// //       });
// //     } catch (error) {
// //       console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
// //       message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
// //       return [];
// //     }
// //   };

// //   // Convert tabs to items format
// //   const items = tabs.map((tab) => ({
// //     key: tab.key,
// //     label: (
// //       <span>
// //         {tab.title}
// //         {orderProducts[tab.key]?.length > 0 && (
// //           <sup
// //             style={{
// //               marginLeft: "4px",
// //               color: "#ff4d4f",
// //               fontWeight: "bold",
// //             }}
// //           >
// //             ({orderProducts[tab.key].length})
// //           </sup>
// //         )}
// //       </span>
// //     ),
// //     children: renderOrderContent(tab.order),
// //   }));

// //   // Add this function to handle tab editing (adding/removing)
// //   const handleEditTab = (targetKey, action) => {
// //     if (action === "add") {
// //       addTab();
// //     } else if (action === "remove") {
// //       Modal.confirm({
// //         title: "Xác nhận hủy đơn hàng",
// //         content: "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm sẽ được hoàn lại kho.",
// //         okText: "Hủy đơn",
// //         cancelText: "Đóng",
// //         okButtonProps: { danger: true },
// //         onOk: async () => {
// //           try {
// //             // Gọi API hủy hóa đơn, đảm bảo sản phẩm được hoàn lại kho
// //             await api.delete(`/api/admin/hoa-don/${targetKey}`);
  
// //             // Xóa tab khỏi giao diện
// //             setTabs((prev) => prev.filter((tab) => tab.key !== targetKey));
  
// //             // Xóa sản phẩm liên quan đến đơn hàng bị hủy
// //             setOrderProducts((prev) => {
// //               const newProducts = { ...prev };
// //               delete newProducts[targetKey];
// //               return newProducts;
// //             });
  
// //             // Nếu tab hiện tại bị xóa, chuyển sang tab đầu tiên còn lại
// //             if (activeKey === targetKey) {
// //               const newActiveKey = tabs.find((tab) => tab.key !== targetKey)?.key;
// //               setActiveKey(newActiveKey);
// //             }
  
// //             message.success("Đã hủy đơn hàng và hoàn lại sản phẩm vào kho.");
// //           } catch (error) {
// //             console.error("Lỗi khi hủy đơn hàng:", error);
// //             message.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng.");
// //           }
// //         },
// //       });
// //     }
// //   };
  

// //   // Add function to calculate and update all totals
// //   const updateAllTotals = (products, order) => {
// //     // Calculate total before discount
// //     const subtotal = calculateTotalBeforeDiscount(products);

// //     // Calculate shipping fee
// //     const shippingFee = order.phiVanChuyen || 0;

// //     // Calculate total before applying voucher
// //     const totalBeforeVoucher = subtotal + shippingFee;

// //     // Calculate discount amount if voucher exists
// //     const discountAmount = order.phieuGiamGia
// //       ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// //       : 0;

// //     // Calculate final total
// //     const finalTotal = totalBeforeVoucher - discountAmount;

// //     // Update all state values
// //     setTotalBeforeDiscount(subtotal);
// //     setTotalAmount(totalBeforeVoucher);

// //     // Update the order in tabs with new totals
// //     setTabs((prev) =>
// //       prev.map((tab) => {
// //         if (tab.key === order.id) {
// //           return {
// //             ...tab,
// //             order: {
// //               ...tab.order,
// //               tongTien: totalBeforeVoucher,
// //               giamGia: discountAmount,
// //               tongThanhToan: finalTotal,
// //             },
// //           };
// //         }
// //         return tab;
// //       })
// //     );
// //   };

// //   // Add function to calculate all totals for an order
// //   const calculateOrderTotals = (hoaDonId) => {
// //     console.log('Calculating totals for order:', hoaDonId);
// //     const products = orderProducts[hoaDonId] || [];
// //     const order = tabs.find((tab) => tab.key === hoaDonId)?.order;

// //     if (!order) {
// //       console.warn('No order found for totals calculation');
// //       return {
// //         subtotal: 0,
// //         shippingFee: 0,
// //         totalBeforeVoucher: 0,
// //         discountAmount: 0,
// //         finalTotal: 0,
// //       };
// //     }

// //     const subtotal = calculateTotalBeforeDiscount(products);
// //     const shippingFee = order.phiVanChuyen || 0;
// //     const totalBeforeVoucher = subtotal + shippingFee;

// //     // Tính toán giảm giá dựa trên voucher
// //     let discountAmount = 0;
// //     if (order.phieuGiamGia) {
// //       discountAmount = calculateDiscountAmount(
// //         order.phieuGiamGia,
// //         totalBeforeVoucher
// //       );
// //     }

// //     const finalTotal = totalBeforeVoucher - discountAmount;

// //     return {
// //       subtotal,
// //       shippingFee,
// //       totalBeforeVoucher,
// //       discountAmount,
// //       finalTotal,
// //     };
// //   };

// //   // Update the autoApplyBestVoucher function
// //   const autoApplyBestVoucher = async (hoaDonId) => {
// //     try {
// //       const order = tabs.find((tab) => tab.key === hoaDonId)?.order;
// //       if (!order) return;

// //       // Lấy danh sách sản phẩm của đơn hàng
// //       const currentProducts = orderProducts[hoaDonId] || [];
// //       const totalBeforeVoucher =
// //         calculateTotalBeforeDiscount(currentProducts) +
// //         (order.phiVanChuyen || 0);

// //       if (totalBeforeVoucher <= 0) {
// //         message.info("Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá.");
// //         return;
// //       }

// //       // Gọi API lấy danh sách voucher hợp lệ
// //       const response = await api.get(
// //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`
// //       );
// //       const availableVouchers = response.data || [];

// //       if (!availableVouchers.length) {
// //         message.info("Không có mã giảm giá phù hợp.");
// //         return;
// //       }

// //       // 🔍 Tìm voucher giảm giá cao nhất
// //       const bestVoucher = availableVouchers.reduce((best, current) => {
// //         if (totalBeforeVoucher < current.giaTriToiThieu) return best;

// //         const currentDiscount = calculateDiscountAmount(
// //           current,
// //           totalBeforeVoucher
// //         );
// //         const bestDiscount = best
// //           ? calculateDiscountAmount(best, totalBeforeVoucher)
// //           : 0;

// //         return currentDiscount > bestDiscount ? current : best;
// //       }, null);

// //       if (!bestVoucher) {
// //         message.info("Không tìm thấy phiếu giảm giá tốt hơn.");
// //         return;
// //       }

// //       // 🔍 Tính toán số tiền giảm giá
// //       const newDiscount = calculateDiscountAmount(
// //         bestVoucher,
// //         totalBeforeVoucher
// //       );
// //       const currentDiscount = order.phieuGiamGia
// //         ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
// //         : 0;

// //       if (newDiscount <= currentDiscount) {
// //         message.info("Mã giảm giá hiện tại đã là tốt nhất.");
// //         return;
// //       }

// //       // 🔄 Gọi API để áp dụng phiếu giảm giá mới
// //       await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// //         voucherId: bestVoucher.id,
// //       });

// //       // 🔹 Cập nhật `order` mới trong `tabs`
// //       const updatedOrder = {
// //         ...order,
// //         phieuGiamGia: bestVoucher,
// //         giamGia: newDiscount,
// //         tongThanhToan: totalBeforeVoucher - newDiscount,
// //       };

// //       setTabs((prev) =>
// //         prev.map((tab) =>
// //           tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //         )
// //       );

// //       // 🔹 Cập nhật tổng tiền trong `totals`
// //       const newTotals = {
// //         subtotal: calculateTotalBeforeDiscount(currentProducts),
// //         shippingFee: order.phiVanChuyen || 0,
// //         totalBeforeVoucher,
// //         discountAmount: newDiscount,
// //         finalTotal: totalBeforeVoucher - newDiscount,
// //       };

// //       setTotals((prev) => ({
// //         ...prev,
// //         [hoaDonId]: newTotals,
// //       }));

// //       message.success(
// //         `Đã áp dụng mã giảm giá tốt nhất: ${bestVoucher.maPhieuGiamGia}`
// //       );

// //       // 🔄 Làm mới danh sách sản phẩm để đồng bộ dữ liệu
// //       await fetchInvoiceProducts(hoaDonId);
// //     } catch (error) {
// //       console.error("Lỗi khi tự động áp dụng voucher:", error);
// //       message.error("Không thể áp dụng mã giảm giá tự động.");
// //     }
// //   };

// //   const renderPaymentSection = (order) => {
// //     const orderTotals = totals[order.id] || calculateOrderTotals(order.id);
// //     if (!orderTotals) return null;

// //     const { change, remaining } = calculateChange(order.id);

// //     return (
// //       <div style={{ maxWidth: 400, marginLeft: "auto" }}>
// //         <Space direction="vertical" size="middle" style={{ width: "100%" }}>
// //           {/* New payment input section */}
// //           <Divider style={{ margin: "12px 0" }} />
// //           <Row justify="space-between" align="middle">
// //             <Col span={10}>
// //               <Text>Tiền khách đưa:</Text>
// //             </Col>
// //             <Col span={14}>
// //               <InputNumber
// //                 style={{ width: "100%" }}
// //                 value={customerPayment[order.id] || 0}
// //                 onChange={(value) => {
// //                   setCustomerPayment((prev) => ({
// //                     ...prev,
// //                     [order.id]: value || 0,
// //                   }));
// //                 }}
// //                 formatter={(value) =>
// //                   `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
// //                 }
// //                 parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
// //                 min={0}
// //                 step={1000}
// //               />
// //             </Col>
// //           </Row>

// //           {/* Display change or remaining amount */}
// //           {change > 0 && (
// //             <Row justify="space-between">
// //               <Col>
// //                 <Text strong style={{ color: "#52c41a" }}>
// //                   Tiền thừa:
// //                 </Text>
// //               </Col>
// //               <Col>
// //                 <Text strong style={{ color: "#52c41a" }}>
// //                   {formatCurrency(change)}
// //                 </Text>
// //               </Col>
// //             </Row>
// //           )}
// //           {remaining > 0 && (
// //             <Row justify="space-between">
// //               <Col>
// //                 <Text strong style={{ color: "#ff4d4f" }}>
// //                   Còn thiếu:
// //                 </Text>
// //               </Col>
// //               <Col>
// //                 <Text strong style={{ color: "#ff4d4f" }}>
// //                   {formatCurrency(remaining)}
// //                 </Text>
// //               </Col>
// //             </Row>
// //           )}
// //         </Space>
// //       </div>
// //     );
// //   };

// //   // Update useEffect for tab changes to ensure totals are calculated
// //   useEffect(() => {
// //     if (activeKey) {
// //       setPagination({ current: 1, pageSize: 3 });
// //       fetchInvoiceProducts(activeKey).then(() => {
// //         setTimeout(() => {
// //           const newTotals = calculateOrderTotals(activeKey);
// //           setTotals((prev) => ({
// //             ...prev,
// //             [activeKey]: newTotals,
// //           }));
// //           findBestVoucherAndSuggest(activeKey); // Add this line
// //         }, 300); // Đợi API trả dữ liệu rồi cập nhật
// //       });
// //     }
// //   }, [activeKey]);

// //   // Add new function to find best voucher
// //   const findBestVoucher = async (hoaDonId, totalAmount) => {
// //     try {
// //       const response = await api.get(
// //         `/api/admin/phieu-giam-gia/available?orderTotal=${totalAmount}`
// //       );
// //       const availableVouchers = response.data;

// //       if (!availableVouchers || availableVouchers.length === 0) return null;

// //       // 1️⃣ Lọc danh sách voucher hợp lệ (đơn hàng đạt điều kiện tối thiểu)
// //       const validVouchers = availableVouchers.filter(
// //         (voucher) => totalAmount >= voucher.giaTriToiThieu
// //       );

// //       if (validVouchers.length === 0) return null;

// //       // 2️⃣ Tìm voucher có mức giảm giá cao nhất
// //       return validVouchers.reduce((best, current) => {
// //         const currentDiscount = calculateDiscountAmount(current, totalAmount);
// //         const bestDiscount = best
// //           ? calculateDiscountAmount(best, totalAmount)
// //           : 0;
// //         return currentDiscount > bestDiscount ? current : best;
// //       }, null);
// //     } catch (error) {
// //       console.error("Lỗi khi tìm mã giảm giá tốt nhất:", error);
// //       return null;
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchPaymentMethods = async () => {
// //       setPaymentMethodsLoading(true);
// //       try {
// //         const response = await api.get("/api/phuong-thuc-thanh-toan");
// //         setPaymentMethods(response.data);
// //       } catch (error) {
// //         message.error("Lỗi khi tải phương thức thanh toán");
// //       } finally {
// //         setPaymentMethodsLoading(false);
// //       }
// //     };

// //     fetchPaymentMethods();
// //   }, []);

// //   const PreviewModal = () => (
// //     <AntdModal
// //       open={previewOpen}
// //       onCancel={() => {
// //         setPreviewOpen(false);
// //         if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
// //         setPdfUrl(null);
// //       }}
// //       width="70%"
// //       footer={[
// //         <Button key="print" type="primary" onClick={handleDirectPrint}>
// //           In hóa đơn
// //         </Button>,
// //       ]}
// //     >
// //       <iframe
// //         id="pdf-preview"
// //         src={pdfUrl}
// //         width="100%"
// //         height="100%"
// //         style={{ border: "none" }}
// //         title="PDF Preview"
// //       />
// //     </AntdModal>
// //   );

// //   // Thêm useEffect mới để gọi findBestVoucherAndSuggest
// //   useEffect(() => {
// //     if (activeKey && orderProducts[activeKey]) {
// //       console.log('Triggering voucher suggestions...');
// //       findBestVoucherAndSuggest(activeKey);
// //     }
// //   }, [activeKey, orderProducts[activeKey]]); // Thêm dependency

// //   // Thêm hàm fetchInvoiceById để tải lại thông tin hóa đơn từ server
// //   const fetchInvoiceById = async (hoaDonId) => {
// //     try {
// //       console.log('🔄 Fetching invoice data for:', hoaDonId);
      
// //       // Gọi API để lấy thông tin hóa đơn
// //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);
      
// //       if (response.data) {
// //         const updatedOrder = response.data;
        
// //         // Cập nhật order trong tabs
// //         setTabs(prev =>
// //           prev.map(tab =>
// //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //           )
// //         );
        
// //         // Tải lại danh sách sản phẩm
// //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// //         // Tính toán lại tổng tiền
// //         const subtotal = calculateTotalBeforeDiscount(products);
// //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// //         const totalBeforeVoucher = subtotal + shippingFee;
        
// //         // Tính toán giảm giá dựa trên voucher
// //         let discountAmount = 0;
// //         if (updatedOrder.phieuGiamGia) {
// //           discountAmount = calculateDiscountAmount(
// //             updatedOrder.phieuGiamGia,
// //             totalBeforeVoucher
// //           );
// //         }
        
// //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// //         // Cập nhật totals
// //         const newTotals = {
// //           subtotal,
// //           shippingFee,
// //           totalBeforeVoucher,
// //           discountAmount,
// //           finalTotal,
// //         };
        
// //         setTotals(prev => ({
// //           ...prev,
// //           [hoaDonId]: newTotals
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(subtotal);
// //           setTotalAmount(finalTotal);
// //         }
        
// //         return updatedOrder;
// //       }
// //     } catch (error) {
// //       console.error('❌ Lỗi khi tải thông tin hóa đơn:', error);
// //     }
    
// //     return null;
// //   };

// //   // Thêm hàm findSuggestedProducts để tìm sản phẩm gợi ý
// //   const findSuggestedProducts = async (currentProducts, amountNeeded) => {
// //     try {
// //       // Lấy danh sách sản phẩm nếu chưa có
// //       let productList = products;
// //       if (productList.length === 0) {
// //         const response = await api.get('/api/admin/san-pham');
// //         productList = response.data || [];
// //       }
      
// //       const currentProductIds = currentProducts.map(p => p.id);
      
// //       // Tìm sản phẩm có giá phù hợp với số tiền cần thêm
// //       const minPrice = amountNeeded * 0.7;  // 70% của số tiền cần thêm
// //       const maxPrice = amountNeeded * 1.5;  // 150% của số tiền cần thêm
      
// //       const suggestedProducts = productList
// //         .filter(p => !currentProductIds.includes(p.id)) // Loại bỏ sản phẩm đã có
// //         .filter(p => p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0) // Lọc theo giá và tồn kho
// //         .sort((a, b) => Math.abs(a.gia - amountNeeded) - Math.abs(b.gia - amountNeeded)) // Sắp xếp theo giá gần nhất
// //         .slice(0, 3);
        
// //       return suggestedProducts;
// //     } catch (error) {
// //       console.error('Lỗi khi tìm sản phẩm gợi ý:', error);
// //       return [];
// //     }
// //   };

// //   // Thêm hàm updateOrderTotals để cập nhật tổng tiền đơn hàng
// //   const updateOrderTotals = (hoaDonId) => {
// //     const calculatedTotals = calculateOrderTotals(hoaDonId);
// //     if (calculatedTotals) {
// //       setTotals(prev => ({
// //         ...prev,
// //         [hoaDonId]: calculatedTotals
// //       }));
      
// //       // Cập nhật tổng tiền trong order
// //       setTabs(prev => 
// //         prev.map(tab => {
// //           if (tab.key === hoaDonId) {
// //             return {
// //               ...tab,
// //               order: {
// //                 ...tab.order,
// //                 tongTien: calculatedTotals.totalBeforeVoucher,
// //                 giamGia: calculatedTotals.discountAmount,
// //                 tongThanhToan: calculatedTotals.finalTotal
// //               }
// //             };
// //           }
// //           return tab;
// //         })
// //       );
// //     }
// //   };

// //   // Thêm hàm để lấy tất cả sản phẩm từ server
// //   const fetchAllProducts = async () => {
// //     try {
// //       const response = await api.get('/api/admin/san-pham');
// //       return response.data || [];
// //     } catch (error) {
// //       console.error('Lỗi khi lấy danh sách sản phẩm:', error);
// //       return [];
// //     }
// //   };

// //   // Thêm hàm mới để xử lý việc áp dụng voucher
// //   const applyVoucherToOrder = async (hoaDonId, voucherId) => {
// //     try {
// //       // Gọi API để áp dụng voucher
// //       const response = await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
// //         voucherId: voucherId,
// //       });

// //       if (response.data) {
// //         const updatedOrder = response.data;
        
// //         // Cập nhật order trong tabs
// //         setTabs((prev) =>
// //           prev.map((tab) =>
// //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //           )
// //         );
        
// //         // Lấy thông tin sản phẩm hiện tại
// //         const products = orderProducts[hoaDonId] || [];
        
// //         // Tính toán lại tổng tiền
// //         const subtotal = calculateTotalBeforeDiscount(products);
// //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// //         const totalBeforeVoucher = subtotal + shippingFee;
        
// //         // Tính toán giảm giá
// //         let discountAmount = 0;
// //         if (updatedOrder.phieuGiamGia) {
// //           discountAmount = calculateDiscountAmount(
// //             updatedOrder.phieuGiamGia,
// //             totalBeforeVoucher
// //           );
// //         }
        
// //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// //         // Cập nhật totals
// //         const newTotals = {
// //           subtotal,
// //           shippingFee,
// //           totalBeforeVoucher,
// //           discountAmount,
// //           finalTotal,
// //         };
        
// //         setTotals((prev) => ({
// //           ...prev,
// //           [hoaDonId]: newTotals,
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(subtotal);
// //           setTotalAmount(finalTotal);
// //         }
        
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.error("Lỗi khi áp dụng voucher:", error);
// //       message.error("Lỗi khi áp dụng voucher");
// //       return false;
// //     }
// //   };

// //   // Thêm hàm mới để tải lại thông tin hóa đơn từ server
// //   const refreshInvoiceData = async (hoaDonId) => {
// //     try {
// //       console.log('🔄 Refreshing invoice data for:', hoaDonId);
      
// //       // Kiểm tra xem hoaDonId có hợp lệ không
// //       if (!hoaDonId) {
// //         console.warn('Không có hoaDonId hợp lệ để tải dữ liệu');
// //         return null;
// //       }
      
// //       // Gọi API để lấy thông tin hóa đơn mới nhất
// //       const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);
      
// //       if (response.data) {
// //         const updatedOrder = response.data;
        
// //         // Ghi log thông tin hóa đơn để debug
// //         console.log('Thông tin hóa đơn từ server:', {
// //           id: updatedOrder.id,
// //           maHoaDon: updatedOrder.maHoaDon,
// //           tongTien: updatedOrder.tongTien,
// //           giamGia: updatedOrder.giamGia,
// //           tongThanhToan: updatedOrder.tongThanhToan,
// //           phieuGiamGia: updatedOrder.phieuGiamGia
// //         });
        
// //         // Cập nhật order trong tabs
// //         setTabs((prev) =>
// //           prev.map((tab) =>
// //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //           )
// //         );
        
// //         // Tải lại sản phẩm
// //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// //         // Tính toán lại tổng tiền
// //         const newTotals = calculateOrderTotals(hoaDonId);
        
// //         console.log('Tổng tiền sau khi tính toán:', newTotals);
        
// //         setTotals((prev) => ({
// //           ...prev,
// //           [hoaDonId]: newTotals,
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(newTotals.subtotal);
// //           setTotalAmount(newTotals.finalTotal);
// //         }
        
// //         return { updatedOrder, products, newTotals };
// //       }
// //     } catch (error) {
// //       console.error('❌ Lỗi khi tải lại thông tin hóa đơn:', error);
// //       // Không hiển thị thông báo lỗi để tránh làm phiền người dùng
// //       // Thay vào đó, sử dụng dữ liệu hiện có
      
// //       // Lấy thông tin hóa đơn hiện tại từ tabs
// //       const currentOrder = tabs.find(tab => tab.key === hoaDonId)?.order;
// //       if (currentOrder) {
// //         // Tải lại sản phẩm
// //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// //         // Tính toán lại tổng tiền dựa trên dữ liệu hiện có
// //         const subtotal = calculateTotalBeforeDiscount(products);
// //         const shippingFee = currentOrder.phiVanChuyen || 0;
// //         const totalBeforeVoucher = subtotal + shippingFee;
// //         const discountAmount = currentOrder.giamGia || 0;
// //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// //         // Cập nhật totals
// //         const newTotals = {
// //           subtotal,
// //           shippingFee,
// //           totalBeforeVoucher,
// //           discountAmount,
// //           finalTotal,
// //         };
        
// //         setTotals((prev) => ({
// //           ...prev,
// //           [hoaDonId]: newTotals,
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(subtotal);
// //           setTotalAmount(finalTotal);
// //         }
        
// //         return { updatedOrder: currentOrder, products, newTotals };
// //       }
// //     }
    
// //     return null;
// //   };

// //   // Sửa hàm handleApplyBestVoucher để xử lý lỗi khi áp dụng voucher gợi ý
// //   const handleApplyBestVoucher = async (hoaDonId, voucherId) => {
// //     try {
// //       console.log('Áp dụng voucher gợi ý:', { hoaDonId, voucherId });
      
// //       // Kiểm tra xem hoaDonId và voucherId có hợp lệ không
// //       if (!hoaDonId || !voucherId) {
// //         console.error('hoaDonId hoặc voucherId không hợp lệ');
// //         message.error('Không thể áp dụng voucher');
// //         return false;
// //       }
      
// //       // Sửa endpoint API - thêm /voucher vào cuối URL
// //       const response = await api.post(`/api/admin/hoa-don/${hoaDonId}/voucher`, {
// //         voucherId: voucherId,
// //       });

// //       if (response.data) {
// //         message.success("Áp dụng voucher thành công");
        
// //         // Cập nhật thông tin hóa đơn từ response
// //         const updatedOrder = response.data;
        
// //         // Cập nhật order trong tabs
// //         setTabs(prev =>
// //           prev.map(tab =>
// //             tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
// //           )
// //         );
        
// //         // Tải lại sản phẩm
// //         const products = await fetchInvoiceProducts(hoaDonId, true);
        
// //         // Tính toán lại tổng tiền
// //         const subtotal = calculateTotalBeforeDiscount(products);
// //         const shippingFee = updatedOrder.phiVanChuyen || 0;
// //         const totalBeforeVoucher = subtotal + shippingFee;
        
// //         // Tính toán giảm giá dựa trên voucher
// //         let discountAmount = 0;
// //         if (updatedOrder.phieuGiamGia) {
// //           discountAmount = calculateDiscountAmount(
// //             updatedOrder.phieuGiamGia,
// //             totalBeforeVoucher
// //           );
// //         }
        
// //         const finalTotal = totalBeforeVoucher - discountAmount;
        
// //         // Cập nhật totals
// //         const newTotals = {
// //           subtotal,
// //           shippingFee,
// //           totalBeforeVoucher,
// //           discountAmount,
// //           finalTotal,
// //         };
        
// //         setTotals(prev => ({
// //           ...prev,
// //           [hoaDonId]: newTotals
// //         }));
        
// //         // Cập nhật UI nếu đang ở tab này
// //         if (hoaDonId === activeKey) {
// //           setTotalBeforeDiscount(subtotal);
// //           setTotalAmount(finalTotal);
// //         }
        
// //         // Đóng gợi ý voucher
// //         setVoucherSuggestions({
// //           show: false,
// //           betterVouchers: []
// //         });
        
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.error("Lỗi khi áp dụng voucher gợi ý:", error);
// //       message.error("Lỗi khi áp dụng voucher");
// //       return false;
// //     }
// //   };

// //   return (
// //     <Layout
// //       style={{ height: "100vh", boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)" }}
// //     >
// //       <Sider
// //         width="100%"
// //         style={{
// //           background: "#fff",
// //           padding: 20,
// //           position: "relative",
// //           height: "100%",
// //           overflowY: "hidden", // Ngăn scroll toàn bộ Sider
// //         }}
// //       >
// //         {/* Dòng chứa Nút "Tạo hóa đơn" */}
// //         <Row style={{ marginBottom: 16 }}>
// //           <Col span={20}>
// //             <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
// //               Quản lý bán hàng
// //             </Text>
// //           </Col>
// //           <Col span={4}>
// //             <Button
// //               onClick={addTab}
// //               type="primary"
// //               style={{
// //                 zIndex: 1,
// //               }}
// //             >
// //               <IoIosAddCircle />
// //               Tạo đơn hàng mới
// //             </Button>
// //           </Col>
// //         </Row>

// //         {/* Khi không có hóa đơn nào, hiển thị thông báo */}
// //         {tabs.length === 0 ? (
// //           <Row justify="center" align="middle" style={{ height: "calc(100% - 60px)" }}>
// //             <Col>
// //               <Title level={3}>
// //                 Không có hóa đơn ở trạng thái chờ xác nhận
// //               </Title>
// //             </Col>
// //           </Row>
// //         ) : (
// //           <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
// //             <Tabs
// //               type="editable-card"
// //               onChange={setActiveKey}
// //               activeKey={activeKey}
// //               onEdit={handleEditTab}
// //               items={items}
// //             />
// //           </div>
// //         )}
// //       </Sider>
// //       <Content
// //         style={{
// //           padding: 24,
// //           height: "100%",
// //           overflow: "hidden",
// //         }}
// //       />

// //       {/* Customer Selection Dialog */}
// //       <Modal
// //         title="Chọn khách hàng"
// //         visible={openCustomerDialog}
// //         onCancel={() => setOpenCustomerDialog(false)}
// //         footer={null}
// //       >
// //         <List
// //           dataSource={customers}
// //           renderItem={(customer) => (
// //             <List.Item
// //               actions={[
// //                 <Button
// //                   type="primary"
// //                   onClick={() => handleCustomerSelected(activeKey, customer.id)}
// //                 >
// //                   Chọn
// //                 </Button>,
// //               ]}
// //             >
// //               <List.Item.Meta
// //                 avatar={<Avatar src={customer.avatar} />}
// //                 title={customer.tenKhachHang}
// //                 description={
// //                   <>
// //                     {customer.soDienThoai}
// //                     <br />
// //                     {customer.email}
// //                   </>
// //                 }
// //               />
// //             </List.Item>
// //           )}
// //         />
// //       </Modal>

// //       {/* Voucher Selection Dialog */}
// //       <Modal
// //         title="Chọn voucher"
// //         open={openVoucherDialog}
// //         onCancel={() => setOpenVoucherDialog(false)}
// //         footer={null}
// //         ref={modalRef}
// //       >
// //         <List
// //           dataSource={vouchers}
// //           renderItem={(voucher) => (
// //             <List.Item
// //               style={{
// //                 border:
// //                   selectedVoucher?.id === voucher.id
// //                     ? "2px solid #1890ff"
// //                     : "1px solid #d9d9d9",
// //                 borderRadius: "8px",
// //                 padding: "16px",
// //                 marginBottom: "8px",
// //                 backgroundColor:
// //                   selectedVoucher?.id === voucher.id ? "#f0f5ff" : "white",
// //               }}
// //               actions={[
// //                 <Radio
// //                   checked={selectedVoucher?.id === voucher.id}
// //                   onChange={() => setSelectedVoucher(voucher)}
// //                 />,
// //               ]}
// //             >
// //               <List.Item.Meta
// //                 title={voucher.maPhieuGiamGia}
// //                 description={
// //                   <div>
// //                     <div>
// //                       {voucher.loaiPhieuGiamGia === 1
// //                         ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
// //                             voucher.soTienGiamToiDa
// //                           )})`
// //                         : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
// //                     </div>
// //                     <div>
// //                       Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
// //                     </div>
// //                   </div>
// //                 }
// //               />
// //             </List.Item>
// //           )}
// //         />
// //         <Button
// //           type="primary"
// //           block
// //           disabled={!selectedVoucher}
// //           onClick={() => handleVoucherSelected(activeKey, selectedVoucher.id)}
// //         >
// //           Áp dụng
// //         </Button>
// //       </Modal>

// //       {/* Add ProductTable component */}
// //       <ProductTable
// //         products={products}
// //         onAddProduct={handleAddProductToOrder}
// //         open={openProductTable}
// //         onClose={() => setOpenProductTable(false)}
// //       />

// //       {/* Add PreviewModal component */}
// //       <PreviewModal />
// //     </Layout>
// //   );
// // };

// // export default BanHang;
// import React, {
//     useEffect,
//     useReducer,
//     useMemo,
//     useRef,
//     useCallback,
//     useState,
//   } from "react";
//   import "./BanHangCss.css";
//   import {
//     Layout,
//     Button,
//     Row,
//     Col,
//     Tabs,
//     Typography,
//     Input,
//     Table,
//     Space,
//     Avatar,
//     Radio,
//     InputNumber,
//     Modal,
//     Select,
//     List,
//     Tag,
//     Carousel,
//     Divider,
//     Alert,
//     Card,
//     Collapse,
//     message,
//   } from "antd";
//   import {
//     PlusOutlined,
//     CloseOutlined,
//     SelectOutlined,
//     SearchOutlined,
//     TagOutlined,
//     InfoCircleOutlined,
//     DeleteOutlined,
//     PrinterOutlined,
//   } from "@ant-design/icons";
//   import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
//   import { BiQrScan } from "react-icons/bi";
//   import { AiOutlineSelect } from "react-icons/ai";
//   import axios from "axios";
//   import api from "../../utils/api";
//   import { formatCurrency } from "../../utils/format";
//   import ProductTable from "../HoaDon/ProductTable";
//   import { Client } from "@stomp/stompjs";
//   import SockJS from "sockjs-client";
//   import { MenuItem, FormControl, InputLabel } from "@mui/material";
//   import { checkPayment } from "./checkPayment";
//   import {
//     calculateDiscountAmount,
//     findBestVoucher,
//     applyVoucher,
//   } from "./voucherUtils";
  
//   const { Content, Sider } = Layout;
//   const { TabPane } = Tabs;
//   const { Title, Text } = Typography;
  
//   const PAYMENT_METHOD = {
//     CASH: "COD",
//     QR: "BANK",
//   };
  
//   const initialState = {
//     tabs: [],
//     activeKey: null,
//     orderProducts: {},
//     totals: {},
//     paymentMethods: [],
//     customers: [],
//     vouchers: [],
//     selectedVoucher: null,
//     customerPayment: {},
//     voucherSuggestions: {
//       show: false,
//       betterVouchers: [],
//     },
//     isModalPaymentQR: false,
//     qrUrl: "",
//     openCustomerDialog: false,
//     openVoucherDialog: false,
//     openProductTable: false,
//     previewOpen: false,
//     pdfUrl: null,
//     loading: false,
//     loadingPayments: false,
//     paymentHistory: [],
//   };
  
//   const reducer = (state, action) => {
//     switch (action.type) {
//       case "SET_TABS":
//         return { ...state, tabs: action.payload };
//       case "SET_ACTIVE_KEY":
//         return { ...state, activeKey: action.payload };
//       case "SET_ORDER_PRODUCTS":
//         return {
//           ...state,
//           orderProducts: { ...state.orderProducts, ...action.payload },
//         };
//       case "SET_TOTALS":
//         return { ...state, totals: { ...state.totals, ...action.payload } };
//       case "SET_PAYMENT_METHODS":
//         return { ...state, paymentMethods: action.payload };
//       case "SET_CUSTOMERS":
//         return { ...state, customers: action.payload };
//       case "SET_VOUCHERS":
//         return { ...state, vouchers: action.payload };
//       case "SET_SELECTED_VOUCHER":
//         return { ...state, selectedVoucher: action.payload };
//       case "SET_CUSTOMER_PAYMENT":
//         return {
//           ...state,
//           customerPayment: { ...state.customerPayment, ...action.payload },
//         };
//       case "SET_VOUCHER_SUGGESTIONS":
//         return { ...state, voucherSuggestions: action.payload };
//       case "SET_IS_MODAL_PAYMENT_QR":
//         return { ...state, isModalPaymentQR: action.payload };
//       case "SET_QR_URL":
//         return { ...state, qrUrl: action.payload };
//       case "SET_OPEN_CUSTOMER_DIALOG":
//         return { ...state, openCustomerDialog: action.payload };
//       case "SET_OPEN_VOUCHER_DIALOG":
//         return { ...state, openVoucherDialog: action.payload };
//       case "SET_OPEN_PRODUCT_TABLE":
//         return { ...state, openProductTable: action.payload };
//       case "SET_PREVIEW_OPEN":
//         return { ...state, previewOpen: action.payload };
//       case "SET_PDF_URL":
//         return { ...state, pdfUrl: action.payload };
//       case "SET_LOADING":
//         return { ...state, loading: action.payload };
//       case "SET_LOADING_PAYMENTS":
//         return { ...state, loadingPayments: action.payload };
//       case "SET_PAYMENT_HISTORY":
//         return { ...state, paymentHistory: action.payload };
//       default:
//         return state;
//     }
//   };
  
//   const BanHang = () => {
//     const [state, dispatch] = useReducer(reducer, initialState);
//     const socket = useRef(null);
//     const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
//     const modalRef = useRef(null);
  
//     const calculateOrderTotals = useCallback(
//       (hoaDonId) => {
//         const products = state.orderProducts[hoaDonId] || [];
//         const order = state.tabs.find((tab) => tab.key === hoaDonId)?.order;
  
//         if (!order) {
//           return {
//             subtotal: 0,
//             shippingFee: 0,
//             totalBeforeVoucher: 0,
//             discountAmount: 0,
//             finalTotal: 0,
//           };
//         }
  
//         const subtotal = products.reduce(
//           (sum, product) => sum + product.gia * product.soLuong,
//           0
//         );
//         const shippingFee = order.phiVanChuyen || 0;
//         const totalBeforeVoucher = subtotal + shippingFee;
  
//         let discountAmount = 0;
//         if (order.phieuGiamGia) {
//           discountAmount = calculateDiscountAmount(
//             order.phieuGiamGia,
//             totalBeforeVoucher
//           );
//         }
  
//         const finalTotal = totalBeforeVoucher - discountAmount;
  
//         return {
//           subtotal,
//           shippingFee,
//           totalBeforeVoucher,
//           discountAmount,
//           finalTotal,
//         };
//       },
//       [state.orderProducts, state.tabs]
//     );
  
//     const calculateChange = useCallback(
//       (hoaDonId) => {
//         const orderTotals = state.totals[hoaDonId];
//         if (!orderTotals) return { change: 0, remaining: 0 };
  
//         const amountPaid = state.customerPayment[hoaDonId] || 0;
//         const finalTotal = orderTotals.finalTotal || 0;
  
//         if (amountPaid >= finalTotal) {
//           return {
//             change: amountPaid - finalTotal,
//             remaining: 0,
//           };
//         } else {
//           return {
//             change: 0,
//             remaining: finalTotal - amountPaid,
//           };
//         }
//       },
//       [state.customerPayment, state.totals]
//     );
    
//     const renderOrderContent = (order) => (
//       <Row gutter={16}>
//         <Col
//           span={17}
//           style={{
//             border: "1px solid #ccc",
//             borderRadius: "8px",
//             padding: "16px",
//             maxHeight: "calc(100vh - 180px)",
//             overflowY: "auto",
//           }}
//         >
//           <Space direction="vertical" style={{ width: "100%" }}>
//             <div style={{ display: "flex", justifyContent: "flex-end" }}>
//               <Button>
//                 <BiQrScan />
//                 Quét mã QR
//               </Button>
//               <Button
//                 type="primary"
//                 onClick={() =>
//                   dispatch({ type: "SET_OPEN_PRODUCT_TABLE", payload: true })
//                 }
//                 style={{ marginLeft: 8 }}
//               >
//                 <IoIosAddCircle />
//                 Thêm sản phẩm
//               </Button>
//             </div>
//             <Table
//               dataSource={state.orderProducts[order.id] || []}
//               columns={columns}
//               pagination={{
//                 current: pagination.current,
//                 pageSize: 3,
//                 showSizeChanger: false,
//                 total: state.orderProducts[order.id]?.length || 0,
//                 showTotal: (total) => `Tổng ${total} sản phẩm`,
//                 size: "small",
//                 position: ["bottomCenter"],
//                 onChange: (page) => {
//                   setPagination({ current: page, pageSize: 3 });
//                 },
//               }}
//               rowKey="id"
//               bordered
//               size="small"
//               style={{
//                 marginTop: "10px",
//                 borderRadius: "8px",
//                 boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//               }}
//               scroll={{ y: "calc(100vh - 350px)" }}
//             />
//           </Space>
//         </Col>
//         <Col span={7}>
//           <div
//             style={{
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               padding: "10px",
//               maxHeight: "calc(100vh - 180px)",
//               overflowY: "auto",
//             }}
//           >
//             <Space direction="vertical" style={{ width: "100%" }}>
//               <Text strong>Thông tin khách hàng</Text>
//               <div
//                 style={{
//                   border: "1px solid #ccc",
//                   borderRadius: "8px",
//                   padding: "10px",
//                 }}
//               >
//                 <Row>
//                   <Col span={10}>
//                     <Text>Khách hàng</Text>
//                   </Col>
//                   <Col span={14}>
//                     <Row style={{ display: "flex", justifyContent: "flex-end" }}>
//                       <Button
//                         size="small"
//                         onClick={() => handleSelectCustomer(order.id)}
//                       >
//                         <AiOutlineSelect />
//                         Chọn
//                       </Button>
//                       <Button
//                         type="primary"
//                         size="small"
//                         style={{ marginLeft: 8 }}
//                         onClick={() => handleAddNewCustomer()}
//                       >
//                         <IoIosAddCircle />
//                         Thêm mới
//                       </Button>
//                     </Row>
//                   </Col>
//                 </Row>
//                 <Row style={{ marginTop: 8 }}>
//                   <Col
//                     span={24}
//                     style={{ display: "flex", alignItems: "center" }}
//                   >
//                     <Avatar size={40} style={{ marginRight: 8 }} />
//                     <Text>{order.khachHang?.tenKhachHang || "Khách lẻ"}</Text>
//                   </Col>
//                 </Row>
//                 <div
//                   style={{ margin: "16px 0", borderBottom: "1px solid #ccc" }}
//                 ></div>
//                 <Row>
//                   <Col span={24}>
//                     <Radio.Group
//                       value={order.hinhThucNhan || "taiQuay"}
//                       onChange={(e) =>
//                         handleDeliveryMethodChange(order.id, e.target.value)
//                       }
//                     >
//                       <Radio value="taiQuay">Tại quầy</Radio>
//                       <Radio value="giaoHang">Giao hàng</Radio>
//                     </Radio.Group>
//                   </Col>
//                 </Row>
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text strong>Voucher giảm giá:</Text>
//                 <div>
//                   {order.phieuGiamGia ? (
//                     <Tag
//                       closable
//                       onClose={() => handleRemoveVoucher(order.id)}
//                       color="black"
//                     >
//                       {order.phieuGiamGia.maPhieuGiamGia}
//                     </Tag>
//                   ) : (
//                     <Space>
//                       <Button
//                         type="default"
//                         icon={<TagOutlined />}
//                         onClick={() => {
//                           loadVouchers(order.id);
//                           dispatch({
//                             type: "SET_OPEN_VOUCHER_DIALOG",
//                             payload: true,
//                           });
//                         }}
//                       >
//                         Chọn mã
//                       </Button>
//                       <Button
//                         type="primary"
//                         onClick={() => autoApplyBestVoucher(order.id)}
//                       >
//                         Áp dụng tốt nhất
//                       </Button>
//                     </Space>
//                   )}
//                 </div>
//               </div>
//               <Text strong>Thông tin thanh toán</Text>
//               <div
//                 style={{
//                   border: "1px solid #ccc",
//                   borderRadius: "8px",
//                   padding: "10px",
//                 }}
//               >
//                 <Row>
//                   <Col span={24}>
//                     <Radio.Group
//                       value={
//                         order.phuongThucThanhToan?.maPhuongThucThanhToan || ""
//                       }
//                       onChange={(e) =>
//                         handlePaymentMethodChange(order.id, e.target.value)
//                       }
//                     >
//                       {state.paymentMethods.map((method) => (
//                         <Radio
//                           key={method.id}
//                           value={method.maPhuongThucThanhToan}
//                         >
//                           {method.tenPhuongThucThanhToan}
//                         </Radio>
//                       ))}
//                     </Radio.Group>
//                   </Col>
//                 </Row>
//                 <Row style={{ marginTop: 8 }}>
//                   <Col span={12}>
//                     <Text>Tổng tiền:</Text>
//                   </Col>
//                   <Col span={12} style={{ textAlign: "right" }}>
//                     <Text strong>
//                       {formatCurrency(
//                         state.totals[order.id]?.totalBeforeVoucher || 0
//                       )}
//                     </Text>
//                   </Col>
//                 </Row>
//                 <Row style={{ marginTop: 8 }}>
//                   <Col span={12}>
//                     <Text>Phí vận chuyển:</Text>
//                   </Col>
//                   <Col span={12}>
//                     <InputNumber
//                       style={{ width: "100%" }}
//                       value={order.phiVanChuyen || 0}
//                       onChange={(value) =>
//                         handleShippingFeeChange(order.id, value)
//                       }
//                       formatter={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
//                       parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
//                     />
//                   </Col>
//                 </Row>
//                 <Row style={{ marginTop: 8 }}>
//                   <Col span={12}>
//                     <Text>Giảm giá:</Text>
//                   </Col>
//                   <Col span={12} style={{ textAlign: "right" }}>
//                     {order.phieuGiamGia ? (
//                       order.phieuGiamGia.loaiPhieuGiamGia === 1 ? (
//                         <Text strong style={{ color: "#f50" }}>
//                           {order.phieuGiamGia.giaTriGiam}% (
//                           {formatCurrency(
//                             state.totals[order.id]?.discountAmount || 0
//                           )}
//                           )
//                         </Text>
//                       ) : (
//                         <Text strong style={{ color: "#f50" }}>
//                           {formatCurrency(
//                             state.totals[order.id]?.discountAmount || 0
//                           )}
//                         </Text>
//                       )
//                     ) : (
//                       <Text>
//                         {formatCurrency(
//                           state.totals[order.id]?.discountAmount || 0
//                         )}
//                       </Text>
//                     )}
//                   </Col>
//                 </Row>
//                 <Row style={{ marginTop: 8 }}>
//                   <Col span={12}>
//                     <Text strong>Tổng thanh toán:</Text>
//                   </Col>
//                   <Col span={12} style={{ textAlign: "right" }}>
//                     <Text strong style={{ color: "red" }}>
//                       {formatCurrency(state.totals[order.id]?.finalTotal || 0)}
//                     </Text>
//                   </Col>
//                 </Row>
//                 {order.phuongThucThanhToan?.maPhuongThucThanhToan ===
//                   PAYMENT_METHOD.CASH && (
//                   <>
//                     <Divider style={{ margin: "12px 0" }} />
//                     <Row justify="space-between" align="middle">
//                       <Col span={10}>
//                         <Text>Tiền khách đưa:</Text>
//                       </Col>
//                       <Col span={14}>
//                         <InputNumber
//                           style={{ width: "100%" }}
//                           value={state.customerPayment[order.id] || 0}
//                           onChange={(value) => {
//                             dispatch({
//                               type: "SET_CUSTOMER_PAYMENT",
//                               payload: { [order.id]: value || 0 },
//                             });
//                           }}
//                           formatter={(value) =>
//                             `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                           }
//                           parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
//                           min={0}
//                           step={1000}
//                         />
//                       </Col>
//                     </Row>
//                     {calculateChange(order.id).change > 0 && (
//                       <Row justify="space-between" style={{ marginTop: 8 }}>
//                         <Col>
//                           <Text strong style={{ color: "#52c41a" }}>
//                             Tiền thừa:
//                           </Text>
//                         </Col>
//                         <Col>
//                           <Text strong style={{ color: "#52c41a" }}>
//                             {formatCurrency(calculateChange(order.id).change)}
//                           </Text>
//                         </Col>
//                       </Row>
//                     )}
//                     {calculateChange(order.id).remaining > 0 && (
//                       <Row justify="space-between" style={{ marginTop: 8 }}>
//                         <Col>
//                           <Text strong style={{ color: "#ff4d4f" }}>
//                             Còn thiếu:
//                           </Text>
//                         </Col>
//                         <Col>
//                           <Text strong style={{ color: "#ff4d4f" }}>
//                             {formatCurrency(calculateChange(order.id).remaining)}
//                           </Text>
//                         </Col>
//                       </Row>
//                     )}
//                   </>
//                 )}
//               </div>
//               {state.voucherSuggestions.show &&
//                 state.voucherSuggestions.betterVouchers?.length > 0 && (
//                   <div
//                     className="voucher-suggestions"
//                     style={{
//                       margin: "16px 0",
//                       padding: "12px",
//                       background: "#f6ffed",
//                       border: "1px solid #b7eb8f",
//                       borderRadius: "8px",
//                       boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                       maxHeight: "300px",
//                       overflowY: "auto",
//                     }}
//                   >
//                     <Space
//                       direction="vertical"
//                       size="small"
//                       style={{ width: "100%" }}
//                     >
//                       <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
//                         <InfoCircleOutlined style={{ marginRight: 8 }} />
//                         Có {state.voucherSuggestions.betterVouchers.length}{" "}
//                         voucher tốt hơn cho đơn hàng
//                       </Text>
  
//                       {state.voucherSuggestions.betterVouchers.map(
//                         (voucher, index) => {
//                           const currentDiscount = order.phieuGiamGia
//                             ? calculateDiscountAmount(
//                                 order.phieuGiamGia,
//                                 state.totals[order.id]?.totalBeforeVoucher || 0
//                               )
//                             : 0;
  
//                           return (
//                             <Card
//                               key={voucher.id}
//                               size="small"
//                               bordered={true}
//                               style={{ background: "#fff", marginBottom: 8 }}
//                               title={
//                                 <Space>
//                                   <TagOutlined style={{ color: "#1890ff" }} />
//                                   <Text strong style={{ fontSize: "12px" }}>
//                                     {voucher.maPhieuGiamGia}
//                                   </Text>
//                                   <Tag color="green" style={{ fontSize: "11px" }}>
//                                     +{formatCurrency(voucher.additionalSavings)}
//                                   </Tag>
//                                 </Space>
//                               }
//                               extra={
//                                 <Button
//                                   type="primary"
//                                   size="small"
//                                   onClick={() =>
//                                     handleApplySuggestedVoucher(
//                                       order.id,
//                                       voucher.id
//                                     )
//                                   }
//                                   disabled={voucher.amountNeeded > 0}
//                                 >
//                                   {voucher.amountNeeded > 0
//                                     ? "Chưa đủ"
//                                     : "Áp dụng"}
//                                 </Button>
//                               }
//                             >
//                               <Space
//                                 direction="vertical"
//                                 style={{ width: "100%" }}
//                                 size="small"
//                               >
//                                 <div>
//                                   <Text style={{ fontSize: "12px" }}>
//                                     {voucher.loaiPhieuGiamGia === 1
//                                       ? `Giảm ${
//                                           voucher.giaTriGiam
//                                         }% (tối đa ${formatCurrency(
//                                           voucher.soTienGiamToiDa
//                                         )})`
//                                       : `Giảm ${formatCurrency(
//                                           voucher.giaTriGiam
//                                         )}`}
//                                   </Text>
//                                   <br />
//                                   <Text
//                                     type="secondary"
//                                     style={{ fontSize: "12px" }}
//                                   >
//                                     Đơn tối thiểu:{" "}
//                                     {formatCurrency(voucher.giaTriToiThieu)}
//                                   </Text>
//                                 </div>
  
//                                 {voucher.amountNeeded > 0 && (
//                                   <Alert
//                                     type="warning"
//                                     message={`Cần mua thêm ${formatCurrency(
//                                       voucher.amountNeeded
//                                     )}`}
//                                     style={{
//                                       marginBottom: 8,
//                                       fontSize: "12px",
//                                       padding: "4px 8px",
//                                     }}
//                                   />
//                                 )}
  
//                                 {(voucher.suggestions?.currentProducts?.length >
//                                   0 ||
//                                   voucher.suggestions?.newProducts?.length >
//                                     0) && (
//                                   <Collapse ghost size="small">
//                                     <Collapse.Panel
//                                       header={
//                                         <Text style={{ fontSize: "12px" }}>
//                                           Xem gợi ý sản phẩm
//                                         </Text>
//                                       }
//                                       key="1"
//                                     >
//                                       {voucher.suggestions?.currentProducts
//                                         ?.length > 0 && (
//                                         <div style={{ marginTop: 4 }}>
//                                           <Text
//                                             strong
//                                             style={{ fontSize: "12px" }}
//                                           >
//                                             Mua thêm sản phẩm đã chọn:
//                                           </Text>
//                                           <List
//                                             size="small"
//                                             dataSource={
//                                               voucher.suggestions.currentProducts
//                                             }
//                                             renderItem={(product) => (
//                                               <List.Item
//                                                 extra={
//                                                   <Button
//                                                     type="primary"
//                                                     size="small"
//                                                     onClick={() =>
//                                                       handleUpdateQuantityForSuggestion(
//                                                         order.id,
//                                                         product.id,
//                                                         product.soLuong +
//                                                           product.quantityNeeded
//                                                       )
//                                                     }
//                                                   >
//                                                     +{product.quantityNeeded}
//                                                   </Button>
//                                                 }
//                                               >
//                                                 <List.Item.Meta
//                                                   avatar={
//                                                     <Avatar
//                                                       src={product.hinhAnh?.[0]}
//                                                       shape="square"
//                                                       size="small"
//                                                     />
//                                                   }
//                                                   title={
//                                                     <Text
//                                                       style={{ fontSize: "12px" }}
//                                                     >
//                                                       {product.tenSanPham}
//                                                     </Text>
//                                                   }
//                                                   description={
//                                                     <Text
//                                                       type="secondary"
//                                                       style={{ fontSize: "11px" }}
//                                                     >
//                                                       {formatCurrency(
//                                                         product.gia
//                                                       )}{" "}
//                                                       x{product.soLuong}
//                                                     </Text>
//                                                   }
//                                                 />
//                                               </List.Item>
//                                             )}
//                                           />
//                                         </div>
//                                       )}
  
//                                       {voucher.suggestions?.newProducts?.length >
//                                         0 && (
//                                         <div style={{ marginTop: 4 }}>
//                                           <Text
//                                             strong
//                                             style={{ fontSize: "12px" }}
//                                           >
//                                             Thêm sản phẩm mới:
//                                           </Text>
//                                           <List
//                                             size="small"
//                                             dataSource={
//                                               voucher.suggestions.newProducts
//                                             }
//                                             renderItem={(product) => (
//                                               <List.Item
//                                                 extra={
//                                                   <Button
//                                                     type="primary"
//                                                     size="small"
//                                                     icon={<PlusOutlined />}
//                                                     onClick={() =>
//                                                       handleAddSuggestedProduct(
//                                                         product
//                                                       )
//                                                     }
//                                                   >
//                                                     Thêm
//                                                   </Button>
//                                                 }
//                                               >
//                                                 <List.Item.Meta
//                                                   avatar={
//                                                     <Avatar
//                                                       src={product.hinhAnh?.[0]}
//                                                       shape="square"
//                                                       size="small"
//                                                     />
//                                                   }
//                                                   title={
//                                                     <Text
//                                                       style={{ fontSize: "12px" }}
//                                                     >
//                                                       {product.tenSanPham}
//                                                     </Text>
//                                                   }
//                                                   description={
//                                                     <Text
//                                                       type="success"
//                                                       style={{ fontSize: "11px" }}
//                                                     >
//                                                       {formatCurrency(
//                                                         product.gia
//                                                       )}
//                                                     </Text>
//                                                   }
//                                                 />
//                                               </List.Item>
//                                             )}
//                                           />
//                                         </div>
//                                       )}
//                                     </Collapse.Panel>
//                                   </Collapse>
//                                 )}
//                               </Space>
//                             </Card>
//                           );
//                         }
//                       )}
//                     </Space>
//                   </div>
//                 )}
  
//               <Space direction="vertical" style={{ width: "100%" }}>
//                 <Button
//                   type="primary"
//                   block
//                   onClick={() => handleConfirmOrder(order.id)}
//                 >
//                   Xác nhận đơn hàng
//                 </Button>
//               </Space>
//             </Space>
//           </div>
//         </Col>
//       </Row>
//     );
//     const columns = [
//       {
//         title: "STT",
//         key: "index",
//         width: 60,
//         align: "center",
//         render: (_, __, index) => {
//           return pagination.pageSize * (pagination.current - 1) + index + 1;
//         },
//       },
//       {
//         title: "Hình ảnh",
//         dataIndex: "hinhAnh",
//         key: "hinhAnh",
//         align: "center",
//         width: 180,
//         render: (hinhAnh) => {
//           return (
//             <div style={{ width: 150, height: 120, overflow: "hidden" }}>
//               {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
//                 <Carousel autoplay dots={false} effect="fade">
//                   {hinhAnh.map((url, index) => (
//                     <img
//                       key={index}
//                       src={url}
//                       alt={`Sản phẩm ${index}`}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                         borderRadius: 5,
//                         display: "block",
//                       }}
//                     />
//                   ))}
//                 </Carousel>
//               ) : (
//                 <img
//                   src="https://via.placeholder.com/50"
//                   alt="Không có ảnh"
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     borderRadius: 5,
//                     display: "block",
//                   }}
//                 />
//               )}
//             </div>
//           );
//         },
//       },
//       {
//         title: "Thông tin",
//         key: "thongTin",
//         align: "center",
//         width: 180,
//         render: (_, record) => (
//           <Space direction="vertical" size={0}>
//             <Typography.Text strong>{record.tenSanPham}</Typography.Text>
//             <Typography.Text type="secondary">
//               Mã: {record.maSanPham}
//             </Typography.Text>
//             <Typography.Text type="secondary">
//               Chất liệu: {record.chatLieu}
//             </Typography.Text>
//           </Space>
//         ),
//       },
//       {
//         title: "Màu sắc",
//         key: "mauSac",
//         align: "center",
//         width: 180,
//         render: (_, record) => (
//           <Space size="middle">
//             <Typography.Text>{record.mauSac}</Typography.Text>
//             <div
//               style={{
//                 display: "inline-block",
//                 width: 50,
//                 height: 20,
//                 borderRadius: 6,
//                 backgroundColor: record.maMauSac || "#FFFFFF",
//                 border: "1px solid rgba(0, 0, 0, 0.2)",
//                 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
//               }}
//             ></div>
//           </Space>
//         ),
//       },
//       {
//         title: "Kích thước",
//         key: "kichThuoc",
//         align: "center",
//         width: 100,
//         render: (_, record) => (
//           <Typography.Text>{record.kichThuoc}</Typography.Text>
//         ),
//       },
//       {
//         title: "Đơn giá",
//         key: "gia",
//         width: 140,
//         align: "center",
//         render: (_, record) => formatCurrency(record.gia),
//       },
//       {
//         title: "Số lượng",
//         key: "soLuong",
//         width: 120,
//         align: "center",
//         render: (_, record) => (
//           <InputNumber
//             min={1}
//             max={record.soLuongTonKho}
//             value={record.soLuong}
//             onChange={(value) =>
//               handleUpdateQuantity(state.activeKey, record.id, value)
//             }
//             style={{ width: 80 }}
//           />
//         ),
//       },
//       {
//         title: "Thành tiền",
//         key: "thanhTien",
//         width: 140,
//         align: "center",
//         render: (_, record) => formatCurrency(record.gia * record.soLuong),
//       },
//       {
//         title: "Hành động",
//         key: "action",
//         width: 80,
//         align: "center",
//         render: (_, record) => (
//           <Button
//             type="link"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleRemoveProduct(state.activeKey, record.id)}
//           />
//         ),
//       },
//     ];
//     const fetchPendingOrders = useCallback(async () => {
//       try {
//         const response = await api.get("/api/admin/ban-hang/hoadoncho");
//         const orders = response.data;
  
//         if (orders.length > 0) {
//           const newTabs = orders.map((order, index) => ({
//             key: order.id,
//             title: `Đơn hàng ${index + 1} - ${order.maHoaDon}`,
//             order: order,
//           }));
  
//           dispatch({ type: "SET_TABS", payload: newTabs });
//           dispatch({ type: "SET_ACTIVE_KEY", payload: orders[0].id });
  
//           const productsMap = {};
//           const totalsMap = {};
  
//           for (const order of orders) {
//             const products = await fetchInvoiceProducts(order.id, true);
//             productsMap[order.id] = products;
  
//             const newTotals = calculateOrderTotals(order.id);
//             totalsMap[order.id] = newTotals;
//           }
  
//           dispatch({ type: "SET_ORDER_PRODUCTS", payload: productsMap });
//           dispatch({ type: "SET_TOTALS", payload: totalsMap });
  
//           localStorage.setItem("pendingOrders", JSON.stringify(newTabs));
//           localStorage.setItem("orderProducts", JSON.stringify(productsMap));
//           localStorage.setItem("orderTotals", JSON.stringify(totalsMap));
//         } else {
//           dispatch({ type: "SET_TABS", payload: [] });
//           dispatch({ type: "SET_ORDER_PRODUCTS", payload: {} });
//           dispatch({ type: "SET_TOTALS", payload: {} });
//           dispatch({ type: "SET_ACTIVE_KEY", payload: null });
  
//           localStorage.removeItem("pendingOrders");
//           localStorage.removeItem("orderProducts");
//           localStorage.removeItem("orderTotals");
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải danh sách hóa đơn:", error);
//         message.error("Lỗi khi tải danh sách hóa đơn");
//       }
//     }, [calculateOrderTotals]);
  
//     const fetchInvoiceProducts = useCallback(
//       async (hoaDonId, skipUIUpdate = false) => {
//         try {
//           const response = await api.get(
//             `/api/admin/hoa-don/${hoaDonId}/san-pham`
//           );
//           let products = response.data || [];
  
//           const productsWithImages = await Promise.all(
//             products.map(async (product) => {
//               if (product.hinhAnh && product.hinhAnh.length > 0) {
//                 return product;
//               }
  
//               try {
//                 const cacheKey = `product_image_${product.id}`;
//                 let cachedImages = sessionStorage.getItem(cacheKey);
  
//                 if (cachedImages) {
//                   return {
//                     ...product,
//                     hinhAnh: JSON.parse(cachedImages),
//                   };
//                 }
  
//                 const imgResponse = await api.get(
//                   `/api/admin/sanphamchitiet/${product.id}/hinhanh`
//                 );
//                 const imageUrls =
//                   imgResponse.data && imgResponse.data.length > 0
//                     ? imgResponse.data.map((img) => img.anhUrl)
//                     : [];
  
//                 sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));
  
//                 return {
//                   ...product,
//                   hinhAnh: imageUrls,
//                 };
//               } catch (error) {
//                 console.error(`Lỗi khi lấy ảnh sản phẩm ${product.id}:`, error);
//                 return { ...product, hinhAnh: [] };
//               }
//             })
//           );
  
//           if (!skipUIUpdate) {
//             dispatch({
//               type: "SET_ORDER_PRODUCTS",
//               payload: { [hoaDonId]: productsWithImages },
//             });
  
//             const order = state.tabs.find((tab) => tab.key === hoaDonId)?.order;
//             if (order) {
//               const newTotals = calculateOrderTotals(hoaDonId);
//               dispatch({
//                 type: "SET_TOTALS",
//                 payload: { [hoaDonId]: newTotals },
//               });
//             }
//           } else {
//             dispatch({
//               type: "SET_ORDER_PRODUCTS",
//               payload: { [hoaDonId]: productsWithImages },
//             });
//           }
  
//           return productsWithImages;
//         } catch (error) {
//           console.error("Lỗi khi lấy danh sách sản phẩm:", error);
//           message.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
//           return [];
//         }
//       },
//       [calculateOrderTotals, state.tabs]
//     );
  
//     const fetchPaymentMethods = useCallback(async () => {
//       try {
//         const response = await api.get("/api/phuong-thuc-thanh-toan");
//         dispatch({ type: "SET_PAYMENT_METHODS", payload: response.data });
//       } catch (error) {
//         message.error("Lỗi khi tải phương thức thanh toán");
//       }
//     }, []);
  
//     const fetchProducts = useCallback(async () => {
//       try {
//         const response = await api.get("/api/admin/hoa-don/san-pham/all");
//         const productsData = response.data;
  
//         const productsWithImages = await Promise.all(
//           productsData.map(async (product) => {
//             try {
//               const imgResponse = await api.get(
//                 `/api/admin/sanphamchitiet/${product.id}/hinhanh`
//               );
//               const imageUrls = Array.isArray(imgResponse.data)
//                 ? imgResponse.data.map((img) => img.anhUrl)
//                 : [];
  
//               return {
//                 ...product,
//                 hinhAnh: imageUrls,
//               };
//             } catch (error) {
//               console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
//               return { ...product, hinhAnh: [] };
//             }
//           })
//         );
  
//         dispatch({ type: "SET_PRODUCTS", payload: productsWithImages });
//       } catch (error) {
//         message.error("Lỗi khi tải danh sách sản phẩm");
//       }
//     }, []);
  
//     const fetchInvoiceById = useCallback(
//       async (hoaDonId) => {
//         try {
//           const response = await api.get(`/api/admin/hoa-don/${hoaDonId}`);
//           const updatedOrder = response.data;
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
//             ),
//           });
  
//           const products = await fetchInvoiceProducts(hoaDonId, true);
//           const newTotals = calculateOrderTotals(hoaDonId);
  
//           dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//           if (hoaDonId === state.activeKey) {
//             dispatch({
//               type: "SET_TOTAL_BEFORE_DISCOUNT",
//               payload: newTotals.subtotal,
//             });
//             dispatch({ type: "SET_TOTAL_AMOUNT", payload: newTotals.finalTotal });
//           }
  
//           return updatedOrder;
//         } catch (error) {
//           console.error("Lỗi khi tải thông tin hóa đơn:", error);
//           return null;
//         }
//       },
//       [calculateOrderTotals, fetchInvoiceProducts, state.activeKey, state.tabs]
//     );
  
//     const handleRemoveVoucher = useCallback(
//       async (hoaDonId) => {
//         try {
//           const currentOrder = state.tabs.find(
//             (tab) => tab.key === hoaDonId
//           )?.order;
//           const currentProducts = state.orderProducts[hoaDonId] || [];
  
//           const subtotal = currentProducts.reduce(
//             (sum, product) => sum + product.gia * product.soLuong,
//             0
//           );
//           const totalWithShipping = subtotal + (currentOrder?.phiVanChuyen || 0);
//           const finalTotal = totalWithShipping;
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId
//                 ? {
//                     ...tab,
//                     order: {
//                       ...tab.order,
//                       tongTien: totalWithShipping,
//                       giamGia: 0,
//                       tongThanhToan: finalTotal,
//                       phieuGiamGia: null,
//                     },
//                   }
//                 : tab
//             ),
//           });
  
//           dispatch({
//             type: "SET_TOTALS",
//             payload: {
//               [hoaDonId]: {
//                 subtotal,
//                 shippingFee: currentOrder?.phiVanChuyen || 0,
//                 totalBeforeVoucher: totalWithShipping,
//                 discountAmount: 0,
//                 finalTotal,
//               },
//             },
//           });
  
//           await api.delete(`/api/admin/hoa-don/${hoaDonId}/voucher`);
  
//           message.success("Đã xóa voucher");
//           await fetchInvoiceProducts(hoaDonId);
//         } catch (error) {
//           console.error("Lỗi khi xóa voucher:", error);
//           message.error("Lỗi khi xóa voucher!");
//           await fetchInvoiceProducts(hoaDonId);
//         }
//       },
//       [fetchInvoiceProducts, state.orderProducts, state.tabs]
//     );
  
//     const autoApplyBestVoucher = useCallback(
//       async (hoaDonId) => {
//         try {
//           const order = state.tabs.find((tab) => tab.key === hoaDonId)?.order;
//           if (!order) return;
  
//           const currentProducts = state.orderProducts[hoaDonId] || [];
//           const totalBeforeVoucher =
//             currentProducts.reduce(
//               (sum, product) => sum + product.gia * product.soLuong,
//               0
//             ) + (order.phiVanChuyen || 0);
  
//           if (totalBeforeVoucher <= 0) {
//             message.info(
//               "Tổng tiền đơn hàng không hợp lệ để áp dụng mã giảm giá."
//             );
//             return;
//           }
  
//           const response = await api.get(
//             `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}`
//           );
//           const availableVouchers = response.data || [];
  
//           if (!availableVouchers.length) {
//             message.info("Không có mã giảm giá phù hợp.");
//             return;
//           }
  
//           const bestVoucher = availableVouchers.reduce((best, current) => {
//             if (totalBeforeVoucher < current.giaTriToiThieu) return best;
  
//             const currentDiscount = calculateDiscountAmount(
//               current,
//               totalBeforeVoucher
//             );
//             const bestDiscount = best
//               ? calculateDiscountAmount(best, totalBeforeVoucher)
//               : 0;
  
//             return currentDiscount > bestDiscount ? current : best;
//           }, null);
  
//           if (!bestVoucher) {
//             message.info("Không tìm thấy phiếu giảm giá tốt hơn.");
//             return;
//           }
  
//           const newDiscount = calculateDiscountAmount(
//             bestVoucher,
//             totalBeforeVoucher
//           );
//           const currentDiscount = order.phieuGiamGia
//             ? calculateDiscountAmount(order.phieuGiamGia, totalBeforeVoucher)
//             : 0;
  
//           if (newDiscount <= currentDiscount) {
//             message.info("Mã giảm giá hiện tại đã là tốt nhất.");
//             return;
//           }
  
//           await api.post(`/api/admin/ban-hang/${hoaDonId}/voucher`, {
//             voucherId: bestVoucher.id,
//           });
  
//           const updatedOrder = {
//             ...order,
//             phieuGiamGia: bestVoucher,
//             giamGia: newDiscount,
//             tongThanhToan: totalBeforeVoucher - newDiscount,
//           };
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
//             ),
//           });
  
//           const newTotals = {
//             subtotal: currentProducts.reduce(
//               (sum, product) => sum + product.gia * product.soLuong,
//               0
//             ),
//             shippingFee: order.phiVanChuyen || 0,
//             totalBeforeVoucher,
//             discountAmount: newDiscount,
//             finalTotal: totalBeforeVoucher - newDiscount,
//           };
  
//           dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//           message.success(
//             `Đã áp dụng mã giảm giá tốt nhất: ${bestVoucher.maPhieuGiamGia}`
//           );
  
//           await fetchInvoiceProducts(hoaDonId);
//         } catch (error) {
//           console.error("Lỗi khi tự động áp dụng voucher:", error);
//           message.error("Không thể áp dụng mã giảm giá tự động.");
//         }
//       },
//       [
//         calculateDiscountAmount,
//         fetchInvoiceProducts,
//         state.orderProducts,
//         state.tabs,
//       ]
//     );
  
//     const findBestVoucherAndSuggest = useCallback(
//       async (hoaDonId) => {
//         try {
//           const order = state.tabs.find((tab) => tab.key === hoaDonId)?.order;
//           if (!order) return;
  
//           const currentProducts = state.orderProducts[hoaDonId] || [];
//           const currentTotal = state.totals[hoaDonId]?.totalBeforeVoucher || 0;
  
//           if (currentTotal < 10000) {
//             dispatch({
//               type: "SET_VOUCHER_SUGGESTIONS",
//               payload: { show: false, betterVouchers: [] },
//             });
//             return;
//           }
  
//           const cacheKey = `vouchers_${Math.floor(currentTotal / 10000)}`;
//           let allVouchers = sessionStorage.getItem(cacheKey);
  
//           if (!allVouchers) {
//             const response = await api.get("/api/phieu-giam-gia");
//             allVouchers = response.data || [];
//             sessionStorage.setItem(cacheKey, JSON.stringify(allVouchers));
//           } else {
//             allVouchers = JSON.parse(allVouchers);
//           }
  
//           const currentDiscount = order.phieuGiamGia
//             ? calculateDiscountAmount(order.phieuGiamGia, currentTotal)
//             : 0;
  
//           const betterVouchers = allVouchers
//             .filter((voucher) => {
//               if (voucher.id === order.phieuGiamGia?.id) return false;
  
//               const potentialDiscount = calculateDiscountAmount(
//                 voucher,
//                 Math.max(currentTotal, voucher.giaTriToiThieu)
//               );
  
//               return potentialDiscount > currentDiscount;
//             })
//             .map((voucher) => ({
//               ...voucher,
//               amountNeeded: Math.max(0, voucher.giaTriToiThieu - currentTotal),
//               potentialDiscount: calculateDiscountAmount(
//                 voucher,
//                 Math.max(currentTotal, voucher.giaTriToiThieu)
//               ),
//               additionalSavings:
//                 calculateDiscountAmount(
//                   voucher,
//                   Math.max(currentTotal, voucher.giaTriToiThieu)
//                 ) - currentDiscount,
//             }))
//             .sort((a, b) => b.additionalSavings - a.additionalSavings)
//             .slice(0, 3);
  
//           if (betterVouchers.length > 0) {
//             const suggestedProducts = await Promise.all(
//               betterVouchers
//                 .filter((v) => v.amountNeeded > 0)
//                 .map(async (voucher) => {
//                   const currentProductSuggestions = currentProducts
//                     .filter((p) => p.gia > 0)
//                     .map((p) => ({
//                       ...p,
//                       quantityNeeded: Math.ceil(voucher.amountNeeded / p.gia),
//                     }))
//                     .sort((a, b) => a.quantityNeeded - b.quantityNeeded)
//                     .slice(0, 2);
  
//                   let allProducts = sessionStorage.getItem("all_products");
//                   if (!allProducts) {
//                     allProducts = await fetchProducts();
//                     sessionStorage.setItem(
//                       "all_products",
//                       JSON.stringify(allProducts)
//                     );
//                   } else {
//                     allProducts = JSON.parse(allProducts);
//                   }
  
//                   const currentProductIds = currentProducts.map((p) => p.id);
  
//                   const minPrice = voucher.amountNeeded * 0.7;
//                   const maxPrice = voucher.amountNeeded * 1.5;
  
//                   const newProductSuggestions = allProducts
//                     .filter((p) => !currentProductIds.includes(p.id))
//                     .filter(
//                       (p) =>
//                         p.gia >= minPrice && p.gia <= maxPrice && p.soLuong > 0
//                     )
//                     .sort(
//                       (a, b) =>
//                         Math.abs(a.gia - voucher.amountNeeded) -
//                         Math.abs(b.gia - voucher.amountNeeded)
//                     )
//                     .slice(0, 3);
  
//                   return {
//                     voucherId: voucher.id,
//                     currentProducts: currentProductSuggestions,
//                     newProducts: newProductSuggestions,
//                   };
//                 })
//             );
  
//             dispatch({
//               type: "SET_VOUCHER_SUGGESTIONS",
//               payload: {
//                 show: true,
//                 betterVouchers: betterVouchers.map((voucher, index) => ({
//                   ...voucher,
//                   suggestions: suggestedProducts.find(
//                     (s) => s?.voucherId === voucher.id
//                   ) || {
//                     currentProducts: [],
//                     newProducts: [],
//                   },
//                 })),
//               },
//             });
//           } else {
//             dispatch({
//               type: "SET_VOUCHER_SUGGESTIONS",
//               payload: { show: false, betterVouchers: [] },
//             });
//           }
//         } catch (error) {
//           console.error("Lỗi khi tìm voucher tốt hơn:", error);
//           dispatch({
//             type: "SET_VOUCHER_SUGGESTIONS",
//             payload: { show: false, betterVouchers: [] },
//           });
//         }
//       },
//       [
//         calculateDiscountAmount,
//         fetchProducts,
//         state.orderProducts,
//         state.tabs,
//         state.totals,
//       ]
//     );
  
//     const handleAddProductToOrder = useCallback(
//       async (product) => {
//         if (!state.activeKey) {
//           message.error("Vui lòng chọn hoặc tạo đơn hàng trước");
//           return;
//         }
  
//         try {
//           const response = await api.post(
//             `/api/admin/ban-hang/${state.activeKey}/add-product`,
//             {
//               sanPhamChiTietId: product.id,
//               soLuong: 1,
//             }
//           );
  
//           if (!response || !response.data) {
//             throw new Error("Dữ liệu API không hợp lệ");
//           }
  
//           const updatedProducts = await fetchInvoiceProducts(state.activeKey);
  
//           dispatch({
//             type: "SET_ORDER_PRODUCTS",
//             payload: { [state.activeKey]: updatedProducts },
//           });
//           dispatch({
//             type: "SET_TOTALS",
//             payload: { [state.activeKey]: calculateOrderTotals(state.activeKey) },
//           });
  
//           await findBestVoucherAndSuggest(state.activeKey);
  
//           message.success("Thêm sản phẩm thành công");
//         } catch (error) {
//           console.error("Lỗi khi thêm sản phẩm:", error);
//           message.error("Lỗi khi thêm sản phẩm, vui lòng kiểm tra lại.");
//         }
//       },
//       [
//         fetchInvoiceProducts,
//         findBestVoucherAndSuggest,
//         state.activeKey,
//         calculateOrderTotals,
//       ]
//     );
  
//     const handleUpdateQuantity = useCallback(
//       async (hoaDonId, hoaDonChiTietId, newQuantity) => {
//         if (newQuantity < 1) return message.error("Số lượng phải lớn hơn 0");
  
//         try {
//           dispatch({
//             type: "SET_ORDER_PRODUCTS",
//             payload: {
//               [hoaDonId]: state.orderProducts[hoaDonId].map((product) =>
//                 product.id === hoaDonChiTietId
//                   ? { ...product, soLuong: newQuantity }
//                   : product
//               ),
//             },
//           });
  
//           const updatedProducts = state.orderProducts[hoaDonId].map((product) =>
//             product.id === hoaDonChiTietId
//               ? { ...product, soLuong: newQuantity }
//               : product
//           );
  
//           const newTotals = calculateOrderTotals(hoaDonId, updatedProducts);
//           dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//           await api.put(
//             `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}/so-luong`,
//             { soLuong: newQuantity }
//           );
  
//           await autoApplyBestVoucher(hoaDonId);
//           await fetchInvoiceProducts(hoaDonId);
//           await findBestVoucherAndSuggest(hoaDonId);
//         } catch (error) {
//           console.error("Lỗi khi cập nhật số lượng:", error);
//           message.error("Lỗi khi cập nhật số lượng!");
//           await fetchInvoiceProducts(hoaDonId);
//         }
//       },
//       [
//         autoApplyBestVoucher,
//         calculateOrderTotals,
//         fetchInvoiceProducts,
//         findBestVoucherAndSuggest,
//         state.orderProducts,
//       ]
//     );
  
//     const handleRemoveProduct = useCallback(
//       async (hoaDonId, hoaDonChiTietId) => {
//         try {
//           const updatedProducts = state.orderProducts[hoaDonId].filter(
//             (product) => product.id !== hoaDonChiTietId
//           );
  
//           dispatch({
//             type: "SET_ORDER_PRODUCTS",
//             payload: { [hoaDonId]: updatedProducts },
//           });
  
//           await api.delete(
//             `/api/admin/ban-hang/${hoaDonId}/chi-tiet/${hoaDonChiTietId}`
//           );
  
//           const currentOrder = state.tabs.find(
//             (tab) => tab.key === hoaDonId
//           )?.order;
//           const newTotalBeforeVoucher =
//             updatedProducts.reduce(
//               (sum, product) => sum + product.gia * product.soLuong,
//               0
//             ) + (currentOrder?.phiVanChuyen || 0);
  
//           if (
//             currentOrder?.phieuGiamGia &&
//             newTotalBeforeVoucher < currentOrder.phieuGiamGia.giaTriToiThieu
//           ) {
//             await handleRemoveVoucher(hoaDonId);
//             message.info("Mã giảm giá cũ không còn hợp lệ và đã bị xóa.");
//           }
  
//           dispatch({
//             type: "SET_TOTALS",
//             payload: { [hoaDonId]: calculateOrderTotals(hoaDonId) },
//           });
//           await autoApplyBestVoucher(hoaDonId);
//           await fetchInvoiceProducts(hoaDonId);
//           await findBestVoucherAndSuggest(hoaDonId);
//         } catch (error) {
//           console.error("Lỗi khi xóa sản phẩm:", error);
//           message.error("Lỗi khi xóa sản phẩm!");
//         }
//       },
//       [
//         autoApplyBestVoucher,
//         calculateOrderTotals,
//         fetchInvoiceProducts,
//         findBestVoucherAndSuggest,
//         handleRemoveVoucher,
//         state.orderProducts,
//         state.tabs,
//       ]
//     );
  
//     const handleVoucherSelected = useCallback(
//       async (hoaDonId, voucherId) => {
//         try {
//           if (!hoaDonId || !voucherId) {
//             message.error("Không thể áp dụng voucher");
//             return;
//           }
  
//           const response = await api.post(
//             `/api/admin/hoa-don/${hoaDonId}/voucher`,
//             { voucherId }
//           );
  
//           if (!response.data) {
//             throw new Error("Dữ liệu trả về từ API không hợp lệ.");
//           }
  
//           const updatedOrder = response.data;
  
//           const updatedProducts = await fetchInvoiceProducts(hoaDonId, true);
  
//           const newTotals = calculateOrderTotals(
//             hoaDonId,
//             updatedProducts,
//             updatedOrder
//           );
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId ? { ...tab, order: updatedOrder } : tab
//             ),
//           });
  
//           dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//           if (hoaDonId === state.activeKey) {
//             dispatch({
//               type: "SET_TOTAL_BEFORE_DISCOUNT",
//               payload: newTotals.subtotal,
//             });
//             dispatch({ type: "SET_TOTAL_AMOUNT", payload: newTotals.finalTotal });
//           }
  
//           dispatch({ type: "SET_OPEN_VOUCHER_DIALOG", payload: false });
//           message.success("Áp dụng voucher thành công!");
//         } catch (error) {
//           console.error("Lỗi khi áp dụng voucher:", error);
//           message.error("Lỗi khi áp dụng voucher, vui lòng thử lại.");
//         }
//       },
//       [calculateOrderTotals, fetchInvoiceProducts, state.activeKey, state.tabs]
//     );
  
//     const handleConfirmOrder = useCallback(
//       async (hoaDonId) => {
//         try {
//           const currentOrder = state.tabs.find(
//             (tab) => tab.key === hoaDonId
//           )?.order;
  
//           if (!currentOrder || !currentOrder.phuongThucThanhToan) {
//             message.error(
//               "Vui lòng chọn phương thức thanh toán trước khi xác nhận đơn hàng!"
//             );
//             return;
//           }
  
//           if (
//             currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
//             PAYMENT_METHOD.CASH
//           ) {
//             const { remaining } = calculateChange(hoaDonId);
//             if (remaining > 0) {
//               message.error("Số tiền khách đưa chưa đủ để thanh toán!");
//               return;
//             }
//           }
  
//           if (
//             currentOrder.phuongThucThanhToan.maPhuongThucThanhToan ===
//             PAYMENT_METHOD.QR
//           ) {
//             generateQR();
//             dispatch({ type: "SET_IS_MODAL_PAYMENT_QR", payload: true });
  
//             let isPaid = false;
//             let attempts = 0;
//             const maxAttempts = 60;
  
//             while (!isPaid && attempts < maxAttempts) {
//               isPaid = await checkPayment(
//                 hoaDonId,
//                 state.totals[hoaDonId]?.finalTotal
//               );
//               if (isPaid) break;
//               await new Promise((resolve) => setTimeout(resolve, 2000));
//               attempts++;
//             }
  
//             if (!isPaid) {
//               dispatch({ type: "SET_IS_MODAL_PAYMENT_QR", payload: false });
//               message.error("Chưa nhận được thanh toán, vui lòng thử lại!");
//               return;
//             }
//           }
  
//           await api.post(`/api/admin/ban-hang/${hoaDonId}/complete`, {
//             phuongThucThanhToans: [
//               currentOrder.phuongThucThanhToan.maPhuongThucThanhToan,
//             ],
//           });
  
//           const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
//             responseType: "blob",
//             headers: { Accept: "application/pdf, application/json" },
//           });
  
//           const contentType = response.headers["content-type"];
//           if (!contentType.includes("application/pdf")) {
//             message.error("Định dạng không hợp lệ từ máy chủ");
//             return;
//           }
  
//           const blob = new Blob([response.data], { type: "application/pdf" });
//           const url = window.URL.createObjectURL(blob);
  
//           dispatch({ type: "SET_PDF_URL", payload: url });
//           dispatch({ type: "SET_PREVIEW_OPEN", payload: true });
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.filter((tab) => tab.key !== hoaDonId),
//           });
//           message.success("Xác nhận đơn hàng thành công");
//         } catch (error) {
//           message.error("Lỗi khi xác nhận đơn hàng");
//         }
//       },
//       [calculateChange, state.tabs, state.totals]
//     );
  
//     const handleDirectPrint = useCallback(() => {
//       const iframe = document.getElementById("pdf-preview");
//       iframe.contentWindow.print();
//     }, []);
  
//     const handlePrintInvoice = useCallback(async (hoaDonId) => {
//       try {
//         const response = await api.get(`/api/admin/hoa-don/${hoaDonId}/print`, {
//           responseType: "blob",
//         });
  
//         const blob = new Blob([response.data], { type: "application/pdf" });
//         const url = window.URL.createObjectURL(blob);
//         window.open(url);
//       } catch (error) {
//         message.error("Lỗi khi in hóa đơn");
//       }
//     }, []);
  
//     const handleApplySuggestedVoucher = useCallback(
//       async (hoaDonId, voucherId) => {
//         try {
//           const response = await api.post(
//             `/api/admin/hoa-don/${hoaDonId}/voucher`,
//             {
//               voucherId: voucherId,
//             }
//           );
  
//           if (response.data) {
//             message.success("Áp dụng voucher thành công");
  
//             await fetchInvoiceById(hoaDonId);
  
//             const newTotals = calculateOrderTotals(hoaDonId);
//             dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//             if (hoaDonId === state.activeKey) {
//               dispatch({
//                 type: "SET_TOTAL_BEFORE_DISCOUNT",
//                 payload: newTotals.subtotal,
//               });
//               dispatch({
//                 type: "SET_TOTAL_AMOUNT",
//                 payload: newTotals.finalTotal,
//               });
//             }
  
//             dispatch({
//               type: "SET_VOUCHER_SUGGESTIONS",
//               payload: { show: false, betterVouchers: [] },
//             });
  
//             return true;
//           }
//           return false;
//         } catch (error) {
//           console.error("Lỗi khi áp dụng voucher gợi ý:", error);
//           message.error("Lỗi khi áp dụng voucher");
//           return false;
//         }
//       },
//       [calculateOrderTotals, fetchInvoiceById, state.activeKey]
//     );
  
//     const handleAddSuggestedProduct = useCallback(
//       async (product) => {
//         try {
//           await handleAddProductToOrder(product);
//           message.success(`Đã thêm ${product.tenSanPham} vào đơn hàng`);
  
//           await fetchInvoiceById(state.activeKey);
  
//           const newTotals = calculateOrderTotals(state.activeKey);
//           dispatch({
//             type: "SET_TOTALS",
//             payload: { [state.activeKey]: newTotals },
//           });
  
//           dispatch({
//             type: "SET_TOTAL_BEFORE_DISCOUNT",
//             payload: newTotals.subtotal,
//           });
//           dispatch({ type: "SET_TOTAL_AMOUNT", payload: newTotals.finalTotal });
  
//           setTimeout(() => {
//             findBestVoucherAndSuggest(state.activeKey);
//           }, 500);
//         } catch (error) {
//           console.error("Lỗi khi thêm sản phẩm:", error);
//           message.error("Lỗi khi thêm sản phẩm vào đơn hàng");
//         }
//       },
//       [
//         fetchInvoiceById,
//         findBestVoucherAndSuggest,
//         handleAddProductToOrder,
//         state.activeKey,
//       ]
//     );
  
//     const handleUpdateQuantityForSuggestion = useCallback(
//       async (hoaDonId, productId, newQuantity) => {
//         try {
//           await handleUpdateQuantity(hoaDonId, productId, newQuantity);
//           message.success("Đã cập nhật số lượng sản phẩm");
  
//           await fetchInvoiceById(hoaDonId);
  
//           const newTotals = calculateOrderTotals(hoaDonId);
//           dispatch({ type: "SET_TOTALS", payload: { [hoaDonId]: newTotals } });
  
//           if (hoaDonId === state.activeKey) {
//             dispatch({
//               type: "SET_TOTAL_BEFORE_DISCOUNT",
//               payload: newTotals.subtotal,
//             });
//             dispatch({ type: "SET_TOTAL_AMOUNT", payload: newTotals.finalTotal });
//           }
  
//           setTimeout(() => {
//             findBestVoucherAndSuggest(hoaDonId);
//           }, 500);
//         } catch (error) {
//           console.error("Lỗi khi cập nhật số lượng:", error);
//           message.error("Lỗi khi cập nhật số lượng sản phẩm");
//         }
//       },
//       [
//         fetchInvoiceById,
//         findBestVoucherAndSuggest,
//         handleUpdateQuantity,
//         state.activeKey,
//       ]
//     );
  
//     const handleAddNewCustomer = useCallback(() => {
//       // Implement new customer creation logic
//     }, []);
  
//     const handleDeliveryMethodChange = useCallback(async (hoaDonId, method) => {
//       // Implement delivery method change logic
//     }, []);
  
//     const handlePaymentMethodChange = useCallback(
//       (hoaDonId, selectedId) => {
//         const selectedMethod = state.paymentMethods.find(
//           (method) => method.maPhuongThucThanhToan === selectedId
//         );
  
//         if (selectedMethod) {
//           const newPaymentMethod = {
//             id: selectedMethod.id,
//             maPhuongThucThanhToan: selectedMethod.maPhuongThucThanhToan,
//             tenPhuongThucThanhToan: selectedMethod.tenPhuongThucThanhToan,
//             moTa: selectedMethod.moTa,
//           };
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId
//                 ? {
//                     ...tab,
//                     order: {
//                       ...tab.order,
//                       phuongThucThanhToan: selectedMethod,
//                     },
//                   }
//                 : tab
//             ),
//           });
//         } else {
//           message.error("Phương thức thanh toán không hợp lệ!");
//         }
//       },
//       [state.paymentMethods, state.tabs]
//     );
  
//     const handleShippingFeeChange = useCallback(async (hoaDonId, fee) => {
//       // Implement shipping fee change logic
//     }, []);
  
//     const loadCustomers = useCallback(async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/khach_hang");
//         dispatch({ type: "SET_CUSTOMERS", payload: response.data });
//       } catch (error) {
//         console.error("Error loading customers:", error);
//       }
//     }, []);
  
//     const handleCustomerSelected = useCallback(
//       async (hoaDonId, customerId) => {
//         try {
//           const response = await axios.put(
//             `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/customer`,
//             { customerId }
//           );
  
//           dispatch({
//             type: "SET_TABS",
//             payload: state.tabs.map((tab) =>
//               tab.key === hoaDonId ? { ...tab, order: response.data } : tab
//             ),
//           });
//           dispatch({ type: "SET_OPEN_CUSTOMER_DIALOG", payload: false });
//         } catch (error) {
//           message.error("Lỗi khi chọn khách hàng");
//         }
//       },
//       [state.tabs]
//     );
  
//     const handleSelectCustomer = useCallback(
//       async (hoaDonId) => {
//         try {
//           await loadCustomers();
//           dispatch({ type: "SET_OPEN_CUSTOMER_DIALOG", payload: true });
//         } catch (error) {
//           message.error("Lỗi khi tải danh sách khách hàng");
//         }
//       },
//       [loadCustomers]
//     );
  
//     const generateQR = useCallback(() => {
//       const account = "102876619993";
//       const bank = "VietinBank";
//       const amount = state.totals[state.activeKey]?.finalTotal;
//       const description = `SEVQR thanh toan don hang ${state.activeKey}`;
//       const template = "compact";
//       const qrLink = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amount}&des=${encodeURIComponent(
//         description
//       )}&template=${template}&download=false`;
//       dispatch({ type: "SET_QR_URL", payload: qrLink });
//     }, [state.activeKey, state.totals]);
  
//     const addTab = useCallback(async () => {
//       try {
//         const pendingOrdersCount = state.tabs.filter(
//           (tab) => tab.order.trangThai === 1
//         ).length;
//         if (pendingOrdersCount >= 10) {
//           message.error("Bạn chỉ có thể tạo tối đa 10 đơn hàng chờ xác nhận");
//           return;
//         }
  
//         dispatch({ type: "SET_LOADING", payload: true });
//         const response = await api.post("/api/admin/ban-hang/create", {
//           emailNhanVien: "vnv@gmail.com",
//         });
  
//         const newOrder = response.data;
//         const newOrderKey = newOrder.id;
  
//         dispatch({
//           type: "SET_TABS",
//           payload: [
//             ...state.tabs,
//             {
//               key: newOrderKey,
//               title: `Đơn hàng ${state.tabs.length + 1} - ${newOrder.maHoaDon}`,
//               order: newOrder,
//             },
//           ],
//         });
  
//         dispatch({ type: "SET_ORDER_PRODUCTS", payload: { [newOrderKey]: [] } });
//         dispatch({ type: "SET_ACTIVE_KEY", payload: newOrderKey });
//         message.success("Tạo đơn hàng mới thành công");
  
//         if (socket.current) {
//           socket.current.subscribe(`/topic/hoa-don/${newOrderKey}`, (message) => {
//             fetchInvoiceProducts(newOrderKey).then((products) => {
//               dispatch({
//                 type: "SET_ORDER_PRODUCTS",
//                 payload: { [newOrderKey]: products },
//               });
//             });
//           });
//         }
//       } catch (error) {
//         message.error("Lỗi khi tạo đơn hàng mới");
//       } finally {
//         dispatch({ type: "SET_LOADING", payload: false });
//       }
//     }, [fetchInvoiceProducts, state.tabs]);
  
//     const handleEditTab = useCallback(
//       (targetKey, action) => {
//         if (action === "add") {
//           addTab();
//         } else if (action === "remove") {
//           Modal.confirm({
//             title: "Xác nhận hủy đơn hàng",
//             content:
//               "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm sẽ được hoàn lại kho.",
//             okText: "Hủy đơn",
//             cancelText: "Đóng",
//             okButtonProps: { danger: true },
//             onOk: async () => {
//               try {
//                 await api.delete(`/api/admin/hoa-don/${targetKey}`);
  
//                 dispatch({
//                   type: "SET_TABS",
//                   payload: state.tabs.filter((tab) => tab.key !== targetKey),
//                 });
  
//                 dispatch({
//                   type: "SET_ORDER_PRODUCTS",
//                   payload: Object.keys(state.orderProducts).reduce((acc, key) => {
//                     if (key !== targetKey) acc[key] = state.orderProducts[key];
//                     return acc;
//                   }, {}),
//                 });
  
//                 if (state.activeKey === targetKey) {
//                   const newActiveKey = state.tabs.find(
//                     (tab) => tab.key !== targetKey
//                   )?.key;
//                   dispatch({ type: "SET_ACTIVE_KEY", payload: newActiveKey });
//                 }
  
//                 message.success("Đã hủy đơn hàng và hoàn lại sản phẩm vào kho.");
//               } catch (error) {
//                 console.error("Lỗi khi hủy đơn hàng:", error);
//                 message.error(
//                   error.response?.data?.message || "Lỗi khi hủy đơn hàng."
//                 );
//               }
//             },
//           });
//         }
//       },
//       [addTab, state.activeKey, state.orderProducts, state.tabs]
//     );
  
//     useEffect(() => {
//       const initializeData = async () => {
//         try {
//           const isInitializing = true;
  
//           await fetchPaymentMethods();
  
//           const savedOrders = localStorage.getItem("pendingOrders");
//           const savedProducts = localStorage.getItem("orderProducts");
//           const savedTotals = localStorage.getItem("orderTotals");
  
//           if (savedOrders) {
//             dispatch({ type: "SET_TABS", payload: JSON.parse(savedOrders) });
//           }
//           if (savedProducts) {
//             dispatch({
//               type: "SET_ORDER_PRODUCTS",
//               payload: JSON.parse(savedProducts),
//             });
//           }
//           if (savedTotals) {
//             const parsedTotals = JSON.parse(savedTotals);
//             dispatch({ type: "SET_TOTALS", payload: parsedTotals });
  
//             const firstOrderId = JSON.parse(savedOrders)?.[0]?.key;
//             if (firstOrderId && parsedTotals[firstOrderId]) {
//               dispatch({
//                 type: "SET_TOTAL_BEFORE_DISCOUNT",
//                 payload: parsedTotals[firstOrderId].subtotal,
//               });
//               dispatch({
//                 type: "SET_TOTAL_AMOUNT",
//                 payload: parsedTotals[firstOrderId].finalTotal,
//               });
//             }
//           }
  
//           await fetchPendingOrders(true);
//         } catch (error) {
//           console.error("Lỗi khởi tạo dữ liệu:", error);
//         }
//       };
  
//       initializeData();
//     }, [fetchPaymentMethods, fetchPendingOrders]);
  
//     useEffect(() => {
//       if (state.activeKey) {
//         fetchInvoiceById(state.activeKey).then(() => {
//           const newTotals = calculateOrderTotals(state.activeKey);
//           dispatch({
//             type: "SET_TOTALS",
//             payload: { [state.activeKey]: newTotals },
//           });
//           dispatch({
//             type: "SET_TOTAL_BEFORE_DISCOUNT",
//             payload: newTotals.subtotal,
//           });
//           dispatch({ type: "SET_TOTAL_AMOUNT", payload: newTotals.finalTotal });
//           findBestVoucherAndSuggest(state.activeKey);
//         });
//       }
//     }, [
//       calculateOrderTotals,
//       fetchInvoiceById,
//       findBestVoucherAndSuggest,
//       state.activeKey,
//     ]);
  
//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/ws");
//     const stompClient = new Client({
//       webSocketFactory: () => socket,
//       debug: (msg) => console.log(msg),
//       reconnectDelay: 5000, // ✅ Tự động kết nối lại sau 5s nếu bị ngắt
//       onConnect: () => {
//         console.log("✅ WebSocket connected");
  
//         stompClient.subscribe("/topic/hoa-don-cho", (message) => {
//           fetchPendingOrders();
//         });
  
//         state.tabs.forEach((tab) => {
//           stompClient.subscribe(`/topic/hoa-don/${tab.key}`, (message) => {
//             fetchInvoiceProducts(tab.key).then((products) => {
//               dispatch({
//                 type: "SET_ORDER_PRODUCTS",
//                 payload: { [tab.key]: products },
//               });
//             });
//           });
//         });
//       },
//       onStompError: (frame) => {
//         console.error("STOMP error:", frame.headers["message"]);
//         console.error("STOMP error details:", frame.body);
//       },
//       onWebSocketError: (event) => {
//         console.error("WebSocket error:", event);
//       },
//       onDisconnect: () => console.log("🔌 WebSocket disconnected"),
//     });
  
//     stompClient.activate();
  
//     return () => {
//       console.log("⏳ Cleaning up WebSocket...");
//       stompClient.deactivate(); // ✅ Chỉ gọi khi component bị unmount
//     };
//   }, []); // ✅ Chỉ chạy 1 lần khi component mount
  
  
    
//     useEffect(() => {
//       fetchProducts();
//     }, [fetchProducts]);
  
//     const items = state.tabs.map((tab) => ({
//       key: tab.key,
//       label: (
//         <span>
//           {tab.title}
//           {state.orderProducts[tab.key]?.length > 0 && (
//             <sup
//               style={{
//                 marginLeft: "4px",
//                 color: "#ff4d4f",
//                 fontWeight: "bold",
//               }}
//             >
//               ({state.orderProducts[tab.key].length})
//             </sup>
//           )}
//         </span>
//       ),
//       children: renderOrderContent(tab.order),
//     }));
  
    
  
   
//     const handleTableChange = (pagination) => {
//       setPagination(pagination);
//       if (state.activeKey) {
//         fetchInvoiceProducts(state.activeKey);
//       }
//     };
  
//     const handleCancelListSanPhamChiTiet = () => {
//       dispatch({ type: "SET_IS_MODAL_VISIBLE_LIST_SPCT", payload: false });
//     };
  
//     const loadVouchers = useCallback(
//       async (hoaDonId) => {
//         try {
//           const response = await api.get(
//             `/api/admin/phieu-giam-gia/available?orderTotal=${
//               state.totals[hoaDonId]?.totalBeforeVoucher || 0
//             }`
//           );
//           dispatch({ type: "SET_VOUCHERS", payload: response.data });
//         } catch (error) {
//           message.error("Lỗi khi tải danh sách voucher");
//         }
//       },
//       [state.totals]
//     );
  
//     const PreviewModal = () => (
//       <Modal
//         open={state.previewOpen}
//         onCancel={() => {
//           dispatch({ type: "SET_PREVIEW_OPEN", payload: false });
//           if (state.pdfUrl) window.URL.revokeObjectURL(state.pdfUrl);
//           dispatch({ type: "SET_PDF_URL", payload: null });
//         }}
//         width="70%"
//         footer={[
//           <Button key="print" type="primary" onClick={handleDirectPrint}>
//             In hóa đơn
//           </Button>,
//         ]}
//       >
//         <iframe
//           id="pdf-preview"
//           src={state.pdfUrl}
//           width="100%"
//           height="1200"
//           style={{ border: "none" }}
//           title="PDF Preview"
//         />
//       </Modal>
//     );
  
//     return (
//       <Layout
//         style={{ height: "100vh", boxShadow: "0 4px 8px rgba(24, 24, 24, 0.1)" }}
//       >
//         <Sider
//           width="100%"
//           style={{
//             background: "#fff",
//             padding: 20,
//             position: "relative",
//             height: "100%",
//             overflowY: "hidden",
//           }}
//         >
//           <Row style={{ marginBottom: 16 }}>
//             <Col span={20}>
//               <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
//                 Quản lý bán hàng
//               </Text>
//             </Col>
//             <Col span={4}>
//               <Button
//                 onClick={addTab}
//                 type="primary"
//                 style={{
//                   zIndex: 1,
//                 }}
//               >
//                 <IoIosAddCircle />
//                 Tạo đơn hàng mới
//               </Button>
//             </Col>
//           </Row>
  
//           {state.tabs.length === 0 ? (
//             <Row
//               justify="center"
//               align="middle"
//               style={{ height: "calc(100% - 60px)" }}
//             >
//               <Col>
//                 <Title level={3}>
//                   Không có hóa đơn ở trạng thái chờ xác nhận
//                 </Title>
//               </Col>
//             </Row>
//           ) : (
//             <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
//               <Tabs
//                 type="editable-card"
//                 onChange={(key) =>
//                   dispatch({ type: "SET_ACTIVE_KEY", payload: key })
//                 }
//                 activeKey={state.activeKey}
//                 onEdit={handleEditTab}
//                 items={items}
//               />
//             </div>
//           )}
//         </Sider>
//         <Content
//           style={{
//             padding: 24,
//             height: "100%",
//             overflow: "hidden",
//           }}
//         />
  
//         <Modal
//           title="Chọn khách hàng"
//           open={state.openCustomerDialog}
//           onCancel={() =>
//             dispatch({ type: "SET_OPEN_CUSTOMER_DIALOG", payload: false })
//           }
//           footer={null}
//         >
//           <List
//             dataSource={state.customers}
//             renderItem={(customer) => (
//               <List.Item
//                 actions={[
//                   <Button
//                     type="primary"
//                     onClick={() =>
//                       handleCustomerSelected(state.activeKey, customer.id)
//                     }
//                   >
//                     Chọn
//                   </Button>,
//                 ]}
//               >
//                 <List.Item.Meta
//                   avatar={<Avatar src={customer.avatar} />}
//                   title={customer.tenKhachHang}
//                   description={
//                     <>
//                       {customer.soDienThoai}
//                       <br />
//                       {customer.email}
//                     </>
//                   }
//                 />
//               </List.Item>
//             )}
//           />
//         </Modal>
  
//         <Modal
//           title="Chọn voucher"
//           open={state.openVoucherDialog}
//           onCancel={() =>
//             dispatch({ type: "SET_OPEN_VOUCHER_DIALOG", payload: false })
//           }
//           footer={null}
//           ref={modalRef}
//         >
//           <List
//             dataSource={state.vouchers}
//             renderItem={(voucher) => (
//               <List.Item
//                 style={{
//                   border:
//                     state.selectedVoucher?.id === voucher.id
//                       ? "2px solid #1890ff"
//                       : "1px solid #d9d9d9",
//                   borderRadius: "8px",
//                   padding: "16px",
//                   marginBottom: "8px",
//                   backgroundColor:
//                     state.selectedVoucher?.id === voucher.id
//                       ? "#f0f5ff"
//                       : "white",
//                 }}
//                 actions={[
//                   <Radio
//                     checked={state.selectedVoucher?.id === voucher.id}
//                     onChange={() =>
//                       dispatch({ type: "SET_SELECTED_VOUCHER", payload: voucher })
//                     }
//                   />,
//                 ]}
//               >
//                 <List.Item.Meta
//                   title={voucher.maPhieuGiamGia}
//                   description={
//                     <div>
//                       <div>
//                         {voucher.loaiPhieuGiamGia === 1
//                           ? `Giảm ${voucher.giaTriGiam}% (tối đa ${formatCurrency(
//                               voucher.soTienGiamToiDa
//                             )})`
//                           : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
//                       </div>
//                       <div>
//                         Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
//                       </div>
//                     </div>
//                   }
//                 />
//               </List.Item>
//             )}
//           />
//           <Button
//             type="primary"
//             block
//             disabled={!state.selectedVoucher}
//             onClick={() =>
//               handleVoucherSelected(state.activeKey, state.selectedVoucher.id)
//             }
//           >
//             Áp dụng
//           </Button>
//         </Modal>
  
//         <Modal
//           title="Quét QR để thanh toán"
//           open={state.isModalPaymentQR}
//           onCancel={() =>
//             dispatch({ type: "SET_IS_MODAL_PAYMENT_QR", payload: false })
//           }
//           footer={null}
//         >
//           {state.qrUrl && (
//             <div style={{ textAlign: "center" }}>
//               <img src={state.qrUrl} alt="QR Code" style={{ width: "100%" }} />
//             </div>
//           )}
//         </Modal>
  
//         <ProductTable
//           products={state.products}
//           onAddProduct={handleAddProductToOrder}
//           open={state.openProductTable}
//           onClose={() =>
//             dispatch({ type: "SET_OPEN_PRODUCT_TABLE", payload: false })
//           }
//         />
  
//         <PreviewModal />
//       </Layout>
//     );
//   };
  
//   export default BanHang;
  