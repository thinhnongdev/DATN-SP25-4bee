package com.example.server.dto.HoaDon.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundRequest {
    private BigDecimal soTien;
    private String maPhuongThucThanhToan;
    private String moTa;
}
