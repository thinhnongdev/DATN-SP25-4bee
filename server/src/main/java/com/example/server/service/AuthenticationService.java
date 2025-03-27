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
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

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
    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid=true;
        try {
            verifyToken(token);
        }catch (RuntimeException e){
            isValid=false;
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
        var signToken=verifyToken(request.getToken());
        String jit=signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime=signToken.getJWTClaimsSet().getExpirationTime();
        InvalidateToken invalidateToken= InvalidateToken
                .builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidateTokenRepository.save(invalidateToken);
    };

    public AuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest)
            throws ParseException, JOSEException {
        var signJWT=verifyToken(refreshTokenRequest.getToken());
        var jit=signJWT.getJWTClaimsSet().getJWTID();
        var expiryTime=signJWT.getJWTClaimsSet().getExpirationTime();
        InvalidateToken invalidateToken= InvalidateToken
                .builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidateTokenRepository.save(invalidateToken);
        var username=signJWT.getJWTClaimsSet().getSubject();
        var taiKhoan= taiKhoanRepository.findByUsername(username).orElseThrow(()->new RuntimeException("username không tồn tại"));

        var newtoken=generateToken(taiKhoan);
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
        if(invalidateTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())){
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
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
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
        UserResponse userResponse=new UserResponse();
        var signJWT=verifyToken(introspectRequest.getToken());
        var username=signJWT.getJWTClaimsSet().getSubject();
        var roleUser=signJWT.getJWTClaimsSet().getStringClaim("scope");
        if(roleUser.equals("ADMIN")||roleUser.equals("NHAN_VIEN")){
            NhanVien nhanVien=nhanVienRepository.findByEmail(username).get();
            userResponse.setId(nhanVien.getId());
            userResponse.setMa(nhanVien.getMaNhanVien());
            userResponse.setTen(nhanVien.getTenNhanVien());
            userResponse.setEmail(nhanVien.getEmail());
            userResponse.setAnhUrl(nhanVien.getAnh());
        }
        if(roleUser.equals("KHACH_HANG")){
            KhachHang khachHang=khachHangRepository.findByEmail(username).get();
            userResponse.setId(khachHang.getId());
            userResponse.setSoDienThoai(khachHang.getSoDienThoai());
            userResponse.setMa(khachHang.getMaKhachHang());
            userResponse.setTen(khachHang.getTenKhachHang());
            userResponse.setEmail(khachHang.getEmail());

        }
        return userResponse;
    }
    public void registerAccountForClient(RegisterAccountRequest request){

            if(taiKhoanRepository.existsByUsername(request.getEmail())){
                throw new RuntimeException("Email đã được sử dụng!");
            }
                PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
                TaiKhoan taiKhoan=new TaiKhoan();
                taiKhoan.setUsername(request.getEmail());
                taiKhoan.setPassword(passwordEncoder.encode(request.getPassword()));//Mã hóa mật khẩu bằng bcrypt
                taiKhoan.setNgayTao(LocalDateTime.now());
                taiKhoan.setVaiTro(vaiTroRepository.findByTenVaiTro("KHACH_HANG").get());
                taiKhoanRepository.save(taiKhoan);//tạo tài khoản

                KhachHang khachHang=new KhachHang();
                khachHang.setTenKhachHang(request.getHoTen());
                khachHang.setMaKhachHang("KH"+System.currentTimeMillis());
                khachHang.setEmail(request.getEmail());
                khachHang.setNgaySinh(request.getNgaySinh());
                khachHang.setNgayTao(LocalDateTime.now());
                khachHang.setTaiKhoan(taiKhoan);
                khachHangRepository.save(khachHang); //tạo khách hàng
    }
}
