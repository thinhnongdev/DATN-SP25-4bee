package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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
    public ResponseEntity<KhachHang> updateKhachHang(@PathVariable String id, @RequestBody KhachHangCreationRequest khachHang) {
        return ResponseEntity.ok(khachHangService.updateKhachHang(id, khachHang));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteKhachHang(@PathVariable String id) {
        khachHangService.deleteKhachHang(id);
        return ResponseEntity.ok("Delete success");
    }

    // API kiểm tra email tồn tại
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = khachHangService.isEmailExists(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    // API kiểm tra số điện thoại tồn tại
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhoneExists(@RequestParam String soDienThoai) {
        boolean exists = khachHangService.isPhoneExists(soDienThoai);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    // API lấy khách hàng theo ID tài khoản
    @GetMapping("/by-tai-khoan/{taiKhoanId}")
    public ResponseEntity<KhachHang> getKhachHangByTaiKhoanId(@PathVariable String taiKhoanId) {
        try {
            KhachHang khachHang = khachHangService.getKhachHangByTaiKhoanId(taiKhoanId);
            return ResponseEntity.ok(khachHang);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Thêm endpoint mới để tạo địa chỉ cho khách hàng
    @PostMapping("/diaChi")
    public ResponseEntity<DiaChi> addAddressForCustomer(@RequestBody Map<String, Object> request) {
        // Sửa để xử lý cả trường hợp Integer và String
        String khachHangId;
        Object rawKhachHangId = request.get("khachHangId");

        if (rawKhachHangId instanceof Integer) {
            khachHangId = String.valueOf(rawKhachHangId);
        } else {
            khachHangId = (String) rawKhachHangId;
        }

        Map<String, Object> diaChiMap = (Map<String, Object>) request.get("diaChi");

        DiaChi diaChi = new DiaChi();
        diaChi.setTinh(String.valueOf(diaChiMap.get("tinh")));
        diaChi.setHuyen(String.valueOf(diaChiMap.get("huyen")));
        diaChi.setXa(String.valueOf(diaChiMap.get("xa")));
        diaChi.setMoTa((String) diaChiMap.get("moTa"));
        diaChi.setDiaChiCuThe((String) diaChiMap.get("diaChiCuThe"));
        diaChi.setTrangThai(1);

        DiaChi savedAddress = khachHangService.addAddressForCustomer(khachHangId, diaChi);
        return ResponseEntity.ok(savedAddress);
    }
}
