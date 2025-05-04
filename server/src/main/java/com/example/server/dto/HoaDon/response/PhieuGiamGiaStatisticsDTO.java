package com.example.server.dto.HoaDon.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaStatisticsDTO {
    private Integer trangThai;
    private Long soLuong;
    private BigDecimal tongGiaTriGiam;
    private String trangThaiText;
    private LocalDateTime ngayTao;

    public PhieuGiamGiaStatisticsDTO(Integer trangThai, Long soLuong, BigDecimal tongGiaTriGiam) {
        this.trangThai = trangThai;
        this.soLuong = soLuong;
        this.tongGiaTriGiam = tongGiaTriGiam;
        this.trangThaiText = getTrangThaiText();
    }

    public String getTrangThaiText() {
        if (trangThai == null) return "Không xác định";
        return switch (trangThai) {
            case 1 -> "Đang hoạt động";
            case 2 -> "Ngừng hoạt động";
            case 3 -> "Hết hạn";
            case 4 -> "Đã sử dụng";
            default -> "Không xác định";
        };
    }
}