package com.example.server.dto.Client.request;

import com.example.server.entity.PhieuGiamGia;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutRequest {
    private List<SanPhamChiTietClientRequest> sanPhamChiTietList;
    private ThongTinGiaoHangClientRequest thongTinGiaoHang;
    private BigDecimal tongTienThanhToan;
    private BigDecimal tongTienHang;
    private BigDecimal phiVanChuyen;
    private PhieuGiamGia phieuGiamGia;
}
