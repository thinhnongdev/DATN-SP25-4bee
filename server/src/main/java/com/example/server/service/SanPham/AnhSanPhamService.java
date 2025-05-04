package com.example.server.service.SanPham;


import com.example.server.entity.AnhSanPham;

import java.util.List;

public interface AnhSanPhamService {
    AnhSanPham saveAnhSanPham(AnhSanPham anhSanPham);
    List<AnhSanPham> findByIdSPCT(String id);
}
