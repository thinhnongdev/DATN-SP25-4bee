package com.example.server.dto.PhieuGiamGia;


import lombok.Data;

import java.util.UUID;

@Data
public class PhieuGiamGiaKhachHangDTO {
    private String id;
    private String idPhieuGiamGia;
    private String idKhachHang;
    private Boolean trangThai;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdPhieuGiamGia() {
        return idPhieuGiamGia;
    }

    public void setIdPhieuGiamGia(String idPhieuGiamGia) {
        this.idPhieuGiamGia = idPhieuGiamGia;
    }

    public String getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(String idKhachHang) {
        this.idKhachHang = idKhachHang;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }

    public PhieuGiamGiaKhachHangDTO() {
        this.id = UUID.randomUUID().toString();  // Automatically generate a UUID when creating a new DTO
    }

    public PhieuGiamGiaKhachHangDTO(String id, String idPhieuGiamGia, String idKhachHang, Boolean trangThai) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.idPhieuGiamGia = idPhieuGiamGia;
        this.idKhachHang = idKhachHang;
        this.trangThai = trangThai;
    }
}
