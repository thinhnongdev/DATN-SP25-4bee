package com.example.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoa_don_chi_tiet")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class HoaDonChiTiet extends BaseEntity {
    @Id
    @Column(name = "id")
    private String id;

//    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ManyToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST},fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_san_pham_chi_tiet")
    private SanPhamChiTiet sanPhamChiTiet;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Integer trangThai;

    // Thêm trường mới
    @Column(name = "gia_tai_thoi_diem_them")
    private BigDecimal giaTaiThoiDiemThem;

    @Column(name = "ngay_them_vao_gio")
    private LocalDateTime ngayThemVaoGio;
}

