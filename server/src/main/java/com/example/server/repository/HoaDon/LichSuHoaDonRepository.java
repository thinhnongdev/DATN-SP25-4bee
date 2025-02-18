package com.example.server.repository.HoaDon;

import com.example.server.entity.LichSuHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuHoaDonRepository extends JpaRepository<LichSuHoaDon, String> {
    List<LichSuHoaDon> findByHoaDonId(String hoaDonId);
}
