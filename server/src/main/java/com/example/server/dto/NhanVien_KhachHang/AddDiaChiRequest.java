package com.example.server.dto.NhanVien_KhachHang;

import com.example.server.entity.DiaChi;

public class AddDiaChiRequest {
    private String khachHangId;
    private DiaChi diaChi;

    public String getKhachHangId() {
        return khachHangId;
    }

    public void setKhachHangId(String khachHangId) {
        this.khachHangId = khachHangId;
    }

    public DiaChi getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(DiaChi diaChi) {
        this.diaChi = diaChi;
    }
}
