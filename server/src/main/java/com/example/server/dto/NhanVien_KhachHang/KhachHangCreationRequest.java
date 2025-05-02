package com.example.server.dto.NhanVien_KhachHang;

import com.example.server.entity.DiaChi;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class KhachHangCreationRequest {
    private String tenKhachHang;

    private LocalDate ngaySinh;

    private Boolean gioiTinh;

    private String soDienThoai;

    private String email;

    private List<DiaChi> diaChi;

    private String password; // Thêm trường password cho đăng ký

}
