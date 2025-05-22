package com.example.server.dto.HoaDon.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonResponse {
    private String id;
    private String maHoaDon;
    private String tenNguoiNhan;
    private String tenNhanVien;
    private Integer loaiHoaDon;
    private String soDienThoai;
    private String emailNguoiNhan;
    private String diaChi;

    private String tinh;
    private String huyen;
    private String xa;
    private String diaChiCuThe;

    private Integer trangThaiGiaoHang;
    private LocalDateTime thoiGianGiaoHang;
    private LocalDateTime thoiGianNhanHang;
    private BigDecimal tongTien;
    private BigDecimal phiVanChuyen;
    private String ghiChu;
    private Integer trangThai;
    private LocalDateTime ngayTao;
    private NhanVienResponse nhanVien;
    private KhachHangResponse khachHang;
    private PhieuGiamGiaResponse phieuGiamGia;
    private BigDecimal tongThanhToan;
    private BigDecimal giamGia;

    private List<ThanhToanHoaDonResponse> thanhToans;

    private List<HoaDonChiTietResponse> hoaDonChiTiets;
    private List<DiaChiResponse> diaChiList; // Thêm thuộc tính này

    private String message;
}
