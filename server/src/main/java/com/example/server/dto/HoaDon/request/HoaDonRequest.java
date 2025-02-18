package com.example.server.dto.HoaDon.request;

import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.PhuongThucThanhToan;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String tenNguoiNhan;

    @Pattern(regexp = "\\d{10}", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    @Email(message = "Email không hợp lệ")
    private String emailNguoiNhan;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String diaChi;

    private String idKhachHang;

    private String idPhieuGiamGia;

    private Integer loaiHoaDon;
//    @NotNull(message = "Tổng tiền không được để trống")
//    @Min(value = 0, message = "Tổng tiền phải lớn hơn hoặc bằng 0")
//    private BigDecimal tongTien;

    private String ghiChu;

    private List<SanPhamChiTietHoaDonResponse> sanPhams; // Danh sách sản phẩm trong hóa đơn

    private List<PhuongThucThanhToan> phuongThucThanhToans;

    private List<HoaDonChiTietResponse> hoaDonChiTiets;
}