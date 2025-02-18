package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.DanhMucCreationRequest;
import com.example.server.dto.SanPham.request.DanhMucUpdateRequest;
import com.example.server.entity.DanhMuc;
import com.example.server.repository.SanPham.DanhMucRepository;
import com.example.server.service.SanPham.DanhMucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DanhMucServiceImpl implements DanhMucService {
    @Autowired
    DanhMucRepository danhMucRepository;
    @Override
    public List<DanhMuc> getAll() {
        return danhMucRepository.findAll();
    }

    @Override
    public DanhMuc saveDanhMuc(DanhMucCreationRequest request) {
        DanhMuc danhMuc=new DanhMuc();
        danhMuc.setMaDanhMuc("M" + System.currentTimeMillis());
        danhMuc.setTenDanhMuc(request.getTenDanhMuc());
        danhMuc.setMoTa(request.getMoTa());
        danhMuc.setTrangThai(true);
        danhMuc.setNgayTao(LocalDateTime.now());
        return danhMucRepository.save(danhMuc);
    }

    @Override
    public DanhMuc updateDanhMuc(String id, DanhMucUpdateRequest request) {
        Optional<DanhMuc> danhMucOptional = danhMucRepository.findById(id);
        if (danhMucOptional.isPresent()) {
            DanhMuc danhMuc = danhMucOptional.get();
            danhMuc.setTenDanhMuc(request.getTenDanhMuc());
            danhMuc.setMoTa(request.getMoTa());
            return danhMucRepository.save(danhMuc);
        }
        return null;
    }

    @Override
    public DanhMuc getDanhMucByID(String id) {
        return danhMucRepository.findById(id).orElseThrow(null);
    }
}
