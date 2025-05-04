//package com.example.server.mapper.impl;
//
//import com.example.server.constant.HoaDonConstant;
//import com.example.server.constant.PaymentConstant;
//import com.example.server.dto.HoaDon.request.HoaDonRequest;
//import com.example.server.dto.HoaDon.request.ThanhToanRequest;
//import com.example.server.dto.HoaDon.response.*;
//import com.example.server.entity.*;
//import com.example.server.exception.ResourceNotFoundException;
//import com.example.server.mapper.interfaces.IHoaDonMapper;
//import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
//import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
//import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
//import com.example.server.repository.NhanVien_KhachHang.DiaChiRepository;
//import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
//import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
//import com.example.server.repository.SanPham.AnhSanPhamRepository;
//import com.example.server.service.HoaDon.impl.CurrentUserServiceImpl;
//import com.example.server.service.SanPham.AnhSanPhamService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.Collections;
//import java.util.List;
//import java.util.UUID;
//import java.util.stream.Collectors;
//import java.util.stream.Stream;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class HoaDonMapper implements IHoaDonMapper {
//
//    private final KhachHangRepository khachHangRepository;
//    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
//    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
//    private final DiaChiRepository diaChiRepository;
//    private final AnhSanPhamService anhSanPhamService;
//    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;
//    private final AnhSanPhamRepository anhSanPhamRepository;
//    private final CurrentUserServiceImpl currentUserService;
//    @Autowired
//    private ThanhToanHoaDonMapper thanhToanHoaDonMapper;
//
//    @Override
//    public HoaDon requestToEntity(HoaDonRequest request) {
//        if (request == null) return null;
//
//        HoaDon hoaDon = new HoaDon();
//        updateEntityFromRequest(request, hoaDon);
//
//        // Ánh xạ chi tiết hóa đơn
//        if (request.getHoaDonChiTiets() != null) {
//            List<HoaDonChiTiet> chiTietList = request.getHoaDonChiTiets().stream()
//                    .map(this::mapRequestToHoaDonChiTiet)
//                    .collect(Collectors.toList());
//            hoaDon.setHoaDonChiTiets(chiTietList);
//        }
//
//        // Sử dụng `mapPhuongThucThanhToan()` để ánh xạ danh sách thanh toán
//        if (request.getThanhToans() != null) {
//            List<ThanhToanHoaDon> thanhToanList = request.getThanhToans().stream()
//                    .map(thanhToanRequest -> {
//                        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
//                                .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
//                                .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: " + thanhToanRequest.getMaPhuongThucThanhToan()));
//
//                        ThanhToanHoaDon thanhToan = mapPhuongThucThanhToan(phuongThuc, hoaDon);
//                        thanhToan.setSoTien(thanhToanRequest.getSoTien());
//                        return thanhToan;
//                    })
//                    .collect(Collectors.toList());
//
//            hoaDon.setThanhToanHoaDons(thanhToanList);
//        }
//
//        return hoaDon;
//    }
//
//    private ThanhToanHoaDon mapThanhToanRequestToEntity(ThanhToanRequest request, HoaDon hoaDon) {
//        if (request == null) return null;
//
//        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
//                .findByMaPhuongThucThanhToan(request.getMaPhuongThucThanhToan())
//                .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: " + request.getMaPhuongThucThanhToan()));
//
//        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
//        thanhToan.setPhuongThucThanhToan(phuongThuc);
//        thanhToan.setSoTien(request.getSoTien());
//        thanhToan.setNgayTao(LocalDateTime.now());
//
//        return thanhToan;
//    }
//
//    private HoaDonChiTiet mapRequestToHoaDonChiTiet(HoaDonChiTietResponse chiTietRequest) {
//        if (chiTietRequest == null) return null;
//
//        SanPhamChiTiet sanPhamChiTiet = findSanPhamChiTietById(chiTietRequest.getSanPhamChiTietId());
//
//        return HoaDonChiTiet.builder()
//                .soLuong(chiTietRequest.getSoLuong())
//                .trangThai(chiTietRequest.getTrangThai())
//                .sanPhamChiTiet(sanPhamChiTiet)
//                .build();
//    }
//
//    private SanPhamChiTiet findSanPhamChiTietById(String id) {
//        return sanPhamChiTietHoaDonRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chi tiết không tồn tại với ID: " + id));
//    }
//
////    @Override
////    public HoaDonResponse entityToResponse(HoaDon hoaDon) {
////        if (hoaDon == null) return null;
////
////        // Tách địa chỉ thành các phần riêng biệt nếu có
////        String diaChi = hoaDon.getDiaChi();
////        String tinh = "", huyen = "", xa = "", moTa = "";
////
////        if (diaChi != null && !diaChi.isEmpty()) {
////            String[] parts = diaChi.split(", ");
////            int length = parts.length;
////
////            if (length > 0) moTa = parts[0];   // Mô tả chi tiết (VD: "Số 22")
////            if (length > 1) xa = parts[1];      // Xã/Phường
////            if (length > 2) huyen = parts[2];   // Quận/Huyện
////            if (length > 3) tinh = parts[3];    // Tỉnh/Thành phố
////        }
////
////        return HoaDonResponse.builder()
////                .id(hoaDon.getId())
////                .maHoaDon(hoaDon.getMaHoaDon())
////                .tenNguoiNhan(hoaDon.getTenNguoiNhan())
////                .loaiHoaDon(hoaDon.getLoaiHoaDon())
////                .soDienThoai(hoaDon.getSoDienThoai())
////                .emailNguoiNhan(hoaDon.getEmailNguoiNhan())
////                .diaChi(diaChi) // Giữ nguyên địa chỉ đầy đủ
////                .tinh(tinh)
////                .huyen(huyen)
////                .xa(xa)
////                .moTa(moTa)
////                .trangThaiGiaoHang(hoaDon.getTrangThaiGiaoHang())
////                .thoiGianGiaoHang(hoaDon.getThoiGianGiaoHang())
////                .thoiGianNhanHang(hoaDon.getThoiGianNhanHang())
////                .tongTien(hoaDon.getTongTien())
////                .ghiChu(hoaDon.getGhiChu())
////                .trangThai(hoaDon.getTrangThai())
////                .ngayTao(hoaDon.getNgayTao())
////                .nhanVien(mapNhanVienToResponse(hoaDon.getNhanVien()))
////                .khachHang(mapKhachHangToResponse(hoaDon.getKhachHang()))
////                .phieuGiamGia(mapPhieuGiamGiaToResponse(hoaDon.getPhieuGiamGia()))
////                .hoaDonChiTiets(mapHoaDonChiTietToResponse(hoaDon.getHoaDonChiTiets()))
////                .build();
////    }
//
//    @Override
//    public HoaDonResponse entityToResponse(HoaDon hoaDon) {
//        if (hoaDon == null) return null;
//
//        DiaChi diaChiKhachHang = null;
//        String soDienThoaiKhachHang = null;
//
//        if (hoaDon.getKhachHang() != null) {
//            // Lấy số điện thoại từ KhachHang
//            soDienThoaiKhachHang = hoaDon.getKhachHang().getSoDienThoai();
//
//            // Lấy danh sách địa chỉ của khách hàng
//            List<DiaChi> danhSachDiaChi = diaChiRepository.findDiaChiByIdKhachHang(hoaDon.getKhachHang().getId());
//
//            // Chọn địa chỉ đầu tiên nếu có
//            if (!danhSachDiaChi.isEmpty()) {
//                diaChiKhachHang = danhSachDiaChi.get(0);
//            }
//        }
//
//        // Nếu hóa đơn có địa chỉ, ưu tiên hiển thị
//        if (hoaDon.getDiaChi() != null && !hoaDon.getDiaChi().trim().isEmpty()) {
//            return buildHoaDonResponse(hoaDon, hoaDon.getDiaChi(), "", "", "");
//        }
//
//        // Nếu khách hàng là khách lẻ nhưng hóa đơn có địa chỉ, hiển thị địa chỉ từ hóa đơn
//        if (hoaDon.getKhachHang() == null && hoaDon.getDiaChi() != null) {
//            return buildHoaDonResponse(hoaDon, hoaDon.getDiaChi(), "", "", "");
//        }
//
//        // Nếu khách hàng có địa chỉ, hiển thị địa chỉ đầu tiên của khách hàng
//        if (diaChiKhachHang != null) {
//            return buildHoaDonResponse(
//                    hoaDon,
//                    diaChiKhachHang.getDiaChiCuThe(),
//                    diaChiKhachHang.getXa(),
//                    diaChiKhachHang.getHuyen(),
//                    diaChiKhachHang.getTinh()
//            );
//        }
//
//        String[] diaChiTach = tachDiaChi(hoaDon.getDiaChi());
//        return buildHoaDonResponse(hoaDon, diaChiTach[0], diaChiTach[1], diaChiTach[2], diaChiTach[3]);
//    }
//
//
//    /**
//     * Hàm hỗ trợ xây dựng response từ hóa đơn và thông tin địa chỉ
//     */
//    private HoaDonResponse buildHoaDonResponse(HoaDon hoaDon, String diaChiCuThe, String xa, String huyen, String tinh) {
//        List<ThanhToanHoaDonResponse> thanhToanResponses = hoaDon.getThanhToanHoaDons() != null
//                ? hoaDon.getThanhToanHoaDons().stream()
//                .peek(thanhToan -> log.info("Thanh toán ID: {}, Phương thức: {}, Trạng thái: {}",
//                        thanhToan.getId(),
//                        thanhToan.getPhuongThucThanhToan() != null
//                                ? thanhToan.getPhuongThucThanhToan().getTenPhuongThucThanhToan()
//                                : "Không có",
//                        thanhToan.getTrangThai()))
//                .map(thanhToanHoaDonMapper::toDTO)
//                .collect(Collectors.toList())
//                : Collections.emptyList();
//
//        // Tính riêng biệt tổng tiền thanh toán và tổng tiền hoàn trả
//        BigDecimal tongTienDaThanhToan = BigDecimal.ZERO;
//        BigDecimal tongTienHoanTra = BigDecimal.ZERO;
//
//        // Tính riêng tổng thanh toán và hoàn trả từ các giao dịch thanh toán
//        for (ThanhToanHoaDonResponse payment : thanhToanResponses) {
//            if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
//                tongTienDaThanhToan = tongTienDaThanhToan.add(payment.getTongTien());
//            } else if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND) {
//                tongTienHoanTra = tongTienHoanTra.add(payment.getTongTien());
//            }
//        }
//
//        // Tính tổng tiền đã thanh toán thực tế (sau khi trừ hoàn tiền)
//        BigDecimal tongTienThucTe = tongTienDaThanhToan.subtract(tongTienHoanTra);
//
//        // Tính tổng tiền sản phẩm
//        BigDecimal tongTienSanPham = hoaDon.getHoaDonChiTiets().stream()
//                .filter(chiTiet -> chiTiet.getTrangThai() == 1) // Chỉ tính sản phẩm đang hoạt động
//                .map(chiTiet -> {
//                    BigDecimal donGia = chiTiet.getGiaTaiThoiDiemThem() != null ?
//                            chiTiet.getGiaTaiThoiDiemThem() :
//                            chiTiet.getSanPhamChiTiet().getGia();
//                    return donGia.multiply(BigDecimal.valueOf(chiTiet.getSoLuong()));
//                })
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        BigDecimal phiVanChuyen = hoaDon.getPhiVanChuyen() != null ? hoaDon.getPhiVanChuyen() : BigDecimal.ZERO;
//        BigDecimal discountAmount = BigDecimal.ZERO;
//
//        // Tính toán giá trị giảm giá từ phiếu giảm giá
//        if (hoaDon.getPhieuGiamGia() != null) {
//            if (hoaDon.getPhieuGiamGia().getLoaiPhieuGiamGia() == 1) { // Giảm giá theo phần trăm
//                discountAmount = tongTienSanPham.multiply(hoaDon.getPhieuGiamGia().getGiaTriGiam())
//                        .divide(new BigDecimal(100), 0, RoundingMode.FLOOR);
//
//                // Kiểm tra nếu có giới hạn giảm giá tối đa
//                if (hoaDon.getPhieuGiamGia().getSoTienGiamToiDa() != null &&
//                        discountAmount.compareTo(hoaDon.getPhieuGiamGia().getSoTienGiamToiDa()) > 0) {
//                    discountAmount = hoaDon.getPhieuGiamGia().getSoTienGiamToiDa();
//                }
//            } else { // Giảm giá cố định
//                discountAmount = hoaDon.getPhieuGiamGia().getGiaTriGiam();
//            }
//        }
//
//        // Tính tổng tiền cần thanh toán (sản phẩm + phí vận chuyển - giảm giá)
//        BigDecimal tongTienCanThanhToan = tongTienSanPham.add(phiVanChuyen).subtract(discountAmount);
//
//        // Log chi tiết các khoản tiền để dễ debug
//        log.info("Hóa đơn {}: Tổng tiền SP = {}, Phí vận chuyển = {}, Giảm giá = {}, Đã thanh toán = {}, Hoàn trả = {}, Thực thanh toán = {}, Cần thanh toán = {}",
//                hoaDon.getMaHoaDon(),
//                tongTienSanPham,
//                phiVanChuyen,
//                discountAmount,
//                tongTienDaThanhToan,
//                tongTienHoanTra,
//                tongTienThucTe,
//                tongTienCanThanhToan);
//
//        return HoaDonResponse.builder()
//                .id(hoaDon.getId())
//                .maHoaDon(hoaDon.getMaHoaDon())
//                .tenNguoiNhan(hoaDon.getTenNguoiNhan())
//                .tenNhanVien(hoaDon.getNguoiTao())
//                .loaiHoaDon(hoaDon.getLoaiHoaDon())
//                .soDienThoai(hoaDon.getKhachHang() != null ? hoaDon.getKhachHang().getSoDienThoai() : hoaDon.getSoDienThoai())
//                .emailNguoiNhan(hoaDon.getEmailNguoiNhan())
//                .diaChi(Stream.of(diaChiCuThe, xa, huyen, tinh)
//                        .filter(s -> s != null && !s.isEmpty()) // Loại bỏ phần rỗng
//                        .collect(Collectors.joining(", "))) // Ghép chuỗi
//                .tinh(tinh)
//                .huyen(huyen)
//                .xa(xa)
//                .diaChiCuThe(diaChiCuThe)
//                .trangThaiGiaoHang(hoaDon.getTrangThaiGiaoHang())
//                .thoiGianGiaoHang(hoaDon.getThoiGianGiaoHang())
//                .thoiGianNhanHang(hoaDon.getThoiGianNhanHang())
//                .tongTien(tongTienCanThanhToan) // Tổng tiền đơn hàng cần thanh toán
//                .tongThanhToan(tongTienThucTe) // Tổng tiền đã thanh toán thực tế (đã trừ hoàn tiền)
//                .giamGia(discountAmount)
//                .phiVanChuyen(hoaDon.getPhiVanChuyen())
//                .ghiChu(hoaDon.getGhiChu())
//                .trangThai(hoaDon.getTrangThai() != null ? hoaDon.getTrangThai() : 0) // Tránh null
//                .ngayTao(hoaDon.getNgayTao())
//                .thanhToans(thanhToanResponses)
//                .nhanVien(mapNhanVienToResponse(hoaDon.getNhanVien()))
//                .khachHang(mapKhachHangToResponse(hoaDon.getKhachHang()))
//                .phieuGiamGia(mapPhieuGiamGiaToResponse(hoaDon.getPhieuGiamGia()))
//                .hoaDonChiTiets(mapHoaDonChiTietToResponse(hoaDon.getHoaDonChiTiets()))
//                .build();
//    }
//
//    private List<HoaDonChiTietResponse> mapHoaDonChiTietToResponse(List<HoaDonChiTiet> chiTiets) {
//        if (chiTiets == null || chiTiets.isEmpty()) return Collections.emptyList();
//
//        return chiTiets.stream()
//                .map(this::mapChiTietToResponse)
//                .collect(Collectors.toList());
//    }
//
//    private HoaDonChiTietResponse mapChiTietToResponse(HoaDonChiTiet chiTiet) {
//        if (chiTiet == null) return null;
//
//        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
//        SanPham sanPham = sanPhamChiTiet.getSanPham();
//
//        // Lấy tất cả hình ảnh thay vì chỉ lấy hình ảnh đầu tiên
//        List<String> hinhAnh = anhSanPhamRepository
//                .findByIdSPCT(sanPhamChiTiet.getId())
//                .stream()
//                .map(AnhSanPham::getAnhUrl)
//                .collect(Collectors.toList());
//
//        return HoaDonChiTietResponse.builder()
//                .id(chiTiet.getId())
//                .sanPhamChiTietId(sanPhamChiTiet.getId())
//                .hinhAnh(hinhAnh)
//                .tenSanPham(sanPham.getTenSanPham())
//                .maSanPham(sanPham.getMaSanPham())
//                .soLuong(chiTiet.getSoLuong())
//                .gia(sanPhamChiTiet.getGia())
//                .maSanPhamChiTiet(sanPhamChiTiet.getMaSanPhamChiTiet())
//                .thanhTien(sanPhamChiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getSoLuong())))
//                .trangThai(chiTiet.getTrangThai())
//                // Thêm các trường thông tin chi tiết
//                .mauSac(sanPhamChiTiet.getMauSac() != null ? sanPhamChiTiet.getMauSac().getTenMau() : null)
//                .maMauSac(sanPhamChiTiet.getMauSac() != null ? sanPhamChiTiet.getMauSac().getMaMau() : null)
//                .chatLieu(sanPhamChiTiet.getChatLieu() != null ? sanPhamChiTiet.getChatLieu().getTenChatLieu() : null)
//                .danhMuc(sanPhamChiTiet.getDanhMuc() != null ? sanPhamChiTiet.getDanhMuc().getTenDanhMuc() : null)
//                .kichThuoc(sanPhamChiTiet.getKichThuoc() != null ? sanPhamChiTiet.getKichThuoc().getTenKichThuoc() : null)
//                .thuongHieu(sanPhamChiTiet.getThuongHieu() != null ? sanPhamChiTiet.getThuongHieu().getTenThuongHieu() : null)
//                .kieuDang(sanPhamChiTiet.getKieuDang() != null ? sanPhamChiTiet.getKieuDang().getTenKieuDang() : null)
//                .kieuCuc(sanPhamChiTiet.getKieuCuc() != null ? sanPhamChiTiet.getKieuCuc().getTenKieuCuc() : null)
//                .kieuCoAo(sanPhamChiTiet.getKieuCoAo() != null ? sanPhamChiTiet.getKieuCoAo().getTenKieuCoAo() : null)
//                .kieuTayAo(sanPhamChiTiet.getKieuTayAo() != null ? sanPhamChiTiet.getKieuTayAo().getTenKieuTayAo() : null)
//                .kieuCoTayAo(sanPhamChiTiet.getKieuCoTayAo() != null ? sanPhamChiTiet.getKieuCoTayAo().getTenKieuCoTayAo() : null)
//                .hoaTiet(sanPhamChiTiet.getHoaTiet() != null ? sanPhamChiTiet.getHoaTiet().getTenHoaTiet() : null)
//                .build();
//    }
//
//    private List<DiaChiResponse> mapDiaChiListToResponse(List<DiaChi> diaChiList) {
//        if (diaChiList == null || diaChiList.isEmpty()) return Collections.emptyList();
//
//        return diaChiList.stream()
//                .map(this::mapDiaChiToResponse)
//                .collect(Collectors.toList());
//    }
//
//    private DiaChiResponse mapDiaChiToResponse(DiaChi diaChi) {
//        if (diaChi == null) return null;
//
//        return DiaChiResponse.builder()
//                .id(diaChi.getId())
//                .xa(diaChi.getXa())
//                .huyen(diaChi.getHuyen())
//                .tinh(diaChi.getTinh())
//                .moTa(diaChi.getMoTa())
//                .diaChiCuThe(diaChi.getDiaChiCuThe())
//                .trangThai(diaChi.getTrangThai())
//                .ngayTao(diaChi.getNgayTao())
//                .ngaySua(diaChi.getNgaySua())
//                .nguoiTao(diaChi.getNguoiTao())
//                .nguoiSua(diaChi.getNguoiSua())
//                .build();
//    }
//
//    @Override
//    public void updateEntityFromRequest(HoaDonRequest request, HoaDon hoaDon) {
//        if (request == null || hoaDon == null) return;
//
//        // Cập nhật các trường từ request
//        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
//        hoaDon.setSoDienThoai(request.getSoDienThoai());
//        hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());
//        hoaDon.setGhiChu(request.getGhiChu());
//        // Chỉ cập nhật địa chỉ nếu có thay đổi
//        if (request.getDiaChi() != null) {
//            hoaDon.setDiaChi(request.getDiaChi());
//        }
//
//        hoaDon.setLoaiHoaDon(request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : HoaDonConstant.ONLINE
//        );
//
//
//        if (request.getIdKhachHang() != null) {
//            KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
//                    .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại với ID: " + request.getIdKhachHang()));
//            hoaDon.setKhachHang(khachHang);
//        }
//
//        if (request.getIdPhieuGiamGia() != null) {
//            PhieuGiamGia phieuGiamGia = phieuGiamGiaRepository.findById(request.getIdPhieuGiamGia())
//                    .orElseThrow(() -> new ResourceNotFoundException("Phiếu giảm giá không tồn tại với ID: " + request.getIdPhieuGiamGia()));
//            hoaDon.setPhieuGiamGia(phieuGiamGia);
//        }
//
////        if (request.getPhuongThucThanhToans() != null) {
////            List<ThanhToanHoaDon> thanhToans = request.getPhuongThucThanhToans().stream()
////                    .map(phuongThuc -> mapPhuongThucThanhToan(phuongThuc, hoaDon)) // Sử dụng lambda để truyền `hoaDon`
////                    .collect(Collectors.toList());
////            thanhToans.forEach(thanhToan -> thanhToan.setHoaDon(hoaDon));
////            hoaDon.setThanhToanHoaDons(thanhToans);
////        }
//    }
//
//    private KhachHangResponse mapKhachHangToResponse(KhachHang khachHang) {
//        if (khachHang == null) return null;
//
//        return KhachHangResponse.builder()
//                .id(khachHang.getId())
//                .maKhachHang(khachHang.getMaKhachHang())
//                .tenKhachHang(khachHang.getTenKhachHang())
//                .soDienThoai(khachHang.getSoDienThoai())
//                .email(khachHang.getEmail())
//                // Thêm dòng này để lấy danh sách địa chỉ
//                .build();
//    }
//
//    @Override
//    public ThanhToanHoaDon mapPhuongThucThanhToan(PhuongThucThanhToan phuongThuc, HoaDon hoaDon) {
//        if (phuongThuc == null) return null;
//
//        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
//        thanhToan.setId("TT" + UUID.randomUUID().toString().replace("-", "").substring(0, 8)); // Tạo ID
//        thanhToan.setHoaDon(hoaDon); // Liên kết với HoaDon
//        thanhToan.setPhuongThucThanhToan(phuongThuc);
//        thanhToan.setMoTa(phuongThuc.getMoTa());
//        thanhToan.setNguoiTao(currentUserService.getCurrentNhanVien().getTenNhanVien());
//        thanhToan.setTrangThai(determineTrangThai(phuongThuc.getId())); // Xác định trạng thái
//        return thanhToan;
//    }
//
//    private int determineTrangThai(String phuongThucId) {
//        if (phuongThucId == null) {
//            throw new IllegalArgumentException("Phương thức thanh toán không được để trống.");
//        }
//
//        switch (phuongThucId) {
//            case PaymentConstant.PAYMENT_METHOD_COD:
//                return PaymentConstant.PAYMENT_STATUS_COD; // Trả sau (COD)
//            case PaymentConstant.PAYMENT_METHOD_CASH:
//                return PaymentConstant.PAYMENT_STATUS_PAID; // Tiền mặt -> Đã thanh toán ngay
//            case PaymentConstant.PAYMENT_METHOD_BANK:
//                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Chuyển khoản -> Cần xác nhận
//            default:
//                return PaymentConstant.PAYMENT_STATUS_UNPAID; // Mặc định là chưa thanh toán
//        }
//    }
//
//    private NhanVienResponse mapNhanVienToResponse(NhanVien nhanVien){
//        if (nhanVien == null) return null;
//
//        return NhanVienResponse.builder()
//                .id(nhanVien.getId())
//                .maNhanVien(nhanVien.getMaNhanVien())
//                .tenNhanVien(nhanVien.getTenNhanVien())
//                .build();
//    }
//
//    private PhieuGiamGiaResponse mapPhieuGiamGiaToResponse(PhieuGiamGia phieuGiamGia) {
//        if (phieuGiamGia == null) return null;
//
//        return PhieuGiamGiaResponse.builder()
//                .id(phieuGiamGia.getId())
//                .maPhieuGiamGia(phieuGiamGia.getMaPhieuGiamGia())
//                .tenPhieuGiamGia(phieuGiamGia.getTenPhieuGiamGia())
//                .giaTriGiam(phieuGiamGia.getGiaTriGiam())
//                .build();
//    }
//    private String[] tachDiaChi(String diaChi) {
//        if (diaChi == null || diaChi.trim().isEmpty()) {
//            return new String[]{"Không có địa chỉ", "", "", ""};
//        }
//
//        String[] parts = diaChi.split(", ");
//        String tinh = "";
//        String huyen = "";
//        String xa = "";
//        String diaChiCuThe = "";
//
//        // Duyệt từ cuối về đầu để lấy tỉnh -> huyện -> xã
//        for (int i = parts.length - 1; i >= 0; i--) {
//            String part = parts[i];
//
//            if (tinh.isEmpty()) {
//                tinh = part;
//            } else if (huyen.isEmpty() && (part.startsWith("Huyện") || part.startsWith("Quận") || part.startsWith("Thành phố") || part.startsWith("Thị xã"))) {
//                huyen = part;
//            } else if (xa.isEmpty() && (part.startsWith("Xã") || part.startsWith("Phường") || part.startsWith("Thị trấn"))) {
//                xa = part;
//                break; // Dừng lại khi đã lấy được xã/phường/thị trấn
//            }
//        }
//
//        // diaChiCuThe là phần còn lại
//        diaChiCuThe = String.join(", ", Arrays.copyOfRange(parts, 0, Arrays.asList(parts).indexOf(xa)));
//
//        return new String[]{diaChiCuThe, xa, huyen, tinh};
//    }
//}
