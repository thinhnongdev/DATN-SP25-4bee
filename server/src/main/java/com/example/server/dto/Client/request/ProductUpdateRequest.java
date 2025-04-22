package com.example.server.dto.Client.request;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    String idHoaDonChiTiet;
    String id;
    String maSanPhamChiTiet;
    String sanPham;
    BigDecimal gia;
    BigDecimal giaTaiThoiDiemThem;
    Integer soLuongMua;
    String mauSac;
    String kichThuoc;
    String chatLieu;
    String hoaTiet;
    String kieuDang;
    String thuongHieu;
    String moTa;
    LocalDateTime ngayTao;
    Integer trangThai;
}
