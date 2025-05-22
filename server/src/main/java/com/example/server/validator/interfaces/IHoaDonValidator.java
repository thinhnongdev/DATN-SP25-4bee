package com.example.server.validator.interfaces;

import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.SanPham;

public interface IHoaDonValidator {
    void validateCreate(HoaDonRequest request);
    void validateUpdate(HoaDonRequest request, HoaDon hoaDon);
    void validateDelete(HoaDon hoaDon);
    void validateUpdateTrangThai(Integer trangThai, HoaDon hoaDon);

    void validateAddProduct(HoaDon hoaDon, AddProductRequest request);
    void validateUpdateQuantity(HoaDon hoaDon, String sanPhamId, UpdateProductQuantityRequest request);
    void validateRemoveProduct(HoaDon hoaDon, String sanPhamId);
    void validateProductStock(SanPham sanPham, Integer quantity);
//    void validatePayment(HoaDon hoaDon, ThanhToanHoaDon thanhToan);

}