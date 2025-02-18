package com.example.server.repository.HoaDon;

import com.example.server.entity.ThanhToanHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhToanHoaDonRepository extends JpaRepository<ThanhToanHoaDon, String> {
    List<ThanhToanHoaDon> findByHoaDonId(String hoaDonId);
}

