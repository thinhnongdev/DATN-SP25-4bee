package com.example.server.service;

import com.example.server.dto.Auth.request.*;
import com.example.server.dto.Auth.response.AuthenticationResponse;
import com.example.server.dto.Auth.response.IntrospectResponse;
import com.example.server.dto.Auth.response.UserResponse;
import com.example.server.entity.InvalidateToken;
import com.example.server.entity.KhachHang;
import com.example.server.entity.NhanVien;
import com.example.server.entity.TaiKhoan;
import com.example.server.repository.Auth.InvalidateTokenRepository;
import com.example.server.repository.Auth.TaiKhoanRepository;
import com.example.server.repository.Auth.VaiTroRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationService {
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private VaiTroRepository vaiTroRepository;
    @Autowired
    TaiKhoanRepository taiKhoanRepository;
    @Autowired
    InvalidateTokenRepository invalidateTokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @Value("${app.reset-password.token.expiration-minutes:60}")
    private int resetPasswordTokenExpirationMinutes;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;
        try {
            verifyToken(token);
        } catch (RuntimeException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = taiKhoanRepository.findByUsername(authenticationRequest.getEmail()).orElseThrow(() -> new RuntimeException());

        boolean authenticated = passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new RuntimeException("Password is incorrect");
        }
        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken = verifyToken(request.getToken());
        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
        InvalidateToken invalidateToken = InvalidateToken
                .builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidateTokenRepository.save(invalidateToken);
    }

    ;

    public AuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest)
            throws ParseException, JOSEException {
        var signJWT = verifyToken(refreshTokenRequest.getToken());
        var jit = signJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signJWT.getJWTClaimsSet().getExpirationTime();
        InvalidateToken invalidateToken = InvalidateToken
                .builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidateTokenRepository.save(invalidateToken);
        var username = signJWT.getJWTClaimsSet().getSubject();
        var taiKhoan = taiKhoanRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("username không tồn tại"));

        var newtoken = generateToken(taiKhoan);
        return AuthenticationResponse.builder()
                .token(newtoken)
                .authenticated(true)
                .build();
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        if (!(expiryTime.after(new Date()) && verified)) {
            throw new RuntimeException("token khong hop le");
        }
        if (invalidateTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new RuntimeException("token da logout");
        }
        return signedJWT;
    }

    private String generateToken(TaiKhoan taiKhoan) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(taiKhoan.getUsername())//đại diện cho cái user đăng nhập
                .issuer("4bee")//xác định token được issue(phát hàng) từ ai
                .issueTime(new Date())//thời gian phát hành
                .expirationTime(new Date(//thời gian hết hạn token
                        Instant.now().plus(12, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())//tạo id cho token
                .claim("scope", taiKhoan.getVaiTro().getTenVaiTro())//claim bổ sung nếu cần
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));//kí token
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Can't create token", e);
            throw new RuntimeException();
        }

    }

    public UserResponse findUserByToken(IntrospectRequest introspectRequest) throws ParseException, JOSEException {
        UserResponse userResponse = new UserResponse();
        var signJWT = verifyToken(introspectRequest.getToken());
        var username = signJWT.getJWTClaimsSet().getSubject();
        var roleUser = signJWT.getJWTClaimsSet().getStringClaim("scope");
        if (roleUser.equals("ADMIN") || roleUser.equals("NHAN_VIEN")) {
            NhanVien nhanVien = nhanVienRepository.findByEmail(username).get();
            userResponse.setId(nhanVien.getId());
            userResponse.setMa(nhanVien.getMaNhanVien());
            userResponse.setTen(nhanVien.getTenNhanVien());
            userResponse.setEmail(nhanVien.getEmail());
            userResponse.setAnhUrl(nhanVien.getAnh());
        }
        if (roleUser.equals("KHACH_HANG")) {
            KhachHang khachHang = khachHangRepository.findByEmail(username).get();
            userResponse.setId(khachHang.getId());
            userResponse.setSoDienThoai(khachHang.getSoDienThoai());
            userResponse.setMa(khachHang.getMaKhachHang());
            userResponse.setTen(khachHang.getTenKhachHang());
            userResponse.setEmail(khachHang.getEmail());

        }
        return userResponse;
    }

    // Sửa phương thức registerAccountForClient để sử dụng mã khách hàng tốt hơn
    public void registerAccountForClient(RegisterAccountRequest request) {
        if (taiKhoanRepository.existsByUsername(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        // Tạo tài khoản
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setUsername(request.getEmail());
        taiKhoan.setPassword(passwordEncoder.encode(request.getPassword()));
        taiKhoan.setNgayTao(LocalDateTime.now());
        taiKhoan.setVaiTro(vaiTroRepository.findByTenVaiTro("KHACH_HANG").get());
        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);

        // Tạo khách hàng và liên kết với tài khoản
        KhachHang khachHang = new KhachHang();
        khachHang.setTenKhachHang(request.getHoTen());

        // Tạo mã khách hàng theo định dạng tốt hơn
        String maKhachHang = generateMaKhachHang(request.getHoTen(), request.getNgaySinh());
        khachHang.setMaKhachHang(maKhachHang);

        khachHang.setEmail(request.getEmail());
        khachHang.setNgaySinh(request.getNgaySinh());
        khachHang.setNgayTao(LocalDateTime.now());
        khachHang.setTrangThai(true);
        khachHang.setTaiKhoan(savedTaiKhoan);
        khachHangRepository.save(khachHang);
    }

    // Thêm phương thức mới để tạo mã khách hàng dựa vào tên và ngày sinh
    private String generateMaKhachHang(String tenKhachHang, LocalDate ngaySinh) {
        // Nếu không có đủ thông tin, tạo mã theo timestamp
        if (tenKhachHang == null || tenKhachHang.isEmpty() || ngaySinh == null) {
            return generateUniqueRandomMaKhachHang("KH");
        }

        // Loại bỏ dấu từ tên khách hàng
        String tenKhongDau = removeVietnameseAccents(tenKhachHang.trim().toLowerCase());

        // Tách tên thành các từ
        String[] parts = tenKhongDau.split("\\s+");
        if (parts.length == 0) {
            return generateUniqueRandomMaKhachHang("KH");
        }

        // Lấy họ và các chữ cái đầu của tên đệm
        StringBuilder vietTat = new StringBuilder(parts[parts.length - 1]); // Lấy tên
        for (int i = 0; i < parts.length - 1; i++) {
            if (!parts[i].isEmpty()) {
                vietTat.append(parts[i].charAt(0)); // Lấy chữ cái đầu của họ và tên đệm
            }
        }

        // Thêm ngày và tháng sinh
        String ngaySinhStr = ngaySinh.format(java.time.format.DateTimeFormatter.ofPattern("ddMM"));
        String baseMa = vietTat + ngaySinhStr;

        // Đảm bảo mã là duy nhất
        return ensureUniqueMaKhachHang(baseMa);
    }

    // Phương thức đảm bảo mã khách hàng là duy nhất
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

    // Phương thức tạo mã ngẫu nhiên khi không có đủ thông tin
    private String generateUniqueRandomMaKhachHang(String prefix) {
        String maKhachHang;
        do {
            // Tạo ID ngẫu nhiên có 6 chữ số
            String randomID = RandomStringUtils.randomNumeric(6);
            maKhachHang = prefix + randomID;
        } while (khachHangRepository.existsByMaKhachHang(maKhachHang));

        return maKhachHang;
    }

    // Phương thức loại bỏ dấu tiếng Việt
    private String removeVietnameseAccents(String str) {
        String temp = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replaceAll("đ", "d").replaceAll("Đ", "D");
    }

    public boolean changePassword(ChangePasswordRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(request.getEmail()).orElse(null);

        if (taiKhoan == null) return false;

        if (!passwordEncoder.matches(request.getOldPassword(), taiKhoan.getPassword())) {
            return false;
        }

        taiKhoan.setPassword(passwordEncoder.encode(request.getNewPassword()));
        taiKhoan.setNgaySua(LocalDateTime.now());
        taiKhoanRepository.save(taiKhoan);
        return true;
    }


    // Sửa phương thức tạo token
    public void createResetPasswordTokenAndSendEmail(String email) {
        try {
            // Kiểm tra tài khoản tồn tại
            TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(email)
                    .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

            // Tạo token reset password
            String token = UUID.randomUUID().toString();

            // Tính thời gian hiện tại
            java.sql.Timestamp currentTime = new java.sql.Timestamp(System.currentTimeMillis());
            // Tính thời gian hết hạn
            java.sql.Timestamp expiryTime = new java.sql.Timestamp(System.currentTimeMillis() + (resetPasswordTokenExpirationMinutes * 60 * 1000));

            System.out.println("Current time: " + currentTime);
            System.out.println("Expiry time: " + expiryTime);
            System.out.println("Expiry minutes: " + resetPasswordTokenExpirationMinutes);

            // Lưu token vào InvalidateToken
            String tokenId = "RESET_PWD_" + email + "_" + token;

            // Xóa token cũ nếu có
            List<InvalidateToken> oldTokens = invalidateTokenRepository.findAll()
                    .stream()
                    .filter(t -> t.getId().startsWith("RESET_PWD_" + email + "_"))
                    .collect(Collectors.toList());

            invalidateTokenRepository.deleteAll(oldTokens);

            // Lưu token mới
            InvalidateToken invalidateToken = InvalidateToken.builder()
                    .id(tokenId)
                    .expiryTime(expiryTime)
                    .build();

            invalidateTokenRepository.save(invalidateToken);

            // Kiểm tra token đã được lưu thành công
            Optional<InvalidateToken> savedToken = invalidateTokenRepository.findById(tokenId);
            if (savedToken.isPresent()) {
                System.out.println("Token saved successfully. ID: " + tokenId);
                System.out.println("Saved token expiry time: " + savedToken.get().getExpiryTime());

                // Kiểm tra thời gian lưu có đúng format không
                Date checkTime = savedToken.get().getExpiryTime();
                System.out.println("Saved hours: " + checkTime.getHours());
                System.out.println("Saved minutes: " + checkTime.getMinutes());
            } else {
                System.out.println("Failed to save token");
            }

            // Gửi email đặt lại mật khẩu
            sendResetPasswordEmail(email, token);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    // Sửa phương thức xác thực token
    public boolean verifyResetToken(String token, String email) {
        try {
            System.out.println("Verifying token: " + token + " for email: " + email);

            if (token == null || email == null) {
                System.out.println("Token or email is null");
                return false;
            }

            // Tìm token theo định dạng đúng: RESET_PWD_email_token
            String tokenId = "RESET_PWD_" + email + "_" + token;
            System.out.println("Looking for token with ID: " + tokenId);

            // Tìm token trong database
            Optional<InvalidateToken> tokenOpt = invalidateTokenRepository.findById(tokenId);
            if (tokenOpt.isEmpty()) {
                System.out.println("Token not found in database with ID: " + tokenId);
                return false;
            }

            InvalidateToken invalidateToken = tokenOpt.get();
            Date currentTime = new Date();
            System.out.println("Token found! Current time: " + currentTime);
            System.out.println("Token expiry time: " + invalidateToken.getExpiryTime());
            System.out.println("Is token expired: " + invalidateToken.getExpiryTime().before(currentTime));

            // Kiểm tra thời gian hết hạn
            if (invalidateToken.getExpiryTime().before(currentTime)) {
                System.out.println("Token has expired");
                // Xóa token hết hạn
                invalidateTokenRepository.deleteById(tokenId);
                return false;
            }

            System.out.println("Token is valid and not expired");
            return true;
        } catch (Exception e) {
            System.err.println("Error during token verification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Các phương thức khác cũng phải sử dụng cùng định dạng tokenId
    public boolean resetPassword(String email, String token, String newPassword) {
        // Xác thực token
        if (!verifyResetToken(token, email)) {
            return false;
        }

        try {
            // Tìm tài khoản
            TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            // Mã hóa và cập nhật mật khẩu mới
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            taiKhoan.setPassword(passwordEncoder.encode(newPassword));
            taiKhoan.setNgaySua(LocalDateTime.now());
            taiKhoanRepository.save(taiKhoan);

            // Xóa token sau khi sử dụng - cũng dùng cùng định dạng tokenId
            String tokenId = "RESET_PWD_" + email + "_" + token;
            invalidateTokenRepository.deleteById(tokenId);

            return true;
        } catch (Exception e) {
            System.err.println("Error during password reset: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    /**
     * Gửi email thông báo mật khẩu mới
     */
    private void sendResetPasswordEmail(String email, String token) {
        try {
            // Lấy thông tin khách hàng
            KhachHang khachHang = khachHangRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng"));

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Đặt lại mật khẩu - Thời trang 4BEE");

            // Mã hóa tham số URL để tránh lỗi với ký tự đặc biệt
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8.toString());
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8.toString());

            // Link đặt lại mật khẩu kèm token và email đã mã hóa
            String resetUrl = frontendUrl + "/reset-password?token=" + encodedToken + "&email=" + encodedEmail;

            // Thêm logging để theo dõi URL
            log.info("Reset URL generated: {}", resetUrl);

            String htmlContent = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="%s/logo/Asset 6@4x.png" alt="Thời trang 4BEE Logo" style="max-width: 150px;">
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: #007bff; margin-top: 0;">Đặt lại mật khẩu</h2>
                <p>Xin chào %s,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="%s" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Đặt lại mật khẩu
                    </a>
                </div>
                <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
                <p style="background-color: #e9ecef; padding: 10px; border-radius: 4px; word-break: break-all;">
                    <a href="%s">%s</a>
                </p>
                <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau %d phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,</p>
                <p>Đội ngũ Thời trang 4BEE</p>
            </div>
            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #6c757d;">
                <p>© 2025 Thời trang 4BEE. Tất cả các quyền được bảo lưu.</p>
            </div>
        </div>
        """.formatted(
                    frontendUrl,
                    khachHang.getTenKhachHang(),
                    resetUrl,
                    resetUrl,
                    resetUrl,
                    resetPasswordTokenExpirationMinutes
            );

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            log.info("Đã gửi email đặt lại mật khẩu cho: {}", email);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email đặt lại mật khẩu: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu", e);
        }
    }

}
