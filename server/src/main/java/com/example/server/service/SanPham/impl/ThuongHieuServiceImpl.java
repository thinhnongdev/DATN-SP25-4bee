package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.ThuongHieuCreationRequest;
import com.example.server.dto.SanPham.request.ThuongHieuUpdateRequest;
import com.example.server.entity.ThuongHieu;
import com.example.server.repository.SanPham.ThuongHieuRepository;
import com.example.server.service.SanPham.ThuongHieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ThuongHieuServiceImpl implements ThuongHieuService {
    @Autowired
    ThuongHieuRepository thuongHieuRepository;
    @Override
    public List<ThuongHieu> getAll() {
        return thuongHieuRepository.findAll();
    }

    @Override
    public ThuongHieu saveThuongHieu(ThuongHieuCreationRequest request) {
        ThuongHieu thuongHieu=new ThuongHieu();
        thuongHieu.setMaThuongHieu("TH" + System.currentTimeMillis());
        thuongHieu.setTenThuongHieu(request.getTenThuongHieu());
        thuongHieu.setMoTa(request.getMoTa());
        thuongHieu.setTrangThai(true);
        return thuongHieuRepository.save(thuongHieu);
    }

    @Override
    public ThuongHieu updateThuongHieu(String id, ThuongHieuUpdateRequest request) {
        Optional<ThuongHieu> thuongHieuOptional = thuongHieuRepository.findById(id);
        if (thuongHieuOptional.isPresent()) {
            ThuongHieu thuongHieu = thuongHieuOptional.get();
            thuongHieu.setTenThuongHieu(request.getTenThuongHieu());
            thuongHieu.setMoTa(request.getMoTa());
            return thuongHieuRepository.save(thuongHieu);
        }
        return null;
    }

    @Override
    public ThuongHieu getThuongHieuByID(String id) {
        return thuongHieuRepository.findById(id).orElseThrow(null);
    }
}
