package com.example.server.controller.HoaDon;

import com.example.server.dto.GiaoHang.GHNTinhPhiRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.request.PhieuGiamGiaRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.impl.HoaDonMapper;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.BanHang.impl.BanHangServiceImpl;
import com.example.server.service.GiaoHang.GHNService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hoa-don")
@RequiredArgsConstructor
@Tag(name = "Quản lý hóa đơn", description = "API quản lý hóa đơn")
@Slf4j
public class HoaDonController {
    private final IHoaDonService hoaDonService;
    private final HoaDonSanPhamServiceImpl hoaDonSanPhamServiceImpl;
    private final WebSocketService webSocketService; // Inject WebSocket Service
    private final HoaDonMapper hoaDonMapper;
    @Autowired
    BanHangService banHangService;
    @Autowired
    private GHNService ghnService;
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới hóa đơn")
    public ResponseEntity<HoaDonResponse> createHoaDon(
            @Valid @RequestBody HoaDonRequest request) {
        return new ResponseEntity<>(hoaDonService.createHoaDon(request), HttpStatus.CREATED);
    }

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

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy hóa đơn và hoàn lại sản phẩm")
    public ResponseEntity<HoaDonResponse> cancelHoaDon(@PathVariable String id) {
        HoaDonResponse response = hoaDonService.deleteHoaDon(id);
        return ResponseEntity.ok(response);
    }
// GHN
    @PostMapping("/phi-van-chuyen")
    public int layPhiVanChuyen(@RequestBody GHNTinhPhiRequest request) {
        return ghnService.tinhPhiVanChuyen(request);
    }
//    @PostMapping("/{id}/cap-nhat-phi-van-chuyen")
//    public ResponseEntity<HoaDonResponse> capNhatPhiVanChuyen(
//            @PathVariable String id,
//            @RequestBody GHNTinhPhiRequest request) {
//
//        // Gọi GHN API để tính phí
//        int phiVanChuyen = ghnService.tinhPhiVanChuyen(request);
//
//        // Cập nhật phí vào hóa đơn
//        HoaDon hoaDon = hoaDonService.capNhatPhiVanChuyen(id, BigDecimal.valueOf(phiVanChuyen));
//
//        // Trả về response
//        HoaDonResponse response = hoaDonMapper.entityToResponse(hoaDon);
//
//        return ResponseEntity.ok(response);
//    }
    @PostMapping("/{id}/cap-nhat-phi-van-chuyen")
    public ResponseEntity<HoaDonResponse> capNhatPhiVanChuyen(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {

        // Lấy giá trị fee từ request
        int phiVanChuyen = 0;
        if (request.containsKey("fee")) {
            phiVanChuyen = ((Number) request.get("fee")).intValue();
        }

        // Cập nhật phí vào hóa đơn
        HoaDon hoaDon = hoaDonService.capNhatPhiVanChuyen(id, BigDecimal.valueOf(phiVanChuyen));

        // Trả về response
        HoaDonResponse response = hoaDonMapper.entityToResponse(hoaDon);

        return ResponseEntity.ok(response);
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
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái hóa đơn")
    public ResponseEntity<HoaDonResponse> updateTrangThai(
            @PathVariable String id,
            @RequestParam Integer trangThai) {
        webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
        return ResponseEntity.ok(hoaDonService.updateTrangThai(id, trangThai));
    }

    @PutMapping("/{id}/dia-chi")
    public ResponseEntity<HoaDonResponse> updateHoaDonAddress(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String diaChi = request.getOrDefault("diaChi", "");
        String tinh = request.getOrDefault("tinh", "");
        String huyen = request.getOrDefault("huyen", "");
        String xa = request.getOrDefault("xa", "");
        String moTa = request.getOrDefault("moTa", "");

        if (tinh.isEmpty() || huyen.isEmpty() || xa.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok(hoaDonService.updateHoaDonAddress(id, diaChi, tinh, huyen, xa, moTa));
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

            // Tạo file PDF
            byte[] pdfBytes = hoaDonService.generateInvoicePDF(id);

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

    @DeleteMapping("/{id}/voucher")
    public ResponseEntity<HoaDonResponse> removeVoucher(@PathVariable String id) {
        return ResponseEntity.ok(hoaDonSanPhamServiceImpl.removeVoucher(id));
    }

    @GetMapping("/statistics")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê hóa đơn theo khoảng thời gian")
    public ResponseEntity<List<HoaDonStatisticsDTO>> getStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(hoaDonService.getStatistics(fromDate, toDate));
    }

}
