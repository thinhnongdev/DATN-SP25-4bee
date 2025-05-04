package com.example.server.service.SanPham.impl;


import com.example.server.entity.AnhSanPham;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.service.SanPham.AnhSanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnhSanPhamServiceImpl implements AnhSanPhamService {
    @Autowired
    AnhSanPhamRepository anhSanPhamRepository;
    @Override
    public AnhSanPham saveAnhSanPham(AnhSanPham anhSanPham) {
        return saveAnhSanPham(anhSanPham);
    }

    @Override
    public List<AnhSanPham> findByIdSPCT(String id) {
        return anhSanPhamRepository.findByIdSPCT(id);
    }
}
