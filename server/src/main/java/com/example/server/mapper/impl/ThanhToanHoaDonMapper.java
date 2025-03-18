package com.example.server.mapper.impl;


import com.example.server.dto.HoaDon.response.ThanhToanHoaDonResponse;
import com.example.server.entity.ThanhToanHoaDon;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ThanhToanHoaDonMapper {
    public ThanhToanHoaDonResponse toDTO(ThanhToanHoaDon entity) {
        return new ThanhToanHoaDonResponse(
                entity.getId(),
                entity.getHoaDon() != null ? entity.getHoaDon().getId() : null,
                entity.getHoaDon() != null && entity.getHoaDon().getNhanVien() != null ? entity.getHoaDon().getNhanVien().getTenNhanVien() : "N/A",
                entity.getPhuongThucThanhToan() != null ? entity.getPhuongThucThanhToan().getId() : null,
                entity.getPhuongThucThanhToan() != null ? entity.getPhuongThucThanhToan().getTenPhuongThucThanhToan() : "Không rõ",
                entity.getSoTien(),
                entity.getMoTa(),
                entity.getTrangThai(),
                entity.getNgayTao(),
                entity.getNgaySua()
        );
    }

    public ThanhToanHoaDon toEntity(ThanhToanHoaDonResponse dto) {
        ThanhToanHoaDon entity = new ThanhToanHoaDon();
        entity.setId(dto.getId());
        entity.setMoTa(dto.getMoTa());
        entity.setTrangThai(dto.getTrangThai());
        return entity;
    }
}




