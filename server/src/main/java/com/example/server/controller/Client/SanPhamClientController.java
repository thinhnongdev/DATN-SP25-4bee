package com.example.server.controller.Client;

import com.example.server.dto.Client.response.SanPhamChiTietClientResponse;
import com.example.server.dto.Client.response.SanPhamClientResponse;
import com.example.server.dto.SanPham.response.SanPhamResponse;
import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.HoaDon.HoaDonChiTietRepository;
import com.example.server.service.Client.SanPhamClientService;
import com.example.server.service.SanPham.AnhSanPhamService;
import com.example.server.service.SanPham.SanPhamChiTietService;
import com.example.server.service.SanPham.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SanPhamClientController {
    @Autowired
    SanPhamClientService sanPhamClientService;
    @Autowired
    SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    AnhSanPhamService anhSanPhamService;
    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    @GetMapping("/sanpham")
    public List<SanPhamClientResponse> getAllSanPham() {
        for (SanPhamClientResponse sanPhamClientResponse : sanPhamClientService.getAll()) {
            System.out.println(sanPhamClientResponse.getTen());
        }
        return sanPhamClientService.getAll();
    }

    @GetMapping("/sanpham/chitietsanpham/{id}")
    public List<SanPhamChiTiet> getSanPhamChiTietByIdSanPham(@PathVariable String id) {
        return sanPhamChiTietService.findbyIdSanPham(id);
    }

    @GetMapping("/sanphamchitiet/{id}/hinhanh")
    public ResponseEntity<List<AnhSanPham>> getHinhAnhBySanPhamChiTietId(@PathVariable String id) {
        List<AnhSanPham> hinhAnhs = anhSanPhamService.findByIdSPCT(id);
        return ResponseEntity.ok(hinhAnhs);
    }

    @GetMapping("/chitietsanpham/{id}")
    public ResponseEntity<?> getSanPhamChiTietByIdSPCT(@PathVariable String id) {
        try {
            SanPhamChiTiet sanPham = sanPhamChiTietService.findbyIdSPCT(id);
            if (sanPham == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm với ID: " + id);
            }
            return ResponseEntity.ok(sanPham);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
    @GetMapping("/findDanhSachSPCTbyIdHoaDon/{id}")
    public ResponseEntity<?> findDanhSachSPCTbyIdHoaDon(@PathVariable String id) {
        if (id == null || id.isEmpty()) {
            return ResponseEntity.badRequest().body("ID không được để trống");
        }
        try {
            List<SanPhamChiTietClientResponse> sanPhamChiTietClientResponses = sanPhamClientService.findDanhSachSPCTbyIdHoaDon(id);
            return ResponseEntity.ok(sanPhamChiTietClientResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tìm danh sách sản phẩm cho hóa đơn" + e.getMessage());
        }
    }
    // Controller
    @GetMapping("/sanpham/{id}/luot-ban")
    public ResponseEntity<Integer> getSoLuongDaBan(@PathVariable("id") String idSanPham) {
        int totalSold = hoaDonChiTietRepository.tinhSoLuongDaBan(idSanPham);
        return ResponseEntity.ok(totalSold);
    }

}
