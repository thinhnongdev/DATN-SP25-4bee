package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khach_hang")

public class KhachHangController {
    @Autowired
    KhachHangService khachHangService;

    @GetMapping
    public ResponseEntity<List<KhachHang>> getAllKhachHang() {
        return ResponseEntity.ok(khachHangService.getAllKhachHang());
    }

    @GetMapping("/diaChi/{idKhachHang}")
    public List<DiaChi> getDiaChiByIdKhachHang(@PathVariable("idKhachHang") String idKhachHang) {
        return khachHangService.findDiaChiByIdKhachHang(idKhachHang);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhachHang> getKhachHangById(@PathVariable String id) {
        return ResponseEntity.ok(khachHangService.getKhachHangById(id));
    }

    @PostMapping
    public ResponseEntity<KhachHang> createKhachHang(@RequestBody KhachHangCreationRequest khachHangRequest) {
        return ResponseEntity.ok(khachHangService.createKhachHang(khachHangRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KhachHang> updateNhanVien(@PathVariable String id, @RequestBody KhachHangCreationRequest khachHang) {
        return ResponseEntity.ok(khachHangService.updateKhachHang(id, khachHang));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteKhachHang(@PathVariable String id) {
        khachHangService.deleteKhachHang(id);
        return ResponseEntity.ok("Delete success");
    }
}
