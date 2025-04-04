package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.SanPhamChiTietCreationRequest;
import com.example.server.dto.SanPham.request.SanPhamChiTietUpdateRequest;
import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.service.SanPham.AnhSanPhamService;
import com.example.server.service.SanPham.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SanPhamChiTietController {
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    private AnhSanPhamService anhSanPhamService;
    @GetMapping("/sanphamchitiet/{id}/hinhanh")
    public ResponseEntity<List<AnhSanPham>> getHinhAnhBySanPhamChiTietId(@PathVariable String id) {
        List<AnhSanPham> hinhAnhs = anhSanPhamService.findByIdSPCT(id);
        return ResponseEntity.ok(hinhAnhs);
    }
    @PostMapping("/sanpham/addsanphamchitiet")
    public ResponseEntity<String> postSanPhamChiTiet(@RequestBody List<SanPhamChiTietCreationRequest> danhsachsanphamchitiet) {
        try {
            for (int i = 0; i < danhsachsanphamchitiet.size(); i++) {
                sanPhamChiTietService.saveSanPhamChiTiet(danhsachsanphamchitiet.get(i));
            }
            return ResponseEntity.ok("Dữ liệu đã được lưu thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }
    @GetMapping("/sanpham/chitietsanpham/{id}")
    public List<SanPhamChiTiet> getSanPhamChiTietById(@PathVariable String id) {
        return sanPhamChiTietService.findbyIdSanPham(id);
    }

    @GetMapping("/sanpham/sanphamchitiet/ma/{maSPCT}")
    public ResponseEntity<SanPhamChiTiet> getSanPhamChiTietByMaSPCT(@PathVariable("maSPCT") String maSanPhamChiTiet) {
        Optional<SanPhamChiTiet> result = sanPhamChiTietService.findByMaSanPhamChiTiet(maSanPhamChiTiet);

        if (result.isPresent()) {
            return ResponseEntity.ok(result.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sanpham/chitietsanpham")
    public List<SanPhamChiTiet> getAllSanPhamChiTiet() {
        return sanPhamChiTietService.getAllSanPhamChiTiet();
    }
    @PatchMapping("/sanpham/chitietsanpham/{id}")
    public ResponseEntity<Map<String, String>> updateSanPhamChiTiet(
            @PathVariable String id,
            @RequestBody SanPhamChiTietUpdateRequest sanPhamChiTietUpdateRequest) {
        try {
            sanPhamChiTietService.updateSanPhamChiTiet(id, sanPhamChiTietUpdateRequest);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Dữ liệu đã được lưu thành công!");
            return ResponseEntity.ok(response); // Trả về JSON hợp lệ
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }



}
