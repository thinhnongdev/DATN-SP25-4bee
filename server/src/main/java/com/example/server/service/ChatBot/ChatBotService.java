package com.example.server.service.ChatBot;


import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.repository.SanPham.SanPhamChiTiet.SanPhamChiTietRepository1;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatBotService {
    @Autowired
    private SanPhamChiTietRepository1 repository;
    @Autowired
    private AnhSanPhamRepository anhRepository; // Repository cho hình ảnh

    public List<SanPhamChiTiet> getProductsByKeyword(String keyword) {
        return repository.findByMaSanPhamChiTietContaining(keyword);
    }

    public List<SanPhamChiTiet> getProductsByCategory(String category) {
        return repository.findByDanhMucTenDanhMucContaining(category);
    }

    public List<SanPhamChiTiet> getProductsByMaterial(String material) {
        return repository.findByChatLieuTenChatLieuContaining(material);
    }

    public List<String> getProductImages(String productId) {
        return anhRepository.findByIdSPCT(productId)
                .stream().map(AnhSanPham::getAnhUrl).collect(Collectors.toList());
    }

    public List<SanPhamChiTiet> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return repository.findByGiaBetween(minPrice, maxPrice);
    }

}