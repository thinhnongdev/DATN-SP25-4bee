package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDon {
    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "ma_hoa_don", unique = true)
    private String maHoaDon;

    @ManyToOne
    @JoinColumn(name = "id_phieu_giam_gia")
    private PhieuGiamGia phieuGiamGia;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "id_nhan_vien")
    private NhanVien nhanVien;

    @Column(name = "loai_hoa_don")
    private Integer loaiHoaDon;

    @Column(name = "ten_nguoi_nhan")
    private String tenNguoiNhan;

    @Column(name = "so_dien_thoai", length = 10)
    private String soDienThoai;

    @Column(name = "email_nguoi_nhan")
    private String emailNguoiNhan;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "trang_thai_giao_hang")
    private Integer trangThaiGiaoHang;

    @Column(name = "thoi_gian_giao_hang")
    private LocalDateTime thoiGianGiaoHang;

    @Column(name = "thoi_gian_nhan_hang")
    private LocalDateTime thoiGianNhanHang;

    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "trang_thai")
    private Integer trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_sua")
    private LocalDateTime ngaySua;

    @Column(name = "nguoi_tao")
    private String nguoiTao;

    @Column(name = "nguoi_sua")
    private String nguoiSua;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<HoaDonChiTiet> hoaDonChiTiets = new ArrayList<>();

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ThanhToanHoaDon> thanhToanHoaDons = new ArrayList<>();

}