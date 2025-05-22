package com.example.server.controller.Auth;

import com.example.server.dto.Auth.request.*;
import com.example.server.dto.Auth.response.AuthenticationResponse;
import com.example.server.dto.Auth.response.IntrospectResponse;
import com.example.server.dto.Auth.response.UserResponse;
import com.example.server.dto.NhanVien_KhachHang.KhachHangCreationRequest;
import com.example.server.entity.KhachHang;
import com.example.server.entity.TaiKhoan;
import com.example.server.repository.Auth.TaiKhoanRepository;
import com.example.server.service.AuthenticationService;
import com.example.server.service.NhanVien_KhachHang.KhachHangService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationController {
    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    TaiKhoanRepository taiKhoanRepository;

    @Autowired
    KhachHangService khachHangService;

    @PostMapping("/login")
    public AuthenticationResponse authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse result = authenticationService.authenticate(request);
        return result;
    }

    @PostMapping("/refreshToken")
    public AuthenticationResponse refreshToken(@RequestBody RefreshTokenRequest request) throws ParseException, JOSEException {
        AuthenticationResponse result = authenticationService.refreshToken(request);
        return result;
    }

    @PostMapping("/logout")
    public void logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
    }

    @PostMapping("/introspect")
    public IntrospectResponse introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        IntrospectResponse result = authenticationService.introspect(request);
        return result;
    }

    @PostMapping("/getInfoUser")
    public UserResponse getInfoUser(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        return authenticationService.findUserByToken(request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterAccountRequest registerRequest) {
        try {
            authenticationService.registerAccountForClient(registerRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký thành công! Vui lòng đăng nhập vào hệ thống.");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            boolean changed = authenticationService.changePassword(request);
            if (!changed) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Email hoặc mật khẩu cũ không đúng!"
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Thay đổi mật khẩu thành công!"
            ));
        } catch (Exception e) {
            System.err.println("Lỗi khi thay đổi mật khẩu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi xử lý yêu cầu!"
            ));
        }
    }

    // API kiểm tra email đã tồn tại (không cần quyền admin)
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = khachHangService.isEmailExists(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    // API kiểm tra số điện thoại tồn tại
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhoneExists(@RequestParam String soDienThoai) {
        boolean exists = khachHangService.isPhoneExists(soDienThoai);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    // ===== Chức năng đăng nhập/đăng ký dành riêng cho khách hàng =====

    @PostMapping("/khach-hang/register")
    public ResponseEntity<?> registerKhachHang(@RequestBody RegisterAccountRequest registerRequest) {
        try {
            // Chuyển đổi dữ liệu từ RegisterAccountRequest sang KhachHangCreationRequest
            KhachHangCreationRequest khachHangRequest = new KhachHangCreationRequest();
            khachHangRequest.setTenKhachHang(registerRequest.getHoTen());
            khachHangRequest.setEmail(registerRequest.getEmail());
            khachHangRequest.setSoDienThoai(registerRequest.getSoDienThoai());
            khachHangRequest.setNgaySinh(registerRequest.getNgaySinh());
            khachHangRequest.setGioiTinh(registerRequest.getGioiTinh());
            khachHangRequest.setPassword(registerRequest.getPassword());

            // Gọi phương thức registerKhachHang
            KhachHang khachHang = khachHangService.registerKhachHang(khachHangRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký thành công! Vui lòng đăng nhập vào hệ thống.");
            response.put("maKhachHang", khachHang.getMaKhachHang());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/khach-hang/login")
    public ResponseEntity<?> loginKhachHang(@RequestBody AuthenticationRequest loginRequest) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(loginRequest);

            // Kiểm tra vai trò là khách hàng
            TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(loginRequest.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

            if (taiKhoan.getVaiTro() == null || !taiKhoan.getVaiTro().getTenVaiTro().equals("KHACH_HANG")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Tài khoản không có quyền khách hàng");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/khach-hang/change-password")
    public ResponseEntity<?> changePasswordKhachHang(@RequestBody ChangePasswordRequest request) {
        try {
            boolean result = authenticationService.changePassword(request);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Đổi mật khẩu thành công!"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Mật khẩu cũ không chính xác!"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Đã có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }


    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(
            @RequestParam String token,
            @RequestParam String email) {

        boolean isValid = authenticationService.verifyResetToken(token, email);

        return ResponseEntity.ok(Map.of(
                "valid", isValid,
                "message", isValid ? "Token hợp lệ" : "Token không hợp lệ hoặc đã hết hạn"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String email = request.get("email");
        String password = request.get("password");

        try {
            // Gọi service đặt lại mật khẩu
            boolean result = authenticationService.resetPassword(email, token, password);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Mật khẩu đã được đặt lại thành công!"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Token không hợp lệ hoặc đã hết hạn"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Đã có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }

    // Cập nhật phương thức forgotPassword
    @PostMapping("/khach-hang/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            // Kiểm tra tài khoản tồn tại không
            TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(email)
                    .orElse(null);

            if (taiKhoan == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Email không tồn tại trong hệ thống"
                ));
            }

            // Kiểm tra là tài khoản khách hàng không
            if (taiKhoan.getVaiTro() == null || !taiKhoan.getVaiTro().getTenVaiTro().equals("KHACH_HANG")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Email không phải của tài khoản khách hàng"
                ));
            }

            // Gọi service tạo token và gửi email đặt lại mật khẩu
            authenticationService.createResetPasswordTokenAndSendEmail(email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Đã có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }
}