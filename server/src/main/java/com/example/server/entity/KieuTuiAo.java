package com.example.server.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kieu_tui_ao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KieuTuiAo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "ma_kieu_tui_ao")
    private String maKieuTuiAo;

    @Column(name = "ten_kieu_tui_ao")
    private String tenKieuTuiAo;

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

    public String getMaKieuTuiAo() {
        return maKieuTuiAo;
    }

    public void setMaKieuTuiAo(String maKieuTuiAo) {
        this.maKieuTuiAo = maKieuTuiAo;
    }

    public String getTenKieuTuiAo() {
        return tenKieuTuiAo;
    }

    public void setTenKieuTuiAo(String tenKieuTuiAo) {
        this.tenKieuTuiAo = tenKieuTuiAo;
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