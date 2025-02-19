package com.example.server.dto.KhachHangCreationRequest;

import com.example.server.entity.DiaChi;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

}
