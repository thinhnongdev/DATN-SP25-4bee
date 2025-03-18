package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "phuong_thuc_thanh_toan")
@AllArgsConstructor
@NoArgsConstructor
public class PhuongThucThanhToan extends BaseEntity {
    @Id
    private String id;

    @Column(name="ma_phuong_thuc_thanh_toan")
    private String maPhuongThucThanhToan;

    @Column(name="ten_phuong_thuc_thanh_toan")
    private String tenPhuongThucThanhToan;

    @Column(name="tong_tien")
    private BigDecimal tongTien;

    @Column(name="mo_ta")
    private String moTa;

    @Column(name="trang_thai")
    private Boolean trangThai;
}
