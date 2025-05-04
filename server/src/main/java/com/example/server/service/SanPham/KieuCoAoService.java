package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuCoAoService {
    List<KieuCoAo> getAll();

    KieuCoAo saveKieuCoAo(KieuCoAoCreationRequest kieuCoAoCreationRequest);

    KieuCoAo getKieuCoAoById(String id);

    KieuCoAo updateKieuCoAo(String id, KieuCoAoUpdateRequest kieuCoAoUpdateRequest);
}
