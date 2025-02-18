package com.example.server.dto.SanPham.request;

public class KieuTuiAoUpdateRequest {

    private String tenKieuTuiAo;
    private String moTa;
    private Boolean trangThai;

    public String getTenKieuTuiAo() {
        return tenKieuTuiAo;
    }

    public void setTenKieuTuiAo(String tenKieuTuiAo) {
        this.tenKieuTuiAo = tenKieuTuiAo;
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
