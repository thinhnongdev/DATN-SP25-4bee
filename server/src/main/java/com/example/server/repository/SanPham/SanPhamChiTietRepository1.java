package com.example.server.repository.SanPham;

import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface SanPhamChiTietRepository1 extends JpaRepository<SanPhamChiTiet, String> {
    List<SanPhamChiTiet> findByMaSanPhamChiTietContaining(String keyword);
    List<SanPhamChiTiet> findByDanhMucTenDanhMucContaining(String category);
    List<SanPhamChiTiet> findByChatLieuTenChatLieuContaining(String material);
    List<SanPhamChiTiet> findByGiaBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<SanPhamChiTiet> findByDanhMucTenDanhMucIn(List<String> categories);

    @Query("SELECT s FROM SanPhamChiTiet s ORDER BY s.gia ASC LIMIT 5")
    List<SanPhamChiTiet> findTopCheapProducts();

    // Giả định query tùy chỉnh để lấy sản phẩm bán chạy
    @Query("SELECT h.sanPhamChiTiet FROM HoaDonChiTiet h GROUP BY h.sanPhamChiTiet ORDER BY SUM(h.soLuong) DESC")
    List<SanPhamChiTiet> findTopByOrderCount(int limit);


}
