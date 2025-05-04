package com.example.server.dto.Client.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentMethodUpdateRequest {
    String id;
    String maPhuongThucThanhToan;
    String tenPhuongThucThanhToan;
    String moTa;
    LocalDateTime ngayTao;
    LocalDateTime ngaySua;
    Boolean trangThai;
}
