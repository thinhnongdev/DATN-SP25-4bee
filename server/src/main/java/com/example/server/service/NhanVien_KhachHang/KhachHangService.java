package com.example.server.service.NhanVien_KhachHang;


import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import com.example.server.entity.TaiKhoan;
import com.example.server.repository.Auth.TaiKhoanRepository;
import com.example.server.repository.Auth.VaiTroRepository;
import com.example.server.repository.NhanVien_KhachHang.DiaChiRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Transactional
    public KhachHang createKhachHang(KhachHangCreationRequest khachHangRequest) {
        // Kiểm tra email đã tồn tại chưa
        if (khachHangRequest.getEmail() != null && !khachHangRequest.getEmail().isEmpty() &&
                taiKhoanRepository.existsByUsername(khachHangRequest.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng trong hệ thống");
        }

        KhachHang kh = new KhachHang();
        kh.setMaKhachHang(generateMaKhachHang(khachHangRequest));
        kh.setTenKhachHang(khachHangRequest.getTenKhachHang());
        kh.setNgaySinh(khachHangRequest.getNgaySinh());
        kh.setTrangThai(true);
        kh.setGioiTinh(khachHangRequest.getGioiTinh());
        kh.setSoDienThoai(khachHangRequest.getSoDienThoai());
        kh.setEmail(khachHangRequest.getEmail());
        kh.setNgayTao(LocalDateTime.now());
        KhachHang savedKhachHang = khachHangRepository.save(kh);

        List<DiaChi> dc = new ArrayList<>();

        for (DiaChi diaChiRequest : khachHangRequest.getDiaChi()) {
            DiaChi diaChi = new DiaChi();
            diaChi.setKhachHang(kh);
            diaChi.setTinh(diaChiRequest.getTinh());
            diaChi.setHuyen(diaChiRequest.getHuyen());
            diaChi.setXa(diaChiRequest.getXa());
            diaChi.setDiaChiCuThe(diaChiRequest.getDiaChiCuThe());
            diaChi.setTrangThai(1);
            dc.add(diaChi);
        }
        diaChiRepository.saveAll(dc);

        // Tạo tài khoản và gửi email khi có email
        if (savedKhachHang.getEmail() != null && !savedKhachHang.getEmail().isEmpty()) {
            TaiKhoan taiKhoan = createAccountAndSendEmail(savedKhachHang);
            savedKhachHang.setTaiKhoanId(taiKhoan.getId());
            khachHangRepository.save(savedKhachHang);
        }

        return savedKhachHang;
    }
    private TaiKhoan createAccountAndSendEmail(KhachHang khachHang) {
        try {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            String generatedPassword = RandomStringUtils.randomAlphanumeric(8);

            // Tạo tài khoản mới
            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setTrangThai(1);
            taiKhoan.setVaiTro(vaiTroRepository.findByTenVaiTro("KHACH_HANG").orElse(null));
            taiKhoan.setPassword(passwordEncoder.encode(generatedPassword));
            taiKhoan.setUsername(khachHang.getEmail());
            taiKhoan.setNgayTao(LocalDateTime.now());
            TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);

            // Liên kết tài khoản với khách hàng
            khachHang.setTaiKhoan(savedTaiKhoan);
            khachHangRepository.save(khachHang);

            // Gửi email thông báo
            sendEmail(khachHang, generatedPassword);

            return savedTaiKhoan;
        } catch (Exception e) {
            logger.error("Lỗi khi tạo tài khoản: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo tài khoản", e);
        }
    }

    //    huy làm test thêm địa chỉ cho khách hàng
// Thêm phương thức để tạo địa chỉ mới cho khách hàng
    public DiaChi addAddressForCustomer(String khachHangId, DiaChi diaChi) {
        KhachHang khachHang = khachHangRepository.findById(khachHangId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với id: " + khachHangId));

        diaChi.setKhachHang(khachHang);
        return diaChiRepository.save(diaChi);
    }

    private String generateMaKhachHang(KhachHangCreationRequest khachHangRequest) {
        String tenKhachHang = khachHangRequest.getTenKhachHang();
        LocalDate ngaySinh = khachHangRequest.getNgaySinh(); // Lấy ngày sinh từ entity

        if (tenKhachHang == null || tenKhachHang.isEmpty() || ngaySinh == null) {
            return generateUniqueRandomMaKhachHang("KH");
        }

        String tenKhongDau = removeVietnameseAccents(tenKhachHang.trim().toLowerCase());

        String[] parts = tenKhongDau.split("\\s+");
        if (parts.length == 0) {
            return generateUniqueRandomMaKhachHang("KH");
        }

        StringBuilder vietTat = new StringBuilder(parts[parts.length - 1]);

        for (int i = 0; i < parts.length - 1; i++) {
            vietTat.append(parts[i].charAt(0));
        }

        String ngaySinhStr = ngaySinh.format(DateTimeFormatter.ofPattern("ddMM"));
        String baseMa = vietTat + ngaySinhStr;

        // Kiểm tra xem mã đã tồn tại chưa
        return ensureUniqueMaKhachHang(baseMa);
    }

    // Thêm phương thức mới để đảm bảo mã khách hàng là duy nhất
    private String ensureUniqueMaKhachHang(String baseMa) {
        String maKhachHang = baseMa;
        int counter = 1;

        // Kiểm tra xem mã đã tồn tại hay chưa
        while (khachHangRepository.existsByMaKhachHang(maKhachHang)) {
            // Nếu đã tồn tại, thêm số tăng dần vào cuối
            maKhachHang = baseMa + counter;
            counter++;
        }

        return maKhachHang;
    }

    // Thêm phương thức tạo mã ngẫu nhiên khi không có đủ thông tin
    private String generateUniqueRandomMaKhachHang(String prefix) {
        String maKhachHang;
        do {
            // Tạo mã ngẫu nhiên với tiền tố
            maKhachHang = prefix + System.currentTimeMillis() + RandomStringUtils.randomNumeric(2);
        } while (khachHangRepository.existsByMaKhachHang(maKhachHang));

        return maKhachHang;
    }

    private String removeVietnameseAccents(String str) {
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
    }

    private void sendEmail(KhachHang khachHang, String password) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Chào mừng bạn đến với hệ thống!");
            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #007bff;">Chào mừng {{tenKhachHang}}!</h2>
                        <p>Bạn đã đăng ký tài khoản thành công tại hệ thống của chúng tôi!</p>
                        <p>Thông tin tài khoản của bạn:</p>
                        <ul>
                            <li><b>Mã khách hàng:</b> {{maKhachHang}}</li>
                            <li><b>Email đăng nhập:</b> {{email}}</li>
                            <li><b>Mật khẩu tạm thời:</b> {{password}}</li>
                        </ul>
                        <p>Vui lòng đăng nhập và thay đổi mật khẩu để đảm bảo an toàn.</p>
                        <p>Trân trọng,</p>
                        <p><b>Ban Quản Trị Hệ Thống</b></p>
                    </div>
                """
                    .replace("{{tenKhachHang}}", khachHang.getTenKhachHang())
                    .replace("{{maKhachHang}}", khachHang.getMaKhachHang())
                    .replace("{{email}}", khachHang.getEmail())
                    .replace("{{password}}", password);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.error("Lỗi gửi email: {}", e.getMessage());
        }
    }
    @Transactional
    public KhachHang registerKhachHang(KhachHangCreationRequest khachHangRequest) {
        // Kiểm tra email đã tồn tại
        if (khachHangRequest.getEmail() != null &&
                taiKhoanRepository.existsByUsername(khachHangRequest.getEmail())) {
            throw new IllegalArgumentException("Email đã được đăng ký");
        }

        // Kiểm tra số điện thoại đã tồn tại
        if (khachHangRequest.getSoDienThoai() != null &&
                khachHangRepository.existsBySoDienThoai(khachHangRequest.getSoDienThoai())) {
            throw new IllegalArgumentException("Số điện thoại đã được đăng ký");
        }

        // Tạo đối tượng KhachHang mới
        KhachHang kh = new KhachHang();
        kh.setMaKhachHang(generateMaKhachHang(khachHangRequest));
        kh.setTenKhachHang(khachHangRequest.getTenKhachHang());
        kh.setNgaySinh(khachHangRequest.getNgaySinh());
        kh.setTrangThai(true);
        kh.setGioiTinh(khachHangRequest.getGioiTinh());
        kh.setSoDienThoai(khachHangRequest.getSoDienThoai());
        kh.setEmail(khachHangRequest.getEmail());
        kh.setNgayTao(LocalDateTime.now());

        // Tạo tài khoản cho khách hàng
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setUsername(khachHangRequest.getEmail());
        taiKhoan.setPassword(passwordEncoder.encode(khachHangRequest.getPassword()));
        taiKhoan.setNgayTao(LocalDateTime.now());
        taiKhoan.setVaiTro(vaiTroRepository.findByTenVaiTro("KHACH_HANG").orElse(null));
        taiKhoan.setTrangThai(1);

        // Lưu tài khoản
        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);

        // Liên kết khách hàng với tài khoản
        kh.setTaiKhoan(savedTaiKhoan);

        // Lưu khách hàng
        KhachHang savedKhachHang = khachHangRepository.save(kh);

        return savedKhachHang;
    }

    // Phương thức để lấy thông tin khách hàng từ tài khoản
    public KhachHang getKhachHangByTaiKhoanId(String taiKhoanId) {
        return khachHangRepository.findByTaiKhoan_Id(taiKhoanId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin khách hàng"));
    }

    // Phương thức kiểm tra email tồn tại
    public boolean isEmailExists(String email) {
        return taiKhoanRepository.existsByUsername(email);
    }

    // Phương thức kiểm tra số điện thoại tồn tại
    public boolean isPhoneExists(String soDienThoai) {
        return khachHangRepository.existsBySoDienThoai(soDienThoai);
    }
    public List<KhachHang> getAllKhachHang() {
        return khachHangRepository.findAllKhachHangSortedByNgayTao();
    }

    public KhachHang getKhachHangById(String id) {
        return khachHangRepository.findById(id).orElse(null);
    }

    @Transactional
    public KhachHang updateKhachHang(String id, KhachHangCreationRequest updatedKhachHang) {
        KhachHang existingKhachHang = khachHangRepository.findById(id).orElse(null);

        if (existingKhachHang != null) {
            // Cập nhật thông tin khách hàng
            existingKhachHang.setTenKhachHang(updatedKhachHang.getTenKhachHang());
            existingKhachHang.setNgaySinh(updatedKhachHang.getNgaySinh());
            existingKhachHang.setSoDienThoai(updatedKhachHang.getSoDienThoai());
            existingKhachHang.setEmail(updatedKhachHang.getEmail());
            existingKhachHang.setNgaySua(LocalDateTime.now());
            diaChiRepository.softDeleteByKhachHangId(id);//xóa mềm các địa chỉ cũ  (set trangThai về O(false))
            List<DiaChi> diaChiList = new ArrayList<>();
            if (updatedKhachHang.getDiaChi() != null) {
                for (DiaChi diaChiRequest : updatedKhachHang.getDiaChi()) {
                    DiaChi diaChi = new DiaChi();
                    diaChi.setKhachHang(existingKhachHang);
                    diaChi.setTinh(diaChiRequest.getTinh());
                    diaChi.setHuyen(diaChiRequest.getHuyen());
                    diaChi.setXa(diaChiRequest.getXa());
                    diaChi.setDiaChiCuThe(diaChiRequest.getDiaChiCuThe());
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
