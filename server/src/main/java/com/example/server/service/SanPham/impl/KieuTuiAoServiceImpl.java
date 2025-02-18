package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KieuTuiAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuTuiAoUpdateRequest;
import com.example.server.entity.KieuTuiAo;
import com.example.server.repository.SanPham.KieuTuiAoRepository;
import com.example.server.service.SanPham.KieuTuiAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KieuTuiAoServiceImpl implements KieuTuiAoService {
    @Autowired
    KieuTuiAoRepository kieuTuiAoRepository;
    @Override
    public List<KieuTuiAo> getAll() {
        return kieuTuiAoRepository.findAll();
    }

    @Override
    public KieuTuiAo saveKieuTuiAo(KieuTuiAoCreationRequest kieuTuiAoCreationRequest) {
        KieuTuiAo kieuTuiAo=new KieuTuiAo();
        kieuTuiAo.setMaKieuTuiAo("KTA" + System.currentTimeMillis());
        kieuTuiAo.setTenKieuTuiAo(kieuTuiAoCreationRequest.getTenKieuTuiAo());
        kieuTuiAo.setMoTa(kieuTuiAoCreationRequest.getMoTa());
        kieuTuiAo.setTrangThai(true);
        return kieuTuiAoRepository.save(kieuTuiAo);
    }

    @Override
    public KieuTuiAo getKieuTuiAoById(String id) {
        return kieuTuiAoRepository.findById(id).orElseThrow(null);

    }

    @Override
    public KieuTuiAo updateKieuTuiAo(String id, KieuTuiAoUpdateRequest kieuTuiAoUpdateRequest) {
        Optional<KieuTuiAo> kieuTuiAoOptional = kieuTuiAoRepository.findById(id);
        if (kieuTuiAoOptional.isPresent()) {
            KieuTuiAo kieuTuiAo = kieuTuiAoOptional.get();
            kieuTuiAo.setTenKieuTuiAo(kieuTuiAoUpdateRequest.getTenKieuTuiAo());
            kieuTuiAo.setMoTa(kieuTuiAoUpdateRequest.getMoTa());
            return kieuTuiAoRepository.save(kieuTuiAo);
        }
        return null;
    }
}
