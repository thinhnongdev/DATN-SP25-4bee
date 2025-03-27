package com.example.server.controller.Auth;

import com.example.server.dto.Auth.request.*;
import com.example.server.dto.Auth.response.AuthenticationResponse;
import com.example.server.dto.Auth.response.IntrospectResponse;
import com.example.server.dto.Auth.response.UserResponse;
import com.example.server.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationController {
    @Autowired
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public AuthenticationResponse authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse result=authenticationService.authenticate(request);
        return result;
    }
    @PostMapping("/refreshToken")
    public AuthenticationResponse refreshToken(@RequestBody RefreshTokenRequest request) throws ParseException, JOSEException {
        AuthenticationResponse result=authenticationService.refreshToken(request);
        return result;
    }
    @PostMapping("/logout")
    public void logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
    }
    @PostMapping("/introspect")
    public IntrospectResponse introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        IntrospectResponse result=authenticationService.introspect(request);
        return result;
    }
    @PostMapping("/getInfoUser")
    public UserResponse getInfoUser(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        return authenticationService.findUserByToken(request);
    }
    @PostMapping("/register")
    public ResponseEntity<?> registerAccount(@RequestBody RegisterAccountRequest request) {
        try{
            authenticationService.registerAccountForClient(request);
            return ResponseEntity.ok("Đăng ký tài khoản thành công!");
        }catch (RuntimeException e){
            System.out.println("Lỗi khi tạo tài khoản"+e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
}