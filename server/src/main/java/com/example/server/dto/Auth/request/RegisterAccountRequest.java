package com.example.server.dto.Auth.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterAccountRequest {
    private String email;
    private String password;
    private String hoTen;
    private LocalDate ngaySinh;
    private String soDienThoai;
    private Boolean gioiTinh;
}