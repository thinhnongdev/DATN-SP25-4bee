package com.example.server.mapper.impl;

import com.example.server.dto.HoaDon.request.PhieuGiamGiaRequest;
import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.mapper.interfaces.IPhieuGiamGia;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PhieuGiamGiaMapperImpl implements IPhieuGiamGia {

    @Override
    public PhieuGiamGiaResponse entityToResponse(PhieuGiamGia entity) {
        if (entity == null) {
            return null;
        }

        return PhieuGiamGiaResponse.builder()
                .id(entity.getId())
                .maPhieuGiamGia(entity.getMaPhieuGiamGia())
                .tenPhieuGiamGia(entity.getTenPhieuGiamGia())
                .loaiPhieuGiamGia(entity.getLoaiPhieuGiamGia())
                .giaTriGiam(entity.getGiaTriGiam())
                .giaTriToiThieu(entity.getGiaTriToiThieu())
                .soTienGiamToiDa(entity.getSoTienGiamToiDa())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .soLuong(entity.getSoLuong())
                .moTa(entity.getMoTa())
                .trangThai(entity.getTrangThai())
                .ngayTao(entity.getNgayTao())
                .build();
    }

    @Override
    public PhieuGiamGia requestToEntity(PhieuGiamGiaRequest request) {
        if (request == null) {
            return null;
        }

        PhieuGiamGia entity = new PhieuGiamGia();
        entity.setMaPhieuGiamGia(request.getMaPhieuGiamGia());
        entity.setTenPhieuGiamGia(request.getTenPhieuGiamGia());
        entity.setLoaiPhieuGiamGia(request.getLoaiPhieuGiamGia());
        entity.setGiaTriGiam(request.getGiaTriGiam());
        entity.setGiaTriToiThieu(request.getGiaTriToiThieu());
        entity.setSoTienGiamToiDa(request.getSoTienGiamToiDa());
        entity.setNgayBatDau(request.getNgayBatDau());
        entity.setNgayKetThuc(request.getNgayKetThuc());
        entity.setSoLuong(request.getSoLuong());
        entity.setMoTa(request.getMoTa());
        entity.setTrangThai(request.getTrangThai());
        entity.setNgayTao(LocalDateTime.now());

        return entity;
    }

    @Override
    public void updateEntityFromRequest(PhieuGiamGiaRequest request, PhieuGiamGia entity) {
        if (request == null || entity == null) {
            return;
        }

        entity.setMaPhieuGiamGia(request.getMaPhieuGiamGia());
        entity.setTenPhieuGiamGia(request.getTenPhieuGiamGia());
        entity.setLoaiPhieuGiamGia(request.getLoaiPhieuGiamGia());
        entity.setGiaTriGiam(request.getGiaTriGiam());
        entity.setGiaTriToiThieu(request.getGiaTriToiThieu());
        entity.setSoTienGiamToiDa(request.getSoTienGiamToiDa());
        entity.setNgayBatDau(request.getNgayBatDau());
        entity.setNgayKetThuc(request.getNgayKetThuc());
        entity.setSoLuong(request.getSoLuong());
        entity.setMoTa(request.getMoTa());
        entity.setTrangThai(request.getTrangThai());
        entity.setNgaySua(LocalDateTime.now());
    }
}