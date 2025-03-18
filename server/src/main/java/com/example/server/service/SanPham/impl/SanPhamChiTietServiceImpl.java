package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.SanPhamChiTietCreationRequest;
import com.example.server.dto.SanPham.request.SanPhamChiTietUpdateRequest;
import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.SanPham.*;
import com.example.server.repository.SanPham.ChatLieuRepository;
import com.example.server.service.SanPham.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SanPhamChiTietServiceImpl implements SanPhamChiTietService {
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;
    @Autowired
    ChatLieuRepository chatLieuRepository;
    @Autowired
    SanPhamRepository sanPhamRepository;
    @Autowired
    KieuTayAoRepository kieuTayAoRepository;
    @Autowired
    MauSacRepository mauSacRepository;
    @Autowired
    KichThuocRepository kichThuocRepository;
    @Autowired
    KieuCoTayAoRepository kieuCoTayAoRepository;
    @Autowired
    KieuCucRepository kieuCucRepository;
    @Autowired
    KieuCoAoRepository kieuCoAoRepository;
    @Autowired
    ThuongHieuRepository thuongHieuRepository;
    @Autowired
    KieuDangRepository kieuDangRepository;
    @Autowired
    KieuTuiAoRepository kieuTuiAoRepository;
    @Autowired
    AnhSanPhamRepository anhSanPhamRepository;
    @Autowired
    DanhMucRepository danhMucRepository;
    @Autowired
    HoaTietRepository hoaTietRepository;

    @Override
    public SanPhamChiTiet findbyIdSPCT(String idSPCT) {
        return sanPhamChiTietRepository.findById(idSPCT)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + idSPCT));
    }

    @Override
    public List<SanPhamChiTiet> findbyIdSanPham(String idSanPham) {
        return sanPhamChiTietRepository.findByIdSanPham(idSanPham);
    }

    @Override
    public List<SanPhamChiTiet> getAllSanPhamChiTiet() {
        return sanPhamChiTietRepository.getAllSanPhamChiTiet();
    }

    @Override
    public Integer findSoLuongbyIdSanPham(String idSanPham) {
        return sanPhamChiTietRepository.findSoLuongByIdSanPham(idSanPham);
    }

    @Override
    public void saveSanPhamChiTiet(SanPhamChiTietCreationRequest sanPhamChiTietCreationRequest) {
        SanPhamChiTiet sanPhamChiTiet = new SanPhamChiTiet();
        sanPhamChiTiet.setMaSanPhamChiTiet("SPCT" + System.currentTimeMillis());
        sanPhamChiTiet.setSanPham(sanPhamRepository.findByTen(sanPhamChiTietCreationRequest.getTenSanPham()).get());
        sanPhamChiTiet.setChatLieu(chatLieuRepository.findById(sanPhamChiTietCreationRequest.getChatLieu()).get());
        sanPhamChiTiet.setKieuDang(kieuDangRepository.findById(sanPhamChiTietCreationRequest.getKieuDang()).get());
        sanPhamChiTiet.setThuongHieu(thuongHieuRepository.findById(sanPhamChiTietCreationRequest.getThuongHieu()).get());
        sanPhamChiTiet.setKieuCoAo(kieuCoAoRepository.findById(sanPhamChiTietCreationRequest.getKieuCoAo()).get());
        sanPhamChiTiet.setKieuCuc(kieuCucRepository.findById(sanPhamChiTietCreationRequest.getKieuCuc()).get());
        sanPhamChiTiet.setKieuTayAo(kieuTayAoRepository.findById(sanPhamChiTietCreationRequest.getKieuTayAo()).get());
        sanPhamChiTiet.setTuiAo(kieuTuiAoRepository.findById(sanPhamChiTietCreationRequest.getKieuTuiAo()).get());
        sanPhamChiTiet.setKieuCoTayAo(kieuCoTayAoRepository.findById(sanPhamChiTietCreationRequest.getKieuCoTayAo()).get());
        sanPhamChiTiet.setDanhMuc(danhMucRepository.findById(sanPhamChiTietCreationRequest.getDanhMuc()).get());
        sanPhamChiTiet.setHoaTiet(hoaTietRepository.findById(sanPhamChiTietCreationRequest.getHoaTiet()).get());
        sanPhamChiTiet.setMauSac(mauSacRepository.findByTen(sanPhamChiTietCreationRequest.getMauSac()).get());
        sanPhamChiTiet.setKichThuoc(kichThuocRepository.findByTen(sanPhamChiTietCreationRequest.getSize()).get());
        sanPhamChiTiet.setSoLuong(sanPhamChiTietCreationRequest.getSoLuong());
        sanPhamChiTiet.setGia(sanPhamChiTietCreationRequest.getGia());
        sanPhamChiTiet.setMoTa(sanPhamChiTietCreationRequest.getMoTa());
        sanPhamChiTiet.setTrangThai(true);
        sanPhamChiTiet.setNgayTao(LocalDateTime.now());
        sanPhamChiTietRepository.save(sanPhamChiTiet);
        for (int i = 0; i < sanPhamChiTietCreationRequest.getImages().size(); i++) {
            AnhSanPham anhSanPham = new AnhSanPham();
            anhSanPham.setMaAnh("IMG" + System.currentTimeMillis());
            anhSanPham.setAnhUrl(sanPhamChiTietCreationRequest.getImages().get(i));
            anhSanPham.setSanPhamChiTiet(sanPhamChiTietRepository.findById(sanPhamChiTiet.getId()).get());
            anhSanPham.setTrangThai(true);
            anhSanPham.setMoTa("");
            anhSanPhamRepository.save(anhSanPham);
        }
    }

    @Override
    public void updateSanPhamChiTiet(String id, SanPhamChiTietUpdateRequest sanPhamChiTietUpdateRequest) {
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(id).orElseThrow();
        sanPhamChiTiet.setChatLieu(chatLieuRepository.findById(sanPhamChiTietUpdateRequest.getChatLieu()).get());
        sanPhamChiTiet.setKieuDang(kieuDangRepository.findById(sanPhamChiTietUpdateRequest.getKieuDang()).get());
        sanPhamChiTiet.setThuongHieu(thuongHieuRepository.findById(sanPhamChiTietUpdateRequest.getThuongHieu()).get());
        sanPhamChiTiet.setKieuCoAo(kieuCoAoRepository.findById(sanPhamChiTietUpdateRequest.getKieuCoAo()).get());
        sanPhamChiTiet.setKieuCuc(kieuCucRepository.findById(sanPhamChiTietUpdateRequest.getKieuCuc()).get());
        sanPhamChiTiet.setKieuTayAo(kieuTayAoRepository.findById(sanPhamChiTietUpdateRequest.getKieuTayAo()).get());
        sanPhamChiTiet.setTuiAo(kieuTuiAoRepository.findById(sanPhamChiTietUpdateRequest.getKieuTuiAo()).get());
        sanPhamChiTiet.setKieuCoTayAo(kieuCoTayAoRepository.findById(sanPhamChiTietUpdateRequest.getKieuCoTayAo()).get());
        sanPhamChiTiet.setDanhMuc(danhMucRepository.findById(sanPhamChiTietUpdateRequest.getDanhMuc()).get());
        sanPhamChiTiet.setHoaTiet(hoaTietRepository.findById(sanPhamChiTietUpdateRequest.getHoaTiet()).get());
        sanPhamChiTiet.setMauSac(mauSacRepository.findById(sanPhamChiTietUpdateRequest.getMauSac()).get());
        sanPhamChiTiet.setKichThuoc(kichThuocRepository.findById(sanPhamChiTietUpdateRequest.getSize()).get());
        sanPhamChiTiet.setSoLuong(sanPhamChiTietUpdateRequest.getSoLuong());
        sanPhamChiTiet.setGia(sanPhamChiTietUpdateRequest.getGia());
        sanPhamChiTiet.setMoTa(sanPhamChiTietUpdateRequest.getMoTa());
        sanPhamChiTiet.setTrangThai(true);
        sanPhamChiTietRepository.save(sanPhamChiTiet);
        anhSanPhamRepository.deleteBySanPhamChiTietId(sanPhamChiTiet.getId());
        for (int i = 0; i < sanPhamChiTietUpdateRequest.getImages().size(); i++) {
            AnhSanPham anhSanPham = new AnhSanPham();
            anhSanPham.setMaAnh("IMG" + System.currentTimeMillis());
            anhSanPham.setAnhUrl(sanPhamChiTietUpdateRequest.getImages().get(i));
            anhSanPham.setSanPhamChiTiet(sanPhamChiTiet);
            anhSanPham.setTrangThai(true);
            anhSanPham.setMoTa("");
            anhSanPhamRepository.save(anhSanPham);
        }
    }
}
