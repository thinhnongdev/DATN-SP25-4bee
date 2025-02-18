package com.example.server.dto.SanPham.request;

public class KieuCoTayAoCreationRequest {

    private String tenKieuCoTayAo;
    private String moTa;
    private Boolean trangThai;

    public String getTenKieuCoTayAo() {
        return tenKieuCoTayAo;
    }

    public void setTenKieuCoTayAo(String tenKieuCoTayAo) {
        this.tenKieuCoTayAo = tenKieuCoTayAo;
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
