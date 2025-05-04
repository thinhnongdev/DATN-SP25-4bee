package com.example.server.dto.SanPham.request;

public class KieuCucUpdateRequest {

    private String tenKieuCuc;
    private String moTa;
    private Boolean trangThai;

    public String getTenKieuCuc() {
        return tenKieuCuc;
    }

    public void setTenKieuCuc(String tenKieuCuc) {
        this.tenKieuCuc = tenKieuCuc;
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
