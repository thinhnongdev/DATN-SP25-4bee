package com.example.module_nv_kh.service;

import com.example.module_nv_kh.entity.KhachHang;
import com.example.module_nv_kh.entity.NhanVien;
import com.example.module_nv_kh.repository.KhachHangRepository;
import com.example.module_nv_kh.repository.NhanVienRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KhachHangService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private JavaMailSender mailSender;

    public KhachHang createKhachHang(KhachHang khachHang){
        KhachHang kh = new KhachHang();
        kh.setMa_khach_hang(khachHang.getMa_khach_hang());
        kh.setTen_khach_hang(khachHang.getTen_khach_hang());
        kh.setNgay_sinh(khachHang.getNgay_sinh());
        kh.setMo_ta(khachHang.getMo_ta());
        kh.setTrang_thai(khachHang.getTrang_thai());
        kh.setGioi_tinh(khachHang.getGioi_tinh());
        kh.setSo_dien_thoai(khachHang.getSo_dien_thoai());
        kh.setEmail(khachHang.getEmail());
        kh.setNgay_sua(khachHang.getNgay_sua());
        kh.setNguoi_tao(khachHang.getNguoi_tao());
        kh.setNguoi_sua(khachHang.getNguoi_sua());

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
                    .replace("{{tenKhachHang}}", khachHang.getTen_khach_hang())
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
            existingKhachHang.setTen_khach_hang(updatedKhachHang.getTen_khach_hang());
            existingKhachHang.setNgay_sinh(updatedKhachHang.getNgay_sinh());
            existingKhachHang.setMo_ta(updatedKhachHang.getEmail());
            existingKhachHang.setTrang_thai(updatedKhachHang.getTrang_thai());
            existingKhachHang.setGioi_tinh(updatedKhachHang.getGioi_tinh());
            existingKhachHang.setSo_dien_thoai(updatedKhachHang.getSo_dien_thoai());
            existingKhachHang.setEmail(updatedKhachHang.getEmail());
            existingKhachHang.setNgay_sua(updatedKhachHang.getNgay_sua());
            existingKhachHang.setNguoi_sua(updatedKhachHang.getNguoi_sua());
            return khachHangRepository.save(existingKhachHang);
        }
        return null;
    }

    public void deleteNhanVien(String id) {
        khachHangRepository.deleteById(id);
    }
}
