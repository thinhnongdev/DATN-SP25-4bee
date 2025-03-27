package com.example.server.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;


@Entity
@Table(name = "khach_hang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "ma_khach_hang", unique = true)
    private String maKhachHang;

    @Column(name = "ten_khach_hang")
    private String tenKhachHang;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "gioi_tinh")
    private Boolean gioiTinh;

    @Column(name = "so_dien_thoai", length = 10)
    private String soDienThoai;

    @Column(name = "email")
    private String email;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "ngay_tao")
    @CreationTimestamp
    private LocalDateTime ngayTao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngaySua;

    @Column(name = "nguoi_tao")
    private String nguoiTao;

    @Column(name = "nguoi_sua")
    private String nguoiSua;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan")
    TaiKhoan taiKhoan;
}
