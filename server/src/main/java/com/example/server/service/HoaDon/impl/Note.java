//import com.example.server.constant.HoaDonConstant;
//import com.example.server.dto.HoaDon.request.HoaDonRequest;
//import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
//import com.example.server.dto.HoaDon.request.ThanhToanRequest;
//import com.example.server.dto.HoaDon.response.HoaDonResponse;
//import com.example.server.entity.*;
//import com.example.server.exception.ResourceNotFoundException;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.List;
//import java.util.UUID;
//
//@Override
//@Transactional
//public HoaDonResponse createHoaDon(HoaDonRequest request) {
//    log.info("Creating new invoice with request: {}", request);
//
//    // 1. Khởi tạo hóa đơn mới
//    HoaDon hoaDon = new HoaDon();
//    hoaDon.setId("HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
//    hoaDon.setMaHoaDon(generateMaHoaDon());
//    hoaDon.setNgayTao(LocalDateTime.now());
//    hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
//
//    // 2. Xác định loại hóa đơn (mặc định là tại quầy)
//    Integer loaiHoaDon = request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : 2;
//    hoaDon.setLoaiHoaDon(loaiHoaDon);
//
//    // 3. Kiểm tra khách hàng
//    if (request.getIdKhachHang() == null) {
//        hoaDon.setTenNguoiNhan("Khách hàng lẻ");
//        hoaDon.setSoDienThoai(request.getSoDienThoai());
//        hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());
//    } else {
//        KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
//
//        hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
//        hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
//        hoaDon.setEmailNguoiNhan(khachHang.getEmail());
//
//        // 4. Nếu là giao hàng, kiểm tra địa chỉ
//        if (loaiHoaDon == 3) {
//            DiaChi diaChi = diaChiRepository.findById(request.getDiaChiId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));
//
//            hoaDon.setDiaChi(diaChi.getMoTa() + ", " + diaChi.getXa() + ", " + diaChi.getHuyen() + ", " + diaChi.getTinh());
//        }
//    }
//
//    // 5. Lưu hóa đơn vào database
//    hoaDonRepository.save(hoaDon);
//    log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());
//
//    // 6. Lưu lịch sử hóa đơn
//    LichSuHoaDonRequest lichSuRequest = new LichSuHoaDonRequest();
//    lichSuRequest.setHoaDonId(hoaDon.getId());
//    lichSuRequest.setThoiGian(LocalDateTime.now());
//    lichSuRequest.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
//    lichSuRequest.setGhiChu("Tạo hóa đơn mới");
//    lichSuHoaDonService.saveLichSuHoaDon(lichSuRequest);
//
//    // 7. Kiểm tra tổng tiền thanh toán (nếu có)
//    if (request.getThanhToans() != null && !request.getThanhToans().isEmpty()) {
//        BigDecimal tongTienThanhToan = request.getThanhToans().stream()
//                .map(ThanhToanRequest::getSoTien)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        if (tongTienThanhToan.compareTo(hoaDon.getTongTien()) != 0) {
//            throw new IllegalArgumentException("Tổng tiền thanh toán không khớp với tổng tiền hóa đơn.");
//        }
//
//        List<ThanhToanHoaDon> thanhToanList = new ArrayList<>();
//
//        for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
//            PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
//                    .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
//                    .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: "
//                            + thanhToanRequest.getMaPhuongThucThanhToan()));
//
//            ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
//            thanhToanHoaDon.setHoaDon(hoaDon);
//            thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
//            thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());
//            thanhToanHoaDon.setNgayTao(LocalDateTime.now());
//
//            thanhToanList.add(thanhToanHoaDon);
//        }
//
//        // 8. Lưu thông tin thanh toán vào database
//        thanhToanHoaDonRepository.saveAll(thanhToanList);
//        hoaDon.setThanhToanHoaDons(thanhToanList);
//    }
//
//    return hoaDonMapper.entityToResponse(hoaDon);
//}
//@Override
//@Transactional
//public HoaDonResponse completeOrder(String hoaDonId, HoaDonRequest request) {
//    log.info("Hoàn tất hóa đơn với ID: {}", hoaDonId);
//
//    // 1. Lấy thông tin hóa đơn
//    HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
//    BigDecimal tongTienHoaDon = hoaDon.getTongTien();
//    LocalDateTime thoiGianHoanThanh = LocalDateTime.now(); // Thời gian hoàn tất hóa đơn
//
//    // 2. Xác định loại hóa đơn và trạng thái cuối cùng
//    Integer loaiHoaDon = hoaDon.getLoaiHoaDon();
//    Integer trangThaiCuoiCung = (loaiHoaDon == 3) ?
//            HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG :
//            HoaDonConstant.TRANG_THAI_HOAN_THANH;
//
//    // 3. Lưu lịch sử trạng thái hóa đơn trước khi cập nhật
//    List<Integer> trangThaiCanLuu = Arrays.asList(
//            HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN,
//            HoaDonConstant.TRANG_THAI_DA_XAC_NHAN
//    );
//    if (loaiHoaDon == 3) {
//        trangThaiCanLuu = Arrays.asList(
//                HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
//                HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG
//        );
//    } else {
//        trangThaiCanLuu = Arrays.asList(
//                HoaDonConstant.TRANG_THAI_DA_XAC_NHAN,
//                HoaDonConstant.TRANG_THAI_HOAN_THANH
//        );
//    }
//
//    for (Integer trangThai : trangThaiCanLuu) {
//        saveLichSuHoaDon(hoaDon, trangThai, "Chuyển trạng thái: " + HoaDonConstant.getTrangThaiText(trangThai), thoiGianHoanThanh);
//    }
//
//    // 4. Cập nhật trạng thái hóa đơn
//    hoaDon.setTrangThai(trangThaiCuoiCung);
//    hoaDon.setNgaySua(thoiGianHoanThanh);
//
//    // 5. Lưu danh sách thanh toán
//    BigDecimal tongTienThanhToan = BigDecimal.ZERO;
//    List<ThanhToanHoaDon> thanhToanList = new ArrayList<>();
//
//    for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
//        BigDecimal soTienThanhToan = thanhToanRequest.getSoTien() != null ? thanhToanRequest.getSoTien() : BigDecimal.ZERO;
//        tongTienThanhToan = tongTienThanhToan.add(soTienThanhToan);
//    }
//
//    if (tongTienThanhToan.compareTo(tongTienHoaDon) < 0) {
//        throw new IllegalArgumentException("Tổng tiền thanh toán không đủ để thanh toán hóa đơn.");
//    }
//
//    for (ThanhToanRequest thanhToanRequest : request.getThanhToans()) {
//        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository
//                .findByMaPhuongThucThanhToan(thanhToanRequest.getMaPhuongThucThanhToan())
//                .orElseThrow(() -> new IllegalArgumentException("Phương thức không hợp lệ: " + thanhToanRequest.getMaPhuongThucThanhToan()));
//
//        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
//        thanhToanHoaDon.setId(UUID.randomUUID().toString());
//        thanhToanHoaDon.setHoaDon(hoaDon);
//        thanhToanHoaDon.setPhuongThucThanhToan(phuongThuc);
//        thanhToanHoaDon.setSoTien(thanhToanRequest.getSoTien());
//        thanhToanHoaDon.setTrangThai(determineTrangThai(phuongThuc.getId()));
//        thanhToanHoaDon.setNgayTao(thoiGianHoanThanh);
//
//        thanhToanList.add(thanhToanHoaDon);
//    }
//
//    // 6. Lưu thanh toán vào database
//    thanhToanHoaDonRepository.saveAll(thanhToanList);
//    hoaDon.getThanhToanHoaDons().addAll(thanhToanList);
//    hoaDonRepository.save(hoaDon);
//
//    return hoaDonMapper.entityToResponse(hoaDon);
//}
//private void saveLichSuHoaDon(HoaDon hoaDon, Integer trangThai, String ghiChu, LocalDateTime thoiGian) {
//    LichSuHoaDonRequest lichSuRequest = new LichSuHoaDonRequest();
//    lichSuRequest.setHoaDonId(hoaDon.getId());
//    lichSuRequest.setTrangThai(trangThai);
//    lichSuRequest.setGhiChu(ghiChu);
//    lichSuRequest.setThoiGian(thoiGian);
//
//    lichSuHoaDonService.saveLichSuHoaDon(lichSuRequest);
//}