package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.interfaces.IPhieuGiamGia;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.HoaDon.interfaces.IPhieuGiamGiaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhieuGiamGiaHoaDonServiceImpl implements IPhieuGiamGiaService {
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final IPhieuGiamGia mapper;

    @Override
    public List<PhieuGiamGiaResponse> getAvailableVouchersForOrder(BigDecimal orderTotal) {
        LocalDateTime now = LocalDateTime.now();
        return phieuGiamGiaRepository.findAll().stream()
                .filter(voucher ->
                        // Đang hoạt động
                        voucher.getTrangThai() == 1 &&
                                // Còn số lượng
                                voucher.getSoLuong() > 0 &&
                                // Trong thời gian hiệu lực
                                now.isAfter(voucher.getNgayBatDau()) &&
                                now.isBefore(voucher.getNgayKetThuc()) &&
                                // Đủ điều kiện áp dụng
                                orderTotal.compareTo(voucher.getGiaTriToiThieu()) >= 0
                )
                .map(mapper::entityToResponse)
                .collect(Collectors.toList());
    }

//    @Override
//    public List<PhieuGiamGiaResponse> getAllActiveVouchers() {
//        return phieuGiamGiaRepository.findAllActiveVouchers(LocalDateTime.now())
//                .stream()
//                .map(mapper::entityToResponse)
//                .collect(Collectors.toList());
//    }

    @Override
    public PhieuGiamGia validateAndGet(String id) {
        return phieuGiamGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu giảm giá không tồn tại"));
    }

//    @Override
//    public void updateExpiredVouchers() {
//        List<PhieuGiamGia> expiredVouchers =
//                phieuGiamGiaRepository.findExpiredVouchers(LocalDateTime.now());
//
//        expiredVouchers.forEach(voucher -> {
//            voucher.setTrangThai(3); // Set trạng thái hết hạn
//            log.info("Marked voucher {} as expired", voucher.getMaPhieuGiamGia());
//        });
//
//        phieuGiamGiaRepository.saveAll(expiredVouchers);
//    }
}