package com.example.server.dto.HoaDon.response;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaResponse {
    private String id;
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
    private LocalDateTime ngayTao;

    public String getLoaiPhieuGiamGiaText() {
        if (loaiPhieuGiamGia == null) return "Không xác định";
        return switch (loaiPhieuGiamGia) {
            case 1 -> "Giảm theo phần trăm";
            case 2 -> "Giảm theo số tiền";
            default -> "Không xác định";
        };
    }

    public String getTrangThaiText() {
        if (trangThai == null) return "Không xác định";
        return switch (trangThai) {
            case 1 -> "Đang hoạt động";
            case 2 -> "Ngừng hoạt động";
            case 3 -> "Hết hạn";
            default -> "Không xác định";
        };
    }
}
