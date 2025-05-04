package com.example.server.dto.HoaDon.HoaDonDTO;

import java.util.Date;

public class ThongKeSoLuongDTO {
    private Date date;
    private int soLuong;

    public ThongKeSoLuongDTO(Date date, int soLuong) {
        this.date = date;
        this.soLuong = soLuong;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(int soLuong) {
        this.soLuong = soLuong;
    }
// Getters & Setters
}
