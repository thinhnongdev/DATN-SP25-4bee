package com.example.server.service.HoaDon.impl;
import com.example.server.constant.PaymentConstant;
import com.example.server.dto.HoaDon.request.ThanhToanRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.interfaces.IHoaDonMapper;
import com.example.server.repository.HoaDon.*;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;
import com.example.server.service.HoaDon.interfaces.IPaymentProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessorServiceImpl implements IPaymentProcessorService {

    private final HoaDonRepository hoaDonRepository;
    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;
    private final LichSuHoaDonRepository lichSuHoaDonRepository;
    private final IHoaDonMapper hoaDonMapper;
    private final ICurrentUserService currentUserService;


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
            // Nếu đã có thanh toán trước đó, số tiền thanh toán mới phải đúng bằng số tiền còn thiếu
            // Hoặc không thanh toán thêm nếu đã đủ
            if (tongTienCanThanhToanThem.compareTo(BigDecimal.ZERO) <= 0) {
                log.info("Hóa đơn {} đã được thanh toán đủ trước đó, không cần thanh toán thêm", hoaDonId);
                return hoaDonMapper.entityToResponse(hoaDon);
            } else if (tongTienThanhToanMoi.compareTo(tongTienCanThanhToanThem) != 0) {
                throw new ValidationException(String.format(
                        "Số tiền thanh toán thêm (%s) phải bằng số tiền còn thiếu (%s)",
                        formatCurrency(tongTienThanhToanMoi),
                        formatCurrency(tongTienCanThanhToanThem)
                ));
            }
        } else {
            // Nếu chưa có thanh toán nào, số tiền thanh toán mới phải đủ hoặc lớn hơn tổng tiền hóa đơn
            if (tongTienThanhToanMoi.compareTo(tongTienHoaDon) < 0) {
                throw new ValidationException(String.format(
                        "Tổng tiền thanh toán (%s) không đủ để thanh toán hóa đơn (%s)",
                        formatCurrency(tongTienThanhToanMoi),
                        formatCurrency(tongTienHoaDon)
                ));
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
            thanhToanHoaDon.setMoTa("Thanh toán hóa đơn " + hoaDon.getMaHoaDon());
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

//    @Override
//    @Transactional(rollbackFor = Exception.class)
//    public HoaDonResponse thanhToanPhuPhi(String hoaDonId, BigDecimal soTien, ThanhToanRequest thanhToanRequest) {
//        log.info("Xử lý thanh toán thêm cho hóa đơn: hoaDonId={}, soTien={}", hoaDonId, soTien);
//
//        if (soTien == null || soTien.compareTo(BigDecimal.ZERO) <= 0) {
//            throw new ValidationException("Số tiền thanh toán thêm không hợp lệ");
//        }
//
//        // 1. Lấy thông tin hóa đơn
//        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));
//
//        // 2. Tính tổng tiền đã thanh toán
//        List<ThanhToanHoaDon> existingPayments = thanhToanHoaDonRepository.findByHoaDonId(hoaDonId);
//        BigDecimal tongTienDaThanhToan = existingPayments.stream()
//                .map(ThanhToanHoaDon::getSoTien)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        // 3. Tính số tiền còn thiếu
//        BigDecimal tongTienHoaDon = hoaDon.getTongTien();
//        BigDecimal soTienConThieu = tongTienHoaDon.subtract(tongTienDaThanhToan);
//
//        log.info("Hóa đơn {}: Tổng tiền = {}, Đã thanh toán = {}, Còn thiếu = {}, Sẽ thanh toán thêm = {}",
//                hoaDonId,
//                formatCurrency(tongTienHoaDon),
//                formatCurrency(tongTienDaThanhToan),
//                formatCurrency(soTienConThieu),
//                formatCurrency(soTien));
//
//        // 4. Kiểm tra số tiền thanh toán có phù hợp không
//        if (soTien.compareTo(soTienConThieu) != 0) {
//            throw new ValidationException(String.format(
//                    "Số tiền thanh toán thêm (%s) phải bằng số tiền còn thiếu (%s)",
//                    formatCurrency(soTien),
//                    formatCurrency(soTienConThieu)
//            ));
//        }
//
//        // 5. Lấy phương thức thanh toán
//        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
//                .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
//                .orElseThrow(() -> new ValidationException("Phương thức không hợp lệ: "
//                        + thanhToanRequest.getMaPhuongThucThanhToan()));
//
//        // 6. Tạo bản ghi thanh toán
//        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
//        thanhToanHoaDon.setHoaDon(hoaDon);
//        thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
//        thanhToanHoaDon.setSoTien(soTien);
//        thanhToanHoaDon.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
//        thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));
//        thanhToanHoaDon.setMoTa("Thanh toán thêm sau khi thêm sản phẩm");
//        thanhToanHoaDon.setNgayTao(LocalDateTime.now());
//
//        // 7. Lưu thanh toán
//        thanhToanHoaDonRepository.save(thanhToanHoaDon);
//        hoaDon.getThanhToanHoaDons().add(thanhToanHoaDon);
//
//        // 8. Lưu lịch sử thanh toán thêm
//        LichSuHoaDon lichSuThanhToan = new LichSuHoaDon();
//        lichSuThanhToan.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
//        lichSuThanhToan.setHoaDon(hoaDon);
//        lichSuThanhToan.setHanhDong("Thanh toán thêm");
//        lichSuThanhToan.setMoTa("Thanh toán thêm " + formatCurrency(soTien) + " sau khi thêm sản phẩm");
//        lichSuThanhToan.setTrangThai(hoaDon.getTrangThai());
//        lichSuThanhToan.setNgayTao(LocalDateTime.now());
//        lichSuThanhToan.setNhanVien(currentUserService.getCurrentNhanVien());
//
//        lichSuHoaDonRepository.save(lichSuThanhToan);
//
//        // 9. Lưu thay đổi hóa đơn
//        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
//
//        return hoaDonMapper.entityToResponse(savedHoaDon);
//    }

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

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }
}