package com.example.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vai_tro")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VaiTro {
    @Id
    private String id;

    @Column(name = "ma_vai_tro", unique = true)
    private String maVaiTro;

    @Column(name = "ten_vai_tro")
    private String tenVaiTro;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Boolean trangThai;
}