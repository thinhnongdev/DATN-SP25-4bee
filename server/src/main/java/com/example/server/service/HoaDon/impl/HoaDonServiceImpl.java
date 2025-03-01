package com.example.server.service.HoaDon.impl;

import com.example.server.Util.PDFGenerator;
import com.example.server.constant.HoaDonConstant;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.interfaces.IHoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
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

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;

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

    private final IHoaDonMapper hoaDonMapper;
    private final IHoaDonValidator hoaDonValidator;
    private final ICurrentUserService currentUserService;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PDFGenerator pdfGenerator;

    @Override
    public HoaDon validateAndGet(String id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));
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
                            sanPhamChiTietHoaDonResponse.getId(), 1)
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
     //   hoaDon.setHoaDonChiTiets(hoaDonChiTiets); //  Gán danh sách vào hóa đơn

        // Liên kết lại các `HoaDonChiTiet` với `HoaDon`
        for (HoaDonChiTiet chiTiet : hoaDonChiTiets) {
            chiTiet.setHoaDon(hoaDon);
        }

        // 6. Lưu hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());

        // 7. Kiểm tra sản phẩm sau khi lưu
        //log.info("HoaDonChiTiets after save: {}", hoaDon.getHoaDonChiTiets());

        // 8. Xử lý phương thức thanh toán
        if (request.getPhuongThucThanhToans() == null || request.getPhuongThucThanhToans().isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một phương thức thanh toán.");
        }
        final HoaDon finalHoaDon = hoaDon;
        List<ThanhToanHoaDon> thanhToanList = request.getPhuongThucThanhToans().stream()
                .map(phuongThuc -> hoaDonMapper.mapPhuongThucThanhToan(phuongThuc, finalHoaDon))
                .toList();
        thanhToanHoaDonRepository.saveAll(thanhToanList);
      //  hoaDon.getThanhToanHoaDons().addAll(thanhToanList);
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    //    @Override
//    @Transactional
//    public HoaDonResponse createHoaDon(HoaDonRequest request) {
//        log.info("Creating new invoice with request: {}", request);
//
//        // 1. Xác thực yêu cầu
//        hoaDonValidator.validateCreate(request);
//
//        // 2. Chuyển yêu cầu sang thực thể
//        HoaDon hoaDon = hoaDonMapper.requestToEntity(request);
//        hoaDon.setId("HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
//        hoaDon.setMaHoaDon(generateMaHoaDon());
//        hoaDon.setNgayTao(LocalDateTime.now());
//        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);
//        hoaDon.setNguoiTao(currentUserService.getCurrentUsername());
//
//        // Khởi tạo danh sách phương thức thanh toán rỗng
//        hoaDon.setThanhToanHoaDons(new ArrayList<>());
//
//        // 3. Liên kết HoaDonChiTiet nếu có
//        if (hoaDon.getHoaDonChiTiets() != null) {
//            hoaDon.getHoaDonChiTiets().forEach(chiTiet -> chiTiet.setHoaDon(hoaDon));
//        }
//
//        // 4. Lưu hóa đơn
//        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
//        log.info("Invoice saved with ID: {}", savedHoaDon.getId());
//
//        // 5. Xử lý các phương thức thanh toán
//        List<PhuongThucThanhToan> phuongThucThanhToans = request.getPhuongThucThanhToans();
//        if (phuongThucThanhToans == null || phuongThucThanhToans.isEmpty()) {
//            throw new IllegalArgumentException("Phải chọn ít nhất một phương thức thanh toán.");
//        }
//
//        List<ThanhToanHoaDon> thanhToanList = phuongThucThanhToans.stream()
//                .map(phuongThuc -> {
//                    PhuongThucThanhToan existingPhuongThuc = phuongThucThanhToanRepository.findById(phuongThuc.getId())
//                            .orElseThrow(() -> new ResourceNotFoundException(
//                                    "Phương thức thanh toán không được tìm thấy với ID: " + phuongThuc.getId()));
//
//                    return hoaDonMapper.mapPhuongThucThanhToan(existingPhuongThuc, savedHoaDon);
//                })
//                .toList();
//
//        thanhToanHoaDonRepository.saveAll(thanhToanList);
//
//        // Liên kết các phương thức thanh toán trở lại hóa đơn và lưu lại
//        savedHoaDon.getThanhToanHoaDons().addAll(thanhToanList);
//        hoaDonRepository.save(savedHoaDon);
//
//        log.info("Hóa đơn được tạo thành công với ID: {}", savedHoaDon.getId());
//
//        // 6. Trả về phản hồi
//        return hoaDonMapper.entityToResponse(savedHoaDon);
//    }
    //Update Hóa đơn
//    @Override
//    public HoaDonResponse updateHoaDon(String id, HoaDonRequest request) {
//        log.info("Updating invoice with id: {} and request: {}", id, request);
//        HoaDon hoaDon = findHoaDonById(id);
//        hoaDonValidator.validateUpdate(request, hoaDon);
//
//        hoaDonMapper.updateEntityFromRequest(request, hoaDon);
//        hoaDon.setNgaySua(LocalDateTime.now());
//        hoaDon.setNguoiSua(currentUserService.getCurrentUsername());
//
//        hoaDon = hoaDonRepository.save(hoaDon);
//        log.info("Updated invoice with ID: {}", hoaDon.getId());
//        return hoaDonMapper.entityToResponse(hoaDon);
//    }
    @Override
    public HoaDonResponse updateHoaDon(String id, HoaDonRequest request) {
        log.info("Updating invoice with id: {} and request: {}", id, request);

        HoaDon hoaDon = findHoaDonById(id);
        hoaDonValidator.validateUpdate(request, hoaDon);

        // Cập nhật thông tin cơ bản từ request
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSoDienThoai(request.getSoDienThoai());
        hoaDon.setGhiChu(request.getGhiChu());

        // Cập nhật địa chỉ nếu có
        if (request.getDiaChi() != null) {
            hoaDon.setDiaChi(request.getDiaChi());
        }

        hoaDon.setNgaySua(LocalDateTime.now());
        hoaDon.setNguoiSua(currentUserService.getCurrentUsername());

        // Lưu lại hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated invoice with ID: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    @Override
    public HoaDonResponse getHoaDonById(String id) {
        return hoaDonMapper.entityToResponse(findHoaDonById(id));
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
    public HoaDonResponse updateHoaDonAddress(String id, String diaChi, String tinh, String huyen, String xa, String moTa) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

        if (tinh == null || huyen == null || xa == null) {
            throw new IllegalArgumentException("Vui lòng nhập đầy đủ tỉnh, huyện, xã");
        }

        // Format địa chỉ đúng cách
        StringBuilder fullAddress = new StringBuilder();
        if (moTa != null && !moTa.isEmpty()) fullAddress.append(moTa).append(", ");
        fullAddress.append(xa).append(", ")
                .append(huyen).append(", ")
                .append(tinh);

        hoaDon.setDiaChi(fullAddress.toString().trim()); // Cập nhật địa chỉ
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.entityToResponse(hoaDon);
    }


    //delete Hóa đơn
    @Override
    public void deleteHoaDon(String id) {
        HoaDon hoaDon = findHoaDonById(id);
        hoaDonValidator.validateDelete(hoaDon);
        hoaDonRepository.delete(hoaDon);
        log.info("Deleted invoice with ID: {}", id);
    }

    //Update trạng thái
    @Override
    public HoaDonResponse updateTrangThai(String id, Integer trangThai) {
        log.info("Updating status for invoice id: {} to status: {}", id, trangThai);

        // 1. Tìm hóa đơn cần cập nhật
        HoaDon hoaDon = findHoaDonById(id);

        // 2. Kiểm tra tính hợp lệ của trạng thái
        hoaDonValidator.validateUpdateTrangThai(trangThai, hoaDon);

        // 3. Cập nhật trạng thái
        hoaDon.setTrangThai(trangThai);
        hoaDon.setNgaySua(LocalDateTime.now());
//        hoaDon.setNguoiSua(currentUserService.getCurrentUsername());

        // Xử lý thời gian dựa trên trạng thái
        if (trangThai.equals(HoaDonConstant.TRANG_THAI_DANG_GIAO)) {
            hoaDon.setThoiGianGiaoHang(LocalDateTime.now());
        } else if (trangThai.equals(HoaDonConstant.TRANG_THAI_DA_GIAO)) {
            hoaDon.setThoiGianNhanHang(LocalDateTime.now());
        }

        // 4. Lưu thay đổi hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);
        log.info("Updated status for invoice ID: {}", hoaDon.getId());

        // 5. Lưu lịch sử vào bảng `lich_su_hoa_don`
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8); // Tạo ID từ UUID
        lichSuHoaDon.setId("LS" + uuid);
//        lichSuHoaDon.setId(UUID.randomUUID().toString());
        lichSuHoaDon.setHoaDon(hoaDon);
//        lichSuHoaDon.setNhanVien(new NhanVien(currentUserService.getCurrentUserId())); // Nhân viên hiện tại
        lichSuHoaDon.setHanhDong("Cập nhật trạng thái hóa đơn");

        String trangThaiText = HoaDonConstant.getTrangThaiText(trangThai);
        lichSuHoaDon.setMoTa("Chuyển sang trạng thái " + trangThaiText);

        lichSuHoaDon.setTrangThai(trangThai);
        lichSuHoaDon.setNgayTao(LocalDateTime.now());
        lichSuHoaDon.setNgaySua(LocalDateTime.now());

        // Lưu lịch sử vào database
        lichSuHoaDonRepository.save(lichSuHoaDon);
        log.info("Saved invoice history for invoice ID: {}", hoaDon.getId());

        // 6. Trả về response
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

    private String generateMaHoaDon() { // Tạo chuỗi ngẫu nhiên 6 ký tự số
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
        // Validate basic invoice data
        if (hoaDon.getTongTien() == null) {
            throw new IllegalStateException("Hóa đơn không có thông tin tổng tiền");
        }

        if (hoaDon.getTenNguoiNhan() == null || hoaDon.getTenNguoiNhan().trim().isEmpty()) {
            throw new IllegalStateException("Hóa đơn không có thông tin người nhận");
        }

        if (hoaDon.getSoDienThoai() == null || hoaDon.getSoDienThoai().trim().isEmpty()) {
            throw new IllegalStateException("Hóa đơn không có số điện thoại");
        }

        if (hoaDon.getDiaChi() == null || hoaDon.getDiaChi().trim().isEmpty()) {
            throw new IllegalStateException("Hóa đơn không có địa chỉ");
        }

        // Validate discount voucher if present
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia phieuGiamGia = hoaDon.getPhieuGiamGia();

            if (phieuGiamGia.getTrangThai() == null || phieuGiamGia.getTrangThai() != 1) {
                throw new IllegalStateException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }

            LocalDateTime now = LocalDateTime.now();
            if (phieuGiamGia.getNgayBatDau() != null && now.isBefore(phieuGiamGia.getNgayBatDau())) {
                throw new IllegalStateException("Mã giảm giá chưa đến thời gian sử dụng");
            }

            if (phieuGiamGia.getNgayKetThuc() != null && now.isAfter(phieuGiamGia.getNgayKetThuc())) {
                throw new IllegalStateException("Mã giảm giá đã hết hạn");
            }
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }
}
