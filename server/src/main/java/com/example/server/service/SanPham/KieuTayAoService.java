package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuTayAoService {
    List<KieuTayAo> getAll();

    KieuTayAo saveKieuTayAo(KieuTayAoCreationRequest kieuTayAoCreationRequest);

    KieuTayAo getKieuTayAoById(String id);

    KieuTayAo updateKieuTayAo(String id, KieuTayAoUpdateRequest kieuTayAoUpdateRequest);
}
