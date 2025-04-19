package com.example.server.controller.NhanVien_Khachhang;

import com.example.server.entity.NhanVien;
import com.example.server.service.NhanVien_KhachHang.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/nhan_vien")
public class NhanVienController {
    @Autowired
    NhanVienService nhanVienService;


    @GetMapping
    public ResponseEntity<List<NhanVien>> getAllNhanVien(){
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
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
