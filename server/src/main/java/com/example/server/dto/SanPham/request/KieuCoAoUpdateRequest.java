package com.example.server.dto.SanPham.request;

public class KieuCoAoUpdateRequest {
    private String tenKieuCoAo;
    private String moTa;
    private Boolean trangThai;

    public String getTenKieuCoAo() {
        return tenKieuCoAo;
    }

    public void setTenKieuCoAo(String tenKieuCoAo) {
        this.tenKieuCoAo = tenKieuCoAo;
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
