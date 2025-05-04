package com.example.server.service.SanPham;


import com.example.server.dto.SanPham.request.HoaTietCreationRequest;
import com.example.server.dto.SanPham.request.HoaTietUpdateRequest;
import com.example.server.entity.HoaTiet;

import java.util.List;

public interface HoaTietService {
    List<HoaTiet> getAll();
    HoaTiet saveHoaTiet(HoaTietCreationRequest request);
    HoaTiet updateHoaTiet(String id, HoaTietUpdateRequest request);
    HoaTiet getHoaTietByID(String id);
}
