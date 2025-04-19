package com.example.server.service.Client;

import com.example.server.dto.Client.request.CartProductRequest;
import com.example.server.dto.Client.request.OrderUpdateRequest;
import com.example.server.dto.Client.request.ProductUpdateRequest;
import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.dto.Client.response.HoaDonChiTietClientResponse;
import com.example.server.dto.Client.response.HoaDonClientResponse;
import com.example.server.dto.Client.response.ThanhToanHoaDonClientResponse;
import com.example.server.entity.*;
import com.example.server.repository.HoaDon.*;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.SanPham.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    @Autowired
    private ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    @Autowired
    private PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    public HoaDon createHoaDonClient(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, BigDecimal phiVanChuyen, PhieuGiamGia phieuGiamGia) {
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
        hoaDon.setPhiVanChuyen(phiVanChuyen);
        HoaDon hoaDon1 = hoaDonRepository.save(hoaDon);
        // Lưu lịch sử hóa đơn
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setHanhDong("Tạo đơn hàng");
        lichSuHoaDon.setMoTa("Khách hàng tạo đơn hàng online #" + thongTinGiaoHangClientRequest.getMaHoaDon());
        lichSuHoaDonRepository.save(lichSuHoaDon);

        return hoaDon1;
    }

    ;

    public HoaDon updateDiaChiHoaDonChoXacNhan(OrderUpdateRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(request.getId()).orElseThrow();
        if (!hoaDon.getDiaChi().equals(request.getDiaChi())) {
            if (hoaDon.getTrangThai() == 1 && hoaDon.getLoaiHoaDon() == 1) {
                hoaDon.setDiaChi(request.getDiaChi());
                hoaDon.setPhiVanChuyen(request.getPhiVanChuyen());
                hoaDon.setNgaySua(LocalDateTime.now());
                LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
                lichSuHoaDon.setId(UUID.randomUUID().toString());
                lichSuHoaDon.setHoaDon(hoaDonRepository.findById(request.getId()).orElse(null));
                lichSuHoaDon.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElse(null));
                lichSuHoaDon.setMoTa("Phí giao hàng thay đổi" + hoaDon.getPhiVanChuyen() + "->" + request.getPhiVanChuyen());
                if (request.getPhiVanChuyen().compareTo(hoaDon.getPhiVanChuyen()) == 0) {
                    lichSuHoaDon.setMoTa("Phí giao hàng không thay đổi");
                }
                lichSuHoaDon.setHanhDong("Khách hàng thay đổi thông tin địa chỉ giao hàng");
                lichSuHoaDon.setNgayTao(LocalDateTime.now());
                lichSuHoaDonRepository.save(lichSuHoaDon);
                return hoaDonRepository.save(hoaDon);
            }
            return hoaDonRepository.save(hoaDon);
        }
        return null;
    }

    public void updateHoaDonChiTiet(OrderUpdateRequest request) {
        List<ProductUpdateRequest> updatedProducts = request.getProducts();
        List<HoaDonChiTiet> existingDetails = hoaDonChiTietRepository.findByHoaDonIdUpdate(request.getId());

        // Tập hợp các ID chi tiết hiện tại trong request
        Set<String> requestDetailIds = updatedProducts.stream()
                .map(ProductUpdateRequest::getIdHoaDonChiTiet)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 1. Cập nhật sản phẩm cũ
        for (ProductUpdateRequest p : updatedProducts) {
            if (p.getIdHoaDonChiTiet() != null) {
                HoaDonChiTiet hoaDonChiTiet = hoaDonChiTietRepository.findById(p.getIdHoaDonChiTiet()).orElseThrow();
                boolean changed = false;
                StringBuilder moTa = new StringBuilder();

                if (!hoaDonChiTiet.getSanPhamChiTiet().getId().equals(p.getId())) continue;

                if (hoaDonChiTiet.getSoLuong() != p.getSoLuongMua()) {
                    moTa.append("Số lượng ").append(p.getMaSanPhamChiTiet())
                            .append(": ").append(hoaDonChiTiet.getSoLuong())
                            .append(" -> ").append(p.getSoLuongMua()).append("; ");
                    hoaDonChiTiet.setSoLuong(p.getSoLuongMua());
                    changed = true;
                }

                if (hoaDonChiTiet.getGiaTaiThoiDiemThem().compareTo(p.getGiaTaiThoiDiemThem()) != 0) {
                    moTa.append("Giá ").append(p.getMaSanPhamChiTiet())
                            .append(": ").append(hoaDonChiTiet.getGiaTaiThoiDiemThem())
                            .append(" -> ").append(p.getGiaTaiThoiDiemThem()).append("; ");
                    hoaDonChiTiet.setGiaTaiThoiDiemThem(p.getGiaTaiThoiDiemThem());
                    changed = true;
                }

                if (changed) {
                    hoaDonChiTiet.setNgaySua(LocalDateTime.now());
                    hoaDonChiTietRepository.save(hoaDonChiTiet);
                    saveLichSuHoaDon(request, "Cập nhật sản phẩm", moTa.toString());
                }
            }
        }

        // 2. Thêm mới sản phẩm nếu không có idHoaDonChiTiet
        for (ProductUpdateRequest p : updatedProducts) {
            if (p.getIdHoaDonChiTiet() == null) {
                HoaDonChiTiet newDetail = new HoaDonChiTiet();
                newDetail.setId(UUID.randomUUID().toString());
                newDetail.setHoaDon(hoaDonRepository.findById(request.getId()).orElseThrow());
                newDetail.setSanPhamChiTiet(sanPhamChiTietRepository.findById(p.getId()).orElseThrow());
                newDetail.setGiaTaiThoiDiemThem(p.getGiaTaiThoiDiemThem());
                newDetail.setSoLuong(p.getSoLuongMua());
                newDetail.setNgayTao(LocalDateTime.now());
                hoaDonChiTietRepository.save(newDetail);
                saveLichSuHoaDon(request, "Thêm sản phẩm mới", "Thêm mới sản phẩm " + p.getMaSanPhamChiTiet());
            }
        }

        // 3. Xoá những chi tiết không còn trong request
        for (HoaDonChiTiet detail : existingDetails) {
            if (!requestDetailIds.contains(detail.getId())) {
                hoaDonChiTietRepository.delete(detail);
                saveLichSuHoaDon(request, "Xoá sản phẩm", "Xoá sản phẩm " + detail.getSanPhamChiTiet().getMaSanPhamChiTiet());
            }
        }
        HoaDon hoaDon = hoaDonRepository.findById(request.getId()).orElseThrow();
        hoaDon.setTongTien(request.getTongTien());
        hoaDonRepository.save(hoaDon);
    }

    private void saveLichSuHoaDon(OrderUpdateRequest request, String action, String moTa) {
        LichSuHoaDon lichSu = new LichSuHoaDon();
        lichSu.setId(UUID.randomUUID().toString());
        lichSu.setHoaDon(hoaDonRepository.findById(request.getId()).orElse(null));
        lichSu.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElse(null));
        lichSu.setHanhDong(action);
        lichSu.setMoTa(moTa);
        lichSu.setNgayTao(LocalDateTime.now());
        lichSuHoaDonRepository.save(lichSu);
    }

    public void handleChenhLechThanhToan(OrderUpdateRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(request.getId()).orElseThrow();
        List<ThanhToanHoaDon> thanhToans = thanhToanHoaDonRepository.findByHoaDonId(hoaDon.getId());

        // Tổng tiền KH đã thanh toán, ngoại trừ COD
        BigDecimal tongDaThanhToan = thanhToans.stream()
                .filter(tt -> !tt.getPhuongThucThanhToan().getMaPhuongThucThanhToan().equalsIgnoreCase("COD"))
                .map(ThanhToanHoaDon::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Kiểm tra nếu chỉ có một thanh toán COD
        boolean chiCoCOD = thanhToans.size() == 1 &&
                thanhToans.get(0).getPhuongThucThanhToan().getMaPhuongThucThanhToan().equalsIgnoreCase("COD");

        BigDecimal chenhLech = request.getTongThanhToan().subtract(tongDaThanhToan);

        if (chiCoCOD && chenhLech.compareTo(BigDecimal.ZERO) != 0) {
            // Tạo bản ghi thanh toán mới tùy theo loại chênh lệch
            createThanhToanChenhLech(hoaDon, request, chenhLech);

            // Ghi vào lịch sử hóa đơn
            createLichSuChenhLech(hoaDon, request, chenhLech);
        }
    }

    private void createThanhToanChenhLech(HoaDon hoaDon, OrderUpdateRequest request, BigDecimal chenhLech) {
        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
        thanhToan.setId(UUID.randomUUID().toString());
        thanhToan.setHoaDon(hoaDon);
        thanhToan.setSoTien(chenhLech.abs()); // Luôn lưu số dương
        thanhToan.setTrangThai(1);
        thanhToan.setNgayTao(LocalDateTime.now());
        thanhToan.setNguoiTao("Khách hàng");

        if (chenhLech.compareTo(BigDecimal.ZERO) > 0) {
            // Phụ phí ➜ COD
            thanhToan.setPhuongThucThanhToan(
                    phuongThucThanhToanRepository.findByMaPhuongThucThanhToan("COD").orElseThrow()
            );
        } else {
            // Hoàn tiền ➜ Chuyển khoản
            thanhToan.setPhuongThucThanhToan(
                    phuongThucThanhToanRepository.findByMaPhuongThucThanhToan("BANK").orElseThrow()
            );
        }

        thanhToanHoaDonRepository.save(thanhToan);
    }

    private void createLichSuChenhLech(HoaDon hoaDon, OrderUpdateRequest request, BigDecimal chenhLech) {
        LichSuHoaDon lichSu = new LichSuHoaDon();
        lichSu.setId(UUID.randomUUID().toString());
        lichSu.setHoaDon(hoaDon);
        lichSu.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElse(null));
        lichSu.setNgayTao(LocalDateTime.now());

        if (chenhLech.compareTo(BigDecimal.ZERO) > 0) {
            lichSu.setHanhDong("Khách hàng thanh toán thêm phụ phí");
            lichSu.setMoTa("Tổng thanh toán thay đổi từ " + hoaDon.getTongTien()
                    + " → " + request.getTongThanhToan()
                    + ". Tạo thanh toán COD mới: +" + chenhLech);
        } else {
            lichSu.setHanhDong("Hoàn tiền cho khách hàng");
            lichSu.setMoTa("Tổng thanh toán thay đổi từ " + hoaDon.getTongTien()
                    + " → " + request.getTongThanhToan()
                    + ". Tạo thanh toán chuyển khoản hoàn phí: " + chenhLech);
        }

        lichSuHoaDonRepository.save(lichSu);
    }


    public HoaDon ThanhToanHoaDonPending(ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest, BigDecimal tongTienHang, BigDecimal phiVanChuyen, PhieuGiamGia phieuGiamGia) {
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
        hoaDon.setPhiVanChuyen(phiVanChuyen);
        HoaDon hoaDon1 = hoaDonRepository.save(hoaDon);
        // Lịch sử thanh toán
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setHanhDong("Thanh toán đơn hàng");
        lichSuHoaDon.setMoTa("Khách hàng thanh toán đơn hàng #" + thongTinGiaoHangClientRequest.getMaHoaDon());
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

    public HoaDonClientResponse findHoaDonClientById(String idHoaDon) {
        Optional<HoaDonClientResponse> hoaDonList = hoaDonRepository.findHoaDonClientByIdHoaDon(idHoaDon);
        return hoaDonList.orElse(null);
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
                SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(cartProductRequest.getSanPhamChiTiet().getId()).orElseThrow();
                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setSoLuong(cartProductRequest.getSanPhamChiTiet().getQuantity());
                hoaDonChiTiet.setTrangThai(1);
                hoaDonChiTiet.setId(UUID.randomUUID().toString());
                hoaDonChiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTiet.setHoaDon(hoaDon);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
                hoaDonChiTiet.setGiaTaiThoiDiemThem(sanPhamChiTiet.getGia());
                hoaDonChiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTietRepository.save(hoaDonChiTiet);
            }
        }
    }
}
