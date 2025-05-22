package com.example.server.dto.Client.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ThongTinGiaoHangClientRequest {
    String idKhachHang;
    String hoTen;
    String soDienThoai;
    String email;
    String province;
    String district;
    String ward;
    String diaChiCuThe;
    String ghiChu;
    String phuongThucThanhToan;
    String maHoaDon;
}
