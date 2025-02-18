package com.example.server.service.NhanVien_KhachHang;



import com.example.server.entity.KhachHang;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KhachHangService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private JavaMailSender mailSender;

    public KhachHang createKhachHang(KhachHang khachHang){
        KhachHang kh = new KhachHang();
        kh.setMaKhachHang(khachHang.getMaKhachHang());
        kh.setTenKhachHang(khachHang.getTenKhachHang());
        kh.setNgaySinh(khachHang.getNgaySinh());
        kh.setMoTa(khachHang.getMoTa());
        kh.setTrangThai(khachHang.getTrangThai());
        kh.setGioiTinh(khachHang.getGioiTinh());
        kh.setSoDienThoai(khachHang.getSoDienThoai());
        kh.setEmail(khachHang.getEmail());
        kh.setNgaySua(khachHang.getNgaySua());
        kh.setNguoiTao(khachHang.getNguoiTao());
        kh.setNguoiSua(khachHang.getNguoiSua());

        KhachHang savedKhachHang = khachHangRepository.save(kh);

        if (savedKhachHang.getEmail() != null && !savedKhachHang.getEmail().isEmpty()) {
            sendEmail(savedKhachHang);
        }

        return savedKhachHang;
    }

    private void sendEmail(KhachHang khachHang) {
        try {
            String generatedPassword = RandomStringUtils.randomAlphanumeric(8);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Chào mừng bạn!");
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Chào mừng {{tenKhachHang}}!</h2>
                    <p>Bạn đã đăng kí tài khoản thành công</p>
                    <p>Thông tin của bạn:</p>
                    <ul>
                        <li><b>Email:</b> {{email}}</li>
                        <li><b>Mật khẩu tạm thời:</b> {{password}}</li>
                    </ul>
                    <p>Hãy thay đổi mật khẩu sau khi đăng nhập.</p>
                    <p>Trân trọng,</p>
                    <p><b>Ban Quản Lý Nhân Sự</b></p>
                </div>
            """
                    .replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{email}}", khachHang.getEmail())
                    .replace("{{password}}", generatedPassword);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.error("Lỗi gửi email: {}", e.getMessage());
        }
    }

    public List<KhachHang> getAllKhachHang(){
        return khachHangRepository.findAll();
    }

    public KhachHang getKhachHangById(String id) {
        return khachHangRepository.findById(id).orElse(null);
    }

    public KhachHang updateKhachHang(String id, KhachHang updatedKhachHang) {
        KhachHang existingKhachHang = khachHangRepository.findById(id).orElse(null);
        if (existingKhachHang != null) {
            existingKhachHang.setTenKhachHang(updatedKhachHang.getTenKhachHang());
            existingKhachHang.setNgaySinh(updatedKhachHang.getNgaySinh());
            existingKhachHang.setMoTa(updatedKhachHang.getMoTa());
            existingKhachHang.setTrangThai(updatedKhachHang.getTrangThai());
            existingKhachHang.setGioiTinh(updatedKhachHang.getGioiTinh());
            existingKhachHang.setSoDienThoai(updatedKhachHang.getSoDienThoai());
            existingKhachHang.setEmail(updatedKhachHang.getEmail());
            existingKhachHang.setNgaySua(updatedKhachHang.getNgaySua());
            existingKhachHang.setNguoiSua(updatedKhachHang.getNguoiSua());
            return khachHangRepository.save(existingKhachHang);
        }
        return null;
    }

    public void deleteNhanVien(String id) {
        khachHangRepository.deleteById(id);
    }
}
