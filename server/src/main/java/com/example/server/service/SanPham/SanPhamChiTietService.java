package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;
import java.util.Optional;

public interface SanPhamChiTietService {
    SanPhamChiTiet findbyIdSPCT(String idSPCT);
    List<SanPhamChiTiet> findbyIdSanPham(String idSanPham);
    Optional<SanPhamChiTiet> findByMaSanPhamChiTiet(String maSanPhamChiTiet);
    List<SanPhamChiTiet> getAllSanPhamChiTiet();
    Integer findSoLuongbyIdSanPham(String idSanPham);
    void saveSanPhamChiTiet(SanPhamChiTietCreationRequest sanPhamChiTietCreationRequest);
    void updateSanPhamChiTiet(String id,SanPhamChiTietUpdateRequest sanPhamChiTietUpdateRequest);
}
