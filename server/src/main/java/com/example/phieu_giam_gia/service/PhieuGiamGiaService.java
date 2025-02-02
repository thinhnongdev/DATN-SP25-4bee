package com.example.phieu_giam_gia.service;
import com.example.phieu_giam_gia.dto.CreatePhieuGiamGiaRequest;
import com.example.phieu_giam_gia.dto.PhieuGiamGiaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PhieuGiamGiaService {
    List<PhieuGiamGiaDTO> getAll();
    PhieuGiamGiaDTO getById(String id);
    PhieuGiamGiaDTO addPhieuGiamGia(CreatePhieuGiamGiaRequest request);
    PhieuGiamGiaDTO update(PhieuGiamGiaDTO dto, String id);
//    PhieuGiamGiaDTO findByMaPhieuGiamGia(String maPhieuGiamGia);
    Page<PhieuGiamGiaDTO> getAllWithPagination(Pageable pageable);
    void deleteById(String id);
    String getDiscountInfo(String maPhieuGiamGia);
    double applyDiscount(String maPhieuGiamGia, double tongGiaTriDonHang);
}
