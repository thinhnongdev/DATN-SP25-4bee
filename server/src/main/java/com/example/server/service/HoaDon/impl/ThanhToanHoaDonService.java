package com.example.server.service.HoaDon.impl;

import com.example.server.constant.PaymentConstant;
import com.example.server.dto.HoaDon.request.ThanhToanHoaDonRequest;
import com.example.server.dto.HoaDon.response.ThanhToanHoaDonResponse;
import com.example.server.entity.ThanhToanHoaDon;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.mapper.impl.ThanhToanHoaDonMapper;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ThanhToanHoaDonService {
    private final ThanhToanHoaDonRepository repository;
    private final ThanhToanHoaDonMapper mapper;
    private final HoaDonRepository hoaDonRepository;
    private final PhuongThucThanhToanRepository phuongThucRepository;

    public ThanhToanHoaDonService(
            ThanhToanHoaDonRepository repository,
            ThanhToanHoaDonMapper mapper,
            HoaDonRepository hoaDonRepository,
            PhuongThucThanhToanRepository phuongThucRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.hoaDonRepository = hoaDonRepository;
        this.phuongThucRepository = phuongThucRepository;
    }

    public List<ThanhToanHoaDonResponse> getByHoaDonId(String hoaDonId) {
        return repository.findByHoaDonId(hoaDonId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    private int determineTrangThai(String phuongThucId) {
        if (phuongThucId == null) {
            throw new IllegalArgumentException("Phương thức thanh toán không được để trống.");
        }

        switch (phuongThucId) {
            case PaymentConstant.PAYMENT_METHOD_COD:
                return PaymentConstant.PAYMENT_STATUS_COD; // Trả sau (COD)
            case PaymentConstant.PAYMENT_METHOD_CASH:
                return PaymentConstant.PAYMENT_STATUS_PAID; // Tiền mặt -> Đã thanh toán ngay
            case PaymentConstant.PAYMENT_METHOD_BANK:
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Chuyển khoản -> Cần xác nhận
            case PaymentConstant.PAYMENT_METHOD_VNPAY:
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // VNPay -> Ban đầu là chờ xác nhận, sau cập nhật thành đã thanh toán
            default:
                log.warn(" Phát hiện phương thức thanh toán không hợp lệ: {}", phuongThucId);
                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Mặc định là chưa thanh toán
        }
    }

    @Transactional
    public ThanhToanHoaDonResponse createPayment(ThanhToanHoaDonRequest request) {
        // Tìm hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với id: " + request.getIdHoaDon()));

        // Tìm phương thức thanh toán
        PhuongThucThanhToan phuongThuc = phuongThucRepository.findById(request.getIdPhuongThucThanhToan())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy phương thức thanh toán với id: " + request.getIdPhuongThucThanhToan()));

        // Tạo bản ghi thanh toán mới
        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
        thanhToan.setHoaDon(hoaDon);
        thanhToan.setPhuongThucThanhToan(phuongThuc);
        thanhToan.setSoTien(request.getSoTien());
        thanhToan.setMoTa(request.getMoTa());
        thanhToan.setNgayTao(LocalDateTime.now());
        thanhToan.setTrangThai(determineTrangThai(phuongThuc.getId()));

        return mapper.toDTO(repository.save(thanhToan));
    }

    @Transactional
    public ThanhToanHoaDonResponse updatePaymentStatus(String id, Integer status) {
        ThanhToanHoaDon thanhToan = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với id: " + id));

        // Kiểm tra và cập nhật trạng thái
        if (status == PaymentConstant.PAYMENT_STATUS_PAID) {
            // Chỉ cho phép cập nhật thành "Đã thanh toán" khi:
            // 1. Thanh toán trực tiếp (CASH) thành công
            // 2. Chuyển khoản (BANK) thành công
            // 3. COD đã hoàn thành giao hàng
            thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_PAID);
        } else if (status == PaymentConstant.PAYMENT_STATUS_COD &&
                thanhToan.getPhuongThucThanhToan().getId().equals(PaymentConstant.PAYMENT_METHOD_COD)) {
            // Chỉ cho phép cập nhật thành "Trả sau" khi phương thức là COD
            thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_COD);
        } else {
            thanhToan.setTrangThai(PaymentConstant.PAYMENT_STATUS_UNPAID);
        }

        return mapper.toDTO(repository.save(thanhToan));
    }

    @Transactional(readOnly = true)
    public boolean isFullyPaid(String hoaDonId) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với id: " + hoaDonId));

        List<ThanhToanHoaDon> thanhToans = repository.findByHoaDonId(hoaDonId);

        // Kiểm tra xem tất cả các thanh toán đã hoàn thành chưa
        return thanhToans.stream()
                .allMatch(tt -> tt.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID);
    }
}
