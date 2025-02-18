package com.example.server.service.BanHang.impl;

import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.entity.HoaDon;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.service.BanHang.BanHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BanHangServiceImpl implements BanHangService {
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    NhanVienRepository nhanVienRepository;
    @Override
    public HoaDon createHoaDon(CreateHoaDonRequest hoaDon) {
        HoaDon hoaDon1=new HoaDon();
        hoaDon1.setMaHoaDon("HD"+System.currentTimeMillis());
        hoaDon1.setNgayTao(LocalDateTime.now());
        hoaDon1.setTrangThai(1);

        hoaDon1.setNhanVien(nhanVienRepository.findByEmail(hoaDon.getEmailNhanVien()).get());
        return hoaDonRepository.save(hoaDon1);
    }

    @Override
    public List<HoaDon> getHoaDonCho() {
        return hoaDonRepository.getHoaDonCho();
    }
}
