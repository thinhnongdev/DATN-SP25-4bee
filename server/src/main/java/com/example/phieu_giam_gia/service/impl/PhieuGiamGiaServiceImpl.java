package com.example.phieu_giam_gia.service.impl;
import com.example.phieu_giam_gia.dto.CreatePhieuGiamGiaRequest;
import com.example.phieu_giam_gia.dto.PhieuGiamGiaDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
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


    @Override
    public List<PhieuGiamGiaDTO> getAll() {
        return repository.findAllSortedByNgayTao().stream()
                .map(entity -> modelMapper.map(entity, PhieuGiamGiaDTO.class))
                .collect(Collectors.toList());
    }





    @Override
    public PhieuGiamGiaDTO getById(String id) {
        return repository.findById(id)
                .map(entity -> modelMapper.map(entity, PhieuGiamGiaDTO.class))
                .orElse(null);
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
        if (request.getNgayBatDau().isAfter(request.getNgayKetThuc())) {
            throw new IllegalArgumentException("Thời gian bắt đầu không thể sau thời gian kết thúc.");
        }
        if (request.getNgayBatDau().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Ngày bắt đầu không được là ngày trong quá khứ.");
        }

        if (request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        }

        if (request.getLoaiPhieuGiamGia()== 1 && request.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Giá trị giảm phần trăm không được vượt quá 100%.");
        }

        if (request.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền giảm tối đa phải lớn hơn 0.");
        }


        if (request.getGiaTriToiThieu().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị tối thiểu phải lớn hơn 0.");
        }


        if (request.getSoLuong() <= 0) {
            throw new IllegalArgumentException("Số lượng phiếu phải lớn hơn 0.");
        }

        if (request.getKieuGiamGia() == 2 && (request.getIdKhachHang() == null || request.getIdKhachHang().isEmpty())) {
            throw new IllegalArgumentException("Danh sách khách hàng không được để trống cho phiếu giảm giá cá nhân.");
        }




        // Tạo đối tượng phiếu giảm giá
        PhieuGiamGia phieuGiamGia = new PhieuGiamGia();
        phieuGiamGia.setId(UUID.randomUUID().toString());

        // Tạo hoặc kiểm tra mã phiếu giảm giá duy nhất
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

        // Set các thuộc tính khác từ request
        phieuGiamGia.setTenPhieuGiamGia(request.getTenPhieuGiamGia());
        phieuGiamGia.setGiaTriGiam(request.getGiaTriGiam());
        phieuGiamGia.setGiaTriToiThieu(request.getGiaTriToiThieu());
        phieuGiamGia.setKieuGiamGia(request.getKieuGiamGia());
        phieuGiamGia.setLoaiPhieuGiamGia(request.getLoaiPhieuGiamGia());
        phieuGiamGia.setSoTienGiamToiDa(request.getSoTienGiamToiDa());
        phieuGiamGia.setLoaiPhieuGiamGia(request.getLoaiPhieuGiamGia());
        phieuGiamGia.setSoLuong(request.getSoLuong());
        phieuGiamGia.setNgayBatDau(request.getNgayBatDau());
        phieuGiamGia.setNgayKetThuc(request.getNgayKetThuc());
        phieuGiamGia.setMoTa(request.getMoTa());
        phieuGiamGia.setTrangThai(1); // Mặc định trạng thái là kích hoạt

        // Lưu phiếu giảm giá vào cơ sở dữ liệu
        phieuGiamGia = repository.save(phieuGiamGia);

        // Xử lý trường hợp phiếu giảm giá cá nhân
        if (request.getLoaiPhieuGiamGia() == 2 && request.getIdKhachHang() != null && !request.getIdKhachHang().isEmpty()) {
            List<KhachHang> khachHangs = khachHangRepository.findByIdIn(request.getIdKhachHang());
            for (KhachHang khachHang : khachHangs) {
                PhieuGiamGiaKhachHang phieuGiamGiaKhachHang = new PhieuGiamGiaKhachHang();
                phieuGiamGiaKhachHang.setKhachHang(khachHang);
                phieuGiamGiaKhachHang.setPhieuGiamGia(phieuGiamGia);
                phieuGiamGiaKhachHang.setTrangThai(false);
                phieuGiamGiaKhachHang.setNgayTao(phieuGiamGia.getNgayTao());
                phieuGiamGiaKhachHangRepository.save(phieuGiamGiaKhachHang);

                // Gửi email bất đồng bộ
                sendEmailAsync(khachHang, phieuGiamGia);
            }
        }

        // Trả về DTO
        return modelMapper.map(phieuGiamGia, PhieuGiamGiaDTO.class);
    }
    @Async
    public void sendEmailAsync(KhachHang khachHang, PhieuGiamGia phieuGiamGia) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Thông báo phiếu giảm giá cá nhân");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Chào {{tenKhachHang}},</h2>
                    <p>Chúng tôi rất vui được thông báo rằng bạn đã nhận được một <b>phiếu giảm giá</b> đặc biệt từ chúng tôi!</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background-color: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #dee2e6;">Tên phiếu giảm giá</th>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">{{tenPhieuGiamGia}}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #dee2e6;">Mã phiếu giảm giá</th>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">{{maPhieuGiamGia}}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #dee2e6;">Hạn sử dụng</th>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">{{ngayKetThuc}}</td>
                        </tr>
                    </table>
                    <p>Hãy sử dụng mã này để nhận ưu đãi tuyệt vời trước ngày hết hạn!</p>
                    <p style="color: #6c757d; font-size: 0.9em;">Trân trọng,<br>Đội ngũ hỗ trợ của chúng tôi</p>
                </div>
                """;

            // Thay thế các biến trong nội dung HTML
            htmlContent = htmlContent
                    .replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{tenPhieuGiamGia}}", phieuGiamGia.getTenPhieuGiamGia())
                    .replace("{{maPhieuGiamGia}}", phieuGiamGia.getMaPhieuGiamGia())
                    .replace("{{ngayKetThuc}}", phieuGiamGia.getNgayKetThuc().toString());

            helper.setText(htmlContent, true); // true để kích hoạt chế độ HTML
            mailSender.send(mimeMessage);

            logger.info("Email đã được gửi thành công tới: {}", khachHang.getEmail());
        } catch (Exception e) {
            logger.error("Gửi email thất bại cho khách hàng: {} - {}", khachHang.getTenKhachHang(), e.getMessage());
        }
    }


    @Override
    public PhieuGiamGiaDTO update(PhieuGiamGiaDTO dto, String id) {
        // Tìm kiếm phiếu giảm giá theo ID
        PhieuGiamGia existingEntity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phiếu giảm giá không tồn tại với ID: " + id));

        // Kiểm tra các điều kiện đầu vào
        if (dto.getNgayBatDau().isAfter(dto.getNgayKetThuc())) {
            throw new IllegalArgumentException("Thời gian bắt đầu không thể sau thời gian kết thúc.");
        }
        if (dto.getNgayBatDau().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Ngày bắt đầu không được là ngày trong quá khứ.");
        }

        if (dto.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        }

        if (dto.getLoaiPhieuGiamGia() == 1 && dto.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Giá trị giảm phần trăm không được vượt quá 100%.");
        }

        if (dto.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền giảm tối đa phải lớn hơn 0.");
        }

        if (dto.getGiaTriToiThieu().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị tối thiểu phải lớn hơn 0.");
        }

        if (dto.getSoLuong() <= 0) {
            throw new IllegalArgumentException("Số lượng phiếu phải lớn hơn 0.");
        }

        if (dto.getKieuGiamGia() == 2 && (dto.getId() == null || dto.getId().isEmpty())) {
            throw new IllegalArgumentException("Danh sách khách hàng không được để trống cho phiếu giảm giá cá nhân.");
        }

        // Cập nhật các trường từ DTO vào entity đã tồn tại
        existingEntity.setTenPhieuGiamGia(dto.getTenPhieuGiamGia());
        existingEntity.setGiaTriGiam(dto.getGiaTriGiam());
        existingEntity.setGiaTriToiThieu(dto.getGiaTriToiThieu());
        existingEntity.setSoTienGiamToiDa(dto.getSoTienGiamToiDa());
        existingEntity.setSoLuong(dto.getSoLuong());
        existingEntity.setNgayBatDau(dto.getNgayBatDau());
        existingEntity.setNgayKetThuc(dto.getNgayKetThuc());
        existingEntity.setMoTa(dto.getMoTa());
        existingEntity.setTrangThai(dto.getTrangThai());

        // Cập nhật lại trạng thái hoặc các thay đổi khác nếu cần
        if (dto.getTrangThai() == 0) {
            existingEntity.setTrangThai(0); // Chẳng hạn nếu trạng thái bị hủy thì đặt thành 0
        }


        // Lưu và trả về đối tượng đã cập nhật
        PhieuGiamGia updatedEntity = repository.save(existingEntity);
        return modelMapper.map(updatedEntity, PhieuGiamGiaDTO.class);
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
    @Scheduled(cron = "0 * * * * *") // Mỗi phút
    @Transactional
    public void checkAndUpdateExpiredCoupons() {
        logger.info("Bắt đầu kiểm tra phiếu giảm giá hết hạn...");
        List<PhieuGiamGia> expiredCoupons = repository.findAllByNgayKetThucBeforeAndTrangThai(Instant.now(), 1);
        if (!expiredCoupons.isEmpty()) {
            expiredCoupons.forEach(phieu -> phieu.setTrangThai(2));
            repository.saveAll(expiredCoupons);
            logger.info("Đã cập nhật {} phiếu giảm giá hết hạn.", expiredCoupons.size());
        } else {
            logger.info("Không có phiếu giảm giá nào hết hạn.");
        }
    }

}



