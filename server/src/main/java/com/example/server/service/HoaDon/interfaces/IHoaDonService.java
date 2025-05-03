package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.request.ThanhToanRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IHoaDonService {
    HoaDonResponse updateHoaDon(String id, HoaDonRequest request);

    HoaDonResponse getHoaDonById(String id);

    HoaDonResponse updateHoaDonAddress(String id, String diaChi, String tinh, String huyen, String xa,
                                       String diaChiCuThe,
                                       String tenNguoiNhan, String soDienThoai);

    Optional<HoaDon> findById(String id);

    Page<HoaDonResponse> getAllHoaDon(Pageable pageable);

    HoaDonResponse deleteHoaDon(String id, String lyDo);

    Page<HoaDonResponse> searchHoaDon(HoaDonSearchCriteria criteria, Pageable pageable);

    List<HoaDonStatisticsDTO> getStatistics(LocalDateTime fromDate, LocalDateTime toDate);

    byte[] generateInvoicePDF(String id);

    byte[] generateDeliveryInvoicePDF(String id);

    Map<String, Long> getInvoiceCounts(HoaDonSearchCriteria criteria);

    HoaDon validateAndGet(String id);

    HoaDon capNhatPhiVanChuyen(String hoaDonId, BigDecimal phiVanChuyen);

    HoaDonResponse updateTrangThai(String id, Integer trangThai, List<ThanhToanRequest> thanhToans);

    HoaDonResponse updateTrangThai(String id, Integer trangThai);

    HoaDonResponse thanhToanPhuPhi(String hoaDonId, BigDecimal soTien, ThanhToanRequest thanhToanRequest);

    HoaDonResponse refundExcessPaymentToPending(String hoaDonId, BigDecimal soTien);

    HoaDonResponse updateVNPayPayment(String hoaDonId);
}