package com.example.server.service.SanPham;

import com.example.server.dto.SanPham.request.*;

import com.example.server.entity.*;

import java.util.List;

public interface MauSacService {
    List<MauSac> getAll();
    MauSac saveMauSac(MauSacCreationRequest request);
    MauSac updateMauSac(String id, MauSacUpdateRequest request);
    MauSac getMauSacByID(String id);
    MauSac findByTen(String ten);
}
