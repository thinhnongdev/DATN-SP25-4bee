package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tai_khoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column(name = "username")
    String username;
    @Column(name = "password")
    String password;
    @Column(name = "trang_thai")
    int trangThai;
    @Column(name = "ngay_tao")
    LocalDateTime ngayTao;
    @Column(name = "ngay_sua")
    LocalDateTime ngaySua;
    @ManyToOne
    @JoinColumn(name = "id_vai_tro")
    VaiTro vaiTro;

}
