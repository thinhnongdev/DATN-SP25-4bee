package com.example.phieu_giam_gia.dto;


import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class PhieuGiamGiaDTO {
    private String id;
    private String maPhieuGiamGia;
    private String tenPhieuGiamGia;
    private Integer loaiPhieuGiamGia;
    private Integer kieuGiamGia;
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriToiThieu;
    private BigDecimal soTienGiamToiDa;
    private Instant ngayBatDau;
    private Instant ngayKetThuc;
    private Integer soLuong;
    private String moTa;
    private Integer trangThai;
    private LocalDateTime ngayTao;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Instant getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(Instant ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public Instant getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(Instant ngayKetThuc) {
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

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }
}
