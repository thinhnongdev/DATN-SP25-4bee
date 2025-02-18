package com.example.server.dto.HoaDon.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LichSuHoaDonRequest {
    private String hoaDonId;
    private Integer trangThai;
    private LocalDateTime thoiGian;
    private String nhanVien;
    private String hanhDong;
    private String ghiChu;
}
