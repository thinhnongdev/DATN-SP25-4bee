package com.example.server.service.Client;

import com.example.server.entity.HoaDon;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.entity.ThanhToanHoaDon;
import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ThanhToanClientService {
    @Autowired
    ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    @Autowired
    PhuongThucThanhToanRepository phuongThucThanhToanHoaDonRepository;

    public ThanhToanHoaDon createThanhToanHoaDon(String phuongThucThanhToan, HoaDon hoaDon, BigDecimal tienThanhToan) {
        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
        thanhToanHoaDon.setId(UUID.randomUUID().toString());
        thanhToanHoaDon.setPhuongThucThanhToan(phuongThucThanhToanHoaDonRepository.findByMaPhuongThucThanhToan(phuongThucThanhToan).orElseThrow());
        thanhToanHoaDon.setHoaDon(hoaDon);
        thanhToanHoaDon.setSoTien(tienThanhToan);
        thanhToanHoaDon.setTrangThai(phuongThucThanhToan.equalsIgnoreCase("BANK") ? 2 : 1);
        thanhToanHoaDon.setNgayTao(LocalDateTime.now());
        return thanhToanHoaDonRepository.save(thanhToanHoaDon);
    }
}
