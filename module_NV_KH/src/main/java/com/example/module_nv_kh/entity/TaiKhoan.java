package com.example.module_nv_kh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="tai_khoan")
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "id_vai_tro")
    private String id_vai_tro;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "trang thai")
    private int trang_thai;

    @CreationTimestamp
    @Column(name = "ngay_tao")
    private LocalDateTime ngay_tao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngay_sua;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId_vai_tro() {
        return id_vai_tro;
    }

    public void setId_vai_tro(String id_vai_tro) {
        this.id_vai_tro = id_vai_tro;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
