package com.example.server.controller.BanHang;

import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.dto.SanPham.request.ChatLieuCreationRequest;
import com.example.server.entity.ChatLieu;
import com.example.server.entity.HoaDon;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BanHangTaiQuay {
    @Autowired
    BanHangService banHangService;

    @PostMapping("/createhoadon")
    public ResponseEntity<?> createInvoice(@RequestBody CreateHoaDonRequest hoaDon) {


        try {
            HoaDon savedInvoice = banHangService.createHoaDon(hoaDon);
            return ResponseEntity.ok(savedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lưu hóa đơn thất bại! Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/hoadoncho")
    public List<HoaDon> getAll(){
        return banHangService.getHoaDonCho();
    }
}
