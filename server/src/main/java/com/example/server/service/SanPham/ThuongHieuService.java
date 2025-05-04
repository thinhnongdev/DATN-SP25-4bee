package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface ThuongHieuService {
    List<ThuongHieu> getAll();
    ThuongHieu saveThuongHieu(ThuongHieuCreationRequest request);
    ThuongHieu updateThuongHieu(String id, ThuongHieuUpdateRequest request);
    ThuongHieu getThuongHieuByID(String id);
}
