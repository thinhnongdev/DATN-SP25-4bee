package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.SanPhamChiTietCreationRequest;
import com.example.server.dto.SanPham.request.SanPhamChiTietUpdateRequest;
import com.example.server.entity.*;
import com.example.server.repository.SanPham.*;
import com.example.server.repository.SanPham.ChatLieuRepository;
import com.example.server.service.SanPham.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    public Optional<SanPhamChiTiet> findByMaSanPhamChiTiet(String maSanPhamChiTiet) {
        return sanPhamChiTietRepository.findByMaSPCT(maSanPhamChiTiet);
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
    public void saveSanPhamChiTiet(SanPhamChiTietCreationRequest request) {
        // Lấy các entity liên quan
        SanPham sanPham = sanPhamRepository.findByTen(request.getTenSanPham()).orElseThrow();
        MauSac mauSac = mauSacRepository.findByTen(request.getMauSac()).orElseThrow();
        KichThuoc kichThuoc = kichThuocRepository.findByTen(request.getSize()).orElseThrow();
        ChatLieu chatLieu = chatLieuRepository.findById(request.getChatLieu()).orElseThrow();
        KieuDang kieuDang = kieuDangRepository.findById(request.getKieuDang()).orElseThrow();
        ThuongHieu thuongHieu = thuongHieuRepository.findById(request.getThuongHieu()).orElseThrow();
        KieuCoAo kieuCoAo = kieuCoAoRepository.findById(request.getKieuCoAo()).orElseThrow();
        KieuCuc kieuCuc = kieuCucRepository.findById(request.getKieuCuc()).orElseThrow();
        KieuTayAo kieuTayAo = kieuTayAoRepository.findById(request.getKieuTayAo()).orElseThrow();
        KieuTuiAo kieuTuiAo = kieuTuiAoRepository.findById(request.getKieuTuiAo()).orElseThrow();
        KieuCoTayAo kieuCoTayAo = kieuCoTayAoRepository.findById(request.getKieuCoTayAo()).orElseThrow();
        DanhMuc danhMuc = danhMucRepository.findById(request.getDanhMuc()).orElseThrow();
        HoaTiet hoaTiet = hoaTietRepository.findById(request.getHoaTiet()).orElseThrow();

        // Kiểm tra sản phẩm chi tiết đã tồn tại chưa
        Optional<SanPhamChiTiet> existing = sanPhamChiTietRepository.findByThuocTinh(
                sanPham.getId(), mauSac.getId(), kichThuoc.getId(), chatLieu.getId(),
                kieuDang.getId(), thuongHieu.getId(), kieuCoAo.getId(), kieuCuc.getId(),
                kieuTayAo.getId(), kieuTuiAo.getId(), kieuCoTayAo.getId(), danhMuc.getId(), hoaTiet.getId()
        );

        if (existing.isPresent()) {
            SanPhamChiTiet existingSPCT = existing.get();
            existingSPCT.setSoLuong(existingSPCT.getSoLuong() + request.getSoLuong());
            sanPhamChiTietRepository.save(existingSPCT);
        } else {
            // Tạo mới nếu chưa tồn tại
            SanPhamChiTiet sanPhamChiTiet = new SanPhamChiTiet();
            sanPhamChiTiet.setMaSanPhamChiTiet("SPCT" + System.currentTimeMillis());
            sanPhamChiTiet.setSanPham(sanPham);
            sanPhamChiTiet.setChatLieu(chatLieu);
            sanPhamChiTiet.setKieuDang(kieuDang);
            sanPhamChiTiet.setThuongHieu(thuongHieu);
            sanPhamChiTiet.setKieuCoAo(kieuCoAo);
            sanPhamChiTiet.setKieuCuc(kieuCuc);
            sanPhamChiTiet.setKieuTayAo(kieuTayAo);
            sanPhamChiTiet.setTuiAo(kieuTuiAo);
            sanPhamChiTiet.setKieuCoTayAo(kieuCoTayAo);
            sanPhamChiTiet.setDanhMuc(danhMuc);
            sanPhamChiTiet.setHoaTiet(hoaTiet);
            sanPhamChiTiet.setMauSac(mauSac);
            sanPhamChiTiet.setKichThuoc(kichThuoc);
            sanPhamChiTiet.setSoLuong(request.getSoLuong());
            sanPhamChiTiet.setGia(request.getGia());
            sanPhamChiTiet.setMoTa(request.getMoTa());
            sanPhamChiTiet.setTrangThai(true);
            sanPhamChiTiet.setNgayTao(LocalDateTime.now());
            sanPhamChiTietRepository.save(sanPhamChiTiet);

            // Lưu ảnh
            for (String url : request.getImages()) {
                AnhSanPham anh = new AnhSanPham();
                anh.setMaAnh("IMGSP" + System.currentTimeMillis());
                anh.setAnhUrl(url);
                anh.setSanPhamChiTiet(sanPhamChiTiet);
                anh.setTrangThai(true);
                anh.setMoTa("");
                anhSanPhamRepository.save(anh);
            }
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
