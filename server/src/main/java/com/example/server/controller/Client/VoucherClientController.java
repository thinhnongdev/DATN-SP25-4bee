package com.example.server.controller.Client;

import com.example.server.entity.PhieuGiamGia;
import com.example.server.service.PhieuGiamGia.PhieuGiamGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class VoucherClientController {
    @Autowired
    PhieuGiamGiaService phieuGiamGiaService;

    @GetMapping("/phieugiamgia/congkhai")
    public List<PhieuGiamGia> getAllPhieuCongKhai() {
        return phieuGiamGiaService.getAllPhieuCongKhai();
    }
    @GetMapping("/phieugiamgia/canhan/{email}")
    public List<PhieuGiamGia> getAllPhieuCaNhan(@PathVariable("email")String email) {
        return phieuGiamGiaService.getAllPhieuCaNhan(email);
    }
}
