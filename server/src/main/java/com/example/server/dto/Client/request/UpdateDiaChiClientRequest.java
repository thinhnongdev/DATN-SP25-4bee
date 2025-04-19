package com.example.server.dto.Client.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateDiaChiClientRequest {
         String diaChi;
         BigDecimal shippingFee;
         BigDecimal totalPayment;
         String idKhachHang;
}
