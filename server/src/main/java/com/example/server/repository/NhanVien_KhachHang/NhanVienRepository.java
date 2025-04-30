package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    @Query("SELECT nv FROM NhanVien nv ORDER BY nv.ngayTao DESC")
    List<NhanVien> findAllNhanVienSortedByNgayTao();

    @Query("SELECT nv FROM NhanVien nv WHERE nv.canCuocCongDan = :canCuocCongDan")
    Optional<NhanVien> findBySoCCCD(@Param("canCuocCongDan") String canCuocCongDan);
    @Query("SELECT nv FROM NhanVien nv WHERE nv.email = :email")
    Optional<NhanVien> findByEmail(@Param("email") String email);
    Boolean existsByMaNhanVien(String maNhanVien);
    Boolean existsByEmail(String email);
}
