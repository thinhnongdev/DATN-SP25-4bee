package com.example.server.mapper.interfaces;

import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.entity.LichSuHoaDon;

public interface ILichSuHoaDonMapper {
    LichSuHoaDon toEntity(LichSuHoaDonRequest requestDTO);
    LichSuHoaDonResponse toDTO(LichSuHoaDon entity);
}

