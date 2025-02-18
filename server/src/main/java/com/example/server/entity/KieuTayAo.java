package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kieu_tay_ao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KieuTayAo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "ma_kieu_tay_ao")
    private String maKieuTayAo;

    @Column(name = "ten_kieu_tay_ao")
    private String tenKieuTayAo;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @CreationTimestamp
    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaKieuTayAo() {
        return maKieuTayAo;
    }

    public void setMaKieuTayAo(String maKieuTayAo) {
        this.maKieuTayAo = maKieuTayAo;
    }

    public String getTenKieuTayAo() {
        return tenKieuTayAo;
    }

    public void setTenKieuTayAo(String tenKieuTayAo) {
        this.tenKieuTayAo = tenKieuTayAo;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }
}
