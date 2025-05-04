package com.example.server.service.HoaDon.impl;

import com.example.server.constant.HoaDonConstant;
import com.example.server.constant.PaymentConstant;
import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.impl.HoaDonMapper;
import com.example.server.mapper.impl.SanPhamMapper;
import com.example.server.repository.HoaDon.*;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.service.HoaDon.interfaces.*;
import com.example.server.validator.interfaces.IHoaDonValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class HoaDonSanPhamServiceImpl implements IHoaDonSanPhamService {
    private final HoaDonRepository hoaDonRepository;
    private final ISanPhamHoaDonService sanPhamService;
    private final IPhieuGiamGiaService phieuGiamGiaService;
    private final IHoaDonService hoaDonService;
    private final IHoaDonValidator validator;
    private final HoaDonMapper mapper;
    private final SanPhamMapper sanPhamMapper;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final ICurrentUserService currentUserService;
    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;
    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    @Autowired
    private SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    @Autowired
    private AnhSanPhamRepository anhSanPhamRepository;
    @Autowired
    private LichSuHoaDonRepository lichSuHoaDonRepository;


    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    @Override
    public List<SanPhamChiTietHoaDonResponse> getProductsInInvoice(String hoaDonId) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));

        return hoaDon.getHoaDonChiTiets().stream()
                .filter(chiTiet -> chiTiet.getTrangThai() == 1) // Chỉ lấy sản phẩm đang hoạt động
                .map(chiTiet -> {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();

                    if (giaTaiThoiDiemThem == null) {
                        giaTaiThoiDiemThem = spct.getGia();
                        chiTiet.setGiaTaiThoiDiemThem(giaTaiThoiDiemThem);
                        chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                        hoaDonChiTietRepository.save(chiTiet);
                    }

                    // Sử dụng mapper mới để chuyển đổi
                    SanPhamChiTietHoaDonResponse response = sanPhamMapper.toCartResponse(spct, giaTaiThoiDiemThem);

                    // Cập nhật ID và số lượng của hóa đơn chi tiết
                    response.setId(chiTiet.getId());
                    response.setSoLuong(chiTiet.getSoLuong());
                    response.setThanhTien(giaTaiThoiDiemThem.multiply(new BigDecimal(chiTiet.getSoLuong())));

                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HoaDonResponse addProduct(String hoaDonId, AddProductRequest request) {
        log.info("Bắt đầu xử lý thêm sản phẩm: hoaDonId={}", hoaDonId);

        // Kiểm tra hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        log.info("Hóa đơn hợp lệ: {}", hoaDon.getId());

        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;

        // Kiểm tra nếu có danh sách sản phẩm (trường hợp nhiều sản phẩm)
        if (request.getProductList() != null && !request.getProductList().isEmpty()) {
            log.info("Phát hiện danh sách sản phẩm, số lượng: {}", request.getProductList().size());

            int successCount = 0;
            List<String> failedProducts = new ArrayList<>();

            // Xử lý từng sản phẩm trong danh sách
            for (AddProductRequest productRequest : request.getProductList()) {
                try {
                    // Đảm bảo có số lượng hợp lệ
                    if (productRequest.getSoLuong() == null || productRequest.getSoLuong() <= 0) {
                        productRequest.setSoLuong(1); // Giá trị mặc định
                    }

                    // Tìm sản phẩm chi tiết
                    SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                            .findBySanPhamIdAndTrangThai(productRequest.getSanPhamChiTietId(), true)
                            .orElseThrow(() -> new ValidationException("Sản phẩm chi tiết không hợp lệ hoặc không đủ hàng"));

                    // Kiểm tra tồn kho
                    if (sanPhamChiTiet.getSoLuong() < productRequest.getSoLuong()) {
                        log.warn("Không đủ hàng cho sản phẩm {}: Yêu cầu={}, Tồn kho={}",
                                productRequest.getSanPhamChiTietId(),
                                productRequest.getSoLuong(),
                                sanPhamChiTiet.getSoLuong());

                        failedProducts.add(sanPhamChiTiet.getMaSanPhamChiTiet() + " (thiếu " +
                                (productRequest.getSoLuong() - sanPhamChiTiet.getSoLuong()) + ")");
                        continue;
                    }
                    // Chỉ cập nhật số lượng tồn kho nếu không phải đơn online
                    if (!isOnlineOrder) {
                        sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - productRequest.getSoLuong());
                        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
                        log.info("Đã trừ tồn kho cho sản phẩm: {}, còn lại: {}",
                                sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());
                    } else {
                        log.info("Đơn hàng online: Không trừ tồn kho cho sản phẩm {} ở bước thêm vào giỏ",
                                sanPhamChiTiet.getId());
                    }

                    // Lấy giá hiện tại để lưu
                    BigDecimal giaHienTai = sanPhamChiTiet.getGia();
                    LocalDateTime thoiDiemHienTai = LocalDateTime.now();

                    // Tìm kiếm chi tiết với cùng sản phẩm và CÙNG GIÁ
                    HoaDonChiTiet chiTietGiaGiong = hoaDon.getHoaDonChiTiets().stream()
                            .filter(ct -> ct.getTrangThai() == 1)
                            .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamChiTiet.getId()))
                            .filter(ct -> {
                                BigDecimal giaCt = ct.getGiaTaiThoiDiemThem();
                                return giaCt != null && giaCt.compareTo(giaHienTai) == 0;
                            })
                            .findFirst()
                            .orElse(null);

                    String tenSanPham = sanPhamChiTiet.getSanPham() != null ?
                            sanPhamChiTiet.getSanPham().getTenSanPham() : "Sản phẩm";
                    String mauSac = sanPhamChiTiet.getMauSac() != null ?
                            sanPhamChiTiet.getMauSac().getTenMau() : "Không có";
                    String kichThuoc = sanPhamChiTiet.getKichThuoc() != null ?
                            sanPhamChiTiet.getKichThuoc().getTenKichThuoc() : "Không có";

                    if (chiTietGiaGiong != null) {
                        // Sản phẩm đã có trong giỏ hàng VỚI CÙNG GIÁ, cập nhật số lượng
                        chiTietGiaGiong.setSoLuong(chiTietGiaGiong.getSoLuong() + productRequest.getSoLuong());
                    } else {
                        // Thêm mới sản phẩm vào giỏ hàng (hoặc giá khác với các sản phẩm đã có)
                        HoaDonChiTiet chiTietMoi = new HoaDonChiTiet();
                        chiTietMoi.setId(UUID.randomUUID().toString());
                        chiTietMoi.setSanPhamChiTiet(sanPhamChiTiet);
                        chiTietMoi.setSoLuong(productRequest.getSoLuong());
                        chiTietMoi.setHoaDon(hoaDon);
                        chiTietMoi.setTrangThai(1);
                        chiTietMoi.setGiaTaiThoiDiemThem(giaHienTai);
                        chiTietMoi.setNgayThemVaoGio(thoiDiemHienTai);
                        hoaDon.getHoaDonChiTiets().add(chiTietMoi);

                        // Thêm lịch sử thêm sản phẩm
                        String moTa = String.format("Thêm sản phẩm %s (Màu: %s, Size: %s) với số lượng %d, đơn giá %s",
                                tenSanPham, mauSac, kichThuoc, productRequest.getSoLuong(), formatCurrency(giaHienTai));
                        taoLichSuHoaDon(hoaDon, "Thêm sản phẩm", moTa, null);
                    }

                    successCount++;
                } catch (Exception e) {
                    log.error("Lỗi khi thêm sản phẩm {}: {}", productRequest.getSanPhamChiTietId(), e.getMessage());
                    failedProducts.add(productRequest.getSanPhamChiTietId());
                }
            }

            // Thông báo kết quả thêm sản phẩm
            if (successCount == 0 && !failedProducts.isEmpty()) {
                throw new ValidationException("Không thể thêm bất kỳ sản phẩm nào. " +
                        String.join(", ", failedProducts));
            }

            if (!failedProducts.isEmpty()) {
                log.warn("Một số sản phẩm không thể thêm: {}", failedProducts);
            }

            log.info("Đã thêm thành công {}/{} sản phẩm vào đơn hàng",
                    successCount, request.getProductList().size());

            // Nếu có nhiều sản phẩm được thêm, tạo một lịch sử chung
            if (successCount > 1) {
                String moTa = String.format("Thêm %d sản phẩm vào đơn hàng", successCount);
                taoLichSuHoaDon(hoaDon, "Thêm nhiều sản phẩm", moTa, null);
            }
        }
        // Xử lý trường hợp thêm một sản phẩm (tương thích ngược với API cũ)
        else if (request.getSanPhamChiTietId() != null) {
            try {
                // Tìm sản phẩm chi tiết
                SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                        .findBySanPhamIdAndTrangThai(request.getSanPhamChiTietId(), true)
                        .orElseThrow(() -> new ValidationException("Sản phẩm chi tiết không hợp lệ hoặc không đủ hàng"));

                // Kiểm tra tồn kho
                if (sanPhamChiTiet.getSoLuong() < request.getSoLuong()) {
                    log.error("Không đủ hàng: Yêu cầu={}, Tồn kho={}", request.getSoLuong(), sanPhamChiTiet.getSoLuong());
                    throw new ValidationException(String.format("Sản phẩm %s không đủ số lượng trong kho (yêu cầu: %d, tồn kho: %d)",
                            sanPhamChiTiet.getMaSanPhamChiTiet(), request.getSoLuong(), sanPhamChiTiet.getSoLuong()));
                }

                // Chỉ cập nhật số lượng tồn kho nếu không phải đơn online
                if (!isOnlineOrder) {
                    sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - request.getSoLuong());
                    sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
                    log.info("Đã trừ tồn kho cho sản phẩm: {}, còn lại: {}",
                            sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());
                } else {
                    log.info("Đơn hàng online: Không trừ tồn kho cho sản phẩm {} ở bước thêm vào giỏ",
                            sanPhamChiTiet.getId());
                }

                // Lấy giá hiện tại để lưu
                BigDecimal giaHienTai = sanPhamChiTiet.getGia();
                LocalDateTime thoiDiemHienTai = LocalDateTime.now();

                // Tìm kiếm chi tiết với cùng sản phẩm và CÙNG GIÁ
                HoaDonChiTiet chiTietGiaGiong = hoaDon.getHoaDonChiTiets().stream()
                        .filter(ct -> ct.getTrangThai() == 1)
                        .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamChiTiet.getId()))
                        .filter(ct -> {
                            BigDecimal giaCt = ct.getGiaTaiThoiDiemThem();
                            return giaCt != null && giaCt.compareTo(giaHienTai) == 0;
                        })
                        .findFirst()
                        .orElse(null);

                String tenSanPham = sanPhamChiTiet.getSanPham() != null ?
                        sanPhamChiTiet.getSanPham().getTenSanPham() : "Sản phẩm";
                String mauSac = sanPhamChiTiet.getMauSac() != null ?
                        sanPhamChiTiet.getMauSac().getTenMau() : "Không có";
                String kichThuoc = sanPhamChiTiet.getKichThuoc() != null ?
                        sanPhamChiTiet.getKichThuoc().getTenKichThuoc() : "Không có";

                if (chiTietGiaGiong != null) {
                    // Sản phẩm đã có trong giỏ hàng VỚI CÙNG GIÁ, cập nhật số lượng
                    chiTietGiaGiong.setSoLuong(chiTietGiaGiong.getSoLuong() + request.getSoLuong());
                } else {
                    // Thêm mới sản phẩm vào giỏ hàng (hoặc giá khác với các sản phẩm đã có)
                    HoaDonChiTiet chiTietMoi = new HoaDonChiTiet();
                    chiTietMoi.setId(UUID.randomUUID().toString());
                    chiTietMoi.setSanPhamChiTiet(sanPhamChiTiet);
                    chiTietMoi.setSoLuong(request.getSoLuong());
                    chiTietMoi.setHoaDon(hoaDon);
                    chiTietMoi.setTrangThai(1);
                    chiTietMoi.setGiaTaiThoiDiemThem(giaHienTai);
                    chiTietMoi.setNgayThemVaoGio(thoiDiemHienTai);
                    hoaDon.getHoaDonChiTiets().add(chiTietMoi);

                    // Thêm lịch sử thêm sản phẩm
                    String moTa = String.format("Thêm sản phẩm %s (Màu: %s, Size: %s) với số lượng %d, đơn giá %s",
                            tenSanPham, mauSac, kichThuoc, request.getSoLuong(), formatCurrency(giaHienTai));
                    taoLichSuHoaDon(hoaDon, "Thêm sản phẩm", moTa, null);
                }
            } catch (Exception e) {
                log.error("Lỗi khi thêm sản phẩm: {}", e.getMessage());
                throw e;
            }
        }
        else {
            throw new ValidationException("Không có thông tin sản phẩm cần thêm");
        }

        // Tính lại tổng tiền
        recalculateTotal(hoaDon);
        hoaDon = hoaDonRepository.save(hoaDon);

        return mapper.entityToResponse(hoaDon);
    }

    @Transactional
    public HoaDonResponse updateAllProductPricesAndProcessPayment(
            String hoaDonId,
            Boolean useCurrentPrices,
            String paymentAction,
            String paymentMethodId,
            BigDecimal adjustmentAmount) {

        log.info("Cập nhật giá và xử lý thanh toán: hoaDonId={}, useCurrentPrices={}, paymentAction={}, adjustmentAmount={}",
                hoaDonId, useCurrentPrices, paymentAction, adjustmentAmount);

        // 1. Lấy hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        // Tổng giá trị ban đầu để tính chênh lệch
        BigDecimal tongTienBanDau = hoaDon.getTongTien();

        // 2. Cập nhật tất cả giá sản phẩm nếu cần
        if (Boolean.TRUE.equals(useCurrentPrices)) {
            // Duyệt qua tất cả sản phẩm trong giỏ hàng và cập nhật giá
            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    BigDecimal giaMoi = spct.getGia();
                    BigDecimal giaCu = chiTiet.getGiaTaiThoiDiemThem();

                    // Lưu giá cũ và mới cho lịch sử
                    String tenSanPham = spct.getSanPham().getTenSanPham();
                    String chiTietSP = "";
                    if (spct.getMauSac() != null) {
                        chiTietSP += "Màu: " + spct.getMauSac().getTenMau() + ", ";
                    }
                    if (spct.getKichThuoc() != null) {
                        chiTietSP += "Size: " + spct.getKichThuoc().getTenKichThuoc();
                    }

                    // Tạo mô tả cho lịch sử
                    String moTa = String.format("Cập nhật giá sản phẩm %s (%s) từ %s thành %s",
                            tenSanPham, chiTietSP.trim(),
                            formatCurrency(giaCu), formatCurrency(giaMoi));

                    // Cập nhật giá
                    chiTiet.setGiaTaiThoiDiemThem(giaMoi);
                    chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                    hoaDonChiTietRepository.save(chiTiet);

                    // Lưu lịch sử thay đổi giá
                    taoLichSuHoaDon(hoaDon, "Thay đổi giá sản phẩm", moTa, null);
                }
            }
        }

        // 3. Tính lại tổng tiền
        recalculateTotal(hoaDon);
        hoaDon = hoaDonRepository.save(hoaDon);

        BigDecimal tongTienMoi = hoaDon.getTongTien();
        BigDecimal chenhLechTien = tongTienMoi.subtract(tongTienBanDau);

        if (chenhLechTien.compareTo(BigDecimal.ZERO) == 0) {
            // Không có thay đổi tiền, không cần xử lý thanh toán
            log.info("Không có thay đổi về giá tổng, không cần xử lý thanh toán");
            return mapper.entityToResponse(hoaDon);
        }

        // 4. Kiểm tra có thanh toán chờ xác nhận hoặc trả sau không
        List<ThanhToanHoaDon> pendingOrCodPayments = hoaDon.getThanhToanHoaDons().stream()
                .filter(p -> p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID ||
                        p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD)
                .collect(Collectors.toList());

        // 5. Nếu GIÁ GIẢM và có thanh toán chờ xác nhận/trả sau, điều chỉnh thanh toán đó trực tiếp
        if (chenhLechTien.compareTo(BigDecimal.ZERO) < 0 && !pendingOrCodPayments.isEmpty()) {
            // Lấy khoản thanh toán đầu tiên
            ThanhToanHoaDon pendingPayment = pendingOrCodPayments.get(0);
            BigDecimal oldAmount = pendingPayment.getSoTien();
            BigDecimal newAmount = oldAmount.add(chenhLechTien); // chenhLechTien là số âm, nên thực chất là trừ đi

            if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
                // Nếu số tiền mới âm (giảm nhiều hơn số tiền thanh toán), điều chỉnh về 0
                newAmount = BigDecimal.ZERO;
            }

            // Cập nhật số tiền thanh toán
            pendingPayment.setSoTien(newAmount);
            thanhToanHoaDonRepository.save(pendingPayment);

            // Lưu lịch sử điều chỉnh
            String moTa = String.format("Điều chỉnh giảm %s trong thanh toán %s do giá sản phẩm giảm",
                    formatCurrency(oldAmount.subtract(newAmount)),
                    pendingPayment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD ? "trả sau" : "chờ xác nhận");

            LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
            lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuHoaDon.setHoaDon(hoaDon);
            lichSuHoaDon.setHanhDong("Điều chỉnh thanh toán");
            lichSuHoaDon.setMoTa(moTa);
            lichSuHoaDon.setTrangThai(hoaDon.getTrangThai());
            lichSuHoaDon.setNgayTao(LocalDateTime.now());
            lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
            lichSuHoaDonRepository.save(lichSuHoaDon);

            log.info("Đã điều chỉnh giảm {} trong thanh toán {}",
                    formatCurrency(oldAmount.subtract(newAmount)),
                    pendingPayment.getId());

            return mapper.entityToResponse(hoaDon);
        }

        // 6. Xử lý thanh toán phụ phí hoặc hoàn tiền nếu cần
        if (paymentAction != null && paymentMethodId != null && adjustmentAmount != null &&
                adjustmentAmount.compareTo(BigDecimal.ZERO) > 0) {

            // Lấy phương thức thanh toán
            PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                    .findByMaPhuongThucThanhToan(paymentMethodId)
                    .orElseThrow(() -> new ValidationException("Phương thức không hợp lệ"));

            // Tạo bản ghi thanh toán
            ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
            thanhToan.setHoaDon(hoaDon);
            thanhToan.setPhuongThucThanhToan(phuongThuc);
            thanhToan.setSoTien(adjustmentAmount);
            thanhToan.setNgayTao(LocalDateTime.now());
            thanhToan.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());

            if ("refund".equals(paymentAction)) {
                // Hoàn tiền
                thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_REFUND);
                thanhToan.setMoTa(PaymentConstant.PAYMENT_TYPE_REFUND);
            } else {
                // Thu thêm phụ phí
                thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_PAID);
                thanhToan.setMoTa(PaymentConstant.PAYMENT_TYPE_ADDITIONAL);
            }

            thanhToanHoaDonRepository.save(thanhToan);
            hoaDon.getThanhToanHoaDons().add(thanhToan);

            // Tạo lịch sử thanh toán
            LichSuHoaDon lichSuThanhToan = new LichSuHoaDon();
            lichSuThanhToan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuThanhToan.setHoaDon(hoaDon);
            lichSuThanhToan.setNgayTao(LocalDateTime.now());
            lichSuThanhToan.setTrangThai(hoaDon.getTrangThai());
            lichSuThanhToan.setNhanVien(currentUserService.getCurrentNhanVien());

            if ("refund".equals(paymentAction)) {
                lichSuThanhToan.setHanhDong("Hoàn tiền");
                lichSuThanhToan.setMoTa("Hoàn tiền " + formatCurrency(adjustmentAmount) +
                        " do thay đổi giá sản phẩm giảm");
            } else {
                lichSuThanhToan.setHanhDong("Thanh toán phụ phí");
                lichSuThanhToan.setMoTa("Thanh toán phụ phí " + formatCurrency(adjustmentAmount) +
                        " do thay đổi giá sản phẩm tăng");
            }

            lichSuHoaDonRepository.save(lichSuThanhToan);
        }

        // 7. Lưu hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        return mapper.entityToResponse(hoaDon);
    }


    @Override
    public Map<String, Object> checkPriceChanges(String hoaDonId) {
        log.info("Kiểm tra thay đổi giá cho giỏ hàng: {}", hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> changedItems = new ArrayList<>();
        boolean hasPriceChanges = false;

        // Duyệt qua từng sản phẩm trong giỏ
        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            if (chiTiet.getTrangThai() != 1) continue; // Bỏ qua sản phẩm không hoạt động

            SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
            BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();
            BigDecimal giaHienTai = spct.getGia();

            // Nếu chưa có giá lưu trữ, lấy giá hiện tại
            if (giaTaiThoiDiemThem == null) {
                chiTiet.setGiaTaiThoiDiemThem(giaHienTai);
                chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTietRepository.save(chiTiet);
                continue;
            }

            // So sánh giá
            if (giaHienTai.compareTo(giaTaiThoiDiemThem) != 0) {
                hasPriceChanges = true;

                Map<String, Object> itemInfo = new HashMap<>();
                SanPham sp = spct.getSanPham();

                itemInfo.put("id", chiTiet.getId());
                itemInfo.put("sanPhamChiTietId", spct.getId());
                itemInfo.put("tenSanPham", sp != null ? sp.getTenSanPham() : "Không có dữ liệu");
                itemInfo.put("giaCu", giaTaiThoiDiemThem);
                itemInfo.put("giaMoi", giaHienTai);
                itemInfo.put("soLuong", chiTiet.getSoLuong());
                itemInfo.put("chenhLech", giaHienTai.subtract(giaTaiThoiDiemThem));
                itemInfo.put("phanTramThayDoi", calculatePercentageChange(giaTaiThoiDiemThem, giaHienTai));

                // Thêm thông tin sản phẩm để hiển thị
                itemInfo.put("maSanPhamChiTiet", spct.getMaSanPhamChiTiet());

                // Thêm thông tin màu sắc
                if (spct.getMauSac() != null) {
                    itemInfo.put("mauSac", spct.getMauSac().getTenMau());
                    itemInfo.put("maMauSac", spct.getMauSac().getMaMau() != null ?
                            spct.getMauSac().getMaMau() : "#FFFFFF");
                } else {
                    itemInfo.put("mauSac", "Không có dữ liệu");
                    itemInfo.put("maMauSac", "#FFFFFF");
                }

                // Thêm thông tin kích thước
                if (spct.getKichThuoc() != null) {
                    itemInfo.put("kichThuoc", spct.getKichThuoc().getTenKichThuoc());
                } else {
                    itemInfo.put("kichThuoc", "Không có dữ liệu");
                }

                // Thêm các thông tin chi tiết khác nếu cần
                if (spct.getChatLieu() != null) {
                    itemInfo.put("chatLieu", spct.getChatLieu().getTenChatLieu());
                }
                if (spct.getDanhMuc() != null) {
                    itemInfo.put("danhMuc", spct.getDanhMuc().getTenDanhMuc());
                }
                if (spct.getThuongHieu() != null) {
                    itemInfo.put("thuongHieu", spct.getThuongHieu().getTenThuongHieu());
                }

                // Lấy ảnh đầu tiên của sản phẩm nếu có
                List<AnhSanPham> anhList = anhSanPhamRepository.findByIdSPCT(spct.getId());
                if (anhList != null && !anhList.isEmpty()) {
                    itemInfo.put("anhUrl", anhList.get(0).getAnhUrl());
                }

                changedItems.add(itemInfo);
            }
        }

        result.put("hasPriceChanges", hasPriceChanges);
        result.put("changedItems", changedItems);
        result.put("tongMucThayDoi", calculateTotalChange(changedItems));

        return result;
    }

    private BigDecimal calculatePercentageChange(BigDecimal oldPrice, BigDecimal newPrice) {
        if (oldPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return newPrice.subtract(oldPrice)
                .divide(oldPrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotalChange(List<Map<String, Object>> changedItems) {
        BigDecimal totalChange = BigDecimal.ZERO;

        for (Map<String, Object> item : changedItems) {
            BigDecimal chenhLech = (BigDecimal) item.get("chenhLech");
            Integer soLuong = (Integer) item.get("soLuong");

            totalChange = totalChange.add(chenhLech.multiply(new BigDecimal(soLuong)));
        }

        return totalChange;
    }

    @Override
    @Transactional
    public HoaDonResponse updateProductPrice(String hoaDonId, String hoaDonChiTietId, Boolean useCurrentPrice) {
        log.info("Cập nhật giá sản phẩm: hoaDonId={}, chiTietId={}, useCurrentPrice={}",
                hoaDonId, hoaDonChiTietId, useCurrentPrice);

        // Lấy hóa đơn và chi tiết
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();
        BigDecimal giaHienTai = sanPhamChiTiet.getGia();

        // Nếu useCurrentPrice=true => cập nhật giá tại thời điểm thêm = giá hiện tại
        if (Boolean.TRUE.equals(useCurrentPrice)) {
            log.info("Cập nhật giá sản phẩm {} từ {} thành {}",
                    sanPhamChiTiet.getId(), giaTaiThoiDiemThem, giaHienTai);
            chiTiet.setGiaTaiThoiDiemThem(giaHienTai);
            chiTiet.setNgayThemVaoGio(LocalDateTime.now());
        }

        // Tính lại tổng tiền hóa đơn
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse updateAllProductPrices(String hoaDonId, Boolean useCurrentPrices) {
        log.info("Cập nhật tất cả giá sản phẩm: hoaDonId={}, useCurrentPrices={}",
                hoaDonId, useCurrentPrices);

        // Lấy hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        if (Boolean.TRUE.equals(useCurrentPrices)) {
            // Duyệt qua tất cả sản phẩm trong giỏ hàng
            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    BigDecimal giaMoi = spct.getGia();

                    // Cập nhật giá
                    chiTiet.setGiaTaiThoiDiemThem(giaMoi);
                    chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                    log.info("Cập nhật giá sản phẩm {}: giá mới = {}", spct.getId(), giaMoi);
                }
            }
        }

        // Tính lại tổng tiền
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse updateProductQuantity(String hoaDonId, String hoaDonChiTietId,
                                                UpdateProductQuantityRequest request) {
        log.info("Updating quantity for product detail {} in invoice {} to {}",
                hoaDonChiTietId, hoaDonId, request.getSoLuong());

        if (request.getSoLuong() <= 0) {
            throw new ValidationException("Số lượng phải lớn hơn 0");
        }

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        int currentQuantity = chiTiet.getSoLuong();
        int quantityChange = request.getSoLuong() - currentQuantity;
        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;

        boolean needToUpdateStock = !isOnlineOrder || hoaDon.getTrangThai() >= HoaDonConstant.TRANG_THAI_DA_XAC_NHAN;
        // Kiểm tra tồn kho nếu cần thêm số lượng
        if (quantityChange > 0 && sanPhamChiTiet.getSoLuong() < quantityChange) {
            throw new ValidationException("Không đủ số lượng trong kho");
        }
        // Cập nhật số lượng trong kho chỉ khi:
        // - Đơn tại quầy (đã trừ khi thêm vào đơn)
        // - Đơn online đã xác nhận (đã trừ khi xác nhận)
        if (needToUpdateStock) {
            if (quantityChange > 0) {
                // Tăng số lượng -> Giảm tồn kho
                if (sanPhamChiTiet.getSoLuong() < quantityChange) {
                    throw new ValidationException("Không đủ số lượng trong kho");
                }

                sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - quantityChange);
                log.info("Trừ thêm số lượng tồn kho cho sản phẩm {}: {}",
                        sanPhamChiTiet.getId(), quantityChange);
            } else if (quantityChange < 0) {
                // Giảm số lượng -> Hoàn lại vào kho
                sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - quantityChange);
                log.info("Hoàn lại số lượng vào kho cho sản phẩm {}: {}",
                        sanPhamChiTiet.getId(), -quantityChange);
            }

            // Lưu thay đổi tồn kho
            sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        } else {
            log.info("Đơn hàng online chưa xác nhận, không cập nhật số lượng tồn kho");

            // Kiểm tra xem có đủ tồn kho không nếu tăng số lượng
            if (quantityChange > 0 && sanPhamChiTiet.getSoLuong() < request.getSoLuong()) {
                throw new ValidationException("Không đủ số lượng tồn kho");
            }
        }

        // Cập nhật số lượng trong chi tiết hóa đơn
        chiTiet.setSoLuong(request.getSoLuong());

        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        log.info("Updated stock for product {}: new quantity={}", sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());

        chiTiet.setSoLuong(request.getSoLuong());
        String tenSanPham = sanPhamChiTiet.getSanPham() != null ? sanPhamChiTiet.getSanPham().getTenSanPham() : "Sản phẩm";
        String mauSac = sanPhamChiTiet.getMauSac() != null ? sanPhamChiTiet.getMauSac().getTenMau() : "Không có";
        String kichThuoc = sanPhamChiTiet.getKichThuoc() != null ? sanPhamChiTiet.getKichThuoc().getTenKichThuoc() : "Không có";

        String moTa = String.format("Cập nhật số lượng sản phẩm %s (Màu: %s, Size: %s) từ %d thành %d",
                tenSanPham, mauSac, kichThuoc, currentQuantity, request.getSoLuong());
        taoLichSuHoaDon(hoaDon, "Cập nhật số lượng sản phẩm", moTa, null);

        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse removeVoucher(String hoaDonId) {
        log.info("Removing voucher from invoice {}", hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
            String maPhieuGiamGia = voucher.getMaPhieuGiamGia() != null ? voucher.getMaPhieuGiamGia() : voucher.getId();
            String tenMaGiamGia = voucher.getTenPhieuGiamGia() != null ? voucher.getTenPhieuGiamGia() : voucher.getId();
            BigDecimal giaTriGiam = calculateVoucherDiscount(hoaDon, voucher);
            // Hoàn lại số lượng voucher
            voucher.setSoLuong(voucher.getSoLuong() + 1);
            phieuGiamGiaRepository.save(voucher);

            hoaDon.setPhieuGiamGia(null);
            recalculateTotal(hoaDon);
            //Thêm lịch sử xóa voucher
            String moTa = String.format("Đã xóa voucher tên %s với mã %s (giảm %s) khỏi hóa đơn",
                    tenMaGiamGia, maPhieuGiamGia, formatCurrency(giaTriGiam));
            taoLichSuHoaDon(hoaDon, "Xóa voucher", moTa, null);

            log.info("Successfully removed voucher. New total: {}", hoaDon.getTongTien());
            return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
        } else {
            throw new ValidationException("Không có voucher nào để xóa");
        }
    }

    // Thêm phương thức để lấy thông tin chi tiết hóa đơn (bao gồm cả voucher)
    @Override
    public HoaDonResponse getInvoiceDetails(String hoaDonId) {
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        // Đảm bảo tổng tiền được tính đúng
        recalculateTotal(hoaDon);

        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse removeProduct(String hoaDonId, String hoaDonChiTietId) {
        log.info("Removing product detail {} from invoice {}", hoaDonChiTietId, hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        // Lấy thông tin sản phẩm để hiển thị trong lịch sử
        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        String tenSanPham = sanPhamChiTiet.getSanPham() != null ? sanPhamChiTiet.getSanPham().getTenSanPham() : "Sản phẩm";
        String mauSac = sanPhamChiTiet.getMauSac() != null ? sanPhamChiTiet.getMauSac().getTenMau() : "Không có";
        String kichThuoc = sanPhamChiTiet.getKichThuoc() != null ? sanPhamChiTiet.getKichThuoc().getTenKichThuoc() : "Không có";
        int soLuong = chiTiet.getSoLuong();
        BigDecimal donGia = chiTiet.getGiaTaiThoiDiemThem();

        // Kiểm tra và xử lý hoàn lại số lượng vào kho
        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;
        boolean needToRestoreStock = !isOnlineOrder || hoaDon.getTrangThai() >= HoaDonConstant.TRANG_THAI_DA_XAC_NHAN;

        // Hoàn lại số lượng vào kho chỉ khi:
        // - Đơn tại quầy (đã trừ khi thêm vào đơn)
        // - Đơn online đã xác nhận (đã trừ khi xác nhận)
        if (needToRestoreStock) {
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
            sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
            log.info("Restored stock for product {}: new quantity={}",
                    sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());
        } else {
            log.info("Đơn hàng online chưa xác nhận, không cần hoàn lại số lượng vào kho");
        }

        // Xóa chi tiết hóa đơn
        hoaDon.getHoaDonChiTiets().remove(chiTiet);
        hoaDonChiTietRepository.delete(chiTiet);

        // Thêm lịch sử xóa sản phẩm
        String moTa = String.format("Xóa sản phẩm %s (Màu: %s, Size: %s) - Số lượng: %d, Đơn giá: %s",
                tenSanPham, mauSac, kichThuoc, soLuong, formatCurrency(donGia));
        taoLichSuHoaDon(hoaDon, "Xóa sản phẩm", moTa, null);

        // Tính lại tổng tiền
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    // Các phương thức hỗ trợ
    public void taoLichSuHoaDon(HoaDon hoaDon, String hanhDong, String moTa, Integer trangThai) {
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong(hanhDong);
        lichSuHoaDon.setMoTa(moTa);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());

        // Lấy nhân viên hiện tại nếu có
        try {
            NhanVien nhanVien = currentUserService.getCurrentNhanVien();
            if (nhanVien != null) {
                lichSuHoaDon.setNhanVien(nhanVien);
            }
        } catch (Exception e) {
            log.warn("Không thể lấy thông tin nhân viên hiện tại: {}", e.getMessage());
        }

        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Đã lưu lịch sử hóa đơn: {}, hành động: {}", hoaDon.getId(), hanhDong);
    }

    private HoaDonChiTiet findChiTietBySanPhamId(HoaDon hoaDon, String sanPhamId) {
        log.info("Finding product {} in invoice {}", sanPhamId, hoaDon.getId());

        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamId))
                .findFirst()
                .orElse(null);
    }

    private BigDecimal calculateSubtotal(HoaDon hoaDon) {
        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1) // Chỉ tính các sản phẩm active
                .map(ct -> {
                    // Ưu tiên sử dụng giá tại thời điểm thêm nếu có
                    BigDecimal gia = ct.getGiaTaiThoiDiemThem() != null ?
                            ct.getGiaTaiThoiDiemThem() :
                            ct.getSanPhamChiTiet().getGia();

                    return gia.multiply(BigDecimal.valueOf(ct.getSoLuong()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public SanPhamChiTiet laySanPhamChiTiet(String sanPhamChiTietId, int soLuong) {
        // Lấy sản phẩm chi tiết theo ID
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                .findBySanPhamIdAndTrangThai(sanPhamChiTietId, true)
                .orElseThrow(() -> new ValidationException(
                        "Không tìm thấy sản phẩm chi tiết hợp lệ cho ID: " + sanPhamChiTietId));

        // Kiểm tra số lượng tồn kho
        if (sanPhamChiTiet.getSoLuong() < soLuong) {
            throw new ValidationException("Sản phẩm không đủ số lượng trong kho");
        }

        return sanPhamChiTiet;
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
            PhieuGiamGia voucher = phieuGiamGiaService.validateAndGet(voucherId);
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

            BigDecimal giaTriGiam = calculateVoucherDiscount(hoaDon, voucher);
            String maPhieu = voucher.getMaPhieuGiamGia() != null ? voucher.getMaPhieuGiamGia() : voucher.getId();

            // Thêm lịch sử áp dụng voucher
            String moTa = String.format("Áp dụng voucher %s giảm %s cho hóa đơn",
                    maPhieu, formatCurrency(giaTriGiam));
            taoLichSuHoaDon(hoaDon, "Áp dụng voucher", moTa, null);

            // Tính lại tổng tiền
            recalculateTotal(hoaDon);
            log.info("New total after applying voucher: {}", hoaDon.getTongTien());

            // Lưu thay đổi
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            log.info("Successfully saved invoice with voucher");

            return mapper.entityToResponse(savedHoaDon);
        } catch (Exception e) {
            log.error("Error applying voucher: ", e);
            throw e;
        }
    }

    // Thêm phương thức tính giá trị giảm của voucher
    private BigDecimal calculateVoucherDiscount(HoaDon hoaDon, PhieuGiamGia voucher) {
        BigDecimal subtotal = calculateSubtotal(hoaDon);
        BigDecimal discount;

        if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo %
            BigDecimal giaTriGiamDecimal = BigDecimal.valueOf(voucher.getGiaTriGiam().doubleValue());
            discount = subtotal.multiply(giaTriGiamDecimal)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            if (voucher.getSoTienGiamToiDa() != null &&
                    discount.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                discount = voucher.getSoTienGiamToiDa();
            }
        } else { // Giảm theo số tiền
            discount = voucher.getGiaTriGiam();
            if (discount.compareTo(subtotal) > 0) {
                discount = subtotal;
            }
        }

        return discount;
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null)
            return "0đ";
        return String.format("%,d đ", amount.longValue());
    }

    public List<SanPhamChiTiet> filterProducts(String searchTerm, String chatLieu, String kieuDang,
                                               String thuongHieu, String kieuCuc, String kieuCoAo,
                                               String kieuCoTayAo, String kieuTayAo, String kieuTuiAo,
                                               String danhMuc, String hoaTiet, String mauSac, String kichThuoc) {
        return sanPhamChiTietHoaDonRepository.filterProducts(searchTerm, chatLieu, kieuDang, thuongHieu,
                kieuCuc, kieuCoAo, kieuCoTayAo, kieuTayAo,
                kieuTuiAo, danhMuc, hoaTiet, mauSac, kichThuoc);
    }

}