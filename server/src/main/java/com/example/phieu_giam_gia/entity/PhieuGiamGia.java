package com.example.phieu_giam_gia.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "phieu_giam_gia")
public class PhieuGiamGia {
    @Id
    private String id;

    @Column(name = "ma_phieu_giam_gia", unique = true)
    private String maPhieuGiamGia;

    @Column(name = "ten_phieu_giam_gia")
    private String tenPhieuGiamGia;

    @Column(name = "loai_phieu_giam_gia")
    private Integer loaiPhieuGiamGia;

    @Column(name = "kieu_giam_gia")
    private Integer kieuGiamGia;

    @Column(name = "gia_tri_giam")
    private BigDecimal giaTriGiam;

    @Column(name = "gia_tri_toi_thieu")
    private BigDecimal giaTriToiThieu;

    @Column(name = "so_tien_giam_toi_da")
    private BigDecimal soTienGiamToiDa;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "UTC")
    @Column(name = "ngay_bat_dau", nullable = false)
    private Instant ngayBatDau;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "UTC")
    @Column(name = "ngay_ket_thuc", nullable = false)
    private Instant ngayKetThuc;


    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Integer trangThai;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private Instant ngayTao;
    @CreationTimestamp
    @Column(name = "ngay_sua")
    private Instant ngaySua;

    @Column(name = "nguoi_tao")
    private String nguoiTao;

    @Column(name = "nguoi_sua")
    private String nguoiSua;
}