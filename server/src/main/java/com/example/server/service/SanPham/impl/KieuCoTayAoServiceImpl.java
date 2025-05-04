package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KieuCoTayAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuCoTayAoUpdateRequest;
import com.example.server.entity.KieuCoTayAo;
import com.example.server.repository.SanPham.KieuCoTayAoRepository;
import com.example.server.service.SanPham.KieuCoTayAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KieuCoTayAoServiceImpl implements KieuCoTayAoService {

    @Autowired
    KieuCoTayAoRepository kieuCoTayAoRepository;


    @Override
    public List<KieuCoTayAo> getAll() {
        return kieuCoTayAoRepository.findAll();
    }

    @Override
    public KieuCoTayAo saveKieuCoTayAo(KieuCoTayAoCreationRequest kieuCoTayAoCreationRequest) {
        KieuCoTayAo kieuCoTayAo=new KieuCoTayAo();
        kieuCoTayAo.setMaKieuCoTayAo("CTA" + System.currentTimeMillis());
        kieuCoTayAo.setTenKieuCoTayAo(kieuCoTayAoCreationRequest.getTenKieuCoTayAo());
        kieuCoTayAo.setMoTa(kieuCoTayAoCreationRequest.getMoTa());
        kieuCoTayAo.setTrangThai(true);
        return kieuCoTayAoRepository.save(kieuCoTayAo);
    }

    @Override
    public KieuCoTayAo getKieuCoTayAoById(String id) {
        return kieuCoTayAoRepository.findById(id).orElseThrow(null);
    }

    @Override
    public KieuCoTayAo updateKieuCoTayAo(String id, KieuCoTayAoUpdateRequest kieuCoAoUpdateRequest) {
        Optional<KieuCoTayAo> kieuCoTayAoOptional = kieuCoTayAoRepository.findById(id);
        if (kieuCoTayAoOptional.isPresent()) {
            KieuCoTayAo kieuCoTayAo = kieuCoTayAoOptional.get();
            kieuCoTayAo.setTenKieuCoTayAo(kieuCoAoUpdateRequest.getTenKieuCoTayAo());
            kieuCoTayAo.setMoTa(kieuCoAoUpdateRequest.getMoTa());
            return kieuCoTayAoRepository.save(kieuCoTayAo);
        }
        return null;
    }
}
