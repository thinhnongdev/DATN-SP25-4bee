package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuTuiAoService {
    List<KieuTuiAo> getAll();

    KieuTuiAo saveKieuTuiAo(KieuTuiAoCreationRequest kieuTuiAoCreationRequest);

    KieuTuiAo getKieuTuiAoById(String id);

    KieuTuiAo updateKieuTuiAo(String id, KieuTuiAoUpdateRequest kieuTuiAoUpdateRequest);
}
