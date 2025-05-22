package com.example.server.validator.impl;

import com.example.server.constant.HoaDonConstant;
import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.SanPham;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.validator.interfaces.IHoaDonValidator;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class HoaDonValidator implements IHoaDonValidator {

    @Override
    public void validateCreate(HoaDonRequest request) {
        List<String> errors = new ArrayList<>();

        if (request == null) {
            throw new ValidationException("Request không được để trống");
        }

        if (StringUtils.isEmpty(request.getTenNguoiNhan())) {
            errors.add("Tên người nhận không được để trống");
        }

//        if (StringUtils.isEmpty(request.getSoDienThoai())) {
//            errors.add("Số điện thoại không được để trống");
//        } else if (!request.getSoDienThoai().matches("\\d{10}")) {
//            errors.add("Số điện thoại không hợp lệ");
//        }

//        if (request.getTongTien() == null || request.getTongTien().compareTo(BigDecimal.ZERO) < 0) {
//            errors.add("Tổng tiền phải lớn hơn hoặc bằng 0");
//        }

        if (!errors.isEmpty()) {
            throw new ValidationException(String.join(", ", errors));
        }
    }

    @Override
    public void validateUpdate(HoaDonRequest request, HoaDon hoaDon) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }

        if (hoaDon.getTrangThai() == HoaDonConstant.TRANG_THAI_HOAN_THANH) {
            throw new ValidationException("Không thể cập nhật hóa đơn đã giao");
        }

        if (hoaDon.getTrangThai() == HoaDonConstant.TRANG_THAI_DA_HUY) {
            throw new ValidationException("Không thể cập nhật hóa đơn đã hủy");
        }

        validateCreate(request);
    }

    @Override
    public void validateDelete(HoaDon hoaDon) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }

        if (hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_DA_HUY) {
            throw new ValidationException("Chỉ có thể xóa hóa đơn đã hủy");
        }
    }

    @Override
    public void validateUpdateTrangThai(Integer trangThai, HoaDon hoaDon) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }

        if (trangThai == null) {
            throw new ValidationException("Trạng thái không được để trống");
        }

        if (!Arrays.asList(
                HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN,
                HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
                HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG,
                HoaDonConstant.TRANG_THAI_DANG_GIAO,
                HoaDonConstant.TRANG_THAI_HOAN_THANH,
                HoaDonConstant.TRANG_THAI_DA_HUY
        ).contains(trangThai)) {
            throw new ValidationException("Trạng thái không hợp lệ");
        }

        if (hoaDon.getTrangThai() == HoaDonConstant.TRANG_THAI_HOAN_THANH) {
            throw new ValidationException("Không thể thay đổi trạng thái của hóa đơn đã giao");
        }
    }

    @Override
    public void validateAddProduct(HoaDon hoaDon, AddProductRequest request) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }
        if (request == null || request.getSanPhamChiTietId() == null || request.getSoLuong() == null || request.getSoLuong() <= 0) {
            throw new ValidationException("Yêu cầu thêm sản phẩm không hợp lệ");
        }
    }

    @Override
    public void validateUpdateQuantity(HoaDon hoaDon, String sanPhamId, UpdateProductQuantityRequest request) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }
        if (sanPhamId == null || request == null || request.getSoLuong() == null || request.getSoLuong() <= 0) {
            throw new ValidationException("Yêu cầu cập nhật số lượng không hợp lệ");
        }
    }

    @Override
    public void validateRemoveProduct(HoaDon hoaDon, String sanPhamId) {
        if (hoaDon == null) {
            throw new ResourceNotFoundException("Hóa đơn không tồn tại");
        }
        if (sanPhamId == null) {
            throw new ValidationException("Sản phẩm không hợp lệ");
        }
    }

    @Override
    public void validateProductStock(SanPham sanPham, Integer soLuong) {
        if (sanPham == null || soLuong == null || soLuong <= 0) {
            throw new ValidationException("Sản phẩm hoặc số lượng không hợp lệ");
        }

//        int totalStock = sanPham.getSanPhamChiTiets().stream()
//                .filter(ct -> ct.getTrangThai() == 1)
//                .mapToInt(ct -> ct.getSoLuong())
//                .sum();
//
//        if (totalStock < soLuong) {
//            throw new ValidationException("Số lượng sản phẩm không đủ trong kho");
//        }
    }

//    @Override
//    public void validatePayment(HoaDon hoaDon, ThanhToanHoaDon thanhToan) {
//        if (hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {
//            throw new ValidationException("Chỉ hóa đơn đã xác nhận mới được thanh toán");
//        }
//
//        if (thanhToan.getTrangThai() == 1) {
//            throw new ValidationException("Phương thức thanh toán này đã được sử dụng");
//        }
//    }

}