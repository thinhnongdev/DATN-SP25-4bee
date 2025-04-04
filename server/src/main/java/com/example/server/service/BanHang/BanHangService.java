package com.example.server.service.BanHang;

import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.UpdateDiaChiRequest;
import com.example.server.dto.HoaDon.response.DiaChiResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.HoaDon;

import java.util.List;

public interface BanHangService {
    HoaDonResponse createHoaDon(HoaDonRequest request);
    List<HoaDon> getHoaDonTaiQuay();
    HoaDonResponse addProduct(String hoaDonId, AddProductRequest request);  // Thêm sản phẩm vào hóa đơn (giảm tồn kho)
//    HoaDonResponse addMultipleProducts(String hoaDonId, List<AddProductRequest> requests);
HoaDonResponse updateDiaChiGiaoHang(String hoaDonId, UpdateDiaChiRequest addressRequest);
    HoaDonResponse applyVoucher(String hoaDonId, String voucherId);  // Áp dụng voucher
    HoaDonResponse completeOrder(String hoaDonId, HoaDonRequest request);
//    HoaDonResponse findById(String hoaDonId);
    HoaDonResponse applyBestVoucher(String hoaDonId, String customerId);  // Có customerId
    HoaDonResponse applyBestVoucher(String hoaDonId);
    HoaDonResponse selectCustomer (String hoaDonId, String customerName, String diaChiId);
    void updateLoaiHoaDon(String hoaDonId, Integer loaiHoaDon);

}
