package com.example.server.dto.HoaDon.response;

import lombok.*;

@Data
@AllArgsConstructor
public class PhuongThucThanhToanResponse {
    private String id;
    private String maPhuongThucThanhToan;
    private String tenPhuongThucThanhToan;
    private String moTa;
}

