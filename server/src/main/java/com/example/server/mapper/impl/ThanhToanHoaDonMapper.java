package com.example.server.mapper.impl;


import com.example.server.constant.PaymentConstant;
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
                entity.getHoaDon() != null && entity.getHoaDon().getNhanVien() != null
                        ? entity.getHoaDon().getNhanVien().getTenNhanVien() : "N/A",
                entity.getPhuongThucThanhToan() != null ? entity.getPhuongThucThanhToan().getId() : null,
                entity.getPhuongThucThanhToan() != null ? entity.getPhuongThucThanhToan().getTenPhuongThucThanhToan() : "Không rõ",
                entity.getSoTien() != null ? entity.getSoTien() : BigDecimal.ZERO, // Tránh lỗi null
                entity.getMoTa(),
                entity.getTrangThai() != null ? entity.getTrangThai() : 2, // Đảm bảo giá trị mặc định là "Chờ thanh toán"
                entity.getNgayTao(),
                entity.getNgaySua()
        );
    }

    public ThanhToanHoaDon toEntity(ThanhToanHoaDonResponse dto) {
        ThanhToanHoaDon entity = new ThanhToanHoaDon();
        entity.setId(dto.getId());
        entity.setMoTa(dto.getMoTa());
        entity.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : 2); //  Tránh lỗi null khi tạo entity
        return entity;
    }
}




