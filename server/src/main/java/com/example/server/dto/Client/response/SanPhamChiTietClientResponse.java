package com.example.server.dto.Client.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamChiTietClientResponse {
    String id;

    String maSanPhamChiTiet;

    Integer soLuongMua;

    String moTa;

    Integer trangThai;

    java.math.BigDecimal gia;

    String mauSac;

    String chatLieu;

    String sanPham;

    String kichThuoc;

    String thuongHieu;

    String kieuDang;

    String hoaTiet;

    LocalDateTime ngayTao;
}
