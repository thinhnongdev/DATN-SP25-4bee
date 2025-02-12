package com.example.module_nv_kh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="dia_chi")
public class DiaChi {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "id_khach_hang")
    private String id_khach_hang;

    @Column(name = "xa")
    private String xa;

    @Column(name = "huyen")
    private String huyen;

    @Column(name = "tinh")
    private String tinh;

    @Column(name = "mo_ta")
    private String mo_ta;

    @Column(name = "trang_thai")
    private int trang_thai;

    @CreationTimestamp
    @Column(name = "ngay_tao")
    private LocalDateTime ngay_tao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngay_sua;

    @Column(name = "nguoi_tao")
    private String nguoi_tao;

    @Column(name = "nguoi_sua")
    private String nguoi_sua;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId_khach_hang() {
        return id_khach_hang;
    }

    public void setId_khach_hang(String id_khach_hang) {
        this.id_khach_hang = id_khach_hang;
    }

    public String getXa() {
        return xa;
    }

    public void setXa(String xa) {
        this.xa = xa;
    }

    public String getHuyen() {
        return huyen;
    }

    public void setHuyen(String huyen) {
        this.huyen = huyen;
    }

    public String getTinh() {
        return tinh;
    }

    public void setTinh(String tinh) {
        this.tinh = tinh;
    }

    public String getMo_ta() {
        return mo_ta;
    }

    public void setMo_ta(String mo_ta) {
        this.mo_ta = mo_ta;
    }

    public int getTrang_thai() {
        return trang_thai;
    }

    public void setTrang_thai(int trang_thai) {
        this.trang_thai = trang_thai;
    }

    public LocalDateTime getNgay_tao() {
        return ngay_tao;
    }

    public void setNgay_tao(LocalDateTime ngay_tao) {
        this.ngay_tao = ngay_tao;
    }

    public LocalDateTime getNgay_sua() {
        return ngay_sua;
    }

    public void setNgay_sua(LocalDateTime ngay_sua) {
        this.ngay_sua = ngay_sua;
    }

    public String getNguoi_tao() {
        return nguoi_tao;
    }

    public void setNguoi_tao(String nguoi_tao) {
        this.nguoi_tao = nguoi_tao;
    }

    public String getNguoi_sua() {
        return nguoi_sua;
    }

    public void setNguoi_sua(String nguoi_sua) {
        this.nguoi_sua = nguoi_sua;
    }
}
