package com.example.server.service.NhanVien_KhachHang;



import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.repository.NhanVien_KhachHang.DiaChiRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KhachHangService {
    private static final Logger logger = LoggerFactory.getLogger(KhachHangService.class);

    @Autowired
    private DiaChiRepository diaChiRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private JavaMailSender mailSender;

    public KhachHang createKhachHang(KhachHangCreationRequest khachHangRequest){

        KhachHang kh = new KhachHang();
        kh.setMaKhachHang(generateMaKhachHang(khachHangRequest));
        kh.setTenKhachHang(khachHangRequest.getTenKhachHang());
        kh.setNgaySinh(khachHangRequest.getNgaySinh());
        kh.setTrangThai(true);
        kh.setGioiTinh(khachHangRequest.getGioiTinh());
        kh.setSoDienThoai(khachHangRequest.getSoDienThoai());
        kh.setEmail(khachHangRequest.getEmail());
        KhachHang savedKhachHang = khachHangRepository.save(kh);

        List<DiaChi> dc = new ArrayList<>();

        for (DiaChi diaChiRequest : khachHangRequest.getDiaChi()) {
            DiaChi diaChi = new DiaChi();
            diaChi.setKhachHang(kh);
            diaChi.setTinh(diaChiRequest.getTinh());
            diaChi.setHuyen(diaChiRequest.getHuyen());
            diaChi.setXa(diaChiRequest.getXa());
            diaChi.setTrangThai(1);
            dc.add(diaChi);
        }
        diaChiRepository.saveAll(dc);


        if (savedKhachHang.getEmail() != null && !savedKhachHang.getEmail().isEmpty()) {
            sendEmail(savedKhachHang);
        }

        return savedKhachHang;
    }

    private String generateMaKhachHang(KhachHangCreationRequest khachHangRequest) {
        String tenKhachHang = khachHangRequest.getTenKhachHang();
        LocalDate ngaySinh = khachHangRequest.getNgaySinh(); // Lấy ngày sinh từ entity

        if (tenKhachHang == null || tenKhachHang.isEmpty() || ngaySinh == null) {
            return "KH" + System.currentTimeMillis();
        }

        String tenKhongDau = removeVietnameseAccents(tenKhachHang.trim().toLowerCase());

        String[] parts = tenKhongDau.split("\\s+");
        if (parts.length == 0) {
            return "KH" + System.currentTimeMillis();
        }

        StringBuilder vietTat = new StringBuilder(parts[parts.length - 1]);

        for (int i = 0; i < parts.length - 1; i++) {
            vietTat.append(parts[i].charAt(0));
        }

        String ngaySinhStr = ngaySinh.format(DateTimeFormatter.ofPattern("ddMM"));

        return vietTat + ngaySinhStr;
    }

    private String removeVietnameseAccents(String str) {
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
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
        return khachHangRepository.findAllKhachHangSortedByNgayTao();
    }

    public KhachHang getKhachHangById(String id) {
        return khachHangRepository.findById(id).orElse(null);
    }


    public KhachHang updateKhachHang(String id, KhachHangCreationRequest updatedKhachHang) {
        KhachHang existingKhachHang = khachHangRepository.findById(id).orElse(null);

        if (existingKhachHang != null) {
            // Cập nhật thông tin khách hàng
            existingKhachHang.setTenKhachHang(updatedKhachHang.getTenKhachHang());
            existingKhachHang.setNgaySinh(updatedKhachHang.getNgaySinh());
            existingKhachHang.setSoDienThoai(updatedKhachHang.getSoDienThoai());
            existingKhachHang.setEmail(updatedKhachHang.getEmail());

            List<DiaChi> diaChiList = new ArrayList<>();
            if (updatedKhachHang.getDiaChi() != null) {
                for (DiaChi diaChiRequest : updatedKhachHang.getDiaChi()) {
                    DiaChi diaChi = new DiaChi();
                    diaChi.setKhachHang(existingKhachHang);
                    diaChi.setTinh(diaChiRequest.getTinh());
                    diaChi.setHuyen(diaChiRequest.getHuyen());
                    diaChi.setXa(diaChiRequest.getXa());
                    diaChi.setTrangThai(1);
                    diaChiList.add(diaChi);
                }
                diaChiRepository.saveAll(diaChiList);
            }
            return khachHangRepository.save(existingKhachHang); // Cập nhật khách hàng
        }
        return null;
    }

    public void deleteKhachHang(String id) {
        KhachHang kh = khachHangRepository.findById(id).orElse(null);
        if (kh != null) {
            kh.setTrangThai(false);
            khachHangRepository.save(kh);
        } else {
            throw new IllegalArgumentException("Không tìm thấy khách hàng");
        }
    }

    public List<DiaChi> findDiaChiByIdKhachHang(String idKhachHang) {
        return diaChiRepository.findDiaChiByIdKhachHang(idKhachHang);
    }
}
