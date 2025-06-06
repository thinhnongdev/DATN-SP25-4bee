package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.response.PhuongThucThanhToanResponse;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/phuong-thuc-thanh-toan")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class PhuongThucThanhToanController {

    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    @GetMapping
    public List<PhuongThucThanhToanResponse> getAllPhuongThucThanhToan() {
        List<PhuongThucThanhToan> entities = phuongThucThanhToanRepository.findAll();
        return entities.stream().map(entity -> new PhuongThucThanhToanResponse(
                entity.getId(),
                entity.getMaPhuongThucThanhToan(),
                entity.getTenPhuongThucThanhToan(),
                entity.getMoTa() // Lấy đúng trường mô tả từ database
        )).collect(Collectors.toList());
    }


    @GetMapping("/bank-and-cash")
    public List<PhuongThucThanhToanResponse> getBankAndCashMethods() {
        List<PhuongThucThanhToan> entities = phuongThucThanhToanRepository.findBankAndCashMethods();
        return entities.stream().map(entity -> new PhuongThucThanhToanResponse(
                entity.getId(),
                entity.getMaPhuongThucThanhToan(),
                entity.getTenPhuongThucThanhToan(),
                entity.getMoTa()
        )).collect(Collectors.toList());
    }


}

