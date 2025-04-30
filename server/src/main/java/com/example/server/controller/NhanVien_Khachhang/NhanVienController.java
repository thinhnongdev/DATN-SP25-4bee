package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.entity.NhanVien;
import com.example.server.repository.Auth.TaiKhoanRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.service.NhanVien_KhachHang.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/admin/nhan_vien")
public class NhanVienController {
    @Autowired
    NhanVienService nhanVienService;
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;


    @GetMapping
    public ResponseEntity<List<NhanVien>> getAllNhanVien(){
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
    }
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = taiKhoanRepository.existsByUsername(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }


    @PostMapping
    public ResponseEntity<NhanVien> createNhanVien(@RequestBody NhanVien nhanVien){
        return ResponseEntity.ok(nhanVienService.createNhanVien(nhanVien));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanVien> getNhanVienById(@PathVariable String id) {
        return ResponseEntity.ok(nhanVienService.getNhanVienById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NhanVien> updateNhanVien(@PathVariable String id, @RequestBody NhanVien nhanVien) {
        return ResponseEntity.ok(nhanVienService.updateNhanVien(id, nhanVien));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNhanVien(@PathVariable String id) {
        nhanVienService.deleteNhanVien(id);
        return ResponseEntity.ok("Delete success");
    }
}
