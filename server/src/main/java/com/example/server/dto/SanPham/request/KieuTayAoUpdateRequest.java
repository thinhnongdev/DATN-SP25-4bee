package com.example.server.dto.SanPham.request;

public class KieuTayAoUpdateRequest {

    private String tenKieuTayAo;
    private String moTa;
    private Boolean trangThai;

    public String getTenKieuTayAo() {
        return tenKieuTayAo;
    }

    public void setTenKieuTayAo(String tenKieuTayAo) {
        this.tenKieuTayAo = tenKieuTayAo;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }
}
