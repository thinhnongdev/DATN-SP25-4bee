package com.example.server.dto.SanPham.request;

public class HoaTietCreationRequest {

    private String maHoaTiet;

    private String tenHoaTiet;

    private String moTa;

    private Boolean trangThai;

    public String getMaHoaTiet() {
        return maHoaTiet;
    }

    public void setMaHoaTiet(String maHoaTiet) {
        this.maHoaTiet = maHoaTiet;
    }

    public String getTenHoaTiet() {
        return tenHoaTiet;
    }

    public void setTenHoaTiet(String tenHoaTiet) {
        this.tenHoaTiet = tenHoaTiet;
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
