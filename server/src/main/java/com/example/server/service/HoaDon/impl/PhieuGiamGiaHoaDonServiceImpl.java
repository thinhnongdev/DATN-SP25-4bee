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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhieuGiamGiaHoaDonServiceImpl implements IPhieuGiamGiaService {
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final IPhieuGiamGia mapper;

    @Override
    public List<PhieuGiamGiaResponse> getAvailableVouchersForOrder(BigDecimal orderTotal, String customerId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Lấy phiếu giảm giá công khai
        List<PhieuGiamGiaResponse> publicVouchers = phieuGiamGiaRepository.findAllCongKhai().stream()
                .filter(voucher ->
                        voucher.getSoLuong() > 0 &&
                                now.isAfter(voucher.getNgayBatDau()) &&
                                now.isBefore(voucher.getNgayKetThuc()) &&
                                orderTotal.compareTo(voucher.getGiaTriToiThieu()) >= 0
                )
                .map(mapper::entityToResponse)
                .collect(Collectors.toList());

        log.info("Found {} public vouchers", publicVouchers.size());

        // 2. Lấy phiếu giảm giá cá nhân của khách hàng cụ thể
        List<PhieuGiamGiaResponse> personalVouchers = new ArrayList<>();
        if (customerId != null && !customerId.isEmpty() && !"Khách hàng lẻ".equals(customerId)) {
            personalVouchers = phieuGiamGiaRepository.findPersonalVouchers(customerId, now).stream()
                    .filter(voucher -> orderTotal.compareTo(voucher.getGiaTriToiThieu()) >= 0)
                    .map(mapper::entityToResponse)
                    .collect(Collectors.toList());

            log.info("Found {} personal vouchers for customer {}", personalVouchers.size(), customerId);
        }

        // 3. Gộp danh sách và loại bỏ trùng lặp
        List<PhieuGiamGiaResponse> allVouchers = Stream.concat(publicVouchers.stream(), personalVouchers.stream())
                .distinct()
                .collect(Collectors.toList());

        log.info("Total vouchers available: {}", allVouchers.size());

        return allVouchers;
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