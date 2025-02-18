package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.dto.SanPham.response.SanPhamResponse;
import com.example.server.entity.*;

import java.util.List;

public interface SanPhamService {
    List<SanPhamResponse> getAll();
    SanPham saveSanPham(SanPhamCreationRequest request);
    SanPham updateSanPham(String id,SanPhamUpdateRequest request);
    SanPham getSanPhamByID(String id);
    SanPham findByTen(String ten);
}
