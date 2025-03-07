package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IHoaDonService {
    HoaDonResponse createHoaDon(HoaDonRequest request);
    HoaDonResponse updateHoaDon(String id, HoaDonRequest request);
    HoaDonResponse getHoaDonById(String id);
    HoaDonResponse updateHoaDonAddress(String id, String diaChi, String tinh, String huyen, String xa, String moTa );
    Optional<HoaDon> findById(String id);
    Page<HoaDonResponse> getAllHoaDon(Pageable pageable);
    HoaDonResponse deleteHoaDon(String id);
    HoaDonResponse updateTrangThai(String id, Integer trangThai);
    Page<HoaDonResponse> searchHoaDon(HoaDonSearchCriteria criteria, Pageable pageable);
    List<HoaDonStatisticsDTO> getStatistics(LocalDateTime fromDate, LocalDateTime toDate);
    byte[] generateInvoicePDF(String id);
    Map<String, Long> getInvoiceCounts(HoaDonSearchCriteria criteria);
    HoaDon validateAndGet(String id);
}