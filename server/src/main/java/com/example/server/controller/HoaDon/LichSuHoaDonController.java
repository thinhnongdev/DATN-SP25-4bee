package com.example.server.controller.HoaDon;


import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lich-su-hoa-don")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LichSuHoaDonController {
    private final LichSuHoaDonService service;

    public LichSuHoaDonController(LichSuHoaDonService service) {
        this.service = service;
    }

    // API lấy lịch sử hóa đơn theo ID hóa đơn
    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<LichSuHoaDonResponse>> getByHoaDonId(@PathVariable String hoaDonId) {
        List<LichSuHoaDonResponse> responseList = service.getByHoaDonId(hoaDonId);
        return ResponseEntity.ok(responseList);
    }

    // API lưu lịch sử trạng thái hóa đơn
    @PostMapping
    public ResponseEntity<Void> saveLichSuHoaDon(@RequestBody LichSuHoaDonRequest request) {
        service.saveLichSuHoaDon(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}


