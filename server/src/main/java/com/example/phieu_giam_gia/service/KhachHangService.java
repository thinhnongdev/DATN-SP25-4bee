package com.example.phieu_giam_gia.service;
import com.example.phieu_giam_gia.dto.KhachHangDTO;
import com.example.phieu_giam_gia.entity.KhachHang;

import java.util.List;

public interface KhachHangService {
    List<KhachHangDTO> getAll();
}
