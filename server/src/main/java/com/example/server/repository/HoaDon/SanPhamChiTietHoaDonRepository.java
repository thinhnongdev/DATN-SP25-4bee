package com.example.server.repository.HoaDon;

import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietHoaDonRepository extends JpaRepository<SanPhamChiTiet, String> {

//    @Query("SELECT s FROM SanPhamChiTiet s WHERE s.sanPham.id = :sanPhamId AND s.trangThai = :trangThai")
//    List<SanPhamChiTiet> findBySanPhamIdAndTrangThai(String sanPhamId, Integer trangThai);
@Query("SELECT s FROM SanPhamChiTiet s WHERE s.id = :sanPhamChiTietId AND s.trangThai = :trangThai")
Optional<SanPhamChiTiet> findBySanPhamIdAndTrangThai(@Param("sanPhamChiTietId") String sanPhamChiTietId, @Param("trangThai") Integer trangThai);


}