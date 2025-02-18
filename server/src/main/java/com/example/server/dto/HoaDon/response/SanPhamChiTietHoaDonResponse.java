package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamChiTietHoaDonResponse {
    private String id;
    private String maSanPham;
    private String tenSanPham;
    private BigDecimal gia;
    private Integer soLuong;
    private String moTa;
    private boolean trangThai;  // true: còn hàng, false: hết hàng
    private LocalDateTime ngayTao;

    // Thêm thông tin chi tiết từ SanPhamChiTiet
    private String mauSac;
    private String chatLieu;
    private String danhMuc;
    private String kichThuoc;
    private String thuongHieu;
    private String kieuDang;
    private String kieuCuc;
    private String kieuCoAo;
    private String kieuTayAo;
    private String kieuCoTayAo;
    private String hoaTiet;
    private String tuiAo;

    public String getTrangThaiText() {
        return trangThai ? "Còn hàng" : "Hết hàng";
    }
}
