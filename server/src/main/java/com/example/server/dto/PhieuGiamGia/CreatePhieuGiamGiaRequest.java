package com.example.server.dto.PhieuGiamGia;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Data
public class CreatePhieuGiamGiaRequest {
    private int id;
    private String maPhieuGiamGia;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    private String tenPhieuGiamGia;
    private Integer loaiPhieuGiamGia; // 1: %, 2: Số tiền giảm
    private Integer kieuGiamGia;      // 1: Công khai, 2: Cá nhân
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriToiThieu;
    private BigDecimal soTienGiamToiDa;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer soLuong;
    private String moTa;
    private Integer trangThai;
    private List<String> idKhachHang;

    public CreatePhieuGiamGiaRequest(String maPhieuGiamGia, String tenPhieuGiamGia, Integer loaiPhieuGiamGia, Integer kieuGiamGia, BigDecimal giaTriGiam, BigDecimal giaTriToiThieu, BigDecimal soTienGiamToiDa, LocalDateTime ngayBatDau,Integer trangThai, LocalDateTime ngayKetThuc, Integer soLuong, String moTa, List<String> idKhachHang) {
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

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public String getMaPhieuGiamGia() {
        return maPhieuGiamGia;
    }

    public void setMaPhieuGiamGia(String maPhieuGiamGia) {
        this.maPhieuGiamGia = maPhieuGiamGia;
    }

    public String getTenPhieuGiamGia() {
        return tenPhieuGiamGia;
    }

    public void setTenPhieuGiamGia(String tenPhieuGiamGia) {
        this.tenPhieuGiamGia = tenPhieuGiamGia;
    }

    public Integer getLoaiPhieuGiamGia() {
        return loaiPhieuGiamGia;
    }

    public void setLoaiPhieuGiamGia(Integer loaiPhieuGiamGia) {
        this.loaiPhieuGiamGia = loaiPhieuGiamGia;
    }

    public Integer getKieuGiamGia() {
        return kieuGiamGia;
    }

    public void setKieuGiamGia(Integer kieuGiamGia) {
        this.kieuGiamGia = kieuGiamGia;
    }

    public BigDecimal getGiaTriGiam() {
        return giaTriGiam;
    }

    public void setGiaTriGiam(BigDecimal giaTriGiam) {
        this.giaTriGiam = giaTriGiam;
    }

    public BigDecimal getGiaTriToiThieu() {
        return giaTriToiThieu;
    }

    public void setGiaTriToiThieu(BigDecimal giaTriToiThieu) {
        this.giaTriToiThieu = giaTriToiThieu;
    }

    public BigDecimal getSoTienGiamToiDa() {
        return soTienGiamToiDa;
    }

    public void setSoTienGiamToiDa(BigDecimal soTienGiamToiDa) {
        this.soTienGiamToiDa = soTienGiamToiDa;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
    public LocalDateTime getNgayBatDauAsLocalDateTime() {
        return ngayBatDau != null ? ngayBatDau.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime() : null;
    }

    public void setNgayBatDauFromLocalDateTime(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThucAsLocalDateTime() {
        return ngayKetThuc != null ? ngayKetThuc.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime() : null;
    }

    public void setNgayKetThucFromLocalDateTime(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }
    public List<String> getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(List<String> idKhachHang) {
        this.idKhachHang = idKhachHang;
    }


}
