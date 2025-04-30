package com.example.server.service.ChatBot;

import com.example.server.entity.SanPhamChiTiet;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ChatBotService {
    List<SanPhamChiTiet> getProductsByKeyword(String keyword);
    List<SanPhamChiTiet> getProductsByCategory(String category);
    List<SanPhamChiTiet> getProductsByMaterial(String material);
    List<SanPhamChiTiet> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    List<SanPhamChiTiet> getCheapProducts();
    List<SanPhamChiTiet> getTopSellingProducts(int limit);
    List<SanPhamChiTiet> getProductsByCategories(List<String> categories);
    List<SanPhamChiTiet> getProductsByConditions(String keyword, String category, String material, BigDecimal minPrice, BigDecimal maxPrice);
    List<String> getProductImages(String productId);
    SanPhamChiTiet getProductById(String productId);
    List<SanPhamChiTiet> findProducts(Map<String, Object> conditions);

    // Phương thức cũ (giữ lại để tương thích)
    @Deprecated
    List<SanPhamChiTiet> findProducts(String mauSac, String chatLieu, String danhMuc, String sanPham,
                                      String kichThuoc, String thuongHieu, String kieuDang, String kieuCuc,
                                      String kieuCoAo, String kieuTayAo, String kieuCoTayAo, String hoaTiet,
                                      String tuiAo, BigDecimal minPrice, BigDecimal maxPrice);
}