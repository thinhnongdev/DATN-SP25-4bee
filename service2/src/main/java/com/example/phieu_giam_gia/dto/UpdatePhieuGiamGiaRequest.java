package com.example.phieu_giam_gia.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class UpdatePhieuGiamGiaRequest {
    private String maPhieuGiamGia;
    private String tenPhieuGiamGia;
    private Integer loaiPhieuGiamGia; // 1: %, 2: Số tiền giảm
    private Integer kieuGiamGia;      // 1: Công khai, 2: Cá nhân
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriToiThieu;
    private BigDecimal soTienGiamToiDa;
    private Instant ngayBatDau;
    private Instant ngayKetThuc;
    private Integer soLuong;
    private String moTa;
    private Integer trangThai;
    private List<String> idKhachHang;
    private List<String> danhSachKhachHang; //
    // Constructor cho việc cập nhật dữ liệu. Một số trường có thể là tùy chọn (cho cập nhật một phần)
    public UpdatePhieuGiamGiaRequest(String maPhieuGiamGia, String tenPhieuGiamGia, Integer loaiPhieuGiamGia, Integer kieuGiamGia, BigDecimal giaTriGiam, BigDecimal giaTriToiThieu, BigDecimal soTienGiamToiDa, Instant ngayBatDau, Integer trangThai, Instant ngayKetThuc, Integer soLuong, String moTa, List<String> idKhachHang) {
        this.maPhieuGiamGia = maPhieuGiamGia;
        this.tenPhieuGiamGia = tenPhieuGiamGia;
        this.loaiPhieuGiamGia = loaiPhieuGiamGia;
        this.kieuGiamGia = kieuGiamGia;
        this.giaTriGiam = giaTriGiam;
        this.giaTriToiThieu = giaTriToiThieu;
        this.soTienGiamToiDa = soTienGiamToiDa;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.soLuong = soLuong;
        this.trangThai = trangThai;
        this.moTa = moTa;
        this.idKhachHang = idKhachHang;
    }
    public List<String> getKhachHangsToCancel() {
        return this.idKhachHang != null ? this.idKhachHang : List.of();  // Trả về một danh sách rỗng nếu không có khách hàng để hủy
    }
}
