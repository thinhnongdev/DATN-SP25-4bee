package com.example.server.dto.Client.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentUpdateRequest {
    String id;
    String moTa;
    LocalDateTime ngayTao;
    LocalDateTime ngaySua;
    PaymentMethodUpdateRequest phuongThucThanhToan;
    Integer tongTien;
    Integer trangThai;
}
