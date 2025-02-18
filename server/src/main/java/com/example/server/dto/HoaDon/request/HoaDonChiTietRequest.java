package com.example.server.dto.HoaDon.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonChiTietRequest {
    private String id;
    private String sanPhamChiTietId;
    private Integer soLuong;
    private Integer trangThai;
}
