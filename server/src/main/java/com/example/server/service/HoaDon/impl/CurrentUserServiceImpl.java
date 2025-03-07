package com.example.server.service.HoaDon.impl;


import com.example.server.exception.UnauthorizedException;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import com.example.server.service.HoaDon.interfaces.ICurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements ICurrentUserService {
    private final NhanVienRepository nhanVienRepository;

    @Override
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        return auth.getName();
    }

//    @Override
//    public String getCurrentUserId() {
//        NhanVien nhanVien = getCurrentNhanVien();
//        return nhanVien.getId();
//    }

    @Override
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

//    @Override
//    public NhanVien getCurrentNhanVien() {
//        String username = getCurrentUsername();
//        return nhanVienRepository.findByEmail(username)
//                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
//    }
}
