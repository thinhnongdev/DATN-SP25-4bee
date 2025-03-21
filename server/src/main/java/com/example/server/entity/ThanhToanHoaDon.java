package com.example.server.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false) // Thêm dòng này để giải quyết cảnh báo
@Table(name ="thanh_toan_hoa_don")
public class ThanhToanHoaDon extends BaseEntity{

    @Id
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private String id;


    @ManyToOne
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name="id_phuong_thuc_thanh_toan")
    private PhuongThucThanhToan phuongThucThanhToan;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Integer trangThai; // set mặc định là chờ thanh toán để tránh lỗi null (test)

    @Column(name = "tong_tien", nullable = false)
    private BigDecimal soTien; // Số tiền thanh toán theo phương thức này

}
