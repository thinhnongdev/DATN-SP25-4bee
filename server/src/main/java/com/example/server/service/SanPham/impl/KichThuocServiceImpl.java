package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KichThuocCreationRequest;
import com.example.server.dto.SanPham.request.KichThuocUpdateRequest;
import com.example.server.entity.*;
import com.example.server.repository.SanPham.KichThuocRepository;
import com.example.server.service.SanPham.KichThuocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KichThuocServiceImpl implements KichThuocService {
@Autowired
KichThuocRepository kichThuocRepository;
    @Override
    public List<KichThuoc> getAll() {
        return kichThuocRepository.findAll();
    }

    @Override
    public KichThuoc saveKichThuoc(KichThuocCreationRequest kichThuocCreationRequest) {
        KichThuoc kichThuoc = new KichThuoc();
        kichThuoc.setMaKichThuoc("KT"+ System.currentTimeMillis());
        kichThuoc.setTenKichThuoc(kichThuocCreationRequest.getTenKichThuoc());
        kichThuoc.setMoTa(kichThuocCreationRequest.getMoTa());
        kichThuoc.setTrangThai(true);
        return kichThuocRepository.save(kichThuoc);
    }

    @Override
    public KichThuoc getKichThuocById(String id) {
        return kichThuocRepository.findById(id).orElseThrow(null);
    }

    @Override
    public KichThuoc updateKichThuoc(String id, KichThuocUpdateRequest kichThuocUpdateRequest) {
        Optional<KichThuoc> kichThuocOptional = kichThuocRepository.findById(id);
        if (kichThuocOptional.isPresent()) {
            KichThuoc kichThuoc = kichThuocOptional.get();
            kichThuoc.setTenKichThuoc(kichThuocUpdateRequest.getTenKichThuoc());
            kichThuoc.setMoTa(kichThuocUpdateRequest.getMoTa());
            return kichThuocRepository.save(kichThuoc);
        }
        return null;
    }

    @Override
    public KichThuoc findByTen(String ten) {
        return kichThuocRepository.findByTen(ten).get();
    }
}
