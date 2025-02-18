package com.example.server.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "hoa_tiet")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "ma_hoa_tiet")
    private String maHoaTiet;

    @Column(name = "ten_hoa_tiet")
    private String tenHoaTiet;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Boolean trangThai;
    @CreationTimestamp
    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;
}
