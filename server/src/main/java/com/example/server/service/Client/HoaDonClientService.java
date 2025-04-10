package com.example.server.service.Client;

import com.example.server.dto.Client.request.CartProductRequest;
import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.dto.Client.response.HoaDonChiTietClientResponse;
import com.example.server.dto.Client.response.HoaDonClientResponse;
import com.example.server.entity.*;
import com.example.server.repository.HoaDon.HoaDonChiTietRepository;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class HoaDonClientService {
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    KhachHangRepository khachHangRepository;
    @Autowired
    LichSuHoaDonRepository lichSuHoaDonRepository;
    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    public HoaDon createHoaDonClient(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, PhieuGiamGia phieuGiamGia) {
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(UUID.randomUUID().toString());
        hoaDon.setMaHoaDon(thongTinGiaoHangClientRequest.getMaHoaDon());
        hoaDon.setPhieuGiamGia(phieuGiamGia);
        //hoaDon.setKhachHang(khachHangRepository.findByMaKhachHang("KH000").get());
        hoaDon.setNhanVien(null);
        hoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        hoaDon.setLoaiHoaDon(1);// loại hóa đơn online
        hoaDon.setTenNguoiNhan(thongTinGiaoHangClientRequest.getHoTen());
        hoaDon.setSoDienThoai(thongTinGiaoHangClientRequest.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(thongTinGiaoHangClientRequest.getEmail());
        hoaDon.setDiaChi(thongTinGiaoHangClientRequest.getDiaChiCuThe() + ", " + thongTinGiaoHangClientRequest.getWard() + ", " + thongTinGiaoHangClientRequest.getDistrict() + ", " + thongTinGiaoHangClientRequest.getProvince());
        hoaDon.setTrangThaiGiaoHang(1);
        hoaDon.setTongTien(tongTienHang);
        hoaDon.setGhiChu(thongTinGiaoHangClientRequest.getGhiChu());
        hoaDon.setTrangThai(1);
        hoaDon.setNgayTao(LocalDateTime.now());
        HoaDon hoaDon1 = hoaDonRepository.save(hoaDon);
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId(UUID.randomUUID().toString());
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setHanhDong("Tạo đơn hàng");
        lichSuHoaDon.setMoTa("");
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return hoaDon1;
    }

    ;

    public HoaDon ThanhToanHoaDonPending(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, PhieuGiamGia phieuGiamGia) {
        HoaDon hoaDon = hoaDonRepository.findByMaHoaDon(thongTinGiaoHangClientRequest.getMaHoaDon()).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn pending cần thanh toán"));
        hoaDon.setPhieuGiamGia(phieuGiamGia);
        hoaDon.setNhanVien(null);
        hoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        hoaDon.setLoaiHoaDon(1);// loại hóa đơn online
        hoaDon.setTenNguoiNhan(thongTinGiaoHangClientRequest.getHoTen());
        hoaDon.setSoDienThoai(thongTinGiaoHangClientRequest.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(thongTinGiaoHangClientRequest.getEmail());
        hoaDon.setDiaChi(thongTinGiaoHangClientRequest.getDiaChiCuThe() + ", " + thongTinGiaoHangClientRequest.getWard() + ", " + thongTinGiaoHangClientRequest.getDistrict() + ", " + thongTinGiaoHangClientRequest.getProvince());
        hoaDon.setTrangThaiGiaoHang(1);
        hoaDon.setTongTien(tongTienHang);
        hoaDon.setGhiChu(thongTinGiaoHangClientRequest.getGhiChu());
        hoaDon.setTrangThai(1);
        hoaDon.setNgayTao(LocalDateTime.now());
        HoaDon hoaDon1 = hoaDonRepository.save(hoaDon);
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId(UUID.randomUUID().toString());
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setHanhDong("Tạo đơn hàng");
        lichSuHoaDon.setMoTa("");
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return hoaDon1;
    }

    ;

    public HoaDon createCartKhachHangDangNhap(String email) {
        Optional<HoaDon> hoaDonPending = hoaDonRepository.findHoaDonPending(email);
        if (hoaDonPending.isPresent()) {
            hoaDonPending.get().setHoaDonChiTiets(null);
            return hoaDonPending.get();
        }
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(UUID.randomUUID().toString());
        hoaDon.setLoaiHoaDon(1);
        hoaDon.setKhachHang(khachHangRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng")));
        hoaDon.setTrangThai(10);
        hoaDon.setMaHoaDon("HDO" + System.currentTimeMillis());

        return hoaDonRepository.save(hoaDon);
    }

    public HoaDon findHoaDonDangNhap(String email) {
        Optional<HoaDon> hoaDon = hoaDonRepository.findHoaDonPending(email);
        if (hoaDon.isPresent()) {
            hoaDon.get().setHoaDonChiTiets(null);
        }
        return hoaDon.orElseThrow(() -> new RuntimeException("Không có hóa đơn pending để thanh toán"));
    }

    public List<HoaDonClientResponse> findHoaDonClient(String email) {
        List<HoaDonClientResponse> hoaDonList = hoaDonRepository.findHoaDonClient(email);
        return hoaDonList;
    }

    public void addSanPhamVaoHoaDonChiTiet(CartProductRequest cartProductRequest) {
        if (cartProductRequest.getSanPhamChiTiet().getQuantity() <= sanPhamChiTietRepository.findById(cartProductRequest.getSanPhamChiTiet().getId()).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết")).getSoLuong()) { //kiểm tra xem số lượng trong kho còn đủ đẻ thêm vào hóa đơn chi tiết không
            HoaDon hoaDon = hoaDonRepository.findHoaDonPending(cartProductRequest.getEmail()).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn pending"));
            List<HoaDonChiTietClientResponse> hoaDonChiTietClientResponseList = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());
            for (int i = 0; i < hoaDonChiTietClientResponseList.size(); i++) {
                if (hoaDonChiTietClientResponseList.get(i).getId().equals(cartProductRequest.getSanPhamChiTiet().getId())) {//nếu id sản phẩm chi tiết trong hdct == id sản phẩm chi tiết gửi về
                    if (cartProductRequest.getSanPhamChiTiet().getQuantity() == 0) {//xóa hóa đơn chi tiết nếu số lượng client gửi về bằng 0
                        hoaDonChiTietRepository.delete(hoaDonChiTietRepository.findById(hoaDonChiTietClientResponseList.get(i).getIdHoaDonChiTiet()).orElseThrow(() -> new RuntimeException("không tìm thấy hóa đơn chi tiết!!!")));
                        System.out.println("Xóa hóa đơn chi tiết thành cong");
                        return;
                    }
                    if ((!hoaDonChiTietClientResponseList.get(i).getQuantity().equals(cartProductRequest.getSanPhamChiTiet().getQuantity())) && cartProductRequest.getSanPhamChiTiet().getQuantity() != 0) { //nếu số lượng của sản phẩm trong hóa đơn chi tiết khác số lượng sản phẩm gửi về
                        HoaDonChiTiet hoaDonChiTiet = hoaDonChiTietRepository.findById(hoaDonChiTietClientResponseList.get(i).getIdHoaDonChiTiet()).orElseThrow(() -> new RuntimeException("không tìm thấy hóa đơn chi tiết!!!"));
                        hoaDonChiTiet.setSoLuong(cartProductRequest.getSanPhamChiTiet().getQuantity());
                        hoaDonChiTietRepository.save(hoaDonChiTiet);
                        System.out.println("Cập nhật số lượng thành công");
                        return;
                    }
                }
            }
            if (cartProductRequest.getSanPhamChiTiet().getQuantity() > 0) {
                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setSoLuong(cartProductRequest.getSanPhamChiTiet().getQuantity());
                hoaDonChiTiet.setTrangThai(1);
                hoaDonChiTiet.setId(UUID.randomUUID().toString());
                hoaDonChiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTiet.setHoaDon(hoaDon);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTietRepository.findById(cartProductRequest.getSanPhamChiTiet().getId()).orElseThrow());
                hoaDonChiTietRepository.save(hoaDonChiTiet);
            }
        }
    }
}
