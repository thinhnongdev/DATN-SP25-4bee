package com.example.server.dto.Client.response;

import com.example.server.entity.PhuongThucThanhToan;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ThanhToanHoaDonClientResponse {
    String id;
    String moTa;
    LocalDateTime ngayTao;
    LocalDateTime ngaySua;
    Integer trangThai;
    BigDecimal tongTien;
    PhuongThucThanhToan phuongThucThanhToan;
}
