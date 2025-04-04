package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonChiTietResponse {
    private String id;
    private String sanPhamChiTietId;
    private List<String> hinhAnh; // Thay đổi từ String thành List<String>
    private String tenSanPham;
    private String maSanPham;
    private String maSanPhamChiTiet;
    private Integer soLuong;
    private BigDecimal gia;
    private BigDecimal thanhTien;
    private Integer trangThai;

    // Thêm các trường thông tin chi tiết
    private String mauSac;
    private String maMauSac;
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
    private String kieuTuiAo;
}
