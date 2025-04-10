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

    public List<SanPhamClientResponse> getAll() {
        List<SanPhamClientResponse> sanPhamClientResponseList = new ArrayList<>();
        List<SanPhamChiTiet> sanPhamChiTietList = sanPhamChiTietRepository.getAllSanPhamChiTiet();

        // Lấy sản phẩm đại diện (mỗi sản phẩm 1 dòng)
        List<SanPhamChiTiet> sanPhamChiTietDaiDienList = sanPhamChiTietList.stream()
                .collect(Collectors.toMap(
                        sp -> sp.getSanPham().getId(),
                        sp -> sp,
                        (sp1, sp2) -> sp1.getGia().compareTo(sp2.getGia()) < 0 ? sp1 : sp2 // giữ sản phẩm có giá thấp hơn
                ))
                .values()
                .stream()
                .toList();

        for (SanPhamChiTiet sp : sanPhamChiTietDaiDienList) {
            SanPhamClientResponse response = new SanPhamClientResponse();
            SanPham sanPham = sp.getSanPham();

            response.setId(sanPham.getId());
            response.setMa(sanPham.getMaSanPham());
            response.setTen(sanPham.getTenSanPham());
            response.setGia(sp.getGia());

            // Lấy ảnh đại diện
            List<AnhSanPham> anhList = anhSanPhamRepository.findByIdSPCT(sp.getId());
            response.setAnhUrl(!anhList.isEmpty() ? anhList.get(0).getAnhUrl() : "defaultImageUrl.jpg");

            // Phân loại (lấy theo danh sách biến thể của cùng sản phẩm)
            List<SanPhamChiTiet> bienTheList = sanPhamChiTietList.stream()
                    .filter(ct -> ct.getSanPham().getId().equals(sanPham.getId()))
                    .toList();

            response.setTenKichThuoc(bienTheList.stream()
                    .map(ct -> ct.getKichThuoc().getTenKichThuoc())
                    .distinct().toArray(String[]::new));

            response.setTenMauSac(bienTheList.stream()
                    .map(ct -> ct.getMauSac().getTenMau())
                    .distinct().toArray(String[]::new));

            response.setTenChatLieu(bienTheList.get(0).getChatLieu().getTenChatLieu());
            response.setTenDanhMuc(bienTheList.get(0).getDanhMuc().getTenDanhMuc());
            response.setTenHoaTiet(bienTheList.get(0).getHoaTiet().getTenHoaTiet());
            response.setTenKieuCoAo(bienTheList.get(0).getKieuCoAo().getTenKieuCoAo());
            response.setTenKieuCoTayAo(bienTheList.get(0).getKieuCoTayAo().getTenKieuCoTayAo());
            response.setTenKieuCuc(bienTheList.get(0).getKieuCuc().getTenKieuCuc());
            response.setTenKieuDang(bienTheList.get(0).getKieuDang().getTenKieuDang());
            response.setTenKieuTayAo(bienTheList.get(0).getKieuTayAo().getTenKieuTayAo());
            response.setTenKieuTuiAo(bienTheList.get(0).getTuiAo().getTenKieuTuiAo());
            response.setTenThuongHieu(bienTheList.get(0).getThuongHieu().getTenThuongHieu());

            sanPhamClientResponseList.add(response);
        }

        return sanPhamClientResponseList;
    }


}
