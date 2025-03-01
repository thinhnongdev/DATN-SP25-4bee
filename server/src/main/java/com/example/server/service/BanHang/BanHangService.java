package com.example.server.service.BanHang;

import com.example.server.dto.BanHang.request.CreateHoaDonChiTietRequest;
import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.HoaDonChiTiet;
import com.example.server.entity.KhachHang;
import com.example.server.entity.ThanhToanHoaDon;

import java.util.List;

public interface BanHangService {
    HoaDon createHoaDon(CreateHoaDonRequest createHoaDonRequest);
    List<HoaDon> getHoaDonCho();
    HoaDonChiTiet addHoaDonChiTiet(CreateHoaDonChiTietRequest hoaDonChiTietRequest);
    List<HoaDonChiTiet> getHoaDonChiTietByIdHoaDon(String id);
    KhachHang getKhachHangByIdHoaDon(String id);
    ThanhToanHoaDon getThanhToanHoaDonByIdHoaDon(String id);
}
