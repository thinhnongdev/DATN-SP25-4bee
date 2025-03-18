package com.example.server.dto.HoaDon.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ThanhToanRequest {
    private String id; // Thêm ID để xử lý persistence
    private String maPhuongThucThanhToan;  // "COD" hoặc "BANK"
    private BigDecimal soTien; // Số tiền tương ứng với phương thức này
}

