package com.example.server.dto.HoaDon.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThanhToanHoaDonResponse {
    private String id;
    private String hoaDonId;
    private String nhanVien; // Người xác nhận
    private String phuongThucThanhToanId;
    private String tenPhuongThucThanhToan; // Tên phương thức thanh toán
    private BigDecimal tongTien; // Số tiền
    private String moTa; // Ghi chú
    private Integer trangThai;
    private LocalDateTime ngayTao; // Thời gian
    private LocalDateTime ngaySua;

}
