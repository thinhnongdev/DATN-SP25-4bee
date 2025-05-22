package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;

import java.util.List;

public interface ILichSuHoaDonService {
    LichSuHoaDonResponse createHistory(LichSuHoaDonRequest requestDTO);

    List<LichSuHoaDonResponse> getHistoryByHoaDonId(String hoaDonId);
}
