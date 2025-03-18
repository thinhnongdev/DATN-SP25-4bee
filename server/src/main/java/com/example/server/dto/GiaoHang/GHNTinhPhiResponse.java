package com.example.server.dto.GiaoHang;

import lombok.Data;

@Data
public class GHNTinhPhiResponse {
    private int code;
    private String message;
    private DuLieuPhanHoi data;

    @Data
    public static class DuLieuPhanHoi {
        private int total; // Tổng phí vận chuyển (VNĐ)
    }
}
