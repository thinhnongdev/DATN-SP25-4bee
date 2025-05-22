package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.MauSacCreationRequest;
import com.example.server.dto.SanPham.request.MauSacUpdateRequest;
import com.example.server.entity.MauSac;
import com.example.server.repository.SanPham.MauSacRepository;
import com.example.server.service.SanPham.MauSacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MauSacServiceImpl implements MauSacService {
    @Autowired
    MauSacRepository mauSacRepository;
    @Override
    public List<MauSac> getAll() {
        return mauSacRepository.findAll();
    }

    @Override
    public MauSac saveMauSac(MauSacCreationRequest request) {
        MauSac mauSac=new MauSac();
        mauSac.setMaMau(request.getMaMau());
        mauSac.setTenMau(request.getTenMau());
        mauSac.setMoTa(request.getMoTa());
        mauSac.setTrangThai(true);
        return mauSacRepository.save(mauSac);
    }

    @Override
    public MauSac updateMauSac(String id, MauSacUpdateRequest request) {
        Optional<MauSac> mauSacOptional=mauSacRepository.findById(id);
        if(mauSacOptional.isPresent()){
            MauSac mauSac=mauSacOptional.get();
            mauSac.setTenMau(request.getTenMau());
            mauSac.setMoTa(request.getMoTa());
            mauSac.setTrangThai(true);
            return mauSacRepository.save(mauSac);
        }
        return null;
    }

    @Override
    public MauSac getMauSacByID(String id) {
        return mauSacRepository.findById(id).orElse(null);
    }

    @Override
    public MauSac findByTen(String ten) {
        return mauSacRepository.findByTen(ten).get();
    }
}
