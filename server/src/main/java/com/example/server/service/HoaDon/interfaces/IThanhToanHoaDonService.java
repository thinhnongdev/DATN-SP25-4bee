package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.ThanhToanHoaDonRequest;
import com.example.server.dto.HoaDon.response.ThanhToanHoaDonResponse;

import java.util.List;

public interface IThanhToanHoaDonService {
    ThanhToanHoaDonResponse createPayment(ThanhToanHoaDonRequest requestDTO);

    List<ThanhToanHoaDonResponse> getPaymentsByHoaDonId(String hoaDonId);

    ThanhToanHoaDonResponse updatePaymentStatus(String id, Integer status);
}
