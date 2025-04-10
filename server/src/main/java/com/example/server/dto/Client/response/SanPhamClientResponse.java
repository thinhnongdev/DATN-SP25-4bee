package com.example.server.dto.Client.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamClientResponse {
    String id;
    String ma;
    String ten;
    String anhUrl;
    BigDecimal gia;
    String tenChatLieu;
    String tenDanhMuc;
    String tenHoaTiet;
    String[] tenKichThuoc;
    String[] tenMauSac;
    String tenKieuCoAo;
    String tenKieuCoTayAo;
    String tenKieuCuc;
    String tenKieuDang;
    String tenKieuTayAo;
    String tenKieuTuiAo;
    String tenThuongHieu;
}
