package com.example.server.service.BanHang.impl;

import com.example.server.dto.HoaDon.request.*;
import com.example.server.dto.HoaDon.response.DiaChiResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.HoaDon;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.interfaces.IHoaDonMapper;

import com.example.server.repository.HoaDon.*;
import com.example.server.repository.NhanVien_KhachHang.DiaChiRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.GiaoHang.AddressCache;
import com.example.server.service.HoaDon.impl.HoaDonSanPhamServiceImpl;
import com.example.server.service.HoaDon.impl.HoaDonServiceImpl;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import com.example.server.service.HoaDon.impl.PhieuGiamGiaHoaDonServiceImpl;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;

import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import com.example.server.service.HoaDon.interfaces.IPaymentProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.cglib.core.Local;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.stereotype.Service;

import com.example.server.constant.HoaDonConstant;
import com.example.server.constant.PaymentConstant;

import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BanHangServiceImpl implements BanHangService {
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;

    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;

    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    private final IHoaDonMapper hoaDonMapper;

    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    private final LichSuHoaDonRepository lichSuHoaDonRepository;

    private final IPaymentProcessorService paymentProcessorService;

    private final AddressCache addressCache;

    private final ICurrentUserService currentUserService;
    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private IHoaDonService hoaDonService;
    @Autowired
    private PhieuGiamGiaHoaDonServiceImpl phieuGiamGiaHoaDonServiceImpl;
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    NhanVienRepository nhanVienRepository;
    @Autowired
    private DiaChiRepository diaChiRepository;
    @Autowired
    private LichSuHoaDonService lichSuHoaDonService;

    private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    @Autowired
    private HoaDonSanPhamServiceImpl hoaDonSanPhamServiceImpl;

    @Override
    public List<HoaDon> getHoaDonTaiQuay() {
        return hoaDonRepository.getHoaDonTheoLoai();
    }

    public String createVnpayPaymentUrl(long amount, String orderCode, String returnUrl) {
        String vnp_TmnCode = "ECH7JJON";
        String vnp_HashSecret = "ZBMD9TMWMBVQPP083XUU0X2NOJWA6685";
        String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderCode);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // Sort params by key
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        // Build hashData and query string
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);

            // hashData: giữ nguyên, không encode
            hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

            // query: encode giá trị
            query.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

            if (i < fieldNames.size() - 1) {
                hashData.append('&');
                query.append('&');
            }
        }

        // Generate HMAC SHA512 signature
        String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        return vnp_Url + "?" + query.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error while generating HMAC SHA512", e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1)
                hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Override
    @Transactional
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        log.info("Creating new invoice with request: {}", request);

        // 1. Khởi tạo hóa đơn mới
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(UUID.randomUUID().toString().substring(0, 8));
        hoaDon.setMaHoaDon(generateMaHoaDon());
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
        hoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());

        // 2. Xác định loại hóa đơn (mặc định là tại quầy)
        Integer loaiHoaDon = request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : 2;
        hoaDon.setLoaiHoaDon(loaiHoaDon);

        // 3. Kiểm tra khách hàng
        if (request.getIdKhachHang() == null) {
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(request.getSoDienThoai());
            hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());
        } else {
            KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

            hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
            hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
            hoaDon.setEmailNguoiNhan(khachHang.getEmail());

            // 4. Nếu là giao hàng, kiểm tra địa chỉ
            if (loaiHoaDon == 3) {
                DiaChi diaChi = diaChiRepository.findById(request.getDiaChiId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));

                hoaDon.setDiaChi(
                        diaChi.getDiaChiCuThe() + ", " + diaChi.getXa() + ", " + diaChi.getHuyen() + ", "
                                + diaChi.getTinh());
            }
        }

        // 5. Lưu hóa đơn vào database
        hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());

        // 6. Lưu lịch sử hóa đơn
        LichSuHoaDonRequest lichSuRequest = new LichSuHoaDonRequest();
        lichSuRequest.setHoaDonId(hoaDon.getId());
        lichSuRequest.setThoiGian(LocalDateTime.now());
        lichSuRequest.setTrangThai(1);
        lichSuRequest.setGhiChu("Tạo hóa đơn mới");
        lichSuHoaDonService.saveLichSuHoaDon(lichSuRequest);

        // 7. Kiểm tra tổng tiền thanh toán (nếu có)
        if (request.getThanhToans() != null && !request.getThanhToans().isEmpty()) {
            BigDecimal tongTienThanhToan = request.getThanhToans().stream()
                    .map(ThanhToanRequest::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (tongTienThanhToan.compareTo(hoaDon.getTongTien()) != 0) {
                throw new IllegalArgumentException("Tổng tiền thanh toán không khớp với tổng tiền hóa đơn.");
            }

            List<ThanhToanHoaDon> thanhToanList = new ArrayList<>();

            for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
                PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                        .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
                        .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: "
                                + thanhToanRequest.getMaPhuongThucThanhToan()));

                ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
                thanhToanHoaDon.setHoaDon(hoaDon);
                thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
                thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());
                thanhToanHoaDon.setNgayTao(LocalDateTime.now());

                // Xác định trạng thái dựa trên loại hóa đơn và phương thức
                if (loaiHoaDon == 3 && phuongThuc.getId().equals(PaymentConstant.PAYMENT_METHOD_COD)) {
                    // Nếu là đơn giao hàng và thanh toán COD
                    thanhToanHoaDon.setTrangThai(PaymentConstant.PAYMENT_STATUS_COD);
                } else if (phuongThuc.getId().equals(PaymentConstant.PAYMENT_METHOD_CASH)) {
                    // Nếu thanh toán tiền mặt tại quầy
                    thanhToanHoaDon.setTrangThai(PaymentConstant.PAYMENT_STATUS_PAID);
                } else if (phuongThuc.getId().equals(PaymentConstant.PAYMENT_METHOD_BANK)) {
                    // Nếu chuyển khoản, cần xác nhận sau
                    thanhToanHoaDon.setTrangThai(PaymentConstant.PAYMENT_STATUS_UNPAID);
                }

                thanhToanHoaDon.setMoTa(phuongThuc.getMoTa());
                thanhToanHoaDon.setNgayTao(LocalDateTime.now());

                thanhToanList.add(thanhToanHoaDon);
            }

            // 8. Lưu thông tin thanh toán vào database
            thanhToanHoaDonRepository.saveAll(thanhToanList);
            hoaDon.setThanhToanHoaDons(thanhToanList);
        }

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    // Update loại hóa đơn
    @Override
    @Transactional
    public void updateLoaiHoaDon(String hoaDonId, Integer loaiHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại: " + hoaDonId));

        // Capture recipient info before updating
        String currentTenNguoiNhan = hoaDon.getTenNguoiNhan();
        String currentSoDienThoai = hoaDon.getSoDienThoai();

        // Log current values for debugging
        log.info("Cập nhật loại hóa đơn: ID={}, từ loại {} sang {}. Thông tin hiện tại: Người nhận={}, SĐT={}",
                hoaDonId, hoaDon.getLoaiHoaDon(), loaiHoaDon, currentTenNguoiNhan, currentSoDienThoai);

        // Update order type
        hoaDon.setLoaiHoaDon(loaiHoaDon);

        // If switching to delivery mode, ensure recipient info is preserved
        if (loaiHoaDon == 3) {
            // Ensure there's always a recipient name
            if (StringUtils.isEmpty(hoaDon.getTenNguoiNhan()) && !StringUtils.isEmpty(currentTenNguoiNhan)) {
                hoaDon.setTenNguoiNhan(currentTenNguoiNhan);
                log.info("Giữ lại tên người nhận: {}", currentTenNguoiNhan);
            }

            // Ensure there's always a phone number
            if (StringUtils.isEmpty(hoaDon.getSoDienThoai()) && !StringUtils.isEmpty(currentSoDienThoai)) {
                hoaDon.setSoDienThoai(currentSoDienThoai);
                log.info("Giữ lại số điện thoại: {}", currentSoDienThoai);
            }

            // If there's a customer but no recipient info, use customer info
            if (hoaDon.getKhachHang() != null) {
                if (StringUtils.isEmpty(hoaDon.getTenNguoiNhan())) {
                    hoaDon.setTenNguoiNhan(hoaDon.getKhachHang().getTenKhachHang());
                    log.info("Sử dụng tên khách hàng làm người nhận: {}", hoaDon.getKhachHang().getTenKhachHang());
                }

                if (StringUtils.isEmpty(hoaDon.getSoDienThoai())) {
                    hoaDon.setSoDienThoai(hoaDon.getKhachHang().getSoDienThoai());
                    log.info("Sử dụng SĐT khách hàng làm SĐT liên hệ: {}", hoaDon.getKhachHang().getSoDienThoai());
                }
            }
        }

        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Đã cập nhật loại hóa đơn thành công: ID={}, loại={}, người nhận={}, SĐT={}",
                savedHoaDon.getId(), savedHoaDon.getLoaiHoaDon(), savedHoaDon.getTenNguoiNhan(), savedHoaDon.getSoDienThoai());

        // Create history record
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Thay đổi loại hóa đơn");
        lichSuHoaDon.setMoTa("Đổi sang " + (loaiHoaDon == 3 ? "Giao hàng" : "Mua tại quầy"));
        lichSuHoaDon.setTrangThai(hoaDon.getTrangThai());
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSuHoaDon);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse addProduct(String hoaDonId, AddProductRequest request) {
        log.info("Adding multiple products to invoice using multithreading: hoaDonId={}", hoaDonId);

        // Tìm hóa đơn cần cập nhật
        HoaDon hoaDon = hoaDonRepository.findHoaDonForUpdate(hoaDonId);
        List<AddProductRequest> productRequests = (request.getProductList() != null) ? request.getProductList()
                : Collections.singletonList(request);

        // Sử dụng Concurrent Collections để tránh lỗi khi cập nhật song song
        List<SanPhamChiTiet> sanPhamCapNhat = Collections.synchronizedList(new ArrayList<>());
        List<HoaDonChiTiet> hoaDonChiTietCapNhat = Collections.synchronizedList(new ArrayList<>());
        // Sử dụng ExecutorService để xử lý đa luồng
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        List<Callable<Void>> tasks = new ArrayList<>();

        for (AddProductRequest productRequest : productRequests) {
            tasks.add(() -> {
                processProduct(hoaDon, productRequest, sanPhamCapNhat, hoaDonChiTietCapNhat);
                return null;
            });
        }

        try {
            // Thực thi tất cả tasks song song
            executorService.invokeAll(tasks);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lỗi khi xử lý đa luồng", e);
        } finally {
            executorService.shutdown();
        }

        // Batch cập nhật vào database sau khi hoàn tất xử lý song song
        sanPhamChiTietHoaDonRepository.saveAll(sanPhamCapNhat);
        hoaDonChiTietRepository.saveAll(hoaDonChiTietCapNhat);
        hoaDonRepository.saveAndFlush(hoaDon);

        // Cập nhật tổng tiền hóa đơn
        updateHoaDonTotal(hoaDon);
        // Lưu hóa đơn sau khi cập nhật tổng tiền
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn sau khi thêm sản phẩm: {}", hoaDon.getTongTien());

        // Tạo mô tả chi tiết cho lịch sử hóa đơn
        StringBuilder moTa = new StringBuilder("Đã thêm sản phẩm: ");

        // Sử dụng biến productRequests đã định nghĩa ở trên thay vì khai báo lại
        for (int i = 0; i < productRequests.size(); i++) {
            if (i > 0)
                moTa.append(", ");
            SanPhamChiTiet sp = sanPhamChiTietHoaDonRepository
                    .findById(productRequests.get(i).getSanPhamChiTietId())
                    .orElse(null);
            if (sp != null) {
                moTa.append(sp.getSanPham().getTenSanPham())
                        .append(" (")
                        .append(productRequests.get(i).getSoLuong())
                        .append(")");

                // Giới hạn độ dài mô tả nếu có nhiều sản phẩm
                if (moTa.length() > 200 && i < productRequests.size() - 1) {
                    moTa.append("... và ")
                            .append(productRequests.size() - i - 1)
                            .append(" sản phẩm khác");
                    break;
                }
            }
        }

        // Tạo lịch sử
        createLichSuHoaDon(savedHoaDon, "Thêm sản phẩm", moTa.toString());
        return hoaDonMapper.entityToResponse(savedHoaDon);
    }

    private synchronized void processProduct(HoaDon hoaDon, AddProductRequest productRequest,
                                             List<SanPhamChiTiet> sanPhamCapNhat,
                                             List<HoaDonChiTiet> hoaDonChiTietCapNhat) {
        log.info("Processing product: {} for invoice: {}", productRequest.getSanPhamChiTietId(), hoaDon.getId());

        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                .findBySanPhamIdAndTrangThai(productRequest.getSanPhamChiTietId(), true)
                .orElseThrow(() -> new ValidationException("Sản phẩm không hợp lệ"));

        if (sanPhamChiTiet.getSoLuong() < productRequest.getSoLuong()) {
            throw new ValidationException("Không đủ hàng trong kho");
        }

        // Cập nhật số lượng tồn kho
        synchronized (sanPhamChiTiet) {
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - productRequest.getSoLuong());
            sanPhamCapNhat.add(sanPhamChiTiet);
        }

        // Kiểm tra sản phẩm đã có trong hóa đơn chưa
        HoaDonChiTiet chiTiet;
        synchronized (hoaDon) {
            chiTiet = hoaDonChiTietRepository
                    .findByHoaDonAndSanPhamChiTiet(hoaDon.getId(), sanPhamChiTiet.getId())
                    .orElse(null);
        }

        if (chiTiet != null) {
            synchronized (chiTiet) {
                chiTiet.setSoLuong(chiTiet.getSoLuong() + productRequest.getSoLuong());
            }
            hoaDonChiTietCapNhat.add(chiTiet); // 🛠 Đảm bảo cập nhật vào DB
        } else {
            chiTiet = HoaDonChiTiet.builder()
                    .id(UUID.randomUUID().toString())
                    .hoaDon(hoaDon)
                    .sanPhamChiTiet(sanPhamChiTiet)
                    .soLuong(productRequest.getSoLuong())
                    .trangThai(1)
                    .build();
            hoaDonChiTietCapNhat.add(chiTiet);
        }

    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized void updateHoaDonTotal(HoaDon hoaDon) {
        log.debug("Cập nhật tổng tiền hóa đơn: {}", hoaDon.getId());
        recalculateTotal(hoaDon);
        hoaDonRepository.saveAndFlush(hoaDon);
    }

    @Override
    @Transactional
    public HoaDonResponse completeOrder(String hoaDonId, HoaDonRequest request) {
        log.info("Hoàn tất hóa đơn với ID: {}", hoaDonId);

        // 1. Lấy thông tin hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        BigDecimal tongTienHoaDon = hoaDon.getTongTien();
        LocalDateTime thoiGianHoanThanh = LocalDateTime.now();

        // 2. Xác định loại hóa đơn và trạng thái cuối cùng
        Integer loaiHoaDon = hoaDon.getLoaiHoaDon();
        Integer trangThaiCuoiCung = (loaiHoaDon == 3) ? HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG
                : HoaDonConstant.TRANG_THAI_HOAN_THANH;

        // 3. Kiểm tra và xử lý thanh toán
        if (request.getThanhToans() != null && !request.getThanhToans().isEmpty()) {
            BigDecimal tongTienThanhToan = request.getThanhToans().stream()
                    .map(ThanhToanRequest::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Kiểm tra tổng tiền thanh toán
            if (tongTienThanhToan.compareTo(tongTienHoaDon) < 0) {
                throw new IllegalArgumentException("Tổng tiền thanh toán không đủ để thanh toán hóa đơn.");
            }

            List<ThanhToanHoaDon> thanhToanList = new ArrayList<>();
            hoaDon.getThanhToanHoaDons().addAll(thanhToanList);

            for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
                PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                        .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
                        .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: "
                                + thanhToanRequest.getMaPhuongThucThanhToan()));

                ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
                thanhToanHoaDon.setHoaDon(hoaDon);
                thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
                thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());
                thanhToanHoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
                // Xác định trạng thái dựa trên loại hóa đơn và phương thức
                thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));

                thanhToanHoaDon.setMoTa(phuongThuc.getMoTa());
                thanhToanHoaDon.setNgayTao(thoiGianHoanThanh);
                hoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
                thanhToanList.add(thanhToanHoaDon);
            }

            // Lưu các thanh toán
            thanhToanHoaDonRepository.saveAll(thanhToanList);
            hoaDon.getThanhToanHoaDons().addAll(thanhToanList);
        }

        // 4. Lưu lịch sử trạng thái
        List<Integer> trangThaiCanLuu = new ArrayList<>();
        if (loaiHoaDon == 3) {
            // Đảm bảo trạng thái "Đã xác nhận" được lưu trước
            saveLichSuHoaDon(hoaDon, HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
                    "Chuyển trạng thái: " + HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN),
                    thoiGianHoanThanh);
            // Sau đó mới lưu trạng thái "Chờ giao hàng" với thời gian sau 10 giây
            saveLichSuHoaDon(hoaDon, HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG,
                    "Chuyển trạng thái: " + HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG),
                    thoiGianHoanThanh.plusSeconds(10));
        } else {
            // Với đơn tại quầy, vẫn giữ nguyên logic lưu tuần tự các trạng thái
            trangThaiCanLuu.add(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN);
            trangThaiCanLuu.add(HoaDonConstant.TRANG_THAI_HOAN_THANH);

            for (Integer trangThai : trangThaiCanLuu) {
                saveLichSuHoaDon(hoaDon, trangThai,
                        "Chuyển trạng thái: " + HoaDonConstant.getTrangThaiText(trangThai),
                        thoiGianHoanThanh);
            }
        }

        // 5. Cập nhật trạng thái hóa đơn
        hoaDon.setTrangThai(trangThaiCuoiCung);
        hoaDon.setNgaySua(thoiGianHoanThanh);

        // 6. Lưu hóa đơn
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hoàn tất xử lý hóa đơn: {}", hoaDonId);

        return hoaDonMapper.entityToResponse(savedHoaDon);
    }

    private void saveLichSuHoaDon(HoaDon hoaDon, Integer trangThai, String ghiChu, LocalDateTime thoiGian) {
        LichSuHoaDonRequest lichSuRequest = new LichSuHoaDonRequest();
        lichSuRequest.setHoaDonId(hoaDon.getId());
        lichSuRequest.setTrangThai(trangThai);
        lichSuRequest.setGhiChu(ghiChu);
        lichSuRequest.setThoiGian(thoiGian);

        lichSuHoaDonService.saveLichSuHoaDon(lichSuRequest);
    }

    private int determineTrangThai(String phuongThucId) {
        if (phuongThucId == null) {
            throw new IllegalArgumentException("Phương thức thanh toán không được để trống.");
        }

        switch (phuongThucId) {
            case PaymentConstant.PAYMENT_METHOD_COD:
                return PaymentConstant.PAYMENT_STATUS_COD; // Trả sau (COD)
            case PaymentConstant.PAYMENT_METHOD_CASH:
                return PaymentConstant.PAYMENT_STATUS_PAID; // Tiền mặt -> Đã thanh toán ngay
            case PaymentConstant.PAYMENT_METHOD_BANK:
                return PaymentConstant.PAYMENT_STATUS_PAID;
            default:
                log.warn(" Phát hiện phương thức thanh toán không hợp lệ: {}", phuongThucId);
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Mặc định là chưa thanh toán
        }
    }

    @Override
    @Transactional
    public HoaDonResponse applyVoucher(String hoaDonId, String voucherId) {
        log.info("Start applying voucher. HoaDonId: {}, VoucherId: {}", hoaDonId, voucherId);

        // Validate input
        if (StringUtils.isEmpty(hoaDonId) || StringUtils.isEmpty(voucherId)) {
            throw new ValidationException("ID hóa đơn và ID voucher không được để trống");
        }

        try {
            // Validate và lấy hóa đơn
            HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
            log.info("Found invoice: {}", hoaDon.getId());

            // Validate và lấy voucher
            PhieuGiamGia voucher = phieuGiamGiaHoaDonServiceImpl.validateAndGet(voucherId);
            log.info("Found voucher: {}", voucher.getId());

            // Kiểm tra trạng thái voucher
            if (voucher.getTrangThai() != 1) {
                throw new ValidationException("Phiếu giảm giá không khả dụng");
            }

            // Kiểm tra thời hạn
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(voucher.getNgayBatDau()) || now.isAfter(voucher.getNgayKetThuc())) {
                throw new ValidationException("Phiếu giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng");
            }

            // Kiểm tra số lượng
            if (voucher.getSoLuong() <= 0) {
                throw new ValidationException("Phiếu giảm giá đã hết lượt sử dụng");
            }

            // Tính tổng tiền trước khi áp dụng voucher
            BigDecimal subtotal = calculateSubtotal(hoaDon);
            log.info("Order subtotal: {}", subtotal);

            // Kiểm tra điều kiện áp dụng
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) < 0) {
                throw new ValidationException(
                        String.format("Tổng tiền hóa đơn phải từ %s để áp dụng voucher này",
                                formatCurrency(voucher.getGiaTriToiThieu())));
            }

            // Áp dụng voucher
            hoaDon.setPhieuGiamGia(voucher);
            voucher.setSoLuong(voucher.getSoLuong() - 1);

            // Tính lại tổng tiền
            recalculateTotal(hoaDon);
            log.info("New total after applying voucher: {}", hoaDon.getTongTien());

            // Lưu thay đổi
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            log.info("Successfully saved invoice with voucher");

            return hoaDonMapper.entityToResponse(savedHoaDon);
        } catch (Exception e) {
            log.error("Error applying voucher: ", e);
            throw e;
        }
    }

    @Override
    @Transactional
    public HoaDonResponse selectCustomer(String hoaDonId, String customerId, String diaChiId, String tenNguoiNhan, String soDienThoai) {
        log.info("Selecting customer for invoice: hoaDonId={}, customerId={}, diaChiId={}, tenNguoiNhan={}, soDienThoai={}",
                hoaDonId, customerId, diaChiId, tenNguoiNhan, soDienThoai);

        // Get invoice from DB
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        Integer loaiHoaDon = hoaDon.getLoaiHoaDon();

        // Case 1: Anonymous customer
        if (customerId == null || customerId.isEmpty() || "Khách hàng lẻ".equals(customerId)) {
            log.info("Khách hàng là khách lẻ");
            hoaDon.setKhachHang(null);
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(null);
            hoaDon.setEmailNguoiNhan(null);

            if (loaiHoaDon == 3) { // If delivery order
                if (diaChiId == null || diaChiId.trim().isEmpty()) {
                    log.warn("Khách hàng lẻ chọn giao hàng nhưng không có địa chỉ");
                }
                hoaDon.setDiaChi(diaChiId); // Save address for delivery
            } else {
                hoaDon.setDiaChi("Không có địa chỉ");
            }

            return saveAndReturnHoaDon(hoaDon);
        }

        // Case 2: Registered customer
        KhachHang khachHang = khachHangRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        hoaDon.setKhachHang(khachHang);

        // IMPORTANT: Only update recipient information if not provided explicitly
        if (tenNguoiNhan != null && !tenNguoiNhan.trim().isEmpty()) {
            hoaDon.setTenNguoiNhan(tenNguoiNhan.trim());
            log.info("Set custom recipient name: {}", tenNguoiNhan.trim());
        } else {
            // If not provided, use customer name
            hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
            log.info("Set default recipient name from customer: {}", khachHang.getTenKhachHang());
        }

        if (soDienThoai != null && !soDienThoai.trim().isEmpty()) {
            hoaDon.setSoDienThoai(soDienThoai.trim());
            log.info("Set custom phone number: {}", soDienThoai.trim());
        } else {
            // If not provided, use customer phone
            hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
            log.info("Set default phone number from customer: {}", khachHang.getSoDienThoai());
        }

        hoaDon.setEmailNguoiNhan(khachHang.getEmail());

        // Update address for delivery orders
        if (loaiHoaDon == 3 && diaChiId != null && !diaChiId.isEmpty()) {
            // Logic for address handling remains the same
            DiaChi diaChi = diaChiRepository.findById(diaChiId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + diaChiId));

            if (!diaChi.getKhachHang().getId().equals(khachHang.getId())) {
                throw new ValidationException("Địa chỉ không thuộc về khách hàng này");
            }

            hoaDon.setDiaChi(diaChi.getDiaChiCuThe() + ", " + diaChi.getXa() + ", " + diaChi.getHuyen() + ", "
                    + diaChi.getTinh());
            log.info("Updated address for customer {}: {}", customerId, hoaDon.getDiaChi());
        } else if (loaiHoaDon == 2) {
            // For in-store purchase
            hoaDon.setDiaChi("Không có địa chỉ");
        }

        // Add log entry for recipient information update
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Cập nhật khách hàng");
        lichSuHoaDon.setMoTa("Đã chọn khách hàng: " + khachHang.getTenKhachHang() +
                "; Người nhận: " + hoaDon.getTenNguoiNhan() +
                "; SĐT: " + hoaDon.getSoDienThoai());
        lichSuHoaDon.setTrangThai(hoaDon.getTrangThai());
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return saveAndReturnHoaDon(hoaDon);
    }

    /**
     * Lấy địa chỉ hợp lệ từ khách hàng
     */
    private String getValidShippingAddress(KhachHang khachHang, String diaChiId) {
        List<DiaChi> danhSachDiaChi = diaChiRepository.findDiaChiByIdKhachHang(khachHang.getId());

        if (danhSachDiaChi.isEmpty()) {
            throw new ResourceNotFoundException("Khách hàng không có địa chỉ hợp lệ để giao hàng.");
        }

        DiaChi diaChiKhachHang;
        if (diaChiId != null && !diaChiId.isEmpty()) {
            diaChiKhachHang = diaChiRepository.findById(diaChiId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + diaChiId));

            // Kiểm tra địa chỉ có thuộc về khách hàng không
            if (!diaChiKhachHang.getKhachHang().getId().equals(khachHang.getId())) {
                throw new ValidationException("Địa chỉ không thuộc về khách hàng này.");
            }
        } else {
            if (danhSachDiaChi.size() > 1) {
                throw new ValidationException("Khách hàng có nhiều địa chỉ. Cần chọn một địa chỉ.");
            }
            diaChiKhachHang = danhSachDiaChi.get(0); // Nếu chỉ có một địa chỉ, lấy địa chỉ đó
        }

        return diaChiKhachHang.getDiaChiCuThe() + ", " + diaChiKhachHang.getXa() + ", "
                + diaChiKhachHang.getHuyen() + ", " + diaChiKhachHang.getTinh();
    }

    /**
     * Lưu hóa đơn và trả về kết quả
     */
    private HoaDonResponse saveAndReturnHoaDon(HoaDon hoaDon) {
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Cập nhật hóa đơn thành công: hoaDonId={}, khách hàng={}, địa chỉ={}",
                savedHoaDon.getId(), savedHoaDon.getTenNguoiNhan(), savedHoaDon.getDiaChi());
        return hoaDonMapper.entityToResponse(savedHoaDon);
    }

    /**
     * Tách địa chỉ từ chuỗi thành các phần riêng biệt: số nhà, xã, huyện, tỉnh
     * Sử dụng logic tách từ cuối lên đầu để đảm bảo không bỏ sót thông tin
     */
    public Map<String, String> extractAddressParts(String fullAddress) {
        Map<String, String> addressParts = new HashMap<>();

        if (fullAddress == null || fullAddress.isEmpty() || "Không có địa chỉ".equals(fullAddress)) {
            return addressParts;
        }

        // Tách chuỗi dựa trên dấu phẩy
        String[] parts = fullAddress.split(",\\s*");

        // Log để debug
        log.info("Địa chỉ đầy đủ: {}", fullAddress);
        log.info("Số phần sau khi tách chuỗi: {}", parts.length);
        for (int i = 0; i < parts.length; i++) {
            log.info("Phần {}: {}", i, parts[i]);
        }

        // Luôn lấy từ cuối lên, đảm bảo đủ thông tin
        if (parts.length >= 3) {
            // Lấy ID tỉnh, huyện, xã từ phần cuối
            String tinhId = parts[parts.length - 1].trim();
            String huyenId = parts[parts.length - 2].trim();
            String xaId = parts[parts.length - 3].trim();

            // Phần còn lại là địa chỉ chi tiết
            String diaChiCuThe = "";
            if (parts.length > 3) {
                diaChiCuThe = String.join(", ", Arrays.copyOfRange(parts, 0, parts.length - 3));
            }

            addressParts.put("tinh", tinhId);
            addressParts.put("huyen", huyenId);
            addressParts.put("xa", xaId);
            addressParts.put("diaChiCuThe", diaChiCuThe);

            log.info("Đã tách được đầy đủ thông tin địa chỉ: tỉnh={}, huyện={}, xã={}, chi tiết={}",
                    tinhId, huyenId, xaId, diaChiCuThe);
        } else {
            log.error("Không đủ thông tin để tách địa chỉ: {}", fullAddress);
            // Nếu không đủ phần, trả về địa chỉ gốc như là địa chỉ chi tiết
            addressParts.put("diaChiCuThe", fullAddress);
        }

        return addressParts;
    }

    /**
     * Lấy địa chỉ giao hàng đã tách từ hóa đơn
     */
    @Transactional(readOnly = true)
    public Map<String, String> getDiaChiGiaoHang(String hoaDonId) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // Kiểm tra nếu là đơn giao hàng
        if (hoaDon.getLoaiHoaDon() != 3) {
            throw new ValidationException("Hóa đơn này không phải loại giao hàng.");
        }

        String diaChi = hoaDon.getDiaChi();
        log.info("Địa chỉ gốc từ hóa đơn {}: {}", hoaDonId, diaChi);

        Map<String, String> addressParts = extractAddressParts(diaChi);
        log.info("Kết quả phân tích địa chỉ: {}", addressParts);

        return addressParts;
    }

    /**
     * Cập nhật địa chỉ giao hàng cho hóa đơn
     */
    @Transactional
    @Override
    public synchronized HoaDonResponse updateDiaChiGiaoHang(String hoaDonId, UpdateDiaChiRequest addressRequest) {
        log.info("Cập nhật địa chỉ giao hàng: HoaDonID={}, Địa chỉ={}", hoaDonId, addressRequest);

        if (hoaDonId == null || addressRequest == null) {
            throw new ValidationException("Dữ liệu không hợp lệ: thiếu hoaDonId hoặc addressRequest.");
        }

        // Get invoice with pessimistic lock to avoid concurrent updates
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // If not delivery order, change to delivery
        if (hoaDon.getLoaiHoaDon() != 3) {
            log.info("Chuyển loại hóa đơn sang giao hàng do cập nhật địa chỉ");
            hoaDon.setLoaiHoaDon(3);
        }

        // Get current address values
        String currentDiaChi = hoaDon.getDiaChi();
        String currentTenNguoiNhan = hoaDon.getTenNguoiNhan();
        String currentSoDienThoai = hoaDon.getSoDienThoai();

        // Handle address components safely
        String xaValue = addressRequest.getXaAsString();
        String huyenValue = addressRequest.getHuyenAsString();
        String tinhValue = addressRequest.getTinhAsString();

        // IMPORTANT: Only format full address if all components are present
        String diaChiDayDu = currentDiaChi;
        boolean diaChiChanged = false;

        // Only update address if all components are provided
        if (xaValue != null && !xaValue.trim().isEmpty() &&
                huyenValue != null && !huyenValue.trim().isEmpty() &&
                tinhValue != null && !tinhValue.trim().isEmpty()) {

            String diaChiCuTheValue = addressRequest.getDiaChiCuThe() != null ?
                    addressRequest.getDiaChiCuThe().trim() : "";

            diaChiDayDu = String.format("%s, %s, %s, %s",
                    diaChiCuTheValue, xaValue, huyenValue, tinhValue);

            diaChiChanged = !diaChiDayDu.equals(currentDiaChi);
        } else {
            log.warn("Không đủ thông tin địa chỉ (xã, huyện, tỉnh), giữ nguyên địa chỉ cũ");
        }

        // Check recipient information changes
        boolean tenNguoiNhanChanged = addressRequest.getTenNguoiNhan() != null &&
                !addressRequest.getTenNguoiNhan().trim().isEmpty() &&
                !addressRequest.getTenNguoiNhan().trim().equals(currentTenNguoiNhan);

        boolean soDienThoaiChanged = addressRequest.getSoDienThoai() != null &&
                !addressRequest.getSoDienThoai().trim().isEmpty() &&
                !addressRequest.getSoDienThoai().trim().equals(currentSoDienThoai);

        // Skip update if nothing changed
        if (!diaChiChanged && !tenNguoiNhanChanged && !soDienThoaiChanged) {
            log.info("Không có thay đổi trong thông tin địa chỉ, bỏ qua cập nhật");
            return hoaDonMapper.entityToResponse(hoaDon);
        }

        // Update address if changed
        if (diaChiChanged) {
            hoaDon.setDiaChi(diaChiDayDu);
            log.info("Updated address to: {}", diaChiDayDu);
        }

        // Update recipient information
        if (tenNguoiNhanChanged) {
            hoaDon.setTenNguoiNhan(addressRequest.getTenNguoiNhan().trim());
            log.info("Đã cập nhật tên người nhận: {}", addressRequest.getTenNguoiNhan().trim());
        }

        if (soDienThoaiChanged) {
            hoaDon.setSoDienThoai(addressRequest.getSoDienThoai().trim());
            log.info("Đã cập nhật số điện thoại người nhận: {}", addressRequest.getSoDienThoai().trim());
        }

        // Save invoice
        HoaDon updatedHoaDon = hoaDonRepository.save(hoaDon);

        // Create log entry
        String formattedAddress = "Không có";
        if (StringUtils.hasText(hoaDon.getDiaChi())) {
            formattedAddress = addressCache.getFormattedDiaChi(hoaDon.getDiaChi().trim());
        }

        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Cập nhật địa chỉ giao hàng");

        StringBuilder moTa = new StringBuilder();
        if (diaChiChanged) moTa.append("Địa chỉ: ").append(formattedAddress).append("; ");
        if (tenNguoiNhanChanged) moTa.append("Người nhận: ").append(hoaDon.getTenNguoiNhan()).append("; ");
        if (soDienThoaiChanged) moTa.append("SĐT: ").append(hoaDon.getSoDienThoai());

        lichSuHoaDon.setMoTa(moTa.toString());
        lichSuHoaDon.setTrangThai(hoaDon.getTrangThai());
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());

        lichSuHoaDonRepository.save(lichSuHoaDon);


        log.info("Cập nhật địa chỉ giao hàng thành công cho hóa đơn: {}", hoaDonId);
        return hoaDonMapper.entityToResponse(updatedHoaDon);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse applyBestVoucher(String hoaDonId, String customerId) {
        log.info("Applying best voucher for invoice: hoaDonId={}, customerId={}", hoaDonId, customerId);

        // Lấy hóa đơn và tính tổng tiền
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        BigDecimal subtotal = calculateSubtotal(hoaDon);

        // Lấy danh sách voucher hợp lệ (cả công khai và cá nhân)
        List<PhieuGiamGiaResponse> vouchers = phieuGiamGiaHoaDonServiceImpl.getAvailableVouchersForOrder(subtotal,
                customerId);
        if (vouchers.isEmpty()) {
            log.warn("Không có voucher phù hợp cho hóa đơn {}", hoaDonId);
            return hoaDonMapper.entityToResponse(hoaDon);
        }

        // Sử dụng ExecutorService để tính toán mã giảm giá tốt nhất bằng đa luồng
        ExecutorService executorService = Executors.newFixedThreadPool(5);
        List<Callable<Map.Entry<PhieuGiamGiaResponse, BigDecimal>>> tasks = new ArrayList<>();

        for (PhieuGiamGiaResponse voucher : vouchers) {
            tasks.add(() -> {
                BigDecimal discountValue = calculateDiscountValue(voucher, subtotal);
                return Map.entry(voucher, discountValue);
            });
        }

        try {
            // Chạy tất cả tasks song song
            List<Future<Map.Entry<PhieuGiamGiaResponse, BigDecimal>>> futures = executorService.invokeAll(tasks);

            // Tìm voucher tốt nhất dựa trên giá trị giảm giá lớn nhất
            PhieuGiamGiaResponse bestVoucher = null;
            BigDecimal maxDiscount = BigDecimal.ZERO;

            for (Future<Map.Entry<PhieuGiamGiaResponse, BigDecimal>> future : futures) {
                Map.Entry<PhieuGiamGiaResponse, BigDecimal> result = future.get();
                if (result.getValue().compareTo(maxDiscount) > 0) {
                    maxDiscount = result.getValue();
                    bestVoucher = result.getKey();
                }
            }

            executorService.shutdown();

            if (bestVoucher == null) {
                log.warn("Không tìm thấy voucher hợp lệ để áp dụng cho hóa đơn {}", hoaDonId);
                return hoaDonMapper.entityToResponse(hoaDon);
            }

            // Áp dụng voucher tốt nhất ngay lập tức
            PhieuGiamGia voucherEntity = phieuGiamGiaHoaDonServiceImpl.validateAndGet(bestVoucher.getId());
            hoaDon.setPhieuGiamGia(voucherEntity);
            voucherEntity.setSoLuong(voucherEntity.getSoLuong() - 1);

            // Tính lại tổng tiền
            recalculateTotal(hoaDon);
            log.info("New total after applying best voucher: {}", hoaDon.getTongTien());

            // Lưu thay đổi
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            log.info("Successfully saved invoice with best voucher");

            // Tính số tiền giảm giá
            // Sử dụng lại biến subtotal đã tính ở trên hoặc tính lại cho savedHoaDon
            BigDecimal discountAmount = BigDecimal.ZERO;

            if (voucherEntity.getLoaiPhieuGiamGia() == 1) {
                // Giảm theo phần trăm
                discountAmount = subtotal.multiply(voucherEntity.getGiaTriGiam())
                        .divide(new BigDecimal(100), 0, RoundingMode.FLOOR);
                if (voucherEntity.getSoTienGiamToiDa() != null
                        && discountAmount.compareTo(voucherEntity.getSoTienGiamToiDa()) > 0) {
                    discountAmount = voucherEntity.getSoTienGiamToiDa();
                }
            } else {
                // Giảm giá cố định
                discountAmount = voucherEntity.getGiaTriGiam();
            }

            // Tạo mô tả chi tiết
            String moTa = String.format(
                    "Tự động áp dụng voucher tốt nhất %s: %s%s, giảm %s",
                    voucherEntity.getMaPhieuGiamGia(),
                    voucherEntity.getLoaiPhieuGiamGia() == 1 ? (voucherEntity.getGiaTriGiam() + "%") : "",
                    voucherEntity.getLoaiPhieuGiamGia() == 1 && voucherEntity.getSoTienGiamToiDa() != null
                            ? " (tối đa " + formatCurrency(voucherEntity.getSoTienGiamToiDa()) + ")"
                            : "",
                    formatCurrency(discountAmount));

            // Tạo lịch sử
            createLichSuHoaDon(savedHoaDon, "Tự động áp dụng voucher", moTa);
            return hoaDonMapper.entityToResponse(savedHoaDon);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            log.error("Lỗi khi áp dụng voucher bằng đa luồng: ", e);
            throw new RuntimeException("Lỗi khi áp dụng mã giảm giá.");
        }
    }

    @Override
    public HoaDonResponse applyBestVoucher(String hoaDonId) {
        return applyBestVoucher(hoaDonId, "");
    }

    // Quá trình Thanh toán khi thay đổi Trạng thái
    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse processPaymentOnStatusChange(String hoaDonId, List<ThanhToanRequest> thanhToans) {
        log.info("Xử lý thanh toán khi chuyển trạng thái hóa đơn: {}", hoaDonId);

        // 1. Lấy thông tin hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // 2. Lấy danh sách thanh toán hiện tại nếu có
        List<ThanhToanHoaDon> existingPayments = thanhToanHoaDonRepository.findByHoaDonId(hoaDonId);
        BigDecimal tongTienDaThanhToan = existingPayments.stream()
                .map(ThanhToanHoaDon::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Tính tổng tiền cần thanh toán
        BigDecimal tongTienHoaDon = hoaDon.getTongTien();
        BigDecimal tongTienCanThanhToanThem = tongTienHoaDon.subtract(tongTienDaThanhToan);

        // 4. Kiểm tra tổng tiền thanh toán mới
        BigDecimal tongTienThanhToanMoi = thanhToans.stream()
                .map(ThanhToanRequest::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Hóa đơn {}: Tổng tiền = {}, Đã thanh toán = {}, Cần thanh toán thêm = {}, Sẽ thanh toán = {}",
                hoaDonId,
                formatCurrency(tongTienHoaDon),
                formatCurrency(tongTienDaThanhToan),
                formatCurrency(tongTienCanThanhToanThem),
                formatCurrency(tongTienThanhToanMoi));

        // 5. Kiểm tra số tiền thanh toán thêm có phù hợp không
        if (!existingPayments.isEmpty()) {
            // Nếu đã có thanh toán trước đó, số tiền thanh toán mới phải đúng bằng số tiền
            // còn thiếu
            // Hoặc không thanh toán thêm nếu đã đủ
            if (tongTienCanThanhToanThem.compareTo(BigDecimal.ZERO) <= 0) {
                log.info("Hóa đơn {} đã được thanh toán đủ trước đó, không cần thanh toán thêm", hoaDonId);
                return hoaDonMapper.entityToResponse(hoaDon);
            } else if (tongTienThanhToanMoi.compareTo(tongTienCanThanhToanThem) != 0) {
                throw new ValidationException(String.format(
                        "Số tiền thanh toán thêm (%s) phải bằng số tiền còn thiếu (%s)",
                        formatCurrency(tongTienThanhToanMoi),
                        formatCurrency(tongTienCanThanhToanThem)));
            }
        } else {
            // Nếu chưa có thanh toán nào, số tiền thanh toán mới phải đủ hoặc lớn hơn tổng
            // tiền hóa đơn
            if (tongTienThanhToanMoi.compareTo(tongTienHoaDon) < 0) {
                throw new ValidationException(String.format(
                        "Tổng tiền thanh toán (%s) không đủ để thanh toán hóa đơn (%s)",
                        formatCurrency(tongTienThanhToanMoi),
                        formatCurrency(tongTienHoaDon)));
            }
        }

        // 6. Tạo các bản ghi thanh toán mới
        LocalDateTime thoiGianThanhToan = LocalDateTime.now();
        List<ThanhToanHoaDon> thanhToanList = new ArrayList<>();

        for (ThanhToanRequest thanhToanRequest : thanhToans) {
            PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                    .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
                    .orElseThrow(() -> new ValidationException("Phương thức không hợp lệ: "
                            + thanhToanRequest.getMaPhuongThucThanhToan()));

            ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
            thanhToanHoaDon.setHoaDon(hoaDon);
            thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
            thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());
            thanhToanHoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
            thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));
            thanhToanHoaDon.setMoTa("Thanh toán bổ sung cho hóa đơn");
            thanhToanHoaDon.setNgayTao(thoiGianThanhToan);

            thanhToanList.add(thanhToanHoaDon);
        }

        // 7. Lưu các thanh toán và cập nhật hóa đơn
        thanhToanHoaDonRepository.saveAll(thanhToanList);
        hoaDon.getThanhToanHoaDons().addAll(thanhToanList);

        // 8. Lưu lịch sử thanh toán
        String hanhDong = existingPayments.isEmpty() ? "Thanh toán hóa đơn" : "Thanh toán bổ sung";
        String moTaLichSu = String.format("%s %s", hanhDong, formatCurrency(tongTienThanhToanMoi));

        LichSuHoaDon lichSuThanhToan = new LichSuHoaDon();
        lichSuThanhToan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuThanhToan.setHoaDon(hoaDon);
        lichSuThanhToan.setHanhDong(hanhDong);
        lichSuThanhToan.setMoTa(moTaLichSu);
        lichSuThanhToan.setTrangThai(hoaDon.getTrangThai());
        lichSuThanhToan.setNgayTao(thoiGianThanhToan);
        lichSuThanhToan.setNhanVien(currentUserService.getCurrentNhanVien());

        lichSuHoaDonRepository.save(lichSuThanhToan);

        // 9. Cập nhật và lưu hóa đơn
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(savedHoaDon);
    }

    private void createLichSuHoaDon(HoaDon hoaDon, String hanhDong, String moTa) {
        LichSuHoaDon lichSu = new LichSuHoaDon();
        lichSu.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSu.setHoaDon(hoaDon);
        lichSu.setHanhDong(hanhDong);
        lichSu.setMoTa(moTa);
        lichSu.setTrangThai(1);
        lichSu.setNgayTao(LocalDateTime.now());
        lichSu.setNhanVien(currentUserService.getCurrentNhanVien());

        lichSuHoaDonRepository.save(lichSu);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null)
            return "0đ";
        return String.format("%,d đ", amount.longValue());
    }

    private String generateMaHoaDon() { // Tạo chuỗi ngẫu nhiên 6 ký tự số
        String randomNumbers = String.format("%06d", new Random().nextInt(1000000));
        return "HD" + randomNumbers;
    }

    private BigDecimal calculateDiscountValue(PhieuGiamGiaResponse voucher, BigDecimal totalAmount) {
        if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo phần trăm
            return totalAmount.multiply(voucher.getGiaTriGiam()).divide(BigDecimal.valueOf(100));
        } else { // Giảm số tiền cố định
            return voucher.getGiaTriGiam();
        }
    }

    private BigDecimal calculateSubtotal(HoaDon hoaDon) {
        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1) // Chỉ tính các sản phẩm active
                .map(ct -> ct.getSanPhamChiTiet().getGia()
                        .multiply(BigDecimal.valueOf(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tính toán lại tổng tiền hóa đơn
     * Chỉ lưu tổng tiền SẢN PHẨM sau giảm giá (không bao gồm phí vận chuyển)
     */
    public void recalculateTotal(HoaDon hoaDon) {
        log.info("Recalculating total for invoice: {}", hoaDon.getId());

        // Tính tổng tiền ban đầu
        BigDecimal subtotal = calculateSubtotal(hoaDon);
        log.info("Subtotal: {}", subtotal);

        // Tính giảm giá nếu có áp dụng voucher
        BigDecimal discount = BigDecimal.ZERO;
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();

            // Kiểm tra điều kiện áp dụng
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                // Tính giảm giá theo loại
                if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo %
                    // Chuyển giaTriGiam thành BigDecimal
                    BigDecimal giaTriGiamDecimal = BigDecimal.valueOf(voucher.getGiaTriGiam().doubleValue());
                    discount = subtotal.multiply(giaTriGiamDecimal)
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                    // Kiểm tra giới hạn giảm
                    if (voucher.getSoTienGiamToiDa() != null &&
                            discount.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                        discount = voucher.getSoTienGiamToiDa();
                    }
                } else { // Giảm theo số tiền
                    discount = voucher.getGiaTriGiam();
                    // Đảm bảo không giảm quá tổng tiền
                    if (discount.compareTo(subtotal) > 0) {
                        discount = subtotal;
                    }
                }

                log.info("Discount amount: {}", discount);
            } else {
                // Nếu không đủ điều kiện, xóa voucher
                log.info("Order total does not meet minimum requirement. Removing voucher.");
                hoaDon.setPhieuGiamGia(null);
            }
        }

        // Tính tổng tiền sau khi giảm giá
        BigDecimal subtotalAfterDiscount = subtotal.subtract(discount);
        log.info("Subtotal after discount: {}", subtotalAfterDiscount);

        // Kiểm tra điều kiện miễn phí vận chuyển (đơn từ 2 triệu sau khi trừ giảm giá
        // và là đơn giao hàng)
        if (subtotalAfterDiscount.compareTo(new BigDecimal("2000000")) >= 0 && hoaDon.getLoaiHoaDon() == 3) {
            log.info("Free shipping applied: order subtotal after discount >= 2,000,000 VND");
            hoaDon.setPhiVanChuyen(BigDecimal.ZERO); // Áp dụng miễn phí vận chuyển
        }

        // THAY ĐỔI Ở ĐÂY: Cập nhật tổng tiền: Chỉ là tổng tiền hàng - giảm giá (không bao gồm phí vận chuyển)
        // Đảm bảo tổng tiền không âm
        hoaDon.setTongTien(subtotalAfterDiscount.max(BigDecimal.ZERO));

        // Thêm log để hiển thị phí vận chuyển và tổng tiền thực tế khách hàng phải trả
        BigDecimal actualTotal = subtotalAfterDiscount;
        if (hoaDon.getPhiVanChuyen() != null && hoaDon.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
            actualTotal = actualTotal.add(hoaDon.getPhiVanChuyen());
        }
        log.info("Total saved (excluding shipping): {}", hoaDon.getTongTien());
        log.info("Shipping fee: {}", hoaDon.getPhiVanChuyen());
        log.info("Actual amount customer pays (including shipping): {}", actualTotal);
    }
}