package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.SanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.repository.HoaDon.SanPhamHoaDonRepository;
import com.example.server.service.HoaDon.interfaces.ISanPhamHoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SanPhamHoaDonServiceImpl implements ISanPhamHoaDonService {
    private final SanPhamHoaDonRepository sanPhamHoaDonRepository;
    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;

    @Override
    public SanPham validateAndGet(String id) {
        return sanPhamHoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
    }

    @Override
    public List<SanPhamChiTietHoaDonResponse> getAllProducts() {
        // Sắp xếp theo thứ tự giảm dần của ngày tạo (mới nhất lên đầu)
        return sanPhamChiTietHoaDonRepository.findAll().stream()
                .sorted(Comparator.comparing(SanPhamChiTiet::getNgayTao, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(SanPhamChiTiet::getId, Comparator.reverseOrder()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
    public boolean checkProductAvailability(String id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new ValidationException("Số lượng cần kiểm tra phải lớn hơn 0");
        }

        // Kiểm tra sản phẩm chi tiết có tồn tại không
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository.findBySanPhamIdAndTrangThai(id, true)
                .orElseThrow(() -> new ValidationException("Sản phẩm chi tiết không hợp lệ hoặc không đủ hàng"));

        //Kiểm tra số lượng tồn kho
        return sanPhamChiTiet.getSoLuong() >= quantity;
    }


    private SanPhamChiTietHoaDonResponse mapToResponse(SanPhamChiTiet spct) {
        return SanPhamChiTietHoaDonResponse.builder()
                .id(spct.getId())  // ID của `SanPhamChiTiet`
                .maSanPham(spct.getSanPham().getMaSanPham())  // Lấy mã từ `SanPham`
                .tenSanPham(spct.getSanPham().getTenSanPham())  // Tên từ `SanPham`
                .gia(spct.getGia())  // Giá từ `SanPhamChiTiet`
                .soLuong(spct.getSoLuong())  // Lấy số lượng tồn kho
                .moTa(spct.getMoTa())  // Lấy mô tả
                .trangThai(spct.getSoLuong() > 0)  // Kiểm tra còn hàng hay không

                // Chuyển đổi từ entity sang String
                .mauSac(spct.getMauSac() != null ? spct.getMauSac().getTenMau() : "Không xác định")
                .chatLieu(spct.getChatLieu() != null ? spct.getChatLieu().getTenChatLieu() : "Không xác định")
                .danhMuc(spct.getDanhMuc() != null ? spct.getDanhMuc().getTenDanhMuc() : "Không xác định")
                .kichThuoc(spct.getKichThuoc() != null ? spct.getKichThuoc().getTenKichThuoc() : "Không xác định")
                .thuongHieu(spct.getThuongHieu() != null ? spct.getThuongHieu().getTenThuongHieu() : "Không xác định")

                .kieuDang(spct.getKieuDang() != null ? spct.getKieuDang().getTenKieuDang() : "Không xác định")
                .kieuCuc(spct.getKieuCuc() != null ? spct.getKieuCuc().getTenKieuCuc() : "Không xác định")
                .kieuCoAo(spct.getKieuCoAo() != null ? spct.getKieuCoAo().getTenKieuCoAo() : "Không xác định")
                .kieuTayAo(spct.getKieuTayAo() != null ? spct.getKieuTayAo().getTenKieuTayAo() : "Không xác định")
                .kieuCoTayAo(spct.getKieuCoTayAo() != null ? spct.getKieuCoTayAo().getTenKieuCoTayAo() : "Không xác định")
                .hoaTiet(spct.getHoaTiet() != null ? spct.getHoaTiet().getTenHoaTiet() : "Không xác định")
                .kieuTuiAo(spct.getTuiAo() != null ? spct.getTuiAo().getTenKieuTuiAo() : "Không xác định")

                .build();
    }

}