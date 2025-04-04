package com.example.server.mapper.impl;


import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.entity.LichSuHoaDon;
import org.springframework.stereotype.Component;

@Component
public class LichSuHoaDonMapper {
    public LichSuHoaDonResponse toDTO(LichSuHoaDon entity) {
        return new LichSuHoaDonResponse(
                entity.getId(),
                entity.getHoaDon().getId(),
                entity.getKhachHang() != null ? entity.getKhachHang().getId() : null,
                entity.getNhanVien() != null ? entity.getNhanVien().getId() : null,
                entity.getNhanVien() != null ? entity.getNhanVien().getTenNhanVien() : "---",
                entity.getHanhDong(),
                entity.getMoTa(),
                entity.getTrangThai(),
                entity.getNgayTao(),
                entity.getNgaySua()
        );
    }

    public LichSuHoaDon toEntity(LichSuHoaDonResponse dto) {
        LichSuHoaDon entity = new LichSuHoaDon();
        entity.setId(dto.getId());
        entity.setHanhDong(dto.getHanhDong());
        entity.setMoTa(dto.getMoTa());
        entity.setTrangThai(dto.getTrangThai());
        entity.setNgayTao(dto.getNgayTao());
        entity.setNgaySua(dto.getNgaySua());
        return entity;
    }
}
