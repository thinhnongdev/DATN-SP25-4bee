package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.*;
import com.example.server.entity.KieuCuc;
import com.example.server.repository.SanPham.KieuCucRepository;
import com.example.server.service.SanPham.KieuCucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KieuCucAoServiceImpl implements KieuCucService {

    @Autowired
    KieuCucRepository kieuCucRepository;


    @Override
    public List<KieuCuc> getAll() {
        return kieuCucRepository.findAll();
    }

    @Override
    public KieuCuc saveKieuCucAo(KieuCucCreationRequest kieuCucCreationRequest) {
        KieuCuc kieuCuc=new KieuCuc();
        kieuCuc.setMaKieuCuc("KC" + System.currentTimeMillis());
        kieuCuc.setTenKieuCuc(kieuCucCreationRequest.getTenKieuCuc());
        kieuCuc.setMoTa(kieuCucCreationRequest.getMoTa());
        kieuCuc.setTrangThai(true);
        return kieuCucRepository.save(kieuCuc);
    }

    @Override
    public KieuCuc getKieuCucAoById(String id) {
        return kieuCucRepository.findById(id).orElseThrow(null);
    }

    @Override
    public KieuCuc updateKieuCucAo(String id, KieuCucUpdateRequest kieuCucUpdateRequest) {
        Optional<KieuCuc> kieuCucOptional = kieuCucRepository.findById(id);
        if (kieuCucOptional.isPresent()) {
            KieuCuc kieuCuc = kieuCucOptional.get();
            kieuCuc.setTenKieuCuc(kieuCucUpdateRequest.getTenKieuCuc());
            kieuCuc.setMoTa(kieuCucUpdateRequest.getMoTa());
            return kieuCucRepository.save(kieuCuc);
        }
        return null;
    }

    @Override
    public boolean existsByTenKieuCuc(String name) {
        return kieuCucRepository.existsByTenKieuCuc(name);
    }
}
