package com.example.server.dto.BanHang.request;

public class CreateHoaDonChiTietRequest {
    private String hoaDonId;
    private String sanPhamChiTietId;
    private Integer soLuong;

    public String getHoaDonId() {
        return hoaDonId;
    }

    public void setHoaDonId(String hoaDonId) {
        this.hoaDonId = hoaDonId;
    }

    public String getSanPhamChiTietId() {
        return sanPhamChiTietId;
    }

    public void setSanPhamChiTietId(String sanPhamChiTietId) {
        this.sanPhamChiTietId = sanPhamChiTietId;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }


}
