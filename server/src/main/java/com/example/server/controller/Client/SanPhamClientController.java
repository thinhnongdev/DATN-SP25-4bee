package com.example.server.controller.Client;

import com.example.server.dto.Client.response.SanPhamClientResponse;
import com.example.server.dto.SanPham.response.SanPhamResponse;
import com.example.server.service.Client.SanPhamClientService;
import com.example.server.service.SanPham.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SanPhamClientController {
    @Autowired
    SanPhamClientService sanPhamClientService;
    @GetMapping("/sanpham")
    public List<SanPhamClientResponse> getAllSanPham() {
        for (SanPhamClientResponse sanPhamClientResponse: sanPhamClientService.getAll()){
            System.out.println(sanPhamClientResponse.getTen());
        }

        return sanPhamClientService.getAll();
    }
}
