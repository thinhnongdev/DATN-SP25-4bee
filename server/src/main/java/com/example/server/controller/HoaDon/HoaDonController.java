package com.example.server.controller.HoaDon;

import com.example.server.constant.PaymentConstant;
import com.example.server.dto.GiaoHang.GHNTinhPhiRequest;
import com.example.server.dto.HoaDon.request.*;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.entity.ThanhToanHoaDon;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.impl.HoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.BanHang.impl.BanHangServiceImpl;
import com.example.server.service.GiaoHang.GHNService;
import com.example.server.service.HoaDon.impl.HoaDonServiceImpl;
import com.example.server.service.WebSocketService;
import com.example.server.service.HoaDon.impl.HoaDonSanPhamServiceImpl;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.example.server.constant.PaymentConstant.PAYMENT_METHOD_VNPAY;

@RestController
@RequestMapping("/api/admin/hoa-don")
@RequiredArgsConstructor
@Tag(name = "Quản lý hóa đơn", description = "API quản lý hóa đơn")
@Slf4j
public class HoaDonController {
    private final IHoaDonService hoaDonService;
    private final HoaDonServiceImpl service;
    private final HoaDonSanPhamServiceImpl hoaDonSanPhamServiceImpl;
    private final WebSocketService webSocketService; // Inject WebSocket Service
    private final HoaDonMapper hoaDonMapper;
    private final HoaDonRepository hoaDonRepository;
    private final BanHangServiceImpl banHangServiceImpl;
    @Autowired
    BanHangService banHangService;
    @Autowired
    private GHNService ghnService;

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy thông tin hóa đơn theo ID")
    public ResponseEntity<HoaDonResponse> getHoaDonById(@PathVariable String id) {
        try {
            HoaDonResponse response = hoaDonService.getHoaDonById(id);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            log.error("Invoice not found with id: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Error fetching invoice with id {}: ", id, e);
            throw e;
        }
    }

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách hóa đơn có phân trang")
    public ResponseEntity<Page<HoaDonResponse>> getAllHoaDon(
            @PageableDefault(size = 10, sort = "ngayTao", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(hoaDonService.getAllHoaDon(pageable));
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin hóa đơn")
    public ResponseEntity<HoaDonResponse> updateHoaDon(
            @PathVariable String id,
            @Valid @RequestBody HoaDonRequest request) {
        log.info("Received update request for invoice {}: {}", id, request);
        webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
        return ResponseEntity.ok(hoaDonService.updateHoaDon(id, request));
    }

    @PostMapping("/{id}/refund-to-pending")
    @Operation(summary = "Điều chỉnh tiền thừa vào thanh toán chờ xác nhận hoặc trả sau")
    public ResponseEntity<HoaDonResponse> refundToPending(
            @PathVariable String id,
            @RequestBody RefundRequest request) {
        try {
            HoaDonResponse response = service.refundExcessPaymentToPending(id, request.getSoTien());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi điều chỉnh tiền thừa: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    @GetMapping("/{hoaDonId}/excess-payment")
    public ResponseEntity<Map<String, Object>> getExcessPaymentInfo(@PathVariable String hoaDonId) {
        BigDecimal excessAmount = service.calculateExcessPayment(hoaDonId);

        Map<String, Object> response = new HashMap<>();
        response.put("excessAmount", excessAmount);
        response.put("hasExcessPayment", excessAmount.compareTo(BigDecimal.ZERO) > 0);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Hoàn tiền thừa cho khách hàng")
    public ResponseEntity<HoaDonResponse> refundExcessPayment(
            @PathVariable String id,
            @RequestBody RefundRequest request) {
        try {
            HoaDonResponse response = service.refundExcessPayment(
                    id, request.getSoTien(), request.getMaPhuongThucThanhToan(), request.getMoTa());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi hoàn tiền: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn hàng và hoàn tiền trong một giao dịch")
    public ResponseEntity<HoaDonResponse> cancelOrder(
            @PathVariable String id,
            @RequestBody CancelOrderRequest request) {
        try {
            HoaDonResponse response = service.cancelAndRefundOrder(
                    id, request.getLyDo(), request.getAmountToRefund(), request.getRefundMethod());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn và hoàn tiền: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Lớp yêu cầu cho API hủy đơn
    @lombok.Data
    public static class CancelOrderRequest {
        private String lyDo;
        private BigDecimal amountToRefund;
        private String refundMethod;
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy hóa đơn và hoàn lại sản phẩm")
    public ResponseEntity<HoaDonResponse> cancelHoaDon(@PathVariable String id,  @RequestParam(required = false) String lyDo) {
//        HoaDonResponse response = hoaDonService.deleteHoaDon(id);
//        return ResponseEntity.ok(response);
        return ResponseEntity.ok(hoaDonService.deleteHoaDon(id, lyDo));
    }
// GHN
    @PostMapping("/phi-van-chuyen")
    public int layPhiVanChuyen(@RequestBody GHNTinhPhiRequest request) {
        return ghnService.tinhPhiVanChuyen(request);
    }

    @PostMapping("/{id}/cap-nhat-phi-van-chuyen")
    public ResponseEntity<HoaDonResponse> capNhatPhiVanChuyen(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {

        try {
            // Lấy giá trị fee từ request
            int phiVanChuyen = 0;
            if (request.containsKey("fee")) {
                phiVanChuyen = ((Number) request.get("fee")).intValue();
            }

            // Lấy hóa đơn
            HoaDon hoaDon = hoaDonService.validateAndGet(id);

            // Tính tổng tiền sản phẩm
            BigDecimal subtotal = calculateSubtotal(hoaDon);

            // Tính giảm giá
            BigDecimal discount = BigDecimal.ZERO;
            if (hoaDon.getPhieuGiamGia() != null) {
                // Tính toán giảm giá tương tự như trong recalculateTotal
                PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
                if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                    if (voucher.getLoaiPhieuGiamGia() == 1) {
                        BigDecimal giaTriGiamDecimal = BigDecimal.valueOf(voucher.getGiaTriGiam().doubleValue());
                        discount = subtotal.multiply(giaTriGiamDecimal)
                                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                        if (voucher.getSoTienGiamToiDa() != null &&
                                discount.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                            discount = voucher.getSoTienGiamToiDa();
                        }
                    } else {
                        discount = voucher.getGiaTriGiam();
                        if (discount.compareTo(subtotal) > 0) {
                            discount = subtotal;
                        }
                    }
                }
            }

            // Tính tổng sau giảm giá
            BigDecimal subtotalAfterDiscount = subtotal.subtract(discount);

            // Kiểm tra điều kiện miễn phí vận chuyển
            if (subtotalAfterDiscount.compareTo(new BigDecimal("2000000")) >= 0 && hoaDon.getLoaiHoaDon() == 3) {
                phiVanChuyen = 0; // Miễn phí nếu đơn giao hàng và tổng sau giảm giá >= 2 triệu
                log.info("Free shipping applied for order: {}", id);
            }

            // Cập nhật phí vào hóa đơn
            HoaDon updatedHoaDon = hoaDonService.capNhatPhiVanChuyen(id, BigDecimal.valueOf(phiVanChuyen));

            // Tính lại tổng tiền
            banHangServiceImpl.recalculateTotal(updatedHoaDon);
            hoaDonRepository.save(updatedHoaDon);

            // Trả về response
            HoaDonResponse response = hoaDonMapper.entityToResponse(updatedHoaDon);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating shipping fee: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
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
    @GetMapping("/dia-chi/tinh")
    public ResponseEntity<List<Map<String, Object>>> layDanhSachTinhThanh() {
        return ResponseEntity.ok(ghnService.layDanhSachTinhThanh());
    }

    @GetMapping("/dia-chi/huyen")
    public ResponseEntity<List<Map<String, Object>>> layDanhSachQuanHuyen(@RequestParam int provinceId) {
        return ResponseEntity.ok(ghnService.layDanhSachQuanHuyen(provinceId));
    }

    @GetMapping("/dia-chi/xa")
    public ResponseEntity<List<Map<String, Object>>> layDanhSachPhuongXa(@RequestParam int districtId) {
        return ResponseEntity.ok(ghnService.layDanhSachPhuongXa(districtId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái hóa đơn và xử lý thanh toán")
    public ResponseEntity<HoaDonResponse> updateTrangThai(
            @PathVariable String id,
            @RequestParam Integer trangThai,
            @RequestBody(required = false) UpdateStatusPaymentRequest paymentRequest) {

        List<ThanhToanRequest> thanhToans = paymentRequest != null ? paymentRequest.getThanhToans() : null;
        webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
        HoaDonResponse result = hoaDonService.updateTrangThai(id, trangThai, thanhToans);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/additional-payment")
    @Operation(summary = "Xử lý thanh toán phụ phí sau khi thêm sản phẩm")
    public ResponseEntity<HoaDonResponse> processAdditionalPayment(
            @PathVariable String id,
            @RequestBody AdditionalPaymentRequest request) {

        HoaDonResponse result = hoaDonService.thanhToanPhuPhi(
                id, request.getSoTien(), request.getThanhToanRequest());
        webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
        return ResponseEntity.ok(result);
    }

    // Các lớp DTO để nhận request
    @lombok.Data
    public static class UpdateStatusPaymentRequest {
        private List<ThanhToanRequest> thanhToans;
    }

    @lombok.Data
    public static class AdditionalPaymentRequest {
        private BigDecimal soTien;
        private ThanhToanRequest thanhToanRequest;
    }
    
    @PutMapping("/{id}/dia-chi")
    public ResponseEntity<HoaDonResponse> updateHoaDonAddress(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String diaChi = request.getOrDefault("diaChi", "");
        String tinh = request.getOrDefault("tinh", "");
        String huyen = request.getOrDefault("huyen", "");
        String xa = request.getOrDefault("xa", "");
        String diaChiCuThe = request.getOrDefault("diaChiCuThe", "");

        if (tinh.isEmpty() || huyen.isEmpty() || xa.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok(hoaDonService.updateHoaDonAddress(id, diaChi, tinh, huyen, xa, diaChiCuThe));
    }

    @GetMapping("/search")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tìm kiếm hóa đơn theo nhiều tiêu chí")
    public ResponseEntity<Page<HoaDonResponse>> searchHoaDon(
            @ModelAttribute HoaDonSearchCriteria criteria,
            @PageableDefault(size = 10, sort = "ngayTao", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(hoaDonService.searchHoaDon(criteria, pageable));
    }

    //    Lấy số lượng
    @GetMapping("/counts")
    @Operation(summary = "Lấy số lượng hóa đơn theo trạng thái")
    public ResponseEntity<Map<String, Long>> getInvoiceCounts(
            @ModelAttribute HoaDonSearchCriteria criteria) {
        Map<String, Long> counts = hoaDonService.getInvoiceCounts(criteria);
        return ResponseEntity.ok(counts);
    }

    // Print hóa đơn
    @GetMapping("/{id}/print")
    public ResponseEntity<?> printHoaDon(@PathVariable String id) {
        try {
            log.info("Starting PDF generation for invoice ID: {}", id);

            // Tìm hóa đơn
            HoaDon hoaDon = hoaDonService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            // Validate required data
            if (hoaDon.getTongTien() == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Hóa đơn không có thông tin tổng tiền");
            }

            byte[] pdfBytes;
            if (hoaDon.getLoaiHoaDon() == 3 || hoaDon.getLoaiHoaDon() == 1) { // Nếu là đơn hàng online/giao hàng
                log.info("Generating delivery invoice PDF for online order");
                pdfBytes = hoaDonService.generateDeliveryInvoicePDF(id);
            } else {
                log.info("Generating standard invoice PDF for in-store order");
                pdfBytes = hoaDonService.generateInvoicePDF(id);
            }

            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Không thể tạo PDF");
            }

            // Thiết lập headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("inline") // inline: mở trên trình duyệt
                    .filename("hoa-don-" + id + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (ResourceNotFoundException e) {
            log.error("Invoice not found: {}", id);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: ", id, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/voucher")
    public ResponseEntity<HoaDonResponse> applyVoucher(
            @PathVariable("id") String hoaDonId,
            @RequestBody PhieuGiamGiaRequest request) {
        log.info("Applying voucher. HoaDonId: {}, VoucherId: {}", hoaDonId, request.getVoucherId());

        if (hoaDonId == null || request.getVoucherId() == null) {
            throw new ValidationException("ID hóa đơn và ID voucher không được để trống");
        }

        return ResponseEntity.ok(hoaDonSanPhamServiceImpl.applyVoucher(hoaDonId, request.getVoucherId()));
    }

    @DeleteMapping("/{hoaDonId}/voucher")
    public ResponseEntity<HoaDonResponse> removeVoucher(@PathVariable String hoaDonId) {
        return ResponseEntity.ok(hoaDonSanPhamServiceImpl.removeVoucher(hoaDonId));
    }

    @GetMapping("/statistics")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê hóa đơn theo khoảng thời gian")
    public ResponseEntity<List<HoaDonStatisticsDTO>> getStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(hoaDonService.getStatistics(fromDate, toDate));
    }

    @PostMapping("/{id}/create-vnpay-payment")
    @Operation(summary = "Tạo URL thanh toán qua VNPAY cho hóa đơn")
    public ResponseEntity<?> createVnPayPayment(@PathVariable String id,
                                                @RequestParam(defaultValue = "http://localhost:3000/admin/ban-hang") String returnUrl) {
        try {
            HoaDon hoaDon = hoaDonService.validateAndGet(id);

            // Tìm khoản thanh toán VNPAY trong danh sách thanh toán
            Optional<ThanhToanHoaDon> vnpayPaymentOpt = hoaDon.getThanhToanHoaDons().stream()
                    .filter(p -> PAYMENT_METHOD_VNPAY.equals(p.getPhuongThucThanhToan().getId()))
                    .findFirst();

            // Nếu không tìm thấy, tạo một khoản VNPAY mới
            if (vnpayPaymentOpt.isEmpty()) {
                log.info("Không tìm thấy khoản thanh toán VNPAY, sẽ tạo mới với giá trị bằng hóa đơn");

                // Tính số tiền còn lại cần thanh toán
                BigDecimal paidAmount = hoaDon.getThanhToanHoaDons().stream()
                        .filter(p -> p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID)
                        .map(ThanhToanHoaDon::getSoTien)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tính tổng tiền phải trả = tổng tiền hóa đơn + phí vận chuyển
                BigDecimal totalRequired = hoaDon.getTongTien();
                if (hoaDon.getPhiVanChuyen() != null && hoaDon.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
                    totalRequired = totalRequired.add(hoaDon.getPhiVanChuyen());
                }

                BigDecimal remainingAmount = totalRequired.subtract(paidAmount);

                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    return ResponseEntity.badRequest().body("Đơn hàng đã được thanh toán đủ");
                }

                // Sử dụng tổng số tiền cần thanh toán
                String paymentUrl = banHangServiceImpl.createVnpayPaymentUrl(
                        remainingAmount.longValue(),
                        hoaDon.getMaHoaDon(),
                        returnUrl + "?hoaDonId=" + id
                );

                return ResponseEntity.ok(paymentUrl);
            }

            ThanhToanHoaDon vnpayPayment = vnpayPaymentOpt.get();

            if (vnpayPayment.getSoTien().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Số tiền thanh toán VNPAY phải lớn hơn 0");
            }

            // Gọi API tạo URL thanh toán VNPAY
            String paymentUrl = banHangServiceImpl.createVnpayPaymentUrl(
                    vnpayPayment.getSoTien().longValue(),
                    hoaDon.getMaHoaDon(),
                    returnUrl + "?hoaDonId=" + id
            );

            return ResponseEntity.ok(paymentUrl);
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL thanh toán VNPAY: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo URL thanh toán VNPAY: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm-vnpay-payment")
    @Operation(summary = "Xác nhận thanh toán VNPAY thành công")
    public ResponseEntity<HoaDonResponse> confirmVnpayPayment(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> vnpParams) {

        try {
            // Lưu thông tin tham số VNPAY vào log để debug
            log.info("Xác nhận thanh toán VNPAY cho hóa đơn: {}", id);
            if (vnpParams != null && !vnpParams.isEmpty()) {
                log.info("Tham số VNPAY: {}", vnpParams);
            }

            HoaDonResponse response = service.updateVNPayPayment(id);
            webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận thanh toán VNPAY: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
