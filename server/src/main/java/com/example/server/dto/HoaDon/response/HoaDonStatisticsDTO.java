package com.example.server.dto.HoaDon.response;

import lombok.*;
import java.math.BigDecimal;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonStatisticsDTO {
    private Integer trangThai;
    private Long soLuong;
    private BigDecimal tongTien;
    private String trangThaiText;

}
