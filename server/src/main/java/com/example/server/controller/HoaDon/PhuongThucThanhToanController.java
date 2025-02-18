package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.response.PhuongThucThanhToanResponse;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/phuong-thuc-thanh-toan")
@RequiredArgsConstructor
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

}

