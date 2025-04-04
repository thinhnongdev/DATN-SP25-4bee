package com.example.server.service.HoaDon.interfaces;

import com.example.server.entity.NhanVien;

public interface ICurrentUserService {
    String getCurrentUsername();
    String getCurrentUserId();
    boolean isAdmin();
    NhanVien getCurrentNhanVien();
}