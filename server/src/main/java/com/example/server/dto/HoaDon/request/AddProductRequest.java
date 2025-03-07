package com.example.server.dto.HoaDon.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AddProductRequest {
    @NotNull(message = "ID sản phẩm không được để trống")
    private String sanPhamChiTietId;  // Đổi tên biến

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;

    private List<AddProductRequest> productList; // Cho phép gửi nhiều sản phẩm

}
