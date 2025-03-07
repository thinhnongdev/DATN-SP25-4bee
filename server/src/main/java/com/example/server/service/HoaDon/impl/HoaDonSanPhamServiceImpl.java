package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.impl.HoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonChiTietRepository;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.repository.SanPham.AnhSanPhamRepository;
import com.example.server.service.HoaDon.interfaces.IHoaDonSanPhamService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import com.example.server.service.HoaDon.interfaces.IPhieuGiamGiaService;
import com.example.server.service.HoaDon.interfaces.ISanPhamHoaDonService;
import com.example.server.validator.interfaces.IHoaDonValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class HoaDonSanPhamServiceImpl implements IHoaDonSanPhamService {
    private final HoaDonRepository hoaDonRepository;
    private final ISanPhamHoaDonService sanPhamService;
    private final IPhieuGiamGiaService phieuGiamGiaService;
    private final IHoaDonService hoaDonService;
    private final IHoaDonValidator validator;
    private final HoaDonMapper mapper;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    private SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    @Autowired
    private AnhSanPhamRepository anhSanPhamRepository;

    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    // 1. Lấy danh sách sản phẩm trong hóa đơn
//    @Override
//    public List<HoaDonChiTietResponse> getProductsInInvoice(String hoaDonId) {
//        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
//                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));
//
//        return hoaDon.getHoaDonChiTiets().stream()
//                .filter(chiTiet -> chiTiet.getTrangThai() == 1) // Chỉ lấy các sản phẩm đang hoạt động
//                .map(chiTiet -> {
//                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
//                    SanPham sanPham = spct.getSanPham();
//                    return HoaDonChiTietResponse.builder()
//                            .id(chiTiet.getId())
//                            .sanPhamChiTietId(spct.getId())
//                            .maSanPham(sanPham.getMaSanPham())
//                            .tenSanPham(sanPham.getTenSanPham())
//                            .soLuong(chiTiet.getSoLuong())
//                            .gia(spct.getGia())
//                            .thanhTien(spct.getGia().multiply(new BigDecimal(chiTiet.getSoLuong())))
//                            .trangThai(chiTiet.getTrangThai())
//                            .build();
//                })
//                .collect(Collectors.toList());
//    }
    @Override
    public List<SanPhamChiTietHoaDonResponse> getProductsInInvoice(String hoaDonId) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));

        return hoaDon.getHoaDonChiTiets().stream()
                .filter(chiTiet -> chiTiet.getTrangThai() == 1) // Chỉ lấy sản phẩm đang hoạt động
                .map(chiTiet -> {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    SanPham sanPham = spct.getSanPham();

                    List<String> anhSanPhamUrls = anhSanPhamRepository
                            .findByIdSPCT(spct.getId())
                            .stream()
                            .map(AnhSanPham::getAnhUrl)
                            .collect(Collectors.toList());
                    log.info("Ảnh sản phẩm cho ID {}: {}", spct.getId(), anhSanPhamUrls);

                    SanPhamChiTietHoaDonResponse response = SanPhamChiTietHoaDonResponse.builder()
                            .id(chiTiet.getId())
                            .maSanPham(sanPham != null ? sanPham.getMaSanPham() : "Không có dữ liệu")
                            .tenSanPham(sanPham != null ? sanPham.getTenSanPham() : "Không có dữ liệu")
                            .hinhAnh(anhSanPhamUrls)
                            .gia(spct.getGia())
                            .thanhTien(spct.getGia().multiply(new BigDecimal(chiTiet.getSoLuong())))
                            .soLuong(chiTiet.getSoLuong())
                            .moTa(spct.getMoTa())
                            .trangThai(spct.getSoLuong() > 0) // Kiểm tra còn hàng hay hết hàng
                            .ngayTao(chiTiet.getHoaDon().getNgayTao())

                            // Thêm thông tin chi tiết từ SanPhamChiTiet (kiểm tra null tránh lỗi)
                            .mauSac(spct.getMauSac() != null ? spct.getMauSac().getTenMau() : "Không có dữ liệu")
                            .maMauSac(spct.getMauSac() != null ? spct.getMauSac().getMaMau() : "#FFFFFF")
                            .chatLieu(spct.getChatLieu() != null ? spct.getChatLieu().getTenChatLieu() : "Không có dữ liệu")
                            .kichThuoc(spct.getKichThuoc() != null ? spct.getKichThuoc().getTenKichThuoc() : "Không có dữ liệu")
                            .danhMuc(spct.getDanhMuc() != null ? spct.getDanhMuc().getTenDanhMuc() : "Không có dữ liệu")
                            .thuongHieu(spct.getThuongHieu() != null ? spct.getThuongHieu().getTenThuongHieu() : "Không có dữ liệu")
                            .kieuDang(spct.getKieuDang() != null ? spct.getKieuDang().getTenKieuDang() : "Không có dữ liệu")
                            .kieuCuc(spct.getKieuCuc() != null ? spct.getKieuCuc().getTenKieuCuc() : "Không có dữ liệu")
                            .kieuCoAo(spct.getKieuCoAo() != null ? spct.getKieuCoAo().getTenKieuCoAo() : "Không có dữ liệu")
                            .kieuTayAo(spct.getKieuTayAo() != null ? spct.getKieuTayAo().getTenKieuTayAo() : "Không có dữ liệu")
                            .kieuCoTayAo(spct.getKieuCoTayAo() != null ? spct.getKieuCoTayAo().getTenKieuCoTayAo() : "Không có dữ liệu")
                            .hoaTiet(spct.getHoaTiet() != null ? spct.getHoaTiet().getTenHoaTiet() : "Không có dữ liệu")
                            .kieuTuiAo(spct.getTuiAo() != null ? spct.getTuiAo().getTenKieuTuiAo() : "Không có dữ liệu")
                            .build();

                    log.info("Đối tượng response sau khi build: {}", response);
                    return response;
                })
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public HoaDonResponse addProduct(String hoaDonId, AddProductRequest request) {
        log.info("Bắt đầu xử lý thêm sản phẩm: hoaDonId={}, productDetailId={}, quantity={}",
                hoaDonId, request.getSanPhamChiTietId(), request.getSoLuong());

        // Kiểm tra hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        log.info("✅ Hóa đơn hợp lệ: {}", hoaDon.getId());

        // Tìm sản phẩm chi tiết
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository.findBySanPhamIdAndTrangThai(request.getSanPhamChiTietId(), true)
                .orElseThrow(() -> new ValidationException("Sản phẩm chi tiết không hợp lệ hoặc không đủ hàng"));

        // Kiểm tra tồn kho
        if (sanPhamChiTiet.getSoLuong() < request.getSoLuong()) {
            log.error("Không đủ hàng: yêu cầu={}, tồn kho={}", request.getSoLuong(), sanPhamChiTiet.getSoLuong());
            throw new ValidationException("Sản phẩm không đủ số lượng trong kho");
        }

        //  Cập nhật số lượng tồn kho
        sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - request.getSoLuong());
        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        log.info(" Đã cập nhật tồn kho: sản phẩm={}, tồn kho mới={}",
                sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());

        //  Thêm vào hóa đơn
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1 && ct.getSanPhamChiTiet().getId().equals(sanPhamChiTiet.getId()))
                .findFirst()
                .orElse(null);

        if (chiTiet != null) {
            chiTiet.setSoLuong(chiTiet.getSoLuong() + request.getSoLuong());
        } else {
            chiTiet = HoaDonChiTiet.builder()
                    .id(UUID.randomUUID().toString())
                    .hoaDon(hoaDon)
                    .sanPhamChiTiet(sanPhamChiTiet)
                    .soLuong(request.getSoLuong())
                    .trangThai(1)
                    .build();
            hoaDon.getHoaDonChiTiets().add(chiTiet);
        }

        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse updateProductQuantity(String hoaDonId, String hoaDonChiTietId, UpdateProductQuantityRequest request) {
        log.info("Updating quantity for product detail {} in invoice {} to {}",
                hoaDonChiTietId, hoaDonId, request.getSoLuong());

        if (request.getSoLuong() <= 0) {
            throw new ValidationException("Số lượng phải lớn hơn 0");
        }

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        int currentQuantity = chiTiet.getSoLuong();
        int quantityChange = request.getSoLuong() - currentQuantity;

        if (quantityChange > 0) {
            // Tăng số lượng -> Giảm tồn kho
            if (sanPhamChiTiet.getSoLuong() < quantityChange) {
                throw new ValidationException("Không đủ số lượng trong kho");
            }
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - quantityChange);
        } else if (quantityChange < 0) {
            // Giảm số lượng -> Hoàn lại vào kho
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - quantityChange);
        }

        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        log.info("Updated stock for product {}: new quantity={}", sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());

        chiTiet.setSoLuong(request.getSoLuong());
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse removeVoucher(String hoaDonId) {
        log.info("Removing voucher from invoice {}", hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();

            // Hoàn lại số lượng voucher
            voucher.setSoLuong(voucher.getSoLuong() + 1);
            phieuGiamGiaRepository.save(voucher);

            hoaDon.setPhieuGiamGia(null);
            recalculateTotal(hoaDon);

            log.info("Successfully removed voucher. New total: {}", hoaDon.getTongTien());
            return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
        } else {
            throw new ValidationException("Không có voucher nào để xóa");
        }
    }

    // Thêm phương thức để lấy thông tin chi tiết hóa đơn (bao gồm cả voucher)
    @Override
    public HoaDonResponse getInvoiceDetails(String hoaDonId) {
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        // Đảm bảo tổng tiền được tính đúng
        recalculateTotal(hoaDon);

        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse removeProduct(String hoaDonId, String hoaDonChiTietId) {
        log.info("Removing product detail {} from invoice {}", hoaDonChiTietId, hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        // Hoàn lại số lượng vào kho
        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + chiTiet.getSoLuong());
        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        log.info("Restored stock for product {}: new quantity={}", sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());

        hoaDon.getHoaDonChiTiets().remove(chiTiet);
        hoaDonChiTietRepository.delete(chiTiet);

        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    // Các phương thức hỗ trợ
    private HoaDonChiTiet findChiTietBySanPhamId(HoaDon hoaDon, String sanPhamId) {
        log.info("Finding product {} in invoice {}", sanPhamId, hoaDon.getId());

        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamId))
                .findFirst()
                .orElse(null);
    }

    private BigDecimal calculateSubtotal(HoaDon hoaDon) {
        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1) // Chỉ tính các sản phẩm active
                .map(ct -> ct.getSanPhamChiTiet().getGia()
                        .multiply(BigDecimal.valueOf(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private HoaDonChiTiet createHoaDonChiTiet(HoaDon hoaDon, SanPham sanPham, int soLuong) {
        log.info("Creating new invoice detail for product {} with quantity {}", sanPham.getId(), soLuong);

        // Lấy `SanPhamChiTiet` từ database
        SanPhamChiTiet sanPhamChiTiet = laySanPhamChiTiet(sanPham.getId(), soLuong);

        // Tạo số ngẫu nhiên cho ID
        String randomNumbers = String.format("%06d", new Random().nextInt(1000000));
        String newId = "HDCT" + randomNumbers;

        // Tạo chi tiết hóa đơn
        return HoaDonChiTiet.builder()
                .id(newId)
                .hoaDon(hoaDon)
                .sanPhamChiTiet(sanPhamChiTiet)
                .soLuong(soLuong)
                .trangThai(1)
                .build();
    }

    public SanPhamChiTiet laySanPhamChiTiet(String sanPhamChiTietId, int soLuong) {
        // Lấy sản phẩm chi tiết theo ID
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository.findBySanPhamIdAndTrangThai(sanPhamChiTietId, true)
                .orElseThrow(() -> new ValidationException("Không tìm thấy sản phẩm chi tiết hợp lệ cho ID: " + sanPhamChiTietId));

        //  Kiểm tra số lượng tồn kho
        if (sanPhamChiTiet.getSoLuong() < soLuong) {
            throw new ValidationException("Sản phẩm không đủ số lượng trong kho");
        }

        return sanPhamChiTiet;
    }

    private void recalculateTotal(HoaDon hoaDon) {
        log.info("Recalculating total for invoice: {}", hoaDon.getId());

        // Tính tổng tiền ban đầu
        BigDecimal subtotal = calculateSubtotal(hoaDon);
        log.info("Subtotal: {}", subtotal);

        // Nếu có áp dụng voucher
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia voucher = hoaDon.getPhieuGiamGia();

            // Kiểm tra điều kiện áp dụng
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                BigDecimal discount;

                // Tính giảm giá theo loại
                if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo %
                    // Chuyển giaTriGiam thành BigDecimal
                    BigDecimal giaTriGiamDecimal = BigDecimal.valueOf(voucher.getGiaTriGiam().doubleValue());
                    discount = subtotal.multiply(giaTriGiamDecimal)
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                    // Kiểm tra giới hạn giảm
                    if (voucher.getSoTienGiamToiDa() != null &&
                            discount.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                        discount = voucher.getSoTienGiamToiDa();
                    }
                } else { // Giảm theo số tiền
                    discount = voucher.getGiaTriGiam();
                    // Đảm bảo không giảm quá tổng tiền
                    if (discount.compareTo(subtotal) > 0) {
                        discount = subtotal;
                    }
                }

                log.info("Discount amount: {}", discount);

                // Cập nhật tổng tiền sau giảm
                BigDecimal finalTotal = subtotal.subtract(discount);
                // Đảm bảo tổng tiền không âm
                hoaDon.setTongTien(finalTotal.max(BigDecimal.ZERO));
                log.info("Final total after discount: {}", hoaDon.getTongTien());
            } else {
                // Nếu không đủ điều kiện, xóa voucher
                log.info("Order total does not meet minimum requirement. Removing voucher.");
                hoaDon.setPhieuGiamGia(null);
                hoaDon.setTongTien(subtotal);
            }
        } else {
            // Nếu không có voucher
            log.info("No voucher applied. Setting total equal to subtotal.");
            hoaDon.setTongTien(subtotal);
        }
    }

    @Override
    @Transactional
    public HoaDonResponse applyVoucher(String hoaDonId, String voucherId) {
        log.info("Start applying voucher. HoaDonId: {}, VoucherId: {}", hoaDonId, voucherId);

        // Validate input
        if (StringUtils.isEmpty(hoaDonId) || StringUtils.isEmpty(voucherId)) {
            throw new ValidationException("ID hóa đơn và ID voucher không được để trống");
        }

        try {
            // Validate và lấy hóa đơn
            HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
            log.info("Found invoice: {}", hoaDon.getId());

            // Validate và lấy voucher
            PhieuGiamGia voucher = phieuGiamGiaService.validateAndGet(voucherId);
            log.info("Found voucher: {}", voucher.getId());

            // Kiểm tra trạng thái voucher
            if (voucher.getTrangThai() != 1) {
                throw new ValidationException("Phiếu giảm giá không khả dụng");
            }

            // Kiểm tra thời hạn
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(voucher.getNgayBatDau()) || now.isAfter(voucher.getNgayKetThuc())) {
                throw new ValidationException("Phiếu giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng");
            }

            // Kiểm tra số lượng
            if (voucher.getSoLuong() <= 0) {
                throw new ValidationException("Phiếu giảm giá đã hết lượt sử dụng");
            }

            // Tính tổng tiền trước khi áp dụng voucher
            BigDecimal subtotal = calculateSubtotal(hoaDon);
            log.info("Order subtotal: {}", subtotal);

            // Kiểm tra điều kiện áp dụng
            if (subtotal.compareTo(voucher.getGiaTriToiThieu()) < 0) {
                throw new ValidationException(
                        String.format("Tổng tiền hóa đơn phải từ %s để áp dụng voucher này",
                                formatCurrency(voucher.getGiaTriToiThieu()))
                );
            }

            // Áp dụng voucher
            hoaDon.setPhieuGiamGia(voucher);
            voucher.setSoLuong(voucher.getSoLuong() - 1);

            // Tính lại tổng tiền
            recalculateTotal(hoaDon);
            log.info("New total after applying voucher: {}", hoaDon.getTongTien());

            // Lưu thay đổi
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            log.info("Successfully saved invoice with voucher");

            return mapper.entityToResponse(savedHoaDon);
        } catch (Exception e) {
            log.error("Error applying voucher: ", e);
            throw e;
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0đ";
        return String.format("%,d đ", amount.longValue());
    }

    public List<SanPhamChiTiet> filterProducts(String searchTerm, String chatLieu, String kieuDang,
                                               String thuongHieu, String kieuCuc, String kieuCoAo,
                                               String kieuCoTayAo, String kieuTayAo, String kieuTuiAo,
                                               String danhMuc, String hoaTiet, String mauSac, String kichThuoc) {
        return sanPhamChiTietHoaDonRepository.filterProducts(searchTerm, chatLieu, kieuDang, thuongHieu,
                kieuCuc, kieuCoAo, kieuCoTayAo, kieuTayAo,
                kieuTuiAo, danhMuc, hoaTiet, mauSac, kichThuoc);
    }

}