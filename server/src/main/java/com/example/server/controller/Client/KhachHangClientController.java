package com.example.server.controller.Client;

import com.example.server.dto.Auth.request.IntrospectRequest;
import com.example.server.dto.Auth.response.UserResponse;
import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.service.AuthenticationService;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    AuthenticationService authenticationService;

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

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            // Cắt bỏ "Bearer " từ authorization header
            String token = authHeader.substring(7);

            // Tạo request introspect
            IntrospectRequest introspectRequest = new IntrospectRequest();
            introspectRequest.setToken(token);

            // Lấy thông tin người dùng
            UserResponse userResponse = authenticationService.findUserByToken(introspectRequest);

            if (userResponse.getId() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("success", false, "message", "Không tìm thấy thông tin khách hàng")
                );
            }

            // Lấy chi tiết khách hàng
            KhachHang khachHang = khachHangService.getKhachHangById(userResponse.getId());
            return ResponseEntity.ok(khachHang);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }
}
