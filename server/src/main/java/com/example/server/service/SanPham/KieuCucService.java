package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface KieuCucService {
    List<KieuCuc> getAll();

    KieuCuc saveKieuCucAo(KieuCucCreationRequest kieuCucCreationRequest);

    KieuCuc getKieuCucAoById(String id);

    KieuCuc updateKieuCucAo(String id, KieuCucUpdateRequest kieuCucUpdateRequest);
    boolean existsByTenKieuCuc(String name);
}
