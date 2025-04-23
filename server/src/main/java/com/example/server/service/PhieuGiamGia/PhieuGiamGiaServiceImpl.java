package com.example.server.service.PhieuGiamGia;

import com.example.server.dto.PhieuGiamGia.CreatePhieuGiamGiaRequest;
import com.example.server.dto.PhieuGiamGia.PhieuGiamGiaDTO;
import com.example.server.dto.PhieuGiamGia.UpdatePhieuGiamGiaRequest;
import com.example.server.entity.KhachHang;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.entity.PhieuGiamGiaKhachHang;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.PhieuGiamGiaKhachHangRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PhieuGiamGiaServiceImpl implements PhieuGiamGiaService {


    private final Logger logger = LoggerFactory.getLogger(PhieuGiamGiaService.class);
//    @Autowired
//    private SendGridEmailService emailService;

    @Autowired
    private PhieuGiamGiaRepository repository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private PhieuGiamGiaKhachHangRepository phieuGiamGiaKhachHangRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ModelMapper modelMapper;


    public PhieuGiamGiaDTO convertToDTO(PhieuGiamGia entity) {
        return modelMapper.map(entity, PhieuGiamGiaDTO.class);
    }

    @Override
    public List<PhieuGiamGiaDTO> getAll() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now();

        return repository.findAllSortedByNgayTao().stream()
                .map(entity -> {
                    updateTrangThai(entity, now);
                    return modelMapper.map(entity, PhieuGiamGiaDTO.class);
                })
                .collect(Collectors.toList());
    }


    @Override
    public PhieuGiamGiaDTO getById(String id) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now();

        return repository.findById(id)
                .map(entity -> {
                    updateTrangThai(entity, now);
                    return modelMapper.map(entity, PhieuGiamGiaDTO.class);
                })
                .orElse(null);
    }

    @Override
    public List<PhieuGiamGiaDTO> getActivePhieuGiamGia() {
        return repository.findByTrangThai(1)
                .stream()
                .map(PhieuGiamGiaDTO::new) // Sử dụng constructor mới
                .collect(Collectors.toList());
    }

    private void updateTrangThai(PhieuGiamGia phieuGiamGia, LocalDateTime now) {
        LocalDateTime ngayBatDau = phieuGiamGia.getNgayBatDau();
        LocalDateTime ngayKetThuc = phieuGiamGia.getNgayKetThuc();
        int oldTrangThai = phieuGiamGia.getTrangThai();

        if (phieuGiamGia.getSoLuong() <= 0) {
            phieuGiamGia.setTrangThai(2); // Ngừng hoạt động nếu số lượng về 0
        } else if (now.isBefore(ngayBatDau)) {
            phieuGiamGia.setTrangThai(3); // Sắp diễn ra
        } else if (now.isAfter(ngayKetThuc)) {
            phieuGiamGia.setTrangThai(2); // Ngừng hoạt động
        } else {
            phieuGiamGia.setTrangThai(1); // Đang hoạt động
        }

        // Nếu trạng thái thay đổi và là phiếu cá nhân, cập nhật PhieuGiamGiaKhachHang
        if (oldTrangThai != phieuGiamGia.getTrangThai() && phieuGiamGia.getKieuGiamGia() == 2) {
            List<PhieuGiamGiaKhachHang> pggKhachHangs = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(phieuGiamGia.getId());
            for (PhieuGiamGiaKhachHang pggKhachHang : pggKhachHangs) {
                if (phieuGiamGia.getTrangThai() == 2) {
                    pggKhachHang.setTrangThai(false); // Đánh dấu đã hết hạn hoặc không khả dụng
                }
                phieuGiamGiaKhachHangRepository.save(pggKhachHang);
            }
        }

        repository.save(phieuGiamGia);
    }

    @Override
    public String getDiscountInfo(String maPhieuGiamGia) {
        PhieuGiamGia phieuGiamGia = repository.findByMaPhieuGiamGiaAndTrangThai(maPhieuGiamGia, 1)
                .orElseThrow(() -> new IllegalArgumentException("Phiếu giảm giá không hợp lệ hoặc đã hết hạn."));

        return String.format(
                "Giảm %,d%% với đơn hàng tối thiểu %,d VND và không vượt quá %,d VND.",
                phieuGiamGia.getGiaTriGiam(),
                phieuGiamGia.getGiaTriToiThieu(),
                phieuGiamGia.getSoTienGiamToiDa());
    }


    @Override
    @Transactional
    public double applyDiscount(String maPhieuGiamGia, double tongGiaTriDonHang) {
        // Tìm và kiểm tra phiếu giảm giá
        PhieuGiamGia phieuGiamGia = repository.findByMaPhieuGiamGiaAndTrangThai(maPhieuGiamGia, 1)
                .orElseThrow(() -> new IllegalArgumentException("Phiếu giảm giá không hợp lệ hoặc đã hết hạn."));

        // Kiểm tra số lượng
        if (phieuGiamGia.getSoLuong() <= 0) {
            phieuGiamGia.setTrangThai(2); // Ngừng hoạt động
            repository.save(phieuGiamGia);
            throw new IllegalArgumentException("Phiếu giảm giá đã hết số lượng.");
        }

        // Kiểm tra giá trị tối thiểu
        if (tongGiaTriDonHang < phieuGiamGia.getGiaTriToiThieu().doubleValue()) {
            throw new IllegalArgumentException(String.format(
                    "Đơn hàng cần đạt tối thiểu %.2f VND để áp dụng phiếu giảm giá.",
                    phieuGiamGia.getGiaTriToiThieu()
            ));
        }

        // Tính giá trị giảm
        double giaTriGiam = phieuGiamGia.getKieuGiamGia() == 1
                ? tongGiaTriDonHang * phieuGiamGia.getGiaTriGiam().doubleValue() / 100
                : phieuGiamGia.getGiaTriGiam().doubleValue();

        // Kiểm tra giới hạn giảm tối đa
        if (phieuGiamGia.getSoTienGiamToiDa() != null && giaTriGiam > phieuGiamGia.getSoTienGiamToiDa().doubleValue()) {
            giaTriGiam = phieuGiamGia.getSoTienGiamToiDa().doubleValue();
        }

        return giaTriGiam;
    }


    @Override
    @Transactional
    public PhieuGiamGiaDTO addPhieuGiamGia(CreatePhieuGiamGiaRequest request) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        Clock clock = Clock.system(zoneId);
        LocalDateTime now = LocalDateTime.now(clock);

        LocalDateTime ngayBatDauRaw = request.getNgayBatDau();
        LocalDateTime ngayKetThucRaw = request.getNgayKetThuc();

// Chuyển đổi sang ZonedDateTime theo múi giờ Asia/Ho_Chi_Minh
        ZonedDateTime ngayBatDau = ngayBatDauRaw.atZone(ZoneId.of("UTC")).withZoneSameInstant(zoneId);
        ZonedDateTime ngayKetThuc = ngayKetThucRaw.atZone(ZoneId.of("UTC")).withZoneSameInstant(zoneId);
        ZonedDateTime nowZoned = now.atZone(zoneId);

        // Kiểm tra logic thời gian
        if (request.getNgayBatDau().isAfter(request.getNgayKetThuc())) {
            throw new IllegalArgumentException("Thời gian bắt đầu không thể sau thời gian kết thúc.");
        }
//        if (request.getNgayBatDau().isBefore(now)) {
//            throw new IllegalArgumentException("Ngày bắt đầu không được là ngày trong quá khứ.");
//        }

        // Kiểm tra giá trị giảm
        if (request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        }
        if (request.getLoaiPhieuGiamGia() == 1 && request.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Giá trị giảm phần trăm không được vượt quá 100%.");
        }

        // Kiểm tra các giá trị khác
        if (request.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) <= 0 ||
                request.getGiaTriToiThieu().compareTo(BigDecimal.ZERO) <= 0 ||
                request.getSoLuong() <= 0) {
            throw new IllegalArgumentException("Giá trị nhập vào phải lớn hơn 0.");
        }

        // Kiểm tra danh sách khách hàng nếu là phiếu cá nhân
        if (request.getKieuGiamGia() == 2 && (request.getIdKhachHang() == null || request.getIdKhachHang().isEmpty())) {
            throw new IllegalArgumentException("Danh sách khách hàng không được để trống cho phiếu giảm giá cá nhân.");
        }

        // Tạo phiếu giảm giá
        PhieuGiamGia phieuGiamGia = new PhieuGiamGia();
        phieuGiamGia.setId(UUID.randomUUID().toString());

        // Tạo mã phiếu giảm giá duy nhất
        synchronized (this) {
            if (request.getMaPhieuGiamGia() == null || request.getMaPhieuGiamGia().isEmpty()) {
                String generatedCode;
                do {
                    generatedCode = "PGG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                } while (repository.existsByMaPhieuGiamGia(generatedCode));
                phieuGiamGia.setMaPhieuGiamGia(generatedCode);
            } else {
                if (repository.existsByMaPhieuGiamGia(request.getMaPhieuGiamGia())) {
                    throw new IllegalArgumentException("Mã phiếu giảm giá đã tồn tại!");
                }
                phieuGiamGia.setMaPhieuGiamGia(request.getMaPhieuGiamGia());
            }
        }

        // Set thông tin phiếu giảm giá
        phieuGiamGia.setTenPhieuGiamGia(request.getTenPhieuGiamGia());
        phieuGiamGia.setGiaTriGiam(request.getGiaTriGiam());
        phieuGiamGia.setGiaTriToiThieu(request.getGiaTriToiThieu());
        phieuGiamGia.setKieuGiamGia(request.getKieuGiamGia());
        phieuGiamGia.setSoTienGiamToiDa(request.getSoTienGiamToiDa());
        phieuGiamGia.setLoaiPhieuGiamGia(request.getLoaiPhieuGiamGia());
        phieuGiamGia.setSoLuong(request.getSoLuong());
        phieuGiamGia.setMoTa(request.getMoTa());


        phieuGiamGia.setNgayBatDau(ngayBatDau.toLocalDateTime());
        phieuGiamGia.setNgayKetThuc(ngayKetThuc.toLocalDateTime());
        // Cập nhật trạng thái
        // Kiểm tra trạng thái đúng múi giờ
        int trangThai;
        if (nowZoned.isBefore(ngayBatDau)) {
            trangThai = 3; // Chưa bắt đầu
        } else if (nowZoned.isAfter(ngayKetThuc)) {
            trangThai = 2; // Đã kết thúc
        } else {
            trangThai = 1; // Đang diễn ra
        }

        phieuGiamGia.setTrangThai(trangThai);
        // Lưu vào database
//        phieuGiamGia = repository.save(phieuGiamGia);

        // Nếu là phiếu cá nhân, lưu thông tin khách hàng và gửi email
        if (request.getKieuGiamGia() == 2) {
            if (request.getIdKhachHang() == null || request.getIdKhachHang().isEmpty()) {
                throw new IllegalArgumentException("Danh sách khách hàng không được để trống cho phiếu giảm giá cá nhân.");
            }
            List<KhachHang> khachHangs = khachHangRepository.findByIdIn(request.getIdKhachHang());
            phieuGiamGia.setSoLuong(khachHangs.size()); // Cập nhật số lượng phiếu theo số khách hàng
            phieuGiamGia = repository.save(phieuGiamGia); //
            for (KhachHang khachHang : khachHangs) {
                PhieuGiamGiaKhachHang pggKhachHang = new PhieuGiamGiaKhachHang();
                pggKhachHang.setKhachHang(khachHang);
                pggKhachHang.setPhieuGiamGia(phieuGiamGia);
                pggKhachHang.setTrangThai(true);
                pggKhachHang.setNgayTao(LocalDateTime.now(zoneId));
                phieuGiamGiaKhachHangRepository.save(pggKhachHang);

                // Gửi email bất đồng bộ
                sendEmailAsync(khachHang, phieuGiamGia);
            }
        }else {
            phieuGiamGia.setSoLuong(request.getSoLuong()); // Nếu không phải phiếu cá nhân, giữ số lượng mặc định
            phieuGiamGia = repository.save(phieuGiamGia);
        }

        return modelMapper.map(phieuGiamGia, PhieuGiamGiaDTO.class);
    }
    @Async("emailTaskExecutor")
    public void sendEmailAsync(KhachHang khachHang, PhieuGiamGia phieuGiamGia) {
        try {
            // Định dạng ngày giờ cho múi giờ Việt Nam
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
                    .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
            String ngayBatDauFormatted = phieuGiamGia.getNgayBatDau()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String ngayKetThucFormatted = phieuGiamGia.getNgayKetThuc()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);

            // Tải mẫu HTML từ tệp tài nguyên
            String htmlContent = new String(Files.readAllBytes(
                    Paths.get(getClass().getResource("/templates/email/voucher.html").toURI())));

            // Định dạng giá trị giảm giá dựa trên loại phiếu
            String giaTriGiam = phieuGiamGia.getLoaiPhieuGiamGia() == 1
                    ? phieuGiamGia.getGiaTriGiam().toString() + "%"
                    : phieuGiamGia.getGiaTriGiam().toString() + " VNĐ";

            // Thay thế các placeholder
            htmlContent = htmlContent
                    .replace("{{tenKhachHang}}", khachHang.getTenKhachHang() != null ? khachHang.getTenKhachHang() : "")
                    .replace("{{tenPhieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia() != null ? phieuGiamGia.getTenPhieuGiamGia() : "")
                    .replace("{{giaTriGiam}}", giaTriGiam)
                    .replace("{{giaTriToiDa}}", phieuGiamGia.getSoTienGiamToiDa() != null ? phieuGiamGia.getSoTienGiamToiDa().toString() + " VNĐ" : "0 VNĐ")
                    .replace("{{maPhieuGiamGia}}", phieuGiamGia.getMaPhieuGiamGia() != null ? phieuGiamGia.getMaPhieuGiamGia() : "")
                    .replace("{{ngayBatDau}}", ngayBatDauFormatted)
                    .replace("{{ngayKetThuc}}", ngayKetThucFormatted)
                    .replace("{{giaTriToiThieu}}", phieuGiamGia.getGiaTriToiThieu() != null ? phieuGiamGia.getGiaTriToiThieu().toString() + " VNĐ" : "0 VNĐ");

            // Gửi email HTML
            sendHtmlEmail(khachHang.getEmail(), "Phiếu Giảm Giá Cá Nhân từ 4bee", htmlContent);

            logger.info("Gửi email thành công tới {}", khachHang.getEmail());

        } catch (Exception e) {
            logger.error("Lỗi khi gửi email tới {}: {}", khachHang.getEmail(), e.getMessage(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }


    // Lấy danh sách khách hàng theo mã phiếu giảm giá
    public List<KhachHang> getKhachHangByMaPhieuGiamGia(String maPhieuGiamGia) {
        // Gọi phương thức trong repository để lấy danh sách khách hàng
        return phieuGiamGiaKhachHangRepository.findKhachHangByMaPhieuGiamGia(maPhieuGiamGia);
    }

    // Hủy phiếu giảm giá cho một khách hàng
    public void cancelPhieuGiamGiaForCustomer(String maPhieuGiamGia, String maKhachHang) {
        // Xoá khách hàng khỏi phiếu giảm giá bằng mã phiếu giảm giá và mã khách hàng
        phieuGiamGiaKhachHangRepository.deleteByMaPhieuGiamGiaAndKhachHangId(maPhieuGiamGia, maKhachHang);
    }




    @Transactional
    @Override
    public PhieuGiamGiaDTO update(UpdatePhieuGiamGiaRequest request, String id) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);

        // Tìm phiếu giảm giá
        PhieuGiamGia existingEntity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phiếu giảm giá không tồn tại"));

        // Kiểm tra xem phiếu đã được sử dụng chưa
        if (hoaDonRepository.existsByIdPhieuGiamGia(id)) {
            logger.warn("Không thể cập nhật phiếu giảm giá [{}] vì đã được sử dụng.", existingEntity.getMaPhieuGiamGia());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể cập nhật phiếu giảm giá vì phiếu này đã được sử dụng.");
        }

        // Lưu trạng thái cũ để kiểm tra thay đổi
        PhieuGiamGia oldEntity = new PhieuGiamGia();
        BeanUtils.copyProperties(existingEntity, oldEntity);

        // Kiểm tra logic hợp lệ
        validateRequest(request);

        // Cập nhật thông tin phiếu giảm giá
        updatePhieuGiamGia(existingEntity, request);

        // Kiểm tra thay đổi và gửi email nếu cần
        boolean hasUpdates = hasChanges(oldEntity, existingEntity);

        if (hasUpdates) {
            List<KhachHang> allCustomers = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(existingEntity.getId())
                    .stream()
                    .map(PhieuGiamGiaKhachHang::getKhachHang)
                    .collect(Collectors.toList());

            allCustomers.forEach(khachHang -> sendEmailUpdateAsync(khachHang, existingEntity, oldEntity));
        }

        // Danh sách khách hàng hiện có trong phiếu
        Set<String> existingCustomerIds = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(existingEntity.getId())
                .stream()
                .map(kh -> kh.getKhachHang().getId())
                .collect(Collectors.toSet());

        // Danh sách khách hàng được chọn mới từ request
        Set<String> newCustomerIds = request.getKhachHangsToAdd() != null ? new HashSet<>(request.getKhachHangsToAdd()) : new HashSet<>();

        // Thêm khách hàng mới vào phiếu
        List<PhieuGiamGiaKhachHang> newEntries = newCustomerIds.stream()
                .filter(idKH -> !existingCustomerIds.contains(idKH))
                .map(idKH -> {
                    PhieuGiamGiaKhachHang newEntry = new PhieuGiamGiaKhachHang();
                    newEntry.setId(UUID.randomUUID().toString());
                    newEntry.setPhieuGiamGia(existingEntity);
                    newEntry.setKhachHang(khachHangRepository.findById(idKH)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại")));
                    newEntry.setTrangThai(true);
                    newEntry.setNgayTao(now);
                    newEntry.setNguoiTao("admin");
                    return newEntry;
                })
                .collect(Collectors.toList());

        phieuGiamGiaKhachHangRepository.saveAll(newEntries);

        // Xử lý khách hàng bị hủy nếu có
        if (request.getKhachHangsToCancel() != null && !request.getKhachHangsToCancel().isEmpty()) {
            handleCustomerCancellation(existingEntity, request.getKhachHangsToCancel());

            // Gửi email thông báo hủy
            List<KhachHang> customersToCancel = khachHangRepository.findByIdIn(request.getKhachHangsToCancel());
            customersToCancel.forEach(customer -> sendEmailCancellationAsync(customer, existingEntity));
        }

        // Cập nhật lại số lượng phiếu
        if (existingEntity.getKieuGiamGia() == 2) {
            existingEntity.setSoLuong((int) phieuGiamGiaKhachHangRepository.countByPhieuGiamGiaId(existingEntity.getId()));
        }

        repository.save(existingEntity);
        return convertToDTO(existingEntity);
    }
    @Transactional
    public void addCustomerToPhieuGiamGia(String phieuGiamGiaId, List<String> khachHangIds) {
        PhieuGiamGia phieuGiamGia = repository.findById(phieuGiamGiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phiếu giảm giá không tồn tại"));

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        for (String customerId : khachHangIds) {
            Optional<PhieuGiamGiaKhachHang> existingEntry = phieuGiamGiaKhachHangRepository
                    .findByPhieuGiamGiaIdAndKhachHangId(phieuGiamGiaId, customerId);

            KhachHang khachHang = khachHangRepository.findById(customerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));

            if (existingEntry.isPresent()) {
                PhieuGiamGiaKhachHang entry = existingEntry.get();
                entry.setTrangThai(true);
                entry.setNgaySua(now);
                entry.setNguoiSua("admin");
                phieuGiamGiaKhachHangRepository.save(entry);
            } else {
                PhieuGiamGiaKhachHang newEntry = new PhieuGiamGiaKhachHang();
                newEntry.setId(UUID.randomUUID().toString());
                newEntry.setPhieuGiamGia(phieuGiamGia);
                newEntry.setKhachHang(khachHang);
                newEntry.setTrangThai(true);
                newEntry.setNgayTao(now);
                newEntry.setNguoiTao("admin");

                phieuGiamGiaKhachHangRepository.save(newEntry);
            }

            // Gửi email sau khi thêm khách hàng
            sendEmailToCustomer(khachHang, phieuGiamGia);
        }

        // Cập nhật số lượng nếu phiếu giảm giá kiểu số lượng
        if (phieuGiamGia.getKieuGiamGia() == 2) {
            long totalCustomers = phieuGiamGiaKhachHangRepository.countByPhieuGiamGiaId(phieuGiamGiaId);
            phieuGiamGia.setSoLuong((int) totalCustomers);
            repository.save(phieuGiamGia);
        }
    }



    @Async("emailTaskExecutor")
    public void sendEmailToCustomer(KhachHang khachHang, PhieuGiamGia phieuGiamGia) {
        try {
            // Định dạng ngày giờ cho múi giờ Việt Nam
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
                    .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
            String ngayBatDauFormatted = phieuGiamGia.getNgayBatDau()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String ngayKetThucFormatted = phieuGiamGia.getNgayKetThuc()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);

            // Tải mẫu HTML từ tệp tài nguyên
            String htmlContent = new String(Files.readAllBytes(
                    Paths.get(getClass().getResource("/templates/email/voucher.html").toURI())));

            // Định dạng giá trị giảm giá dựa trên loại phiếu
            String giaTriGiam = phieuGiamGia.getLoaiPhieuGiamGia() == 1
                    ? phieuGiamGia.getGiaTriGiam().toString() + "%"
                    : phieuGiamGia.getGiaTriGiam().toString() + " VNĐ";

            // Thay thế các placeholder
            htmlContent = htmlContent
                    .replace("{{tenKhachHang}}", khachHang.getTenKhachHang() != null ? khachHang.getTenKhachHang() : "")
                    .replace("{{tenPhieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia() != null ? phieuGiamGia.getTenPhieuGiamGia() : "")
                    .replace("{{giaTriGiam}}", giaTriGiam)
                    .replace("{{giaTriToiDa}}", phieuGiamGia.getSoTienGiamToiDa() != null ? phieuGiamGia.getSoTienGiamToiDa().toString() + " VNĐ" : "0 VNĐ")
                    .replace("{{maPhieuGiamGia}}", phieuGiamGia.getMaPhieuGiamGia() != null ? phieuGiamGia.getMaPhieuGiamGia() : "")
                    .replace("{{ngayBatDau}}", ngayBatDauFormatted)
                    .replace("{{ngayKetThuc}}", ngayKetThucFormatted)
                    .replace("{{giaTriToiThieu}}", phieuGiamGia.getGiaTriToiThieu() != null ? phieuGiamGia.getGiaTriToiThieu().toString() + " VNĐ" : "0 VNĐ");

            // Gửi email HTML
            sendHtmlEmail2(khachHang.getEmail(), "Phiếu Giảm Giá Cá Nhân từ 4bee", htmlContent);

            logger.info("Gửi email thành công tới {}", khachHang.getEmail());

        } catch (Exception e) {
            logger.error("Lỗi khi gửi email tới {}: {}", khachHang.getEmail(), e.getMessage(), e);
        }
    }

    private void sendHtmlEmail2(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }




    @Transactional
    public void removeCustomerFromPhieuGiamGia(String phieuGiamGiaId, String khachHangId) {
        PhieuGiamGia phieuGiamGia = repository.findById(phieuGiamGiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phiếu giảm giá không tồn tại"));

        PhieuGiamGiaKhachHang phieuGiamGiaKhachHang = phieuGiamGiaKhachHangRepository
                .findByPhieuGiamGiaIdAndKhachHangId(phieuGiamGiaId, khachHangId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không có trong phiếu"));
        // Lấy thông tin khách hàng trước khi cập nhật trạng thái
        KhachHang khachHang = phieuGiamGiaKhachHang.getKhachHang();
        // Xóa hoàn toàn thay vì đánh dấu trạng thái
        phieuGiamGiaKhachHangRepository.delete(phieuGiamGiaKhachHang);

        // Giảm số lượng phiếu nếu là giảm giá cá nhân
        if (phieuGiamGia.getKieuGiamGia() == 2 && phieuGiamGia.getSoLuong() > 0) {
            phieuGiamGia.setSoLuong(phieuGiamGia.getSoLuong() - 1);
            repository.save(phieuGiamGia);
        }
        sendEmailRemovelationAsync(khachHang, phieuGiamGia);
    }

    @Async("emailTaskExecutor")
    public void sendEmailRemovelationAsync(KhachHang khachHang, PhieuGiamGia phieuGiamGia) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Thông báo: Mã giảm giá của bạn đã bị hủy");

            String htmlContent = """
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #ff0000;">Xin chào {{tenKhachHang}},</h2>
                <p>Chúng tôi xin thông báo rằng mã giảm giá của bạn đã bị hủy:</p>
                <p><strong>Mã giảm giá:</strong> {{tenPhieuGiamGia}}</p>
                <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
                <p style="color: #6c757d; font-size: 0.9em;">Trân trọng,<br>Đội ngũ hỗ trợ</p>
            </div>
        """;

            // Thay thế placeholder bằng thông tin thực tế
            htmlContent = htmlContent.replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{tenPhieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia());

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            logger.info("Đã gửi email thông báo hủy mã giảm giá [{}] tới khách hàng [{}] - [{}]",
                    phieuGiamGia.getMaPhieuGiamGia(), khachHang.getId(), khachHang.getEmail());

        } catch (Exception e) {
            logger.error("Lỗi gửi email hủy mã giảm giá: {}", e.getMessage());
        }
    }





    private void updatePhieuGiamGia(PhieuGiamGia ph, UpdatePhieuGiamGiaRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request không được null");
        }

        if (request.getTenPhieuGiamGia() != null) ph.setTenPhieuGiamGia(request.getTenPhieuGiamGia());
        if (request.getGiaTriGiam() != null) ph.setGiaTriGiam(request.getGiaTriGiam());
        if (request.getNgayBatDau() != null) ph.setNgayBatDau(request.getNgayBatDau());
        if (request.getNgayKetThuc() != null) ph.setNgayKetThuc(request.getNgayKetThuc());
        if (request.getSoLuong() != null) ph.setSoLuong(request.getSoLuong());
        if (request.getTrangThai() != null) ph.setTrangThai(request.getTrangThai());
        if (request.getMoTa() != null) ph.setMoTa(request.getMoTa());

        // Đồng bộ trạng thái với PhieuGiamGiaKhachHang nếu là phiếu cá nhân
        if (ph.getKieuGiamGia() == 2 && (ph.getTrangThai() == 2 || (ph.getNgayKetThuc() != null && ph.getNgayKetThuc().isBefore(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))))) {
            List<PhieuGiamGiaKhachHang> pggKhachHangs = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(ph.getId());
            for (PhieuGiamGiaKhachHang pggKhachHang : pggKhachHangs) {
                pggKhachHang.setTrangThai(false); // Không khả dụng
                phieuGiamGiaKhachHangRepository.save(pggKhachHang);
            }
        }

        repository.save(ph);
    }





    private void validateRequest(UpdatePhieuGiamGiaRequest request) {
        if (Objects.nonNull(request.getNgayBatDau()) && Objects.nonNull(request.getNgayKetThuc())
                && request.getNgayBatDau().isAfter(request.getNgayKetThuc())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu không thể sau thời gian kết thúc.");
        }

        if (Objects.nonNull(request.getGiaTriGiam()) && request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị giảm phải lớn hơn 0.");
        }

        if (Objects.equals(request.getLoaiPhieuGiamGia(), 1) && Objects.nonNull(request.getGiaTriGiam())
                && request.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị giảm phần trăm không được vượt quá 100%.");
        }

        if (Objects.nonNull(request.getSoTienGiamToiDa()) && request.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền giảm tối đa phải lớn hơn 0.");
        }

        if (Objects.nonNull(request.getGiaTriToiThieu()) && request.getGiaTriToiThieu().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị tối thiểu phải lớn hơn 0.");
        }

        if (Objects.nonNull(request.getSoLuong()) && request.getSoLuong() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng phiếu phải lớn hơn 0.");
        }
    }



    private boolean hasChanges(PhieuGiamGia oldEntity, PhieuGiamGia newEntity) {
        return !Objects.equals(oldEntity.getTenPhieuGiamGia(), newEntity.getTenPhieuGiamGia())
                || !Objects.equals(oldEntity.getGiaTriGiam(), newEntity.getGiaTriGiam())
                || !Objects.equals(oldEntity.getNgayBatDau(), newEntity.getNgayBatDau())
                || !Objects.equals(oldEntity.getNgayKetThuc(), newEntity.getNgayKetThuc())
                || !Objects.equals(oldEntity.getSoLuong(), newEntity.getSoLuong())
                || !Objects.equals(oldEntity.getTrangThai(), newEntity.getTrangThai())
                || !Objects.equals(oldEntity.getMoTa(), newEntity.getMoTa());
    }

    private void handleCustomerCancellation(PhieuGiamGia existingEntity, List<String> customerIdsToCancel) {
        // Cập nhật lại số lượng phiếu và hủy khách hàng trong cơ sở dữ liệu
        List<KhachHang> customersToCancel = khachHangRepository.findAllById(customerIdsToCancel);

        customersToCancel.forEach(khachHang -> {
            // Cập nhật số lượng phiếu giảm giá
            existingEntity.setSoLuong(existingEntity.getSoLuong() - 1);
            phieuGiamGiaKhachHangRepository.deleteByPhieuGiamGiaIdAndKhachHangId(existingEntity.getId(), khachHang.getId());
        });

        repository.save(existingEntity); // Lưu lại phiếu sau khi hủy khách hàng
    }

    @Async("emailTaskExecutor")
    public void sendEmailUpdateAsync(KhachHang khachHang, PhieuGiamGia newEntity, PhieuGiamGia oldEntity) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Cập nhật phiếu giảm giá");

            String changes = getChangesDescription(oldEntity, newEntity);

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Chào {{tenKhachHang}},</h2>
                    <p>Phiếu giảm giá của bạn đã được cập nhật với các thay đổi sau:</p>
                    <p>{{changes}}</p>
                    <p>Vui lòng kiểm tra lại thông tin.</p>
                    <p style="color: #6c757d; font-size: 0.9em;">Trân trọng,<br>Đội ngũ hỗ trợ</p>
                </div>
                """;

            htmlContent = htmlContent.replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{changes}}", changes);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            logger.info("Đã gửi email cập nhật phiếu giảm giá [{}] tới khách hàng [{}] - [{}]",
                    newEntity.getMaPhieuGiamGia(), khachHang.getId(), khachHang.getEmail());

        } catch (Exception e) {
            logger.error("Lỗi gửi email cập nhật: {}", e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendEmailCancellationAsync(KhachHang khachHang, PhieuGiamGia phieuGiamGia) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Thông báo hủy phiếu giảm giá");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #dc3545;">Chào {{tenKhachHang}},</h2>
                    <p>Rất tiếc phải thông báo rằng phiếu giảm giá của bạn đã bị hủy bỏ.</p>
                    <p>Phiếu giảm giá: {{phieuGiamGia}} đã không còn hiệu lực với bạn.</p>
                    <p style="color: #6c757d; font-size: 0.9em;">Trân trọng,<br>Đội ngũ hỗ trợ</p>
                </div>
                """;

            htmlContent = htmlContent.replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{phieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia());

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            logger.info("Đã gửi email hủy phiếu giảm giá [{}] tới khách hàng [{}] - [{}]",
                    phieuGiamGia.getMaPhieuGiamGia(), khachHang.getId(), khachHang.getEmail());

        } catch (Exception e) {
            logger.error("Lỗi gửi email hủy phiếu: {}", e.getMessage());
        }
    }

    private String getChangesDescription(PhieuGiamGia oldEntity, PhieuGiamGia newEntity) {
        StringBuilder changes = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

        if (!Objects.equals(oldEntity.getTenPhieuGiamGia(), newEntity.getTenPhieuGiamGia())) {
            changes.append("Tên phiếu giảm giá: ").append(oldEntity.getTenPhieuGiamGia())
                    .append(" -> ").append(newEntity.getTenPhieuGiamGia()).append("<br>");
        }

        if (!Objects.equals(oldEntity.getGiaTriGiam(), newEntity.getGiaTriGiam())) {
            changes.append("Giá trị giảm: ").append(oldEntity.getGiaTriGiam())
                    .append(" -> ").append(newEntity.getGiaTriGiam()).append("<br>");
        }

        if (!Objects.equals(oldEntity.getNgayBatDau(), newEntity.getNgayBatDau())) {
            changes.append("Ngày bắt đầu: ").append(formatter.format(oldEntity.getNgayBatDau()))
                    .append(" -> ").append(formatter.format(newEntity.getNgayBatDau())).append("<br>");
        }

        if (!Objects.equals(oldEntity.getNgayKetThuc(), newEntity.getNgayKetThuc())) {
            changes.append("Ngày kết thúc: ").append(formatter.format(oldEntity.getNgayKetThuc()))
                    .append(" -> ").append(formatter.format(newEntity.getNgayKetThuc())).append("<br>");
        }

        if (!Objects.equals(oldEntity.getSoLuong(), newEntity.getSoLuong())) {
            changes.append("Số lượng: ").append(oldEntity.getSoLuong())
                    .append(" -> ").append(newEntity.getSoLuong()).append("<br>");
        }

        if (!Objects.equals(oldEntity.getTrangThai(), newEntity.getTrangThai())) {
            changes.append("Trạng thái: ").append(oldEntity.getTrangThai())
                    .append(" -> ").append(newEntity.getTrangThai()).append("<br>");
        }

        return changes.toString();
    }


    @Override
    public Page<PhieuGiamGiaDTO> getAllWithPagination(Pageable pageable) {
        return repository.findAll(pageable)
                .map(entity -> modelMapper.map(entity, PhieuGiamGiaDTO.class));
    }


    @Override
    public void deleteById(String id) {
        PhieuGiamGia entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phiếu giảm giá không tồn tại"));
        entity.setTrangThai(2);
        repository.save(entity);
    }


    @Override
    public List<PhieuGiamGia> getAllPhieuCongKhai() {
        return repository.findAllCongKhai();
    }

    @Override
    public List<PhieuGiamGia> getAllPhieuCaNhan(String email) {
        return repository.findAllCaNhan(email);
    }


    @Scheduled(fixedRate = 60000)
    @Transactional
    public void syncPhieuGiamGiaKhachHangStatus() {
        Logger logger = LoggerFactory.getLogger(this.getClass());
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);
        logger.info("Thời gian hiện tại: {}", now);

        // Lấy tất cả phiếu giảm giá (không lọc trạng thái ban đầu)
        List<PhieuGiamGia> allVouchers = repository.findAll();
        logger.info("Số phiếu tìm thấy: {}", allVouchers.size());

        for (PhieuGiamGia phieu : allVouchers) {
            LocalDateTime ngayBatDau = phieu.getNgayBatDau();
            LocalDateTime ngayKetThuc = phieu.getNgayKetThuc();
            int oldTrangThai = phieu.getTrangThai();

            // Cập nhật trạng thái
            if (phieu.getSoLuong() <= 0) {
                phieu.setTrangThai(2);
            } else if (now.isBefore(ngayBatDau)) {
                phieu.setTrangThai(3);
            } else if (now.isAfter(ngayKetThuc)) {
                phieu.setTrangThai(2);
            } else {
                phieu.setTrangThai(1);
            }

            // Nếu trạng thái thay đổi, đồng bộ PhieuGiamGiaKhachHang
            if (oldTrangThai != phieu.getTrangThai()) {
                logger.info("Cập nhật trạng thái phiếu {}: {} -> {}",
                        phieu.getMaPhieuGiamGia(), oldTrangThai, phieu.getTrangThai());
                List<PhieuGiamGiaKhachHang> pggKhachHangs = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(phieu.getId());
                if (!pggKhachHangs.isEmpty()) {
                    pggKhachHangs.forEach(pgg -> pgg.setTrangThai(phieu.getTrangThai() == 1));
                    phieuGiamGiaKhachHangRepository.saveAll(pggKhachHangs);
                }
                repository.save(phieu);
            }
        }
        logger.info("Hoàn tất đồng bộ trạng thái.");
    }


}






