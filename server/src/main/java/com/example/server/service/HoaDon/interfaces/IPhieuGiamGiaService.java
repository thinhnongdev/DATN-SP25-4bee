package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface IPhieuGiamGiaService {
    PhieuGiamGia validateAndGet(String id);
    List<PhieuGiamGiaResponse> getAvailableVouchersForOrder(BigDecimal orderTotal, String customerId);
    Map<String, Object> findBetterVouchers(String hoaDonId, String currentVoucherId);
}