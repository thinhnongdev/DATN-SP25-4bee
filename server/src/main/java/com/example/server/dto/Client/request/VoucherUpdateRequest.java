package com.example.server.dto.Client.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherUpdateRequest {
    private String id;
    private String maPhieuGiamGia;
    private String tenPhieuGiamGia;
    private Integer loaiPhieuGiamGia;
    private Integer kieuGiamGia;
    private Integer giaTriGiam;
    private Integer giaTriToiThieu;
    private Integer soTienGiamToiDa;
    private Integer soLuong;
    private String moTa;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private LocalDateTime ngayTao;
    private Integer trangThai;
}
