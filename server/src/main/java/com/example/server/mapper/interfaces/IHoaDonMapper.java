package com.example.server.mapper.interfaces;

import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.entity.ThanhToanHoaDon;

public interface IHoaDonMapper {
    HoaDon requestToEntity(HoaDonRequest request);
    HoaDonResponse entityToResponse(HoaDon hoaDon);
    void updateEntityFromRequest(HoaDonRequest request, HoaDon hoaDon);
    ThanhToanHoaDon mapPhuongThucThanhToan(PhuongThucThanhToan phuongThuc, HoaDon hoaDon);

}
