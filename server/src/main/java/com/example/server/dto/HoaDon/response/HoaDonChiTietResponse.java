package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonChiTietResponse {
    private String id;
    private String sanPhamChiTietId;
    private String tenSanPham;
    private String maSanPham;
    private Integer soLuong;
    private BigDecimal gia;
    private BigDecimal thanhTien;
    private Integer trangThai;
}
