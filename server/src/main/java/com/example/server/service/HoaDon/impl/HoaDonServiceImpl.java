package com.example.server.service.HoaDon.impl;

import com.example.server.Util.PDFGenerator;
import com.example.server.constant.HoaDonConstant;
import com.example.server.constant.PaymentConstant;
import com.example.server.dto.HoaDon.request.*;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.interfaces.IHoaDonMapper;
import com.example.server.repository.HoaDon.*;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.BanHang.impl.BanHangServiceImpl;
import com.example.server.service.GiaoHang.AddressCache;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import com.example.server.service.HoaDon.interfaces.IPaymentProcessorService;
import com.example.server.service.HoaDon.interfaces.IThanhToanHoaDonService;
import com.example.server.specification.HoaDonSpecification;
import com.example.server.validator.interfaces.IHoaDonValidator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class HoaDonServiceImpl implements IHoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    private final HoaDonSpecification hoaDonSpecification;
    private final LichSuHoaDonRepository lichSuHoaDonRepository;
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;
    private final IHoaDonMapper hoaDonMapper;
    private final IHoaDonValidator hoaDonValidator;
    private final ICurrentUserService currentUserService;
    private final IPaymentProcessorService paymentProcessorService;
    private final AddressCache addressCache;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ThanhToanHoaDonService thanhToanHoaDonService;

    @Autowired
    private LichSuHoaDonService lichSuHoaDonService;

    @Autowired
    private PDFGenerator pdfGenerator;

    @Override
    public HoaDon validateAndGet(String id) {
        log.info("Validating and getting order with ID: {}", id);
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Order not found with ID: {}", id);
                    return new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id);
                });
    }

    @Override
    public Map<String, Long> getInvoiceCounts(HoaDonSearchCriteria criteria) {
        Specification<HoaDon> spec = hoaDonSpecification.createSpecification(criteria);

        List<HoaDon> invoices = hoaDonRepository.findAll(spec);

        Map<String, Long> counts = new HashMap<>();
        counts.put("all", (long) invoices.size());

        Map<Integer, Long> statusCounts = invoices.stream()
                .collect(Collectors.groupingBy(HoaDon::getTrangThai, Collectors.counting()));

        counts.put("all", (long) invoices.size());
        for (int status = 1; status <= 5; status++) {
            counts.put(String.valueOf(status), statusCounts.getOrDefault(status, 0L));
        }

        return counts;
    }

    @Override
    @Transactional
    public HoaDonResponse updateHoaDon(String id, HoaDonRequest request) {
        log.info("Updating invoice with id: {} and request: {}", id, request);

        // Tìm hóa đơn hiện tại
        HoaDon hoaDon = findHoaDonById(id);

        // Kiểm tra và xác thực dữ liệu
        hoaDonValidator.validateUpdate(request, hoaDon);

        // Cập nhật thông tin cơ bản từ request
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSoDienThoai(request.getSoDienThoai());
        hoaDon.setGhiChu(request.getGhiChu());

        // Cập nhật địa chỉ nếu có
        if (StringUtils.hasText(request.getDiaChi())) {
            // Xử lý địa chỉ, nếu cần format hay validate
            hoaDon.setDiaChi(request.getDiaChi().trim());
        }

        // Nếu là khách hàng lẻ (không có ID khách hàng), cập nhật thông tin trong hoaDon
        if (hoaDon.getKhachHang() == null) {
            log.info("Updating anonymous customer information in invoice");
        }

        hoaDon.setNgaySua(LocalDateTime.now());
        hoaDon.setNguoiSua(currentUserService.getCurrentUsername());

        String formattedAddress;
        if (StringUtils.hasText(request.getDiaChi())) {
            formattedAddress = addressCache.getFormattedDiaChi(request.getDiaChi().trim());
        } else {
            formattedAddress = "Không có";
        }
        // Lưu lịch sử thay đổi nếu cần
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setNgaySua(LocalDateTime.now());

        // Lấy đối tượng NhanVien từ currentUserService
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();
        lichSuHoaDon.setNhanVien(nhanVien);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setHanhDong("Cập nhật thông tin người nhận");
        lichSuHoaDon.setMoTa("Cập nhật thông tin người nhận: " + request.getTenNguoiNhan() +
                ", Địa chỉ: " + formattedAddress +
                ", SĐT: " + (request.getSoDienThoai() != null ? request.getSoDienThoai() : "---"));
        lichSuHoaDonRepository.save(lichSuHoaDon);

        // Lưu lại hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated invoice with ID: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    @Override
    @Transactional
    public HoaDonResponse getHoaDonById(String id) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        // Kiểm tra Hibernate có load danh sách thanh toán không
        hoaDon.getThanhToanHoaDons().size();
        log.info("Số lượng thanh toán trước khi ánh xạ: {}", hoaDon.getThanhToanHoaDons().size());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    private HoaDon findHoaDonById(String id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));
    }

    @Override
    public Page<HoaDonResponse> getAllHoaDon(Pageable pageable) {
        return hoaDonRepository.findAll(pageable)
                .map(hoaDonMapper::entityToResponse);
    }

    //Update địa chỉ
    @Override
    public HoaDonResponse updateHoaDonAddress(String id, String diaChi, String tinh, String huyen, String xa, String diaChiCuThe) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

        if (tinh == null || huyen == null || xa == null) {
            throw new IllegalArgumentException("Vui lòng nhập đầy đủ tỉnh, huyện, xã");
        }

        // Format địa chỉ đúng cách
        StringBuilder fullAddress = new StringBuilder();
        if (diaChiCuThe != null && !diaChiCuThe.isEmpty()) fullAddress.append(diaChiCuThe).append(", ");
        fullAddress.append(xa).append(", ")
                .append(huyen).append(", ")
                .append(tinh);

        hoaDon.setDiaChi(fullAddress.toString().trim()); // Cập nhật địa chỉ
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    //    Tính lưu phí vận chuyển vào hóa đơn
    public HoaDon capNhatPhiVanChuyen(String hoaDonId, BigDecimal phiVanChuyen) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // Kiểm tra điều kiện miễn phí vận chuyển
        BigDecimal subtotal = calculateSubtotal(hoaDon);
        BigDecimal discount = BigDecimal.ZERO;

        // Tính giảm giá nếu có
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
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
            }
        }

        BigDecimal subtotalAfterDiscount = subtotal.subtract(discount);

        // Áp dụng miễn phí vận chuyển nếu thỏa điều kiện
        if (subtotalAfterDiscount.compareTo(new BigDecimal("2000000")) >= 0 && hoaDon.getLoaiHoaDon() == 3) {
            log.info("Miễn phí vận chuyển áp dụng cho đơn hàng {}: tổng tiền sau giảm giá >= 2,000,000 VND", hoaDonId);
            hoaDon.setPhiVanChuyen(BigDecimal.ZERO);
        } else {
            hoaDon.setPhiVanChuyen(phiVanChuyen);
        }

        // Tính lại tổng tiền hóa đơn
        BigDecimal finalTotal = subtotalAfterDiscount;
        if (hoaDon.getPhiVanChuyen() != null && hoaDon.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
            finalTotal = finalTotal.add(hoaDon.getPhiVanChuyen());
        }

        hoaDon.setTongTien(finalTotal);
        log.info("Đã cập nhật phí vận chuyển và tổng tiền hóa đơn: phí vận chuyển={}, tổng tiền={}",
                hoaDon.getPhiVanChuyen(), hoaDon.getTongTien());

        return hoaDonRepository.save(hoaDon);
    }
    private BigDecimal calculateSubtotal(HoaDon hoaDon) {
        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1) // Chỉ tính các sản phẩm active
                .map(ct -> {
                    // Sử dụng giá tại thời điểm thêm nếu có
                    BigDecimal gia = ct.getGiaTaiThoiDiemThem() != null ?
                            ct.getGiaTaiThoiDiemThem() : ct.getSanPhamChiTiet().getGia();
                    return gia.multiply(BigDecimal.valueOf(ct.getSoLuong()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    @Transactional
    public HoaDonResponse refundExcessPaymentToPending(String hoaDonId, BigDecimal soTien) {
        log.info("Điều chỉnh tiền thừa vào thanh toán chờ/trả sau: hoaDonId={}, soTien={}",
                hoaDonId, soTien);

        // Kiểm tra hóa đơn
        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Lấy các khoản thanh toán chờ xác nhận hoặc trả sau
        List<ThanhToanHoaDon> pendingPayments = hoaDon.getThanhToanHoaDons().stream()
                .filter(p -> p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID ||
                        p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD)
                .collect(Collectors.toList());

        if (pendingPayments.isEmpty()) {
            throw new ValidationException("Không có khoản thanh toán chờ xác nhận hoặc trả sau để điều chỉnh");
        }

        // Lấy khoản thanh toán đầu tiên để điều chỉnh
        ThanhToanHoaDon paymentToAdjust = pendingPayments.get(0);
        BigDecimal oldAmount = paymentToAdjust.getSoTien();
        BigDecimal newAmount = oldAmount.subtract(soTien);

        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            // Nếu số tiền mới âm (giảm nhiều hơn số tiền thanh toán), điều chỉnh về 0
            newAmount = BigDecimal.ZERO;
        }

        // Cập nhật số tiền thanh toán
        paymentToAdjust.setSoTien(newAmount);
        thanhToanHoaDonRepository.save(paymentToAdjust);

        // Lưu lịch sử điều chỉnh
        String moTa = String.format("Điều chỉnh giảm %s trong thanh toán %s do thừa tiền",
                formatCurrency(soTien),
                paymentToAdjust.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD ? "trả sau" : "chờ xác nhận");

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
                formatCurrency(soTien),
                paymentToAdjust.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }
    //delete Hóa đơn
    @Override
    @Transactional
    public HoaDonResponse deleteHoaDon(String hoaDonId, String lyDo) {
        log.info("Hủy hóa đơn với ID: {}", hoaDonId);

        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Kiểm tra trạng thái hóa đơn, chỉ có thể hủy nếu chưa giao hàng
        if (hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN &&
                hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {
            throw new ValidationException("Chỉ có thể hủy hóa đơn khi chưa giao hàng.");
        }
        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;
        boolean needToRestoreStock = !isOnlineOrder || hoaDon.getTrangThai() == HoaDonConstant.TRANG_THAI_DA_XAC_NHAN;

        // Hoàn lại sản phẩm vào kho chỉ khi:
        // - Đơn tại quầy (đã trừ khi thêm vào đơn)
        // - Đơn online đã xác nhận (đã trừ khi xác nhận)
        if (needToRestoreStock) {
            log.info("Hoàn lại sản phẩm vào kho khi hủy đơn hàng {}", hoaDonId);

            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
                    sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
                    sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
                    log.info("Hoàn lại sản phẩm {} vào kho: số lượng mới {}",
                            sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());
                }
            }
        } else {
            log.info("Đơn hàng online chưa xác nhận, không cần hoàn lại số lượng vào kho");
        }

        // Hoàn lại mã giảm giá nếu hóa đơn có voucher
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
            voucher.setSoLuong(voucher.getSoLuong() + 1); // Hoàn lại số lượng voucher
            phieuGiamGiaRepository.save(voucher);
            log.info("Hoàn lại mã giảm giá {}: số lượng mới {}", voucher.getId(), voucher.getSoLuong());

            hoaDon.setPhieuGiamGia(null); // Xóa voucher khỏi hóa đơn
        }

        // THÊM MỚI: Xử lý hoàn tiền cho khách hàng nếu đã thanh toán
        BigDecimal tongTienDaThanhToan = BigDecimal.ZERO;
        BigDecimal tongTienHoanTra = BigDecimal.ZERO;

        // Tính tổng tiền đã thanh toán và đã hoàn trả
        for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
            if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
                tongTienDaThanhToan = tongTienDaThanhToan.add(payment.getSoTien());
            } else if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND) {
                tongTienHoanTra = tongTienHoanTra.add(payment.getSoTien());
            }
        }

        // Tính số tiền cần hoàn lại
        BigDecimal soTienCanHoan = tongTienDaThanhToan.subtract(tongTienHoanTra);

        // Nếu có tiền cần hoàn
        if (soTienCanHoan.compareTo(BigDecimal.ZERO) > 0) {
            log.info("Cần hoàn lại tiền cho khách: {}", formatCurrency(soTienCanHoan));

            // Xác định phương thức hoàn tiền (mặc định là tiền mặt)
            String phuongThucHoanTien = "CASH";

            // Tìm phương thức thanh toán gần nhất để hoàn tiền
            for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
                if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
                    phuongThucHoanTien = payment.getPhuongThucThanhToan().getMaPhuongThucThanhToan();
                    break;
                }
            }

            // Tạo mô tả hoàn tiền
            String moTaHoanTien = "Hoàn tiền do hủy đơn hàng: " +
                    (lyDo != null && !lyDo.isEmpty() ? lyDo.substring(0, Math.min(50, lyDo.length())) : "Hủy đơn hàng");

            // Tạo bản ghi hoàn tiền
            try {
                PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                        .findByMaPhuongThucThanhToan(phuongThucHoanTien)
                        .orElseThrow(() -> new ResourceNotFoundException("Phương thức thanh toán không tồn tại"));

                ThanhToanHoaDon thanhToanHoanTien = new ThanhToanHoaDon();
                thanhToanHoanTien.setHoaDon(hoaDon);
                thanhToanHoanTien.setPhuongThucThanhToan(phuongThuc);
                thanhToanHoanTien.setSoTien(soTienCanHoan);
                thanhToanHoanTien.setTrangThai(PaymentConstant.PAYMENT_STATUS_REFUND); // Trạng thái hoàn tiền
                thanhToanHoanTien.setMoTa(moTaHoanTien);
                thanhToanHoanTien.setNgayTao(LocalDateTime.now());
                thanhToanHoanTien.setNguoiTao(currentUserService.getCurrentUsername());

                thanhToanHoaDonRepository.save(thanhToanHoanTien);
                hoaDon.getThanhToanHoaDons().add(thanhToanHoanTien);

                log.info("Đã tạo bản ghi hoàn tiền {} cho hóa đơn {}", thanhToanHoanTien.getId(), hoaDonId);
            } catch (Exception e) {
                log.error("Lỗi khi tạo bản ghi hoàn tiền: {}", e.getMessage(), e);
                // Vẫn tiếp tục xử lý hủy đơn
            }
        }

        // Cập nhật trạng thái hóa đơn thành "Đã hủy"
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        hoaDon.setNgaySua(LocalDateTime.now());

        String moTa = "Hóa đơn bị hủy: " + (lyDo != null && !lyDo.isEmpty() ? lyDo : "Không có lý do");

        // Lưu lịch sử hủy hóa đơn
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Hủy hóa đơn");
        lichSuHoaDon.setMoTa(moTa);
        lichSuHoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());

        // Thêm thông tin nhân viên nếu có
        try {
            NhanVien nhanVien = currentUserService.getCurrentNhanVien();
            if (nhanVien != null) {
                lichSuHoaDon.setNhanVien(nhanVien);
            }
        } catch (Exception e) {
            log.warn("Không thể lấy thông tin nhân viên hiện tại: {}", e.getMessage());
        }

        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Lưu lịch sử hủy hóa đơn thành công.");

        // Lưu thay đổi hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hủy hóa đơn thành công: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    @Override
    @Transactional
    public HoaDonResponse updateTrangThai(String id, Integer trangThai, List<ThanhToanRequest> thanhToans) {
        log.info("Updating status for invoice id: {} to status: {}", id, trangThai);

        // 1. Tìm hóa đơn cần cập nhật
        HoaDon hoaDon = findHoaDonById(id);
        Integer trangThaiCu = hoaDon.getTrangThai();

        // 2. Kiểm tra tính hợp lệ của trạng thái
        hoaDonValidator.validateUpdateTrangThai(trangThai, hoaDon);
        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) &&
                isOnlineOrder &&
                trangThaiCu.equals(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN)) {

            log.info("Đơn hàng online chuyển sang trạng thái xác nhận, bắt đầu trừ tồn kho");

            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();

                    // Kiểm tra tồn kho trước khi trừ
                    if (sanPhamChiTiet.getSoLuong() < chiTiet.getSoLuong()) {
                        throw new ValidationException(String.format(
                                "Không đủ số lượng tồn kho cho sản phẩm %s (còn %d, cần %d)",
                                sanPhamChiTiet.getMaSanPhamChiTiet(),
                                sanPhamChiTiet.getSoLuong(),
                                chiTiet.getSoLuong()
                        ));
                    }

                    // Trừ số lượng tồn kho
                    sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - chiTiet.getSoLuong());
                    sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);

                    log.info("Đã trừ số lượng tồn kho cho sản phẩm {}: còn lại {}",
                            sanPhamChiTiet.getMaSanPhamChiTiet(), sanPhamChiTiet.getSoLuong());
                }
            }
        }

        // Khi chuyển sang trạng thái hủy đơn từ trạng thái đã xác nhận trở đi
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DA_HUY) &&
                trangThaiCu >= HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {

            log.info("Đơn hàng chuyển sang trạng thái hủy, bắt đầu hoàn lại tồn kho");

            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();

                    // Hoàn lại số lượng vào kho
                    sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
                    sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);

                    log.info("Đã hoàn lại số lượng vào kho cho sản phẩm {}: còn lại {}",
                            sanPhamChiTiet.getMaSanPhamChiTiet(), sanPhamChiTiet.getSoLuong());
                }
            }
        }
        // 3. Kiểm tra nếu chuyển sang trạng thái "Đã xác nhận" và chưa có thanh toán
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN)) {
            // Lấy danh sách thanh toán hiện tại của hóa đơn
            List<ThanhToanHoaDon> existingPayments = thanhToanHoaDonRepository.findByHoaDonId(id);

            // Nếu chưa có thanh toán và không truyền thông tin thanh toán mới
            if (existingPayments.isEmpty() && (thanhToans == null || thanhToans.isEmpty())) {
                throw new ValidationException("Cần cung cấp phương thức thanh toán khi chuyển sang trạng thái xác nhận");
            }

            // Nếu đã có thanh toán trước đó, kiểm tra xem có phụ phí cần thanh toán thêm không
            if (!existingPayments.isEmpty() && thanhToans != null && !thanhToans.isEmpty()) {
                // Tính tổng tiền đã thanh toán, QUAN TRỌNG: bao gồm cả thanh toán đã hoàn thành, chờ xác nhận và trả sau
                BigDecimal tongTienDaThanhToan = existingPayments.stream()
                        .filter(payment -> payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID
                                || payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID
                                || payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD)
                        .map(ThanhToanHoaDon::getSoTien)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tính tổng tiền thanh toán mới
                BigDecimal tongTienThanhToanMoi = thanhToans.stream()
                        .map(ThanhToanRequest::getSoTien)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tổng tiền cần thanh toán
                BigDecimal tongTienCanThanhToan = hoaDon.getTongTien();

                // Kiểm tra xem tổng tiền đã thanh toán và sẽ thanh toán có đủ không
                if (tongTienDaThanhToan.add(tongTienThanhToanMoi).compareTo(tongTienCanThanhToan) < 0) {
                    throw new ValidationException(String.format(
                            "Số tiền thanh toán không đủ. Cần thanh toán thêm %s",
                            formatCurrency(tongTienCanThanhToan.subtract(tongTienDaThanhToan).subtract(tongTienThanhToanMoi))
                    ));
                }

                // Ghi log về việc cần thanh toán thêm
                log.info("Đã có thanh toán trước đó ({}), cần thanh toán thêm ({}) cho hóa đơn {}",
                        formatCurrency(tongTienDaThanhToan),
                        formatCurrency(tongTienThanhToanMoi),
                        id);
            }
            if (!existingPayments.isEmpty()) {
                for (ThanhToanHoaDon payment : existingPayments) {
                    // Nếu là thanh toán "Chưa thanh toán" (không phải COD)
                    if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID) {
                        // Chỉ tự động xác nhận thanh toán cho phương thức không phải COD
                        if (!PaymentConstant.PAYMENT_METHOD_COD.equals(payment.getPhuongThucThanhToan().getMaPhuongThucThanhToan())) {
                            thanhToanHoaDonService.updatePaymentStatus(payment.getId(), PaymentConstant.PAYMENT_STATUS_PAID);
                            log.info("Tự động xác nhận thanh toán {} khi chuyển trạng thái hóa đơn thành 'Đã xác nhận'",
                                    payment.getId());

                            // Lưu lịch sử tự động xác nhận thanh toán
                            LichSuHoaDon lichSuThanhToan = new LichSuHoaDon();
                            lichSuThanhToan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                            lichSuThanhToan.setHoaDon(hoaDon);
                            lichSuThanhToan.setHanhDong("Xác nhận thanh toán tự động");
                            lichSuThanhToan.setMoTa("Tự động xác nhận thanh toán " +
                                    formatCurrency(payment.getSoTien()) +
                                    " qua " + payment.getPhuongThucThanhToan().getTenPhuongThucThanhToan() +
                                    " khi đơn hàng được xác nhận");
                            lichSuThanhToan.setTrangThai(trangThai);
                            lichSuThanhToan.setNgayTao(LocalDateTime.now());
                            lichSuThanhToan.setNhanVien(currentUserService.getCurrentNhanVien());
                            lichSuHoaDonRepository.save(lichSuThanhToan);
                        }
                    }
                }
            }
        }

        // 4. Xử lý thanh toán nếu có thông tin thanh toán
        boolean needPaymentProcessing = (thanhToans != null && !thanhToans.isEmpty());

        if (needPaymentProcessing) {
            try {
                paymentProcessorService.processPaymentOnStatusChange(id, thanhToans);
                log.info("Đã xử lý thanh toán khi chuyển trạng thái cho hóa đơn {}", id);
            } catch (Exception e) {
                log.error("Lỗi khi xử lý thanh toán: {}", e.getMessage(), e);
                throw new ValidationException("Lỗi khi xử lý thanh toán: " + e.getMessage());
            }
        }

        // 5. Cập nhật trạng thái hóa đơn
        hoaDon.setTrangThai(trangThai);
        hoaDon.setNgaySua(LocalDateTime.now());

        // Xử lý thời gian dựa trên trạng thái
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DANG_GIAO)) {
            hoaDon.setThoiGianGiaoHang(LocalDateTime.now());
        } else if (trangThai.equals(HoaDonConstant.TRANG_THAI_HOAN_THANH)) {
            hoaDon.setThoiGianNhanHang(LocalDateTime.now());

            // 6. Khi hóa đơn "Hoàn thành", cập nhật thanh toán từ "Chưa thanh toán" / "Trả sau" thành "Đã thanh toán"
            // LƯU Ý: Tiến hành điều chỉnh có kiểm soát để tránh tạo ra thanh toán thừa
            List<ThanhToanHoaDon> thanhToanList = thanhToanHoaDonRepository.findByHoaDonId(id);

            // 6.1. Tính tổng tiền cần thanh toán (tổng tiền hóa đơn + phí vận chuyển)
            BigDecimal tongTienCanThanhToan = hoaDon.getTongTien();
            if (hoaDon.getPhiVanChuyen() != null && hoaDon.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
                tongTienCanThanhToan = tongTienCanThanhToan.add(hoaDon.getPhiVanChuyen());
            }

            // 6.2. Tính tổng tiền đã thanh toán hiện tại (chỉ PAYMENT_STATUS_PAID)
            BigDecimal tongTienDaThanhToan = thanhToanList.stream()
                    .filter(payment -> payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID)
                    .map(ThanhToanHoaDon::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 6.3. Tính tổng tiền hoàn lại (Refund) hiện tại
            BigDecimal tongTienHoanLai = thanhToanList.stream()
                    .filter(payment -> payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND)
                    .map(ThanhToanHoaDon::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 6.4. Tổng tiền thanh toán thực tế hiện tại = Đã thanh toán - Hoàn lại
            BigDecimal tongTienThucTe = tongTienDaThanhToan.subtract(tongTienHoanLai);

            // 6.5. Tính số tiền còn cần thanh toán = Tổng cần thanh toán - Tổng thực tế
            BigDecimal soTienConThieu = tongTienCanThanhToan.subtract(tongTienThucTe);

            log.info("Tổng tiền cần thanh toán: {}, Đã thanh toán thực tế: {}, Còn thiếu: {}",
                    tongTienCanThanhToan, tongTienThucTe, soTienConThieu);

            // 6.6. Lọc các khoản thanh toán cần chuyển trạng thái (trả sau và chờ thanh toán)
            List<ThanhToanHoaDon> pendingPayments = thanhToanList.stream()
                    .filter(payment -> payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID
                            || payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD)
                    .sorted((p1, p2) -> {
                        // Ưu tiên xử lý khoản thanh toán lớn nhất trước
                        return p2.getSoTien().compareTo(p1.getSoTien());
                    })
                    .collect(Collectors.toList());

            // 6.7. Tổng tiền dự kiến = Tổng hiện tại + Tổng các khoản đang chờ/trả sau
            BigDecimal tongTienDuKien = tongTienThucTe.add(
                    pendingPayments.stream()
                            .map(ThanhToanHoaDon::getSoTien)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
            );

            // 6.8. Kiểm tra xem nếu chuyển tất cả khoản chờ/trả sau thành đã thanh toán thì có thừa tiền không
            BigDecimal soTienDuThua = tongTienDuKien.subtract(tongTienCanThanhToan);
            log.info("Tổng tiền dự kiến sau khi chuyển trạng thái: {}, Thừa/thiếu: {}",
                    tongTienDuKien, soTienDuThua);

            if (soTienDuThua.compareTo(BigDecimal.ZERO) > 0) {
                // Nếu có thừa tiền, tiến hành điều chỉnh số tiền cho khoản thanh toán lớn nhất
                if (!pendingPayments.isEmpty()) {
                    ThanhToanHoaDon largestPayment = pendingPayments.get(0);
                    BigDecimal originalAmount = largestPayment.getSoTien();
                    BigDecimal adjustedAmount = originalAmount.subtract(soTienDuThua);

                    if (adjustedAmount.compareTo(BigDecimal.ZERO) < 0) {
                        // Trường hợp hiếm gặp: Khoản chờ thanh toán bé hơn số tiền cần giảm
                        adjustedAmount = BigDecimal.ZERO;
                    }

                    log.info("Điều chỉnh khoản thanh toán {} từ {} thành {} để tránh thanh toán thừa",
                            largestPayment.getId(), originalAmount, adjustedAmount);

                    // Cập nhật số tiền thanh toán
                    largestPayment.setSoTien(adjustedAmount);
                    thanhToanHoaDonRepository.save(largestPayment);

                    // Ghi lại lịch sử điều chỉnh
                    LichSuHoaDon lichSuDieuChinh = new LichSuHoaDon();
                    lichSuDieuChinh.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                    lichSuDieuChinh.setHoaDon(hoaDon);
                    lichSuDieuChinh.setHanhDong("Điều chỉnh thanh toán");
                    lichSuDieuChinh.setMoTa("Điều chỉnh thanh toán sau khi hoàn thành đơn hàng: " +
                            "giảm từ " + formatCurrency(originalAmount) + " xuống " + formatCurrency(adjustedAmount));
                    lichSuDieuChinh.setTrangThai(hoaDon.getTrangThai());
                    lichSuDieuChinh.setNgayTao(LocalDateTime.now());
                    lichSuDieuChinh.setNhanVien(currentUserService.getCurrentNhanVien());
                    lichSuHoaDonRepository.save(lichSuDieuChinh);
                }
            }

            // 6.9. Bây giờ, chuyển tất cả trạng thái còn lại sang đã thanh toán
            for (ThanhToanHoaDon thanhToan : thanhToanList) {
                if (thanhToan.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID ||
                        thanhToan.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD) {
                    thanhToanHoaDonService.updatePaymentStatus(thanhToan.getId(), PaymentConstant.PAYMENT_STATUS_PAID);
                    log.info("Updated payment {} to PAID for invoice {}", thanhToan.getId(), hoaDon.getId());
                }
            }
        }

        // 7. Lưu thay đổi hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated status for invoice ID: {}", hoaDon.getId());

        // 8. Lưu lịch sử vào bảng `lich_su_hoa_don`
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Cập nhật trạng thái hóa đơn");

        String trangThaiText = HoaDonConstant.getTrangThaiText(trangThai);
        lichSuHoaDon.setMoTa("Cập nhật trạng thái: " + trangThaiText);
        lichSuHoaDon.setTrangThai(trangThai);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Saved invoice history for invoice ID: {}", hoaDon.getId());

        // 9. Trả về response
        return hoaDonMapper.entityToResponse(hoaDon);
    }
    // Phương thức cũ chỉ có trangThai - giữ lại để tương thích

    @Override
    public HoaDonResponse updateTrangThai(String id, Integer trangThai) {
        return updateTrangThai(id, trangThai, null);
    }
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse thanhToanPhuPhi(String hoaDonId, BigDecimal soTien, ThanhToanRequest thanhToanRequest) {
        log.info("Xử lý thanh toán thêm cho hóa đơn: hoaDonId={}, soTien={}", hoaDonId, soTien);

        if (soTien == null || soTien.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Số tiền thanh toán thêm không hợp lệ");
        }

        // 1. Lấy thông tin hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        // 2. Tính riêng biệt tổng tiền thanh toán và tổng tiền hoàn trả
        List<ThanhToanHoaDon> existingPayments = thanhToanHoaDonRepository.findByHoaDonId(hoaDonId);
        BigDecimal tongTienDaThanhToan = BigDecimal.ZERO;
        BigDecimal tongTienHoanTra = BigDecimal.ZERO;

        for (ThanhToanHoaDon payment : existingPayments) {
            if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
                tongTienDaThanhToan = tongTienDaThanhToan.add(payment.getSoTien());
            } else if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND) {
                tongTienHoanTra = tongTienHoanTra.add(payment.getSoTien());
            }
        }

        // 3. Tính số tiền thực tế đã thanh toán (sau khi trừ hoàn tiền)
        BigDecimal tongTienThucTe = tongTienDaThanhToan.subtract(tongTienHoanTra);

        // 4. Tính số tiền còn thiếu - QUAN TRỌNG: Sử dụng tổng tiền từ hóa đơn đã bao gồm phí vận chuyển
        BigDecimal tongTienHoaDon = hoaDon.getTongTien() != null ? hoaDon.getTongTien() : BigDecimal.ZERO;
        BigDecimal phiVanChuyen = hoaDon.getPhiVanChuyen() != null ? hoaDon.getPhiVanChuyen() : BigDecimal.ZERO;
        BigDecimal soTienConThieu = tongTienHoaDon.subtract(tongTienThucTe).add(phiVanChuyen);

        log.info("Hóa đơn {}: Tổng tiền = {}, Đã thanh toán = {}, Đã hoàn = {}, Thực thanh toán = {}, Còn thiếu = {}, Sẽ thanh toán thêm = {}",
                hoaDon.getMaHoaDon(),
                formatCurrency(tongTienHoaDon),
                formatCurrency(tongTienDaThanhToan),
                formatCurrency(tongTienHoanTra),
                formatCurrency(tongTienThucTe),
                formatCurrency(soTienConThieu),
                formatCurrency(soTien));

        // 5. Kiểm tra số tiền thanh toán có phù hợp không
        // Cho phép thanh toán trong khoảng từ 0 đến số tiền còn thiếu + buffer
        BigDecimal bufferAmount = new BigDecimal("10000");
        if (soTien.compareTo(BigDecimal.ZERO) <= 0 || soTien.compareTo(soTienConThieu.add(bufferAmount)) > 0) {
            throw new ValidationException(String.format(
                    "Số tiền thanh toán thêm (%s) phải lớn hơn 0 và không vượt quá số tiền còn thiếu (%s) quá nhiều",
                    formatCurrency(soTien),
                    formatCurrency(soTienConThieu)
            ));
        }

        // 6. Lấy phương thức thanh toán
        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
                .orElseThrow(() -> new ValidationException("Phương thức không hợp lệ: "
                        + thanhToanRequest.getMaPhuongThucThanhToan()));

        // 7. Tạo bản ghi thanh toán
        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
        thanhToanHoaDon.setHoaDon(hoaDon);
        thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
        thanhToanHoaDon.setSoTien(soTien);
        thanhToanHoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
        thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));

        // Mô tả rõ ràng hơn cho thanh toán phụ phí
        String moTaThanhToan = thanhToanRequest.getMoTa() != null && !thanhToanRequest.getMoTa().isEmpty()
                ? thanhToanRequest.getMoTa()
                : "Thanh toán phụ phí sau khi thay đổi hóa đơn";
        thanhToanHoaDon.setMoTa(moTaThanhToan);
        thanhToanHoaDon.setNgayTao(LocalDateTime.now());

        // 8. Lưu thanh toán
        thanhToanHoaDonRepository.save(thanhToanHoaDon);
        hoaDon.getThanhToanHoaDons().add(thanhToanHoaDon);

        // 9. Lưu lịch sử thanh toán thêm
        LichSuHoaDon lichSuThanhToan = new LichSuHoaDon();
        lichSuThanhToan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuThanhToan.setHoaDon(hoaDon);
        lichSuThanhToan.setHanhDong("Thanh toán phụ phí");
        lichSuThanhToan.setMoTa("Thanh toán phụ phí " + formatCurrency(soTien) + " - " + moTaThanhToan);
        lichSuThanhToan.setTrangThai(hoaDon.getTrangThai());
        lichSuThanhToan.setNgayTao(LocalDateTime.now());
        lichSuThanhToan.setNhanVien(currentUserService.getCurrentNhanVien());

        lichSuHoaDonRepository.save(lichSuThanhToan);

        // 10. Lưu thay đổi hóa đơn
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(savedHoaDon);
    }


    @Transactional
    public HoaDonResponse cancelAndRefundOrder(String hoaDonId, String lyDo,
                                               BigDecimal amountToRefund, String refundMethod) {
        log.info("Hủy đơn hàng và hoàn tiền: id={}, lyDo={}, amountToRefund={}, method={}",
                hoaDonId, lyDo, amountToRefund, refundMethod);

        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Kiểm tra trạng thái hóa đơn
        if (hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN &&
                hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {
            throw new ValidationException("Chỉ có thể hủy hóa đơn khi chưa giao hàng.");
        }

        // 1. Hoàn lại sản phẩm vào kho nếu cần
        boolean isOnlineOrder = hoaDon.getLoaiHoaDon() == HoaDonConstant.ONLINE;
        boolean needToRestoreStock = !isOnlineOrder ||
                hoaDon.getTrangThai() == HoaDonConstant.TRANG_THAI_DA_XAC_NHAN;

        if (needToRestoreStock) {
            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
                    sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
                    sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
                }
            }
        }

        // 2. Hoàn lại voucher nếu có
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
            voucher.setSoLuong(voucher.getSoLuong() + 1);
            phieuGiamGiaRepository.save(voucher);
            hoaDon.setPhieuGiamGia(null);
        }

        // 3. Hoàn tiền nếu cần
        if (amountToRefund != null && amountToRefund.compareTo(BigDecimal.ZERO) > 0) {
            // Tạo mô tả hoàn tiền
            String moTaHoanTien = "Hoàn tiền do hủy đơn hàng: " +
                    (lyDo != null ? lyDo.substring(0, Math.min(50, lyDo.length())) : "Hủy đơn hàng");

            // Lấy phương thức thanh toán
            PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                    .findByMaPhuongThucThanhToan(refundMethod)
                    .orElseThrow(() -> new ResourceNotFoundException("Phương thức thanh toán không tồn tại"));

            // Tạo bản ghi hoàn tiền
            ThanhToanHoaDon thanhToanHoanTien = new ThanhToanHoaDon();
            thanhToanHoanTien.setHoaDon(hoaDon);
            thanhToanHoanTien.setPhuongThucThanhToan(phuongThuc);
            thanhToanHoanTien.setSoTien(amountToRefund);
            thanhToanHoanTien.setTrangThai(PaymentConstant.PAYMENT_STATUS_REFUND);
            thanhToanHoanTien.setMoTa(moTaHoanTien);
            thanhToanHoanTien.setNgayTao(LocalDateTime.now());
            thanhToanHoanTien.setNguoiTao(currentUserService.getCurrentUsername());

            thanhToanHoaDonRepository.save(thanhToanHoanTien);
            hoaDon.getThanhToanHoaDons().add(thanhToanHoanTien);
        }

        // 4. Cập nhật trạng thái hóa đơn thành "Đã hủy"
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        hoaDon.setNgaySua(LocalDateTime.now());

        // 5. Lưu lịch sử hủy hóa đơn
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Hủy hóa đơn");
        lichSuHoaDon.setMoTa("Hóa đơn bị hủy: " + (lyDo != null ? lyDo : "Không có lý do"));
        lichSuHoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());

        lichSuHoaDonRepository.save(lichSuHoaDon);

        // 6. Lưu và trả về kết quả
        hoaDon = hoaDonRepository.save(hoaDon);
        return hoaDonMapper.entityToResponse(hoaDon);
    }
    // search
    @Override
    public Page<HoaDonResponse> searchHoaDon(HoaDonSearchCriteria criteria, Pageable pageable) {
        Specification<HoaDon> spec = hoaDonSpecification.createSpecification(criteria);
        return hoaDonRepository.findAll(spec, pageable)
                .map(hoaDonMapper::entityToResponse);
    }

    @Override
    public List<HoaDonStatisticsDTO> getStatistics(LocalDateTime fromDate, LocalDateTime toDate) {
        return hoaDonRepository.getStatistics(fromDate, toDate);
    }

    private String generateMaHoaDon() {
        String randomNumbers = String.format("%06d", new Random().nextInt(1000000));
        return "HD" + randomNumbers;
    }

    // Thêm phương thức mới này vào class HoaDonServiceImpl
    @Transactional
    public HoaDonResponse updateVNPayPayment(String hoaDonId) {
        log.info("Cập nhật thanh toán VNPay cho hóa đơn: {}", hoaDonId);

        HoaDon hoaDon = hoaDonRepository.findHoaDonForUpdate(hoaDonId);
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Không tìm thấy hóa đơn với id: " + hoaDonId);
        }

        // PHASE 1: Kiểm tra và tính toán số tiền
        BigDecimal tongTienHoaDon = hoaDon.getTongTien();
        if (hoaDon.getPhiVanChuyen() != null) {
            tongTienHoaDon = tongTienHoaDon.add(hoaDon.getPhiVanChuyen());
        }

        // Tính tổng đã thanh toán qua các phương thức khác (đã confirmed)
        BigDecimal tongTienDaThanhToan = BigDecimal.ZERO;
        for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
            // Chỉ tính các thanh toán đã xác nhận và không phải VNPAY
            if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID &&
                    !payment.getPhuongThucThanhToan().getMaPhuongThucThanhToan().equals("VNPAY")) {
                tongTienDaThanhToan = tongTienDaThanhToan.add(payment.getSoTien());
                log.info("Đã thanh toán qua {}: {}",
                        payment.getPhuongThucThanhToan().getTenPhuongThucThanhToan(),
                        formatCurrency(payment.getSoTien()));
            }
        }

        // Tính số tiền còn phải thanh toán
        BigDecimal soTienConLai = tongTienHoaDon.subtract(tongTienDaThanhToan);
        log.info("Tổng tiền hóa đơn: {}, Đã thanh toán: {}, Còn lại: {}",
                formatCurrency(tongTienHoaDon), formatCurrency(tongTienDaThanhToan), formatCurrency(soTienConLai));

        // PHASE 2: Xử lý thanh toán VNPAY
        // Tìm phương thức thanh toán VNPAY
        PhuongThucThanhToan phuongThucVNPay = phuongThucThanhToanRepository
                .findByMaPhuongThucThanhToan("VNPAY")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương thức VNPAY"));

        // Check nếu đã có thanh toán VNPAY trong hóa đơn
        Optional<ThanhToanHoaDon> existingPaymentOpt = hoaDon.getThanhToanHoaDons().stream()
                .filter(p -> p.getPhuongThucThanhToan().getMaPhuongThucThanhToan().equals("VNPAY"))
                .findFirst();

        ThanhToanHoaDon thanhToanVNPay;
        if (existingPaymentOpt.isPresent()) {
            // Đã có VNPAY => cập nhật trạng thái và số tiền nếu cần
            thanhToanVNPay = existingPaymentOpt.get();

            // Nếu số tiền là 0, cập nhật thành số tiền còn lại
            if (thanhToanVNPay.getSoTien().compareTo(BigDecimal.ZERO) <= 0) {
                thanhToanVNPay.setSoTien(soTienConLai);
                log.info("Cập nhật số tiền thanh toán VNPAY: {}", formatCurrency(soTienConLai));
            }

            thanhToanVNPay.setTrangThai(PaymentConstant.PAYMENT_STATUS_PAID);
            thanhToanVNPay.setNgaySua(LocalDateTime.now());
            thanhToanVNPay.setNguoiSua(currentUserService.getCurrentUsername());
            thanhToanHoaDonRepository.save(thanhToanVNPay);
            log.info("Cập nhật thanh toán VNPAY thành PAID với số tiền: {}",
                    formatCurrency(thanhToanVNPay.getSoTien()));
        } else {
            // Nếu chưa có, tạo mới khoản thanh toán VNPAY với số tiền còn lại
            thanhToanVNPay = new ThanhToanHoaDon();
            thanhToanVNPay.setHoaDon(hoaDon);
            thanhToanVNPay.setPhuongThucThanhToan(phuongThucVNPay);
            thanhToanVNPay.setSoTien(soTienConLai);
            thanhToanVNPay.setTrangThai(PaymentConstant.PAYMENT_STATUS_PAID);
            thanhToanVNPay.setMoTa("Thanh toán VNPAY");
            thanhToanVNPay.setNgayTao(LocalDateTime.now());
            thanhToanVNPay.setNguoiTao(currentUserService.getCurrentUsername());

            thanhToanHoaDonRepository.save(thanhToanVNPay);
            hoaDon.getThanhToanHoaDons().add(thanhToanVNPay);
            log.info("Đã tạo khoản thanh toán VNPAY mới với số tiền: {}",
                    formatCurrency(soTienConLai));
        }

        // PHASE 3: Cập nhật trạng thái hóa đơn
        LocalDateTime thoiGianHoanThanh = LocalDateTime.now();

        // Xác định loại hóa đơn và trạng thái cuối cùng
        Integer loaiHoaDon = hoaDon.getLoaiHoaDon();
        Integer trangThaiCuoiCung = (loaiHoaDon == 3) ? HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG
                : HoaDonConstant.TRANG_THAI_HOAN_THANH;

        // Tạo danh sách các lichSuHoaDon cần lưu, thay vì gọi saveLichSuHoaDon lần lượt
        List<LichSuHoaDon> lichSuList = new ArrayList<>();

        // Tạo các đối tượng LichSuHoaDon tuần tự theo thứ tự thời gian
        if (loaiHoaDon == 3) { // Nếu là đơn giao hàng
            // 1. Lưu lịch sử "Đã xác nhận"
            LichSuHoaDon lichSuDaXacNhan = new LichSuHoaDon();
            lichSuDaXacNhan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuDaXacNhan.setHoaDon(hoaDon);
            lichSuDaXacNhan.setHanhDong("Cập nhật trạng thái hóa đơn");
            lichSuDaXacNhan.setMoTa("Chuyển trạng thái: " +
                    HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) +
                    " sau khi thanh toán VNPAY thành công");
            lichSuDaXacNhan.setTrangThai(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN);
            lichSuDaXacNhan.setNgayTao(thoiGianHoanThanh);
            lichSuDaXacNhan.setNhanVien(currentUserService.getCurrentNhanVien());
            lichSuList.add(lichSuDaXacNhan);

            // 2. Lưu lịch sử "Chờ giao hàng"
            LichSuHoaDon lichSuChoGiao = new LichSuHoaDon();
            lichSuChoGiao.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuChoGiao.setHoaDon(hoaDon);
            lichSuChoGiao.setHanhDong("Cập nhật trạng thái hóa đơn");
            lichSuChoGiao.setMoTa("Chuyển trạng thái: " +
                    HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG) +
                    " sau khi thanh toán VNPAY thành công");
            lichSuChoGiao.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG);
            lichSuChoGiao.setNgayTao(thoiGianHoanThanh.plusSeconds(2)); // Đảm bảo thứ tự
            lichSuChoGiao.setNhanVien(currentUserService.getCurrentNhanVien());
            lichSuList.add(lichSuChoGiao);
        } else { // Nếu là đơn tại quầy
            // 1. Lưu lịch sử "Đã xác nhận"
            LichSuHoaDon lichSuDaXacNhan = new LichSuHoaDon();
            lichSuDaXacNhan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuDaXacNhan.setHoaDon(hoaDon);
            lichSuDaXacNhan.setHanhDong("Cập nhật trạng thái hóa đơn");
            lichSuDaXacNhan.setMoTa("Chuyển trạng thái: " +
                    HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) +
                    " sau khi thanh toán VNPAY thành công");
            lichSuDaXacNhan.setTrangThai(HoaDonConstant.TRANG_THAI_DA_XAC_NHAN);
            lichSuDaXacNhan.setNgayTao(thoiGianHoanThanh);
            lichSuDaXacNhan.setNhanVien(currentUserService.getCurrentNhanVien());
            lichSuList.add(lichSuDaXacNhan);

            // 2. Lưu lịch sử "Hoàn thành"
            LichSuHoaDon lichSuHoanThanh = new LichSuHoaDon();
            lichSuHoanThanh.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            lichSuHoanThanh.setHoaDon(hoaDon);
            lichSuHoanThanh.setHanhDong("Cập nhật trạng thái hóa đơn");
            lichSuHoanThanh.setMoTa("Chuyển trạng thái: " +
                    HoaDonConstant.getTrangThaiText(HoaDonConstant.TRANG_THAI_HOAN_THANH) +
                    " sau khi thanh toán VNPAY thành công");
            lichSuHoanThanh.setTrangThai(HoaDonConstant.TRANG_THAI_HOAN_THANH);
            lichSuHoanThanh.setNgayTao(thoiGianHoanThanh.plusSeconds(2)); // Đảm bảo thứ tự
            lichSuHoanThanh.setNhanVien(currentUserService.getCurrentNhanVien());
            lichSuList.add(lichSuHoanThanh);
        }

        // Lưu tất cả lịch sử vào database với thứ tự đã xác định
        lichSuHoaDonRepository.saveAll(lichSuList);
        log.info("Đã lưu {} bản ghi lịch sử trạng thái theo thứ tự", lichSuList.size());

        // Cập nhật trạng thái hóa đơn
        hoaDon.setTrangThai(trangThaiCuoiCung);
        hoaDon.setNgaySua(thoiGianHoanThanh);
        hoaDonRepository.save(hoaDon);

        // Ghi lịch sử xác nhận thanh toán VNPAY
        LichSuHoaDon lichSu = new LichSuHoaDon();
        lichSu.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSu.setHoaDon(hoaDon);
        lichSu.setHanhDong("Xác nhận thanh toán VNPAY");
        lichSu.setMoTa("Thanh toán qua VNPAY thành công số tiền: " +
                formatCurrency(thanhToanVNPay.getSoTien()) +
                (tongTienDaThanhToan.compareTo(BigDecimal.ZERO) > 0 ?
                        " (Đã thanh toán trước đó: " + formatCurrency(tongTienDaThanhToan) + ")" : ""));
        lichSu.setTrangThai(hoaDon.getTrangThai());
        lichSu.setNgayTao(LocalDateTime.now());
        lichSu.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSu);

        log.info("Đã xử lý thanh toán VNPAY thành công cho hóa đơn {}", hoaDon.getId());
        return hoaDonMapper.entityToResponse(hoaDon);
    }

    @Override
    public Optional<HoaDon> findById(String id) {
        return hoaDonRepository.findById(id);
    }

    @Override
    public byte[] generateInvoicePDF(String id) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            validateInvoiceForPrinting(hoaDon);
            return pdfGenerator.generateInvoicePDF(hoaDon);

        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }
    @Override
    public byte[] generateDeliveryInvoicePDF(String id) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            validateInvoiceForPrinting(hoaDon);
            return pdfGenerator.generateDeliveryInvoicePDF(hoaDon);
        } catch (Exception e) {
            log.error("Error generating delivery PDF for invoice {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo PDF giao hàng: " + e.getMessage());
        }
    }

    private void validateInvoiceForPrinting(HoaDon hoaDon) {
        // Nếu là khách hàng lẻ, bỏ qua kiểm tra thông tin cá nhân
        boolean isKhachHangLe = (hoaDon.getKhachHang() == null ||
                "Khách hàng lẻ".equalsIgnoreCase(hoaDon.getTenNguoiNhan()));

        // Kiểm tra tổng tiền
        if (hoaDon.getTongTien() == null) {
            throw new IllegalStateException("Hóa đơn không có thông tin tổng tiền");
        }

        // Nếu không phải khách hàng lẻ, kiểm tra thông tin người nhận
        if (!isKhachHangLe) {
            if (hoaDon.getTenNguoiNhan() == null || hoaDon.getTenNguoiNhan().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có thông tin người nhận");
            }

            if (hoaDon.getSoDienThoai() == null || hoaDon.getSoDienThoai().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có số điện thoại");
            }

            if (hoaDon.getDiaChi() == null || hoaDon.getDiaChi().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có địa chỉ");
            }
        }

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
            case PaymentConstant.PAYMENT_METHOD_VNPAY:
                return PaymentConstant.PAYMENT_STATUS_PAID;
            default:
                log.warn(" Phát hiện phương thức thanh toán không hợp lệ: {}", phuongThucId);
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Mặc định là chưa thanh toán
        }
    }

    @Transactional
    public HoaDonResponse refundExcessPayment(
            String hoaDonId,
            BigDecimal soTien,
            String maPhuongThucThanhToan,
            String moTa) {

        log.info("Xử lý hoàn tiền thừa: hoaDonId={}, soTien={}, phuongThuc={}",
                hoaDonId, soTien, maPhuongThucThanhToan);

        // Kiểm tra hoá đơn
        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Kiểm tra số tiền thừa thực tế
        BigDecimal excessAmount = calculateExcessPayment(hoaDonId);
        if (excessAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Không có tiền thừa cần hoàn lại");
        }

        // Kiểm tra số tiền hoàn lại không vượt quá số tiền thừa
        if (soTien.compareTo(excessAmount) > 0) {
            throw new ValidationException(String.format(
                    "Số tiền hoàn (%s) không được vượt quá số tiền thừa (%s)",
                    formatCurrency(soTien),
                    formatCurrency(excessAmount)
            ));
        }

        // Lấy phương thức thanh toán
        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
                .findByMaPhuongThucThanhToan(maPhuongThucThanhToan)
                .orElseThrow(() -> new ValidationException("Phương thức không hợp lệ"));

        // Tạo bản ghi hoàn tiền
        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
        thanhToan.setHoaDon(hoaDon);
        thanhToan.setPhuongThucThanhToan(phuongThuc);
        thanhToan.setSoTien(soTien);
        thanhToan.setNgayTao(LocalDateTime.now());
        thanhToan.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
        // Đảm bảo trạng thái hoàn tiền luôn là PAYMENT_STATUS_REFUND (4) thay vì 3
        thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_REFUND);

        // Xử lý mô tả rõ ràng
        String finalMotaThanhtoan;
        if (moTa != null && !moTa.trim().isEmpty()) {
            finalMotaThanhtoan = moTa;
        } else {
            finalMotaThanhtoan = PaymentConstant.PAYMENT_TYPE_REFUND_EXCESS;
        }
        thanhToan.setMoTa(finalMotaThanhtoan);

        thanhToanHoaDonRepository.save(thanhToan);
        hoaDon.getThanhToanHoaDons().add(thanhToan);

        // Lưu lịch sử hoàn tiền
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Hoàn tiền");
        lichSuHoaDon.setMoTa("Hoàn tiền thừa " + formatCurrency(soTien) + " cho khách hàng: " + finalMotaThanhtoan);
        lichSuHoaDon.setTrangThai(hoaDon.getTrangThai());
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    public BigDecimal calculateExcessPayment(String hoaDonId) {
        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Tính tổng tiền đã thanh toán (chỉ tính các khoản thực sự thanh toán - trạng thái 1)
        BigDecimal tongTienDaThanhToan = BigDecimal.ZERO;
        BigDecimal tongTienHoanTraLai = BigDecimal.ZERO;

        for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
            // Chỉ tính các thanh toán có trạng thái = PAYMENT_STATUS_PAID
            if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
                tongTienDaThanhToan = tongTienDaThanhToan.add(payment.getSoTien());
                log.debug("Tính khoản thanh toán: {}, phương thức: {}, số tiền: {}",
                        payment.getId(),
                        payment.getPhuongThucThanhToan().getTenPhuongThucThanhToan(),
                        payment.getSoTien());
            }
            // Chỉ tính các hoàn tiền có trạng thái = PAYMENT_STATUS_REFUND
            else if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND) {
                tongTienHoanTraLai = tongTienHoanTraLai.add(payment.getSoTien());
                log.debug("Tính khoản hoàn tiền: {}, phương thức: {}, số tiền: {}",
                        payment.getId(),
                        payment.getPhuongThucThanhToan().getTenPhuongThucThanhToan(),
                        payment.getSoTien());
            }
        }

        // Tính số tiền thực tế đã thanh toán (đã trừ các khoản hoàn)
        BigDecimal soTienThucTeThanhToan = tongTienDaThanhToan.subtract(tongTienHoanTraLai);

        // Tổng tiền cần thanh toán = Tổng tiền hóa đơn (đã bao gồm giảm giá) + Phí vận chuyển
        BigDecimal tongTienCanThanhToan = hoaDon.getTongTien();

        // Cộng phí vận chuyển nếu có
        if (hoaDon.getPhiVanChuyen() != null && hoaDon.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
            tongTienCanThanhToan = tongTienCanThanhToan.add(hoaDon.getPhiVanChuyen());
        }

        log.info("Hóa đơn {}: Tổng đã thanh toán = {}, Đã hoàn trả = {}, Thực thanh toán = {}, Tổng cần thanh toán (gồm phí ship) = {}",
                hoaDonId,
                formatCurrency(tongTienDaThanhToan),
                formatCurrency(tongTienHoanTraLai),
                formatCurrency(soTienThucTeThanhToan),
                formatCurrency(tongTienCanThanhToan));

        // Tính số tiền thừa (nếu có)
        if (soTienThucTeThanhToan.compareTo(tongTienCanThanhToan) > 0) {
            BigDecimal excess = soTienThucTeThanhToan.subtract(tongTienCanThanhToan);
            log.info("Phát hiện khách đã thanh toán thừa: {}", formatCurrency(excess));
            return excess;
        }

        return BigDecimal.ZERO;
    }
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }
}
