package com.example.server.dto.HoaDon.request;

import lombok.Data;

@Data
public class ThanhToanHoaDonRequest {
    private String idHoaDon;
    private String idPhuongThucThanhToan;
    private String moTa;
    private Integer trangThai;
}
