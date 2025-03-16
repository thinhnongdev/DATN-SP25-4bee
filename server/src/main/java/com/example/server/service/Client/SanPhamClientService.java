package com.example.server.service.Client;

import com.example.server.dto.Client.response.SanPhamClientResponse;
import com.example.server.entity.AnhSanPham;
import com.example.server.entity.SanPham;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SanPhamClientService {
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;
    @Autowired
    AnhSanPhamRepository anhSanPhamRepository;

    public List<SanPhamClientResponse> getAll(){
        List<SanPhamClientResponse> sanPhamClientResponseList=new ArrayList<>();
        List<SanPhamChiTiet> sanPhamChiTietList=sanPhamChiTietRepository.getAllSanPhamChiTiet();

        List<SanPhamChiTiet> sanPhamChiTietDaiDienList=sanPhamChiTietList.stream()
                .collect(Collectors.toMap(
                        SanPhamChiTiet::getSanPham,
                        sp -> sp,
                        (sp1, sp2) -> sp1.getGia().compareTo(sp2.getGia()) < 0 ? sp1 : sp2 // Giữ sản phẩm có giá nhỏ hơn
                ))
                .values()
                .stream()
                .toList();
       for (SanPhamChiTiet sp : sanPhamChiTietDaiDienList){
           SanPhamClientResponse sanPhamClientResponse=new SanPhamClientResponse();
           sanPhamClientResponse.setId(sp.getSanPham().getId());
           sanPhamClientResponse.setMa(sp.getSanPham().getMaSanPham());
           sanPhamClientResponse.setTen(sp.getSanPham().getTenSanPham());
           sanPhamClientResponse.setGia(sp.getGia());
           List<AnhSanPham> anhList = anhSanPhamRepository.findByIdSPCT(sp.getId());
           if (!anhList.isEmpty()) {
               sanPhamClientResponse.setAnhUrl(anhList.get(0).getAnhUrl());
           } else {
               sanPhamClientResponse.setAnhUrl("defaultImageUrl.jpg"); // Ảnh mặc định
           }
           sanPhamClientResponseList.add(sanPhamClientResponse);
       }
       return sanPhamClientResponseList;
    }

}
