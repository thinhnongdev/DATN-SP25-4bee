package com.example.server.service.BanHang.impl;


import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.HoaDon;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.interfaces.IHoaDonMapper;

import com.example.server.repository.HoaDon.*;
import com.example.server.repository.NhanVien_KhachHang.DiaChiRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.HoaDon.impl.HoaDonServiceImpl;
import com.example.server.service.HoaDon.impl.PhieuGiamGiaHoaDonServiceImpl;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.stereotype.Service;

import com.example.server.constant.HoaDonConstant;


import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BanHangServiceImpl implements BanHangService {
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;

    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;

    private final ThanhToanHoaDonRepository thanhToanHoaDonRepository;

    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    private final IHoaDonMapper hoaDonMapper;

    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    private final ICurrentUserService currentUserService;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private HoaDonServiceImpl hoaDonServiceImpl;
    @Autowired
    private PhieuGiamGiaHoaDonServiceImpl phieuGiamGiaHoaDonServiceImpl;
    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    NhanVienRepository nhanVienRepository;
    @Autowired
    private DiaChiRepository diaChiRepository;

    private final ExecutorService executorService = Executors.newFixedThreadPool(5);


    @Override
    public List<HoaDon> getHoaDonCho() {
        return hoaDonRepository.getHoaDonCho();
    }

    @Override
    @Transactional
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        log.info("Creating new invoice with request: {}", request);

        HoaDon hoaDon = new HoaDon();
        hoaDon.setId("HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        hoaDon.setMaHoaDon(generateMaHoaDon());
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN);

        // Đảm bảo loaiHoaDon không bị null (mặc định là 2 - Tại quầy)
        Integer loaiHoaDon = request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : 2;
        hoaDon.setLoaiHoaDon(loaiHoaDon);

        if (request.getIdKhachHang() == null) {
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(request.getSoDienThoai());
            hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());

        } else {
            KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

            hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
            hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
            hoaDon.setEmailNguoiNhan(khachHang.getEmail());

            if (loaiHoaDon == 3) { // Nếu là giao hàng, kiểm tra địa chỉ
                DiaChi diaChi = diaChiRepository.findById(request.getDiaChiId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));

                hoaDon.setDiaChi(diaChi.getMoTa() + ", " + diaChi.getXa() + ", " + diaChi.getHuyen() + ", " + diaChi.getTinh());
            }
        }

        hoaDonRepository.save(hoaDon);
        log.info("Hóa đơn được tạo thành công với ID: {}", hoaDon.getId());

        return hoaDonMapper.entityToResponse(hoaDon);
    }

    //    Update loại hóa đơn
    @Override
    @Transactional
    public void updateLoaiHoaDon(String hoaDonId, Integer loaiHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + hoaDonId));

        if (loaiHoaDon != 2 && loaiHoaDon != 3) {
            throw new ValidationException("Loại hóa đơn không hợp lệ.");
        }

        hoaDon.setLoaiHoaDon(loaiHoaDon);
        hoaDonRepository.save(hoaDon);

        log.info("Cập nhật hình thức mua hàng thành công: HoaDonID={}, LoaiHoaDon={}", hoaDonId, loaiHoaDon);
    }


    //    @Override
//    @Transactional
//    public HoaDonResponse addProduct(String hoaDonId, AddProductRequest request) {
//        log.info("Adding multiple products to invoice: hoaDonId={}", hoaDonId);
//
//        HoaDon hoaDon = hoaDonRepository.findHoaDonForUpdate(hoaDonId);
//        List<AddProductRequest> productRequests = (request.getProductList() != null) ?
//                request.getProductList() :
//                Collections.singletonList(request);
//
//        List<SanPhamChiTiet> sanPhamCapNhat = new ArrayList<>();
//        List<HoaDonChiTiet> hoaDonChiTietCapNhat = new ArrayList<>();
//
//        for (AddProductRequest productRequest : productRequests) {
//            SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
//                    .findBySanPhamIdAndTrangThai(productRequest.getSanPhamChiTietId(), true)
//                    .orElseThrow(() -> new ValidationException("Sản phẩm không hợp lệ"));
//
//            if (sanPhamChiTiet.getSoLuong() < productRequest.getSoLuong()) {
//                throw new ValidationException("Không đủ hàng trong kho");
//            }
//
//            // ✅ Cập nhật tồn kho
//            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - productRequest.getSoLuong());
//            sanPhamCapNhat.add(sanPhamChiTiet);
//
//            // ✅ Kiểm tra sản phẩm có trong hóa đơn chưa
//            HoaDonChiTiet chiTiet = hoaDonChiTietRepository
//                    .findByHoaDonAndSanPhamChiTiet(hoaDon.getId(), sanPhamChiTiet.getId())
//                    .orElse(null);
//
//            if (chiTiet != null) {
//                chiTiet.setSoLuong(chiTiet.getSoLuong() + productRequest.getSoLuong());
//            } else {
//                chiTiet = HoaDonChiTiet.builder()
//                        .id(UUID.randomUUID().toString())
//                        .hoaDon(hoaDon)
//                        .sanPhamChiTiet(sanPhamChiTiet)
//                        .soLuong(productRequest.getSoLuong())
//                        .trangThai(1)
//                        .build();
//                hoaDonChiTietCapNhat.add(chiTiet);
//            }
//        }
//
//        // ✅ Batch cập nhật dữ liệu
//        sanPhamChiTietHoaDonRepository.saveAll(sanPhamCapNhat);
//        hoaDonChiTietRepository.saveAll(hoaDonChiTietCapNhat);
//
//        // ✅ Cập nhật tổng tiền
//        updateHoaDonTotal(hoaDon);
//
//        // 🛠 Quan trọng: Cần lưu lại hóa đơn vào DB
//        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
//        log.info("Hóa đơn sau khi cập nhật: {}", savedHoaDon);
//
//        return hoaDonMapper.entityToResponse(savedHoaDon);
//    }
    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse addProduct(String hoaDonId, AddProductRequest request) {
        log.info("Adding multiple products to invoice using multithreading: hoaDonId={}", hoaDonId);

        // Tìm hóa đơn cần cập nhật
        HoaDon hoaDon = hoaDonRepository.findHoaDonForUpdate(hoaDonId);
        List<AddProductRequest> productRequests = (request.getProductList() != null) ?
                request.getProductList() :
                Collections.singletonList(request);

        // Sử dụng Concurrent Collections để tránh lỗi khi cập nhật song song
        List<SanPhamChiTiet> sanPhamCapNhat = Collections.synchronizedList(new ArrayList<>());
        List<HoaDonChiTiet> hoaDonChiTietCapNhat = Collections.synchronizedList(new ArrayList<>());

        // Sử dụng ExecutorService để xử lý đa luồng
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        List<Callable<Void>> tasks = new ArrayList<>();

        for (AddProductRequest productRequest : productRequests) {
            tasks.add(() -> {
                processProduct(hoaDon, productRequest, sanPhamCapNhat, hoaDonChiTietCapNhat);
                return null;
            });
        }

        try {
            // Thực thi tất cả tasks song song
            executorService.invokeAll(tasks);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lỗi khi xử lý đa luồng", e);
        } finally {
            executorService.shutdown();
        }

        // Batch cập nhật vào database sau khi hoàn tất xử lý song song
        sanPhamChiTietHoaDonRepository.saveAll(sanPhamCapNhat);
        hoaDonChiTietRepository.saveAll(hoaDonChiTietCapNhat);

        //Cập nhật tổng tiền hóa đơn
        updateHoaDonTotal(hoaDon);
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

        log.info("Successfully saved invoice after adding products with multithreading");
        return hoaDonMapper.entityToResponse(savedHoaDon);
    }

    private synchronized void processProduct(HoaDon hoaDon, AddProductRequest productRequest,
                                             List<SanPhamChiTiet> sanPhamCapNhat,
                                             List<HoaDonChiTiet> hoaDonChiTietCapNhat) {
        log.info("Processing product: {} for invoice: {}", productRequest.getSanPhamChiTietId(), hoaDon.getId());

        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
                .findBySanPhamIdAndTrangThai(productRequest.getSanPhamChiTietId(), true)
                .orElseThrow(() -> new ValidationException("Sản phẩm không hợp lệ"));

        if (sanPhamChiTiet.getSoLuong() < productRequest.getSoLuong()) {
            throw new ValidationException("Không đủ hàng trong kho");
        }

        // Cập nhật số lượng tồn kho
        synchronized (sanPhamChiTiet) {
            sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - productRequest.getSoLuong());
            sanPhamCapNhat.add(sanPhamChiTiet);
        }

        // Kiểm tra sản phẩm đã có trong hóa đơn chưa
        HoaDonChiTiet chiTiet;
        synchronized (hoaDon) {
            chiTiet = hoaDonChiTietRepository
                    .findByHoaDonAndSanPhamChiTiet(hoaDon.getId(), sanPhamChiTiet.getId())
                    .orElse(null);
        }

        if (chiTiet != null) {
            synchronized (chiTiet) {
                chiTiet.setSoLuong(chiTiet.getSoLuong() + productRequest.getSoLuong());
            }
            hoaDonChiTietCapNhat.add(chiTiet); // 🛠 Đảm bảo cập nhật vào DB
        } else {
            chiTiet = HoaDonChiTiet.builder()
                    .id(UUID.randomUUID().toString())
                    .hoaDon(hoaDon)
                    .sanPhamChiTiet(sanPhamChiTiet)
                    .soLuong(productRequest.getSoLuong())
                    .trangThai(1)
                    .build();
            hoaDonChiTietCapNhat.add(chiTiet);
        }
    }


    //    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    public void updateSanPhamSoLuong(String sanPhamChiTietId, int soLuong) {
//        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
//                .findBySanPhamIdAndTrangThai(sanPhamChiTietId, true)
//                .orElseThrow(() -> new ValidationException("Sản phẩm không hợp lệ"));
//
//        if (sanPhamChiTiet.getSoLuong() < soLuong) {
//            throw new ValidationException("Không đủ hàng trong kho");
//        }
//
//        sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() - soLuong);
//        sanPhamChiTietHoaDonRepository.save(sanPhamChiTiet);
//    }
//
//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    public void addOrUpdateHoaDonChiTiet(HoaDon hoaDon, AddProductRequest request) {
//        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietHoaDonRepository
//                .findBySanPhamIdAndTrangThai(request.getSanPhamChiTietId(), true)
//                .orElseThrow(() -> new ValidationException("Sản phẩm không hợp lệ"));
//
//        HoaDonChiTiet chiTiet = hoaDon.getHoaDonChiTiets().stream()
//                .filter(ct -> ct.getSanPhamChiTiet().getId().equals(sanPhamChiTiet.getId()))
//                .findFirst()
//                .orElse(null);
//
//        if (chiTiet != null) {
//            chiTiet.setSoLuong(chiTiet.getSoLuong() + request.getSoLuong());
//        } else {
//            chiTiet = HoaDonChiTiet.builder()
//                    .id(UUID.randomUUID().toString())
//                    .hoaDon(hoaDon)
//                    .sanPhamChiTiet(sanPhamChiTiet)
//                    .soLuong(request.getSoLuong())
//                    .trangThai(1)
//                    .build();
//            hoaDon.getHoaDonChiTiets().add(chiTiet);
//        }
//    }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateHoaDonTotal(HoaDon hoaDon) {
        recalculateTotal(hoaDon);
        hoaDonRepository.save(hoaDon);
    }

    @Override
    @Transactional
    public HoaDonResponse completeOrder(String hoaDonId, HoaDonRequest request) {
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);

        // Nếu là hóa đơn Giao hàng (loaiHoaDon = 3), cập nhật trạng thái "Chờ giao hàng"
        if (hoaDon.getLoaiHoaDon() == 3) {
            hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_CHO_GIAO_HANG);
        } else { // Nếu là hóa đơn tại quầy (loaiHoaDon = 2), cập nhật trạng thái "Hoàn thành"
            hoaDon.setTrangThai(HoaDonConstant.TRANG_THAI_HOAN_THANH);
        }

        hoaDon.setNgaySua(LocalDateTime.now());

        // Xử lý phương thức thanh toán
        List<ThanhToanHoaDon> thanhToanList = phuongThucThanhToan(request, hoaDon);
        thanhToanHoaDonRepository.saveAll(thanhToanList);
        hoaDon.getThanhToanHoaDons().addAll(thanhToanList);

        hoaDonRepository.save(hoaDon);
        return hoaDonMapper.entityToResponse(hoaDon);
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
            HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
            log.info("Found invoice: {}", hoaDon.getId());

            // Validate và lấy voucher
            PhieuGiamGia voucher = phieuGiamGiaHoaDonServiceImpl.validateAndGet(voucherId);
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

            return hoaDonMapper.entityToResponse(savedHoaDon);
        } catch (Exception e) {
            log.error("Error applying voucher: ", e);
            throw e;
        }
    }

    @Override
    @Transactional
    public HoaDonResponse selectCustomer(String hoaDonId, String customerId, String diaChiId) {
        log.info("Selecting customer for invoice: hoaDonId={}, customerId={}, diaChiId={}", hoaDonId, customerId, diaChiId);

        // Validate hóa đơn
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);

        // Nếu là hóa đơn tại quầy, không cần chọn địa chỉ
        if (hoaDon.getLoaiHoaDon() == 2) {
            log.info("Loại hóa đơn là tại quầy, không yêu cầu khách hàng hoặc địa chỉ.");
            hoaDon.setKhachHang(null);
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(null);
            hoaDon.setEmailNguoiNhan(null);
            hoaDon.setDiaChi(null);
            hoaDonRepository.save(hoaDon);
            return hoaDonMapper.entityToResponse(hoaDon);
        }

        // Nếu không có khách hàng, mặc định là khách lẻ
        if (customerId == null || customerId.isEmpty()) {
            hoaDon.setKhachHang(null);
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            hoaDon.setSoDienThoai(null);
            hoaDon.setEmailNguoiNhan(null);
            hoaDon.setDiaChi(null);
        } else {
            // Tìm khách hàng
            KhachHang khachHang = khachHangRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

            hoaDon.setKhachHang(khachHang);
            hoaDon.setTenNguoiNhan(khachHang.getTenKhachHang());
            hoaDon.setSoDienThoai(khachHang.getSoDienThoai());
            hoaDon.setEmailNguoiNhan(khachHang.getEmail());

            // Nếu là hóa đơn giao hàng, bắt buộc có địa chỉ
            if (hoaDon.getLoaiHoaDon() == 3) {
                List<DiaChi> danhSachDiaChi = diaChiRepository.findDiaChiByIdKhachHang(khachHang.getId());

                if (danhSachDiaChi.isEmpty()) {
                    throw new ResourceNotFoundException("Khách hàng không có địa chỉ hợp lệ để giao hàng.");
                }

                DiaChi diaChiKhachHang;

                if (diaChiId != null && !diaChiId.isEmpty()) {
                    // Nếu người dùng đã chọn địa chỉ
                    diaChiKhachHang = diaChiRepository.findById(diaChiId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + diaChiId));

                    // Kiểm tra địa chỉ có thuộc về khách hàng không
                    if (!diaChiKhachHang.getKhachHang().getId().equals(khachHang.getId())) {
                        throw new ValidationException("Địa chỉ không thuộc về khách hàng này");
                    }
                } else {
                    // Nếu khách hàng có nhiều địa chỉ, trả về danh sách địa chỉ để frontend hiển thị modal
                    if (danhSachDiaChi.size() > 1) {
                        log.info("Khách hàng có nhiều địa chỉ, yêu cầu chọn.");
                        throw new ValidationException("Khách hàng có nhiều địa chỉ. Cần chọn một địa chỉ.");
                    }
                    // Nếu khách hàng chỉ có một địa chỉ, tự động lấy
                    diaChiKhachHang = danhSachDiaChi.get(0);
                }

                // Gán địa chỉ vào hóa đơn
                hoaDon.setDiaChi(diaChiKhachHang.getMoTa() + ", " + diaChiKhachHang.getXa() + ", "
                        + diaChiKhachHang.getHuyen() + ", " + diaChiKhachHang.getTinh());
            }
        }

        // Lưu hóa đơn sau khi cập nhật khách hàng
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        log.info("Successfully updated invoice {} with customer {} and address {}", hoaDonId, hoaDon.getTenNguoiNhan(), hoaDon.getDiaChi());

        return hoaDonMapper.entityToResponse(savedHoaDon);
    }





    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse applyBestVoucher(String hoaDonId) {
        log.info("Applying best voucher for invoice: hoaDonId={}", hoaDonId);

        //Lấy hóa đơn và tính tổng tiền
        HoaDon hoaDon = hoaDonServiceImpl.validateAndGet(hoaDonId);
        BigDecimal subtotal = calculateSubtotal(hoaDon);

        //Lấy danh sách voucher hợp lệ
        List<PhieuGiamGiaResponse> vouchers = phieuGiamGiaHoaDonServiceImpl.getAvailableVouchersForOrder(subtotal);
        if (vouchers.isEmpty()) {
            log.warn("Không có voucher phù hợp cho hóa đơn {}", hoaDonId);
            return hoaDonMapper.entityToResponse(hoaDon);
        }

        //Sử dụng ExecutorService để tính toán mã giảm giá tốt nhất bằng đa luồng
        ExecutorService executorService = Executors.newFixedThreadPool(5);
        List<Callable<Map.Entry<PhieuGiamGiaResponse, BigDecimal>>> tasks = new ArrayList<>();

        for (PhieuGiamGiaResponse voucher : vouchers) {
            tasks.add(() -> {
                BigDecimal discountValue = calculateDiscountValue(voucher, subtotal);
                return Map.entry(voucher, discountValue);
            });
        }

        try {
            // Chạy tất cả tasks song song
            List<Future<Map.Entry<PhieuGiamGiaResponse, BigDecimal>>> futures = executorService.invokeAll(tasks);

            //Tìm voucher tốt nhất dựa trên giá trị giảm giá lớn nhất
            PhieuGiamGiaResponse bestVoucher = null;
            BigDecimal maxDiscount = BigDecimal.ZERO;

            for (Future<Map.Entry<PhieuGiamGiaResponse, BigDecimal>> future : futures) {
                Map.Entry<PhieuGiamGiaResponse, BigDecimal> result = future.get();
                if (result.getValue().compareTo(maxDiscount) > 0) {
                    maxDiscount = result.getValue();
                    bestVoucher = result.getKey();
                }
            }

            executorService.shutdown();

            if (bestVoucher == null) {
                log.warn("Không tìm thấy voucher hợp lệ để áp dụng cho hóa đơn {}", hoaDonId);
                return hoaDonMapper.entityToResponse(hoaDon);
            }

            // Áp dụng voucher tốt nhất ngay lập tức
            PhieuGiamGia voucherEntity = phieuGiamGiaHoaDonServiceImpl.validateAndGet(bestVoucher.getId());
            hoaDon.setPhieuGiamGia(voucherEntity);
            voucherEntity.setSoLuong(voucherEntity.getSoLuong() - 1);

            //Tính lại tổng tiền
            recalculateTotal(hoaDon);
            log.info("New total after applying best voucher: {}", hoaDon.getTongTien());

            //Lưu thay đổi
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            log.info("Successfully saved invoice with best voucher");

            return hoaDonMapper.entityToResponse(savedHoaDon);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            log.error("Lỗi khi áp dụng voucher bằng đa luồng: ", e);
            throw new RuntimeException("Lỗi khi áp dụng mã giảm giá.");
        }
    }


    private List<ThanhToanHoaDon> phuongThucThanhToan(HoaDonRequest request, HoaDon hoaDon) {
        if (request.getPhuongThucThanhToans() == null || request.getPhuongThucThanhToans().isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một phương thức thanh toán.");
        }
        return request.getPhuongThucThanhToans().stream()
                .map(maPhuongThuc -> {
                    PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository.findByMaPhuongThucThanhToan(maPhuongThuc)
                            .orElseThrow(() -> new IllegalArgumentException("Phương thức thanh toán không hợp lệ: " + maPhuongThuc));

                    // Tạo đối tượng ThanhToanHoaDon từ PhuongThucThanhToan và HoaDon
                    ThanhToanHoaDon thanhToanHoaDon = hoaDonMapper.mapPhuongThucThanhToan(phuongThuc, hoaDon);

                    // Đặt ngày tạo cho phương thức thanh toán
                    thanhToanHoaDon.setNgayTao(LocalDateTime.now());

                    return thanhToanHoaDon;
                })
                .collect(Collectors.toList());
    }


    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0đ";
        return String.format("%,d đ", amount.longValue());
    }


    private String generateMaHoaDon() { // Tạo chuỗi ngẫu nhiên 6 ký tự số
        String randomNumbers = String.format("%06d", new Random().nextInt(1000000));
        return "HD" + randomNumbers;
    }

    private BigDecimal calculateDiscountValue(PhieuGiamGiaResponse voucher, BigDecimal totalAmount) {
        if (voucher.getLoaiPhieuGiamGia() == 1) { // Giảm theo phần trăm
            return totalAmount.multiply(voucher.getGiaTriGiam()).divide(BigDecimal.valueOf(100));
        } else { // Giảm số tiền cố định
            return voucher.getGiaTriGiam();
        }
    }

    private BigDecimal calculateSubtotal(HoaDon hoaDon) {
        return hoaDon.getHoaDonChiTiets().stream()
                .filter(ct -> ct.getTrangThai() == 1) // Chỉ tính các sản phẩm active
                .map(ct -> ct.getSanPhamChiTiet().getGia()
                        .multiply(BigDecimal.valueOf(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
}