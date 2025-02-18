package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    Optional<NhanVien> findByEmail(String email);
}
