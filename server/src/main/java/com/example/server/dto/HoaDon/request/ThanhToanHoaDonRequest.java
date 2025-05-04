package com.example.server.dto.HoaDon.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToanHoaDonRequest {
    private String idHoaDon;
    private String idPhuongThucThanhToan;
    private String moTa;
    private Integer trangThai;
    private BigDecimal soTien;
}
