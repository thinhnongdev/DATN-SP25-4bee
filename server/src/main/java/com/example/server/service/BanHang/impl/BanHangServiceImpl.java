package com.example.server.service.BanHang.impl;

import com.example.server.dto.BanHang.request.CreateHoaDonChiTietRequest;
import com.example.server.dto.BanHang.request.CreateHoaDonRequest;
import com.example.server.entity.*;
import com.example.server.repository.HoaDon.*;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import com.example.server.service.BanHang.BanHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BanHangServiceImpl implements BanHangService {
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    NhanVienRepository nhanVienRepository;
    @Autowired
    KhachHangRepository khachHangRepository;
    @Autowired
    ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    @Autowired
    PhuongThucThanhToanRepository phuongThucThanhToanRepository;
@Autowired
SanPhamChiTietRepository sanPhamChiTietRepository;
@Autowired
HoaDonChiTietRepository hoaDonChiTietRepository;
    @Override
    public HoaDon createHoaDon(CreateHoaDonRequest hoaDon) {
        HoaDon hoaDon1 = new HoaDon();
        hoaDon1.setMaHoaDon("HD" + System.currentTimeMillis());
        hoaDon1.setNgayTao(LocalDateTime.now());
        hoaDon1.setTrangThai(1);
        hoaDon1.setKhachHang(khachHangRepository.findByMaKhachHang("KH001").get());
        hoaDon1.setLoaiHoaDon(2);//tại quầy
        hoaDon1.setNhanVien(nhanVienRepository.findByEmail(hoaDon.getEmailNhanVien()).get());
        hoaDon1.setTongTien(BigDecimal.valueOf(0));
        hoaDonRepository.save(hoaDon1);

        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
        thanhToanHoaDon.setHoaDon(hoaDonRepository.findById(hoaDon1.getId()).get());
        thanhToanHoaDon.setPhuongThucThanhToan(phuongThucThanhToanRepository.findById("001").get());//phương thức thanh toán tiền mặt
        thanhToanHoaDon.setSoTien(BigDecimal.valueOf(0));
        thanhToanHoaDonRepository.save(thanhToanHoaDon);
        return hoaDonRepository.findById(hoaDon1.getId()).get();
    }

    @Override
    public List<HoaDon> getHoaDonCho() {
        return hoaDonRepository.getHoaDonCho();
    }

    @Override
    public HoaDonChiTiet addHoaDonChiTiet(CreateHoaDonChiTietRequest hoaDonChiTietRequest) {
        HoaDonChiTiet hoaDonChiTiet=new HoaDonChiTiet();
       hoaDonChiTiet.setHoaDon( hoaDonRepository.findById(hoaDonChiTietRequest.getHoaDonId()).get());
       SanPhamChiTiet sanPhamChiTiet=sanPhamChiTietRepository.findById(hoaDonChiTietRequest.getSanPhamChiTietId()).get();
       hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
       hoaDonChiTiet.setTrangThai(1);
       if(sanPhamChiTiet.getSoLuong()<hoaDonChiTietRequest.getSoLuong()){
           return null;
       }
       hoaDonChiTiet.setSoLuong(hoaDonChiTietRequest.getSoLuong());
       sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong()-hoaDonChiTietRequest.getSoLuong());
       sanPhamChiTietRepository.save(sanPhamChiTiet);
       return hoaDonChiTietRepository.save(hoaDonChiTiet);
    }

    @Override
    public List<HoaDonChiTiet> getHoaDonChiTietByIdHoaDon(String id) {
        return hoaDonChiTietRepository.findAllById(id);
    }

    @Override
    public KhachHang getKhachHangByIdHoaDon(String id) {
        return null;
    }

    @Override
    public ThanhToanHoaDon getThanhToanHoaDonByIdHoaDon(String id) {
        return null;
    }
}
