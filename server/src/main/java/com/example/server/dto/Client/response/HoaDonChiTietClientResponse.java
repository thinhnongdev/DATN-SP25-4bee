package com.example.server.dto.Client.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonChiTietClientResponse {

    String idHoaDon;

    String id;

    String idHoaDonChiTiet;

    Integer quantity;

    Integer trangThai;

    BigDecimal giaTaiThoiDiemThem;

    LocalDateTime ngayThemVaoGio;
}