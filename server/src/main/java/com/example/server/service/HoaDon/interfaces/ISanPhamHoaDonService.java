package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.SanPham;

import java.util.List;

public interface ISanPhamHoaDonService {
    SanPham validateAndGet(String id);
    List<SanPhamChiTietHoaDonResponse> getAllProducts();
    boolean checkProductAvailability(String id, Integer quantity);
}