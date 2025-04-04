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
import com.example.server.mapper.impl.SanPhamMapper;
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
import java.util.*;
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
    private final SanPhamMapper sanPhamMapper;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    private SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    @Autowired
    private AnhSanPhamRepository anhSanPhamRepository;

    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    @Override
    public List<SanPhamChiTietHoaDonResponse> getProductsInInvoice(String hoaDonId) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));

        return hoaDon.getHoaDonChiTiets().stream()
                .filter(chiTiet -> chiTiet.getTrangThai() == 1) // Chỉ lấy sản phẩm đang hoạt động
                .map(chiTiet -> {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();

                    // Kiểm tra giới hạn thời gian lưu giá (24h)
                    LocalDateTime thoiDiemHetHan = LocalDateTime.now().minusHours(24);

                    // Nếu chưa có giá lưu trữ hoặc đã quá thời gian hiệu lực, cập nhật giá
                    if (giaTaiThoiDiemThem == null ||
                            (chiTiet.getNgayThemVaoGio() != null &&
                                    chiTiet.getNgayThemVaoGio().isBefore(thoiDiemHetHan))) {
                        giaTaiThoiDiemThem = spct.getGia();
                        chiTiet.setGiaTaiThoiDiemThem(giaTaiThoiDiemThem);
                        chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                        hoaDonChiTietRepository.save(chiTiet);
                    }

                    // Sử dụng mapper mới để chuyển đổi
                    SanPhamChiTietHoaDonResponse response = sanPhamMapper.toCartResponse(spct, giaTaiThoiDiemThem);

                    // Cập nhật ID và số lượng của hóa đơn chi tiết
                    response.setId(chiTiet.getId());
                    response.setSoLuong(chiTiet.getSoLuong());
                    response.setThanhTien(giaTaiThoiDiemThem.multiply(new BigDecimal(chiTiet.getSoLuong())));

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
        log.info("Hóa đơn hợp lệ: {}", hoaDon.getId());

        // Tìm sản phẩm chi tiết
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                .findBySanPhamIdAndTrangThai(request.getSanPhamChiTietId(), true)
                .orElseThrow(() -> new ValidationException("Sản phẩm chi tiết không hợp lệ hoặc không đủ hàng"));

        // Kiểm tra tồn kho
        if (sanPhamChiTiet.getSoLuong() < request.getSoLuong()) {
            log.error("Không đủ hàng: Yêu cầu={}, Tồn kho={}", request.getSoLuong(), sanPhamChiTiet.getSoLuong());
            throw new ValidationException("Sản phẩm không đủ số lượng trong kho");
        }

        // Cập nhật số lượng tồn kho
        sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - request.getSoLuong());
        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
        log.info("Đã cập nhật tồn kho: sản phẩm={}, tồn kho mới={}",
                sanPhamChiTiet.getId(), sanPhamChiTiet.getSoLuong());

        // Lấy giá hiện tại để lưu
        BigDecimal giaHienTai = sanPhamChiTiet.getGia();
        LocalDateTime thoiDiemHienTai = LocalDateTime.now();

        // Tìm kiếm chi tiết với cùng sản phẩm và CÙNG GIÁ
        HoaDonChiTiet chiTietGiaGiong = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamChiTiet.getId()))
                .filter(ct -> {
                    // So sánh giá tại thời điểm thêm với giá hiện tại của sản phẩm
                    BigDecimal giaCt = ct.getGiaTaiThoiDiemThem();
                    return giaCt != null && giaCt.compareTo(giaHienTai) == 0;
                })
                .findFirst()
                .orElse(null);

        if (chiTietGiaGiong != null) {
            // Sản phẩm đã có trong giỏ hàng VỚI CÙNG GIÁ, cập nhật số lượng
            chiTietGiaGiong.setSoLuong(chiTietGiaGiong.getSoLuong() + request.getSoLuong());
            log.info("Cập nhật số lượng cho sản phẩm đã có trong giỏ với cùng giá: sản phẩm={}, giá={}, số lượng mới={}",
                    sanPhamChiTiet.getId(), giaHienTai, chiTietGiaGiong.getSoLuong());
        } else {
            // Thêm mới sản phẩm vào giỏ hàng (hoặc giá khác với các sản phẩm đã có)
            HoaDonChiTiet chiTietMoi = new HoaDonChiTiet();
            chiTietMoi.setId(UUID.randomUUID().toString());
            chiTietMoi.setSanPhamChiTiet(sanPhamChiTiet);
            chiTietMoi.setSoLuong(request.getSoLuong());
            chiTietMoi.setHoaDon(hoaDon);
            chiTietMoi.setTrangThai(1);
            chiTietMoi.setGiaTaiThoiDiemThem(giaHienTai); // Lưu giá tại thời điểm thêm
            chiTietMoi.setNgayThemVaoGio(thoiDiemHienTai); // Lưu thời điểm thêm
            hoaDon.getHoaDonChiTiets().add(chiTietMoi);
            log.info("Thêm mới sản phẩm vào giỏ (giá khác với sản phẩm đã có): sản phẩm={}, số lượng={}, giá={}",
                    sanPhamChiTiet.getId(), request.getSoLuong(), giaHienTai);
        }

        // Tính lại tổng tiền
        recalculateTotal(hoaDon);
        hoaDonRepository.save(hoaDon);

        return mapper.entityToResponse(hoaDon);
    }

    @Override
    public Map<String, Object> checkPriceChanges(String hoaDonId) {
        log.info("Kiểm tra thay đổi giá cho giỏ hàng: {}", hoaDonId);

        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> changedItems = new ArrayList<>();
        boolean hasPriceChanges = false;

        // Kiểm tra giới hạn thời gian lưu giá (24h)
        LocalDateTime thoiDiemHetHan = LocalDateTime.now().minusHours(24);

        // Duyệt qua từng sản phẩm trong giỏ
        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            if (chiTiet.getTrangThai() != 1) continue; // Bỏ qua sản phẩm không hoạt động

            SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
            BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();
            BigDecimal giaHienTai = spct.getGia();

            // Nếu chưa có giá lưu trữ, lấy giá hiện tại
            if (giaTaiThoiDiemThem == null) {
                chiTiet.setGiaTaiThoiDiemThem(giaHienTai);
                chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTietRepository.save(chiTiet);
                continue;
            }

            // Kiểm tra nếu đã quá thời gian hiệu lực
            if (chiTiet.getNgayThemVaoGio() != null && chiTiet.getNgayThemVaoGio().isBefore(thoiDiemHetHan)) {
                // Tự động cập nhật giá nếu quá thời gian giữ giá
                chiTiet.setGiaTaiThoiDiemThem(giaHienTai);
                chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                hoaDonChiTietRepository.save(chiTiet);
                continue;
            }

            // So sánh giá
            if (giaHienTai.compareTo(giaTaiThoiDiemThem) != 0) {
                hasPriceChanges = true;

                Map<String, Object> itemInfo = new HashMap<>();
                SanPham sp = spct.getSanPham();

                itemInfo.put("id", chiTiet.getId());
                itemInfo.put("sanPhamChiTietId", spct.getId());
                itemInfo.put("tenSanPham", sp != null ? sp.getTenSanPham() : "Không có dữ liệu");
                itemInfo.put("giaCu", giaTaiThoiDiemThem);
                itemInfo.put("giaMoi", giaHienTai);
                itemInfo.put("soLuong", chiTiet.getSoLuong());
                itemInfo.put("chenhLech", giaHienTai.subtract(giaTaiThoiDiemThem));
                itemInfo.put("phanTramThayDoi", calculatePercentageChange(giaTaiThoiDiemThem, giaHienTai));

                // Thêm thông tin sản phẩm để hiển thị
                itemInfo.put("maSanPhamChiTiet", spct.getMaSanPhamChiTiet());

                // Thêm thông tin màu sắc
                if (spct.getMauSac() != null) {
                    itemInfo.put("mauSac", spct.getMauSac().getTenMau());
                    itemInfo.put("maMauSac", spct.getMauSac().getMaMau() != null ?
                            spct.getMauSac().getMaMau() : "#FFFFFF");
                } else {
                    itemInfo.put("mauSac", "Không có dữ liệu");
                    itemInfo.put("maMauSac", "#FFFFFF");
                }

                // Thêm thông tin kích thước
                if (spct.getKichThuoc() != null) {
                    itemInfo.put("kichThuoc", spct.getKichThuoc().getTenKichThuoc());
                } else {
                    itemInfo.put("kichThuoc", "Không có dữ liệu");
                }

                // Thêm các thông tin chi tiết khác nếu cần
                if (spct.getChatLieu() != null) {
                    itemInfo.put("chatLieu", spct.getChatLieu().getTenChatLieu());
                }
                if (spct.getDanhMuc() != null) {
                    itemInfo.put("danhMuc", spct.getDanhMuc().getTenDanhMuc());
                }
                if (spct.getThuongHieu() != null) {
                    itemInfo.put("thuongHieu", spct.getThuongHieu().getTenThuongHieu());
                }

                // Lấy ảnh đầu tiên của sản phẩm nếu có
                List<AnhSanPham> anhList = anhSanPhamRepository.findByIdSPCT(spct.getId());
                if (anhList != null && !anhList.isEmpty()) {
                    itemInfo.put("anhUrl", anhList.get(0).getAnhUrl());
                }

                changedItems.add(itemInfo);
            }
        }

        result.put("hasPriceChanges", hasPriceChanges);
        result.put("changedItems", changedItems);
        result.put("tongMucThayDoi", calculateTotalChange(changedItems));

        return result;
    }

    private BigDecimal calculatePercentageChange(BigDecimal oldPrice, BigDecimal newPrice) {
        if (oldPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return newPrice.subtract(oldPrice)
                .divide(oldPrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotalChange(List<Map<String, Object>> changedItems) {
        BigDecimal totalChange = BigDecimal.ZERO;

        for (Map<String, Object> item : changedItems) {
            BigDecimal chenhLech = (BigDecimal) item.get("chenhLech");
            Integer soLuong = (Integer) item.get("soLuong");

            totalChange = totalChange.add(chenhLech.multiply(new BigDecimal(soLuong)));
        }

        return totalChange;
    }

    @Override
    @Transactional
    public HoaDonResponse updateProductPrice(String hoaDonId, String hoaDonChiTietId, Boolean useCurrentPrice) {
        log.info("Cập nhật giá sản phẩm: hoaDonId={}, chiTietId={}, useCurrentPrice={}",
                hoaDonId, hoaDonChiTietId, useCurrentPrice);

        // Lấy hóa đơn và chi tiết
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);
        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1)
                .filter(ct -> ct.getId().equals(hoaDonChiTietId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hóa đơn"));

        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        BigDecimal giaTaiThoiDiemThem = chiTiet.getGiaTaiThoiDiemThem();
        BigDecimal giaHienTai = sanPhamChiTiet.getGia();

        // Nếu useCurrentPrice=true => cập nhật giá tại thời điểm thêm = giá hiện tại
        if (Boolean.TRUE.equals(useCurrentPrice)) {
            log.info("Cập nhật giá sản phẩm {} từ {} thành {}",
                    sanPhamChiTiet.getId(), giaTaiThoiDiemThem, giaHienTai);
            chiTiet.setGiaTaiThoiDiemThem(giaHienTai);
            chiTiet.setNgayThemVaoGio(LocalDateTime.now());
        }

        // Tính lại tổng tiền hóa đơn
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }

    @Override
    @Transactional
    public HoaDonResponse updateAllProductPrices(String hoaDonId, Boolean useCurrentPrices) {
        log.info("Cập nhật tất cả giá sản phẩm: hoaDonId={}, useCurrentPrices={}",
                hoaDonId, useCurrentPrices);

        // Lấy hóa đơn
        HoaDon hoaDon = hoaDonService.validateAndGet(hoaDonId);

        if (Boolean.TRUE.equals(useCurrentPrices)) {
            // Duyệt qua tất cả sản phẩm trong giỏ hàng
            for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
                if (chiTiet.getTrangThai() == 1) {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    BigDecimal giaMoi = spct.getGia();

                    // Cập nhật giá
                    chiTiet.setGiaTaiThoiDiemThem(giaMoi);
                    chiTiet.setNgayThemVaoGio(LocalDateTime.now());
                    log.info("Cập nhật giá sản phẩm {}: giá mới = {}", spct.getId(), giaMoi);
                }
            }
        }

        // Tính lại tổng tiền
        recalculateTotal(hoaDon);
        return mapper.entityToResponse(hoaDonRepository.save(hoaDon));
    }
    @Override
    @Transactional
    public HoaDonResponse updateProductQuantity(String hoaDonId, String hoaDonChiTietId,
            UpdateProductQuantityRequest request) {
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
                .map(ct -> {
                    // Ưu tiên sử dụng giá tại thời điểm thêm nếu có
                    BigDecimal gia = ct.getGiaTaiThoiDiemThem() != null ?
                            ct.getGiaTaiThoiDiemThem() :
                            ct.getSanPhamChiTiet().getGia();

                    return gia.multiply(BigDecimal.valueOf(ct.getSoLuong()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public SanPhamChiTiet laySanPhamChiTiet(String sanPhamChiTietId, int soLuong) {
        // Lấy sản phẩm chi tiết theo ID
        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                .findBySanPhamIdAndTrangThai(sanPhamChiTietId, true)
                .orElseThrow(() -> new ValidationException(
                        "Không tìm thấy sản phẩm chi tiết hợp lệ cho ID: " + sanPhamChiTietId));

        // Kiểm tra số lượng tồn kho
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
                                formatCurrency(voucher.getGiaTriToiThieu())));
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
        if (amount == null)
            return "0đ";
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