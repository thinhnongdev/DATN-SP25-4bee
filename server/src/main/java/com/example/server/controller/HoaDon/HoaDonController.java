package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.request.PhieuGiamGiaRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.service.WebSocketService;
import com.example.server.service.HoaDon.impl.HoaDonSanPhamServiceImpl;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hoa-don")
@RequiredArgsConstructor
@Tag(name = "Quản lý hóa đơn", description = "API quản lý hóa đơn")
@Slf4j
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HoaDonController {
    private final IHoaDonService hoaDonService;
    private final HoaDonSanPhamServiceImpl hoaDonSanPhamServiceImpl;
    private final WebSocketService webSocketService; // Inject WebSocket Service

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới hóa đơn")
    public ResponseEntity<HoaDonResponse> createHoaDon(
            @Valid @RequestBody HoaDonRequest request) {
        return new ResponseEntity<>(hoaDonService.createHoaDon(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    //    @PreAuthorize("hasRole('ADMIN')")
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
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách hóa đơn có phân trang")
    public ResponseEntity<Page<HoaDonResponse>> getAllHoaDon(
            @PageableDefault(size = 10, sort = "ngayTao", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(hoaDonService.getAllHoaDon(pageable));
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin hóa đơn")
    public ResponseEntity<HoaDonResponse> updateHoaDon(
            @PathVariable String id,
            @Valid @RequestBody HoaDonRequest request) {
        log.info("Received update request for invoice {}: {}", id, request);
        webSocketService.sendInvoiceUpdate(id); // Gửi thông báo WebSocket
        return ResponseEntity.ok(hoaDonService.updateHoaDon(id, request));
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa hóa đơn")
    public ResponseEntity<Void> deleteHoaDon(@PathVariable String id) {
        hoaDonService.deleteHoaDon(id);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{id}/status")
//    @PreAuthorize("hasRole('ADMIN')")
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
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tìm kiếm hóa đơn theo nhiều tiêu chí")
    public ResponseEntity<Page<HoaDonResponse>> searchHoaDon(
            @ModelAttribute HoaDonSearchCriteria criteria,
            @PageableDefault(size = 10, sort = "ngayTao", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(hoaDonService.searchHoaDon(criteria, pageable));
    }

    //Print hóa đơn
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
            @RequestBody PhieuGiamGiaRequest request
    ) {
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
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê hóa đơn theo khoảng thời gian")
    public ResponseEntity<List<HoaDonStatisticsDTO>> getStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(hoaDonService.getStatistics(fromDate, toDate));
    }
}
