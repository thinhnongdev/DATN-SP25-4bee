package com.example.module_nv_kh.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.Date;

@EntityScan
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name="nhan_vien")
public class NhanVien {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "ma_nhan_vien")
    private String ma_nhan_vien;

    @Column(name = "ten_nhan_vien")
    private String ten_nhan_vien;

    @Column(name = "ngay_sinh")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date ngay_sinh;

    @Column(name = "mo_ta")
    private String mo_ta;

    @Column(name = "trang_thai")
    private Boolean trang_thai;

    @Column(name = "gioi_tinh")
    private Boolean gioi_tinh;

    @Column(name = "so_dien_thoai")
    private String so_dien_thoai;

    @Column(name = "email")
    private String email;

    @CreationTimestamp
    @Column(name = "ngay_tao")
    private LocalDateTime ngay_tao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngay_sua;

    @Column(name = "nguoi_tao")
    private String nguoi_tao;

    @Column(name = "nguoi_sua")
    private String nguoi_sua;

    @OneToOne
    @JoinColumn(name="id_tai_khoan", referencedColumnName = "id")
    private TaiKhoan taiKhoan;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMa_nhan_vien() {
        return ma_nhan_vien;
    }

    public void setMa_nhan_vien(String ma_nhan_vien) {
        this.ma_nhan_vien = ma_nhan_vien;
    }

    public String getTen_nhan_vien() {
        return ten_nhan_vien;
    }

    public void setTen_nhan_vien(String ten_nhan_vien) {
        this.ten_nhan_vien = ten_nhan_vien;
    }

    public Date getNgay_sinh() {
        return ngay_sinh;
    }

    public void setNgay_sinh(Date ngay_sinh) {
        this.ngay_sinh = ngay_sinh;
    }

    public String getMo_ta() {
        return mo_ta;
    }

    public void setMo_ta(String mo_ta) {
        this.mo_ta = mo_ta;
    }

    public Boolean getTrang_thai() {
        return trang_thai;
    }

    public void setTrang_thai(Boolean trang_thai) {
        this.trang_thai = trang_thai;
    }

    public Boolean getGioi_tinh() {
        return gioi_tinh;
    }

    public void setGioi_tinh(Boolean gioi_tinh) {
        this.gioi_tinh = gioi_tinh;
    }

    public String getSo_dien_thoai() {
        return so_dien_thoai;
    }

    public void setSo_dien_thoai(String so_dien_thoai) {
        this.so_dien_thoai = so_dien_thoai;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }
}
