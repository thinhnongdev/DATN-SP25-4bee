package com.example.server.service.HoaDon.interfaces;

import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface IHoaDonSanPhamService {
    // Quản lý sản phẩm trong hóa đơn
    HoaDonResponse addProduct(String hoaDonId, AddProductRequest request);  // Thêm sản phẩm vào hóa đơn (giảm tồn kho)

    HoaDonResponse updateProductQuantity(String hoaDonId, String hoaDonChiTietId, UpdateProductQuantityRequest request); // Cập nhật số lượng (đồng bộ tồn kho)

    HoaDonResponse removeProduct(String hoaDonId, String hoaDonChiTietId); // Xóa sản phẩm khỏi hóa đơn (hoàn lại tồn kho)

    List<SanPhamChiTietHoaDonResponse> getProductsInInvoice(String hoaDonId);  // Lấy danh sách sản phẩm trong hóa đơn

    // Quản lý voucher trong hóa đơn
    HoaDonResponse applyVoucher(String hoaDonId, String voucherId);  // Áp dụng voucher

    HoaDonResponse removeVoucher(String hoaDonId);  // Xóa voucher khỏi hóa đơn

    // Lấy thông tin chi tiết hóa đơn
    HoaDonResponse getInvoiceDetails(String hoaDonId); // Lấy chi tiết hóa đơn (bao gồm sản phẩm & voucher)

    //    Quản lý thay đổi giá sản phẩm
    Map<String, Object> checkPriceChanges(String hoaDonId);

    // Thêm phương thức để xử lý cập nhật giá sản phẩm
    HoaDonResponse updateProductPrice(String hoaDonId, String hoaDonChiTietId, Boolean useCurrentPrice);

    // Thêm phương thức để cập nhật giá tất cả sản phẩm trong giỏ hàng
    HoaDonResponse updateAllProductPrices(String hoaDonId, Boolean useCurrentPrices);

    // Thêm phương thức mới
    HoaDonResponse updateAllProductPricesAndProcessPayment(
            String hoaDonId,
            Boolean useCurrentPrices,
            String paymentAction,
            String paymentMethodId,
            BigDecimal adjustmentAmount);
}
