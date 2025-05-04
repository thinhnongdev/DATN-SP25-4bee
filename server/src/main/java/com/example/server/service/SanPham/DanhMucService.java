package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.DanhMucCreationRequest;
import com.example.server.dto.SanPham.request.DanhMucUpdateRequest;
import com.example.server.entity.DanhMuc;

import java.util.List;

public interface DanhMucService {
    List<DanhMuc> getAll();
    DanhMuc saveDanhMuc(DanhMucCreationRequest request);
    DanhMuc updateDanhMuc(String id, DanhMucUpdateRequest request);
    DanhMuc getDanhMucByID(String id);
}
