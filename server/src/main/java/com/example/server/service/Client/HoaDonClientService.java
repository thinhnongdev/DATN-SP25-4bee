package com.example.server.service.Client;

import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.KhachHang;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class HoaDonClientService {
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    KhachHangRepository khachHangRepository;

    public HoaDon createHoaDonClient(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, PhieuGiamGia phieuGiamGia) {
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(UUID.randomUUID().toString());
        hoaDon.setMaHoaDon("HD" + System.currentTimeMillis());
        hoaDon.setPhieuGiamGia(phieuGiamGia);
        hoaDon.setKhachHang(khachHangRepository.findByMaKhachHang("KH000").get());
        hoaDon.setNhanVien(null);
        hoaDon.setLoaiHoaDon(1);
        hoaDon.setTenNguoiNhan(thongTinGiaoHangClientRequest.getHoTen());
        hoaDon.setSoDienThoai(thongTinGiaoHangClientRequest.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(thongTinGiaoHangClientRequest.getEmail());
        hoaDon.setDiaChi(thongTinGiaoHangClientRequest.getDiaChi());
        hoaDon.setTrangThaiGiaoHang(1);
        hoaDon.setTongTien(tongTienHang);
        hoaDon.setGhiChu(thongTinGiaoHangClientRequest.getGhiChu());
        hoaDon.setTrangThai(1);
        hoaDon.setNgayTao(LocalDateTime.now());
        return hoaDonRepository.save(hoaDon);
    };
}
