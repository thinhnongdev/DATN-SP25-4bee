package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NhanVienResponse {
    private String id;
    private String maNhanVien;
    private String tenNhanVien;
    private String moTa;
}
