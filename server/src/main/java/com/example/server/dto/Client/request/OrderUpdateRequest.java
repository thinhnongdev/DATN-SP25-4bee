package com.example.server.dto.Client.request;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderUpdateRequest {
    String id;
    String maHoaDon;
    Integer loaiHoaDon;
    String idKhachHang;
    String tenNguoiNhan;
    String soDienThoai;
    String diaChi;
    String emailNguoiNhan;
    String ghiChu;
    LocalDateTime thoiGianNhanHang;
    LocalDateTime thoiGianGiaoHang;
    BigDecimal phiVanChuyen;
    BigDecimal tongTien;
    BigDecimal tongThanhToan;
    Integer trangThai;
    Integer trangThaiGiaoHang;
    String idPhieuGiamGia;
    VoucherUpdateRequest voucher;
    List<ProductUpdateRequest> products;
    List<PaymentUpdateRequest> payments;
}
