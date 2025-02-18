package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;

import java.util.List;

public interface IHoaDonSanPhamService {
    // Quản lý sản phẩm trong hóa đơn
    HoaDonResponse addProduct(String hoaDonId, AddProductRequest request);  // Thêm sản phẩm vào hóa đơn (giảm tồn kho)
    HoaDonResponse updateProductQuantity(String hoaDonId, String hoaDonChiTietId, UpdateProductQuantityRequest request); // Cập nhật số lượng (đồng bộ tồn kho)
    HoaDonResponse removeProduct(String hoaDonId, String hoaDonChiTietId); // Xóa sản phẩm khỏi hóa đơn (hoàn lại tồn kho)
    List<HoaDonChiTietResponse> getProductsInInvoice(String hoaDonId);  // Lấy danh sách sản phẩm trong hóa đơn

    // Quản lý voucher trong hóa đơn
    HoaDonResponse applyVoucher(String hoaDonId, String voucherId);  // Áp dụng voucher
    HoaDonResponse removeVoucher(String hoaDonId);  // Xóa voucher khỏi hóa đơn

    // Lấy thông tin chi tiết hóa đơn
    HoaDonResponse getInvoiceDetails(String hoaDonId); // Lấy chi tiết hóa đơn (bao gồm sản phẩm & voucher)

    // Quản lý tồn kho sản phẩm trong hóa đơn
//    void decreaseStock(String sanPhamChiTietId, int soLuong);  // Giảm số lượng tồn kho khi thêm sản phẩm vào hóa đơn
//    void increaseStock(String sanPhamChiTietId, int soLuong);  // Hoàn lại số lượng vào kho khi xóa/giảm số lượng sản phẩm
}
