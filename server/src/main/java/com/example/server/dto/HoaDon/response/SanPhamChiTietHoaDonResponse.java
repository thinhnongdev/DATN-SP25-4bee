package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamChiTietHoaDonResponse {
    private String id;
    private String sanPhamChiTietId;
    private String maSanPham;
    private String maSanPhamChiTiet;
    private String tenSanPham;
    private List<String> hinhAnh;
    private BigDecimal gia;
    private Integer soLuong;
    private BigDecimal thanhTien;
    private String moTa;
    private boolean trangThai;  // true: còn hàng, false: hết hàng
    private LocalDateTime ngayTao;

    // Thêm thông tin chi tiết từ SanPhamChiTiet
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
    // Xử lý giá sản phẩm thay đổi
    private BigDecimal giaTaiThoiDiemThem;
    private BigDecimal giaHienTai;
    private boolean giaThayDoi;
    private BigDecimal chenhLech;
    public String getTrangThaiText() {
        return trangThai ? "Còn hàng" : "Hết hàng";
    }
}
