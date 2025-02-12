package com.example.module_nv_kh.service;

import com.example.module_nv_kh.entity.NhanVien;
import com.example.module_nv_kh.repository.NhanVienRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class NhanVienService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private JavaMailSender mailSender;

    public NhanVien createNhanVien(NhanVien nhanVien) {
//        if (isMaNhanVienExist(nhanVien.getMa_nhan_vien())) {
//            throw new IllegalArgumentException("Mã nhân viên đã tồn tại");
//        }
//        if (isEmailExist(nhanVien.getEmail())) {
//            throw new IllegalArgumentException("Email đã tồn tại");
//        }
//        if (isSoDienThoaiExist(nhanVien.getSo_dien_thoai())) {
//            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
//        }
        NhanVien nv = new NhanVien();
        nv.setMa_nhan_vien(nhanVien.getMa_nhan_vien());
        nv.setTen_nhan_vien(nhanVien.getTen_nhan_vien());
        nv.setNgay_sinh(nhanVien.getNgay_sinh());
        nv.setMo_ta(nhanVien.getMo_ta());
        nv.setTrang_thai(nhanVien.getTrang_thai());
        nv.setGioi_tinh(nhanVien.getGioi_tinh());
        nv.setSo_dien_thoai(nhanVien.getSo_dien_thoai());
        nv.setEmail(nhanVien.getEmail());
        nv.setNgay_sua(nhanVien.getNgay_sua());
        nv.setNguoi_tao(nhanVien.getNguoi_tao());
        nv.setNguoi_sua(nhanVien.getNguoi_sua());

        // Lưu nhân viên vào database
        NhanVien savedNhanVien = nhanVienRepository.save(nv);

        // Gửi email thông báo
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
                    .replace("{{tenNhanVien}}", nhanVien.getTen_nhan_vien())
                    .replace("{{maNhanVien}}", nhanVien.getMa_nhan_vien())
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
            existingNhanVien.setTen_nhan_vien(updatedNhanVien.getTen_nhan_vien());
            existingNhanVien.setNgay_sinh(updatedNhanVien.getNgay_sinh());
            existingNhanVien.setMo_ta(updatedNhanVien.getMo_ta());
            existingNhanVien.setTrang_thai(updatedNhanVien.getTrang_thai());
            existingNhanVien.setGioi_tinh(updatedNhanVien.getGioi_tinh());
            existingNhanVien.setEmail(updatedNhanVien.getEmail());
            existingNhanVien.setSo_dien_thoai(updatedNhanVien.getSo_dien_thoai());
            existingNhanVien.setNgay_sua(updatedNhanVien.getNgay_sua());
            existingNhanVien.setNguoi_tao(updatedNhanVien.getNguoi_tao());
            existingNhanVien.setNguoi_sua(updatedNhanVien.getNguoi_sua());
            return nhanVienRepository.save(existingNhanVien);
        }
        return null;
    }

    public void deleteNhanVien(String id) {
        nhanVienRepository.deleteById(id);
    }

//    public boolean isMaNhanVienExist(String maNhanVien) {
//        return nhanVienRepository.existsByMaNhanVien(maNhanVien);
//    }
//
//    public boolean isEmailExist(String email) {
//        return nhanVienRepository.existsByEmail(email);
//    }
//
//    public boolean isSoDienThoaiExist(String soDienThoai) {
//        return nhanVienRepository.existsBySoDienThoai(soDienThoai);
//    }

}