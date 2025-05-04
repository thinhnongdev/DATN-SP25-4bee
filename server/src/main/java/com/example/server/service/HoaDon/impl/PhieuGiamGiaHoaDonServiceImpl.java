package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.interfaces.IPhieuGiamGia;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.HoaDon.interfaces.IPhieuGiamGiaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhieuGiamGiaHoaDonServiceImpl implements IPhieuGiamGiaService {
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final IPhieuGiamGia mapper;
    private final HoaDonRepository hoaDonRepository;
    @Override
    public List<PhieuGiamGiaResponse> getAvailableVouchersForOrder(BigDecimal orderTotal, String customerId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Lấy phiếu giảm giá công khai
        List<PhieuGiamGiaResponse> publicVouchers = phieuGiamGiaRepository.findAllCongKhai().stream()
                .filter(voucher ->
                        voucher.getSoLuong() > 0 &&
                                now.isAfter(voucher.getNgayBatDau()) &&
                                now.isBefore(voucher.getNgayKetThuc()) &&
                                orderTotal.compareTo(voucher.getGiaTriToiThieu()) >= 0
                )
                .map(mapper::entityToResponse)
                .collect(Collectors.toList());

        log.info("Found {} public vouchers", publicVouchers.size());

        // 2. Lấy phiếu giảm giá cá nhân của khách hàng cụ thể
        List<PhieuGiamGiaResponse> personalVouchers = new ArrayList<>();
        if (customerId != null && !customerId.isEmpty() && !"Khách hàng lẻ".equals(customerId)) {
            personalVouchers = phieuGiamGiaRepository.findPersonalVouchers(customerId, now).stream()
                    .filter(voucher -> orderTotal.compareTo(voucher.getGiaTriToiThieu()) >= 0)
                    .map(mapper::entityToResponse)
                    .collect(Collectors.toList());

            log.info("Found {} personal vouchers for customer {}", personalVouchers.size(), customerId);
        }

        // 3. Gộp danh sách và loại bỏ trùng lặp
        List<PhieuGiamGiaResponse> allVouchers = Stream.concat(publicVouchers.stream(), personalVouchers.stream())
                .distinct()
                .collect(Collectors.toList());

        log.info("Total vouchers available: {}", allVouchers.size());

        return allVouchers;
    }

    @Override
    public PhieuGiamGia validateAndGet(String id) {
        return phieuGiamGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu giảm giá không tồn tại"));
    }

    @Override
    public Map<String, Object> findBetterVouchers(String hoaDonId, String currentVoucherId) {
        log.info("Finding better vouchers for order {} with current voucher {}", hoaDonId, currentVoucherId);
        Map<String, Object> result = new HashMap<>();

        try {
            // 1. Lấy thông tin hóa đơn
            HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + hoaDonId));

            // 2. Tính tổng giá trị đơn hàng (không bao gồm phí vận chuyển)
            BigDecimal subtotal = calculateSubtotal(hoaDon);

            // 3. Lấy thông tin khách hàng
            String customerId = hoaDon.getKhachHang() != null ? hoaDon.getKhachHang().getId() : null;

            // 4. Lấy thông tin voucher hiện tại (nếu có)
            PhieuGiamGia currentVoucher = null;
            BigDecimal currentDiscount = BigDecimal.ZERO;

            if (currentVoucherId != null && !currentVoucherId.isEmpty()) {
                currentVoucher = phieuGiamGiaRepository.findById(currentVoucherId)
                        .orElse(null);
            } else if (hoaDon.getPhieuGiamGia() != null) {
                currentVoucher = hoaDon.getPhieuGiamGia();
            }

            if (currentVoucher != null) {
                currentDiscount = calculateDiscountAmount(currentVoucher, subtotal);
            }

            // 5. Lấy danh sách voucher có thể áp dụng
            LocalDateTime now = LocalDateTime.now();
            List<PhieuGiamGia> applicableVouchers = new ArrayList<>();

            // 5.1 Lấy phiếu giảm giá công khai
            List<PhieuGiamGia> publicVouchers = phieuGiamGiaRepository.findAllCongKhai();
            applicableVouchers.addAll(publicVouchers.stream()
                    .filter(voucher ->
                            voucher.getSoLuong() > 0 &&
                                    now.isAfter(voucher.getNgayBatDau()) &&
                                    now.isBefore(voucher.getNgayKetThuc()))
                    .collect(Collectors.toList()));

            // 5.2 Lấy phiếu giảm giá cá nhân
            if (customerId != null && !customerId.isEmpty()) {
                List<PhieuGiamGia> personalVouchers = phieuGiamGiaRepository.findPersonalVouchers(customerId, now);
                applicableVouchers.addAll(personalVouchers);
            }

            // 6. Phân tích và so sánh các voucher
            List<Map<String, Object>> betterVouchers = new ArrayList<>();
            List<Map<String, Object>> otherVouchers = new ArrayList<>();

            for (PhieuGiamGia voucher : applicableVouchers) {
                // Bỏ qua voucher hiện tại
                if (currentVoucher != null && voucher.getId().equals(currentVoucher.getId())) {
                    continue;
                }

                // Tính giá trị giảm giá của voucher này khi đủ điều kiện
                BigDecimal potentialDiscountAmount;

                // Nếu đơn hàng đủ điều kiện áp dụng voucher này
                if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                    potentialDiscountAmount = calculateDiscountAmount(voucher, subtotal);
                } else {
                    // Nếu đơn hàng chưa đủ điều kiện, tính giảm giá giả định khi đạt đủ điều kiện tối thiểu
                    potentialDiscountAmount = calculateDiscountAmount(voucher, voucher.getGiaTriToiThieu());
                }

                // Tính số tiền cần thêm nếu voucher có giá trị tối thiểu cao hơn
                BigDecimal amountNeeded = BigDecimal.ZERO;
                if (subtotal.compareTo(voucher.getGiaTriToiThieu()) < 0) {
                    amountNeeded = voucher.getGiaTriToiThieu().subtract(subtotal);
                }

                Map<String, Object> voucherData = new HashMap<>();
                voucherData.put("id", voucher.getId());
                voucherData.put("maPhieuGiamGia", voucher.getMaPhieuGiamGia());
                voucherData.put("tenPhieuGiamGia", voucher.getTenPhieuGiamGia());
                voucherData.put("loaiPhieuGiamGia", voucher.getLoaiPhieuGiamGia());
                voucherData.put("giaTriGiam", voucher.getGiaTriGiam());
                voucherData.put("giaTriToiThieu", voucher.getGiaTriToiThieu());
                voucherData.put("soTienGiamToiDa", voucher.getSoTienGiamToiDa());
                voucherData.put("amountNeeded", amountNeeded);
                voucherData.put("canApply", subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0);

                // Nếu đủ điều kiện áp dụng voucher, tính giảm giá thực tế
                // Nếu chưa đủ điều kiện, vẫn đặt discountAmount = potentialDiscountAmount để UI hiển thị
                voucherData.put("discountAmount", potentialDiscountAmount);

                // So sánh với voucher hiện tại để xem có tốt hơn không
                boolean isBetter = potentialDiscountAmount.compareTo(currentDiscount) > 0;
                voucherData.put("isBetter", isBetter);

                // Tiết kiệm thêm bao nhiêu so với voucher hiện tại
                if (isBetter) {
                    voucherData.put("additionalSavings", potentialDiscountAmount.subtract(currentDiscount));
                    betterVouchers.add(voucherData);
                } else {
                    voucherData.put("additionalSavings", BigDecimal.ZERO);
                    otherVouchers.add(voucherData);
                }
            }

            // Sắp xếp voucher tốt hơn theo giá trị giảm giá giảm dần
            betterVouchers.sort((v1, v2) -> ((BigDecimal) v2.get("discountAmount"))
                    .compareTo((BigDecimal) v1.get("discountAmount")));

            // 7. Chuẩn bị kết quả trả về
            result.put("orderTotal", subtotal);
            result.put("currentVoucher", currentVoucher != null ? mapper.entityToResponse(currentVoucher) : null);
            result.put("currentDiscount", currentDiscount);
            result.put("betterVouchers", betterVouchers);
            result.put("otherVouchers", otherVouchers);
            result.put("hasBetterVouchers", !betterVouchers.isEmpty());

        } catch (Exception e) {
            log.error("Error finding better vouchers: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // Phương thức hỗ trợ tính tổng tiền đơn hàng
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

    // Phương thức tính toán số tiền giảm giá
    private BigDecimal calculateDiscountAmount(PhieuGiamGia voucher, BigDecimal total) {
        if (voucher == null || total == null || total.compareTo(voucher.getGiaTriToiThieu()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountAmount;

        if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo phần trăm
            BigDecimal giaTriGiamDecimal = BigDecimal.valueOf(voucher.getGiaTriGiam().doubleValue());
            discountAmount = total.multiply(giaTriGiamDecimal)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            // Kiểm tra giới hạn giảm giá tối đa
            if (voucher.getSoTienGiamToiDa() != null &&
                    discountAmount.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                discountAmount = voucher.getSoTienGiamToiDa();
            }
        } else { // Giảm theo số tiền cố định
            discountAmount = voucher.getGiaTriGiam();
            // Đảm bảo không giảm quá tổng tiền
            if (discountAmount.compareTo(total) > 0) {
                discountAmount = total;
            }
        }

        return discountAmount;
    }
}