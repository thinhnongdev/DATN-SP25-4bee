package com.example.server.dto.HoaDon.response;
import lombok.*;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KhachHangResponse {
    private String id;
    private String maKhachHang;
    private String tenKhachHang;
    private LocalDate ngaySinh;
    private Boolean gioiTinh;
    private String soDienThoai;
    private String email;
    private String moTa;
    private Boolean trangThai;
    private LocalDateTime ngayTao;

    private List<DiaChiResponse> diaChiList; // Thêm thuộc tính này

    public String getGioiTinhText() {
        if (gioiTinh == null) return "Không xác định";
        return gioiTinh ? "Nam" : "Nữ";
    }

    public String getTrangThaiText() {
        if (trangThai == null) return "Không xác định";
        return trangThai ? "Đang hoạt động" : "Ngừng hoạt động";
    }

    public Integer getTuoi() {
        if (ngaySinh == null) return null;
        return Period.between(ngaySinh, LocalDate.now()).getYears();
    }
}