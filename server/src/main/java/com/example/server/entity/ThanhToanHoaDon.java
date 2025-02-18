package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false) // Thêm dòng này để giải quyết cảnh báo
@Table(name ="thanh_toan_hoa_don")
public class ThanhToanHoaDon extends BaseEntity{

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id; // Ensure this field is unique and matches the database

    @ManyToOne
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name="id_phuong_thuc_thanh_toan")
    private PhuongThucThanhToan phuongThucThanhToan;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Integer trangThai;
}
