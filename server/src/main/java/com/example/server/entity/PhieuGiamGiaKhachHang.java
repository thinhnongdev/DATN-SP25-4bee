package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "phieu_giam_gia_khach_hang")
public class PhieuGiamGiaKhachHang {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "id_phieu_giam_gia")
    private PhieuGiamGia phieuGiamGia;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang")
    private KhachHang khachHang;

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngaySua;

    @Column(name = "nguoi_tao")
    private String nguoiTao;

    @Column(name = "nguoi_sua")
    private String nguoiSua;



    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PhieuGiamGia getPhieuGiamGia() {
        return phieuGiamGia;
    }

    public void setPhieuGiamGia(PhieuGiamGia phieuGiamGia) {
        this.phieuGiamGia = phieuGiamGia;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHang khachHang) {
        this.khachHang = khachHang;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public LocalDateTime getNgaySua() {
        return ngaySua;
    }

    public void setNgaySua(LocalDateTime ngaySua) {
        this.ngaySua = ngaySua;
    }

    public String getNguoiTao() {
        return nguoiTao;
    }

    public void setNguoiTao(String nguoiTao) {
        this.nguoiTao = nguoiTao;
    }

    public String getNguoiSua() {
        return nguoiSua;
    }

    public void setNguoiSua(String nguoiSua) {
        this.nguoiSua = nguoiSua;
    }

    // Phương thức tự động sinh UUID khi thực thể được tạo
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();  // Tạo ID tự động khi chưa có
        }
        if (this.ngayTao == null) {
            this.ngayTao = LocalDateTime.now();  // Gán ngày tạo nếu chưa có
        }
        this.ngaySua = this.ngayTao;  // Gán ngày sửa giống ngày tạo ban đầu
    }

    // Phương thức tự động cập nhật ngày sửa khi thực thể được cập nhật
    @PreUpdate
    public void preUpdate() {
        this.ngaySua = LocalDateTime.now();  // Cập nhật ngày sửa mỗi khi thực thể được cập nhật
    }
}
