package com.example.server.controller.SanPham;

import com.example.server.dto.SanPham.request.SanPhamCreationRequest;
import com.example.server.dto.SanPham.response.SanPhamResponse;
import com.example.server.entity.SanPham;
import com.example.server.service.SanPham.impl.SanPhamServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SanPhamController {
    @Autowired
    private SanPhamServiceImpl sanPhamService;

    @GetMapping("/sanpham")
    public List<SanPhamResponse> getAllSanPham() {
        return sanPhamService.getAll();
    }

    @PostMapping("/addsanpham")
    public SanPham postSanPham(@RequestBody SanPhamCreationRequest sanPham) {
        return sanPhamService.saveSanPham(sanPham);
    }

    @GetMapping("/sanpham/{id}")
    public ResponseEntity<?> getSanPhamByID(@PathVariable("id") String id) {
        SanPham sanPham = sanPhamService.getSanPhamByID(id);
        if (sanPham == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(sanPham);
    }

//    @PatchMapping("/sanpham/{id}")
//    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody SanPhamUpdateRequest sanPhamUpdateRequest) {
//        SanPham updateSanPham = sanPhamService.updateSanPham(id, sanPhamUpdateRequest);
//        if (updateSanPham == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
//        return ResponseEntity.ok(updateSanPham);
//    }
}