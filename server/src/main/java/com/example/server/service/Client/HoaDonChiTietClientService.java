package com.example.server.service.Client;

import com.example.server.dto.Client.request.SanPhamChiTietClientRequest;
import com.example.server.dto.Client.response.HoaDonChiTietClientResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.HoaDonChiTiet;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.HoaDon.HoaDonChiTietRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class HoaDonChiTietClientService {
    @Autowired
    HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;

    public void addHoaDonChiTiet(List<SanPhamChiTietClientRequest> sanPhamChiTietList, HoaDon hoaDon) {
        for (int i = 0; i < sanPhamChiTietList.size(); i++) {
            SanPhamChiTiet sanPhamChiTiet=sanPhamChiTietRepository.findById(sanPhamChiTietList.get(i).getId()).orElseThrow();
            HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
            hoaDonChiTiet.setId(UUID.randomUUID().toString());
            hoaDonChiTiet.setHoaDon(hoaDon);
            hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
            hoaDonChiTiet.setSoLuong(sanPhamChiTietList.get(i).getQuantity());
            hoaDonChiTiet.setTrangThai(1);
            hoaDonChiTiet.setNgayTao(LocalDateTime.now());
            hoaDonChiTiet.setGiaTaiThoiDiemThem(sanPhamChiTiet.getGia());
            hoaDonChiTiet.setNgayThemVaoGio(LocalDateTime.now());
            hoaDonChiTietRepository.save(hoaDonChiTiet);
        }
    }
    public List<HoaDonChiTietClientResponse> getHoaDonChiTietList(String idHoaDon) {
        return hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
    }
}
