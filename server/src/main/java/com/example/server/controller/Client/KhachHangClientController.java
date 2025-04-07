package com.example.server.controller.Client;

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
@RequestMapping("/api/client/khach_hang")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class KhachHangClientController {
    @Autowired
    KhachHangService khachHangService;

    @GetMapping("/diaChi/{idKhachHang}")
    public List<DiaChi> getDiaChiByIdKhachHang(@PathVariable("idKhachHang") String idKhachHang) {
        return khachHangService.findDiaChiByIdKhachHang(idKhachHang);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhachHang> getKhachHangById(@PathVariable String id) {
        return ResponseEntity.ok(khachHangService.getKhachHangById(id));
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
        diaChi.setDiaChiCuThe((String) diaChiMap.get("diaChiCuThe"));
        diaChi.setTrangThai(1);

        DiaChi savedAddress = khachHangService.addAddressForCustomer(khachHangId, diaChi);
        return ResponseEntity.ok(savedAddress);
    }
}
