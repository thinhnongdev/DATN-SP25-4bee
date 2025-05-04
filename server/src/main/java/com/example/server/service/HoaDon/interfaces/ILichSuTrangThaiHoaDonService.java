package com.example.server.service.HoaDon.interfaces;

import com.example.server.entity.LichSuHoaDon;

import java.util.List;

public interface ILichSuTrangThaiHoaDonService {
    List<LichSuHoaDon> getOrderStatusHistory(String orderId);
    LichSuHoaDon addOrderStatusHistory(LichSuHoaDon lichSuHoaDon);
}
