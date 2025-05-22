package com.example.server.dto.Client.request;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LichSuHoaDonClientRequest {
    String moTa;
    String idKhachHang;
}
