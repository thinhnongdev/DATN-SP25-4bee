package com.example.server.dto.SanPham.request;

import java.math.BigDecimal;
import java.util.List;

public class SanPhamChiTietCreationRequest {



    private Integer soLuong;
    private String moTa;

    private java.math.BigDecimal gia;

    private String mauSac;

    private String chatLieu;

    private String tenSanPham;

    private String size;

    private String thuongHieu;

    private String kieuDang;

    private String kieuCuc;

    private String kieuCoAo;

    private String kieuTayAo;

    private String kieuCoTayAo;
    private String kieuTuiAo;
    private String danhMuc;
    private String hoaTiet;
    private List<String> images;

    public String getDanhMuc() {
        return danhMuc;
    }

    public void setDanhMuc(String danhMuc) {
        this.danhMuc = danhMuc;
    }

    public String getHoaTiet() {
        return hoaTiet;
    }

    public void setHoaTiet(String hoaTiet) {
        this.hoaTiet = hoaTiet;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public BigDecimal getGia() {
        return gia;
    }

    public void setGia(BigDecimal gia) {
        this.gia = gia;
    }

    public String getMauSac() {
        return mauSac;
    }

    public void setMauSac(String mauSac) {
        this.mauSac = mauSac;
    }

    public String getChatLieu() {
        return chatLieu;
    }

    public void setChatLieu(String chatLieu) {
        this.chatLieu = chatLieu;
    }


    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(String thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public String getKieuDang() {
        return kieuDang;
    }

    public void setKieuDang(String kieuDang) {
        this.kieuDang = kieuDang;
    }

    public String getKieuCuc() {
        return kieuCuc;
    }

    public void setKieuCuc(String kieuCuc) {
        this.kieuCuc = kieuCuc;
    }

    public String getKieuCoAo() {
        return kieuCoAo;
    }

    public void setKieuCoAo(String kieuCoAo) {
        this.kieuCoAo = kieuCoAo;
    }

    public String getKieuTayAo() {
        return kieuTayAo;
    }

    public String getKieuTuiAo() {
        return kieuTuiAo;
    }

    public void setKieuTuiAo(String kieuTuiAo) {
        this.kieuTuiAo = kieuTuiAo;
    }

    public void setKieuTayAo(String kieuTayAo) {
        this.kieuTayAo = kieuTayAo;
    }

    public String getKieuCoTayAo() {
        return kieuCoTayAo;
    }

    public void setKieuCoTayAo(String kieuCoTayAo) {
        this.kieuCoTayAo = kieuCoTayAo;
    }
}


