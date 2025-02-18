package com.example.server.service.NhanVien_KhachHang;



import com.example.server.entity.NhanVien;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class NhanVienService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private JavaMailSender mailSender;

    public NhanVien createNhanVien(NhanVien nhanVien) {

        NhanVien nv = new NhanVien();
        nv.setMaNhanVien(nhanVien.getMaNhanVien());
        nv.setTenNhanVien(nhanVien.getTenNhanVien());
        nv.setNgaySinh(nhanVien.getNgaySinh());
        nv.setMoTa(nhanVien.getMoTa());
        nv.setTrangThai(nhanVien.getTrangThai());
        nv.setGioiTinh(nhanVien.getGioiTinh());
        nv.setSoDienThoai(nhanVien.getSoDienThoai());
        nv.setEmail(nhanVien.getEmail());
        nv.setNgaySua(nhanVien.getNgaySua());
        nv.setNguoiTao(nhanVien.getNguoiTao());
        nv.setNguoiSua(nhanVien.getNguoiSua());

        NhanVien savedNhanVien = nhanVienRepository.save(nv);

        if (savedNhanVien.getEmail() != null && !savedNhanVien.getEmail().isEmpty()) {
            sendEmail(savedNhanVien);
        }

        return savedNhanVien;
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
        return nhanVienRepository.findAll();
    }

    public NhanVien getNhanVienById(String id) {
        return nhanVienRepository.findById(id).orElse(null);
    }

    public NhanVien updateNhanVien(String id, NhanVien updatedNhanVien) {
        NhanVien existingNhanVien = nhanVienRepository.findById(id).orElse(null);
        if (existingNhanVien != null) {
            existingNhanVien.setTenNhanVien(updatedNhanVien.getTenNhanVien());
            existingNhanVien.setNgaySinh(updatedNhanVien.getNgaySinh());
            existingNhanVien.setMoTa(updatedNhanVien.getMoTa());
            existingNhanVien.setTrangThai(updatedNhanVien.getTrangThai());
            existingNhanVien.setGioiTinh(updatedNhanVien.getGioiTinh());
            existingNhanVien.setEmail(updatedNhanVien.getEmail());
            existingNhanVien.setSoDienThoai(updatedNhanVien.getSoDienThoai());
            existingNhanVien.setNgaySua(updatedNhanVien.getNgaySua());
            existingNhanVien.setNguoiTao(updatedNhanVien.getNguoiTao());
            existingNhanVien.setNguoiSua(updatedNhanVien.getNguoiSua());
            return nhanVienRepository.save(existingNhanVien);
        }
        return null;
    }

    public void deleteNhanVien(String id) {
        nhanVienRepository.deleteById(id);
    }


}