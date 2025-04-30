package com.example.server.service.ChatBot;

import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository1;
import com.example.server.service.SanPham.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatBotServiceImpl implements ChatBotService {

    @Autowired private SanPhamChiTietRepository1 sanPhamChiTietRepository1;
    @Autowired private AnhSanPhamRepository anhRepository;
    @Autowired private SanPhamChiTietService sanPhamChiTietService;
    @Autowired private SanPhamChiTietRepository sanPhamChiTietRepository;

    @Override
    public List<SanPhamChiTiet> getProductsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return sanPhamChiTietRepository1.findAll().stream()
                    .filter(p -> p.getSoLuong() > 0)
                    .collect(Collectors.toList());
        }
        return sanPhamChiTietRepository1.findByMaSanPhamChiTietContaining(keyword).stream()
                .filter(p -> p.getSoLuong() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getProductsByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return getProductsByKeyword("");
        }
        return sanPhamChiTietRepository1.findByDanhMucTenDanhMucContaining(category).stream()
                .filter(p -> p.getSoLuong() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getProductsByMaterial(String material) {
        if (material == null || material.trim().isEmpty()) {
            return getProductsByKeyword("");
        }
        return sanPhamChiTietRepository1.findByChatLieuTenChatLieuContaining(material).stream()
                .filter(p -> p.getSoLuong() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        BigDecimal min = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal max = (maxPrice == null) ? BigDecimal.valueOf(Double.MAX_VALUE) : maxPrice;
        return sanPhamChiTietRepository1.findByGiaBetween(min, max).stream()
                .filter(p -> p.getSoLuong() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getCheapProducts() {
        return sanPhamChiTietRepository1.findTopCheapProducts().stream()
                .filter(p -> p.getSoLuong() > 0)
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getTopSellingProducts(int limit) {
        // Giả lập top sản phẩm bán chạy vì không còn HoaDonChiTietRepository
        return sanPhamChiTietRepository1.findAll().stream()
                .sorted(Comparator.comparing(SanPhamChiTiet::getSoLuong).reversed())
                .filter(p -> p.getSoLuong() > 0)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getProductsByCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return getTopSellingProducts(5);
        }
        return sanPhamChiTietRepository1.findByDanhMucTenDanhMucIn(categories).stream()
                .filter(p -> p.getSoLuong() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<SanPhamChiTiet> getProductsByConditions(String keyword, String category, String material, BigDecimal minPrice, BigDecimal maxPrice) {
        List<SanPhamChiTiet> results = getProductsByKeyword(keyword);
        if (category != null && !category.trim().isEmpty()) {
            results.retainAll(getProductsByCategory(category));
        }
        if (material != null && !material.trim().isEmpty()) {
            results.retainAll(getProductsByMaterial(material));
        }
        if (minPrice != null || maxPrice != null) {
            results.retainAll(getProductsByPriceRange(minPrice, maxPrice));
        }
        return results;
    }

    @Override
    public List<String> getProductImages(String productId) {
        if (productId == null || productId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return anhRepository.findByIdSPCT(productId).stream()
                .map(AnhSanPham::getAnhUrl)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public SanPhamChiTiet getProductById(String productId) {
        if (productId == null || productId.trim().isEmpty()) {
            return null;
        }
        return sanPhamChiTietService.findbyIdSPCT(productId);
    }

    @Override
    public List<SanPhamChiTiet> findProducts(Map<String, Object> conditions) {
        return sanPhamChiTietRepository.findProductsByAttributes(conditions);
    }

    @Deprecated
    public List<SanPhamChiTiet> findProducts(String mauSac, String chatLieu, String danhMuc, String sanPham,
                                             String kichThuoc, String thuongHieu, String kieuDang, String kieuCuc,
                                             String kieuCoAo, String kieuTayAo, String kieuCoTayAo, String hoaTiet,
                                             String tuiAo, BigDecimal minPrice, BigDecimal maxPrice) {
        Map<String, Object> conditions = new HashMap<>();
        if (mauSac != null) conditions.put("mauSac", mauSac);
        if (chatLieu != null) conditions.put("chatLieu", chatLieu);
        if (danhMuc != null) conditions.put("danhMuc", danhMuc);
        if (sanPham != null) conditions.put("sanPham", sanPham);
        if (kichThuoc != null) conditions.put("kichThuoc", kichThuoc);
        if (thuongHieu != null) conditions.put("thuongHieu", thuongHieu);
        if (kieuDang != null) conditions.put("kieuDang", kieuDang);
        if (kieuCuc != null) conditions.put("kieuCuc", kieuCuc);
        if (kieuCoAo != null) conditions.put("kieuCoAo", kieuCoAo);
        if (kieuTayAo != null) conditions.put("kieuTayAo", kieuTayAo);
        if (kieuCoTayAo != null) conditions.put("kieuCoTayAo", kieuCoTayAo);
        if (hoaTiet != null) conditions.put("hoaTiet", hoaTiet);
        if (tuiAo != null) conditions.put("tuiAo", tuiAo);
        if (minPrice != null) conditions.put("minPrice", minPrice);
        if (maxPrice != null) conditions.put("maxPrice", maxPrice);
        return findProducts(conditions);
    }
}