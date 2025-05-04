package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.response.ThanhToanHoaDonResponse;
import com.example.server.service.HoaDon.impl.ThanhToanHoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thanh-toan-hoa-don")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ThanhToanHoaDonController {
    private final ThanhToanHoaDonService service;

    public ThanhToanHoaDonController(ThanhToanHoaDonService service) {
        this.service = service;
    }

    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<ThanhToanHoaDonResponse>> getByHoaDonId(@PathVariable String hoaDonId) {
        return ResponseEntity.ok(service.getByHoaDonId(hoaDonId));
    }
}

