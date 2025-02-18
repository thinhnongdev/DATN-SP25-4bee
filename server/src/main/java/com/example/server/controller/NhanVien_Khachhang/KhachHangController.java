package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.entity.KhachHang;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khachhang")

public class KhachHangController {
    @Autowired
    KhachHangService khachHangService;

    @GetMapping
    public ResponseEntity<List<KhachHang>> getAllKhachHang(){
        return ResponseEntity.ok(khachHangService.getAllKhachHang());
    }

    @PostMapping
    public ResponseEntity<KhachHang> createKhachHang(@RequestBody KhachHang khachHang){
        return ResponseEntity.ok(khachHangService.createKhachHang(khachHang));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhachHang> getKhachHangById(@PathVariable String id){
        return ResponseEntity.ok(khachHangService.getKhachHangById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KhachHang> updateNhanVien(@PathVariable String id, @RequestBody KhachHang khachHang){
        return ResponseEntity.ok(khachHangService.updateKhachHang(id, khachHang));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteKhachHang(@PathVariable String id){
        khachHangService.deleteNhanVien(id);
        return ResponseEntity.ok("Delete success");
    }
}
