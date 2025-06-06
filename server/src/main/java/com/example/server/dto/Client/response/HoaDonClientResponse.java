package com.example.server.dto.Client.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonClientResponse {

    String id;

    String maHoaDon;

    String idPhieuGiamGia;

    String idKhachHang;


    Integer loaiHoaDon;


    String tenNguoiNhan;


    String soDienThoai;


    String emailNguoiNhan;


    String diaChi;


    Integer trangThaiGiaoHang;


    LocalDateTime thoiGianGiaoHang;


    LocalDateTime thoiGianNhanHang;


    BigDecimal tongTien;


    BigDecimal phiVanChuyen;


    String ghiChu;


    Integer trangThai;


    LocalDateTime ngayTao;


    LocalDateTime ngaySua;


    String nguoiTao;


    String nguoiSua;
    //List<ThanhToanHoaDon> thanhToanHoaDons = new ArrayList<>();

}

