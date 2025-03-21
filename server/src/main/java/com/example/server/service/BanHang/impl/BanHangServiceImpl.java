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
import com.example.server.service.HoaDon.impl.HoaDonServiceImpl;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import com.example.server.service.HoaDon.impl.PhieuGiamGiaHoaDonServiceImpl;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

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

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    private final ICurrentUserService currentUserService;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private HoaDonServiceImpl hoaDonServiceImpl;
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

    @Override
    public List<HoaDon> getHoaDonTaiQuay() {
        return hoaDonRepository.getHoaDonTheoLoai();
    }

    @Override
    @Transactional
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        log.info("Creating new invoice with request: {}", request);

        // 1. Khởi tạo hóa đơn mới
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId("HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        hoaDon.setMaHoaDon(generateMaHoaDon());
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);

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
                        diaChi.getMoTa() + ", " + diaChi.getXa() + ", " + diaChi.getHuyen() + ", " + diaChi.getTinh());
            }
        }

        // 5. Lưu hóa đơn vào database
        hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());

        // 6. Lưu lịch sử hóa đơn
        LichSuHoaDonRequest lichSuRequest = new LichSuHoaDonRequest();
        lichSuRequest.setHoaDonId(hoaDon.getId());
        lichSuRequest.setThoiGian(LocalDateTime.now());
        lichSuRequest.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        if (loaiHoaDon != 2 && loaiHoaDon != 3) {
            throw new ValidationException("Loại hóa đơn không hợp lệ.");
        }

        hoaDon.setLoaiHoaDon(loaiHoaDon);
        hoaDonRepository.save(hoaDon);

        log.info("Cập nhật hình thức mua hàng thành công: HoaDonID={}, LoaiHoaDon={}", hoaDonId, loaiHoaDon);
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
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
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

            for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
                PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                        .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
                        .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: "
                                + thanhToanRequest.getMaPhuongThucThanhToan()));

                ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
                thanhToanHoaDon.setId(UUID.randomUUID().toString());
                thanhToanHoaDon.setHoaDon(hoaDon);
                thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
                thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());

                // Xác định trạng thái dựa trên loại hóa đơn và phương thức
                thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));

                thanhToanHoaDon.setMoTa(phuongThuc.getMoTa());
                thanhToanHoaDon.setNgayTao(thoiGianHoanThanh);

                thanhToanList.add(thanhToanHoaDon);
            }

            // Lưu các thanh toán
            thanhToanHoaDonRepository.saveAll(thanhToanList);
            hoaDon.getThanhToanHoaDons().addAll(thanhToanList);
        }

        // 4. Lưu lịch sử trạng thái
        List<Integer> trangThaiCanLuu = new ArrayList<>();
        if (loaiHoaDon == 3) {
            trangThaiCanLuu.addAll(Arrays.asList(
                    HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
                    HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG));
        } else {
            trangThaiCanLuu.addAll(Arrays.asList(
                    HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
                    HoaDonConstant.TRANG_THAI_HOAN_THANH));
        }

        for (Integer trangThai : trangThaiCanLuu) {
            saveLichSuHoaDon(hoaDon, trangThai,
                    "Chuyển trạng thái: " + HoaDonConstant.getTrangThaiText(trangThai),
                    thoiGianHoanThanh);
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
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Chuyển khoản -> Cần xác nhận
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
            HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
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
    public HoaDonResponse selectCustomer(String hoaDonId, String customerId, String diaChiId) {
        log.info("Selecting customer for invoice: hoaDonId={}, customerId={}, diaChiId={}", hoaDonId, customerId,
                diaChiId);

        // Lấy hóa đơn từ DB
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
        Integer loaiHoaDon = hoaDon.getLoaiHoaDon();

        // Nếu hóa đơn là tại quầy, không yêu cầu địa chỉ
        if (loaiHoaDon == 2) {
            log.info("Loại hóa đơn là Tại quầy -> Không yêu cầu địa chỉ.");
            hoaDon.setDiaChi(null);
            hoaDon.setKhachHang(null);
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(null);
            hoaDon.setEmailNguoiNhan(null);
            return saveAndReturnHoaDon(hoaDon);
        }

        // **Trường hợp 1: Khách hàng lẻ (customerId == null)**
        if (customerId == null || customerId.isEmpty() || "Khách hàng lẻ".equals(customerId)) {
            log.info("Khách hàng là khách lẻ.");
            hoaDon.setKhachHang(null);
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(null);
            hoaDon.setEmailNguoiNhan(null);

            if (loaiHoaDon == 3) { // Nếu là giao hàng, yêu cầu nhập địa chỉ
                if (diaChiId == null || diaChiId.trim().isEmpty()) {
                    throw new ValidationException("Khách hàng lẻ cần nhập địa chỉ giao hàng.");
                }
                hoaDon.setDiaChi(diaChiId); // Lưu trực tiếp địa chỉ nhập từ người dùng
            }

            return saveAndReturnHoaDon(hoaDon);
        }

        // **Trường hợp 2: Khách hàng đã có trong DB**
        KhachHang khachHang = khachHangRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        hoaDon.setKhachHang(khachHang);
        hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
        hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(khachHang.getEmail());

        // Nếu là giao hàng và có diaChiId, cập nhật địa chỉ
        if (loaiHoaDon == 3 && diaChiId != null && !diaChiId.isEmpty()) {
            DiaChi diaChi = diaChiRepository.findById(diaChiId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + diaChiId));

            // Kiểm tra địa chỉ có thuộc về khách hàng không
            if (!diaChi.getKhachHang().getId().equals(khachHang.getId())) {
                throw new ValidationException("Địa chỉ không thuộc về khách hàng này");
            }

            hoaDon.setDiaChi(diaChi.getMoTa() + ", " + diaChi.getXa() + ", "
                    + diaChi.getHuyen() + ", " + diaChi.getTinh());
        } else if (loaiHoaDon == 3) {
            // Nếu là giao hàng nhưng không có diaChiId, không báo lỗi mà chỉ trả về thông
            // tin khách hàng
            log.info("Khách hàng {} có nhiều địa chỉ hoặc chưa chọn địa chỉ. Cần chọn địa chỉ sau.", customerId);
            // Không thiết lập địa chỉ ngay
        }

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

        return diaChiKhachHang.getMoTa() + ", " + diaChiKhachHang.getXa() + ", "
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
     */
    public Map<String, String> extractAddressParts(String fullAddress) {
        Map<String, String> addressParts = new HashMap<>();

        if (fullAddress == null || fullAddress.isEmpty()) {
            return addressParts;
        }

        // Tách chuỗi dựa trên dấu phẩy
        String[] parts = fullAddress.split(",");

        if (parts.length > 0) {
            addressParts.put("moTa", parts[0].trim()); // Số nhà
        }
        if (parts.length > 1) {
            addressParts.put("xa", parts[1].trim()); // Xã/Phường
        }
        if (parts.length > 2) {
            addressParts.put("huyen", parts[2].trim()); // Huyện/Quận
        }
        if (parts.length > 3) {
            addressParts.put("tinh", parts[3].trim()); // Tỉnh/Thành phố
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

        if (hoaDon.getLoaiHoaDon() != 3) { // Chỉ lấy địa chỉ nếu là đơn giao hàng
            throw new ValidationException("Hóa đơn này không phải loại giao hàng.");
        }

        return extractAddressParts(hoaDon.getDiaChi()); // Tách địa chỉ từ chuỗi
    }

    /**
     * Cập nhật địa chỉ giao hàng cho hóa đơn
     */
    @Override
    @Transactional
    public HoaDonResponse updateDiaChiGiaoHang(String hoaDonId, UpdateDiaChiRequest addressRequest) {
        log.info("Cập nhật địa chỉ giao hàng: HoaDonID={}, Địa chỉ={}", hoaDonId, addressRequest);

        if (hoaDonId == null || addressRequest == null || addressRequest.getDiaChiId() == null) {
            throw new ValidationException("Dữ liệu không hợp lệ: thiếu hoaDonId hoặc diaChiId.");
        }

        // Lấy hóa đơn từ DB
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // Kiểm tra loại hóa đơn (chỉ cho phép cập nhật nếu là giao hàng)
        if (hoaDon.getLoaiHoaDon() != 3) {
            throw new ValidationException("Chỉ có thể cập nhật địa chỉ cho hóa đơn giao hàng.");
        }

        // Tìm địa chỉ trong database
        DiaChi diaChi = diaChiRepository.findById(addressRequest.getDiaChiId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy địa chỉ với ID: " + addressRequest.getDiaChiId()));

        // Kiểm tra địa chỉ có thuộc về khách hàng của hóa đơn không
        if (!diaChi.getKhachHang().getId().equals(hoaDon.getKhachHang().getId())) {
            throw new ValidationException("Địa chỉ không thuộc về khách hàng của hóa đơn.");
        }

        // Cập nhật địa chỉ vào hóa đơn
        String diaChiDayDu = String.format("%s, %s, %s, %s",
                addressRequest.getMoTa(), addressRequest.getXa(), addressRequest.getHuyen(), addressRequest.getTinh());

        hoaDon.setDiaChi(diaChiDayDu);

        // Lưu hóa đơn
        HoaDon updatedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Cập nhật địa chỉ giao hàng thành công cho hóa đơn: {}", hoaDonId);

        return hoaDonMapper.entityToResponse(updatedHoaDon);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse applyBestVoucher(String hoaDonId) {
        log.info("Applying best voucher for invoice: hoaDonId={}", hoaDonId);

        // Lấy hóa đơn và tính tổng tiền
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
        BigDecimal subtotal = calculateSubtotal(hoaDon);

        // Lấy danh sách voucher hợp lệ
        List<PhieuGiamGiaResponse> vouchers = phieuGiamGiaHoaDonServiceImpl.getAvailableVouchersForOrder(subtotal);
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

            return hoaDonMapper.entityToResponse(savedHoaDon);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            log.error("Lỗi khi áp dụng voucher bằng đa luồng: ", e);
            throw new RuntimeException("Lỗi khi áp dụng mã giảm giá.");
        }
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

    private void recalculateTotal(HoaDon hoaDon) {
        log.info("Recalculating total for invoice: {}", hoaDon.getId());

        // Tính tổng tiền ban đầu
        BigDecimal subtotal = calculateSubtotal(hoaDon);
        log.info("Subtotal: {}", subtotal);

        // Nếu có áp dụng voucher
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();

            // Kiểm tra điều kiện áp dụng
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                BigDecimal discount;

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

                // Cập nhật tổng tiền sau giảm
                BigDecimal finalTotal = subtotal.subtract(discount);
                // Đảm bảo tổng tiền không âm
                hoaDon.setTongTien(finalTotal.max(BigDecimal.ZERO));
                log.info("Final total after discount: {}", hoaDon.getTongTien());
            } else {
                // Nếu không đủ điều kiện, xóa voucher
                log.info("Order total does not meet minimum requirement. Removing voucher.");
                hoaDon.setPhieuGiamGia(null);
                hoaDon.setTongTien(subtotal);
            }
        } else {
            // Nếu không có voucher
            log.info("No voucher applied. Setting total equal to subtotal.");
            hoaDon.setTongTien(subtotal);
        }
    }
}