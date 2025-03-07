package com.example.server.service.PhieuGiamGia;


import com.example.server.dto.PhieuGiamGia.CreatePhieuGiamGiaRequest;
import com.example.server.dto.PhieuGiamGia.PhieuGiamGiaDTO;
import com.example.server.dto.PhieuGiamGia.UpdatePhieuGiamGiaRequest;
import com.example.server.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PhieuGiamGiaService {
    List<PhieuGiamGiaDTO> getAll();
    PhieuGiamGiaDTO getById(String id);
    PhieuGiamGiaDTO addPhieuGiamGia(CreatePhieuGiamGiaRequest request);
    PhieuGiamGiaDTO update(UpdatePhieuGiamGiaRequest request, String id);
//    PhieuGiamGiaDTO findByMaPhieuGiamGia(String maPhieuGiamGia);
    Page<PhieuGiamGiaDTO> getAllWithPagination(Pageable pageable);
    void deleteById(String id);
    String getDiscountInfo(String maPhieuGiamGia);
    double applyDiscount(String maPhieuGiamGia, double tongGiaTriDonHang);

    // Thêm phương thức lấy danh sách khách hàng theo mã phiếu giảm giá
    List<KhachHang> getKhachHangByMaPhieuGiamGia(String maPhieuGiamGia);


    // Thêm phương thức huỷ phiếu giảm giá cho khách hàng
    void cancelPhieuGiamGiaForCustomer(String maPhieuGiamGia, String maKhachHang);
    void addCustomerToPhieuGiamGia(String phieuGiamGiaId, List<String> khachHangIds);
    void removeCustomerFromPhieuGiamGia(String phieuGiamGiaId, String khachHangId);
}
