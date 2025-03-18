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

    private String idKhachHang;

    private String idPhieuGiamGia;

    @NotNull(message = "Loại hóa đơn không được để trống")
    private Integer loaiHoaDon; // 1: Online, 2: Tại quầy, 3: Giao hàng

    private String ghiChu;

    private List<SanPhamChiTietHoaDonResponse> sanPhams; // Danh sách sản phẩm trong hóa đơn

    private List<ThanhToanRequest> thanhToans; // Danh sách phương thức thanh toán

    private List<HoaDonChiTietResponse> hoaDonChiTiets;

    //Chỉ yêu cầu địa chỉ khi là giao hàng (loaiHoaDon = 3)
    @NotBlank(message = "Địa chỉ không được để trống", groups = GiaoHang.class)
    private String diaChi;

    // Nếu khách hàng có tài khoản, cho phép chọn địa chỉ đã lưu
    private String diaChiId;

    // Nhóm validation cho từng loại hóa đơn
    public interface GiaoHang {} // Dùng để kiểm tra chỉ khi giao hàng
}
