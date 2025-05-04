package com.example.server.service.SanPham.impl;

import com.example.server.dto.SanPham.request.HoaTietCreationRequest;
import com.example.server.dto.SanPham.request.HoaTietUpdateRequest;
import com.example.server.entity.HoaTiet;
import com.example.server.repository.SanPham.HoaTietRepository;
import com.example.server.service.SanPham.HoaTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HoaTietServiceImpl implements HoaTietService {
    @Autowired
    HoaTietRepository hoaTietRepository;
    @Override
    public List<HoaTiet> getAll() {
        return hoaTietRepository.findAll();
    }

    @Override
    public HoaTiet saveHoaTiet(HoaTietCreationRequest request) {
        HoaTiet hoaTiet=new HoaTiet();
        hoaTiet.setMaHoaTiet("HT" + System.currentTimeMillis());
        hoaTiet.setTenHoaTiet(request.getTenHoaTiet());
        hoaTiet.setMoTa(request.getMoTa());
        hoaTiet.setTrangThai(true);
        hoaTiet.setNgayTao(LocalDateTime.now());
        return hoaTietRepository.save(hoaTiet);
    }

    @Override
    public HoaTiet updateHoaTiet(String id, HoaTietUpdateRequest request) {
        Optional<HoaTiet> hoaTietOptional = hoaTietRepository.findById(id);
        if (hoaTietOptional.isPresent()) {
            HoaTiet hoaTiet = hoaTietOptional.get();
            hoaTiet.setTenHoaTiet(request.getTenHoaTiet());
            hoaTiet.setMoTa(request.getMoTa());
            return hoaTietRepository.save(hoaTiet);
        }
        return null;
    }

    @Override
    public HoaTiet getHoaTietByID(String id) {
        return hoaTietRepository.findById(id).orElseThrow(null);
    }
}
