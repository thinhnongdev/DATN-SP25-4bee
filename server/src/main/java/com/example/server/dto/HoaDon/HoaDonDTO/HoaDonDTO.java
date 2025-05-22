package com.example.server.dto.HoaDon.HoaDonDTO;


import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HoaDonDTO {
    private String id;
    private String maHoaDon;
    private String idKhachHang;
    private String idNhanVien;
    private Integer loaiHoaDon;
    private String tenNguoiNhan;
    private String soDienThoai;
    private String emailNguoiNhan;
    private String diaChi;
    private Integer trangThaiGiaoHang;
    private LocalDateTime thoiGianGiaoHang;
    private LocalDateTime thoiGianNhanHang;
    private BigDecimal tongTien;
    private String ghiChu;
    private Integer trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngaySua;
    private Integer soLuong;

    public HoaDonDTO(Integer trangThai, String trangThaiText, Integer soLuong) {
        this.trangThai = trangThai;
        this.maHoaDon = trangThaiText; // Tận dụng để truyền tên trạng thái
        this.soLuong = soLuong;
    }

    // Getters và Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(String maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    public String getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(String idKhachHang) {
        this.idKhachHang = idKhachHang;
    }

    public String getIdNhanVien() {
        return idNhanVien;
    }

    public void setIdNhanVien(String idNhanVien) {
        this.idNhanVien = idNhanVien;
    }

    public Integer getLoaiHoaDon() {
        return loaiHoaDon;
    }

    public void setLoaiHoaDon(Integer loaiHoaDon) {
        this.loaiHoaDon = loaiHoaDon;
    }

    public String getTenNguoiNhan() {
        return tenNguoiNhan;
    }

    public void setTenNguoiNhan(String tenNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getEmailNguoiNhan() {
        return emailNguoiNhan;
    }

    public void setEmailNguoiNhan(String emailNguoiNhan) {
        this.emailNguoiNhan = emailNguoiNhan;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public Integer getTrangThaiGiaoHang() {
        return trangThaiGiaoHang;
    }

    public void setTrangThaiGiaoHang(Integer trangThaiGiaoHang) {
        this.trangThaiGiaoHang = trangThaiGiaoHang;
    }

    public LocalDateTime getThoiGianGiaoHang() {
        return thoiGianGiaoHang;
    }

    public void setThoiGianGiaoHang(LocalDateTime thoiGianGiaoHang) {
        this.thoiGianGiaoHang = thoiGianGiaoHang;
    }

    public LocalDateTime getThoiGianNhanHang() {
        return thoiGianNhanHang;
    }

    public void setThoiGianNhanHang(LocalDateTime thoiGianNhanHang) {
        this.thoiGianNhanHang = thoiGianNhanHang;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
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

    public LocalDateTime getNgaySua() {
        return ngaySua;
    }

    public void setNgaySua(LocalDateTime ngaySua) {
        this.ngaySua = ngaySua;
    }
}
