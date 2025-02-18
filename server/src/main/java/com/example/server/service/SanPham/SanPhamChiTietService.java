package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface SanPhamChiTietService {
    List<SanPhamChiTiet> findbyIdSanPham(String idSanPham);
    List<SanPhamChiTiet> getAllSanPhamChiTiet();
    Integer findSoLuongbyIdSanPham(String idSanPham);
    void saveSanPhamChiTiet(SanPhamChiTietCreationRequest sanPhamChiTietCreationRequest);
    void updateSanPhamChiTiet(String id,SanPhamChiTietUpdateRequest sanPhamChiTietUpdateRequest);
}
