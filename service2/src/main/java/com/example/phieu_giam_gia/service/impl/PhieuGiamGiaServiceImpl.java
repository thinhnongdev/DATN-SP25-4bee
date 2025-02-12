package com.example.phieu_giam_gia.service.impl;

import com.example.phieu_giam_gia.dto.CreatePhieuGiamGiaRequest;
import com.example.phieu_giam_gia.dto.PhieuGiamGiaDTO;
import com.example.phieu_giam_gia.dto.UpdatePhieuGiamGiaRequest;
import com.example.phieu_giam_gia.entity.KhachHang;
import com.example.phieu_giam_gia.entity.PhieuGiamGia;
import com.example.phieu_giam_gia.entity.PhieuGiamGiaKhachHang;
import com.example.phieu_giam_gia.repository.KhachHangRepository;
import com.example.phieu_giam_gia.repository.PhieuGiamGiaKhachHangRepository;
import com.example.phieu_giam_gia.repository.PhieuGiamGiaRepository;
import com.example.phieu_giam_gia.service.PhieuGiamGiaService;
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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PhieuGiamGiaServiceImpl implements PhieuGiamGiaService {

    private final Logger logger = LoggerFactory.getLogger(PhieuGiamGiaService.class);

    @Autowired
    private PhieuGiamGiaRepository repository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private PhieuGiamGiaKhachHangRepository phieuGiamGiaKhachHangRepository;

    @Autowired
    private JavaMailSender mailSender;


    @Autowired
    private ModelMapper modelMapper;


    public PhieuGiamGiaDTO convertToDTO(PhieuGiamGia entity) {
        return modelMapper.map(entity, PhieuGiamGiaDTO.class);
    }

    @Override
    public List<PhieuGiamGiaDTO> getAll() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        Instant now = Instant.now();

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
        Instant now = Instant.now();

        return repository.findById(id)
                .map(entity -> {
                    updateTrangThai(entity, now);
                    return modelMapper.map(entity, PhieuGiamGiaDTO.class);
                })
                .orElse(null);
    }

    private void updateTrangThai(PhieuGiamGia phieuGiamGia, Instant now) {
        Instant ngayBatDau = phieuGiamGia.getNgayBatDau();
        Instant ngayKetThuc = phieuGiamGia.getNgayKetThuc();

        if (now.isBefore(ngayBatDau)) {
            phieuGiamGia.setTrangThai(3); // Sắp diễn ra
        } else if (now.isAfter(ngayKetThuc)) {
            phieuGiamGia.setTrangThai(2); // Ngừng hoạt động
        } else {
            phieuGiamGia.setTrangThai(1); // Đang hoạt động
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
        Clock clock = Clock.system(zoneId);  // Sử dụng Clock với ZoneId
        Instant now = Instant.now(clock);  // Lấy thời gian hiện tại
        Instant ngayBatDau = request.getNgayBatDau();
        Instant ngayKetThuc = request.getNgayKetThuc();


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
        phieuGiamGia.setNgayBatDau(request.getNgayBatDau());
        phieuGiamGia.setNgayKetThuc(request.getNgayKetThuc());
        phieuGiamGia.setMoTa(request.getMoTa());
        // Cập nhật trạng thái
        int trangThai = now.isBefore(request.getNgayBatDau()) ? 3 : (now.isAfter(request.getNgayKetThuc()) ? 2 : 1);
        phieuGiamGia.setTrangThai(trangThai); // Mặc định trạng thái kích hoạt

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
                pggKhachHang.setTrangThai(false);
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Thông báo phiếu giảm giá cá nhân");

            // Định dạng ngày đúng múi giờ
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
            String ngayKetThucFormatted = phieuGiamGia.getNgayKetThuc().atZone(ZoneId.systemDefault()).format(formatter);

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #007bff;">Chào {{tenKhachHang}},</h2>
                        <p>Bạn đã nhận được một <b>phiếu giảm giá</b> đặc biệt!</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background-color: #f8f9fa;">
                                <th style="text-align: left; padding: 10px;">Tên phiếu</th>
                                <td style="padding: 10px;">{{tenPhieuGiamGia}}</td>
                            </tr>
                            <tr style="background-color: #ffffff;">
                                <th style="text-align: left; padding: 10px;">Mã</th>
                                <td style="padding: 10px;">{{maPhieuGiamGia}}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <th style="text-align: left; padding: 10px;">Hạn sử dụng</th>
                                <td style="padding: 10px;">{{ngayKetThuc}}</td>
                            </tr>
                        </table>
                    </div>
                    """.replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{tenPhieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia())
                    .replace("{{maPhieuGiamGia}}", phieuGiamGia.getMaPhieuGiamGia())
                    .replace("{{ngayKetThuc}}", ngayKetThucFormatted);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.error("Lỗi gửi email: {}", e.getMessage());
        }
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

        PhieuGiamGia existingEntity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phiếu giảm giá không tồn tại"));

        // Lưu trạng thái cũ để kiểm tra thay đổi
        PhieuGiamGia oldEntity = new PhieuGiamGia();
        BeanUtils.copyProperties(existingEntity, oldEntity);

        // Kiểm tra logic hợp lệ
        validateRequest(request);

        // Cập nhật thông tin phiếu giảm giá
        updatePhieuGiamGia(existingEntity, request);

        // Kiểm tra thay đổi và gửi email
        if (hasChanges(oldEntity, existingEntity)) {
            List<KhachHang> allCustomers = phieuGiamGiaKhachHangRepository.findByPhieuGiamGiaId(existingEntity.getId())
                    .stream().map(PhieuGiamGiaKhachHang::getKhachHang)
                    .collect(Collectors.toList());

            // Gửi thông báo cho tất cả khách hàng
            allCustomers.forEach(khachHang -> sendEmailUpdateAsync(khachHang, existingEntity, oldEntity));

            // Cập nhật số lượng phiếu và hủy khách hàng nếu cần
            if (request.getKhachHangsToCancel() != null && !request.getKhachHangsToCancel().isEmpty()) {
                handleCustomerCancellation(existingEntity, request.getKhachHangsToCancel());

                // Gửi thông báo riêng cho khách hàng bị hủy
                request.getKhachHangsToCancel().forEach(khachHangId -> {
                    // Lấy khách hàng cần hủy từ repository bằng ID từ danh sách KhachHangsToCancel
                    KhachHang customerToCancel = khachHangRepository.findByIdIn(List.of(khachHangId))
                            .stream().findFirst()  // Chỉ lấy một khách hàng vì ID là duy nhất
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));

                    // Gửi email hủy cho khách hàng
                    sendEmailCancellationAsync(customerToCancel, existingEntity);
                });
            }

        }

        return convertToDTO(existingEntity);
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

    private void updatePhieuGiamGia(PhieuGiamGia existingEntity, UpdatePhieuGiamGiaRequest request) {
        existingEntity.setTenPhieuGiamGia(Objects.requireNonNullElse(request.getTenPhieuGiamGia(), existingEntity.getTenPhieuGiamGia()));
        existingEntity.setGiaTriGiam(Objects.requireNonNullElse(request.getGiaTriGiam(), existingEntity.getGiaTriGiam()));
        existingEntity.setNgayBatDau(Objects.requireNonNullElse(request.getNgayBatDau(), existingEntity.getNgayBatDau()));
        existingEntity.setNgayKetThuc(Objects.requireNonNullElse(request.getNgayKetThuc(), existingEntity.getNgayKetThuc()));
        existingEntity.setSoLuong(Objects.requireNonNullElse(request.getSoLuong(), existingEntity.getSoLuong()));
        existingEntity.setTrangThai(Objects.requireNonNullElse(request.getTrangThai(), existingEntity.getTrangThai()));
        existingEntity.setMoTa(Objects.requireNonNullElse(request.getMoTa(), existingEntity.getMoTa()));

        repository.save(existingEntity);
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


    // Phương thức tự động kiểm tra và đóng phiếu giảm giá hết hạn
    @Scheduled(cron = "0 * * * * *") // Chạy mỗi phút
    @Transactional
    public void checkAndUpdateExpiredCoupons() {
        logger.info("Bắt đầu kiểm tra và cập nhật trạng thái phiếu giảm giá...");

        Instant now = Instant.now();

        // Cập nhật phiếu giảm giá sắp diễn ra
        List<PhieuGiamGia> upcomingCoupons = repository.findAllByNgayKetThucBeforeAndTrangThai(now, 1);
        upcomingCoupons.forEach(phieu -> phieu.setTrangThai(3)); // Sắp diễn ra
        repository.saveAll(upcomingCoupons);

        // Cập nhật phiếu giảm giá hết hạn
        List<PhieuGiamGia> expiredCoupons = repository.findAllByNgayKetThucBeforeAndTrangThai(now, 1);
        expiredCoupons.forEach(phieu -> phieu.setTrangThai(2)); // Ngừng hoạt động
        repository.saveAll(expiredCoupons);

        logger.info("Đã cập nhật trạng thái của {} phiếu giảm giá.", (upcomingCoupons.size() + expiredCoupons.size()));
    }


}


