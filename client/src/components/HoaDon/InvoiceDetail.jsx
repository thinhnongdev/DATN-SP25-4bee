// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { toast } from "react-toastify";
// import api from "../utils/api";
// import ProductTable from "../components/HoaDon/ProductTable";
// import {
//   Layout,
//   Card,
//   Typography,
//   Button,
//   Modal,
//   Input,
//   Select,
//   Row,
//   Col,
//   Table,
//   Tooltip,
//   Space,
//   Divider,
//   Steps,
//   Tag,
//   List,
//   Radio,
//   Spin,
//   Form,
//   Carousel,
//   InputNumber,
//   Popconfirm,
//   Checkbox,
//   message,
// } from "antd";
// import {
//   EditOutlined,
//   PrinterOutlined,
//   ArrowLeftOutlined,
//   DeleteOutlined,
//   PlusOutlined,
//   HistoryOutlined,
//   CloseOutlined,
//   TagOutlined,
//   ReloadOutlined,
//   SyncOutlined,
//   WarningOutlined,
// } from "@ant-design/icons";
// import { formatDate, formatCurrency } from "../utils/format";
// import { StatusChip, TypeChip } from "../components/StatusChip";
// import axios from "axios";

// const { Content } = Layout;
// const { Title, Text } = Typography;
// const { Option } = Select;
// const { Step } = Steps;
// const steps = [
//   { label: "Chờ xác nhận", status: 1 },
//   { label: "Đã xác nhận", status: 2 },
//   { label: "Chuẩn bị giao hàng", status: 3 },
//   { label: "Đang giao", status: 4 },
//   { label: "Hoàn thành", status: 5 },
//   // { label: 'Đã hủy', status: 6 },
// ];
// const getStatusText = (status) => {
//   switch (status) {
//     case 1:
//       return "Chờ xác nhận";
//     case 2:
//       return "Đã xác nhận";
//     case 3:
//       return "Chờ giao hàng";
//     case 4:
//       return "Đang giao hàng";
//     case 5:
//       return "Hoàn thành đơn hàng";
//     case 6:
//       return "Đã hủy";
//     default:
//       return "---";
//   }
// };

// function InvoiceDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [openStatusDialog, setOpenStatusDialog] = useState(false);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [quantity, setQuantity] = useState(1);
//   const [editMode, setEditMode] = useState(false);
//   const [invoiceProducts, setInvoiceProducts] = useState([]);
//   const [updatingQuantity, setUpdatingQuantity] = useState(false);
//   const [vouchers, setVouchers] = useState([]);
//   const [selectedVoucher, setSelectedVoucher] = useState(null);
//   const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
//   const [editVoucherDialog, setEditVoucherDialog] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [recipientName, setRecipientName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [province, setProvince] = useState("");
//   const [district, setDistrict] = useState("");
//   const [ward, setWard] = useState("");
//   const [specificAddress, setSpecificAddress] = useState("");
//   const [note, setNote] = useState("");
//   const [shippingFee, setShippingFee] = useState(0);
//   const [provinces, setProvinces] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [wards, setWards] = useState([]);
//   const [openEditRecipientDialog, setOpenEditRecipientDialog] = useState(false);
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
//   const [confirmText, setConfirmText] = useState("");
//   const [nextStatus, setNextStatus] = useState(null);
//   const [cartChanged, setCartChanged] = useState(false);
//   const [bestVoucher, setBestVoucher] = useState(null);
//   const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
//   const [deletingProductId, setDeletingProductId] = useState(null);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [orderHistory, setOrderHistory] = useState([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [selectedProvince, setSelectedProvince] = useState(null);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [selectedWard, setSelectedWard] = useState(null);
//   const [paymentHistory, setPaymentHistory] = useState([]);
//   const [loadingPayments, setLoadingPayments] = useState(false);
//   const [errorDialogOpen, setErrorDialogOpen] = useState(false);
//   const [errorDialogMessage, setErrorDialogMessage] = useState("");
//   const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(0);
//   const token = localStorage.getItem("token");
//   const [trackingAddressLoading, setTrackingAddressLoading] = useState(false);
//   const [addressDataLoaded, setAddressDataLoaded] = useState(false);
//   const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
//   const [statusTimestamps, setStatusTimestamps] = useState({});
//   const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
//   const [editRecipientDialogOpen, setEditRecipientDialogOpen] = useState(false);
//   const [editRecipientLoading, setEditRecipientLoading] = useState(false);
//   // Thêm các state còn thiếu cho form chỉnh sửa thông tin người nhận
//   const [checkingPrice, setCheckingPrice] = useState(false);
//   const [priceNeedsConfirmation, setPriceNeedsConfirmation] = useState(false);
//   const [email, setEmail] = useState(invoice?.emailNguoiNhan || "");
//   const [detailAddress, setDetailAddress] = useState("");
//   const [openPriceChangeDialog, setOpenPriceChangeDialog] = useState(false);
//   const [changedProducts, setChangedProducts] = useState([]);
//   const [shippingFeeFromGHN, setShippingFeeFromGHN] = useState(null);
//   const [loadingShippingFee, setLoadingShippingFee] = useState(false);
//   const [updateAllPrices, setUpdateAllPrices] = useState(false);
//   const [editRecipientValues, setEditRecipientValues] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     province: "",
//     district: "",
//     ward: "",
//     address: "",
//   });
//   const forceUpdate = () => {
//     setForceUpdateCounter((prev) => prev + 1);
//   };
//   const addressCache = {
//     provinces: new Map(),
//     districts: new Map(),
//     wards: new Map(),
//   };
//   const getOrderStatusHistory = () => {
//     if (!orderHistory || orderHistory.length === 0) return [];

//     // Lọc ra các bản ghi thay đổi trạng thái
//     const statusChanges = orderHistory.filter(
//       (record) => record.trangThai >= 1 && record.trangThai <= 6
//     );

//     // Sắp xếp theo thời gian tăng dần
//     const sortedChanges = [...statusChanges].sort(
//       (a, b) => new Date(a.ngayTao) - new Date(b.ngayTao)
//     );

//     // Loại bỏ các bản ghi trùng lặp trạng thái liên tiếp nhau
//     const uniqueStatuses = [];
//     let lastStatus = null;

//     sortedChanges.forEach((record) => {
//       if (record.trangThai !== lastStatus) {
//         uniqueStatuses.push(record);
//         lastStatus = record.trangThai;
//       }
//     });

//     return uniqueStatuses;
//   };
//   // Thêm các hàm trợ giúp từ GiaoHang.js để xử lý địa chỉ
//   const addressHelpers = {
//     // Lưu thông tin địa chỉ vào cache
//     cacheAddressInfo: (type, id, name) => {
//       if (!addressCache[type] || !id || !name) return;

//       // Chuyển đổi id thành string để đảm bảo nhất quán
//       const idStr = id.toString();

//       // Lưu theo định dạng rõ ràng
//       addressCache[type].set(`id_${idStr}`, name); // Lưu ID -> tên
//       addressCache[type].set(`name_${name}`, idStr); // Lưu tên -> ID

//       console.log(`Cached ${type}: ID ${idStr} -> "${name}"`);
//     },

//     // Lấy tên từ id
//     getNameById: (type, id) => {
//       if (!id || !addressCache[type]) return id;

//       // Thử tìm với ID dạng string
//       const idStr = id.toString();
//       const result = addressCache[type].get(`id_${idStr}`);

//       if (!result) {
//         // Thử tìm với ID dạng số (cho trường hợp đã cache dưới dạng số)
//         const idNum = parseInt(id, 10);
//         const numResult = !isNaN(idNum)
//           ? addressCache[type].get(`id_${idNum}`)
//           : null;

//         if (numResult) return numResult;

//         // Tạo biểu thị người dùng thân thiện hơn khi không tìm thấy
//         switch (type) {
//           case "provinces":
//             return `Tỉnh/TP: ${id}`;
//           case "districts":
//             return `Quận/Huyện: ${id}`;
//           case "wards":
//             return `Xã/Phường: ${id}`;
//           default:
//             return id;
//         }
//       }

//       return result;
//     },

//     // Lấy id từ tên
//     getIdByName: (type, name) => {
//       if (!name || !addressCache[type]) return null;

//       const result = addressCache[type].get(`name_${name}`);

//       if (!result) {
//         console.log(`Không tìm thấy ID cho ${type} name: ${name}`);
//       }
//       return result ? parseInt(result, 10) : null; // Trả về ID dưới dạng số
//     },
//   };

//   const fetchInvoice = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/api/admin/hoa-don/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       toast.success("Tải thông tin hóa đơn thành công");
//       if (response.data) {
//         console.log(" Dữ liệu hóa đơn từ API:", response.data);
//         setInvoice(response.data);
//         setNewStatus(response.data.trangThai.toString());

//         setRecipientName(response.data.tenNguoiNhan || "");
//         setPhoneNumber(response.data.soDienThoai || "");
//         setSpecificAddress(response.data.moTa || "");
//         setNote(response.data.ghiChu || "");
//         setShippingFee(response.data.phiVanChuyen || 0);

//         if (provinces.length === 0) {
//           await fetchProvinces();
//         }

//         // Tìm tỉnh, huyện, xã dựa trên dữ liệu từ API
//         const foundProvince = provinces.find(
//           (p) => p.name === response.data.tinh
//         );
//         if (foundProvince) {
//           setProvince(foundProvince.code);
//           setSelectedProvince(foundProvince);

//           // Fetch quận/huyện
//           const districtsData = await fetchDistricts(foundProvince.code);
//           const foundDistrict = districtsData.find(
//             (d) => d.name === response.data.huyen
//           );
//           if (foundDistrict) {
//             setDistrict(foundDistrict.code);
//             setSelectedDistrict(foundDistrict);

//             // Fetch xã/phường
//             const wardsData = await fetchWards(foundDistrict.code);
//             const foundWard = wardsData.find(
//               (w) => w.name === response.data.xa
//             );
//             if (foundWard) {
//               setWard(foundWard.code);
//               setSelectedWard(foundWard);
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải hóa đơn:", error);
//       toast.error("Lỗi khi tải thông tin hóa đơn");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const showPriceChangeAlert = (products) => {
//     setChangedProducts(products);
//     setOpenPriceChangeDialog(true);
//   };
//   // Thêm hàm để kiểm tra thay đổi giá sản phẩm
//   // Cải thiện hàm kiểm tra thay đổi giá sản phẩm, thêm tham số để không hiển thị loading toàn trang
//   const checkPriceChanges = async (showLoading = true) => {
//     try {
//       const priceCheckToastId = toast.loading("Đang kiểm tra thay đổi giá...");

//       if (showLoading) {
//         setCheckingPrice(true);
//       }

//       const response = await api.get(`/api/admin/hoa-don/${id}/kiem-tra-gia`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.dismiss(priceCheckToastId);

//       // Lưu kết quả kiểm tra
//       const hasPriceChanges =
//         response.data &&
//         response.data.hasPriceChanges === true &&
//         response.data.changedItems &&
//         response.data.changedItems.length > 0;

//       // Lưu trạng thái có thay đổi giá để hiển thị cảnh báo
//       setPriceNeedsConfirmation(hasPriceChanges);

//       if (hasPriceChanges) {
//         // Định dạng lại dữ liệu cho phù hợp với frontend
//         const formattedItems = response.data.changedItems.map((item) => ({
//           id: item.id,
//           tenSanPham: item.tenSanPham || "Không có tên",
//           giaTaiThoiDiemThem: item.giaCu || 0,
//           giaHienTai: item.giaMoi || 0,
//           soLuong: item.soLuong || 1,
//           hinhAnh: item.anhUrl ? [item.anhUrl] : [],
//           maSanPhamChiTiet: item.maSanPhamChiTiet || "",
//           mauSac: item.mauSac || "---",
//           maMauSac: item.maMauSac || "#FFFFFF",
//           kichThuoc: item.kichThuoc || "---",
//           chatLieu: item.chatLieu || "---",
//           danhMuc: item.danhMuc || "---",
//           thuongHieu: item.thuongHieu || "---",
//           chenhLech: item.chenhLech || 0,
//         }));

//         setChangedProducts(formattedItems);
//         setOpenPriceChangeDialog(true);
//         toast.warning(`Có ${formattedItems.length} sản phẩm thay đổi giá`);
//       } else if (showLoading) {
//         // Chỉ hiển thị thông báo khi người dùng chủ động kiểm tra
//         toast.success("Giá sản phẩm không có thay đổi");
//       }

//       return hasPriceChanges;
//     } catch (error) {
//       console.error("Lỗi khi kiểm tra thay đổi giá:", error);
//       if (showLoading) {
//         toast.error("Không thể kiểm tra thay đổi giá sản phẩm");
//       }
//       return false;
//     } finally {
//       if (showLoading) {
//         setCheckingPrice(false);
//       }
//     }
//   };
//   // Thêm hàm xử lý cập nhật giá một sản phẩm
//   const handleUpdateProductPrice = async (hoaDonChiTietId, useCurrentPrice) => {
//     try {
//       const response = await api.put(
//         `/api/admin/hoa-don/${id}/chi-tiet/${hoaDonChiTietId}/gia`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { useCurrentPrice },
//         }
//       );

//       // Cập nhật UI
//       await fetchInvoiceProducts();
//       await fetchInvoice();
//       toast.success("Đã cập nhật giá sản phẩm");

//       // Cập nhật danh sách sản phẩm thay đổi giá
//       setChangedProducts((prevProducts) =>
//         prevProducts.filter((product) => product.id !== hoaDonChiTietId)
//       );

//       // Nếu không còn sản phẩm thay đổi giá, đóng modal
//       if (changedProducts.length <= 1) {
//         setOpenPriceChangeDialog(false);
//       }
//     } catch (error) {
//       console.error("Lỗi khi cập nhật giá sản phẩm:", error);
//       toast.error("Không thể cập nhật giá sản phẩm");
//     }
//   };

//   // Thêm hàm cập nhật tất cả giá sản phẩm
//   const handleUpdateAllPrices = async (useCurrentPrices = null) => {
//     // Nếu không truyền tham số, sử dụng giá trị từ state
//     const shouldUseCurrentPrices =
//       useCurrentPrices !== null ? useCurrentPrices : updateAllPrices;

//     try {
//       const updateToastId = toast.loading("Đang cập nhật giá sản phẩm...");

//       const response = await api.put(
//         `/api/admin/hoa-don/${id}/cap-nhat-gia`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { useCurrentPrices: shouldUseCurrentPrices },
//         }
//       );

//       // Cập nhật UI mà không gây loading toàn trang
//       await Promise.all([refreshInvoiceProducts(), refreshInvoice()]);

//       toast.dismiss(updateToastId);
//       toast.success(
//         shouldUseCurrentPrices
//           ? "Đã cập nhật tất cả sản phẩm sang giá mới"
//           : "Đã giữ nguyên giá ban đầu cho tất cả sản phẩm"
//       );

//       // Đánh dấu đã xác nhận thay đổi giá
//       setPriceNeedsConfirmation(false);
//       setOpenPriceChangeDialog(false);
//     } catch (error) {
//       console.error("Lỗi khi cập nhật giá sản phẩm:", error);
//       toast.error("Không thể cập nhật giá sản phẩm");
//     }
//   };
//   // Thêm hàm này vào trong component InvoiceDetail, trước return statement
//   const getDiscountAmount = () => {
//     // Nếu giá trị từ backend đã có sẵn, ưu tiên sử dụng giá trị này
//     if (invoice?.giamGia !== undefined && invoice?.giamGia !== null) {
//       return invoice.giamGia;
//     }

//     // Nếu không có voucher, không có giảm giá
//     if (!invoice?.phieuGiamGia) return 0;

//     // Tính toán dựa trên quy tắc giảm giá
//     const subtotal = totalBeforeDiscount || 0;

//     if (subtotal <= 0) return 0;

//     if (subtotal < invoice.phieuGiamGia.giaTriToiThieu) {
//       return 0; // Không đủ điều kiện áp dụng
//     }

//     let discountAmount = 0;

//     if (invoice.phieuGiamGia.loaiPhieuGiamGia === 1) {
//       // Giảm giá theo phần trăm
//       discountAmount = (subtotal * invoice.phieuGiamGia.giaTriGiam) / 100;

//       // Kiểm tra giới hạn giảm tối đa
//       if (
//         invoice.phieuGiamGia.soTienGiamToiDa &&
//         discountAmount > invoice.phieuGiamGia.soTienGiamToiDa
//       ) {
//         discountAmount = invoice.phieuGiamGia.soTienGiamToiDa;
//       }
//     } else {
//       // Giảm giá cố định
//       discountAmount = Math.min(invoice.phieuGiamGia.giaTriGiam, subtotal);
//     }

//     return discountAmount;
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await api.get("/api/admin/hoa-don/san-pham/all", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const productsData = response.data;

//       // Lấy hình ảnh từ API sản phẩm chi tiết
//       const productsWithImages = await Promise.all(
//         productsData.map(async (product) => {
//           try {
//             const imgResponse = await api.get(
//               `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             // Chuyển đổi hình ảnh thành mảng URLs
//             const hinhAnhArray = imgResponse.data.map((img) => img.anhUrl);

//             return {
//               ...product,
//               hinhAnh: hinhAnhArray,
//               // Đảm bảo các trường khác có giá trị mặc định nếu không có
//               chatLieu: product.chatLieu || "---",
//               mauSac: product.mauSac || "---",
//               maMauSac: product.maMauSac || "#FFFFFF",
//               kichThuoc: product.kichThuoc || "---",
//               danhMuc: product.danhMuc || "---",
//               thuongHieu: product.thuongHieu || "---",
//               kieuDang: product.kieuDang || "---",
//               kieuCoAo: product.kieuCoAo || "---",
//               kieuTayAo: product.kieuTayAo || "---",
//               hoaTiet: product.hoaTiet || "---",
//             };
//           } catch (error) {
//             console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
//             return {
//               ...product,
//               hinhAnh: [],
//               // Đảm bảo các trường khác có giá trị mặc định
//               chatLieu: product.chatLieu || "---",
//               mauSac: product.mauSac || "---",
//               maMauSac: product.maMauSac || "#FFFFFF",
//               kichThuoc: product.kichThuoc || "---",
//             };
//           }
//         })
//       );

//       setProducts(productsWithImages);
//     } catch (error) {
//       console.error("Lỗi khi tải danh sách sản phẩm:", error);
//       toast.error("Lỗi khi tải danh sách sản phẩm");
//     }
//   };

//   const updateInvoiceTotal = async (updatedProducts) => {
//     const newTotalBeforeDiscount =
//       calculateTotalBeforeDiscount(updatedProducts);
//     setTotalBeforeDiscount(newTotalBeforeDiscount);

//     const totalWithShipping =
//       newTotalBeforeDiscount + (invoice?.phiVanChuyen || 0);

//     // Tìm voucher tốt nhất dựa trên tổng tiền mới
//     const bestVoucher = findBestVoucher(vouchers, newTotalBeforeDiscount);

//     let finalTotal = totalWithShipping;
//     let appliedVoucher = invoice.phieuGiamGia;

//     if (!appliedVoucher && bestVoucher) {
//       appliedVoucher = bestVoucher;
//       toast.info(
//         `Đã tự động áp dụng mã giảm giá ${bestVoucher.maPhieuGiamGia}`
//       );
//       await api.post(
//         `/api/admin/hoa-don/${id}/voucher`,
//         {
//           voucherId: bestVoucher.id,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     }

//     if (appliedVoucher) {
//       const discount = calculateDiscountAmount(
//         appliedVoucher,
//         newTotalBeforeDiscount
//       );
//       finalTotal -= discount;
//     }

//     setInvoice((prevInvoice) => ({
//       ...prevInvoice,
//       tongTien: finalTotal,
//       phieuGiamGia: appliedVoucher,
//     }));

//     fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
//   };

//   const calculateTotalBeforeDiscount = (products) => {
//     if (!Array.isArray(products)) return 0;
//     return products.reduce((total, product) => {
//       return total + product.gia * product.soLuong;
//     }, 0);
//   };

//   const updateTotalBeforeDiscount = (products) => {
//     setTotalBeforeDiscount(calculateTotalBeforeDiscount(products));
//   };

//   const fetchInvoiceProducts = async () => {
//     try {
//       const response = await api.get(`/api/admin/hoa-don/${id}/san-pham`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // Lấy toàn bộ dữ liệu hình ảnh từ response
//       const products = response.data;

//       // Đảm bảo mảng hinhAnh luôn tồn tại cho mỗi sản phẩm
//       const productsWithImages = products.map((product) => ({
//         ...product,
//         hinhAnh: Array.isArray(product.hinhAnh) ? product.hinhAnh : [],
//       }));

//       setInvoiceProducts(productsWithImages);
//       updateTotalBeforeDiscount(productsWithImages);
//     } catch (error) {
//       console.error("Lỗi khi tải danh sách sản phẩm:", error);
//       toast.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
//     }
//   };

//   const fetchAvailableVouchers = async () => {
//     if (!invoice || invoice.tongTien === undefined) {
//       console.warn("Không thể tải voucher vì invoice chưa có dữ liệu");
//       return;
//     }

//     try {
//       const response = await api.get(
//         `/api/admin/phieu-giam-gia/available?orderTotal=${invoice.tongTien}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log("Danh sách voucher từ API:", response.data);
//       setVouchers(response.data);
//     } catch (error) {
//       toast.error("Không thể tải danh sách mã giảm giá");
//     }
//   };
//   useEffect(() => {
//     if (invoice && invoice.loaiHoaDon === 3) {
//       calculateShippingFeeFromGHN();
//     }
//   }, [invoice?.id]);

//   useEffect(() => {
//     // Chỉ thực hiện khi không mở modal chỉnh sửa
//     if (!openEditRecipientDialog && invoice && invoice.diaChi) {
//       const hasIdFormat = /^.*?,\s*\d+,\s*\d+,\s*\d+$/.test(invoice.diaChi);

//       if (hasIdFormat && !addressDataLoaded && provinces.length > 0) {
//         console.log("📦 Tự động tải thông tin địa chỉ khi hiển thị");
//         tryLoadAddressFromIds();
//         setAddressDataLoaded(true);
//       }
//     }
//   }, [
//     invoice?.diaChi,
//     provinces.length,
//     openEditRecipientDialog,
//     addressDataLoaded,
//   ]);
//   useEffect(() => {
//     if (id && invoice && invoice.trangThai === 1) {
//       // Chỉ kiểm tra thay đổi giá nếu đơn hàng đang ở trạng thái "Chờ xác nhận"
//       checkPriceChanges();
//     }
//   }, [id, invoice?.id]);
//   // Thêm useEffect để xử lý khi mở/đóng modal
//   useEffect(() => {
//     const initializeAddressData = async () => {
//       if (openEditRecipientDialog && invoice?.diaChi) {
//         // Phân tích địa chỉ theo mẫu ID đặc biệt
//         const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
//         const match = invoice.diaChi.match(addressPattern);

//         if (match) {
//           // Đảm bảo provinces đã được tải
//           if (provinces.length === 0) {
//             await fetchProvinces();
//           }

//           console.log("Khởi tạo và hiển thị thông tin địa chỉ từ ID");
//         }
//       }
//     };

//     initializeAddressData();
//   }, [openEditRecipientDialog]);
//   useEffect(() => {
//     if (openVoucherDialog) {
//       fetchAvailableVouchers().then(() => {
//         // Always suggest the best voucher
//         const total = totalBeforeDiscount + (invoice?.phiVanChuyen || 0);
//         const best = findBestVoucher(vouchers, total);
//         setBestVoucher(best);
//         setSelectedVoucher(best);

//         if (best) {
//           toast.info(`Đã tự động chọn mã giảm giá tốt nhất`);
//         }
//       });
//     }
//   }, [openVoucherDialog]);

//   const handleApplyVoucher = async () => {
//     if (!selectedVoucher) {
//       toast.error("Vui lòng chọn một mã giảm giá");
//       return;
//     }

//     if (totalBeforeDiscount <= 0) {
//       toast.error(
//         "Không thể áp dụng mã giảm giá cho đơn hàng không có sản phẩm"
//       );
//       return;
//     }

//     try {
//       const response = await api.post(
//         `/api/admin/hoa-don/${id}/voucher`,
//         {
//           voucherId: selectedVoucher.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       // Use only product total for discount calculation
//       const productTotal = totalBeforeDiscount;
//       const discountAmount = calculateDiscountAmount(
//         selectedVoucher,
//         productTotal
//       );

//       // Apply the discount to total including shipping
//       const totalWithShipping = productTotal + (invoice?.phiVanChuyen || 0);
//       const newTotal = totalWithShipping - discountAmount;

//       if (newTotal < 0) {
//         toast.error("Tổng tiền sau giảm giá không hợp lệ!");
//         return;
//       }

//       setInvoice((prevInvoice) => ({
//         ...prevInvoice,
//         tongTien: newTotal,
//         phieuGiamGia: selectedVoucher,
//       }));

//       setOpenVoucherDialog(false);
//       setSelectedVoucher(null);
//       toast.success(`Đã áp dụng mã giảm giá ${selectedVoucher.maPhieuGiamGia}`);
//       fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
//     } catch (error) {
//       showErrorDialog(
//         error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá"
//       );
//     }
//   };

//   const handleRemoveVoucher = async () => {
//     if (!invoice.phieuGiamGia) {
//       toast.error("Không có mã giảm giá để xóa");
//       return;
//     }

//     try {
//       await api.delete(`/api/admin/hoa-don/${id}/voucher`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const totalWithShipping =
//         (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0);

//       if (totalWithShipping <= 0) {
//         toast.error("Tổng tiền sau khi xóa voucher không hợp lệ!");
//         return;
//       }

//       setInvoice((prevInvoice) => ({
//         ...prevInvoice,
//         tongTien: totalWithShipping,
//         phieuGiamGia: null,
//       }));

//       toast.success("Đã xóa mã giảm giá");
//       fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
//     } catch (error) {
//       showErrorDialog("Lỗi khi xóa mã giảm giá");
//     }
//   };

//   const handleEditVoucher = async () => {
//     try {
//       const response = await api.put(
//         `/api/admin/hoa-don/${id}/voucher/${invoice.phieuGiamGia.id}`,
//         {
//           voucherId: selectedVoucher.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       // Tính toán số tiền giảm
//       const originalTotal =
//         response.data.tongTienTruocGiam || response.data.tongTien;
//       const discountedTotal = response.data.tongTien;
//       const discountAmount = originalTotal - discountedTotal;

//       toast.success(
//         `Cập nhật mã giảm giá ${selectedVoucher.maPhieuGiamGia} - ` +
//           `${
//             selectedVoucher.loaiPhieuGiamGia === 1
//               ? `${selectedVoucher.giaTriGiam}%`
//               : formatCurrency(selectedVoucher.giaTriGiam)
//           } ` +
//           `(Giảm ${formatCurrency(discountAmount)})`,
//         {
//           autoClose: 5000,
//         }
//       );

//       setEditVoucherDialog(false);
//       setInvoice((prevInvoice) => ({
//         ...prevInvoice,
//         tongTien: response.data.tongTien,
//         phieuGiamGia: selectedVoucher,
//       }));
//     } catch (error) {
//       console.error("Error updating voucher:", error);
//       const errorMessage =
//         error.response?.data?.message || "Lỗi khi cập nhật phiếu giảm giá";
//       toast.error(errorMessage);
//     }
//   };

//   const createFullAddress = () => {
//     const parts = [];

//     // Địa chỉ cụ thể luôn đặt ở đầu tiên nếu có
//     if (specificAddress?.trim()) {
//       parts.push(specificAddress.trim());
//     }

//     // Thêm phường/xã nếu có
//     if (selectedWard?.WardName) {
//       parts.push(selectedWard.WardName);
//     }

//     // Thêm quận/huyện nếu có
//     if (selectedDistrict?.DistrictName) {
//       parts.push(selectedDistrict.DistrictName);
//     }

//     // Thêm tỉnh/thành phố nếu có
//     if (selectedProvince?.ProvinceName) {
//       parts.push(selectedProvince.ProvinceName);
//     }

//     // Trả về địa chỉ đầy đủ được phân tách bằng dấu phẩy
//     return parts.join(", ");
//   };

//   // Cập nhật hàm handleSaveRecipientInfo

//   const handleSaveRecipientInfo = async () => {
//     try {
//       // Validate dữ liệu đầu vào
//       if (!recipientName.trim()) {
//         showErrorDialog("Vui lòng nhập tên người nhận");
//         return;
//       }

//       if (invoice?.loaiHoaDon === 3) {
//         if (!province) {
//           showErrorDialog("Vui lòng chọn tỉnh/thành phố");
//           return;
//         }

//         if (!district) {
//           showErrorDialog("Vui lòng chọn quận/huyện");
//           return;
//         }

//         if (!ward) {
//           showErrorDialog("Vui lòng chọn phường/xã");
//           return;
//         }
//       }

//       setTrackingAddressLoading(true);

//       // Tạo địa chỉ đầy đủ
//       let fullAddress = "";

//       if (invoice?.loaiHoaDon === 3) {
//         // Nếu là đơn giao hàng, sử dụng format mới: địa chỉ chi tiết, wardId, districtId, provinceId
//         if (detailAddress) {
//           fullAddress = `${detailAddress}, ${ward}, ${district}, ${province}`;
//         } else {
//           fullAddress = `${ward}, ${district}, ${province}`;
//         }
//       } else {
//         // Nếu không phải đơn giao hàng, chỉ lấy địa chỉ chi tiết
//         fullAddress = detailAddress;
//       }

//       // Tạo payload cập nhật
//       const updateData = {
//         tenNguoiNhan: recipientName,
//         sdtNguoiNhan: phoneNumber || "",
//         emailNguoiNhan: email || "",
//         diaChi: fullAddress,
//         ghiChu: note || "",
//       };

//       // Gọi API cập nhật
//       const response = await api.put(
//         `/api/admin/hoa-don/${invoice.id}`,
//         updateData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.status === 200) {
//         // Cập nhật lại dữ liệu hóa đơn sau khi lưu thành công
//         await fetchInvoice();
//         message.success("Cập nhật thông tin người nhận thành công");
//         setOpenEditRecipientDialog(false);
//       } else {
//         throw new Error("Lỗi khi cập nhật thông tin người nhận");
//       }

//       setTrackingAddressLoading(false);
//     } catch (error) {
//       console.error("Lỗi khi lưu thông tin người nhận:", error);
//       setTrackingAddressLoading(false);
//       showErrorDialog("Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại sau.");
//     }
//   };

//   const fetchProvinces = async () => {
//     try {
//       const response = await api.get("/api/admin/hoa-don/dia-chi/tinh", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data && Array.isArray(response.data)) {
//         // Transform data for Select component
//         const formattedProvinces = response.data.map((province) => ({
//           value: province.id.toString(),
//           label: province.name,
//         }));

//         setProvinces(formattedProvinces);
//         console.log(`✅ Đã tải ${formattedProvinces.length} tỉnh/thành phố`);

//         // Cache provinces data
//         window.addressCache = window.addressCache || {};
//         window.addressCache.provinces = window.addressCache.provinces || {};

//         response.data.forEach((province) => {
//           if (province.id && province.name) {
//             window.addressCache.provinces[province.id.toString()] =
//               province.name;
//           }
//         });
//       }
//     } catch (error) {
//       console.error("❌ Lỗi khi tải danh sách tỉnh/thành phố:", error);
//       showErrorDialog(
//         "Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau."
//       );
//     }
//   };

//   const fetchDistrictsSafe = async (provinceId) => {
//     try {
//       // Chuẩn hóa và kiểm tra provinceId
//       const normalizedProvinceId = normalizeId(provinceId, null);

//       // Kiểm tra nghiêm ngặt hơn
//       if (normalizedProvinceId === null || normalizedProvinceId === undefined) {
//         console.error(
//           " provinceId không được cung cấp cho API districts:",
//           provinceId
//         );
//         setDistricts([]);
//         return [];
//       }

//       console.log(
//         `📣 Gọi API districts với provinceId: ${normalizedProvinceId}`
//       );

//       const response = await api.get("/api/admin/hoa-don/dia-chi/huyen", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { provinceId: normalizedProvinceId },
//       });

//       if (!response.data) {
//         console.warn("⚠️ API trả về dữ liệu rỗng");
//         setDistricts([]);
//         return [];
//       }

//       // Format districts data cho Select component
//       const formattedDistricts = response.data.map((district) => ({
//         value: district.DistrictID?.toString() || district.id?.toString(),
//         label: district.DistrictName || district.name,
//       }));

//       // Set districts và cache dữ liệu
//       setDistricts(formattedDistricts);

//       // Cache district data
//       response.data.forEach((district) => {
//         const districtId = normalizeId(district.DistrictID || district.id);
//         const districtName = district.DistrictName || district.name;
//         if (districtId && districtName) {
//           addressHelpers.cacheAddressInfo(
//             "districts",
//             districtId,
//             districtName
//           );
//         }
//       });

//       console.log(`✅ Đã tải ${response.data.length} quận/huyện`);
//       return response.data;
//     } catch (error) {
//       console.error(` Lỗi khi gọi API districts:`, error);
//       setDistricts([]);
//       return [];
//     }
//   };
//   const fetchDistricts = async (provinceId) => {
//     if (!provinceId) {
//       console.error("provinceId không được cung cấp cho API districts");
//       return;
//     }

//     console.log("📣 Gọi API districts với provinceId:", provinceId);

//     try {
//       const response = await api.get(
//         `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data && Array.isArray(response.data)) {
//         // Kiểm tra cấu trúc dữ liệu thực tế
//         console.log("🔍 Dữ liệu quận/huyện trả về:", response.data[0]);

//         // Transform data for Select component - chắc chắn rằng value và label đúng
//         const formattedDistricts = response.data.map((district) => {
//           // Đảm bảo value luôn là string
//           const districtId = district.id?.toString() || "";
//           const districtName = district.name || "";

//           console.log(
//             `🏙️ Quận/huyện đã format: ${districtId} -> ${districtName}`
//           );

//           return {
//             value: districtId,
//             label: districtName,
//           };
//         });

//         setDistricts(formattedDistricts);
//         console.log(`✅ Đã tải ${formattedDistricts.length} quận/huyện`);

//         // Cache districts data cho việc hiển thị
//         window.addressCache = window.addressCache || {};
//         window.addressCache.districts = window.addressCache.districts || {};

//         response.data.forEach((district) => {
//           if (district.id && district.name) {
//             const districtIdStr = district.id.toString();
//             window.addressCache.districts[districtIdStr] = district.name;
//             console.log(
//               `💾 Cached district: ID ${districtIdStr} -> "${district.name}"`
//             );
//           }
//         });
//       }
//     } catch (error) {
//       console.error("❌ Lỗi khi tải danh sách quận/huyện:", error);
//       message.error(
//         "Không thể tải danh sách quận/huyện. Vui lòng thử lại sau."
//       );
//     }
//   };

//   // Cập nhật hàm fetchWards để tránh gọi API khi districtId không hợp lệ
//   const fetchWards = async (districtId) => {
//     if (!districtId) {
//       console.error("districtId không được cung cấp cho API wards");
//       return;
//     }

//     console.log("📍 Tải xã/phường cho districtId:", districtId);

//     try {
//       const response = await api.get(
//         `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data && Array.isArray(response.data)) {
//         // Transform data for Select component
//         const formattedWards = response.data.map((ward) => ({
//           value: ward.id.toString(),
//           label: ward.name,
//         }));

//         setWards(formattedWards);
//         console.log(`✅ Đã tải ${formattedWards.length} phường/xã`);

//         // Cache wards data
//         window.addressCache = window.addressCache || {};
//         window.addressCache.wards = window.addressCache.wards || {};

//         response.data.forEach((ward) => {
//           if (ward.id && ward.name) {
//             window.addressCache.wards[ward.id.toString()] = ward.name;
//           }
//         });
//       }
//     } catch (error) {
//       console.error("❌ Lỗi khi tải danh sách phường/xã:", error);
//       showErrorDialog(
//         "Không thể tải danh sách phường/xã. Vui lòng thử lại sau."
//       );
//     }
//   };
//   // Hàm chuẩn hóa chuỗi
//   const normalizeString = (str) => {
//     if (!str) return "";
//     return str
//       .toLowerCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/đ/g, "d")
//       .replace(/Đ/g, "D")
//       .trim();
//   };

//   // Hàm tìm kiếm phần tử gần đúng trong danh sách
//   const findClosestMatch = (name, list) => {
//     if (!name || !list || !list.length) return null;

//     name = name.trim();

//     // Chuẩn hóa tên để so sánh
//     const normalizedName = name.toLowerCase();
//     const normalizedNoAccent = normalizeString(name);

//     // 1. Tìm kiếm chính xác trước
//     const exactMatch = list.find(
//       (item) =>
//         item.ProvinceName?.toLowerCase().trim() === normalizedName ||
//         item.DistrictName?.toLowerCase().trim() === normalizedName ||
//         item.WardName?.toLowerCase().trim() === normalizedName
//     );

//     if (exactMatch) {
//       console.log(`Tìm thấy kết quả khớp chính xác cho "${name}"`);
//       return exactMatch;
//     }

//     // 2. Tìm kiếm không phân biệt dấu
//     const noAccentMatch = list.find(
//       (item) =>
//         normalizeString(
//           item.ProvinceName || item.DistrictName || item.WardName
//         ) === normalizedNoAccent
//     );

//     if (noAccentMatch) {
//       console.log(`Tìm thấy kết quả khớp không dấu cho "${name}"`);
//       return noAccentMatch;
//     }

//     // 3. Tìm kiếm chứa từ khóa
//     const containsMatch = list.find((item) => {
//       const itemName = item.ProvinceName || item.DistrictName || item.WardName;
//       return (
//         normalizeString(itemName).includes(normalizedNoAccent) ||
//         normalizedNoAccent.includes(normalizeString(itemName))
//       );
//     });

//     if (containsMatch) {
//       console.log(`Tìm thấy kết quả chứa từ khóa cho "${name}"`);
//       return containsMatch;
//     }

//     console.log(`Không tìm thấy kết quả gần đúng nào cho "${name}"`);
//     return null;
//   };
//   const handleOpenEditRecipientDialog = async () => {
//     console.log("🔍 handleOpenEditRecipientDialog được gọi");

//     try {
//       // 1. Mở modal và hiển thị loading
//       setOpenEditRecipientDialog(true);
//       setTrackingAddressLoading(true);

//       // 2. Phân tích thông tin từ địa chỉ hiện tại
//       const addressInfo = extractAddressInfo(invoice?.diaChi);
//       console.log("📋 Thông tin địa chỉ đã phân tích:", addressInfo);

//       // 3. Cập nhật giá trị state ban đầu
//       setRecipientName(invoice?.tenNguoiNhan || "");
//       setPhoneNumber(invoice?.sdtNguoiNhan || "");
//       setEmail(invoice?.emailNguoiNhan || "");
//       setDetailAddress(addressInfo.detailAddress);

//       // 4. Reset các select địa chỉ trước khi tải lại
//       setProvince("");
//       setDistrict("");
//       setWard("");
//       setDistricts([]);
//       setWards([]);

//       // 5. Tải dữ liệu tỉnh/thành phố và thiết lập giá trị
//       await fetchProvinces();

//       if (addressInfo.provinceId) {
//         console.log("🔄 Thiết lập tỉnh/thành phố:", addressInfo.provinceId);
//         setProvince(addressInfo.provinceId);

//         // 6. Nếu có province, tải districts
//         const districtsData = await fetchDistrictsSafe(addressInfo.provinceId);

//         if (addressInfo.districtId) {
//           console.log("🔄 Thiết lập quận/huyện:", addressInfo.districtId);
//           setDistrict(addressInfo.districtId);

//           // 7. Nếu có district, tải wards
//           await fetchWards(addressInfo.districtId);

//           if (addressInfo.wardId) {
//             console.log("🔄 Thiết lập phường/xã:", addressInfo.wardId);
//             setWard(addressInfo.wardId);
//           }
//         }
//       }

//       // 8. Tắt loading khi hoàn thành
//       setTrackingAddressLoading(false);
//     } catch (error) {
//       console.error("❌ Lỗi khi mở dialog chỉnh sửa:", error);
//       setTrackingAddressLoading(false);
//       showErrorDialog("Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.");
//     }
//   };

//   // Cải thiện hàm loadAddressInfoFromIds
//   const loadAddressInfoFromIds = async (tinhId, huyenId, xaId) => {
//     console.log("🔍 Đang tải thông tin địa chỉ từ IDs:", {
//       tinhId,
//       huyenId,
//       xaId,
//     });

//     // Normalize/validate the IDs
//     const normalizedTinhId = normalizeId(tinhId);
//     const normalizedHuyenId = normalizeId(huyenId);
//     const normalizedXaId = String(xaId || "").trim(); // xaId might be alphanumeric

//     // Kiểm tra nghiêm ngặt hơn cho các ID số
//     if (
//       !normalizedTinhId ||
//       !normalizedHuyenId ||
//       !normalizedXaId ||
//       (typeof normalizedTinhId === "number" && normalizedTinhId <= 0) ||
//       (typeof normalizedHuyenId === "number" && normalizedHuyenId <= 0)
//     ) {
//       console.error(" IDs không hợp lệ hoặc bằng 0:", {
//         normalizedTinhId,
//         normalizedHuyenId,
//         normalizedXaId,
//       });
//       return false;
//     }

//     try {
//       // 1. Kiểm tra và tải danh sách tỉnh nếu cần
//       if (provinces.length === 0) {
//         await fetchProvinces();
//       }

//       // 2. Tìm tỉnh bằng ID
//       let foundProvince = provinces.find((p) => {
//         const pId = normalizeId(p.ProvinceID || p.id);
//         return pId === normalizedTinhId;
//       });

//       if (!foundProvince) {
//         console.error(` Không tìm thấy tỉnh với ID: ${normalizedTinhId}`);
//         return false;
//       }

//       // 3. Thiết lập tỉnh đã chọn
//       setProvince(normalizedTinhId);
//       setSelectedProvince(foundProvince);

//       // 4. Tải quận/huyện (bỏ qua phần URL query trực tiếp)
//       console.log(`🔄 Đang tải quận/huyện cho tỉnh ID: ${normalizedTinhId}`);
//       const districtsData = await fetchDistrictsSafe(normalizedTinhId);

//       // 5. Tìm huyện theo ID trong danh sách đã tải
//       const foundDistrict = districtsData.find((d) => {
//         const dId = normalizeId(d.DistrictID || d.id);
//         return dId === normalizedHuyenId;
//       });

//       if (!foundDistrict) {
//         console.error(` Không tìm thấy huyện với ID: ${normalizedHuyenId}`);
//         return false;
//       }

//       // 6. Thiết lập huyện đã chọn
//       setDistrict(normalizedHuyenId);
//       setSelectedDistrict(foundDistrict);

//       // 7. Tải xã/phường (bỏ qua phần URL query trực tiếp)
//       console.log(`🔄 Đang tải xã/phường cho huyện ID: ${normalizedHuyenId}`);
//       const wardsData = await fetchWards(normalizedHuyenId);

//       // 8. Tìm xã theo ID/mã trong danh sách đã tải
//       const foundWard = wardsData.find((w) => {
//         const wardId = String(w.WardCode || w.id).trim();
//         return wardId === normalizedXaId;
//       });

//       if (!foundWard) {
//         console.error(` Không tìm thấy xã với ID: ${normalizedXaId}`);
//         return false;
//       }

//       // 9. Thiết lập xã đã chọn
//       setWard(normalizedXaId);
//       setSelectedWard(foundWard);

//       console.log("✅ Đã tải thành công thông tin địa chỉ");
//       return true;
//     } catch (error) {
//       console.error(" Lỗi khi tải thông tin địa chỉ:", error);
//       return false;
//     }
//   };
//   const extractAddressInfo = (fullAddress) => {
//     if (!fullAddress) {
//       return {
//         detailAddress: "",
//         wardId: "",
//         districtId: "",
//         provinceId: "",
//       };
//     }

//     console.log("🔍 Phân tích địa chỉ:", fullAddress);

//     try {
//       const parts = fullAddress.split(/,\s*/);

//       if (parts.length < 4) {
//         console.log("⚠️ Địa chỉ không đủ phần để phân tích");
//         return {
//           detailAddress: fullAddress,
//           wardId: "",
//           districtId: "",
//           provinceId: "",
//         };
//       }

//       // Lấy 3 phần cuối (có thể là ID hoặc tên đầy đủ)
//       const lastThreeParts = [
//         parts[parts.length - 3].trim(), // phường/xã
//         parts[parts.length - 2].trim(), // quận/huyện
//         parts[parts.length - 1].trim(), // tỉnh/thành phố
//       ];

//       // Địa chỉ chi tiết
//       const detailAddress = parts.slice(0, parts.length - 3).join(", ");

//       // Kiểm tra xem phần cuối có phải là ID không
//       const allAreIds = lastThreeParts.every((part) => isAddressId(part));

//       let wardId = "",
//         districtId = "",
//         provinceId = "";

//       if (allAreIds) {
//         // Nếu tất cả là ID, sử dụng trực tiếp
//         wardId = lastThreeParts[0];
//         districtId = lastThreeParts[1];
//         provinceId = lastThreeParts[2];
//         console.log("✅ Phát hiện địa chỉ có dạng ID");
//       } else {
//         // Nếu là tên địa lý, cần tìm ID tương ứng
//         console.log("ℹ️ Phát hiện địa chỉ có tên đầy đủ, cần tìm ID");

//         const provinceName = lastThreeParts[2];
//         const districtName = lastThreeParts[1];
//         const wardName = lastThreeParts[0];

//         // Nếu có phần placeholder "Tỉnh/TP:", "Quận/Huyện:", "Xã/Phường:", cần loại bỏ
//         const cleanProvinceName = provinceName.replace(/^(Tỉnh\/TP:)\s*/, "");
//         const cleanDistrictName = districtName.replace(
//           /^(Quận\/Huyện:)\s*/,
//           ""
//         );
//         const cleanWardName = wardName.replace(/^(Xã\/Phường:)\s*/, "");

//         // Kiểm tra xem phần đã làm sạch có phải ID không
//         if (isAddressId(cleanProvinceName)) provinceId = cleanProvinceName;
//         if (isAddressId(cleanDistrictName)) districtId = cleanDistrictName;
//         if (isAddressId(cleanWardName)) wardId = cleanWardName;

//         // Tìm ID từ window.addressCache (lưu ngược tên -> ID)
//         if (!provinceId && window.addressCache?.provinces) {
//           for (const [id, name] of Object.entries(
//             window.addressCache.provinces
//           )) {
//             if (name === cleanProvinceName) {
//               provinceId = id;
//               break;
//             }
//           }
//         }

//         if (!districtId && window.addressCache?.districts) {
//           for (const [id, name] of Object.entries(
//             window.addressCache.districts
//           )) {
//             if (name === cleanDistrictName) {
//               districtId = id;
//               break;
//             }
//           }
//         }

//         if (!wardId && window.addressCache?.wards) {
//           for (const [id, name] of Object.entries(window.addressCache.wards)) {
//             if (name === cleanWardName) {
//               wardId = id;
//               break;
//             }
//           }
//         }
//       }

//       return {
//         detailAddress,
//         wardId,
//         districtId,
//         provinceId,
//       };
//     } catch (error) {
//       console.error("❌ Lỗi khi phân tích địa chỉ:", error);
//       return {
//         detailAddress: fullAddress,
//         wardId: "",
//         districtId: "",
//         provinceId: "",
//       };
//     }
//   };

//   const prepareAddressDataForEdit = async () => {
//     try {
//       // Phân tích địa chỉ để lấy thông tin
//       const addressInfo = extractAddressInfo(invoice?.diaChi);

//       // Thiết lập các giá trị cho form
//       setEditRecipientValues((prevValues) => ({
//         ...prevValues,
//         province: addressInfo.provinceId || "",
//         district: addressInfo.districtId || "",
//         ward: addressInfo.wardId || "",
//         address: addressInfo.detailAddress || "",
//       }));

//       // Tải dữ liệu tỉnh/thành phố, quận/huyện, phường/xã
//       await fetchProvinces();

//       if (addressInfo.provinceId) {
//         await fetchDistrictsSafe(addressInfo.provinceId);

//         if (addressInfo.districtId) {
//           await fetchWards(addressInfo.districtId);
//         }
//       }
//     } catch (error) {
//       console.error("Lỗi khi chuẩn bị dữ liệu địa chỉ:", error);
//     }
//   };
//   const handleCloseEditRecipientDialog = () => {
//     setOpenEditRecipientDialog(false);
//   };
//   const normalizeId = (id, fallback = null) => {
//     // Check for undefined/null values
//     if (id === undefined || id === null) {
//       console.log(`normalizeId: ID không hợp lệ (${id}), trả về ${fallback}`);
//       return fallback;
//     }

//     // If already a positive number, return as is
//     if (typeof id === "number" && !isNaN(id) && id > 0) {
//       return id;
//     }

//     // Try to convert string to number
//     if (typeof id === "string") {
//       if (!id.trim()) {
//         return fallback;
//       }

//       const numId = parseInt(id.trim(), 10);
//       if (!isNaN(numId) && numId > 0) {
//         return numId;
//       }

//       // Return trimmed string if can't convert to number
//       return id.trim();
//     }

//     return fallback;
//   };
//   // Cập nhật hàm handleProvinceChange để xử lý khi thay đổi tỉnh/thành phố
//   const handleProvinceChange = async (value) => {
//     try {
//       console.log(`🔵 handleProvinceChange được gọi với value: ${value}`);

//       // Cập nhật giá trị province và reset district, ward
//       setProvince(value);
//       setDistrict("");
//       setWard("");

//       // Xóa danh sách quận/huyện và phường/xã hiện tại
//       setDistricts([]);
//       setWards([]);

//       // Tải danh sách quận/huyện mới
//       if (value) {
//         await fetchDistricts(value);
//       }
//     } catch (error) {
//       console.error("Lỗi khi thay đổi tỉnh/thành phố:", error);
//       showErrorDialog("Đã có lỗi xảy ra khi tải danh sách quận/huyện");
//     }
//   };

//   // Cập nhật hàm handleDistrictChange để xử lý khi thay đổi quận/huyện
//   const handleDistrictChange = async (value) => {
//     try {
//       console.log(`🔵 handleDistrictChange được gọi với value: ${value}`);

//       // Cập nhật giá trị district và reset ward
//       setDistrict(value);
//       setWard("");

//       // Xóa danh sách phường/xã hiện tại
//       setWards([]);

//       // Tải danh sách phường/xã mới
//       if (value) {
//         await fetchWards(value);
//       }
//     } catch (error) {
//       console.error("Lỗi khi thay đổi quận/huyện:", error);
//       showErrorDialog("Đã có lỗi xảy ra khi tải danh sách phường/xã");
//     }
//   };

//   // Cập nhật hàm handleWardChange
//   const handleWardChange = (value) => {
//     console.log(`🔵 handleWardChange được gọi với value: ${value}`);

//     // Cập nhật giá trị ward
//     setWard(value);

//     const selectedWard = wards.find((ward) => ward.value === value);
//     if (selectedWard) {
//       console.log(
//         `✅ Đã chọn xã/phường: ${selectedWard.label} (${selectedWard.value})`
//       );
//     }
//   };
//   // Thêm useEffect để đảm bảo tải dữ liệu khi component mount
//   useEffect(() => {
//     const initializeData = async () => {
//       try {
//         // 1. Tải tỉnh/thành phố
//         if (!provinces || provinces.length === 0) {
//           const provincesData = await fetchProvinces();

//           // 2. Tự động xử lý địa chỉ nếu có
//           if (invoice?.diaChi) {
//             const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
//             const match = invoice.diaChi.match(addressPattern);

//             if (match) {
//               const [_, diaChiCuThe, xaId, huyenId, tinhId] = match;
//               console.log("🔍 Phát hiện địa chỉ dạng ID khi component mount:", {
//                 tinhId,
//                 huyenId,
//                 xaId,
//               });

//               // Đảm bảo các ID được chuẩn hóa
//               const normalizedTinhId = normalizeId(tinhId);
//               const normalizedHuyenId = normalizeId(huyenId);
//               const normalizedXaId = String(xaId || "").trim();

//               // Tìm tỉnh
//               const provinceObj = provincesData.find((p) => {
//                 return normalizeId(p.ProvinceID || p.id) === normalizedTinhId;
//               });

//               if (provinceObj) {
//                 const provinceIdValue =
//                   provinceObj.ProvinceID || provinceObj.id;
//                 setProvince(provinceIdValue);
//                 setSelectedProvince(provinceObj);

//                 // Tải quận/huyện với provinceId đã xác định
//                 const districtsData = await fetchDistrictsSafe(provinceIdValue);

//                 // Tìm huyện
//                 const districtObj = districtsData.find((d) => {
//                   return (
//                     normalizeId(d.DistrictID || d.id) === normalizedHuyenId
//                   );
//                 });

//                 if (districtObj) {
//                   const districtIdValue =
//                     districtObj.DistrictID || districtObj.id;
//                   setDistrict(districtIdValue);
//                   setSelectedDistrict(districtObj);

//                   // Tải xã/phường với districtId đã xác định
//                   const wardsData = await fetchWards(districtIdValue);

//                   // Tìm xã
//                   const wardObj = wardsData.find((w) => {
//                     const wId = String(w.WardCode || w.id).trim();
//                     return wId === normalizedXaId;
//                   });

//                   if (wardObj) {
//                     const wardIdValue = wardObj.WardCode || wardObj.id;
//                     setWard(wardIdValue);
//                     setSelectedWard(wardObj);
//                     setSpecificAddress(diaChiCuThe || "");
//                   }
//                 }
//               }
//             }
//           }
//         }
//       } catch (error) {
//         console.error(" Lỗi khởi tạo dữ liệu:", error);
//       }
//     };

//     if (invoice?.diaChi) {
//       initializeData();
//     }
//   }, [invoice?.diaChi]);
//   // Thêm useEffect này vào danh sách các effects
//   useEffect(() => {
//     const loadInitialAddressData = async () => {
//       if (!provinces || provinces.length === 0) {
//         console.log("🔄 Tải dữ liệu tỉnh/thành phố ban đầu...");

//         try {
//           const response = await api.get("/api/admin/hoa-don/dia-chi/tinh", {
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           const provincesData = response.data;
//           setProvinces(provincesData);

//           // Cache tất cả dữ liệu tỉnh/thành phố
//           provincesData.forEach((p) => {
//             addressHelpers.cacheAddressInfo(
//               "provinces",
//               p.ProvinceID,
//               p.ProvinceName
//             );
//           });

//           console.log("✅ Tải thành công dữ liệu tỉnh/thành phố ban đầu");
//         } catch (error) {
//           console.error(" Lỗi khi tải dữ liệu tỉnh/thành phố ban đầu:", error);
//         }
//       }
//     };

//     loadInitialAddressData();
//   }, []);

//   // Cải thiện useEffect hiện có để tự động tải địa chỉ khi component mount
//   useEffect(() => {
//     if (invoice && invoice.diaChi) {
//       // Kiểm tra xem địa chỉ có phải định dạng ID không
//       const hasIdFormat = /^.*?,\s*\d+,\s*\d+,\s*\d+$/.test(invoice.diaChi);

//       if (hasIdFormat && !addressDataLoaded) {
//         console.log("📦 Tự động tải thông tin địa chỉ khi component mount...");
//         tryLoadAddressFromIds();
//         setAddressDataLoaded(true);
//       }
//     }
//   }, [invoice?.diaChi, provinces.length]);
//   useEffect(() => {
//     fetchProvinces();
//   }, []);
//   // Cải thiện useEffect để tải dữ liệu địa chỉ ngay khi có invoice

//   // Thêm useEffect để tự động xử lý địa chỉ khi invoice thay đổi
//   useEffect(() => {
//     if (invoice && invoice.diaChi) {
//       const addressPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
//       const match = invoice.diaChi.match(addressPattern);

//       if (match && provinces.length > 0) {
//         console.log(
//           "🔄 Tự động xử lý địa chỉ ID khi invoice hoặc provinces thay đổi"
//         );
//         tryLoadAddressFromIds();
//       }
//     }
//   }, [invoice?.diaChi, provinces.length]);

//   // Hook lấy tên từ ID
//   const getAddressNameById = (type, id) => {
//     if (!id) return null;

//     // Thử lấy từ cache trước
//     const nameFromCache = addressHelpers.getNameById(type, id);
//     if (nameFromCache && nameFromCache !== id.toString()) {
//       return nameFromCache;
//     }

//     // Nếu không có trong cache, thử tìm trong danh sách đã tải
//     switch (type) {
//       case "provinces":
//         const province = provinces.find(
//           (p) => parseInt(p.ProvinceID || p.id, 10) === parseInt(id, 10)
//         );
//         if (province) {
//           const name = province.ProvinceName || province.name;
//           addressHelpers.cacheAddressInfo(type, id, name);
//           return name;
//         }
//         break;

//       case "districts":
//         const district = districts.find(
//           (d) => parseInt(d.DistrictID || d.id, 10) === parseInt(id, 10)
//         );
//         if (district) {
//           const name = district.DistrictName || district.name;
//           addressHelpers.cacheAddressInfo(type, id, name);
//           return name;
//         }
//         break;

//       case "wards":
//         const ward = wards.find(
//           (w) => String(w.WardCode || w.id) === String(id)
//         );
//         if (ward) {
//           const name = ward.WardName || ward.name;
//           addressHelpers.cacheAddressInfo(type, id, name);
//           return name;
//         }
//         break;
//     }

//     // Nếu không tìm thấy, trả về ID với prefix cho biết loại địa chỉ
//     return type === "provinces"
//       ? `Tỉnh/TP: ${id}`
//       : type === "districts"
//       ? `Quận/Huyện: ${id}`
//       : type === "wards"
//       ? `Phường/Xã: ${id}`
//       : `${id}`;
//   };
//   // Cập nhật useEffect liên quan đến province
//   useEffect(() => {
//     if (province) {
//       // Đảm bảo province là giá trị hợp lệ
//       const provinceIdNum = normalizeId(province);
//       if (provinceIdNum) {
//         console.log(`✓ UseEffect: Tải districts cho province ${provinceIdNum}`);
//         fetchDistrictsSafe(provinceIdNum);
//       } else {
//         console.error(" UseEffect: provinceId không hợp lệ:", province);
//         setDistricts([]);
//         setWards([]);
//       }
//     } else {
//       console.log(
//         " UseEffect: province không có giá trị, xóa districts và wards"
//       );
//       setDistricts([]);
//       setWards([]);
//     }
//   }, [province]);

//   // Cập nhật useEffect cho district
//   useEffect(() => {
//     if (district) {
//       const normalizedDistrictId = normalizeId(district);
//       if (!normalizedDistrictId) {
//         console.log(" UseEffect: district không hợp lệ, xóa wards");
//         setWards([]);
//         return;
//       }

//       console.log(
//         `✓ UseEffect: Tải wards cho district ${normalizedDistrictId}`
//       );

//       const loadWards = async () => {
//         try {
//           await fetchWards(normalizedDistrictId);
//         } catch (error) {
//           console.error(" Lỗi khi tải wards trong useEffect:", error);
//         }
//       };

//       loadWards();
//     } else {
//       console.log(" UseEffect: district không có giá trị, xóa wards");
//       setWards([]);
//     }
//   }, [district]);

//   useEffect(() => {
//     if (id) {
//       fetchInvoice();
//       fetchProducts();
//       fetchInvoiceProducts();
//       fetchPaymentHistory();
//       const loadStatusHistory = async () => {
//         try {
//           const response = await api.get(
//             `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//           const sortedHistory = response.data.sort(
//             (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
//           );

//           // Tạo một object lưu thời gian cho mỗi trạng thái
//           const timestamps = {};
//           sortedHistory.forEach((record) => {
//             // Chỉ lưu trạng thái đầu tiên tìm thấy cho mỗi trạng thái
//             if (!timestamps[record.trangThai]) {
//               timestamps[record.trangThai] = record.ngayTao;
//             }
//           });

//           setStatusTimestamps(timestamps);
//         } catch (error) {
//           console.error("Lỗi khi tải lịch sử trạng thái:", error);
//         }
//       };

//       loadStatusHistory();
//       // Initialize WebSocket connection
//       const socket = new SockJS("http://localhost:8080/ws", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const stompClient = new Client({
//         webSocketFactory: () => socket,
//         onConnect: () => {
//           console.log(" Kết nối WebSocket thành công");

//           // Lắng nghe sự kiện cập nhật hóa đơn
//           stompClient.subscribe(`/topic/hoa-don/${id}`, (message) => {
//             console.log("🔄 Nhận cập nhật hóa đơn:", message.body);
//             fetchInvoice(); // Gọi API để cập nhật dữ liệu
//             fetchInvoiceProducts(); // Cập nhật danh sách sản phẩm
//           });
//           const loadStatusHistory = async () => {
//             try {
//               const response = await api.get(
//                 `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
//                 {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 }
//               );

//               const sortedHistory = response.data.sort(
//                 (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
//               );

//               // Tạo một object lưu thời gian cho mỗi trạng thái
//               const timestamps = {};
//               sortedHistory.forEach((record) => {
//                 // Chỉ lưu trạng thái đầu tiên tìm thấy cho mỗi trạng thái
//                 if (!timestamps[record.trangThai]) {
//                   timestamps[record.trangThai] = record.ngayTao;
//                 }
//               });

//               setStatusTimestamps(timestamps);
//             } catch (error) {
//               console.error("Lỗi khi tải lịch sử trạng thái:", error);
//             }
//           };

//           loadStatusHistory();
//           // Lắng nghe sự kiện cập nhật sản phẩm trong hóa đơn
//           stompClient.subscribe(`/topic/hoa-don-san-pham/${id}`, (message) => {
//             console.log("🔄 Nhận cập nhật sản phẩm:", message.body);
//             fetchInvoiceProducts(); // Gọi API để cập nhật danh sách sản phẩm
//             fetchPaymentHistory(); // Cập nhật lịch sử thanh toán khi có sự kiện
//           });
//         },
//         onStompError: (frame) => {
//           console.error("STOMP error:", frame.headers["message"]);
//           console.error("STOMP error details:", frame.body);
//         },
//         onWebSocketError: (event) => {
//           console.error("WebSocket error:", event);
//         },
//         onDisconnect: () => console.log(" WebSocket bị ngắt kết nối"),
//       });

//       stompClient.activate();

//       return () => {
//         stompClient.deactivate();
//       };
//     }
//   }, [id]);

//   useEffect(() => {
//     if (invoice) {
//       setRecipientName(invoice.tenNguoiNhan);
//       setPhoneNumber(invoice.soDienThoai);
//       setSpecificAddress(invoice.diaChi);
//       setNote(invoice.ghiChu);
//       setShippingFee(invoice.phiVanChuyen);

//       // Find province first
//       const foundProvince = provinces.find((p) => p.name === invoice.tinh);
//       if (foundProvince) {
//         setProvince(foundProvince.code);

//         // Fetch and set districts
//         fetchDistricts(foundProvince.code).then(() => {
//           const foundDistrict = districts.find((d) => d.name === invoice.huyen);
//           if (foundDistrict) {
//             setDistrict(foundDistrict.code);

//             // Fetch and set wards
//             fetchWards(foundDistrict.code).then(() => {
//               const foundWard = wards.find((w) => w.name === invoice.xa);
//               if (foundWard) {
//                 setWard(foundWard.code);
//               }
//             });
//           }
//         });
//       }
//     }
//   }, [invoice, provinces]);

//   // Add useEffect for dialog open
//   useEffect(() => {
//     if (openEditRecipientDialog && invoice) {
//       setRecipientName(invoice.tenNguoiNhan || "");
//       setPhoneNumber(invoice.soDienThoai || "");
//       setNote(invoice.ghiChu || "");
//       setShippingFee(invoice.phiVanChuyen || 0);

//       const loadLocationData = async () => {
//         try {
//           // Tải danh sách tỉnh/thành phố
//           const provincesData = await fetchProvinces();

//           if (!provincesData.length) return;

//           // Tìm tỉnh/thành phố từ địa chỉ hiện có
//           if (invoice.diaChi) {
//             const addressParts = invoice.diaChi.split(", ").filter(Boolean);

//             // Nếu địa chỉ có ít nhất 3 phần: địa chỉ cụ thể, phường/xã, quận/huyện, tỉnh/tp
//             if (addressParts.length >= 3) {
//               // Phần cuối cùng là tỉnh/thành phố
//               const provinceName = addressParts[addressParts.length - 1];
//               const matchingProvince = findClosestMatch(
//                 provinceName,
//                 provincesData
//               );

//               if (matchingProvince) {
//                 setProvince(matchingProvince.ProvinceID);
//                 setSelectedProvince(matchingProvince);

//                 // Tải quận/huyện
//                 const districtsData = await fetchDistricts(
//                   matchingProvince.ProvinceID
//                 );

//                 // Phần kế cuối là quận/huyện
//                 const districtName = addressParts[addressParts.length - 2];
//                 const matchingDistrict = findClosestMatch(
//                   districtName,
//                   districtsData
//                 );

//                 if (matchingDistrict) {
//                   setDistrict(matchingDistrict.DistrictID);
//                   setSelectedDistrict(matchingDistrict);

//                   // Tải phường/xã
//                   const wardsData = await fetchWards(
//                     matchingDistrict.DistrictID
//                   );

//                   // Phần trước quận/huyện là phường/xã
//                   const wardName = addressParts[addressParts.length - 3];
//                   const matchingWard = findClosestMatch(wardName, wardsData);

//                   if (matchingWard) {
//                     setWard(matchingWard.WardCode);
//                     setSelectedWard(matchingWard);
//                   }

//                   // Địa chỉ cụ thể là tất cả các phần còn lại phía trước
//                   if (addressParts.length > 3) {
//                     const specificAddressParts = addressParts.slice(
//                       0,
//                       addressParts.length - 3
//                     );
//                     setSpecificAddress(specificAddressParts.join(", "));
//                   } else {
//                     setSpecificAddress(""); // Không có địa chỉ cụ thể
//                   }
//                 }
//               }
//             } else {
//               // Nếu địa chỉ không đủ các phần, coi như toàn bộ là địa chỉ cụ thể
//               setSpecificAddress(invoice.diaChi);
//             }
//           } else {
//             setSpecificAddress("");
//           }
//         } catch (error) {
//           console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
//         }
//       };

//       loadLocationData();
//     }
//   }, [openEditRecipientDialog, invoice]);
//   // Hàm tối ưu để cập nhật sản phẩm không gây loading toàn trang
//   const refreshInvoiceProducts = async () => {
//     try {
//       const response = await api.get(`/api/admin/hoa-don/${id}/san-pham`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data) {
//         const products = response.data;
//         const productsWithImages = products.map((product) => ({
//           ...product,
//           hinhAnh: Array.isArray(product.hinhAnh) ? product.hinhAnh : [],
//         }));
//         setInvoiceProducts(productsWithImages);
//         updateTotalBeforeDiscount(productsWithImages);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải danh sách sản phẩm:", error);
//     }
//   };

//   // Hàm tối ưu để cập nhật thông tin hóa đơn không gây loading toàn trang
//   const refreshInvoice = async () => {
//     try {
//       const response = await api.get(`/api/admin/hoa-don/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data) {
//         setInvoice(response.data);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải thông tin hóa đơn:", error);
//     }
//   };
//   const handleAddProduct = async (product, quantity) => {
//     if (!product) {
//       showErrorDialog("Vui lòng chọn sản phẩm");
//       return;
//     }

//     try {
//       setLoading(true); // Thêm loading state

//       // Gọi API để thêm sản phẩm vào hóa đơn
//       const response = await api.post(
//         `/api/admin/hoa-don/${id}/san-pham`,
//         {
//           sanPhamChiTietId: product.id,
//           soLuong: quantity,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       // Lấy dữ liệu sản phẩm đã thêm từ response
//       const addedProduct = response.data;

//       // Gọi API lấy hình ảnh cho sản phẩm
//       try {
//         const imgResponse = await api.get(
//           `/api/admin/sanphamchitiet/${product.id}/hinhanh`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Tạo sản phẩm mới với thông tin đầy đủ
//         const newProduct = {
//           ...addedProduct,
//           id: addedProduct.id, // Bảo đảm id đúng từ response
//           sanPhamChiTietId: product.id,
//           tenSanPham: product.tenSanPham,
//           maSanPham: product.maSanPham,
//           chatLieu: product.chatLieu || "---",
//           mauSac: product.mauSac || "---",
//           maMauSac: product.maMauSac || "#FFFFFF",
//           kichThuoc: product.kichThuoc || "---",
//           danhMuc: product.danhMuc || "---",
//           thuongHieu: product.thuongHieu || "---",
//           kieuDang: product.kieuDang || "---",
//           kieuCoAo: product.kieuCoAo || "---",
//           kieuTayAo: product.kieuTayAo || "---",
//           hoaTiet: product.hoaTiet || "---",
//           gia: product.gia,
//           soLuong: quantity,
//           thanhTien: product.gia * quantity,
//           hinhAnh: imgResponse.data.map((img) => img.anhUrl), // Chuyển sang mảng URL ảnh
//         };

//         // Cập nhật state với sản phẩm mới
//         setInvoiceProducts((prevProducts) => [...prevProducts, newProduct]);

//         // Cập nhật tổng tiền
//         updateInvoiceTotal([...invoiceProducts, newProduct]);
//         updateTotalBeforeDiscount([...invoiceProducts, newProduct]);

//         // Tìm và áp dụng voucher tốt nhất nếu cần
//         if (invoice.phieuGiamGia) {
//           await updateInvoiceTotal([...invoiceProducts, newProduct]);
//         }

//         toast.success(
//           `Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`
//         );
//       } catch (error) {
//         console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
//         // Vẫn thêm sản phẩm nhưng không có hình ảnh
//         const newProduct = {
//           ...addedProduct,
//           id: addedProduct.id,
//           sanPhamChiTietId: product.id,
//           tenSanPham: product.tenSanPham,
//           maSanPham: product.maSanPham,
//           chatLieu: product.chatLieu || "---",
//           mauSac: product.mauSac || "---",
//           maMauSac: product.maMauSac || "#FFFFFF",
//           kichThuoc: product.kichThuoc || "---",
//           gia: product.gia,
//           soLuong: quantity,
//           thanhTien: product.gia * quantity,
//           hinhAnh: [], // Mảng rỗng nếu không có hình ảnh
//         };

//         setInvoiceProducts((prevProducts) => [...prevProducts, newProduct]);
//         updateInvoiceTotal([...invoiceProducts, newProduct]);
//         updateTotalBeforeDiscount([...invoiceProducts, newProduct]);
//         toast.success(
//           `Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`
//         );
//       }

//       await Promise.all([refreshInvoiceProducts(), refreshInvoice()]);

//       toast.success(`Đã thêm ${product.tenSanPham || "sản phẩm"} vào đơn hàng`);
//       setOpenAddProductDialog(false);
//     } catch (error) {
//       console.error("Lỗi khi thêm sản phẩm:", error);
//       showErrorDialog(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleConfirmDelete = async () => {
//     try {
//       await api.delete(
//         `/api/admin/hoa-don/${id}/chi-tiet/${deletingProductId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Gắn token vào header
//           },
//         }
//       );
//       toast.success("Xóa sản phẩm thành công");
//       setInvoiceProducts((prevProducts) => {
//         const updatedProducts = prevProducts.filter(
//           (product) => product.id !== deletingProductId
//         );
//         updateTotalBeforeDiscount(updatedProducts);
//         return updatedProducts;
//       });
//       await updateInvoiceTotal(
//         invoiceProducts.filter((product) => product.id !== deletingProductId)
//       );
//       setOpenConfirmDelete(false);
//     } catch (error) {
//       console.error("Error removing product:", error);
//       showErrorDialog(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
//     }
//   };

//   const getProductStatusText = (status) => {
//     return status == 1 ? "Thành công" : "Không thành công";
//   };

//   const handleUpdateQuantity = async (hoaDonChiTietId, newQuantity) => {
//     if (newQuantity < 1) {
//       toast.error("Số lượng phải lớn hơn 0");
//       return;
//     }

//     // Kiểm tra xem sản phẩm này có thay đổi giá không
//     const product = invoiceProducts.find((p) => p.id === hoaDonChiTietId);
//     if (product && product.giaThayDoi) {
//       toast.warning("Không thể thay đổi số lượng sản phẩm đã thay đổi giá");
//       return;
//     }

//     // Cập nhật UI trước để phản hồi nhanh
//     setInvoiceProducts((prevProducts) =>
//       prevProducts.map((product) =>
//         product.id === hoaDonChiTietId
//           ? {
//               ...product,
//               soLuong: newQuantity,
//               thanhTien: product.gia * newQuantity,
//             }
//           : product
//       )
//     );

//     try {
//       const updateToastId = toast.loading("Đang cập nhật số lượng...");

//       await api.put(
//         `/api/admin/hoa-don/${id}/chi-tiet/${hoaDonChiTietId}/so-luong`,
//         { soLuong: newQuantity },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       // Cập nhật tổng tiền
//       const updatedProducts = invoiceProducts.map((product) =>
//         product.id === hoaDonChiTietId
//           ? {
//               ...product,
//               soLuong: newQuantity,
//               thanhTien: product.gia * newQuantity,
//             }
//           : product
//       );

//       updateTotalBeforeDiscount(updatedProducts);
//       await refreshInvoice();

//       toast.dismiss(updateToastId);
//       toast.success("Cập nhật số lượng thành công");
//     } catch (error) {
//       // Nếu lỗi, khôi phục lại danh sách sản phẩm
//       refreshInvoiceProducts();
//       showErrorDialog("Lỗi khi cập nhật số lượng");
//     }
//   };

//   const handleStatusChange = async (newStatus) => {
//     if (invoice.trangThai === 6) {
//       showErrorDialog("Không thể thay đổi trạng thái của đơn hàng đã hủy");
//       return;
//     }

//     // Kiểm tra nếu đang chuyển từ trạng thái chờ xác nhận (1) sang đã xác nhận (2)
//     // và chưa xác nhận thay đổi giá
//     if (invoice.trangThai === 1 && newStatus === 2 && priceNeedsConfirmation) {
//       Modal.confirm({
//         title: "Cảnh báo thay đổi giá chưa được xác nhận",
//         content:
//           "Đơn hàng này có sản phẩm thay đổi giá chưa được xác nhận. Bạn cần xác nhận thay đổi giá trước khi xác nhận đơn hàng.",
//         okText: "Xác nhận giá ngay",
//         cancelText: "Đóng",
//         onOk: () => {
//           setOpenPriceChangeDialog(true);
//         },
//       });
//       return;
//     }

//     // Nếu là trạng thái hủy đơn
//     if (newStatus === 6) {
//       Modal.confirm({
//         title: "Xác nhận hủy đơn hàng",
//         content:
//           "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm và mã giảm giá sẽ được hoàn lại.",
//         okText: "Hủy đơn",
//         cancelText: "Đóng",
//         okButtonProps: { danger: true },
//         onOk: async () => {
//           try {
//             const cancelToastId = toast.loading("Đang hủy đơn hàng...");
//             await api.delete(`/api/admin/hoa-don/${id}`, {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             toast.dismiss(cancelToastId);
//             toast.success("Đã hủy đơn hàng và hoàn lại sản phẩm, mã giảm giá.");
//             fetchInvoice();
//           } catch (error) {
//             console.error("Lỗi khi hủy đơn hàng:", error);
//             toast.error("Lỗi khi hủy đơn hàng!");
//           }
//         },
//       });
//     } else {
//       // Các trạng thái khác
//       setNextStatus(newStatus);
//       setOpenConfirmDialog(true);
//       setConfirmText("");
//     }
//   };
//   const handleConfirmStatusChange = async () => {
//     if (confirmText.toLowerCase() !== "đồng ý") {
//       showErrorDialog("Vui lòng nhập 'đồng ý' để xác nhận");
//       return;
//     }

//     try {
//       console.log("Updating status to:", nextStatus);

//       // 1. Gọi API để cập nhật trạng thái hóa đơn
//       const response = await api.patch(
//         `/api/admin/hoa-don/${id}/status`,
//         null,
//         {
//           params: { trangThai: nextStatus },
//           headers: {
//             Authorization: `Bearer ${token}`, // Gắn token vào header
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       // 2. Cập nhật state sau khi thành công
//       setInvoice(response.data);
//       toast.success("Cập nhật trạng thái thành công");
//       setOpenConfirmDialog(false);
//     } catch (error) {
//       console.error("Error updating status:", error); // Log lỗi chi tiết
//       showErrorDialog(
//         error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
//       );
//     }
//   };

//   const handleGoBack = (currentStatus) => {
//     if (currentStatus > 1) {
//       // Only allow going back if not at first status
//       setNextStatus(currentStatus - 1);
//       setOpenConfirmDialog(true);
//       setConfirmText("");
//     }
//   };

//   // Add this function to fetch payment history
//   const fetchPaymentHistory = async () => {
//     try {
//       setLoadingPayments(true);
//       const response = await api.get(`/api/thanh-toan-hoa-don/hoa-don/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Thêm token vào header
//         },
//       });
//       setPaymentHistory(response.data);
//     } catch (error) {
//       console.error("Error fetching payment history:", error);
//       toast.error("Lỗi khi tải lịch sử thanh toán");
//     } finally {
//       setLoadingPayments(false);
//     }
//   };

//   // Add this new function to calculate discount amount
//   const calculateDiscountAmount = (voucher, totalAmount) => {
//     if (!voucher || !totalAmount) return 0;

//     // Important: totalAmount here should be only the product total, excluding shipping fee
//     let discountAmount = 0;

//     if (voucher.loaiPhieuGiamGia === 1) {
//       // Giảm theo % nhưng không vượt quá mức giảm tối đa
//       discountAmount = (voucher.giaTriGiam / 100) * totalAmount;
//       if (voucher.soTienGiamToiDa) {
//         discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
//       }
//     } else {
//       // Giảm số tiền cố định nhưng không vượt quá tổng đơn hàng
//       discountAmount = Math.min(voucher.giaTriGiam, totalAmount);
//     }

//     // Đảm bảo chỉ áp dụng nếu đơn hàng đạt mức tối thiểu
//     if (totalAmount < voucher.giaTriToiThieu) {
//       return 0;
//     }

//     return discountAmount;
//   };

//   // Add this new function to find best voucher
//   const findBestVoucher = (vouchers, totalAmount) => {
//     if (!vouchers || vouchers.length === 0 || totalAmount <= 0) return null;

//     return vouchers.reduce((best, current) => {
//       if (totalAmount < current.giaTriToiThieu) return best;

//       const currentDiscount = calculateDiscountAmount(current, totalAmount);
//       const bestDiscount = best
//         ? calculateDiscountAmount(best, totalAmount)
//         : 0;

//       return currentDiscount > bestDiscount ? current : best;
//     }, null);
//   };

//   const fetchOrderHistory = async () => {
//     try {
//       setLoadingHistory(true);
//       const response = await api.get(
//         `/api/admin/lich-su-hoa-don/hoa-don/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data && Array.isArray(response.data)) {
//         // Lọc các bản ghi có liên quan đến trạng thái và sắp xếp theo thời gian tăng dần
//         const statusRecords = response.data.filter(
//           (record) => record.trangThai >= 1 && record.trangThai <= 6
//         );

//         // Sắp xếp theo thời gian tăng dần để hiển thị theo thứ tự
//         const sortedHistory = statusRecords.sort(
//           (a, b) => new Date(a.ngayTao) - new Date(b.ngayTao)
//         );

//         setOrderHistory(sortedHistory);

//         // Tạo một object lưu thời gian cho mỗi trạng thái
//         // (chỉ lấy thời gian gần nhất của mỗi trạng thái)
//         const timestamps = {};
//         const reversedHistory = [...response.data].sort(
//           (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
//         );

//         reversedHistory.forEach((record) => {
//           // Chỉ lưu trạng thái đầu tiên tìm thấy cho mỗi trạng thái
//           if (
//             !timestamps[record.trangThai] &&
//             record.trangThai >= 1 &&
//             record.trangThai <= 6
//           ) {
//             timestamps[record.trangThai] = record.ngayTao;
//           }
//         });

//         setStatusTimestamps(timestamps);
//         setOpenHistoryDialog(true);
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
//       toast.error("Không thể tải lịch sử đơn hàng");
//     } finally {
//       setLoadingHistory(false);
//     }
//   };
//   const isAddressId = (text) => {
//     if (!text) return false;
//     const trimmed = text.trim();

//     // Các mẫu ID phổ biến:
//     // 1. Chỉ có số: 123, 3303, 201
//     // 2. Số + chữ cái + số: 1B2728
//     // 3. Bắt đầu bằng số: 201ABC

//     const patterns = [
//       /^\d+$/, // Chỉ số
//       /^\d+[A-Za-z]\d*$/, // Số+chữ+số
//       /^\d+[A-Za-z]+$/, // Số+chữ
//     ];

//     return patterns.some((pattern) => pattern.test(trimmed));
//   };

//   const debugAddressId = (text) => {
//     console.log(`🔍 Kiểm tra ID "${text}": ${isAddressId(text)}`);
//     return isAddressId(text);
//   };
//   const getLocationNameById = (type, id) => {
//     if (!id) return null;

//     // Chuyển id thành chuỗi để so sánh
//     const idStr = id.toString().trim();

//     // Kiểm tra cache toàn cục (được cập nhật bởi hàm fetchAddressNames)
//     if (
//       window.addressCache &&
//       window.addressCache[type] &&
//       window.addressCache[type][idStr]
//     ) {
//       console.log(
//         `✅ Tìm thấy địa chỉ trong cache toàn cục: ${window.addressCache[type][idStr]}`
//       );
//       return window.addressCache[type][idStr];
//     }

//     // Tìm trong cache của component trước
//     const cachedName = getAddressNameById(type, idStr);
//     if (cachedName) {
//       console.log(`✅ Tìm thấy địa chỉ trong cache component: ${cachedName}`);
//       return cachedName;
//     }

//     // Thử tìm bằng findNameById nếu có
//     if (typeof findNameById === "function") {
//       const foundName = findNameById(type, idStr);
//       if (foundName) {
//         console.log(`✅ Tìm thấy địa chỉ bằng findNameById: ${foundName}`);
//         return foundName;
//       }
//     }

//     return null;
//   };
//   const fetchAddressNames = async (provinceId, districtId, wardCode) => {
//     try {
//       console.log("🔄 Đang tải thông tin địa chỉ từ API:", {
//         provinceId,
//         districtId,
//         wardCode,
//       });

//       // Bước 1: Tải danh sách tỉnh/thành phố
//       const provincesResponse = await api.get(
//         "/api/admin/hoa-don/dia-chi/tinh",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Đảm bảo có dữ liệu
//       if (!provincesResponse.data || !Array.isArray(provincesResponse.data)) {
//         console.error("❌ API tỉnh trả về dữ liệu không hợp lệ");
//         return {};
//       }

//       // Tìm tỉnh/thành phố theo ID
//       const provinceData = provincesResponse.data.find(
//         (p) => p.id && provinceId && p.id.toString() === provinceId.toString()
//       );

//       let provinceName = null;
//       let districtName = null;
//       let wardName = null;

//       if (provinceData) {
//         provinceName = provinceData.name;
//         console.log(
//           `✅ Tìm thấy tỉnh/thành phố: ${provinceName} (${provinceId})`
//         );

//         // Bước 2: Tải danh sách quận/huyện
//         try {
//           const districtsResponse = await api.get(
//             `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );

//           if (districtsResponse.data && Array.isArray(districtsResponse.data)) {
//             const districtData = districtsResponse.data.find(
//               (d) =>
//                 d.id && districtId && d.id.toString() === districtId.toString()
//             );

//             if (districtData) {
//               districtName = districtData.name;
//               console.log(
//                 `✅ Tìm thấy quận/huyện: ${districtName} (${districtId})`
//               );

//               // Bước 3: Tải danh sách phường/xã
//               try {
//                 const wardsResponse = await api.get(
//                   `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
//                   {
//                     headers: { Authorization: `Bearer ${token}` },
//                   }
//                 );

//                 if (wardsResponse.data && Array.isArray(wardsResponse.data)) {
//                   const wardData = wardsResponse.data.find(
//                     (w) =>
//                       w.id &&
//                       wardCode &&
//                       w.id.toString() === wardCode.toString()
//                   );

//                   if (wardData) {
//                     wardName = wardData.name;
//                     console.log(
//                       `✅ Tìm thấy phường/xã: ${wardName} (${wardCode})`
//                     );
//                   } else {
//                     console.log(
//                       `❌ Không tìm thấy phường/xã với mã: ${wardCode}`
//                     );
//                   }
//                 }
//               } catch (wardError) {
//                 console.error("❌ Lỗi khi tải danh sách phường/xã:", wardError);
//               }
//             } else {
//               console.log(`❌ Không tìm thấy quận/huyện với ID: ${districtId}`);
//             }
//           }
//         } catch (districtError) {
//           console.error("❌ Lỗi khi tải danh sách quận/huyện:", districtError);
//         }
//       } else {
//         console.log(`❌ Không tìm thấy tỉnh/thành phố với ID: ${provinceId}`);
//       }

//       // Khởi tạo cache toàn cục nếu chưa có
//       window.addressCache = window.addressCache || {};
//       window.addressCache.provinces = window.addressCache.provinces || {};
//       window.addressCache.districts = window.addressCache.districts || {};
//       window.addressCache.wards = window.addressCache.wards || {};

//       // Cập nhật cache với dữ liệu mới tìm được
//       if (provinceName) {
//         window.addressCache.provinces[provinceId] = provinceName;
//         console.log(`💾 Đã lưu cache tỉnh: ${provinceId} -> ${provinceName}`);
//       }

//       if (districtName) {
//         window.addressCache.districts[districtId] = districtName;
//         console.log(`💾 Đã lưu cache huyện: ${districtId} -> ${districtName}`);
//       }

//       if (wardName) {
//         window.addressCache.wards[wardCode] = wardName;
//         console.log(`💾 Đã lưu cache xã: ${wardCode} -> ${wardName}`);
//       }

//       return { provinceName, districtName, wardName };
//     } catch (error) {
//       console.error("❌ Lỗi khi tải thông tin địa chỉ:", error);
//       return {};
//     }
//   };
//   const formatFullAddress = () => {
//     const diaChi = invoice?.diaChi;

//     if (!diaChi || diaChi.trim() === "") {
//       return "Không có địa chỉ";
//     }

//     console.log("📋 Xử lý địa chỉ:", diaChi);

//     try {
//       // Tách chuỗi địa chỉ theo dấu phẩy
//       const parts = diaChi.split(/,\s*/);

//       // Cần ít nhất 4 phần tử
//       if (parts.length < 4) {
//         return diaChi;
//       }

//       // Lấy các phần cuối
//       const lastThreeParts = [
//         parts[parts.length - 3].trim(),
//         parts[parts.length - 2].trim(),
//         parts[parts.length - 1].trim(),
//       ];

//       // Kiểm tra và debug xem có phải ID không
//       console.log("🔍 Kiểm tra các phần cuối của địa chỉ:", lastThreeParts);
//       const isIdFormat = lastThreeParts.every((part) => debugAddressId(part));

//       if (!isIdFormat) {
//         console.log("📌 Địa chỉ không phải định dạng ID (có tên địa lý)");

//         // Nếu phần cuối cùng vẫn là ID (Tỉnh/TP: 201)
//         if (lastThreeParts[2].includes("Tỉnh/TP:")) {
//           // Thử lấy tên tỉnh từ ID
//           const provinceIdStr = lastThreeParts[2]
//             .replace("Tỉnh/TP:", "")
//             .trim();
//           const provinceName = getLocationNameById("provinces", provinceIdStr);

//           // Trả về với tên tỉnh nếu có
//           if (provinceName) {
//             return `${parts
//               .slice(0, parts.length - 1)
//               .join(", ")}, ${provinceName}`;
//           }
//         }

//         // Nếu đã có tên địa lý, trả về nguyên bản
//         return diaChi;
//       }

//       // Lấy ID
//       const wardCode = lastThreeParts[0];
//       const districtId = lastThreeParts[1];
//       const provinceId = lastThreeParts[2];

//       // Lấy tên địa lý từ cache hoặc hiển thị placeholder
//       const wardName = getLocationNameById("wards", wardCode);
//       const districtName = getLocationNameById("districts", districtId);
//       const provinceName = getLocationNameById("provinces", provinceId);

//       console.log("📊 Thông tin địa chỉ từ cache:", {
//         wardCode,
//         wardName,
//         districtId,
//         districtName,
//         provinceId,
//         provinceName,
//       });

//       // Địa chỉ chi tiết
//       const detailAddress = parts.slice(0, parts.length - 3).join(", ");

//       // Nếu tìm được đầy đủ tên địa lý
//       if (wardName && districtName && provinceName) {
//         return `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
//       }

//       // Nếu không, sử dụng placeholder cho phần không tìm thấy
//       const wardPart = wardName || `Xã/Phường: ${wardCode}`;
//       const districtPart = districtName || `Quận/Huyện: ${districtId}`;
//       const provincePart = provinceName || `Tỉnh/TP: ${provinceId}`;

//       return `${detailAddress}, ${wardPart}, ${districtPart}, ${provincePart}`;
//     } catch (error) {
//       console.error("❌ Lỗi khi định dạng địa chỉ:", error);
//       return diaChi;
//     }
//   };

//   // Thêm một hàm riêng để tải thông tin địa chỉ và cập nhật cache
//   const loadAddressNamesIfNeeded = async () => {
//     if (!invoice?.diaChi) return;

//     try {
//       const parts = invoice.diaChi.split(/,\s*/);
//       if (parts.length < 4) return;

//       const wardCode = parts[parts.length - 3].trim();
//       const districtId = parts[parts.length - 2].trim();
//       const provinceId = parts[parts.length - 1].trim();

//       // Kiểm tra xem có phải ID không
//       const allAreIds = [wardCode, districtId, provinceId].every(
//         (id) => /^\d+$/.test(id) || /^\d+[A-Za-z]\d*$/.test(id)
//       );

//       if (!allAreIds) return;

//       // Kiểm tra xem đã có trong cache chưa
//       const hasAllNames =
//         getAddressNameById("wards", wardCode) &&
//         getAddressNameById("districts", districtId) &&
//         getAddressNameById("provinces", provinceId);

//       // Nếu chưa có đầy đủ, tải thông tin địa chỉ
//       if (!hasAllNames) {
//         console.log(
//           "🔄 Đang tải thông tin địa chỉ cho:",
//           wardCode,
//           districtId,
//           provinceId
//         );
//         await loadAddressInfoFromIds(provinceId, districtId, wardCode);
//         forceUpdate(); // Cập nhật UI sau khi tải xong
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải thông tin địa chỉ:", error);
//     }
//   };

//   // Thêm state ở mức component
//   const [formattedAddress, setFormattedAddress] = useState("");
//   useEffect(() => {
//     const processAddress = async () => {
//       if (!invoice?.diaChi) {
//         setFormattedAddress("");
//         return;
//       }

//       // Hiển thị địa chỉ ban đầu dựa trên cache hiện có
//       const initialFormatted = formatFullAddress();
//       setFormattedAddress(initialFormatted);

//       // Nếu địa chỉ có vẻ đang ở định dạng ID, thử tải thông tin
//       const parts = invoice.diaChi.split(/,\s*/);
//       if (parts.length >= 4) {
//         try {
//           // Tải thông tin địa chỉ
//           await tryLoadAddressFromIds();

//           // Cập nhật lại địa chỉ sau khi tải
//           const updatedFormatted = formatFullAddress();
//           console.log("📝 Địa chỉ sau khi tải:", updatedFormatted);

//           // Kiểm tra xem địa chỉ mới có tốt hơn không (có ít phần "Xã/Phường:", "Quận/Huyện:", "Tỉnh/TP:" hơn)
//           const oldPlaceholders = countPlaceholders(initialFormatted);
//           const newPlaceholders = countPlaceholders(updatedFormatted);

//           // Nếu địa chỉ mới có ít placeholder hơn hoặc khác hoàn toàn, cập nhật
//           if (
//             updatedFormatted !== initialFormatted &&
//             (newPlaceholders < oldPlaceholders || oldPlaceholders === 0)
//           ) {
//             console.log("📢 Cập nhật địa chỉ hiển thị:", updatedFormatted);
//             setFormattedAddress(updatedFormatted);
//           }
//         } catch (error) {
//           console.error("❌ Lỗi khi xử lý địa chỉ:", error);
//         }
//       }
//     };

//     processAddress();
//   }, [invoice?.diaChi]);
//   // Cải thiện hàm findNameById để tìm tên từ ID trong các danh sách đã tải
//   const countPlaceholders = (address) => {
//     if (!address) return 0;

//     let count = 0;
//     if (address.includes("Xã/Phường:")) count++;
//     if (address.includes("Quận/Huyện:")) count++;
//     if (address.includes("Tỉnh/TP:")) count++;

//     return count;
//   };

//   const findNameById = (type, id) => {
//     if (!id) return null;

//     try {
//       // Chuyển đổi ID thành string để so sánh
//       const idStr = id.toString();

//       switch (type) {
//         case "provinces":
//           if (provinces && provinces.length > 0) {
//             const province = provinces.find(
//               (p) => p.ProvinceID?.toString() === idStr
//             );
//             return province ? province.ProvinceName : null;
//           }
//           break;

//         case "districts":
//           if (districts && districts.length > 0) {
//             const district = districts.find(
//               (d) => d.DistrictID?.toString() === idStr
//             );
//             return district ? district.DistrictName : null;
//           }
//           break;

//         case "wards":
//           if (wards && wards.length > 0) {
//             const ward = wards.find((w) => w.WardCode?.toString() === idStr);
//             return ward ? ward.WardName : null;
//           }
//           break;

//         default:
//           return null;
//       }
//     } catch (error) {
//       console.error(`Lỗi khi tìm tên từ ID cho ${type} với ID=${id}:`, error);
//       return null;
//     }

//     return null;
//   };
//   const handleErrorDialogClose = () => {
//     setErrorDialogOpen(false);
//     setErrorDialogMessage("");
//   };

//   const showErrorDialog = (message) => {
//     setErrorDialogMessage(message);
//     setErrorDialogOpen(true);
//   };
//   // Add new helper function to sort vouchers by potential savings
//   const sortVouchersBySavings = (vouchers, totalAmount) => {
//     if (totalAmount === 0) return [];
//     return [...vouchers].sort((a, b) => {
//       const savingsA = calculateDiscountAmount(a, totalAmount);
//       const savingsB = calculateDiscountAmount(b, totalAmount);
//       return savingsB - savingsA;
//     });
//   };

//   // Hàm để chuyển đổi địa chỉ sang định dạng GHN
//   const mapAddressToGHNFormat = async (address) => {
//     if (!address || !address.tinh || !address.huyen || !address.xa) {
//       console.error("Địa chỉ không đủ thông tin:", address);
//       return null;
//     }

//     try {
//       console.log("🔍 Đang chuyển đổi địa chỉ sang định dạng GHN:", address);
//       let provinceId, districtId, wardCode;

//       // Lấy danh sách tỉnh/thành phố
//       const provincesResponse = await api.get(
//         "/api/admin/hoa-don/dia-chi/tinh",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const provinces = provincesResponse.data;

//       // Kiểm tra xem tỉnh là ID hay tên
//       if (/^\d+$/.test(address.tinh)) {
//         // Nếu là ID
//         provinceId = parseInt(address.tinh);
//         console.log(`✓ Sử dụng ID tỉnh: ${provinceId}`);
//       } else {
//         // Nếu là tên, tìm ID tương ứng
//         const matchingProvince = provinces.find(
//           (p) => normalizeString(p.name) === normalizeString(address.tinh)
//         );

//         if (!matchingProvince) {
//           console.error("Không tìm thấy tỉnh/thành phố:", address.tinh);
//           return null;
//         }

//         provinceId = matchingProvince.id;
//         console.log(`✓ Tìm thấy ID tỉnh: ${provinceId} cho "${address.tinh}"`);
//       }

//       // Lấy danh sách quận/huyện
//       const districtsResponse = await api.get(
//         `/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const districts = districtsResponse.data;

//       // Kiểm tra xem huyện là ID hay tên
//       if (/^\d+$/.test(address.huyen)) {
//         // Nếu là ID
//         districtId = parseInt(address.huyen);
//         console.log(`✓ Sử dụng ID huyện: ${districtId}`);
//       } else {
//         // Nếu là tên, tìm ID tương ứng
//         const matchingDistrict = districts.find(
//           (d) => normalizeString(d.name) === normalizeString(address.huyen)
//         );

//         if (!matchingDistrict) {
//           console.error("Không tìm thấy quận/huyện:", address.huyen);
//           return null;
//         }

//         districtId = matchingDistrict.id;
//         console.log(
//           `✓ Tìm thấy ID huyện: ${districtId} cho "${address.huyen}"`
//         );
//       }

//       // Lấy danh sách phường/xã
//       const wardsResponse = await api.get(
//         `/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const wards = wardsResponse.data;

//       // Kiểm tra xem xã là ID hay tên
//       if (/^\d+$/.test(address.xa)) {
//         // Nếu là ID
//         wardCode = address.xa;
//         console.log(`✓ Sử dụng mã xã: ${wardCode}`);
//       } else {
//         // Nếu là tên, tìm ID tương ứng
//         const matchingWard = wards.find(
//           (w) => normalizeString(w.name) === normalizeString(address.xa)
//         );

//         if (!matchingWard) {
//           console.error("Không tìm thấy phường/xã:", address.xa);
//           return null;
//         }

//         wardCode = matchingWard.id.toString();
//         console.log(`✓ Tìm thấy mã xã: ${wardCode} cho "${address.xa}"`);
//       }

//       // Trả về thông tin định dạng GHN
//       console.log("✅ Chuyển đổi địa chỉ thành công:", {
//         to_district_id: districtId,
//         to_ward_code: wardCode,
//       });

//       return {
//         to_district_id: districtId,
//         to_ward_code: wardCode,
//       };
//     } catch (error) {
//       console.error("❌ Lỗi khi chuyển đổi địa chỉ:", error);
//       return null;
//     }
//   };

//   const parseAddress = (fullAddress) => {
//     if (!fullAddress || typeof fullAddress !== "string") {
//       return {
//         diaChiCuThe: "",
//         xa: "",
//         huyen: "",
//         tinh: "",
//         isIdFormat: false,
//       };
//     }

//     // Pattern: "specific address, wardId, districtId, provinceId"
//     const specialPattern = /^(.*?),\s*(\d+),\s*(\d+),\s*(\d+)$/;
//     const match = fullAddress.match(specialPattern);

//     if (match) {
//       console.log("🔍 Địa chỉ dạng ID được phát hiện:", fullAddress);
//       const [_, diaChiCuThe, xaId, huyenId, tinhId] = match;

//       return {
//         diaChiCuThe: diaChiCuThe.trim(),
//         xa: xaId,
//         huyen: huyenId,
//         tinh: tinhId,
//         isIdFormat: true,
//       };
//     }

//     // Nếu không phải định dạng ID, trả về dạng thông thường
//     return {
//       diaChiCuThe: fullAddress,
//       xa: "",
//       huyen: "",
//       tinh: "",
//       isIdFormat: false,
//     };
//   };
//   // Cập nhật hàm tryLoadAddressFromIds để đảm bảo chuyển đổi ID đúng

//   const tryLoadAddressFromIds = async () => {
//     if (!invoice?.diaChi) return;

//     try {
//       console.log(
//         "🔄 Đang phân tích địa chỉ để tải thông tin:",
//         invoice.diaChi
//       );

//       // Phân tích địa chỉ
//       const parts = invoice.diaChi.split(/,\s*/);
//       if (parts.length < 4) {
//         console.log("⚠️ Địa chỉ không đủ phần để phân tích");
//         return;
//       }

//       // Lấy các phần cuối
//       const lastThreeParts = [
//         parts[parts.length - 3].trim(), // wardCode
//         parts[parts.length - 2].trim(), // districtId
//         parts[parts.length - 1].trim(), // provinceId
//       ];

//       const allAreIds = lastThreeParts.every((part) => isAddressId(part));

//       if (!allAreIds) {
//         console.log("📌 Địa chỉ không ở định dạng ID, không tải thông tin");
//         return;
//       }

//       const wardCode = lastThreeParts[0];
//       const districtId = lastThreeParts[1];
//       const provinceId = lastThreeParts[2];

//       // Tải thông tin địa chỉ trực tiếp từ API
//       const addressInfo = await fetchAddressNames(
//         provinceId,
//         districtId,
//         wardCode
//       );

//       // Cập nhật giao diện nếu tìm được thông tin mới
//       if (
//         addressInfo.provinceName ||
//         addressInfo.districtName ||
//         addressInfo.wardName
//       ) {
//         // Cập nhật giao diện
//         forceUpdate();
//       }

//       return addressInfo;
//     } catch (error) {
//       console.error("❌ Lỗi khi tải thông tin địa chỉ:", error);
//     }
//   };
//   const calculateShippingFeeFromGHN = async () => {
//     if (!invoice || invoice.loaiHoaDon !== 3) {
//       return;
//     }

//     try {
//       setLoadingShippingFee(true);

//       // Phân tích địa chỉ
//       const addressParts = invoice.diaChi?.split(/,\s*/);
//       if (!addressParts || addressParts.length < 4) {
//         console.error("Địa chỉ không đủ thông tin để tính phí vận chuyển");
//         return;
//       }

//       // Lấy ra 3 phần cuối của địa chỉ (phường/xã, quận/huyện, tỉnh/thành phố)
//       const wardInfo = addressParts[addressParts.length - 3].trim();
//       const districtInfo = addressParts[addressParts.length - 2].trim();
//       const provinceInfo = addressParts[addressParts.length - 1].trim();

//       // Kiểm tra xem có phải địa chỉ dạng ID không
//       const isIdFormat = [wardInfo, districtInfo, provinceInfo].every((part) =>
//         /^\d+$/.test(part)
//       );

//       let addressData;
//       if (isIdFormat) {
//         // Sử dụng ID trực tiếp
//         addressData = {
//           tinh: provinceInfo,
//           huyen: districtInfo,
//           xa: wardInfo,
//         };
//       } else {
//         // Trường hợp địa chỉ dạng tên thông thường
//         const addressInfo = extractAddressInfo(invoice?.diaChi);
//         if (
//           !addressInfo.provinceId ||
//           !addressInfo.districtId ||
//           !addressInfo.wardId
//         ) {
//           return;
//         }

//         addressData = {
//           tinh: addressInfo.provinceId,
//           huyen: addressInfo.districtId,
//           xa: addressInfo.wardId,
//         };
//       }

//       const shopInfo = {
//         district_id: 1482,
//         ward_code: "11006",
//       };

//       // Chuyển đổi địa chỉ sang định dạng GHN
//       const ghnAddress = await mapAddressToGHNFormat(addressData);
//       if (!ghnAddress) {
//         console.error("Không thể chuyển đổi địa chỉ GHN:", addressData);
//         return;
//       }

//       const payload = {
//         from_district_id: shopInfo.district_id,
//         from_ward_code: shopInfo.ward_code,
//         to_district_id: ghnAddress.to_district_id,
//         to_ward_code: ghnAddress.to_ward_code,
//         service_type_id: 2, // Giao hàng tiêu chuẩn
//         weight: 500, // 500g
//         length: 20, // 20cm
//         width: 20, // 20cm
//         height: 10, // 10cm
//       };

//       // Gọi API tính phí vận chuyển của GHN
//       const response = await api.post(
//         `/api/admin/hoa-don/phi-van-chuyen`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       // Xử lý kết quả từ API
//       if (response.data && typeof response.data === "number") {
//         const fee = response.data > 0 ? response.data : 30000;
//         setShippingFeeFromGHN(fee);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tính phí vận chuyển từ GHN:", error);
//     } finally {
//       setLoadingShippingFee(false);
//     }
//   };
//   const refreshPaymentHistory = async () => {
//     try {
//       const response = await api.get(`/api/thanh-toan-hoa-don/hoa-don/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data) {
//         setPaymentHistory(response.data);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải lịch sử thanh toán:", error);
//     }
//   };
//   // Cập nhật hàm handleRecalculateShipping để hiển thị kết quả mới từ GHN
//   const handleRecalculateShipping = async () => {
//     if (!invoice || invoice.loaiHoaDon !== 3) {
//       toast.info("Chỉ áp dụng cho hóa đơn giao hàng");
//       return;
//     }

//     try {
//       const loadingToastId = toast.loading("Đang tính phí vận chuyển...");
//       setLoadingShippingFee(true);

//       // Tính phí vận chuyển mới từ GHN
//       await calculateShippingFeeFromGHN();

//       // Nếu có phí vận chuyển mới, cập nhật vào hóa đơn
//       if (shippingFeeFromGHN) {
//         const response = await api.post(
//           `/api/admin/hoa-don/${id}/cap-nhat-phi-van-chuyen`,
//           { fee: shippingFeeFromGHN },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         // Cập nhật cục bộ thay vì reload toàn trang
//         setInvoice((prev) => ({
//           ...prev,
//           phiVanChuyen: shippingFeeFromGHN,
//           tongTien:
//             totalBeforeDiscount - getDiscountAmount() + shippingFeeFromGHN,
//         }));

//         toast.dismiss(loadingToastId);
//         toast.success(
//           `Đã cập nhật phí vận chuyển: ${formatCurrency(shippingFeeFromGHN)}`
//         );

//         // Cập nhật nhẹ nhàng không reload toàn trang
//         refreshInvoice();
//         refreshPaymentHistory();
//       } else {
//         toast.dismiss(loadingToastId);
//         toast.error(
//           "Không thể tính phí vận chuyển. Đang sử dụng giá mặc định."
//         );
//       }
//     } catch (error) {
//       console.error("Lỗi khi tính phí vận chuyển:", error);
//       toast.error(
//         error.message || "Không thể tính phí vận chuyển. Vui lòng thử lại."
//       );
//     } finally {
//       setLoadingShippingFee(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
//         <Spin />
//       </div>
//     );
//   }

//   if (!invoice) {
//     return (
//       <div className="flex-1 overflow-auto relative z-10">
//         <div style={{ padding: 24 }}>
//           <Typography>Không tìm thấy thông tin hóa đơn</Typography>
//           <Button
//             type="default"
//             icon={<ArrowLeftOutlined />}
//             onClick={() => navigate("/hoa-don")}
//           >
//             Quay lại
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 overflow-auto relative z-10">
//       <div
//         style={{
//           padding: 24,
//           position: "relative",
//         }}
//       >
//         <div style={{ marginBottom: 24 }}></div>
//         <Steps
//           current={invoice.trangThai - 1}
//           progressDot={(dot, { index }) => {
//             const statusHistory = getOrderStatusHistory();
//             const currentStatus = index + 1; // Index bắt đầu từ 0 nhưng status từ 1

//             // Tìm thời gian gần nhất của trạng thái này trong lịch sử
//             const statusRecord = statusHistory.find(
//               (record) => record.trangThai === currentStatus
//             );
//             const timestamp = statusRecord?.ngayTao;

//             return (
//               <Tooltip
//                 title={
//                   timestamp
//                     ? `${getStatusText(currentStatus)}: ${formatDate(
//                         timestamp
//                       )}`
//                     : getStatusText(currentStatus)
//                 }
//               >
//                 {dot}
//               </Tooltip>
//             );
//           }}
//         >
//           {steps
//             .filter(
//               (step) =>
//                 // Chỉ hiển thị các trạng thái đã đạt được hoặc trạng thái hiện tại
//                 step.status <= invoice.trangThai
//             )
//             .map((step) => {
//               // Tìm timestamp từ lịch sử
//               const timestamp = statusTimestamps[step.status];

//               return (
//                 <Step
//                   key={step.label}
//                   title={step.label}
//                   description={
//                     timestamp ? (
//                       <Text type="secondary" style={{ fontSize: "12px" }}>
//                         {formatDate(timestamp)}
//                       </Text>
//                     ) : null
//                   }
//                 />
//               );
//             })}
//         </Steps>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             marginTop: 16,
//             gap: 16,
//           }}
//         >
//           {invoice.trangThai !== 5 && invoice.trangThai !== 6 && (
//             <>
//               {priceNeedsConfirmation && invoice.trangThai === 1 && (
//                 <Button
//                   danger
//                   icon={<WarningOutlined />}
//                   onClick={() => setOpenPriceChangeDialog(true)}
//                 >
//                   Xác nhận thay đổi giá
//                 </Button>
//               )}

//               {invoice.trangThai > 1 && (
//                 <Button
//                   type="default"
//                   onClick={() => handleGoBack(invoice.trangThai)}
//                 >
//                   Quay lại trạng thái trước
//                 </Button>
//               )}

//               <Button
//                 type="primary"
//                 onClick={() => handleStatusChange(invoice.trangThai + 1)}
//                 disabled={priceNeedsConfirmation && invoice.trangThai === 1}
//               >
//                 {invoice.trangThai === 1
//                   ? "Xác nhận"
//                   : invoice.trangThai === 2
//                   ? "Chuẩn bị giao hàng"
//                   : invoice.trangThai === 3
//                   ? "Bắt đầu giao hàng"
//                   : invoice.trangThai === 4
//                   ? "Xác nhận hoàn thành"
//                   : ""}
//               </Button>

//               {invoice.trangThai !== 6 && (
//                 <Button type="default" onClick={() => handleStatusChange(6)}>
//                   Hủy đơn hàng
//                 </Button>
//               )}
//             </>
//           )}

//           <Button
//             type="default"
//             onClick={fetchOrderHistory}
//             icon={<HistoryOutlined />}
//           >
//             Xem lịch sử
//           </Button>
//         </div>
//       </div>

//       {/* Payment History - Moved right after stepper */}
//       <Card style={{ marginBottom: 24 }}>
//         <Title level={4}>Lịch sử thanh toán</Title>
//         {loadingPayments ? (
//           <div
//             style={{ display: "flex", justifyContent: "center", padding: 16 }}
//           >
//             <Spin />
//           </div>
//         ) : (
//           <Table
//             dataSource={paymentHistory}
//             columns={[
//               {
//                 title: "STT",
//                 dataIndex: "index",
//                 key: "index",
//                 align: "center",
//                 render: (text, record, index) => index + 1,
//               },
//               // {
//               //   title: "Mã giao dịch",
//               //   dataIndex: "index",
//               //   key: "index",
//               //   align: "center",
//               //   render: (text, record, index) => index + 1,
//               // },
//               {
//                 title: "Số tiền",
//                 dataIndex: "tongTien",
//                 key: "tongTien",
//                 align: "center",
//                 render: (text) => formatCurrency(text),
//               },
//               {
//                 title: "Phương thức",
//                 dataIndex: "tenPhuongThucThanhToan",
//                 key: "tenPhuongThucThanhToan",
//                 align: "center",
//               },
//               {
//                 title: "Thời gian",
//                 dataIndex: "ngayTao",
//                 key: "ngayTao",
//                 align: "center",
//                 render: (text) => formatDate(text),
//               },

//               {
//                 title: "Trạng thái",
//                 dataIndex: "trangThai",
//                 key: "trangThai",
//                 align: "center",
//                 render: (text) => (
//                   <Tag
//                     color={text === 1 ? "green" : text === 0 ? "orange" : "red"}
//                   >
//                     {text === 1
//                       ? "Đã thanh toán"
//                       : text === 2
//                       ? "Chờ thanh toán"
//                       : text === 3
//                       ? "Trả sau"
//                       : "---"}
//                   </Tag>
//                 ),
//               },
//               {
//                 title: "Ghi chú",
//                 dataIndex: "moTa",
//                 key: "moTa",
//                 align: "center",
//                 render: (text) => text || "---",
//               },
//               {
//                 title: "Nhân viên",
//                 dataIndex: "nhanVien",
//                 key: "nhanVien",
//                 align: "center",
//                 render: (text) => text || "---",
//               },
//             ]}
//             pagination={false}
//             rowKey="id"
//             locale={{ emptyText: "Chưa có lịch sử thanh toán" }}
//           />
//         )}
//       </Card>

//       {/* Rest of the content */}
//       <Card style={{ marginBottom: 24 }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 16,
//           }}
//         >
//           <Title level={4}>Thông tin đơn hàng: {invoice.maHoaDon}</Title>
//           <Button
//             type="primary"
//             icon={<EditOutlined />}
//             onClick={handleOpenEditRecipientDialog}
//             disabled={invoice.trangThai !== 1 || refreshing}
//           >
//             Chỉnh sửa thông tin đơn hàng
//           </Button>
//         </div>
//         <Divider />
//         <Row gutter={16}>
//           <Col span={12}>
//             <Text strong>Trạng thái:</Text>{" "}
//             <StatusChip status={invoice.trangThai} />
//           </Col>
//           <Col span={12}>
//             <Text strong>Loại:</Text> <TypeChip type={invoice.loaiHoaDon} />
//           </Col>
//           <Col span={12}>
//             <Text strong>Tên khách hàng:</Text> {recipientName || "---"}
//           </Col>
//           <Col span={12}>
//             <Text strong>Số điện thoại:</Text> {phoneNumber || "---"}
//           </Col>
//           <Col span={12}>
//             <Text strong>Địa chỉ:</Text> {formattedAddress || "---"}
//           </Col>
//           <Col span={12}>
//             <Text strong>Thời gian dự kiến nhận:</Text>
//             {invoice.trangThai == 2 || invoice.trangThai == 3
//               ? formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
//               : "---"}
//           </Col>
//           <Col span={12}>
//             <Text strong>Email:</Text> {invoice.emailNguoiNhan || "---"}
//           </Col>
//           <Col span={12}>
//             <Text strong>Ghi chú:</Text> {note || "---"}
//           </Col>
//         </Row>
//       </Card>

//       {/* Products Table */}
//       <Card>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 16,
//           }}
//         >
//           <Title level={4}>Thông tin sản phẩm đã mua</Title>
//           <Space>
//             {invoice.trangThai === 1 && (
//               <Button
//                 onClick={() => checkPriceChanges(true)}
//                 icon={<SyncOutlined />}
//                 danger={priceNeedsConfirmation}
//                 loading={loading && checkingPrice}
//                 disabled={loading && !checkingPrice}
//               >
//                 {priceNeedsConfirmation
//                   ? "Xác nhận thay đổi giá!"
//                   : "Kiểm tra thay đổi giá"}
//               </Button>
//             )}
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               onClick={() => setOpenAddProductDialog(true)}
//               disabled={invoice.trangThai !== 1 || refreshing}
//             >
//               Thêm sản phẩm
//             </Button>
//           </Space>
//           <ProductTable
//             products={products}
//             open={openAddProductDialog}
//             onClose={() => setOpenAddProductDialog(false)}
//             onAddProduct={handleAddProduct}
//             hoaDonId={invoice.id}
//           />
//         </div>
//         <Table
//           dataSource={invoiceProducts}
//           columns={[
//             {
//               title: "STT",
//               key: "index",
//               width: 60,
//               align: "center",
//               render: (_, __, index) => {
//                 return (
//                   pagination.pageSize * (pagination.current - 1) + index + 1
//                 );
//               },
//             },
//             {
//               title: "Hình ảnh",
//               dataIndex: "hinhAnh",
//               key: "hinhAnh",
//               align: "center",
//               width: 180,
//               render: (hinhAnh, record) => (
//                 <div style={{ width: 150, height: 120, overflow: "hidden" }}>
//                   {Array.isArray(hinhAnh) && hinhAnh.length > 0 ? (
//                     <Carousel autoplay dots={false} effect="fade">
//                       {hinhAnh.map((url, index) => (
//                         <div key={index}>
//                           <img
//                             src={url}
//                             alt={`${record.tenSanPham || "Sản phẩm"} ${
//                               index + 1
//                             }`}
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               objectFit: "cover",
//                               borderRadius: 5,
//                               display: "block",
//                             }}
//                             onError={(e) => {
//                               e.target.onerror = null;
//                               e.target.src =
//                                 "https://via.placeholder.com/150x120?text=No+Image";
//                             }}
//                           />
//                         </div>
//                       ))}
//                     </Carousel>
//                   ) : (
//                     <img
//                       src="https://via.placeholder.com/150x120?text=No+Image"
//                       alt="Không có ảnh"
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                         borderRadius: 5,
//                         display: "block",
//                       }}
//                     />
//                   )}
//                 </div>
//               ),
//             },
//             {
//               title: "Thông tin",
//               key: "thongTin",
//               align: "center",
//               width: 180,
//               render: (_, record) => (
//                 <Space direction="vertical" size={0}>
//                   <Typography.Text strong>{record.tenSanPham}</Typography.Text>
//                   <Typography.Text type="secondary">
//                     Mã: {record.maSanPhamChiTiet}
//                   </Typography.Text>
//                   <Typography.Text type="secondary">
//                     Chất liệu: {record.chatLieu || "---"}
//                   </Typography.Text>
//                   {record.danhMuc && (
//                     <Typography.Text type="secondary">
//                       Danh mục: {record.danhMuc}
//                     </Typography.Text>
//                   )}
//                   {record.thuongHieu && (
//                     <Typography.Text type="secondary">
//                       Thương hiệu: {record.thuongHieu}
//                     </Typography.Text>
//                   )}
//                 </Space>
//               ),
//             },
//             {
//               title: "Màu sắc",
//               key: "mauSac",
//               align: "center",
//               width: 180,
//               render: (_, record) => (
//                 <Space size="middle">
//                   <Typography.Text>{record.mauSac || "---"}</Typography.Text>
//                   <div
//                     style={{
//                       display: "inline-block",
//                       width: 50,
//                       height: 20,
//                       borderRadius: 6,
//                       backgroundColor: record.maMauSac || "#FFFFFF",
//                       border: "1px solid rgba(0, 0, 0, 0.2)",
//                       boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
//                     }}
//                   ></div>
//                 </Space>
//               ),
//             },
//             {
//               title: "Thiết kế",
//               key: "thietKe",
//               align: "center",
//               width: 180,
//               render: (_, record) => (
//                 <Space direction="vertical" size={0}>
//                   {record.kieuDang && (
//                     <Typography.Text>
//                       Kiểu dáng: {record.kieuDang}
//                     </Typography.Text>
//                   )}
//                   {record.kieuCoAo && (
//                     <Typography.Text>
//                       Kiểu cổ áo: {record.kieuCoAo}
//                     </Typography.Text>
//                   )}
//                   {record.kieuTayAo && (
//                     <Typography.Text>
//                       Kiểu tay áo: {record.kieuTayAo}
//                     </Typography.Text>
//                   )}
//                 </Space>
//               ),
//             },
//             {
//               title: "Kích thước",
//               key: "kichThuoc",
//               align: "center",
//               width: 100,
//               render: (_, record) => (
//                 <Typography.Text>{record.kichThuoc || "---"}</Typography.Text>
//               ),
//             },
//             // Thay đổi cột "Đơn giá" trong bảng sản phẩm:
//             {
//               title: "Đơn giá",
//               key: "gia",
//               width: 140,
//               align: "center",
//               render: (_, record) => (
//                 <div>
//                   {record.giaThayDoi ? (
//                     <>
//                       <Text delete type="secondary">
//                         {formatCurrency(record.giaTaiThoiDiemThem || 0)}
//                       </Text>
//                       <br />
//                       <Text type="danger" strong>
//                         {formatCurrency(record.giaHienTai || 0)}
//                         <Tooltip title="Giá đã thay đổi so với khi thêm vào đơn hàng">
//                           <Tag
//                             color={record.chenhLech > 0 ? "red" : "green"}
//                             style={{ marginLeft: 4 }}
//                           >
//                             {record.chenhLech > 0 ? "+" : "-"}
//                             {formatCurrency(Math.abs(record.chenhLech))}
//                           </Tag>
//                         </Tooltip>
//                       </Text>
//                     </>
//                   ) : (
//                     formatCurrency(record.gia || 0)
//                   )}
//                 </div>
//               ),
//             },
//             {
//               title: "Số lượng",
//               key: "soLuong",
//               width: 120,
//               align: "center",
//               render: (_, record) => (
//                 <InputNumber
//                   min={1}
//                   value={record.soLuong}
//                   onChange={(value) => handleUpdateQuantity(record.id, value)}
//                   disabled={invoice.trangThai !== 1 || record.giaThayDoi}
//                   style={{
//                     width: 80,
//                     backgroundColor: record.giaThayDoi ? "#f5f5f5" : undefined,
//                   }}
//                 />
//               ),
//             },
//             {
//               title: "Thành tiền",
//               key: "thanhTien",
//               width: 140,
//               align: "center",
//               render: (_, record) => {
//                 // Tính thành tiền dựa trên giá hiện tại
//                 const price = record.giaThayDoi
//                   ? record.gia || record.giaTaiThoiDiemThem || 0 // Sử dụng giá hiện tại nếu có thay đổi
//                   : record.gia || 0;
//                 return formatCurrency(price * record.soLuong);
//               },
//             },
//             {
//               title: "Hành động",
//               key: "action",
//               width: 80,
//               align: "center",
//               render: (_, record) => (
//                 <Button
//                   type="link"
//                   danger
//                   icon={<DeleteOutlined />}
//                   disabled={invoice.trangThai !== 1}
//                   onClick={() => {
//                     setDeletingProductId(record.id);
//                     setOpenConfirmDelete(true);
//                   }}
//                 />
//               ),
//             },
//           ]}
//           pagination={{
//             current: pagination.current,
//             pageSize: 3,
//             showSizeChanger: false,
//             total: invoiceProducts.length,
//             showTotal: (total) => `Tổng ${total} sản phẩm`,
//             size: "small",
//             position: ["bottomCenter"],
//             onChange: (page) => {
//               setPagination((prev) => ({ ...prev, current: page }));
//             },
//           }}
//           rowKey="id"
//           bordered
//           size="small"
//           style={{
//             marginTop: "10px",
//             borderRadius: "8px",
//             boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//           }}
//           scroll={{ y: "calc(100vh - 550px)" }}
//         />
//       </Card>

//       <Card style={{ marginTop: 24 }}>
//         <div style={{ maxWidth: 400, marginLeft: "auto", paddingRight: 16 }}>
//           <Space direction="vertical" size="middle" style={{ width: "100%" }}>
//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <Text strong>Tổng tiền hàng:</Text>
//               <Text>{formatCurrency(totalBeforeDiscount)}</Text>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Text strong>Phí vận chuyển:</Text>
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 {loadingShippingFee ? (
//                   <Spin size="small" style={{ marginRight: 8 }} />
//                 ) : (
//                   <Text>
//                     {shippingFeeFromGHN !== null
//                       ? formatCurrency(shippingFeeFromGHN)
//                       : formatCurrency(invoice?.phiVanChuyen || 0)}
//                   </Text>
//                 )}

//                 {invoice.loaiHoaDon === 3 && (
//                   <Button
//                     type="link"
//                     icon={<ReloadOutlined />}
//                     onClick={handleRecalculateShipping}
//                     style={{ marginLeft: 8 }}
//                     size="small"
//                     loading={loadingShippingFee}
//                   >
//                     Tính lại
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <Text strong>Voucher giảm giá:</Text>
//               <div>
//                 {invoice.phieuGiamGia ? (
//                   <Tag
//                     closable={invoice.trangThai === 1} // Chỉ cho phép xóa nếu trạng thái === 1
//                     onClose={
//                       invoice.trangThai === 1 ? handleRemoveVoucher : undefined
//                     }
//                     color="black"
//                   >
//                     {invoice.phieuGiamGia.maPhieuGiamGia}
//                   </Tag>
//                 ) : (
//                   <Button
//                     type="default"
//                     icon={<TagOutlined />}
//                     onClick={() => setOpenVoucherDialog(true)}
//                     disabled={invoice.trangThai !== 1}
//                   >
//                     Thêm
//                   </Button>
//                 )}
//               </div>
//             </div>
//             {invoice.phieuGiamGia && (
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <Text strong>Giảm giá:</Text>
//                 <Text type="danger">
//                   -{formatCurrency(getDiscountAmount())}
//                 </Text>
//               </div>
//             )}
//             <Divider />
//             {/* Hiển thị tóm tắt các phương thức thanh toán */}
//             {paymentHistory && paymentHistory.length > 0 && (
//               <>
//                 {paymentHistory.map((payment, index) => (
//                   <div
//                     key={index}
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Text>{payment.tenPhuongThucThanhToan}:</Text>
//                     <Text>{formatCurrency(payment.tongTien || 0)}</Text>
//                   </div>
//                 ))}
//                 <Divider style={{ margin: "8px 0" }} />
//               </>
//             )}
//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <Text strong>Tổng tiền thanh toán:</Text>
//               <Text type="danger" strong>
//                 {formatCurrency(
//                   // Ưu tiên sử dụng lịch sử thanh toán nếu có
//                   paymentHistory && paymentHistory.length > 0
//                     ? paymentHistory.reduce(
//                         (total, payment) => total + (payment.tongTien || 0),
//                         0
//                       )
//                     : // Nếu không có lịch sử thanh toán, sử dụng công thức:
//                       // Tổng tiền hàng + Phí vận chuyển - Giảm giá
//                       totalBeforeDiscount +
//                         (invoice.phiVanChuyen || 0) -
//                         getDiscountAmount()
//                 )}
//               </Text>
//             </div>
//           </Space>
//         </div>
//       </Card>

//       {/* Edit Recipient Dialog */}
//       <Modal
//         title="Chỉnh sửa thông tin người nhận"
//         open={openEditRecipientDialog}
//         onCancel={handleCloseEditRecipientDialog}
//         onOk={handleSaveRecipientInfo}
//         okText="Lưu"
//         cancelText="Hủy"
//         centered
//         width={600}
//         destroyOnClose={true}
//         okButtonProps={{
//           disabled:
//             !recipientName ||
//             (invoice?.loaiHoaDon === 3 && (!province || !district || !ward)),
//           loading: trackingAddressLoading,
//         }}
//       >
//         {trackingAddressLoading ? (
//           <div style={{ textAlign: "center", padding: "20px" }}>
//             <Spin tip="Đang tải thông tin địa chỉ..." />
//           </div>
//         ) : (
//           <Form layout="vertical">
//             <Form.Item
//               label="Tên người nhận"
//               required
//               validateStatus={recipientName ? "success" : "error"}
//             >
//               <Input
//                 value={recipientName}
//                 onChange={(e) => setRecipientName(e.target.value)}
//                 placeholder="Nhập tên người nhận"
//               />
//             </Form.Item>
//             <Form.Item label="Số điện thoại">
//               <Input
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 placeholder="Nhập số điện thoại"
//               />
//             </Form.Item>
//             <Form.Item label="Email">
//               <Input
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Nhập email (không bắt buộc)"
//               />
//             </Form.Item>

//             {invoice?.loaiHoaDon === 3 && (
//               <>
//                 <Form.Item
//                   label="Tỉnh/Thành phố"
//                   required
//                   validateStatus={province ? "success" : "error"}
//                 >
//                   <Select
//                     showSearch
//                     value={province}
//                     onChange={handleProvinceChange}
//                     placeholder="Chọn tỉnh/thành phố"
//                     optionFilterProp="children"
//                     filterOption={(input, option) =>
//                       (option?.label ?? "")
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     options={provinces}
//                     loading={!provinces.length}
//                     notFoundContent="Không tìm thấy dữ liệu"
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   label="Quận/Huyện"
//                   required
//                   validateStatus={district ? "success" : "error"}
//                 >
//                   <Select
//                     showSearch
//                     value={district}
//                     onChange={handleDistrictChange}
//                     placeholder="Chọn quận/huyện"
//                     optionFilterProp="children"
//                     filterOption={(input, option) =>
//                       (option?.label ?? "")
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     options={districts}
//                     loading={!districts.length && province}
//                     disabled={!province}
//                     notFoundContent="Hãy chọn tỉnh/thành phố trước"
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   label="Phường/Xã"
//                   required
//                   validateStatus={ward ? "success" : "error"}
//                 >
//                   <Select
//                     showSearch
//                     value={ward}
//                     onChange={handleWardChange}
//                     placeholder="Chọn phường/xã"
//                     optionFilterProp="children"
//                     filterOption={(input, option) =>
//                       (option?.label ?? "")
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     options={wards}
//                     loading={!wards.length && district}
//                     disabled={!district}
//                     notFoundContent="Hãy chọn quận/huyện trước"
//                   />
//                 </Form.Item>
//               </>
//             )}

//             <Form.Item label="Địa chỉ chi tiết">
//               <Input.TextArea
//                 value={detailAddress}
//                 onChange={(e) => setDetailAddress(e.target.value)}
//                 placeholder="Số nhà, tên đường, tổ/thôn/xóm..."
//                 rows={2}
//               />
//             </Form.Item>

//             {/* Thêm trường ghi chú */}
//             <Form.Item label="Ghi chú">
//               <Input.TextArea
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 placeholder="Nhập ghi chú cho đơn hàng..."
//                 rows={2}
//               />
//             </Form.Item>
//           </Form>
//         )}
//       </Modal>

//       {/* Dialog chọn voucher */}
//       <Modal
//         title="Chọn mã giảm giá"
//         visible={openVoucherDialog}
//         onCancel={() => setOpenVoucherDialog(false)}
//         onOk={handleApplyVoucher}
//         okText="Áp dụng"
//         cancelText="Hủy"
//         okButtonProps={{ disabled: !selectedVoucher }}
//         centered
//       >
//         <div style={{ marginBottom: 16 }}>
//           <Text type="secondary">
//             Gợi ý mã giảm giá tốt nhất cho đơn hàng của bạn:
//           </Text>
//         </div>
//         <List
//           dataSource={
//             totalBeforeDiscount > 0
//               ? sortVouchersBySavings(vouchers, totalBeforeDiscount)
//               : []
//           }
//           renderItem={(voucher, index) => {
//             const productTotal = totalBeforeDiscount || 0;
//             const discountAmount = calculateDiscountAmount(
//               voucher,
//               productTotal
//             );

//             // Prevent division by zero
//             const savings =
//               productTotal > 0
//                 ? ((discountAmount / productTotal) * 100).toFixed(1)
//                 : "0.0";

//             const maxDiscount = vouchers.reduce((max, v) => {
//               const vDiscount = calculateDiscountAmount(v, productTotal);
//               return Math.max(max, vDiscount);
//             }, 0);
//             const isHighestDiscount =
//               discountAmount === maxDiscount && discountAmount > 0;
//             const isSelected = selectedVoucher?.id === voucher.id;

//             return (
//               <List.Item
//                 style={{
//                   border: isSelected
//                     ? "2px solid #1890ff"
//                     : "1px solid #d9d9d9",
//                   borderRadius: "8px",
//                   padding: "16px",
//                   marginBottom: "8px",
//                   position: "relative",
//                   backgroundColor: isSelected ? "#f0f5ff" : "white",
//                 }}
//                 actions={[
//                   <Radio
//                     checked={isSelected}
//                     onChange={() => setSelectedVoucher(voucher)}
//                   />,
//                 ]}
//               >
//                 {isHighestDiscount && (
//                   <Tag
//                     color="gold"
//                     style={{
//                       position: "absolute",
//                       top: "-12px",
//                       right: "16px",
//                       padding: "4px 8px",
//                       zIndex: 1,
//                     }}
//                   >
//                     Tiết kiệm nhất
//                   </Tag>
//                 )}
//                 <List.Item.Meta
//                   title={
//                     <Space>
//                       <Text strong>{voucher.maPhieuGiamGia}</Text>
//                       <Text type="success">Tiết kiệm {savings}%</Text>
//                     </Space>
//                   }
//                   description={
//                     <div>
//                       <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
//                         Tên voucher: {voucher.tenPhieuGiamGia}
//                       </div>
//                       <div>
//                         {voucher.loaiPhieuGiamGia === 1
//                           ? `Giảm ${
//                               voucher.giaTriGiam
//                             }% (tối đa ${formatCurrency(
//                               voucher.soTienGiamToiDa
//                             )})`
//                           : `Giảm ${formatCurrency(voucher.giaTriGiam)}`}
//                       </div>
//                       <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
//                         Số tiền giảm: {formatCurrency(discountAmount)}
//                       </div>
//                       <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
//                         Đơn tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
//                       </div>
//                     </div>
//                   }
//                 />
//               </List.Item>
//             );
//           }}
//           locale={{
//             emptyText:
//               totalBeforeDiscount > 0
//                 ? "Không có mã giảm giá khả dụng"
//                 : "Không thể áp dụng mã giảm giá cho đơn hàng không có sản phẩm",
//           }}
//         />
//       </Modal>

//       {/* Add Confirmation Dialog */}
//       <Modal
//         title="Xác nhận thay đổi trạng thái"
//         visible={openConfirmDialog}
//         onCancel={() => setOpenConfirmDialog(false)}
//         onOk={handleConfirmStatusChange}
//         okText="Xác nhận"
//         cancelText="Hủy"
//         okButtonProps={{ disabled: confirmText.toLowerCase() !== "đồng ý" }}
//         centered
//       >
//         <Text>Vui lòng nhập "đồng ý" để xác nhận thay đổi trạng thái</Text>
//         <Input
//           value={confirmText}
//           onChange={(e) => setConfirmText(e.target.value)}
//           placeholder="đồng ý"
//         />
//       </Modal>

//       {/* Confirm Delete Dialog */}
//       <Modal
//         title="Xác nhận xóa"
//         visible={openConfirmDelete}
//         onCancel={() => setOpenConfirmDelete(false)}
//         onOk={handleConfirmDelete}
//         okText="Xóa"
//         cancelText="Hủy"
//         centered
//       >
//         <Text>Bạn có chắc chắn muốn xóa sản phẩm này?</Text>
//       </Modal>

//       {/* Order History Dialog */}
//       <Modal
//         visible={openHistoryDialog}
//         onCancel={() => setOpenHistoryDialog(false)}
//         footer={[
//           <Button key="close" onClick={() => setOpenHistoryDialog(false)}>
//             Đóng
//           </Button>,
//         ]}
//         width={1200}
//         centered
//       >
//         {loadingHistory ? (
//           <div
//             style={{ display: "flex", justifyContent: "center", padding: 16 }}
//           >
//             <Spin />
//           </div>
//         ) : (
//           <>
//             <Title level={5}>Lịch sử chuyển trạng thái</Title>
//             <Table
//               dataSource={orderHistory.filter(
//                 (record) =>
//                   record.moTa?.includes("Cập nhật trạng thái") ||
//                   record.hanhDong?.includes("Cập nhật trạng thái")
//               )}
//               columns={[
//                 {
//                   title: "STT",
//                   dataIndex: "index",
//                   key: "index",
//                   align: "center",
//                   render: (text, record, index) => index + 1,
//                   width: 50,
//                 },
//                 {
//                   title: "Thời gian",
//                   dataIndex: ["ngayTao", "ngaySua"],
//                   key: "ngayTaoOrNgaySua",
//                   align: "center",
//                   render: (text, record) => {
//                     const displayDate = record.ngayTao
//                       ? record.ngayTao
//                       : record.ngaySua;
//                     return formatDate(displayDate);
//                   },
//                   width: 180,

//                   sorter: (a, b) => new Date(a.ngayTao) - new Date(b.ngayTao),
//                 },
//                 {
//                   title: "Trạng thái",
//                   dataIndex: "trangThai",
//                   key: "trangThai",
//                   align: "center",
//                   render: (text) => (
//                     <Tag
//                       color={
//                         text === 1
//                           ? "orange"
//                           : text === 2
//                           ? "blue"
//                           : text === 3
//                           ? "cyan"
//                           : text === 4
//                           ? "purple"
//                           : text === 5
//                           ? "green"
//                           : text === 6
//                           ? "red"
//                           : "default"
//                       }
//                     >
//                       {getStatusText(text)}
//                     </Tag>
//                   ),
//                   width: 150,
//                   filters: [
//                     { text: "Chờ xác nhận", value: 1 },
//                     { text: "Đã xác nhận", value: 2 },
//                     { text: "Chờ giao hàng", value: 3 },
//                     { text: "Đang giao hàng", value: 4 },
//                     { text: "Hoàn thành", value: 5 },
//                     { text: "Đã hủy", value: 6 },
//                   ],
//                   onFilter: (value, record) => record.trangThai === value,
//                 },
//                 {
//                   title: "Mô tả",
//                   dataIndex: "moTa",
//                   key: "moTa",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 250,
//                 },
//                 {
//                   title: "Người xác nhận",
//                   dataIndex: "tenNhanVien",
//                   key: "tenNhanVien",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 180,
//                 },
//                 {
//                   title: "Ghi chú",
//                   dataIndex: "hanhDong",
//                   key: "hanhDong",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 250,
//                 },
//               ]}
//               pagination={{
//                 pageSize: 5,
//                 showSizeChanger: false,
//               }}
//               rowKey="id"
//               locale={{ emptyText: "Không có lịch sử trạng thái" }}
//               scroll={{ x: "max-content" }}
//             />

//             <Divider />

//             <Title level={5}>Lịch sử đơn hàng</Title>
//             <Table
//               dataSource={orderHistory.filter(
//                 (record) =>
//                   !(
//                     record.moTa?.includes("Cập nhật trạng thái") ||
//                     record.hanhDong?.includes("Cập nhật trạng thái")
//                   )
//               )}
//               columns={[
//                 {
//                   title: "STT",
//                   dataIndex: "index",
//                   key: "index",
//                   align: "center",
//                   render: (text, record, index) => index + 1,
//                   width: 50,
//                 },
//                 {
//                   title: "Thời gian",
//                   dataIndex: ["ngayTao", "ngaySua"],
//                   key: "ngayTaoOrNgaySua",
//                   align: "center",
//                   render: (text, record) => {
//                     const displayDate = record.ngayTao
//                       ? record.ngayTao
//                       : record.ngaySua;
//                     return formatDate(displayDate);
//                   },
//                   width: 180,

//                   sorter: (a, b) => new Date(a.ngayTao) - new Date(b.ngayTao),
//                 },
//                 {
//                   title: "Mô tả",
//                   dataIndex: "moTa",
//                   key: "moTa",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 300,
//                 },
//                 {
//                   title: "Người thực hiện",
//                   dataIndex: "tenNhanVien",
//                   key: "tenNhanVien",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 180,
//                 },
//                 {
//                   title: "Ghi chú",
//                   dataIndex: "hanhDong",
//                   key: "hanhDong",
//                   align: "center",
//                   render: (text) => text || "---",
//                   width: 300,
//                 },
//               ]}
//               pagination={{
//                 pageSize: 5,
//                 showSizeChanger: false,
//               }}
//               rowKey="id"
//               locale={{ emptyText: "Không có lịch sử thay đổi" }}
//               scroll={{ x: "max-content" }}
//             />
//           </>
//         )}
//       </Modal>

//       {/* Error Dialog */}
//       <Modal
//         title="Lỗi"
//         visible={errorDialogOpen}
//         onCancel={handleErrorDialogClose}
//         footer={[
//           <Button key="close" onClick={handleErrorDialogClose}>
//             Đóng
//           </Button>,
//         ]}
//         centered
//       >
//         <Text>{errorDialogMessage}</Text>
//       </Modal>

//       {/* Modal cảnh báo thay đổi giá */}
//       <Modal
//         title={
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div
//               style={{
//                 backgroundColor: "#fff2f0",
//                 padding: "8px",
//                 borderRadius: "50%",
//                 display: "inline-flex",
//                 marginRight: "12px",
//               }}
//             >
//               <WarningOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: "18px",
//                   fontWeight: "bold",
//                   marginBottom: "4px",
//                 }}
//               >
//                 Cảnh báo thay đổi giá sản phẩm
//               </div>
//               <div style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.65)" }}>
//                 Có {changedProducts.length} sản phẩm đã thay đổi giá so với khi
//                 thêm vào đơn hàng
//               </div>
//             </div>
//           </div>
//         }
//         open={openPriceChangeDialog}
//         onCancel={() => setOpenPriceChangeDialog(false)}
//         width={900}
//         bodyStyle={{ padding: "16px", maxHeight: "70vh", overflow: "auto" }}
//         centered
//         footer={
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               padding: "12px 0",
//             }}
//           >
//             <Checkbox
//               checked={updateAllPrices}
//               onChange={(e) => setUpdateAllPrices(e.target.checked)}
//             >
//               <Text strong>Áp dụng giá mới cho tất cả sản phẩm</Text>
//             </Checkbox>
//             <Space>
//               <Button
//                 danger
//                 icon={<CloseOutlined />}
//                 onClick={() => setOpenPriceChangeDialog(false)}
//               >
//                 Đóng
//               </Button>
//               <Button
//                 onClick={() => handleUpdateAllPrices(false)}
//                 style={{ margin: "0 8px" }}
//               >
//                 Giữ tất cả giá ban đầu
//               </Button>
//               <Button
//                 type="primary"
//                 icon={<SyncOutlined />}
//                 onClick={() => handleUpdateAllPrices(true)}
//               >
//                 Cập nhật tất cả giá mới
//               </Button>
//             </Space>
//           </div>
//         }
//       >
//         <List
//           itemLayout="horizontal"
//           dataSource={changedProducts}
//           renderItem={(product) => (
//             <Card
//               style={{
//                 marginBottom: 16,
//                 borderRadius: 8,
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//                 border: "1px solid #f0f0f0",
//               }}
//               bodyStyle={{ padding: 16 }}
//             >
//               <List.Item
//                 style={{ padding: 0 }}
//                 actions={[
//                   <Button
//                     key="keep-old-price"
//                     onClick={() => handleUpdateProductPrice(product.id, false)}
//                     style={{ width: 120 }}
//                   >
//                     Giữ giá cũ
//                   </Button>,
//                   <Button
//                     key="use-new-price"
//                     type="primary"
//                     onClick={() => handleUpdateProductPrice(product.id, true)}
//                     style={{ width: 120 }}
//                   >
//                     Dùng giá mới
//                   </Button>,
//                 ]}
//               >
//                 <List.Item.Meta
//                   avatar={
//                     <div
//                       style={{
//                         width: "80px",
//                         height: "80px",
//                         overflow: "hidden",
//                         borderRadius: "4px",
//                         marginRight: "16px",
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <img
//                         src={
//                           product.hinhAnh && product.hinhAnh.length > 0
//                             ? product.hinhAnh[0]
//                             : "https://via.placeholder.com/80x80?text=No+Image"
//                         }
//                         alt={product.tenSanPham}
//                         style={{
//                           width: "100%",
//                           height: "100%",
//                           objectFit: "cover",
//                         }}
//                       />
//                     </div>
//                   }
//                   title={
//                     <div
//                       style={{
//                         fontSize: "16px",
//                         fontWeight: "500",
//                         display: "flex",
//                         alignItems: "center",
//                       }}
//                     >
//                       <span>{product.tenSanPham}</span>
//                       <Text
//                         type="secondary"
//                         style={{ fontSize: "13px", marginLeft: "8px" }}
//                       >
//                         #{product.maSanPhamChiTiet || ""}
//                       </Text>
//                     </div>
//                   }
//                   description={
//                     <div>
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           marginBottom: "8px",
//                         }}
//                       >
//                         <div>
//                           <span style={{ color: "#666" }}>Màu: </span>
//                           <span>{product.mauSac || "---"}</span>
//                           {product.maMauSac && (
//                             <div
//                               style={{
//                                 display: "inline-block",
//                                 width: 16,
//                                 height: 16,
//                                 borderRadius: 4,
//                                 backgroundColor: product.maMauSac,
//                                 verticalAlign: "middle",
//                                 marginLeft: "5px",
//                                 border: "1px solid rgba(0, 0, 0, 0.1)",
//                               }}
//                             />
//                           )}
//                         </div>
//                         <Divider type="vertical" style={{ margin: "0 12px" }} />
//                         <div>
//                           <span style={{ color: "#666" }}>Kích thước: </span>
//                           <span>{product.kichThuoc || "---"}</span>
//                         </div>
//                         {product.chatLieu && (
//                           <>
//                             <Divider
//                               type="vertical"
//                               style={{ margin: "0 12px" }}
//                             />
//                             <div>
//                               <span style={{ color: "#666" }}>Chất liệu: </span>
//                               <span>{product.chatLieu}</span>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                       <div
//                         style={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           marginTop: "8px",
//                         }}
//                       >
//                         <div>
//                           <div style={{ marginBottom: "4px" }}>
//                             <Text
//                               delete
//                               type="secondary"
//                               style={{ fontSize: "14px" }}
//                             >
//                               Giá cũ:{" "}
//                               {formatCurrency(product.giaTaiThoiDiemThem)}
//                             </Text>
//                           </div>
//                           <div>
//                             <Text
//                               type="danger"
//                               strong
//                               style={{ fontSize: "16px" }}
//                             >
//                               Giá mới: {formatCurrency(product.giaHienTai)}
//                             </Text>
//                           </div>
//                         </div>
//                         <div style={{ textAlign: "right" }}>
//                           <Tag
//                             color={product.chenhLech > 0 ? "red" : "green"}
//                             style={{
//                               padding: "4px 8px",
//                               fontSize: "14px",
//                               fontWeight: "bold",
//                             }}
//                           >
//                             {product.chenhLech > 0
//                               ? `Tăng ${formatCurrency(
//                                   Math.abs(product.chenhLech)
//                                 )}`
//                               : `Giảm ${formatCurrency(
//                                   Math.abs(product.chenhLech)
//                                 )}`}
//                           </Tag>
//                           <div
//                             style={{
//                               fontSize: "13px",
//                               color: "#666",
//                               marginTop: "4px",
//                             }}
//                           >
//                             {product.chenhLech > 0
//                               ? `+${(
//                                   (Math.abs(product.chenhLech) /
//                                     product.giaTaiThoiDiemThem) *
//                                   100
//                                 ).toFixed(1)}%`
//                               : `-${(
//                                   (Math.abs(product.chenhLech) /
//                                     product.giaTaiThoiDiemThem) *
//                                   100
//                                 ).toFixed(1)}%`}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   }
//                 />
//               </List.Item>
//             </Card>
//           )}
//         />
//       </Modal>
//     </div>
//   );
// }
// export default InvoiceDetail;
