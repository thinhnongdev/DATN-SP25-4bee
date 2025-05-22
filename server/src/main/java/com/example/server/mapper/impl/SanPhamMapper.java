package com.example.server.mapper.impl;

import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SanPhamMapper {
    @Autowired
    private AnhSanPhamRepository anhSanPhamRepository;

    /**
     * Chuyển đổi từ SanPhamChiTiet sang SanPhamChiTietHoaDonResponse
     * @param sanPham Đối tượng SanPhamChiTiet
     * @return SanPhamChiTietHoaDonResponse
     */
    public SanPhamChiTietHoaDonResponse toResponse(SanPhamChiTiet sanPham) {
        // Lấy danh sách ảnh sản phẩm từ database
        List<String> hinhAnh = anhSanPhamRepository
                .findByIdSPCT(sanPham.getId())
                .stream()
                .map(AnhSanPham::getAnhUrl)
                .collect(Collectors.toList());

        String maSanPham = sanPham.getSanPham() != null ? sanPham.getSanPham().getMaSanPham() : "Không có dữ liệu";
        BigDecimal gia = sanPham.getGia();

        return SanPhamChiTietHoaDonResponse.builder()
                .id(sanPham.getId())
                .sanPhamChiTietId(sanPham.getId()) // Thêm ID sản phẩm chi tiết
                .maSanPham(maSanPham)
                .maSanPhamChiTiet(sanPham.getMaSanPhamChiTiet())
                .tenSanPham(sanPham.getSanPham() != null ? sanPham.getSanPham().getTenSanPham() : "Không có dữ liệu")
                .hinhAnh(hinhAnh)
                .gia(gia)
                .soLuong(sanPham.getSoLuong())
                .thanhTien(gia.multiply(new BigDecimal(sanPham.getSoLuong())))
                .moTa(sanPham.getMoTa())
                .trangThai(sanPham.getTrangThai())
                .ngayTao(sanPham.getNgayTao())
                // Các thuộc tính chi tiết sản phẩm
                .mauSac(sanPham.getMauSac() != null ? sanPham.getMauSac().getTenMau() : "Không có dữ liệu")
                .maMauSac(sanPham.getMauSac() != null ?
                        (sanPham.getMauSac().getMaMau() != null ? sanPham.getMauSac().getMaMau() : "#FFFFFF")
                        : "#FFFFFF")
                .chatLieu(sanPham.getChatLieu() != null ? sanPham.getChatLieu().getTenChatLieu() : "Không có dữ liệu")
                .danhMuc(sanPham.getDanhMuc() != null ? sanPham.getDanhMuc().getTenDanhMuc() : "Không có dữ liệu")
                .kichThuoc(sanPham.getKichThuoc() != null ? sanPham.getKichThuoc().getTenKichThuoc() : "Không có dữ liệu")
                .thuongHieu(sanPham.getThuongHieu() != null ? sanPham.getThuongHieu().getTenThuongHieu() : "Không có dữ liệu")
                .kieuDang(sanPham.getKieuDang() != null ? sanPham.getKieuDang().getTenKieuDang() : "Không có dữ liệu")
                .kieuCuc(sanPham.getKieuCuc() != null ? sanPham.getKieuCuc().getTenKieuCuc() : "Không có dữ liệu")
                .kieuCoAo(sanPham.getKieuCoAo() != null ? sanPham.getKieuCoAo().getTenKieuCoAo() : "Không có dữ liệu")
                .kieuTayAo(sanPham.getKieuTayAo() != null ? sanPham.getKieuTayAo().getTenKieuTayAo() : "Không có dữ liệu")
                .kieuCoTayAo(sanPham.getKieuCoTayAo() != null ? sanPham.getKieuCoTayAo().getTenKieuCoTayAo() : "Không có dữ liệu")
                .hoaTiet(sanPham.getHoaTiet() != null ? sanPham.getHoaTiet().getTenHoaTiet() : "Không có dữ liệu")
                .kieuTuiAo(sanPham.getTuiAo() != null ? sanPham.getTuiAo().getTenKieuTuiAo() : "Không có dữ liệu")
                // Thêm các trường mới cho xử lý thay đổi giá
                .giaTaiThoiDiemThem(gia)  // Mặc định gán bằng giá hiện tại
                .giaHienTai(gia)          // Mặc định gán bằng giá hiện tại
                .giaThayDoi(false)        // Mặc định là false
                .chenhLech(BigDecimal.ZERO) // Mặc định là 0
                .build();
    }

    /**
     * Phương thức đặc biệt cho việc chuyển đổi sản phẩm trong giỏ hàng
     * với thông tin về thay đổi giá
     * @param sanPham Đối tượng SanPhamChiTiet
     * @param giaTaiThoiDiemThem Giá khi thêm vào giỏ hàng
     * @return SanPhamChiTietHoaDonResponse
     */
    public SanPhamChiTietHoaDonResponse toCartResponse(SanPhamChiTiet sanPham, BigDecimal giaTaiThoiDiemThem) {
        // Lấy danh sách ảnh sản phẩm từ database

        List<String> hinhAnh = anhSanPhamRepository
                .findByIdSPCT(sanPham.getId())
                .stream()
                .map(AnhSanPham::getAnhUrl)
                .collect(Collectors.toList());

        String maSanPham = sanPham.getSanPham() != null ? sanPham.getSanPham().getMaSanPham() : "Không có dữ liệu";
        BigDecimal giaHienTai = sanPham.getGia();

        // Nếu giaTaiThoiDiemThem là null, sử dụng giá hiện tại
        if (giaTaiThoiDiemThem == null) {
            giaTaiThoiDiemThem = giaHienTai;
        }

        // So sánh giá
        boolean giaThayDoi = giaHienTai.compareTo(giaTaiThoiDiemThem) != 0;
        BigDecimal chenhLechGia = giaHienTai.subtract(giaTaiThoiDiemThem);

        return SanPhamChiTietHoaDonResponse.builder()
                .id(sanPham.getId())
                .sanPhamChiTietId(sanPham.getId())
                .maSanPham(maSanPham)
                .maSanPhamChiTiet(sanPham.getMaSanPhamChiTiet())
                .tenSanPham(sanPham.getSanPham() != null ? sanPham.getSanPham().getTenSanPham() : "Không có dữ liệu")
                .hinhAnh(hinhAnh)
                .gia(giaTaiThoiDiemThem)  // Sử dụng giá tại thời điểm thêm
                .soLuong(sanPham.getSoLuong())
                .thanhTien(giaTaiThoiDiemThem.multiply(new BigDecimal(sanPham.getSoLuong())))
                .moTa(sanPham.getMoTa())
                .trangThai(sanPham.getTrangThai())
                .ngayTao(sanPham.getNgayTao())
                // Các thuộc tính chi tiết sản phẩm
                .mauSac(sanPham.getMauSac() != null ? sanPham.getMauSac().getTenMau() : "Không có dữ liệu")
                .maMauSac(sanPham.getMauSac() != null ?
                        (sanPham.getMauSac().getMaMau() != null ? sanPham.getMauSac().getMaMau() : "#FFFFFF")
                        : "#FFFFFF")
                .chatLieu(sanPham.getChatLieu() != null ? sanPham.getChatLieu().getTenChatLieu() : "Không có dữ liệu")
                .danhMuc(sanPham.getDanhMuc() != null ? sanPham.getDanhMuc().getTenDanhMuc() : "Không có dữ liệu")
                .kichThuoc(sanPham.getKichThuoc() != null ? sanPham.getKichThuoc().getTenKichThuoc() : "Không có dữ liệu")
                .thuongHieu(sanPham.getThuongHieu() != null ? sanPham.getThuongHieu().getTenThuongHieu() : "Không có dữ liệu")
                .kieuDang(sanPham.getKieuDang() != null ? sanPham.getKieuDang().getTenKieuDang() : "Không có dữ liệu")
                .kieuCuc(sanPham.getKieuCuc() != null ? sanPham.getKieuCuc().getTenKieuCuc() : "Không có dữ liệu")
                .kieuCoAo(sanPham.getKieuCoAo() != null ? sanPham.getKieuCoAo().getTenKieuCoAo() : "Không có dữ liệu")
                .kieuTayAo(sanPham.getKieuTayAo() != null ? sanPham.getKieuTayAo().getTenKieuTayAo() : "Không có dữ liệu")
                .kieuCoTayAo(sanPham.getKieuCoTayAo() != null ? sanPham.getKieuCoTayAo().getTenKieuCoTayAo() : "Không có dữ liệu")
                .hoaTiet(sanPham.getHoaTiet() != null ? sanPham.getHoaTiet().getTenHoaTiet() : "Không có dữ liệu")
                .kieuTuiAo(sanPham.getTuiAo() != null ? sanPham.getTuiAo().getTenKieuTuiAo() : "Không có dữ liệu")
                // Thông tin về thay đổi giá
                .giaTaiThoiDiemThem(giaTaiThoiDiemThem)
                .giaHienTai(giaHienTai)
                .giaThayDoi(giaThayDoi)
                .chenhLech(chenhLechGia)
                .build();
    }
}