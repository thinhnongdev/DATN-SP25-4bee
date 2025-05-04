package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KieuTayAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuTayAoUpdateRequest;
import com.example.server.entity.KieuTayAo;
import com.example.server.repository.SanPham.KieuTayAoRepository;
import com.example.server.service.SanPham.KieuTayAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KieuTayAoServiceImpl implements KieuTayAoService {
    @Autowired
    KieuTayAoRepository kieuTayAoRepository;
    @Override
    public List<KieuTayAo> getAll() {
        return kieuTayAoRepository.findAll();
    }

    @Override
    public KieuTayAo saveKieuTayAo(KieuTayAoCreationRequest kieuTayAoCreationRequest) {
        KieuTayAo kieuTayAo=new KieuTayAo();
        kieuTayAo.setMaKieuTayAo("KTAA" + System.currentTimeMillis());
        kieuTayAo.setTenKieuTayAo(kieuTayAoCreationRequest.getTenKieuTayAo());
        kieuTayAo.setMoTa(kieuTayAoCreationRequest.getMoTa());
        kieuTayAo.setTrangThai(true);
        return kieuTayAoRepository.save(kieuTayAo);
    }

    @Override
    public KieuTayAo getKieuTayAoById(String id) {
        return kieuTayAoRepository.findById(id).orElseThrow(null);

    }

    @Override
    public KieuTayAo updateKieuTayAo(String id, KieuTayAoUpdateRequest kieuTayAoUpdateRequest) {
        Optional<KieuTayAo> kieuTayAoOptional = kieuTayAoRepository.findById(id);
        if (kieuTayAoOptional.isPresent()) {
            KieuTayAo kieuTayAo = kieuTayAoOptional.get();
            kieuTayAo.setTenKieuTayAo(kieuTayAoUpdateRequest.getTenKieuTayAo());
            kieuTayAo.setMoTa(kieuTayAoUpdateRequest.getMoTa());
            return kieuTayAoRepository.save(kieuTayAo);
        }
        return null;
    }
}
