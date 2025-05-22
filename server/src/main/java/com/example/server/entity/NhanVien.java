package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhan_vien")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhanVien {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "ma_nhan_vien", unique = true)
    private String maNhanVien;

    @Column(name = "ten_nhan_vien")
    private String tenNhanVien;

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

    @Column(name = "anh")
    private String anh;

    @Column(name = "can_cuoc_cong_dan")
    private String canCuocCongDan;

    @Column(name = "xa")
    private String xa;

    @Column(name = "huyen")
    private String huyen;

    @Column(name = "tinh")
    private String tinh;

    @Column(name = "dia_chi_cu_the")
    private String diaChiCuThe;

    public NhanVien(String id) {
        this.id = id;
    }
}
