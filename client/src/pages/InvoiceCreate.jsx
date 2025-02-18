import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/format";
import api from "../utils/api";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

function InvoiceCreate() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerInfo: {
      tenNguoiNhan: "",
      loaiHoaDon: "", // Thêm trường loại hóa đơn
      soDienThoai: "",
      emailNguoiNhan: "",
      diaChi: "",
      ghiChu: "",
      tongTien: "",
    },
    sanPhams: [], // Update to use sanPhams
    phuongThucThanhToans: [], // Thêm trường phương thức thanh toán
  });
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setPaymentMethodsLoading(true);
      try {
        const response = await api.get("/api/phuong-thuc-thanh-toan");
        console.log("Payment Methods from API:", response.data); // Log để kiểm tra dữ liệu
        setPaymentMethods(response.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi tải phương thức thanh toán"
        );
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/admin/hoa-don/san-pham/all");
        if (response.status === 200) {
          setProducts(response.data);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Lỗi khi tải danh sách sản phẩm";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/api/khach-hang");
        setCustomers(response.data);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách khách hàng");
      }
    };

    fetchCustomers();
  }, []);

  const handleNext = () => {
    let isValid = true;

    if (activeStep === 0) {
      isValid = validateCustomerInfo();
    } else if (activeStep === 1) {
      isValid = validateProducts();
    } else if (activeStep === 2) {
      isValid = validatePaymentMethod();
    }

    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin trước khi tiếp tục.");
      return;
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const validatePaymentMethod = () => {
    const { phuongThucThanhToans } = formData;
    let newErrors = {};

    if (phuongThucThanhToans.length === 0) {
      newErrors.phuongThucThanhToans = "Vui lòng chọn phương thức thanh toán";
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateProducts = () => {
    const { sanPhams } = formData;
    let newErrors = {};

    if (sanPhams.length === 0) {
      newErrors.sanPhams = "Vui lòng chọn ít nhất một sản phẩm";
    } else if (sanPhams.some((p) => p.quantity < 1)) {
      newErrors.sanPhams = "Số lượng sản phẩm phải lớn hơn 0";
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const validateCustomerInfo = () => {
    const { customerInfo } = formData;
    let newErrors = {};

    if (!customerInfo.tenNguoiNhan.trim()) {
      newErrors.tenNguoiNhan = "Tên người nhận không được để trống";
    }
    if (!customerInfo.loaiHoaDon) {
      newErrors.loaiHoaDon = "Loại hóa đơn không được để trống";
    }
    if (!customerInfo.soDienThoai.trim()) {
      newErrors.soDienThoai = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(customerInfo.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ";
    }
    if (
      customerInfo.emailNguoiNhan &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.emailNguoiNhan)
    ) {
      newErrors.emailNguoiNhan = "Email không hợp lệ";
    }
    if (!customerInfo.diaChi.trim()) {
      newErrors.diaChi = "Địa chỉ không được để trống";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateForm = () => {
    return (
      validateCustomerInfo() && validateProducts() && validatePaymentMethod()
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin trước khi gửi.");
      return;
    }

    try {
      setLoading(true);

      const invoicePayload = {
        ...formData.customerInfo,
        sanPhams: formData.sanPhams.map((p) => ({
          sanPhamId: p.id, // Ensure the correct field name is used
          soLuong: p.quantity,
        })),
        phuongThucThanhToans: formData.phuongThucThanhToans,
      };

      console.log("Payload gửi lên:", invoicePayload);

      const response = await api.post("/api/admin/hoa-don", invoicePayload);
      if (response.status === 201) {
        toast.success("Tạo hóa đơn thành công");
        navigate("/hoa-don");
      } else {
        toast.error("Lỗi khi tạo hóa đơn");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (event, value) => {
    if (value) {
      setSelectedCustomer(value);
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          tenNguoiNhan: value.tenKhachHang,
          soDienThoai: value.soDienThoai,
          emailNguoiNhan: value.email,
          diaChi: value.diaChi,
        },
      }));
    }
  };

  const handleNewCustomer = () => {
    setCustomerDialogOpen(true);
  };

  const handleCustomerDialogClose = () => {
    setCustomerDialogOpen(false);
  };

  const handleCustomerDialogSave = async () => {
    try {
      const response = await api.post("/api/khach-hang", {
        tenKhachHang: formData.customerInfo.tenNguoiNhan,
        soDienThoai: formData.customerInfo.soDienThoai,
        email: formData.customerInfo.emailNguoiNhan,
        diaChi: formData.customerInfo.diaChi,
        moTa: "Khách hàng lẻ",
      });
      setCustomers((prev) => [...prev, response.data]);
      setSelectedCustomer(response.data);
      setCustomerDialogOpen(false);
      toast.success("Tạo khách hàng mới thành công");
    } catch (error) {
      toast.error("Lỗi khi tạo khách hàng mới");
    }
  };

  const steps = [
    {
      label: "Thông tin khách hàng",
      content: (
        <CustomerInfoStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          customers={customers}
          selectedCustomer={selectedCustomer}
          handleCustomerSelect={handleCustomerSelect}
          handleNewCustomer={handleNewCustomer}
        />
      ),
    },
    {
      label: "Chọn sản phẩm",
      content: (
        <ProductSelectionStep
          formData={formData}
          setFormData={setFormData}
          products={products}
        />
      ),
    },
    {
      label: "Xác nhận",
      content: (
        <ConfirmationStep
          formData={formData}
          setFormData={setFormData}
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
        />
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton onClick={() => navigate("/hoa-don")} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Tạo hóa đơn mới</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {steps[activeStep] && steps[activeStep].content}

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={activeStep === steps.length - 1 ? <SaveIcon /> : null}
            >
              {activeStep === steps.length - 1 ? "Hoàn tất" : "Tiếp tục"}
            </Button>
          </Box>
        </Paper>
      </Box>
      <Dialog open={customerDialogOpen} onClose={handleCustomerDialogClose}>
        <DialogTitle>Tạo khách hàng mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên người nhận"
            value={formData.customerInfo.tenNguoiNhan}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerInfo: {
                  ...prev.customerInfo,
                  tenNguoiNhan: e.target.value,
                },
              }))
            }
            error={!!errors.tenNguoiNhan}
            helperText={errors.tenNguoiNhan}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            value={formData.customerInfo.soDienThoai}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerInfo: {
                  ...prev.customerInfo,
                  soDienThoai: e.target.value,
                },
              }))
            }
            error={!!errors.soDienThoai}
            helperText={errors.soDienThoai}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.customerInfo.emailNguoiNhan}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerInfo: {
                  ...prev.customerInfo,
                  emailNguoiNhan: e.target.value,
                },
              }))
            }
            error={!!errors.emailNguoiNhan}
            helperText={errors.emailNguoiNhan}
          />
          <TextField
            fullWidth
            label="Địa chỉ"
            value={formData.customerInfo.diaChi}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customerInfo: {
                  ...prev.customerInfo,
                  diaChi: e.target.value,
                },
              }))
            }
            error={!!errors.diaChi}
            helperText={errors.diaChi}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomerDialogClose}>Hủy</Button>
          <Button onClick={handleCustomerDialogSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function CustomerInfoStep({
  formData,
  setFormData,
  errors,
  customers,
  selectedCustomer,
  handleCustomerSelect,
  handleNewCustomer,
}) {
  const handleChange =
    (field, parent = "customerInfo") =>
    (e) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      }));
    };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => option.tenKhachHang}
          value={selectedCustomer}
          onChange={handleCustomerSelect}
          renderInput={(params) => (
            <TextField {...params} label="Chọn khách hàng" fullWidth />
          )}
        />
        <Button onClick={handleNewCustomer} variant="contained" sx={{ mt: 2 }}>
          Tạo khách hàng mới
        </Button>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.loaiHoaDon}>
          <InputLabel>Loại hóa đơn</InputLabel>
          <Select
            value={formData.customerInfo.loaiHoaDon}
            onChange={handleChange("loaiHoaDon")}
            label="Loại hóa đơn"
          >
            <MenuItem value={1}>Online</MenuItem>
            <MenuItem value={2}>Tại quầy</MenuItem>
          </Select>
          {errors.loaiHoaDon && (
            <Typography variant="caption" color="error">
              {errors.loaiHoaDon}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tên người nhận"
          value={formData.customerInfo.tenNguoiNhan}
          onChange={handleChange("tenNguoiNhan")}
          error={!!errors.tenNguoiNhan}
          helperText={errors.tenNguoiNhan}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Số điện thoại"
          value={formData.customerInfo.soDienThoai}
          onChange={handleChange("soDienThoai")}
          error={!!errors.soDienThoai}
          helperText={errors.soDienThoai}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.customerInfo.emailNguoiNhan}
          onChange={handleChange("emailNguoiNhan")}
          error={!!errors.emailNguoiNhan}
          helperText={errors.emailNguoiNhan}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Địa chỉ"
          value={formData.customerInfo.diaChi}
          onChange={handleChange("diaChi")}
          error={!!errors.diaChi}
          helperText={errors.diaChi}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Ghi chú"
          multiline
          rows={4}
          value={formData.customerInfo.ghiChu}
          onChange={handleChange("ghiChu")}
        />
      </Grid>
    </Grid>
  );
}

function ProductSelectionStep({ formData, setFormData, products }) {
  const handleAddProduct = (product) => {
    if (!formData.sanPhams.some((p) => p.id === product.id)) {
      setFormData((prev) => ({
        ...prev,
        sanPhams: [...prev.sanPhams, { ...product, quantity: 1 }],
      }));
    } else {
      toast.error("Sản phẩm đã tồn tại trong hóa đơn");
    }
  };

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      sanPhams: prev.sanPhams.filter((p) => p.id !== productId),
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setFormData((prev) => ({
      ...prev,
      sanPhams: prev.sanPhams.map((p) =>
        p.id === productId ? { ...p, quantity: Math.max(1, newQuantity) } : p
      ),
    }));
  };

  return (
    <Box>
      <Autocomplete
        options={products}
        getOptionLabel={(option) =>
          `${option.tenSanPham} - ${formatCurrency(option.gia)}`
        }
        onChange={(_, newValue) => newValue && handleAddProduct(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Tìm sản phẩm" fullWidth />
        )}
      />
      <TableContainer sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell align="right">Đơn giá</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="right">Thành tiền</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.sanPhams.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.tenSanPham}</TableCell>
                <TableCell align="right">
                  {formatCurrency(product.gia)}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity - 1)
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography>{product.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity + 1)
                      }
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(product.gia * product.quantity)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function ConfirmationStep({
  formData,
  setFormData,
  paymentMethods,
  paymentMethodsLoading,
}) {
  const subtotal = formData.sanPhams.reduce(
    (sum, p) => sum + p.gia * p.quantity,
    0
  );

  const handlePaymentMethodChange = (event) => {
    const selectedId = event.target.value;
    console.log("Selected ID:", selectedId);

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

      console.log("New Payment Method Object:", newPaymentMethod);

      setFormData((prev) => {
        const newFormData = {
          ...prev,
          phuongThucThanhToans: [newPaymentMethod],
        };
        console.log("Updated FormData:", newFormData);
        return newFormData;
      });
    } else {
      console.error("Payment method not found for ID:", selectedId);
      console.log("Available payment methods:", paymentMethods);
      toast.error("Phương thức thanh toán không hợp lệ!");
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin người nhận
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>
                <strong>Tên:</strong> {formData.customerInfo.tenNguoiNhan}
              </Typography>
              <Typography>
                <strong>SĐT:</strong> {formData.customerInfo.soDienThoai}
              </Typography>
              <Typography>
                <strong>Email:</strong> {formData.customerInfo.emailNguoiNhan}
              </Typography>
              <Typography>
                <strong>Địa chỉ:</strong> {formData.customerInfo.diaChi}
              </Typography>
              {formData.customerInfo.ghiChu && (
                <Typography>
                  <strong>Ghi chú:</strong> {formData.customerInfo.ghiChu}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thanh toán
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>
                <strong>Tổng tiền hàng:</strong> {formatCurrency(subtotal)}
              </Typography>
              <FormControl fullWidth sx={{ mt: 3 }} required>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={
                    formData.phuongThucThanhToans[0]?.maPhuongThucThanhToan ||
                    ""
                  }
                  onChange={handlePaymentMethodChange}
                  label="Phương thức thanh toán"
                  required
                >
                  {paymentMethods.map((method) => (
                    <MenuItem
                      key={method.id}
                      value={method.maPhuongThucThanhToan}
                    >
                      {method.tenPhuongThucThanhToan}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default InvoiceCreate;
