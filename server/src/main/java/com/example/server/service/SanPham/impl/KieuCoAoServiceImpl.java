package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KieuCoAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuCoAoUpdateRequest;
import com.example.server.entity.KieuCoAo;
import com.example.server.repository.SanPham.KieuCoAoRepository;
import com.example.server.service.SanPham.KieuCoAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KieuCoAoServiceImpl implements KieuCoAoService {

    @Autowired
    KieuCoAoRepository kieuCoAoRepository;

    @Override
    public List<KieuCoAo> getAll() {
        return kieuCoAoRepository.findAll();
    }

    @Override
    public KieuCoAo saveKieuCoAo(KieuCoAoCreationRequest kieuCoAoCreationRequest) {
        KieuCoAo kieuCoAo=new KieuCoAo();
        kieuCoAo.setMaKieuCoAo("KCA" + System.currentTimeMillis());
        kieuCoAo.setTenKieuCoAo(kieuCoAoCreationRequest.getTenKieuCoAo());
        kieuCoAo.setMoTa(kieuCoAoCreationRequest.getMoTa());
        kieuCoAo.setTrangThai(true);
        return kieuCoAoRepository.save(kieuCoAo);
    }

    @Override
    public KieuCoAo getKieuCoAoById(String id) {
        return kieuCoAoRepository.findById(id).orElseThrow(null);
    }

    @Override
    public KieuCoAo updateKieuCoAo(String id, KieuCoAoUpdateRequest kieuCoAoUpdateRequest) {
        Optional<KieuCoAo> kieuCoAoOptional = kieuCoAoRepository.findById(id);
        if (kieuCoAoOptional.isPresent()) {
            KieuCoAo kieuCoAo = kieuCoAoOptional.get();
            kieuCoAo.setTenKieuCoAo(kieuCoAoUpdateRequest.getTenKieuCoAo());
            kieuCoAo.setMoTa(kieuCoAoUpdateRequest.getMoTa());
            return kieuCoAoRepository.save(kieuCoAo);
        }
        return null;
    }
}
