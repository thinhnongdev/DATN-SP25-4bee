package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.service.HoaDon.interfaces.IPhieuGiamGiaService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/admin/phieu-giam-gia")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PhieuGiamGiaHoaDonController {
    private final IPhieuGiamGiaService phieuGiamGiaService;

    // Thêm endpoint mới
    @GetMapping("/available")
    public ResponseEntity<List<PhieuGiamGiaResponse>> getAvailableVouchers(
            @RequestParam BigDecimal orderTotal
    ) { 
        return ResponseEntity.ok(phieuGiamGiaService.getAvailableVouchersForOrder(orderTotal));
    }
}