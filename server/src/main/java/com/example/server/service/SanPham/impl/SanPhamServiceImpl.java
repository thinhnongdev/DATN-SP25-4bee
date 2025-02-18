package com.example.server.service.SanPham.impl;


import com.example.server.dto.SanPham.request.SanPhamCreationRequest;
import com.example.server.dto.SanPham.request.SanPhamUpdateRequest;
import com.example.server.dto.SanPham.response.SanPhamResponse;
import com.example.server.entity.SanPham;
import com.example.server.repository.SanPham.SanPhamRepository;
import com.example.server.service.SanPham.SanPhamChiTietService;
import com.example.server.service.SanPham.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SanPhamServiceImpl implements SanPhamService {
    @Autowired
    private SanPhamRepository sanPhamRepository;
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    @Override
    public List<SanPhamResponse> getAll() {
        List<SanPhamResponse> listSanPhamRes =new ArrayList<>();
        List<SanPham> listSanPham=sanPhamRepository.findAll();
        SanPhamResponse sanPhamResponse;
        for (int i = 0; i < listSanPham.size(); i++) {
            sanPhamResponse=new SanPhamResponse();
            sanPhamResponse.setId(listSanPham.get(i).getId());
            sanPhamResponse.setMaSanPham(listSanPham.get(i).getMaSanPham());
            sanPhamResponse.setTenSanPham(listSanPham.get(i).getTenSanPham());
            sanPhamResponse.setTrangThai(listSanPham.get(i).getTrangThai());
            sanPhamResponse.setNgayTao(listSanPham.get(i).getNgayTao());
            if(sanPhamChiTietService.findSoLuongbyIdSanPham(listSanPham.get(i).getId())==null){
                sanPhamResponse.setSoLuong(0);
            }else {
                sanPhamResponse.setSoLuong(sanPhamChiTietService.findSoLuongbyIdSanPham(listSanPham.get(i).getId()));
            }
            listSanPhamRes.add(sanPhamResponse);
        }
        return listSanPhamRes;
    }

    @Override
    public SanPham saveSanPham(SanPhamCreationRequest request) {
        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP" + System.currentTimeMillis());
        sanPham.setTenSanPham(request.getTenSanPham());
        sanPham.setTrangThai(true);//khi tạo trạng thái mặc định là hoạt động
        sanPham.setMoTa(request.getMoTa());
        sanPham.setNguoiTao(request.getNguoiTao());
        return sanPhamRepository.save(sanPham);
    }

    @Override
    public SanPham updateSanPham(String id, SanPhamUpdateRequest request) {
        Optional<SanPham> optionalSanPham = sanPhamRepository.findById(id);
        if(optionalSanPham.isPresent()) {
            SanPham sanPham=optionalSanPham.get();
            sanPham.setTenSanPham(request.getTenSanPham());
            sanPham.setMoTa(request.getMoTa());
            sanPham.setNguoiSua(request.getNguoiSua());
            sanPham.setNgaySua(LocalDateTime.now());
            return sanPhamRepository.save(sanPham);
        }
        return null;
    }

    @Override
    public SanPham getSanPhamByID(String id) {
        return sanPhamRepository.findById(id).orElse(null);
    }

    @Override
    public SanPham findByTen(String ten) {
        return sanPhamRepository.findByTen(ten).get();
    }
}
