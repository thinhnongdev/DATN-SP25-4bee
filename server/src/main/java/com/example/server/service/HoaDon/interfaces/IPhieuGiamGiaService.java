package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;

import java.math.BigDecimal;
import java.util.List;

public interface IPhieuGiamGiaService {
    PhieuGiamGia validateAndGet(String id);
    List<PhieuGiamGiaResponse> getAvailableVouchersForOrder(BigDecimal orderTotal, String customerId);

}