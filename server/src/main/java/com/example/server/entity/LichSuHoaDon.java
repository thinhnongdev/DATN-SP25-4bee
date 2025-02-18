package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "lich_su_hoa_don")
@NoArgsConstructor
@AllArgsConstructor
public class LichSuHoaDon{
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name="id_khach_hang")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "id_nhan_vien")
    private NhanVien nhanVien;

    @Column(name="hanh_dong")
    private String hanhDong;

    @Column(name="mo_ta")
    private String moTa;

    @Column(name="trang_thai")
    private Integer trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngaySua;
}
