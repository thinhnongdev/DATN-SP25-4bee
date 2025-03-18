package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/khach_hang")

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

    // Thêm endpoint mới để tạo địa chỉ cho khách hàng
    @PostMapping("/diaChi")
    public ResponseEntity<DiaChi> addAddressForCustomer(@RequestBody Map<String, Object> request) {
        String khachHangId = (String) request.get("khachHangId");
        Map<String, Object> diaChiMap = (Map<String, Object>) request.get("diaChi");

        DiaChi diaChi = new DiaChi();
        diaChi.setTinh((String) diaChiMap.get("tinh"));
        diaChi.setHuyen((String) diaChiMap.get("huyen"));
        diaChi.setXa((String) diaChiMap.get("xa"));
        diaChi.setMoTa((String) diaChiMap.get("moTa"));
        diaChi.setTrangThai(1);

        DiaChi savedAddress = khachHangService.addAddressForCustomer(khachHangId, diaChi);
        return ResponseEntity.ok(savedAddress);
    }
}
