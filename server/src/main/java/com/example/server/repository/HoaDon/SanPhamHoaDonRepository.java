package com.example.server.repository.HoaDon;

import com.example.server.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SanPhamHoaDonRepository extends JpaRepository<SanPham, String> {
}
