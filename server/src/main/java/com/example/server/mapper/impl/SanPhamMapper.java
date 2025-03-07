package com.example.server.mapper.impl;

import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
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

    public SanPhamChiTietHoaDonResponse toResponse(SanPhamChiTiet sanPham) {
        // Lấy danh sách ảnh sản phẩm từ database
        List<String> hinhAnh = anhSanPhamRepository.findByIdSPCT(sanPham.getId())
                .stream()
                .map(anh -> anh.getAnhUrl())
                .collect(Collectors.toList());

        return new SanPhamChiTietHoaDonResponse(
                sanPham.getId(),
                sanPham.getMaSanPhamChiTiet(),
                sanPham.getSanPham().getTenSanPham(),
                hinhAnh,
                sanPham.getGia(),
                sanPham.getSoLuong(), // Thay vì getSoLuongTonKho()
                sanPham.getGia().multiply(new BigDecimal(sanPham.getSoLuong())),
                sanPham.getMoTa(),
                sanPham.getTrangThai(),
                sanPham.getNgayTao(),
//                Kiểm tra để tránh lỗiiiii
                sanPham.getMauSac() != null ? sanPham.getMauSac().getTenMau() : "Không có dữ liệu",
                sanPham.getMauSac() != null ?
                        (sanPham.getMauSac().getMaMau() != null ? sanPham.getMauSac().getMaMau() : "#FFFFFF")
                        : "#FFFFFF",
                sanPham.getChatLieu() != null ? sanPham.getChatLieu().getTenChatLieu() : "Không có dữ liệu",
                sanPham.getDanhMuc() != null ? sanPham.getDanhMuc().getTenDanhMuc() : "Không có dữ liệu",
                sanPham.getKichThuoc() != null ? sanPham.getKichThuoc().getTenKichThuoc() : "Không có dữ liệu",
                sanPham.getThuongHieu() != null ? sanPham.getThuongHieu().getTenThuongHieu() : "Không có dữ liệu",
                sanPham.getKieuDang() != null ? sanPham.getKieuDang().getTenKieuDang() : "Không có dữ liệu",
                sanPham.getKieuCuc() != null ? sanPham.getKieuCuc().getTenKieuCuc() : "Không có dữ liệu",
                sanPham.getKieuCoAo() != null ? sanPham.getKieuCoAo().getTenKieuCoAo() : "Không có dữ liệu",
                sanPham.getKieuTayAo() != null ? sanPham.getKieuTayAo().getTenKieuTayAo() : "Không có dữ liệu",
                sanPham.getKieuCoTayAo() != null ? sanPham.getKieuCoTayAo().getTenKieuCoTayAo() : "Không có dữ liệu",
                sanPham.getHoaTiet() != null ? sanPham.getHoaTiet().getTenHoaTiet() : "Không có dữ liệu",
                sanPham.getTuiAo() != null ? sanPham.getTuiAo().getTenKieuTuiAo() : "Không có dữ liệu"
        );
    }
}

