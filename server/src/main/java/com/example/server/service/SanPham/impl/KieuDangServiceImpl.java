package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.KieuDangCreationRequest;
import com.example.server.dto.SanPham.request.KieuDangUpdateRequest;
import com.example.server.entity.KieuDang;
import com.example.server.service.SanPham.KieuDangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.server.repository.SanPham.KieuDangRepository;
import java.util.List;
import java.util.Optional;

@Service
public class KieuDangServiceImpl implements KieuDangService {
    @Autowired
    KieuDangRepository kieuDangRepository;
    @Override
    public List<KieuDang> getAll() {
        return kieuDangRepository.findAll();
    }

    @Override
    public KieuDang saveKieuDang(KieuDangCreationRequest kieuDangCreationRequest) {
        KieuDang kieuDang=new KieuDang();
        kieuDang.setMaKieuDang("KD" + System.currentTimeMillis());
        kieuDang.setTenKieuDang(kieuDangCreationRequest.getTenKieuDang());
        kieuDang.setMoTa(kieuDangCreationRequest.getMoTa());
        kieuDang.setTrangThai(true);
        return kieuDangRepository.save(kieuDang);
    }

    @Override
    public KieuDang getKieuDangById(String id) {
        return kieuDangRepository.findById(id).orElseThrow(null);
    }

    @Override
    public KieuDang updateKieuDang(String id, KieuDangUpdateRequest kieuDangUpdateRequest) {
        Optional<KieuDang> kieuDangOptional = kieuDangRepository.findById(id);
        if (kieuDangOptional.isPresent()) {
            KieuDang kieuDang = kieuDangOptional.get();
            kieuDang.setTenKieuDang(kieuDangUpdateRequest.getTenKieuDang());
            kieuDang.setMoTa(kieuDangUpdateRequest.getMoTa());
            return kieuDangRepository.save(kieuDang);
        }
        return null;
    }
}
