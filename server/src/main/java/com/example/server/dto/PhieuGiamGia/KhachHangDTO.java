package com.example.server.dto.PhieuGiamGia;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@Data
public class KhachHangDTO {
    private String id;
    private String maKhachHang;
    private String tenKhachHang;

    private String soDienThoai;
    private String email;
    private Boolean trangThai; // Thêm biến này để lưu trạng thái áp dụng phiếu

    public KhachHangDTO() {
    }

    public KhachHangDTO(String id, String maKhachHang, String tenKhachHang, String soDienThoai, String email, Boolean trangThai) {
        this.id = id;
        this.maKhachHang = maKhachHang;
        this.tenKhachHang = tenKhachHang;
        this.soDienThoai = soDienThoai;
        this.email = email;
        this.trangThai = trangThai;
    }

    // Thêm getter và setter nếu cần
    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }



    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
