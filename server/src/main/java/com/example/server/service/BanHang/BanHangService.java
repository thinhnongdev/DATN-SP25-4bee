package com.example.server.service.BanHang;

import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.entity.HoaDon;

import java.util.List;

public interface BanHangService {
    HoaDon createHoaDon(CreateHoaDonRequest createHoaDonRequest);
    List<HoaDon> getHoaDonCho();
}
