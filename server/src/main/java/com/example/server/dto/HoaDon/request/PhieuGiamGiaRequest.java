package com.example.server.dto.HoaDon.request;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaRequest {
    private String voucherId;
    private String maPhieuGiamGia;
    private String tenPhieuGiamGia;
    private Integer loaiPhieuGiamGia;
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriToiThieu;
    private BigDecimal soTienGiamToiDa;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer soLuong;
    private String moTa;
    private Integer trangThai;
}