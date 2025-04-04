package com.example.server.dto.HoaDon.response;

import lombok.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LichSuHoaDonResponse {
    private String id;
    private String idHoaDon;
    private String idKhachHang;
    private String idNhanVien;
    private String tenNhanVien;
    private String hanhDong;
    private String moTa;
    private Integer trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngaySua;
}
