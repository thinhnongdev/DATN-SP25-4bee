import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
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
  InputNumber,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  HistoryOutlined,
  CloseOutlined,
  TagOutlined,
} from "@ant-design/icons";
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
  // { label: 'Đã hủy', status: 6 },
];
const getStatusText = (status) => {
  switch (status) {
    case 1:
      return "Chờ xác nhận";
    case 2:
      return "Đã xác nhận";
      case 3:
      return "Chờ giao hàng";
    case 4:
      return "Đang giao hàng";
    case 5:
      return "Hoàn thành đơn hàng";
    case 6:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

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

  const socket = useRef(null);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/hoa-don/${id}`);
      toast.success("Tải thông tin hóa đơn thành công");
      if (response.data) {
        console.log("📌 Dữ liệu hóa đơn từ API:", response.data);
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
      console.error("❌ Lỗi khi tải hóa đơn:", error);
      toast.error("Lỗi khi tải thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/admin/hoa-don/san-pham/all");
      const productsData = response.data;

      // Lấy hình ảnh từ API sản phẩm chi tiết
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.id}/hinhanh`
            );
            return {
              ...product,
              hinhAnh:
                imgResponse.data.length > 0 ? imgResponse.data[0].anhUrl : null,
            };
          } catch (error) {
            console.error("Lỗi khi lấy hình ảnh sản phẩm:", error);
            return { ...product, hinhAnh: null };
          }
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  const updateInvoiceTotal = async (updatedProducts) => {
    const newTotalBeforeDiscount =
      calculateTotalBeforeDiscount(updatedProducts);
    setTotalBeforeDiscount(newTotalBeforeDiscount);

    const totalWithShipping =
      newTotalBeforeDiscount + (invoice?.phiVanChuyen || 0);

    // Tìm voucher tốt nhất dựa trên tổng tiền mới
    const bestVoucher = findBestVoucher(vouchers, totalWithShipping);

    let finalTotal = totalWithShipping;
    let appliedVoucher = invoice.phieuGiamGia;

    if (!appliedVoucher && bestVoucher) {
      appliedVoucher = bestVoucher;
      toast.info(
        `Đã tự động áp dụng mã giảm giá ${bestVoucher.maPhieuGiamGia}`
      );
      await api.post(`/api/admin/hoa-don/${id}/voucher`, {
        voucherId: bestVoucher.id,
      });
    }

    if (appliedVoucher) {
      const discount = calculateDiscountAmount(
        appliedVoucher,
        totalWithShipping
      );
      finalTotal -= discount;
    }

    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      tongTien: finalTotal,
      phieuGiamGia: appliedVoucher,
    }));

    fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
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
      const response = await api.get(`/api/admin/hoa-don/${id}/san-pham`);
      const products = response.data;

      // Gọi API lấy hình ảnh cho từng sản phẩm
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          try {
            const imgResponse = await api.get(
              `/api/admin/sanphamchitiet/${product.sanPhamChiTietId}/hinhanh`
            );
            return {
              ...product,
              hinhAnh:
                imgResponse.data.length > 0 ? imgResponse.data[0].anhUrl : null,
            };
          } catch (error) {
            console.error("Lỗi khi lấy hình ảnh sản phẩm", error);
            return { ...product, hinhAnh: null };
          }
        })
      );
      setInvoiceProducts(productsWithImages);
      updateTotalBeforeDiscount(productsWithImages);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm trong hóa đơn");
    }
  };

  const fetchAvailableVouchers = async () => {
    if (!invoice || invoice.tongTien === undefined) {
      console.warn("Không thể tải voucher vì invoice chưa có dữ liệu");
      return;
    }

    try {
      const response = await api.get(
        `/api/admin/phieu-giam-gia/available?orderTotal=${invoice.tongTien}`
      );
      console.log("Danh sách voucher từ API:", response.data);
      setVouchers(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách mã giảm giá");
    }
  };

  useEffect(() => {
    if (openVoucherDialog) {
      fetchAvailableVouchers().then(() => {
        // Always suggest the best voucher
        const total = totalBeforeDiscount + (invoice?.phiVanChuyen || 0);
        const best = findBestVoucher(vouchers, total);
        setBestVoucher(best);
        setSelectedVoucher(best);

        if (best) {
          toast.info(`Đã tự động chọn mã giảm giá tốt nhất`);
        }
      });
    }
  }, [openVoucherDialog]);

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) {
      toast.error("Vui lòng chọn một mã giảm giá");
      return;
    }

    try {
      const response = await api.post(`/api/admin/hoa-don/${id}/voucher`, {
        voucherId: selectedVoucher.id,
      });

      const originalTotal =
        (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0);
      const discountAmount = calculateDiscountAmount(
        selectedVoucher,
        originalTotal
      );
      const newTotal = originalTotal - discountAmount;

      if (newTotal < 0) {
        toast.error("Tổng tiền sau giảm giá không hợp lệ!");
        return;
      }

      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        tongTien: newTotal,
        phieuGiamGia: selectedVoucher,
      }));

      setOpenVoucherDialog(false);
      setSelectedVoucher(null);
      toast.success(`Đã áp dụng mã giảm giá ${selectedVoucher.maPhieuGiamGia}`);
      fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
    } catch (error) {
      showErrorDialog(
        error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá"
      );
    }
  };

  const handleRemoveVoucher = async () => {
    if (!invoice.phieuGiamGia) {
      toast.error("Không có mã giảm giá để xóa");
      return;
    }

    try {
      await api.delete(`/api/admin/hoa-don/${id}/voucher`);

      const originalTotal =
        (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0);

      if (originalTotal <= 0) {
        toast.error("Tổng tiền sau khi xóa voucher không hợp lệ!");
        return;
      }

      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        tongTien: originalTotal,
        phieuGiamGia: null,
      }));

      toast.success("Đã xóa mã giảm giá");
      fetchPaymentHistory(); // Cập nhật lịch sử thanh toán ngay lập tức
    } catch (error) {
      showErrorDialog("Lỗi khi xóa mã giảm giá");
    }
  };

  const handleEditVoucher = async () => {
    try {
      const response = await api.put(
        `/api/admin/hoa-don/${id}/voucher/${invoice.phieuGiamGia.id}`,
        {
          voucherId: selectedVoucher.id,
        }
      );

      // Tính toán số tiền giảm
      const originalTotal =
        response.data.tongTienTruocGiam || response.data.tongTien;
      const discountedTotal = response.data.tongTien;
      const discountAmount = originalTotal - discountedTotal;

      toast.success(
        `Cập nhật mã giảm giá ${selectedVoucher.maPhieuGiamGia} - ` +
          `${
            selectedVoucher.loaiPhieuGiamGia === 1
              ? `${selectedVoucher.giaTriGiam}%`
              : formatCurrency(selectedVoucher.giaTriGiam)
          } ` +
          `(Giảm ${formatCurrency(discountAmount)})`,
        {
          autoClose: 5000,
        }
      );

      setEditVoucherDialog(false);
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        tongTien: response.data.tongTien,
        phieuGiamGia: selectedVoucher,
      }));
    } catch (error) {
      console.error("Error updating voucher:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật phiếu giảm giá";
      toast.error(errorMessage);
    }
  };

  const createFullAddress = () => {
    const parts = new Set();

    if (specificAddress?.trim()) {
      parts.add(specificAddress.trim());
    }
    if (selectedWard?.name) {
      parts.add(selectedWard.name);
    }
    if (selectedDistrict?.name) {
      parts.add(selectedDistrict.name);
    }
    if (selectedProvince?.name) {
      parts.add(selectedProvince.name);
    }

    return Array.from(parts).join(", ");
  };

  const handleSaveRecipientInfo = async () => {
    if (!province || !district || !ward) {
      toast.error(
        "Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã"
      );
      return;
    }

    if (!recipientName || !phoneNumber) {
      toast.error("Vui lòng nhập đầy đủ tên và số điện thoại người nhận");
      return;
    }

    const fullAddress = createFullAddress(); // ✅ Chỉ sử dụng `fullAddress`

    const updateData = {
      tenNguoiNhan: recipientName,
      soDienThoai: phoneNumber,
      phiVanChuyen: shippingFee,
      ghiChu: note,
      diaChi: fullAddress, // ✅ Chỉ gửi địa chỉ đầy đủ
    };

    try {
      console.log("📌 Sending update request:", updateData);

      const response = await api.put(`/api/admin/hoa-don/${id}`, updateData);

      if (response.data) {
        toast.success("Cập nhật thông tin đơn hàng thành công");

        // ✅ Cập nhật state ngay lập tức
        setInvoice(response.data);

        // ✅ Load lại dữ liệu từ server để đảm bảo tính nhất quán
        await fetchInvoice();

        setOpenEditRecipientDialog(false);
      }
    } catch (error) {
      console.error("❌ Error updating invoice:", error);
      toast.error("Lỗi khi cập nhật thông tin đơn hàng");
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách tỉnh");
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      setDistricts(response.data.districts);
      return response.data.districts; // ✅ Trả về danh sách quận/huyện
    } catch (error) {
      toast.error("Lỗi khi tải danh sách quận");
      return [];
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      setWards(response.data.wards);
      return response.data.wards; // ✅ Trả về danh sách phường/xã
    } catch (error) {
      toast.error("Lỗi khi tải danh sách xã");
      return [];
    }
  };

  const handleOpenEditRecipientDialog = () => {
    setOpenEditRecipientDialog(true);
  };

  const handleCloseEditRecipientDialog = () => {
    setOpenEditRecipientDialog(false);
  };

  const handleProvinceChange = async (value) => {
    const selected = provinces.find((p) => p.code === value);
    setSelectedProvince(selected);
    setProvince(value);
    setDistrict("");
    setWard("");
    setSelectedDistrict(null);
    setSelectedWard(null);
    if (value) {
      await fetchDistricts(value);
    }
  };

  const handleDistrictChange = async (value) => {
    const selected = districts.find((d) => d.code === value);
    setSelectedDistrict(selected);
    setDistrict(value);
    setWard("");
    setSelectedWard(null);
    if (value) {
      await fetchWards(value);
    }
  };

  const handleWardChange = (value) => {
    const selected = wards.find((w) => w.code === value);
    setSelectedWard(selected);
    setWard(value);
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      fetchDistricts(province);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [province]);

  useEffect(() => {
    if (district) {
      fetchWards(district);
    } else {
      setWards([]);
    }
  }, [district]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchProducts();
      fetchInvoiceProducts();
      fetchPaymentHistory();

      // Initialize WebSocket connection
      const socket = new SockJS("http://localhost:8080/ws");
      const stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          console.log("✅ Kết nối WebSocket thành công");

          // Lắng nghe sự kiện cập nhật hóa đơn
          stompClient.subscribe(`/topic/hoa-don/${id}`, (message) => {
            console.log("🔄 Nhận cập nhật hóa đơn:", message.body);
            fetchInvoice(); // Gọi API để cập nhật dữ liệu
            fetchInvoiceProducts(); // Cập nhật danh sách sản phẩm
          });

          // Lắng nghe sự kiện cập nhật sản phẩm trong hóa đơn
          stompClient.subscribe(`/topic/hoa-don-san-pham/${id}`, (message) => {
            console.log("🔄 Nhận cập nhật sản phẩm:", message.body);
            fetchInvoiceProducts(); // Gọi API để cập nhật danh sách sản phẩm
            fetchPaymentHistory(); // Cập nhật lịch sử thanh toán khi có sự kiện
          });
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
          console.error("STOMP error details:", frame.body);
        },
        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
        },
        onDisconnect: () => console.log("❌ WebSocket bị ngắt kết nối"),
      });

      stompClient.activate();

      return () => {
        stompClient.deactivate();
      };
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

  // Add useEffect for dialog open
  useEffect(() => {
    if (openEditRecipientDialog && invoice) {
      setRecipientName(invoice.tenNguoiNhan);
      setPhoneNumber(invoice.soDienThoai);
      setSpecificAddress(invoice.moTa || "");
      setNote(invoice.ghiChu);
      setShippingFee(invoice.phiVanChuyen);

      const loadLocations = async () => {
        if (provinces.length === 0) {
          await fetchProvinces();
        }

        if (invoice.tinh) {
          const foundProvince = provinces.find((p) => p.name === invoice.tinh);
          if (foundProvince) {
            setProvince(foundProvince.code);
            setSelectedProvince(foundProvince);

            const districtsData = await fetchDistricts(foundProvince.code);
            const foundDistrict = districtsData.find(
              (d) => d.name === invoice.huyen
            );
            if (foundDistrict) {
              setDistrict(foundDistrict.code);
              setSelectedDistrict(foundDistrict);

              const wardsData = await fetchWards(foundDistrict.code);
              const foundWard = wardsData.find((w) => w.name === invoice.xa);
              if (foundWard) {
                setWard(foundWard.code);
                setSelectedWard(foundWard);
              }
            }
          }
        }
      };

      loadLocations();
    }
  }, [openEditRecipientDialog, invoice, provinces]);

  const handleAddProduct = async (product, quantity) => {
    if (!product) {
      showErrorDialog("Vui lòng chọn sản phẩm");
      return;
    }

    try {
      const response = await api.post(`/api/admin/hoa-don/${id}/san-pham`, {
        sanPhamChiTietId: product.id,
        soLuong: quantity,
      });

      const newProduct = {
        ...response.data,
        tenSanPham: product.tenSanPham,
        maSanPham: product.maSanPham,
        hinhAnh: product.hinhAnh,
        gia: product.gia,
        soLuong: quantity,
        thanhTien: product.gia * quantity,
      };

      const updatedProducts = [...invoiceProducts, newProduct];

      setInvoiceProducts(updatedProducts);
      updateInvoiceTotal(updatedProducts);
      toast.success("Thêm sản phẩm thành công");
    } catch (error) {
      showErrorDialog("Lỗi khi thêm sản phẩm");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(
        `/api/admin/hoa-don/${id}/chi-tiet/${deletingProductId}`
      );
      toast.success("Xóa sản phẩm thành công");
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

  const getProductStatusText = (status) => {
    return status === true ? "Thành công" : "Không thành công";
  };

  const handleUpdateQuantity = async (hoaDonChiTietId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    try {
      const response = await api.put(
        `/api/admin/hoa-don/${id}/chi-tiet/${hoaDonChiTietId}/so-luong`,
        { soLuong: newQuantity }
      );

      // Cập nhật danh sách sản phẩm
      const updatedProducts = invoiceProducts.map((product) =>
        product.id === hoaDonChiTietId
          ? {
              ...product,
              soLuong: newQuantity,
              thanhTien: product.gia * newQuantity,
            }
          : product
      );

      setInvoiceProducts(updatedProducts);
      updateInvoiceTotal(updatedProducts); // Ensure the best voucher is applied to the database
      fetchPaymentHistory(); // Gọi lại API để lấy thông tin thanh toán mới
      toast.success("Cập nhật số lượng thành công");
    } catch (error) {
      showErrorDialog("Lỗi khi cập nhật số lượng");
    }
  };

  // const handleStatusChange = (newStatus) => {
  //   if (invoice.trangThai === 5) {
  //     showErrorDialog("Không thể thay đổi trạng thái của đơn hàng đã hủy");
  //     return;
  //   }
  //   setNextStatus(newStatus);
  //   setOpenConfirmDialog(true);
  //   setConfirmText("");
  // };
  const handleStatusChange = (newStatus) => {
    if (invoice.trangThai === 6) {
      showErrorDialog("Không thể thay đổi trạng thái của đơn hàng đã hủy");
      return;
    }
    setNextStatus(newStatus);

    if (newStatus === 6) {
      Modal.confirm({
        title: "Xác nhận hủy đơn hàng",
        content:
          "Bạn có chắc chắn muốn hủy đơn hàng này? Sản phẩm và mã giảm giá sẽ được hoàn lại.",
        okText: "Hủy đơn",
        cancelText: "Đóng",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await api.delete(`/api/admin/hoa-don/${id}`);
            toast.success("Đã hủy đơn hàng và hoàn lại sản phẩm, mã giảm giá.");
            fetchInvoice(); // Cập nhật giao diện
          } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            toast.error("Lỗi khi hủy đơn hàng!");
          }
        },
      });
    } else {
      setOpenConfirmDialog(true);
      setConfirmText("");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (confirmText.toLowerCase() !== "đồng ý") {
      showErrorDialog("Vui lòng nhập 'đồng ý' để xác nhận");
      return;
    }

    try {
      console.log("Updating status to:", nextStatus);

      // 1. Gọi API để cập nhật trạng thái hóa đơn
      const response = await api.patch(
        `/api/admin/hoa-don/${id}/status`,
        null,
        {
          params: { trangThai: nextStatus }, // Gửi trạng thái mới qua params
        }
      );
      // 2. Cập nhật state sau khi thành công
      setInvoice(response.data);
      toast.success("Cập nhật trạng thái thành công");
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error("Error updating status:", error); // Log lỗi chi tiết
      showErrorDialog(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    }
  };

  const handleGoBack = (currentStatus) => {
    if (currentStatus > 1) {
      // Only allow going back if not at first status
      setNextStatus(currentStatus - 1);
      setOpenConfirmDialog(true);
      setConfirmText("");
    }
  };

  // Add this function to fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      setLoadingPayments(true);
      const response = await api.get(`/api/thanh-toan-hoa-don/hoa-don/${id}`);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Lỗi khi tải lịch sử thanh toán");
    } finally {
      setLoadingPayments(false);
    }
  };

  // Add this new function to calculate discount amount
  const calculateDiscountAmount = (voucher, totalAmount) => {
    if (!voucher || !totalAmount) return 0;

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
    if (!vouchers || vouchers.length === 0) return null;

    return vouchers.reduce((best, current) => {
      if (totalAmount < current.giaTriToiThieu) return best;

      const currentDiscount = calculateDiscountAmount(current, totalAmount);
      const bestDiscount = best
        ? calculateDiscountAmount(best, totalAmount)
        : 0;

      return currentDiscount > bestDiscount ? current : best;
    }, null);
  };

  const fetchOrderHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/api/lich-su-hoa-don/hoa-don/${id}`);
      // Giả sử response.data là mảng các bản ghi có thuộc tính ngayTao
      const sortedHistory = response.data.sort(
        (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)
      );
      setOrderHistory(sortedHistory);
      setOpenHistoryDialog(true);
    } catch (error) {
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add helper functions
  const getProvinceName = (provinceCode) => {
    const province = provinces.find((p) => p.code === provinceCode);
    return province ? province.name : null; // Trả về null nếu không tìm thấy
  };

  const getDistrictName = (districtCode) => {
    const district = districts.find((d) => d.code === districtCode);
    return district ? district.name : null;
  };

  const getWardName = (wardCode) => {
    const ward = wards.find((w) => w.code === wardCode);
    return ward ? ward.name : null;
  };

  // Add formatFullAddress helper function
  const formatFullAddress = () => {
    if (!invoice || invoice.tenNguoiNhan === "Khách hàng lẻ") {
      return "Không có địa chỉ";
    }

    const parts = [];

    if (specificAddress?.trim()) parts.push(specificAddress.trim());
    if (selectedWard?.name && selectedWard.name !== "null")
      parts.push(selectedWard.name);
    if (selectedDistrict?.name && selectedDistrict.name !== "null")
      parts.push(selectedDistrict.name);
    if (selectedProvince?.name && selectedProvince.name !== "null")
      parts.push(selectedProvince.name);

    return parts.length > 0 ? parts.join(", ") : "Không có địa chỉ";
  };

  // Update handleSaveAddress function
  const handleSaveAddress = async () => {
    try {
      const fullAddress = formatFullAddress();

      const addressData = {
        maHoaDon: id,
        tenNguoiNhan: recipientName,
        soDienThoai: phoneNumber,
        diaChi: fullAddress,
        tinh: getProvinceName(province),
        huyen: getDistrictName(district),
        xa: getWardName(ward),
      };

      const response = await api.put(
        `/api/admin/hoa-don/${id}/dia-chi`,
        addressData
      );

      if (response.data) {
        setInvoice(response.data);
        toast.success("Cập nhật địa chỉ thành công");
        setOpenEditDialog(false);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Lỗi khi cập nhật địa chỉ");
    }
  };

  const renderTrangThai = (trangThai) => {
    switch (trangThai) {
      case 1:
        return "Thành công";
      case 0:
        return "Chờ xử lý";
      case -1:
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorDialogMessage("");
  };

  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  };

  useEffect(() => {
    // 1. Khởi tạo kết nối WebSocket
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ Kết nối WebSocket thành công");
        stompClient.subscribe(`/topic/hoa-don/${id}`, (message) => {
          fetchInvoice();
          fetchInvoiceProducts(); // Cập nhật danh sách sản phẩm
        });

        // 3. Lắng nghe sự kiện cập nhật sản phẩm trong hóa đơn
        stompClient.subscribe(`/topic/hoa-don-san-pham/${id}`, (message) => {
          console.log("🔄 Nhận cập nhật sản phẩm:", message.body);
          fetchInvoiceProducts(); // Gọi API để cập nhật danh sách sản phẩm
        });
      },
      onDisconnect: () => console.log("❌ WebSocket bị ngắt kết nối"),
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [id]);

  // Add new helper function to sort vouchers by potential savings
  const sortVouchersBySavings = (vouchers, totalAmount) => {
    return [...vouchers].sort((a, b) => {
      const savingsA = calculateDiscountAmount(a, totalAmount);
      const savingsB = calculateDiscountAmount(b, totalAmount);
      return savingsB - savingsA;
    });
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
            onClick={() => navigate("/hoa-don")}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}></div>
        <Steps
          current={steps.findIndex((step) => step.status === invoice.trangThai)}
        >
          {steps.map((step) => (
            <Step key={step.label} title={step.label} />
          ))}
        </Steps>
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
                onClick={() => handleStatusChange(invoice.trangThai + 1)}
              >
                {invoice.trangThai === 1
                  ? "Xác nhận"
                  : invoice.trangThai === 2
                  ? "Chuẩn bị giao hàng"
                  : invoice.trangThai === 3
                  ? "Bắt đầu giao hàng"
                  : invoice.trangThai === 4
                  ? "Xác nhận hoàn thành"
                  : ""}
              </Button>
              {invoice.trangThai !== 6 && (
                <Button type="default" onClick={() => handleStatusChange(6)}>
                  Hủy đơn hàng
                </Button>
              )}
            </>
          )}
          <Button
            type="default"
            onClick={fetchOrderHistory}
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
                dataIndex: "index",
                key: "index",
                align: "center",
                render: (text, record, index) => index + 1,
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
                render: (text) => (
                  <Tag
                    color={text === 1 ? "green" : text === 0 ? "orange" : "red"}
                  >
                    {text === 1
                      ? "Tiền mặt"
                      : text === 2
                      ? "Chuyển khoản"
                      : "Đang xử lý"}
                  </Tag>
                ),
              },
              {
                title: "Ghi chú",
                dataIndex: "moTa",
                key: "moTa",
                align: "center",
                render: (text) => text || "N/A",
              },
              {
                title: "Nhân viên",
                dataIndex: "nhanVien",
                key: "nhanVien",
                align: "center",
                render: (text) => text || "N/A",
              },
            ]}
            pagination={false}
            rowKey="id"
            locale={{ emptyText: "Chưa có lịch sử thanh toán" }}
          />
        )}
      </Card>

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
            <Text strong>Tên khách hàng:</Text> {recipientName}
          </Col>
          <Col span={12}>
            <Text strong>Số điện thoại:</Text> {phoneNumber}
          </Col>
          <Col span={12}>
            <Text strong>Địa chỉ:</Text> {formatFullAddress()}
          </Col>
          <Col span={12}>
            <Text strong>Thời gian dự kiến nhận:</Text>
            {invoice.trangThai >= 2
              ? formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
              : ""}
          </Col>
          <Col span={12}>
            <Text strong>Ghi chú:</Text> {note}
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenAddProductDialog(true)}
            disabled={invoice.trangThai !== 1 || refreshing}
          >
            Thêm sản phẩm
          </Button>
          <ProductTable
            products={products}
            open={openAddProductDialog}
            onClose={() => setOpenAddProductDialog(false)}
            onAddProduct={handleAddProduct}
            hoaDonId={invoice.id} //Truyền hoaDonId vào
          />
        </div>
        <Table
          dataSource={invoiceProducts}
          columns={[
            {
              title: "STT",
              dataIndex: "index",
              key: "index",
              align: "center",
              render: (text, record, index) => index + 1,
            },
            {
              title: "Hình ảnh",
              dataIndex: "hinhAnh",
              key: "hinhAnh",
              render: (text, record) => (
                <img
                  src={record.hinhAnh}
                  alt="Sản phẩm"
                  style={{ width: 50, height: 50 }}
                />
              ),
            },

            {
              title: "Thông tin sản phẩm",
              dataIndex: "tenSanPham",
              key: "tenSanPham",
              align: "center",
              render: (text, record) => (
                <div style={{ textAlign: "left" }}>
                  <Text>{text}</Text>
                  <br />
                  <Text type="secondary">Mã sản phẩm: {record.maSanPham}</Text>
                </div>
              ),
            },
            {
              title: "Đơn giá",
              dataIndex: "gia",
              key: "gia",
              align: "center",
              render: (text) => formatCurrency(text),
            },
            {
              title: "Số lượng",
              dataIndex: "soLuong",
              key: "soLuong",
              align: "center",
              render: (text, record) => (
                <InputNumber
                  min={1}
                  value={text}
                  onChange={(value) => handleUpdateQuantity(record.id, value)}
                  disabled={invoice.trangThai !== 1}
                />
              ),
            },
            {
              title: "Thành tiền",
              dataIndex: "thanhTien",
              key: "thanhTien",
              align: "center",
              render: (text) => formatCurrency(text),
            },
            {
              title: "Trạng thái",
              dataIndex: "trangThai",
              key: "trangThai",
              align: "center",
              render: (text) => getProductStatusText(text),
            },
            {
              title: "Hành động",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (text, record) => (
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  disabled={invoice.trangThai !== 1}
                  onClick={() => {
                    setDeletingProductId(record.id); // Lưu id của sản phẩm cần xóa
                    setOpenConfirmDelete(true); // Mở modal xác nhận
                  }}
                />
              ),
            },
          ]}
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Card style={{ marginTop: 24 }}>
        <div style={{ maxWidth: 400, marginLeft: "auto", paddingRight: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền hàng:</Text>
              <Text>{formatCurrency(totalBeforeDiscount)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Phí vận chuyển:</Text>
              <Text>{formatCurrency(invoice.phiVanChuyen)}</Text>
            </div>
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
            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền thanh toán:</Text>
              <Text type="danger" strong>
                {formatCurrency(invoice.tongTien)}
              </Text>
            </div>
          </Space>
        </div>
      </Card>

      {/* Edit Recipient Dialog */}
      <Modal
        title="Chỉnh sửa thông tin người nhận"
        visible={openEditRecipientDialog}
        onCancel={handleCloseEditRecipientDialog}
        onOk={handleSaveRecipientInfo}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form layout="vertical">
          <Form.Item label="Tên">
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Số điện thoại">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Tỉnh">
            <Select value={province || ""} onChange={handleProvinceChange}>
              {provinces.map((p) => (
                <Select.Option key={p.code} value={p.code}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Quận/Huyện">
            <Select
              value={district || ""}
              onChange={handleDistrictChange}
              disabled={!province}
            >
              {districts.map((d) => (
                <Select.Option key={d.code} value={d.code}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Phường/Xã">
            <Select
              value={ward || ""}
              onChange={handleWardChange}
              disabled={!district}
            >
              {wards.map((w) => (
                <Select.Option key={w.code} value={w.code}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Địa chỉ cụ thể">
            <Input
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Phí vận chuyển">
            <InputNumber
              value={shippingFee}
              onChange={(value) => setShippingFee(value)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Ghi chú">
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </Form.Item>
        </Form>
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
          dataSource={sortVouchersBySavings(
            vouchers,
            totalBeforeDiscount + invoice?.phiVanChuyen
          )}
          renderItem={(voucher, index) => {
            const originalTotal =
              (totalBeforeDiscount || 0) + (invoice?.phiVanChuyen || 0);
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
        title="Lịch sử trạng thái đơn hàng"
        visible={openHistoryDialog}
        onCancel={() => setOpenHistoryDialog(false)}
        footer={[
          <Button key="close" onClick={() => setOpenHistoryDialog(false)}>
            Đóng
          </Button>,
        ]}
        width={1200} // Tăng chiều rộng modal
        centered
      >
        {loadingHistory ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 16 }}
          >
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={orderHistory}
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
                title: "Trạng thái",
                dataIndex: "trangThai",
                key: "trangThai",
                align: "center",
                render: (text) => getStatusText(text),
                width: 150,
              },
              {
                title: "Mô tả",
                dataIndex: "moTa",
                key: "moTa",
                align: "center",
                width: 250, // Tăng chiều rộng cột để hiển thị mô tả rõ hơn
              },
              {
                title: "Ngày",
                dataIndex: "ngayTao",
                key: "ngayTao",
                align: "center",
                render: (text) => formatDate(text),
                width: 180, // Tăng chiều rộng cột ngày để tránh bị cắt
              },
              {
                title: "Người xác nhận",
                dataIndex: "nhanVien",
                key: "nhanVien",
                align: "center",
                width: 180,
              },
              {
                title: "Ghi chú",
                dataIndex: "hanhDong",
                key: "hanhDong",
                align: "center",
                width: 250,
              },
            ]}
            pagination={false}
            rowKey="id"
            locale={{ emptyText: "Không có lịch sử trạng thái" }}
            scroll={{ x: "max-content" }} // Cho phép cuộn ngang nếu nội dung quá lớn
          />
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
    </div>
  );
}
export default InvoiceDetail;
