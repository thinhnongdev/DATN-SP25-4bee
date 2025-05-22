package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuDangService {
    List<KieuDang> getAll();

    KieuDang saveKieuDang(KieuDangCreationRequest kieuDangCreationRequest);

    KieuDang getKieuDangById(String id);

    KieuDang updateKieuDang(String id, KieuDangUpdateRequest kieuDangUpdateRequest);
}
