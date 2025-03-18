package com.example.server.repository.HoaDon;

import com.example.server.entity.PhuongThucThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhuongThucThanhToanRepository extends JpaRepository<PhuongThucThanhToan, String> {
    Optional<PhuongThucThanhToan> findByMaPhuongThucThanhToan(String maPhuongThuc);
}
