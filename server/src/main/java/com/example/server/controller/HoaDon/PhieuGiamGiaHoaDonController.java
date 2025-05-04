package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.HoaDon.interfaces.IPhieuGiamGiaService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin/phieu-giam-gia")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PhieuGiamGiaHoaDonController {
    private final IPhieuGiamGiaService phieuGiamGiaService;
    // Thêm endpoint mới
    @GetMapping("/available")
    public ResponseEntity<List<PhieuGiamGiaResponse>> getAvailableVouchers(
            @RequestParam BigDecimal orderTotal,
            @RequestParam (required = false) String customerId // Nhận ID khách hàng
    ) {
        return ResponseEntity.ok(phieuGiamGiaService.getAvailableVouchersForOrder(orderTotal, customerId));
    }

    @GetMapping("/better-vouchers")
    public ResponseEntity<Map<String, Object>> getBetterVouchers(
            @RequestParam String hoaDonId,
            @RequestParam(required = false) String currentVoucherId) {
        return ResponseEntity.ok(phieuGiamGiaService.findBetterVouchers(hoaDonId, currentVoucherId));
    }
}