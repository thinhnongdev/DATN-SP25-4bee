package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuCoTayAoService {
    List<KieuCoTayAo> getAll();

    KieuCoTayAo saveKieuCoTayAo(KieuCoTayAoCreationRequest kieuCoTayAoCreationRequest);

    KieuCoTayAo getKieuCoTayAoById(String id);

    KieuCoTayAo updateKieuCoTayAo(String id, KieuCoTayAoUpdateRequest kieuCoTayAoUpdateRequest);
}
