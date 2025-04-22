package com.example.server.service.NhanVien_KhachHang;



import com.example.server.entity.NhanVien;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;


@Service
public class NhanVienService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private JavaMailSender mailSender;

    public NhanVien createNhanVien(NhanVien nhanVien) {

        NhanVien nv = new NhanVien();
        nv.setMaNhanVien(generateMaNhanVien(nhanVien));
        nv.setTenNhanVien(nhanVien.getTenNhanVien());
        nv.setNgaySinh(nhanVien.getNgaySinh());
        nv.setTrangThai(nhanVien.getTrangThai());
        nv.setGioiTinh(nhanVien.getGioiTinh());
        nv.setSoDienThoai(nhanVien.getSoDienThoai());
        nv.setEmail(nhanVien.getEmail());
        nv.setAnh(nhanVien.getAnh());
        nv.setCanCuocCongDan(nhanVien.getCanCuocCongDan());
        nv.setTinh(nhanVien.getTinh());
        nv.setHuyen(nhanVien.getHuyen());
        nv.setXa(nhanVien.getXa());
        nv.setDiaChiCuThe(nhanVien.getDiaChiCuThe());

        NhanVien savedNhanVien = nhanVienRepository.save(nv);

        if (savedNhanVien.getEmail() != null && !savedNhanVien.getEmail().isEmpty()) {
            sendEmail(savedNhanVien);
        }

        return savedNhanVien;
    }

    private String generateMaNhanVien(NhanVien nhanVien) {
        String tenNhanVien = nhanVien.getTenNhanVien();
        LocalDate ngaySinh = nhanVien.getNgaySinh(); // Lấy ngày sinh từ entity

        if (tenNhanVien == null || tenNhanVien.isEmpty() || ngaySinh == null) {
            return "NV" + System.currentTimeMillis();
        }

        String tenKhongDau = removeVietnameseAccents(tenNhanVien.trim().toLowerCase());

        // Chuyển tên thành chữ thường và tách thành các từ
        String[] parts = tenKhongDau.split("\\s+");
        if (parts.length == 0) {
            return "NV" + System.currentTimeMillis();
        }

        // Lấy từ cuối cùng trước
        StringBuilder vietTat = new StringBuilder(parts[parts.length - 1]);

        // Ghép chữ cái đầu của các từ còn lại
        for (int i = 0; i < parts.length - 1; i++) {
            vietTat.append(parts[i].charAt(0));
        }

        // Định dạng ngày sinh thành ddMMyyyy
        String ngaySinhStr = ngaySinh.format(DateTimeFormatter.ofPattern("ddMM"));

        // Tạo mã nhân viên
        return vietTat + ngaySinhStr;
    }

    private String removeVietnameseAccents(String str) {
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
    }


    private void sendEmail(NhanVien nhanVien) {
        try {
            String generatedPassword = RandomStringUtils.randomAlphanumeric(8);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(nhanVien.getEmail());
            helper.setSubject("Chào mừng bạn đến với công ty!");
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Chào mừng {{tenNhanVien}}!</h2>
                    <p>Chúc mừng bạn đã trở thành nhân viên của công ty!</p>
                    <p>Thông tin của bạn:</p>
                    <ul>
                        <li><b>Mã nhân viên:</b> {{maNhanVien}}</li>
                        <li><b>Email:</b> {{email}}</li>
                        <li><b>Mật khẩu tạm thời:</b> {{password}}</li>
                    </ul>
                    <p>Hãy thay đổi mật khẩu sau khi đăng nhập.</p>
                    <p>Trân trọng,</p>
                    <p><b>Ban Quản Lý Nhân Sự</b></p>
                </div>
            """

                    .replace("{{maNhanVien}}", nhanVien.getMaNhanVien())
                    .replace("{{tenNhanVien}}", nhanVien.getTenNhanVien())
                    .replace("{{email}}", nhanVien.getEmail())
                    .replace("{{password}}", generatedPassword);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.error("Lỗi gửi email: {}", e.getMessage());
        }
    }

    public List<NhanVien> getAllNhanVien() {
        return nhanVienRepository.findAllNhanVienSortedByNgayTao();
    }

    public NhanVien getNhanVienById(String id) {
        return nhanVienRepository.findById(id).orElse(null);
    }

    public NhanVien updateNhanVien(String id, NhanVien updatedNhanVien) {
        NhanVien existingNhanVien = nhanVienRepository.findById(id).orElse(null);
        if (existingNhanVien != null) {
            existingNhanVien.setTenNhanVien(updatedNhanVien.getTenNhanVien());
            existingNhanVien.setNgaySinh(updatedNhanVien.getNgaySinh());
            existingNhanVien.setTrangThai(updatedNhanVien.getTrangThai());
            existingNhanVien.setGioiTinh(updatedNhanVien.getGioiTinh());
            existingNhanVien.setEmail(updatedNhanVien.getEmail());
            existingNhanVien.setSoDienThoai(updatedNhanVien.getSoDienThoai());
            existingNhanVien.setCanCuocCongDan(updatedNhanVien.getCanCuocCongDan());
            existingNhanVien.setTinh(updatedNhanVien.getTinh());
            existingNhanVien.setHuyen(updatedNhanVien.getHuyen());
            existingNhanVien.setXa(updatedNhanVien.getXa());
            existingNhanVien.setDiaChiCuThe(updatedNhanVien.getDiaChiCuThe());
            return nhanVienRepository.save(existingNhanVien);
        }
        return null;
    }

    public void deleteNhanVien(String id) {
        NhanVien nhanVien = nhanVienRepository.findById(id).orElse(null);
        if (nhanVien != null) {
            nhanVien.setTrangThai(false);
            nhanVienRepository.save(nhanVien);
        } else {
            throw new IllegalArgumentException("Không tìm thấy nhân viên");
        }
    }
    public String decodeQRCode(File qrCodeImage) throws IOException, NotFoundException {
        BufferedImage bufferedImage = ImageIO.read(qrCodeImage);
        LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(bitmap);
        return result.getText();
    }
//    public NhanVien getNhanVienByQRCode(File qrImage) throws IOException {
//        try {
//            String qrData = decodeQRCode(qrImage);
//            System.out.println("Dữ liệu QR: " + qrData);
//
//            // Tìm nhân viên theo số CCCD từ dữ liệu QR
//            Optional<NhanVien> nhanVienOpt = nhanVienRepository.findByCanCuocCongDan(qrData);
//
//            return nhanVienOpt.orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));
//        } catch (NotFoundException e) {
//            throw new RuntimeException("Không thể đọc mã QR!");
//        }
//    }
//    private String extractCCCD(String qrData) {
//        String[] parts = qrData.split("\\|");
//        if (parts.length < 5) {
//            throw new IllegalArgumentException("Dữ liệu QR không đúng định dạng!");
//        }
//        return parts[4]; // Lấy số CCCD từ chuỗi QR
//    }


}