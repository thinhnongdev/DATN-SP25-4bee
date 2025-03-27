package com.example.server.controller.Client;

import com.example.server.entity.DiaChi;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DiaChiCLientController {
    @Autowired
    KhachHangService khachHangService;
    @GetMapping("/diaChi/{idKhachHang}")
    public List<DiaChi> getDiaChiByIdKhachHang(@PathVariable("idKhachHang") String idKhachHang) {
        return khachHangService.findDiaChiByIdKhachHang(idKhachHang);
    }
}
