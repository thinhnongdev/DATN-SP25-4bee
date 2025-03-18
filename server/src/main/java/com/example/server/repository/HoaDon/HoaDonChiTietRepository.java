package com.example.server.repository.HoaDon;

import com.example.server.entity.HoaDon;
import com.example.server.entity.HoaDonChiTiet;
import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, String> {
    List<HoaDonChiTiet> findByHoaDon(HoaDon hoaDon);

    List<HoaDonChiTiet> findByHoaDonId(String hoaDonId);

    @Query("SELECT h FROM HoaDonChiTiet h WHERE h.hoaDon.id = :hoaDonId AND h.sanPhamChiTiet.id = :sanPhamChiTietId")
    Optional<HoaDonChiTiet> findByHoaDonAndSanPhamChiTiet(@Param("hoaDonId") String hoaDonId, @Param("sanPhamChiTietId") String sanPhamChiTietId);

    long countBySanPhamChiTietId(String sanPhamChiTietId);
}
