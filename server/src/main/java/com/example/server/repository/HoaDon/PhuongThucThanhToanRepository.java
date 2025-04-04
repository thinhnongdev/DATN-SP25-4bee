package com.example.server.repository.HoaDon;

import com.example.server.entity.PhuongThucThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhuongThucThanhToanRepository extends JpaRepository<PhuongThucThanhToan, String> {
    Optional<PhuongThucThanhToan> findByMaPhuongThucThanhToan(String maPhuongThuc);

    @Query("SELECT p FROM PhuongThucThanhToan p WHERE p.id IN ('PTTT002', 'PTTT003')")
    List<PhuongThucThanhToan> findBankAndCashMethods();

}
