package com.example.server.repository.SanPham.SanPhamChiTiet;

import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface SanPhamChiTietRepository1 extends JpaRepository<SanPhamChiTiet, String> {
    List<SanPhamChiTiet> findByMaSanPhamChiTietContaining(String keyword);
    List<SanPhamChiTiet> findByDanhMucTenDanhMucContaining(String keyword); // Tìm theo danh mục
    List<SanPhamChiTiet> findByChatLieuTenChatLieuContaining(String keyword); // Tìm theo chất liệu
    List<SanPhamChiTiet> findByGiaBetween(BigDecimal minPrice, BigDecimal maxPrice);
// Tìm theo khoảng giá


}