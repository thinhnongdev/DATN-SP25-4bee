package com.example.server.service.HoaDon.impl;

import com.example.server.Util.PDFGenerator;
import com.example.server.constant.HoaDonConstant;
import com.example.server.constant.PaymentConstant;
import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.interfaces.IHoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import com.example.server.service.HoaDon.interfaces.IThanhToanHoaDonService;
import com.example.server.specification.HoaDonSpecification;
import com.example.server.validator.interfaces.IHoaDonValidator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class HoaDonServiceImpl implements IHoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    private final HoaDonSpecification hoaDonSpecification;
    private final LichSuHoaDonRepository lichSuHoaDonRepository;
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    private final IHoaDonMapper hoaDonMapper;
    private final IHoaDonValidator hoaDonValidator;
    private final ICurrentUserService currentUserService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private  ThanhToanHoaDonService thanhToanHoaDonService;

    @Autowired
    private LichSuHoaDonService lichSuHoaDonService;

    @Autowired
    private PDFGenerator pdfGenerator;

    @Override
    public HoaDon validateAndGet(String id) {
        log.info("Validating and getting order with ID: {}", id);
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Order not found with ID: {}", id);
                    return new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id);
                });
    }

    //Create hóa đơn
    @Override
    @Transactional
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        log.info("Creating new invoice with request: {}", request);

        // 1. Xác thực dữ liệu
        hoaDonValidator.validateCreate(request);

        // 2. Tạo entity hóa đơn
        HoaDon hoaDon = new HoaDon();
        hoaDon.setId("HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        hoaDon.setMaHoaDon(generateMaHoaDon());
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
        hoaDon.setNguoiTao(currentUserService.getCurrentUsername());

        // 3. Cập nhật thông tin từ request
        hoaDonMapper.updateEntityFromRequest(request, hoaDon);

        // 4. Xử lý thêm sản phẩm vào hóa đơn
        List<SanPhamChiTietHoaDonResponse> sanPhams = request.getSanPhams();
        if (sanPhams == null || sanPhams.isEmpty()) {
            throw new IllegalArgumentException("Hóa đơn phải có ít nhất một sản phẩm.");
        }

        List<HoaDonChiTiet> hoaDonChiTiets = new ArrayList<>();
        for (SanPhamChiTietHoaDonResponse sanPhamChiTietHoaDonResponse : request.getSanPhams()) {
            SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository.findBySanPhamIdAndTrangThai(
                            sanPhamChiTietHoaDonResponse.getId(), true)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chi tiết không tồn tại: " + sanPhamChiTietHoaDonResponse.getId()));


            HoaDonChiTiet newChiTiet = HoaDonChiTiet.builder()
                    .id(UUID.randomUUID().toString())
                    .hoaDon(hoaDon) //  Đảm bảo gán `hoaDon`
                    .sanPhamChiTiet(sanPhamChiTiet)
                    .soLuong(sanPhamChiTietHoaDonResponse.getSoLuong())
                    .trangThai(1)
                    .build();

            hoaDonChiTiets.add(newChiTiet);
        }
        hoaDon.setHoaDonChiTiets(hoaDonChiTiets); //  Gán danh sách vào hóa đơn

        // Liên kết lại các `HoaDonChiTiet` với `HoaDon`
        for (HoaDonChiTiet chiTiet : hoaDonChiTiets) {
            chiTiet.setHoaDon(hoaDon);
        }

        // 6. Lưu hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());

        // 7. Kiểm tra sản phẩm sau khi lưu
        log.info("HoaDonChiTiets after save: {}", hoaDon.getHoaDonChiTiets());

        // 8. Xử lý phương thức thanh toán
//        if (request.getPhuongThucThanhToans() == null || request.getPhuongThucThanhToans().isEmpty()) {
//            throw new IllegalArgumentException("Phải chọn ít nhất một phương thức thanh toán.");
//        }
//        final HoaDon finalHoaDon = hoaDon;
//        List<ThanhToanHoaDon> thanhToanList = request.getPhuongThucThanhToans().stream()
//                .map(phuongThuc -> hoaDonMapper.mapPhuongThucThanhToan(phuongThuc, finalHoaDon))
//                .toList();
//        thanhToanHoaDonRepository.saveAll(thanhToanList);
//        hoaDon.getThanhToanHoaDons().addAll(thanhToanList);
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    @Override
    public Map<String, Long> getInvoiceCounts(HoaDonSearchCriteria criteria) {
        Specification<HoaDon> spec = hoaDonSpecification.createSpecification(criteria);

        List<HoaDon> invoices = hoaDonRepository.findAll(spec);

        Map<String, Long> counts = new HashMap<>();
        counts.put("all", (long) invoices.size());

        Map<Integer, Long> statusCounts = invoices.stream()
                .collect(Collectors.groupingBy(HoaDon::getTrangThai, Collectors.counting()));

        counts.put("all", (long) invoices.size());
        for (int status = 1; status <= 5; status++) {
            counts.put(String.valueOf(status), statusCounts.getOrDefault(status, 0L));
        }

        return counts;
    }

    @Override
    @Transactional
    public HoaDonResponse updateHoaDon(String id, HoaDonRequest request) {
        log.info("Updating invoice with id: {} and request: {}", id, request);

        // Tìm hóa đơn hiện tại
        HoaDon hoaDon = findHoaDonById(id);

        // Kiểm tra và xác thực dữ liệu
        hoaDonValidator.validateUpdate(request, hoaDon);

        // Cập nhật thông tin cơ bản từ request
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSoDienThoai(request.getSoDienThoai());
        hoaDon.setGhiChu(request.getGhiChu());

        // Cập nhật địa chỉ nếu có
        if (StringUtils.hasText(request.getDiaChi())) {
            // Xử lý địa chỉ, nếu cần format hay validate
            hoaDon.setDiaChi(request.getDiaChi().trim());
        }

        // Nếu là khách hàng lẻ (không có ID khách hàng), cập nhật thông tin trong hoaDon
        if (hoaDon.getKhachHang() == null) {
            log.info("Updating anonymous customer information in invoice");
        }

        hoaDon.setNgaySua(LocalDateTime.now());
        hoaDon.setNguoiSua(currentUserService.getCurrentUsername());

        // Lưu lịch sử thay đổi nếu cần
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setNgaySua(LocalDateTime.now());

        // Lấy đối tượng NhanVien từ currentUserService
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();
        lichSuHoaDon.setNhanVien(nhanVien);
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDon.setHanhDong("Cập nhật thông tin người nhận");
        lichSuHoaDon.setMoTa("Cập nhật thông tin người nhận: " + request.getTenNguoiNhan() + ", Địa chỉ: " + request.getDiaChi() +", SĐT" +request.getSoDienThoai());
        lichSuHoaDonRepository.save(lichSuHoaDon);

        // Lưu lại hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated invoice with ID: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    @Override
    @Transactional
    public HoaDonResponse getHoaDonById(String id) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        // Kiểm tra Hibernate có load danh sách thanh toán không
        hoaDon.getThanhToanHoaDons().size();
        log.info("Số lượng thanh toán trước khi ánh xạ: {}", hoaDon.getThanhToanHoaDons().size());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    private HoaDon findHoaDonById(String id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));
    }

    @Override
    public Page<HoaDonResponse> getAllHoaDon(Pageable pageable) {
        return hoaDonRepository.findAll(pageable)
                .map(hoaDonMapper::entityToResponse);
    }

    //Update địa chỉ
    @Override
    public HoaDonResponse updateHoaDonAddress(String id, String diaChi, String tinh, String huyen, String xa, String diaChiCuThe) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

        if (tinh == null || huyen == null || xa == null) {
            throw new IllegalArgumentException("Vui lòng nhập đầy đủ tỉnh, huyện, xã");
        }

        // Format địa chỉ đúng cách
        StringBuilder fullAddress = new StringBuilder();
        if (diaChiCuThe != null && !diaChiCuThe.isEmpty()) fullAddress.append(diaChiCuThe).append(", ");
        fullAddress.append(xa).append(", ")
                .append(huyen).append(", ")
                .append(tinh);

        hoaDon.setDiaChi(fullAddress.toString().trim()); // Cập nhật địa chỉ
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    //    Tính lưu phí vận chuyển vào hóa đơn
    public HoaDon capNhatPhiVanChuyen(String hoaDonId, BigDecimal phiVanChuyen) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        hoaDon.setPhiVanChuyen(phiVanChuyen);
        return hoaDonRepository.save(hoaDon);
    }

    //delete Hóa đơn
    @Override
    @Transactional
    public HoaDonResponse deleteHoaDon(String hoaDonId) {
        log.info("Hủy hóa đơn với ID: {}", hoaDonId);

        HoaDon hoaDon = validateAndGet(hoaDonId);

        // Kiểm tra trạng thái hóa đơn, chỉ có thể hủy nếu chưa giao hàng
        if (hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN &&
                hoaDon.getTrangThai() != HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {
            throw new ValidationException("Chỉ có thể hủy hóa đơn khi chưa giao hàng.");
        }

        //Hoàn lại sản phẩm vào kho
        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
            sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
            log.info("Hoàn lại sản phẩm {} vào kho: số lượng mới {}", sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());
        }

        //Hoàn lại mã giảm giá nếu hóa đơn có voucher
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();
            voucher.setSoLuong(voucher.getSoLuong() + 1); // Hoàn lại số lượng voucher
            phieuGiamGiaRepository.save(voucher);
            log.info("Hoàn lại mã giảm giá {}: số lượng mới {}", voucher.getId(), voucher.getSoLuong());

            hoaDon.setPhieuGiamGia(null); // Xóa voucher khỏi hóa đơn
        }

        //Cập nhật trạng thái hóa đơn thành "Đã hủy"
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        hoaDon.setNgaySua(LocalDateTime.now());

        //Lưu lịch sử hủy hóa đơn
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Hủy hóa đơn");
        lichSuHoaDon.setMoTa("Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi");
        lichSuHoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_DA_HUY);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());

        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Lưu lịch sử hủy hóa đơn thành công.");

        //Lưu thay đổi hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hủy hóa đơn thành công: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    //Update trạng thái
    @Override
    public HoaDonResponse updateTrangThai(String id, Integer trangThai) {
        log.info("Updating status for invoice id: {} to status: {}", id, trangThai);

        // 1. Tìm hóa đơn cần cập nhật
        HoaDon hoaDon = findHoaDonById(id);

        // 2. Kiểm tra tính hợp lệ của trạng thái
        hoaDonValidator.validateUpdateTrangThai(trangThai, hoaDon);

        // 3. Cập nhật trạng thái hóa đơn
        hoaDon.setTrangThai(trangThai);
        hoaDon.setNgaySua(LocalDateTime.now());

        // Xử lý thời gian dựa trên trạng thái
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DANG_GIAO)) {
            hoaDon.setThoiGianGiaoHang(LocalDateTime.now());
        } else if (trangThai.equals(HoaDonConstant.TRANG_THAI_HOAN_THANH)) {
            hoaDon.setThoiGianNhanHang(LocalDateTime.now());

            // 4. Khi hóa đơn "Hoàn thành", cập nhật thanh toán từ "Chưa thanh toán" / "Trả sau" thành "Đã thanh toán"
            List<ThanhToanHoaDon> thanhToans = thanhToanHoaDonRepository.findByHoaDonId(id);
            for (ThanhToanHoaDon thanhToan : thanhToans) {
                if (thanhToan.getTrangThai() == PaymentConstant.PAYMENT_STATUS_UNPAID ||
                        thanhToan.getTrangThai() == PaymentConstant.PAYMENT_STATUS_COD) {
                    thanhToanHoaDonService.updatePaymentStatus(thanhToan.getId(), PaymentConstant.PAYMENT_STATUS_PAID);
                    log.info("Updated payment {} to PAID for invoice {}", thanhToan.getId(), hoaDon.getId());
                }
            }
        }

        // 5. Lưu thay đổi hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated status for invoice ID: {}", hoaDon.getId());

        // 6. Lưu lịch sử vào bảng `lich_su_hoa_don`
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setHanhDong("Cập nhật trạng thái hóa đơn");

        String trangThaiText = HoaDonConstant.getTrangThaiText(trangThai);
        lichSuHoaDon.setMoTa("Chuyển sang trạng thái " + trangThaiText);
        lichSuHoaDon.setTrangThai(trangThai);
        lichSuHoaDon.setNgaySua(LocalDateTime.now());
        lichSuHoaDon.setNhanVien(currentUserService.getCurrentNhanVien());
        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Saved invoice history for invoice ID: {}", hoaDon.getId());

        // 7. Trả về response
        return hoaDonMapper.entityToResponse(hoaDon);
    }


    // search
    @Override
    public Page<HoaDonResponse> searchHoaDon(HoaDonSearchCriteria criteria, Pageable pageable) {
        Specification<HoaDon> spec = hoaDonSpecification.createSpecification(criteria);
        return hoaDonRepository.findAll(spec, pageable)
                .map(hoaDonMapper::entityToResponse);
    }

    @Override
    public List<HoaDonStatisticsDTO> getStatistics(LocalDateTime fromDate, LocalDateTime toDate) {
        return hoaDonRepository.getStatistics(fromDate, toDate);
    }

    private String generateMaHoaDon() {
        String randomNumbers = String.format("%06d", new Random().nextInt(1000000));
        return "HD" + randomNumbers;
    }

    @Override
    public Optional<HoaDon> findById(String id) {
        return hoaDonRepository.findById(id);
    }

    @Override
    public byte[] generateInvoicePDF(String id) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            validateInvoiceForPrinting(hoaDon);
            return pdfGenerator.generateInvoicePDF(hoaDon);

        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }

    private void validateInvoiceForPrinting(HoaDon hoaDon) {
        // Nếu là khách hàng lẻ, bỏ qua kiểm tra thông tin cá nhân
        boolean isKhachHangLe = (hoaDon.getKhachHang() == null ||
                "Khách hàng lẻ".equalsIgnoreCase(hoaDon.getTenNguoiNhan()));

        // Kiểm tra tổng tiền
        if (hoaDon.getTongTien() == null) {
            throw new IllegalStateException("Hóa đơn không có thông tin tổng tiền");
        }

        // Nếu không phải khách hàng lẻ, kiểm tra thông tin người nhận
        if (!isKhachHangLe) {
            if (hoaDon.getTenNguoiNhan() == null || hoaDon.getTenNguoiNhan().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có thông tin người nhận");
            }

            if (hoaDon.getSoDienThoai() == null || hoaDon.getSoDienThoai().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có số điện thoại");
            }

            if (hoaDon.getDiaChi() == null || hoaDon.getDiaChi().trim().isEmpty()) {
                throw new IllegalStateException("Hóa đơn không có địa chỉ");
            }
        }

        // Kiểm tra mã giảm giá (nếu có)
//        if (hoaDon.getPhieuGiamGia() != null) {
//            PhieuGiamGia phieuGiamGia = hoaDon.getPhieuGiamGia();
//
//            if (phieuGiamGia.getTrangThai() == null || phieuGiamGia.getTrangThai() != 1) {
//                throw new IllegalStateException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
//            }
//
//            LocalDateTime now = LocalDateTime.now();
//            if (phieuGiamGia.getNgayBatDau() != null && now.isBefore(phieuGiamGia.getNgayBatDau())) {
//                throw new IllegalStateException("Mã giảm giá chưa đến thời gian sử dụng");
//            }
//
//            if (phieuGiamGia.getNgayKetThuc() != null && now.isAfter(phieuGiamGia.getNgayKetThuc())) {
//                throw new IllegalStateException("Mã giảm giá đã hết hạn");
//            }
//        }
    }


    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }
}
