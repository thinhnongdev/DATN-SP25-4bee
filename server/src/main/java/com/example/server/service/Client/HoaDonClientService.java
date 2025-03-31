package com.example.server.service.Client;

import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.KhachHang;
import com.example.server.entity.LichSuHoaDon;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
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
    @Autowired
    LichSuHoaDonRepository lichSuHoaDonRepository;
    public HoaDon createHoaDonClient(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, PhieuGiamGia phieuGiamGia) {
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(UUID.randomUUID().toString());
        hoaDon.setMaHoaDon(thongTinGiaoHangClientRequest.getMaHoaDon());
        hoaDon.setPhieuGiamGia(phieuGiamGia);
        //hoaDon.setKhachHang(khachHangRepository.findByMaKhachHang("KH000").get());
        hoaDon.setNhanVien(null);
        hoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElseThrow());
        hoaDon.setLoaiHoaDon(1);// loại hóa đơn online
        hoaDon.setTenNguoiNhan(thongTinGiaoHangClientRequest.getHoTen());
        hoaDon.setSoDienThoai(thongTinGiaoHangClientRequest.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(thongTinGiaoHangClientRequest.getEmail());
        hoaDon.setDiaChi(thongTinGiaoHangClientRequest.getDiaChiCuThe()+", "+thongTinGiaoHangClientRequest.getWard()+", "+thongTinGiaoHangClientRequest.getDistrict()+", "+thongTinGiaoHangClientRequest.getProvince());
        hoaDon.setTrangThaiGiaoHang(1);
        hoaDon.setTongTien(tongTienHang);
        hoaDon.setGhiChu(thongTinGiaoHangClientRequest.getGhiChu());
        hoaDon.setTrangThai(1);
        hoaDon.setNgayTao(LocalDateTime.now());
        HoaDon hoaDon1=hoaDonRepository.save(hoaDon);
        LichSuHoaDon lichSuHoaDon =new LichSuHoaDon();
        lichSuHoaDon.setId(UUID.randomUUID().toString());
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElseThrow());
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setHanhDong("Tạo đơn hàng");
        lichSuHoaDon.setMoTa("");
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return hoaDon1;
    };
}
