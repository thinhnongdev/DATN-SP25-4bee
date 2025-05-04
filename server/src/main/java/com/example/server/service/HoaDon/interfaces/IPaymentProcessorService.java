package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.ThanhToanRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;

import java.math.BigDecimal;
import java.util.List;

public interface IPaymentProcessorService {
    /**
     * Xử lý thanh toán khi thay đổi trạng thái hóa đơn
     * @param hoaDonId ID của hóa đơn
     * @param thanhToans Danh sách các thanh toán
     * @return Hóa đơn sau khi cập nhật
     */
    HoaDonResponse processPaymentOnStatusChange(String hoaDonId, List<ThanhToanRequest> thanhToans);

    /**
     * Xử lý thanh toán phụ phí
     * @param hoaDonId ID của hóa đơn
     * @param soTien Số tiền cần thanh toán thêm
     * @param thanhToanRequest Thông tin thanh toán
     * @return Hóa đơn sau khi cập nhật
     */
//    HoaDonResponse thanhToanPhuPhi(String hoaDonId, BigDecimal soTien, ThanhToanRequest thanhToanRequest);
}